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
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  avatar: { type: String, default: '' },
  currency: { type: String, default: 'USD' },
  language: { type: String, default: 'EN' },
  isAdmin: { type: Boolean, default: false },
  plan: { type: String, enum: ['free', 'pro', 'pro_plus'], default: 'free' },
  isActive: { type: Boolean, default: true },
  transactionCount: { type: Number, default: 0 },
  historyLookups: { type: Number, default: 0 },
  lastResetAt: { type: Date, default: null },
  stripeCustomerId: { type: String, default: null },
  stripeSubscriptionId: { type: String, default: null },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bonusTransactions: { type: Number, default: 0 },
  notifications: [
    {
      message: { type: String, required: true },
      link: { type: String, default: null },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ],
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
      address: { type: String, required: true, trim: true },
      addedAt: { type: Date, default: Date.now }
    }
  ]
});

const User = mongoose.model('User', userSchema);
export default User;
