import { getPineconeIndex } from '../utils/pineconeClient.js';
import { transactionToText, getTransactionEmbedding } from '../services/embeddingService.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/User.js';
import { getActiveGeminiKey, rotateToNextGeminiKey, isQuotaError, getActiveAlchemyKey, rotateToNextAlchemyKey } from '../services/keyRotationService.js';

const formatAlchemyBaseUrl = (key) => {
  if (!key || key === 'your_key_here') return null;
  return key.startsWith('http') ? key.replace('mainnet', 'sepolia') : `https://eth-sepolia.g.alchemy.com/v2/${key}`;
};

async function fetchRecipientHistorySummary(address) {
  for (let attempts = 0; attempts < 3; attempts++) {
    const activeAlchemy = await getActiveAlchemyKey();
    if (!activeAlchemy) return { summary: "No history available (Alchemy key missing).", transfers: [] };
    
    const alchemyBase = formatAlchemyBaseUrl(activeAlchemy.key);
    console.log(`🔍 Using Alchemy Endpoint (${activeAlchemy.index + 1}/${activeAlchemy.total}): ${alchemyBase.substring(0, 38)}...`);
    
    try {
      const fetchTransfers = async (isFrom) => {
        const payload = {
          jsonrpc: "2.0",
          id: 1,
          method: "alchemy_getAssetTransfers",
          params: [{
            fromBlock: "0x0",
            toBlock: "latest",
            [isFrom ? "fromAddress" : "toAddress"]: address,
            category: ["external", "internal", "erc20"],
            maxCount: "0x15"
          }]
        };
        const r = await fetch(alchemyBase, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await r.json();
        if (data.error) {
          throw new Error(data.error.message || 'Alchemy API Error');
        }
        return (data?.result?.transfers || []).map(tx => ({ ...tx, direction: isFrom ? 'out' : 'in' }));
      };

      const [sent, received] = await Promise.all([
        fetchTransfers(true),
        fetchTransfers(false)
      ]);

      let combined = [...sent, ...received];
      combined.sort((a, b) => parseInt(b.blockNum || '0', 16) - parseInt(a.blockNum || '0', 16));
      const transfers = combined.slice(0, 15);
      
      if (transfers.length === 0) {
        return { 
          summary: "CRITICAL FLAG: Recipient is a BRAND NEW or completely inactive wallet with 0 recent transactions on this network. HIGH RISK if this is an external address.",
          transfers: []
        };
      }
      
      let totalIn = 0; let totalOut = 0;
      transfers.forEach(tx => {
         if (tx.value) {
           if (tx.direction === 'in') totalIn += tx.value;
           else totalOut += tx.value;
         }
      });
      
      return {
        summary: `Recipient has an active history with ${transfers.length} recent transactions (received approx ${totalIn.toFixed(4)}, sent ${totalOut.toFixed(4)} in recent txs).`,
        transfers: transfers
      };
    } catch (err) {
      if (isQuotaError(err) || String(err.message).toLowerCase().includes('rate limit') || String(err.message).toLowerCase().includes('capacity')) {
        console.warn(`[Alchemy Rate Limit] Key ${activeAlchemy.index} hit limit. Rotating...`);
        await rotateToNextAlchemyKey(activeAlchemy.index, activeAlchemy.total);
        // loop will retry
      } else {
        console.error("Error fetching recipient history:", err.message);
        return { summary: "Error fetching recipient history.", transfers: [] };
      }
    }
  }
  return { summary: "Error fetching recipient history after all retries.", transfers: [] };
}

// POST /api/fraud/analyze
export const analyzeRisk = async (req, res) => {
  try {
    const { from, to, amount, asset, network, timestamp } = req.body;

    if (!from || !to || !amount || !asset) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }

    const transactionData = {
      from,
      to,
      amount,
      asset,
      network: network || 'Ethereum',
      createdAt: timestamp || new Date().toISOString(),
      status: 'Pending'
    };

    // EDGE CASE: Self-Transfer (0 Risk, bypass AI entirely)
    if (from.toLowerCase() === to.toLowerCase()) {
      return res.json({
        riskLevel: "Low",
        riskScore: 0,
        verdict: "This is a self-transfer. You are sending funds to your own wallet address.",
        recommendation: "Safe to proceed.",
        riskFactors: ["Sender and Receiver addresses are identical (self-transfer)."],
        tips: ["Ensure you are not paying unnecessary gas fees for moving funds within the same wallet."],
        recipientTransfers: [],
        isSelfTransfer: true
      });
    }

    // 1. Embed the incoming transaction
    const transactionText = transactionToText(transactionData);
    const vector = await getTransactionEmbedding(transactionText);

    // 2. Query Pinecone for similar transactions
    const pineconeIndex = getPineconeIndex();
    let historicalContext = 'No similar historical transactions found.';
    
    if (pineconeIndex) {
      try {
        const queryResponse = await pineconeIndex.query({
          vector: vector,
          topK: 5,
          includeMetadata: true
        });

        if (queryResponse.matches && queryResponse.matches.length > 0) {
          historicalContext = queryResponse.matches.map((match, idx) => {
            return `--- Past Transaction ${idx + 1} (Similarity: ${match.score.toFixed(3)}) ---\n` +
                   `Sender: ${match.metadata?.from}\n` +
                   `Receiver: ${match.metadata?.to}\n` +
                   `Amount: ${match.metadata?.amount} ${match.metadata?.asset}\n` +
                   `Network: ${match.metadata?.network}\n` +
                   `Time: ${match.metadata?.createdAt}\n` +
                   `Status: ${match.metadata?.status}`;
          }).join('\n\n');
        }
      } catch (pcError) {
        console.error('Pinecone Query Error:', pcError.message);
        // Continue without historical context if Pinecone fails
      }
    }

    // NEW: Fetch live on-chain history for the recipient
    const recipientData = await fetchRecipientHistorySummary(to);

    // NEW: Check if recipient is a saved wallet in our system
    const isPlatformVerified = await User.exists({ 
      "savedWallets.address": { $regex: new RegExp("^" + to + "$", "i") } 
    });
    const platformStatus = isPlatformVerified 
      ? "SYSTEM VERIFIED: This wallet is saved/verified within our platform's network."
      : "EXTERNAL WALLET: This wallet is not saved in our platform's network.";

    // 3. Construct prompt and call Gemini for analysis
    const prompt = `
You are an expert AI Fraud Detection System analyzing Web3 transactions. 
I will provide you with a new pending transaction and up to 5 similar past transactions from our history.

Your goal is to evaluate the risk of this new transaction. 

### NEW TRANSACTION TO EVALUATE:
${transactionText}

### RECIPIENT PLATFORM STATUS:
${platformStatus}

### RECIPIENT ON-CHAIN HISTORY (REAL-TIME ALCHEMY DATA):
${recipientData.summary}

### HISTORICAL SIMILAR TRANSACTIONS (FROM OUR PINECONE DATABASE):
${historicalContext}

Based on your knowledge of crypto fraud patterns and the provided historical context, analyze the risk.
CRITICAL INSTRUCTION: If the recipient is SYSTEM VERIFIED (our platform verified), you MUST explicitly acknowledge that the address is verified by our platform. However, if there are still significant risk factors (e.g., brand new wallet, 0 transactions), you MUST recommend the user to choose the "Escrow Payment tool" on our platform for safety.

Respond ONLY with a valid JSON object strictly matching this schema:
{
  "riskLevel": "Low" | "Moderate" | "High" | "Critical",
  "riskScore": number (0-100),
  "verdict": "string (brief summary)",
  "recommendation": "string (e.g. Proceed with caution)",
  "riskFactors": ["array of strings"],
  "tips": ["array of strings"]
}
`;

    let responseText = '';
    
    // Retry loop for Gemini key rotation
    for (let attempts = 0; attempts < 3; attempts++) {
      const activeGemini = await getActiveGeminiKey();
      if (!activeGemini) {
        throw new Error('Missing Gemini API Key for generation.');
      }
      console.log(`🧠 Using Gemini API Key (${activeGemini.index + 1}/${activeGemini.total}): ${activeGemini.key.substring(0, 10)}...`);

      try {
        const genAI = new GoogleGenerativeAI(activeGemini.key);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        break; // Success! Exit retry loop.
      } catch (geminiError) {
        if (isQuotaError(geminiError)) {
          console.warn(`[Gemini Quota Error] Key ${activeGemini.index} hit limit. Rotating...`);
          await rotateToNextGeminiKey(activeGemini.index, activeGemini.total);
          // Loop will retry with the new key
        } else {
          // If it's not a quota error (e.g. 503 or auth error), just throw
          throw geminiError;
        }
      }
    }
    
    if (!responseText) {
      throw new Error("Failed to get response from Gemini after all retry attempts.");
    }

    // Extract JSON from response
    let parsedResponse = { 
      riskLevel: "Moderate", 
      riskScore: 50, 
      verdict: "Analysis failed", 
      recommendation: "Please review manually.",
      riskFactors: ["Error connecting to AI"],
      tips: []
    };
    try {
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResponse = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
    }

    // 4. Return risk score with the live transfers attached
    parsedResponse.recipientTransfers = recipientData.transfers;
    res.json(parsedResponse);
    
  } catch (error) {
    console.error('Risk Analysis Error:', error);
    res.status(500).json({ error: 'Failed to perform risk analysis', details: error.message });
  }
};
