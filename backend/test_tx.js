import mongoose from 'mongoose';
import Transaction from './models/Transaction.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const txs = await Transaction.find({});
  console.log("Txs:", txs);
  process.exit(0);
}
test();
