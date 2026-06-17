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
      description: "Risk score from 0 (safest) to 100 (most critical risk)."
    },
    riskCategory: {
      type: Type.STRING,
      enum: ["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
      description: "Categorical representation of the risk."
    },
    securityFlags: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "Array of detailed threat descriptions if any are found."
    },
    merchantAction: {
      type: Type.STRING,
      enum: ["APPROVE", "WARN_USER", "REJECT"],
      description: "Recommended action for the merchant."
    }
  },
  required: ["riskScore", "riskCategory", "securityFlags", "merchantAction"]
};
