import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  currency: { type: String, default: 'USD' },
  language: { type: String, default: 'EN' },
  isAdmin: { type: Boolean, default: false },
  plan: { type: String, enum: ['free', 'pro', 'pro_plus'], default: 'free' },
  transactionCount: { type: Number, default: 0 },
  stripeCustomerId: { type: String, default: null },
  stripeSubscriptionId: { type: String, default: null },
  createdAt: {
    type: Date,
    default: Date.now
  },
  connectedAccounts: [
    {
      name: String,
      address: String,
      bgColor: String,
      color: String,
      type: { type: String, default: 'wallet' },
      balance: { type: String, default: '$0.00' },
      wallets: { type: Number, default: 1 }
    }
  ],
  savedWallets: [
    {
      nickname: { type: String, required: true, trim: true },
      address:  { type: String, required: true, trim: true },
      addedAt:  { type: Date, default: Date.now }
    }
  ]
});

const User = mongoose.model('User', userSchema);
export default User;
