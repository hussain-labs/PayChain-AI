import dotenv from 'dotenv';
dotenv.config();

const { GoogleGenAI } = await import('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

try {
  const res = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: 'Say hello' }] }],
    config: { temperature: 0.1 }
  });
  console.log('OK:', res.text.slice(0, 100));
} catch (e) {
  console.error('ERROR:', e.message?.slice(0, 300));
}
process.exit(0);
