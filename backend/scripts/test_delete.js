import mongoose from 'mongoose';
import Transaction from './models/Transaction.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Transaction.deleteOne({ hash: '0xabc' });
  console.log("Deleted mock tx");
  process.exit(0);
}
test();
