import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({
  model: 'gemini-3.1-flash-lite',
  contents: 'hello'
}).then(r => console.log('SUCCESS', r.text))
  .catch(e => console.log('FAILED', e.message));
