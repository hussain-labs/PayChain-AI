import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.list().then(res => console.log(JSON.stringify(res))).catch(console.error);
