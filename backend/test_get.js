import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: 'muzamil@paychain.com' });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  const res = await fetch('http://localhost:5000/api/transactions', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log("Response:", res.status, data);
  process.exit(0);
}
test();
