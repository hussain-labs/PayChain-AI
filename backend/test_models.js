import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash'];
for (const m of models) {
  ai.models.generateContent({
    model: m,
    contents: 'hello'
  }).then(r => console.log(m, 'SUCCESS'))
    .catch(e => console.log(m, 'FAILED', e.message));
}
