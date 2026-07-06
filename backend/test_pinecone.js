import { getPineconeIndex } from './utils/pineconeClient.js';
import mongoose from 'mongoose';

async function run() {
  const pineconeIndex = getPineconeIndex();
  console.log("Pinecone index initialized:", !!pineconeIndex);
  try {
    // try to upsert a dummy vector of length 768
    const dummyVector = Array.from({length: 768}, () => Math.random());
    await pineconeIndex.upsert([{
      id: new mongoose.Types.ObjectId().toString(),
      values: dummyVector,
      metadata: { test: "metadata" }
    }]);
    console.log("UPSERT SUCCESS!");
  } catch(e) {
    console.error("UPSERT ERROR:", e);
  }
}
run();
