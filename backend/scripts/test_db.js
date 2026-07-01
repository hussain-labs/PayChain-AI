import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({});
  console.log("Users:", users.map(u => ({ email: u.email, id: u._id })));
  process.exit(0);
}
test();
