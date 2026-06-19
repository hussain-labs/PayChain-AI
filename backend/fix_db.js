import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'transactions' }).toArray();
    if (collections.length > 0) {
      await db.collection('transactions').dropIndex('paymentId_1');
      console.log('Successfully dropped paymentId_1 index.');
    } else {
      console.log('transactions collection not found.');
    }
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Index already dropped or not found.');
    } else {
      console.error('Error dropping index:', err.message);
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}
fix();
