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
  ]
});

const User = mongoose.model('User', userSchema);
export default User;
