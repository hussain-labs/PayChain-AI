import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '/home/muzamil-hussain/Desktop/PAYCHAIN/PayChain-AI/backend/.env' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  const user = await db.collection('users').findOne({});
  if (!user) {
    console.log("No user found");
    process.exit(1);
  }
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  const res = await fetch('http://localhost:5000/api/escrows', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: "Test",
      description: "Test Desc",
      amount: "0.1",
      asset: "ETH",
      buyerWallet: "0x123",
      sellerWallet: "0x456",
      role: "buyer"
    })
  });
  
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
  process.exit(0);
}
run();
