import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB:", mongoose.connection.name);
    
    // Try to drop the index if it exists
    try {
      const User = mongoose.model('User', new mongoose.Schema({}));
      await User.collection.dropIndex('username_1');
      console.log("Dropped username_1 index");
    } catch(e) {
      console.log("Index username_1 does not exist or couldn't be dropped:", e.message);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
test();
