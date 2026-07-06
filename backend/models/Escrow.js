import mongoose from 'mongoose';

const escrowSchema = new mongoose.Schema({
  escrowId: { 
    type: String, 
    unique: true, 
    default: () => 'ESC-' + Math.random().toString(36).substr(2, 9).toUpperCase() 
  },
  title: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  asset: { type: String, required: true, default: 'ETH' },
  buyerWallet: { type: String, required: true },
  sellerWallet: { type: String, required: true },
  buyerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sellerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['buyer', 'seller'], required: true },
  status: {
    type: String,
    enum: ['awaiting_funds', 'funded', 'in_transit', 'delivered', 'released', 'disputed', 'refunded'],
    default: 'awaiting_funds'
  },
  contractAddress: { type: String } // Simulated smart contract address
}, { timestamps: true });

export default mongoose.model('Escrow', escrowSchema);
