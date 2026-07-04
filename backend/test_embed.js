import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY);

async function run() {
  const models = ['text-embedding-004', 'embedding-001', 'gemini-embedding-2', 'gemini-embedding-exp-03-07'];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      await model.embedContent('hello');
      console.log(m, 'SUCCESS');
    } catch (e) {
      console.log(m, 'FAILED:', e.message.split('\n')[0]);
    }
  }
}
run();
