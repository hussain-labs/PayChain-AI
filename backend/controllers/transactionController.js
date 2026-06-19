import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

// GET /api/transactions
// Get all internal transactions for the logged in user
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// POST /api/transactions
// Save a newly submitted transaction
export const createTransaction = async (req, res) => {
  try {
    const { from, to, amount, asset, network, hash, status } = req.body;
    
    if (!from || !to || !amount || !asset || !network || !hash) {
      return res.status(400).json({ error: 'All transaction fields are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check Plan Limits
    if (user.plan === 'free' && user.transactionCount >= 3) {
      return res.status(403).json({ error: 'Free plan is limited to 3 transactions total. Please upgrade to Pro.' });
    }
    if (user.plan === 'pro' && user.transactionCount >= 1000) {
      return res.status(403).json({ error: 'Pro plan is limited to 1000 transactions. Please upgrade to Enterprise.' });
    }

    const transaction = await Transaction.create({
      user: req.userId,
      from,
      to,
      amount,
      asset,
      network,
      hash,
      status: status || 'Success'
    });

    // Increment transaction count
    user.transactionCount += 1;
    await user.save();

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to save transaction', details: error.message });
  }
};
