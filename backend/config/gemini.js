import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Gemini client
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MOCK_KEY_FOR_LOCAL_TESTING'
});

// Define the structured output schema for transaction risk
export const riskSchema = {
  type: Type.OBJECT,
  properties: {
    riskScore: {
      type: Type.INTEGER,
      description: "Risk score from 0 (completely safe) to 100 (critical/scam). IMPORTANT: Transfers between wallets belonging to the same user, or transfers to known wallet addresses within the app, should score 10-25 (LOW). Only unknown, suspicious, or high-value-to-new-address transfers should score above 60."
    },
    riskLevel: {
      type: Type.STRING,
      enum: ["Low", "Moderate", "High", "Critical"],
      description: "Categorical risk level. 0-25=Low, 26-50=Moderate, 51-75=High, 76-100=Critical."
    },
    riskCategory: {
      type: Type.STRING,
      description: "Short category label e.g. 'Internal Transfer', 'Unknown Recipient', 'High Value Transfer', 'Suspicious Pattern', 'Safe Transaction'"
    },
    verdict: {
      type: Type.STRING,
      description: "A 1-2 sentence verdict explaining the risk assessment decision in plain English."
    },
    recommendation: {
      type: Type.STRING,
      enum: ["Safe to proceed", "Proceed with caution", "Double-check recipient", "High risk – review carefully", "Do not send – likely a scam"],
      description: "Clear, actionable recommendation for the user."
    },
    riskFactors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific risk factors identified. If safe, include positive safety signals instead. Each item should explain WHY it contributes to the score."
    },
    tips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-3 specific, helpful tips for the user based on this transaction. E.g. 'Verify the recipient address character-by-character before confirming' or 'This looks like your own wallet – transfer is safe!'"
    },
    merchantAction: {
      type: Type.STRING,
      enum: ["APPROVE", "WARN_USER", "REJECT"],
      description: "System action: APPROVE for risk<30, WARN_USER for 30-75, REJECT for >75"
    }
  },
  required: ["riskScore", "riskLevel", "riskCategory", "verdict", "recommendation", "riskFactors", "tips", "merchantAction"]
};
