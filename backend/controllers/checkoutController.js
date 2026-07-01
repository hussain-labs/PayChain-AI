import { analyzeTransactionRisk } from '../services/intelligenceEngine.js';
import User from '../models/User.js';

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_BASE = ALCHEMY_KEY && ALCHEMY_KEY !== 'your_key_here'
  ? (ALCHEMY_KEY.startsWith('http') ? ALCHEMY_KEY.replace('mainnet', 'sepolia') : `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`)
  : null;

async function fetchRecipientHistorySummary(address) {
  if (!ALCHEMY_BASE) return { summary: "No history available (Alchemy key missing).", transfers: [] };
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
      const r = await fetch(ALCHEMY_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json();
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
    
    // Calculate some basic stats
    let totalIn = 0;
    let totalOut = 0;
    transfers.forEach(tx => {
       if (tx.value) {
         if (tx.direction === 'in') totalIn += tx.value;
         else totalOut += tx.value;
       }
    });
    
    return {
      summary: `Recipient has an active history with ${transfers.length} recent transactions (received approx ${totalIn.toFixed(4)}, sent ${totalOut.toFixed(4)} in recent txs). This indicates an established address.`,
      transfers: transfers
    };
  } catch (err) {
    console.error("Error fetching recipient history:", err.message);
    return { summary: "Error fetching recipient history. Treat as unknown.", transfers: [] };
  }
}

export const verifyCheckout = async (req, res) => {
  try {
    const { buyerWallet, walletAgeDays, targetContract, functionSignature, valueRequested, asset } = req.body;

    if (!buyerWallet || !targetContract || !valueRequested) {
      return res.status(400).json({
        error: "Missing required transaction fields: buyerWallet, targetContract, and valueRequested are required."
      });
    }

    // Look up the logged-in user's saved wallets to detect self-transfers
    const currentUser = await User.findById(req.userId).select('savedWallets');
    const userWalletAddresses = currentUser
      ? currentUser.savedWallets.map(w => w.address.toLowerCase())
      : [];

    const senderIsOwned = userWalletAddresses.includes(buyerWallet.toLowerCase());
    const recipientIsOwned = userWalletAddresses.includes(targetContract.toLowerCase());
    const isSelfTransfer = senderIsOwned && recipientIsOwned;

    // Check if recipient belongs to ANY user in the system (trusted platform user)
    const recipientUser = await User.findOne({
      'savedWallets.address': { $regex: new RegExp(`^${targetContract}$`, 'i') }
    }).select('_id');
    const isRecipientKnown = !!recipientUser;



    let contextNote = "";

    if (isSelfTransfer) {
      contextNote = "CRITICAL CONTEXT: This is an internal self-transfer between two wallets VERIFIED as belonging to the same user in the PayChain system. The risk MUST be scored LOW (5-20). Do not flag this as suspicious.";
    } else if (recipientIsOwned) {
      contextNote = "Recipient is one of the user's own wallets.";
    } else if (isRecipientKnown) {
      contextNote = "Recipient address belongs to a verified PayChain platform user. This reduces risk somewhat.";
    } else {
      contextNote = "Recipient is an EXTERNAL, UNVERIFIED address. Apply thorough risk analysis based on transaction value, function signature, behavioral patterns, and recipient history.";
    }

    // Always fetch history so the UI can display it
    const historyData = await fetchRecipientHistorySummary(targetContract);
    const recipientHistorySummary = historyData.summary;
    const recipientTransfers = historyData.transfers;

    const contextualHints = {
      senderWalletOwned: senderIsOwned,
      recipientWalletOwned: recipientIsOwned,
      isSelfTransfer,
      isRecipientKnownPlatformUser: isRecipientKnown,
      recipientHistorySummary
    };

    const payload = {
      buyerWallet,
      walletAgeDays: walletAgeDays || 0,
      targetContract,
      functionSignature: functionSignature || "0x",
      valueRequested,
      asset: asset || 'ETH',
      contextualHints,
      contextNote
    };

    const riskAssessment = await analyzeTransactionRisk(payload);
    
    // Attach the raw transfers so the frontend can display them
    if (riskAssessment) {
      riskAssessment.recipientTransfers = recipientTransfers;
    }

    const statusCode = riskAssessment.merchantAction === 'REJECT' ? 403 : 200;
    return res.status(statusCode).json(riskAssessment);

  } catch (error) {
    console.error("Checkout Verification Error:", error);
    return res.status(500).json({
      error: "Internal server error during transaction verification"
    });
  }
};
