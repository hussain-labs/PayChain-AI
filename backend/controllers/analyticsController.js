import { GoogleGenerativeAI } from '@google/generative-ai';
import { getActiveGeminiKey, rotateToNextGeminiKey, isQuotaError } from '../services/keyRotationService.js';
import { getPineconeIndex } from '../utils/pineconeClient.js';
import Transaction from '../models/Transaction.js';
import { getTransactionEmbedding } from '../services/embeddingService.js';

export const getAIAdvisorInsights = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Fetch recent chronological transactions from MongoDB
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    let chronologicalContext = recentTransactions.map(tx =>
      `[${new Date(tx.createdAt).toLocaleString()}] ${tx.amount} ${tx.asset} | To: ${tx.to} | Status: ${tx.status}`
    ).join('\n');

    if (!chronologicalContext) {
      chronologicalContext = "No past transactions found for this user.";
    }

    // 2. Query Pinecone for semantically relevant transactions
    let pineconeContext = "No semantically relevant historical patterns found.";
    try {
      const vector = await getTransactionEmbedding(`User query: ${message}`);
      const pineconeIndex = getPineconeIndex();

      if (pineconeIndex && vector && vector.length > 0) {
        const queryResponse = await pineconeIndex.query({
          vector: vector,
          topK: 5,
          includeMetadata: true,
          filter: { userId: { $eq: userId } }
        });

        if (queryResponse.matches && queryResponse.matches.length > 0) {
          pineconeContext = queryResponse.matches.map((match, idx) => {
            return `Match ${idx + 1} (Relevance: ${match.score.toFixed(2)}): ${match.metadata.amount} ${match.metadata.asset} to ${match.metadata.to} on ${new Date(match.metadata.createdAt).toLocaleDateString()}`;
          }).join('\n');
        }
      }
    } catch (pcError) {
      console.warn("Pinecone context skipped:", pcError.message);
    }

    // 3. Construct System Prompt
    const prompt = `
You are a highly intelligent and professional Financial Advisor AI for a merchant using the PayChain dashboard.
The merchant is asking you a question about their sales data and business performance.

### MERCHANT'S QUESTION:
"${message}"

### CONTEXT 1: RECENT CHRONOLOGICAL SALES DATA (Last 50 transactions):
${chronologicalContext}

### CONTEXT 2: RELEVANT TRANSACTION PATTERNS (From Vector DB Semantic Search):
${pineconeContext}

INSTRUCTIONS:
1. Analyze the provided data to answer the merchant's question.
2. Provide predictive insights if relevant (e.g., "Your volume peaks on Fridays", "You have recurring high-value transfers").
3. Suggest actionable business advice.
4. Maintain a professional, encouraging, and sophisticated tone.
5. FORMATTING (CRITICAL): You must format your response in a highly visual, beautiful, and easy-to-read way. 
    - Use Markdown Tables to display any lists of transactions, comparisons, or data points.
    - Use relevant Emojis (e.g., 📈, 💰, ⚠️) for headings and bullet points.
    - Use bold text for key metrics.
    - Break up large blocks of text into small, digestible paragraphs or bullet points.
6. Do NOT invent data. Base your insights strictly on the provided context. If they have very few transactions, acknowledge that they are just starting out.
7. NEVER include conversational pleasantries, sign-offs, or signatures (e.g., do not say "Best regards", "Your PayChain AI", etc.). Just return the direct analysis.
    `;

    // 4. Generate Response with Gemini (with key rotation)
    let responseText = '';
    for (let attempts = 0; attempts < 3; attempts++) {
      const activeGemini = await getActiveGeminiKey();
      if (!activeGemini) {
        throw new Error('Missing Gemini API Key for generation.');
      }

      try {
        const genAI = new GoogleGenerativeAI(activeGemini.key);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        break; // Success
      } catch (geminiError) {
        if (isQuotaError(geminiError)) {
          console.warn(`[Gemini Quota Error - AI Advisor] Key ${activeGemini.index} hit limit. Rotating...`);
          await rotateToNextGeminiKey(activeGemini.index, activeGemini.total);
        } else {
          throw geminiError;
        }
      }
    }

    if (!responseText) {
      throw new Error("Failed to get response from Gemini after retries.");
    }

    res.json({ reply: responseText });

  } catch (error) {
    console.error('AI Advisor Error:', error);
    res.status(500).json({ error: 'Failed to generate AI insights', details: error.message });
  }
};
