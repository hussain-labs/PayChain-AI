import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: 'muzamil@paychain.com' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  console.log("Token:", token);
  
  const res = await fetch('http://localhost:5000/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      from: '0x123', to: '0x456', amount: '0.1', asset: 'ETH', network: 'Sepolia', hash: '0xabc'
    })
  });
  const data = await res.json();
  console.log("Response:", res.status, data);
  process.exit(0);
}
test();
