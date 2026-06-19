import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  amount: { type: String, required: true },
  asset: { type: String, required: true },
  network: { type: String, required: true },
  hash: { type: String, required: true },
  status: { type: String, enum: ['Success', 'Pending', 'Failed'], default: 'Success' },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
