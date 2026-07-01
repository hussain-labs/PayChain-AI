import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGODB_URI);

import { loadGeminiKeys, getActiveGeminiKey, rotateToNextKey, saveActiveIndex } from './services/keyRotationService.js';

console.log('Keys found:', loadGeminiKeys());
const active = await getActiveGeminiKey();
console.log('Active key info:', { index: active.index, total: active.total, keyPreview: active.key?.slice(0,20) + '...' });

// Test rotation
const next = await rotateToNextKey(0, loadGeminiKeys().length);
console.log('After rotate, new index:', next);

// Reset back to 0
await saveActiveIndex(0);
console.log('Reset to 0, saved in MongoDB ✅');

await mongoose.disconnect();
process.exit(0);
