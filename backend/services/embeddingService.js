import { GoogleGenerativeAI } from '@google/generative-ai';
import { getActiveGeminiKey, rotateToNextGeminiKey, isQuotaError } from './keyRotationService.js';

/**
 * Converts a raw transaction object into a clear text string for embedding.
 */
export const transactionToText = (transaction) => {
  const { from, to, amount, asset, network, createdAt, status } = transaction;
  const timeStr = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();
  
  return `Transaction Details:
- Sender (Buyer): ${from}
- Receiver: ${to}
- Amount: ${amount} ${asset}
- Network: ${network}
- Time: ${timeStr}
- Status: ${status || 'Pending'}`;
};

/**
 * Sends text to Gemini's embedding model and returns the vector array.
 */
export const getTransactionEmbedding = async (text) => {
  let lastError;
  for (let attempts = 0; attempts < 3; attempts++) {
    try {
      const activeGemini = await getActiveGeminiKey();
      if (!activeGemini) {
        throw new Error('Missing Gemini API Key for embeddings.');
      }

      const genAI = new GoogleGenerativeAI(activeGemini.key);
      const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
      
      const result = await model.embedContent(text);
      const embedding = result.embedding;
      
      if (!embedding || !embedding.values) {
        console.error('Embedding was returned empty:', result);
        return [];
      }
      return embedding.values.slice(0, 768);
    } catch (error) {
      if (isQuotaError(error)) {
        const activeGemini = await getActiveGeminiKey();
        console.warn(`[Gemini Quota Error - Embeddings] Key ${activeGemini.index} hit limit. Rotating...`);
        await rotateToNextGeminiKey(activeGemini.index, activeGemini.total);
        lastError = error;
      } else {
        console.error('Error generating embedding for transaction:', error);
        return []; // Non-quota error, fail gracefully
      }
    }
  }
  
  console.error('Error generating embedding after retries:', lastError);
  return [];
};
