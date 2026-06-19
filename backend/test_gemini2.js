import { GoogleGenAI } from '@google/genai';

// Try old key
const OLD_KEY = 'AIzaSyCqrij-8noORk1YWx35yITjcL91uQYvl7Y';
const NEW_KEY = 'AIzaSyDP9vVaZXiZueYdPOQyrz5LKgXgekCsUpc';

for (const [label, key] of [['OLD', OLD_KEY], ['NEW', NEW_KEY]]) {
  const ai = new GoogleGenAI({ apiKey: key });
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: 'say ok' }] }],
      config: { temperature: 0.1 }
    });
    console.log(`${label} key: WORKS - ${res.text.slice(0,50)}`);
  } catch (e) {
    const msg = e.message?.slice(0, 150) || String(e);
    console.error(`${label} key FAILED: ${msg}`);
  }
}
process.exit(0);
