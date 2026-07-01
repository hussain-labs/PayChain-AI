import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { notifyUser } from '../utils/notify.js';

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
    const bonus = user.bonusTransactions || 0;
    const planMax = user.plan === 'free' ? 3 : user.plan === 'pro' ? 10000 : Infinity;
    const totalLimit = planMax === Infinity ? Infinity : planMax + bonus;

    if (totalLimit !== Infinity && user.transactionCount >= totalLimit) {
      return res.status(403).json({ error: `Transaction limit reached. You have used all ${totalLimit} transactions for your current plan${bonus > 0 ? ' (including bonuses)' : ''}. Please upgrade for more.` });
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
    if (!req.body.aiUnavailable) {
      user.transactionCount += 1;
      await user.save();
    }

    // Notify user
    await notifyUser(req.userId, `Transaction processed: ${amount} ${asset} to ${to}`, '/transfers');

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to save transaction', details: error.message });
  }
};
