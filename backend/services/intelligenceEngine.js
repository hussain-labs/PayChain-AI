import { ai, riskSchema } from '../config/gemini.js';

export const analyzeTransactionRisk = async (payload) => {
  const systemInstruction = "You are Paychain AI, an elite decentralized merchant security intelligence platform. Analyze transaction payloads for phishing, drainer patterns, malicious approvals, or burner wallet activities. Be ruthlessly objective.";
  
  // Provide a fallback in case API key is missing for local dev
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Using mock fallback logic for development.");
    return {
      riskScore: 30,
      riskCategory: "LOW",
      securityFlags: ["Mock test flag due to missing API key"],
      merchantAction: "WARN_USER"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: JSON.stringify(payload) }]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: riskSchema
      }
    });
    
    // The SDK with responseSchema returns a JSON string, need to parse
    const responseText = response.text;
    const parsedRisk = JSON.parse(responseText);
    
    return parsedRisk;
  } catch (error) {
    console.error("Gemini AI API Error:", error);
    // Fallback state so merchant is protected without breaking active checkout
    return {
      riskScore: 50,
      riskCategory: "MEDIUM",
      securityFlags: ["AI service timeout or error, defaulting to warning."],
      merchantAction: "WARN_USER"
    };
  }
};
