import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { notifyUser } from '../utils/notify.js';
import { getPineconeIndex } from '../utils/pineconeClient.js';
import { transactionToText, getTransactionEmbedding } from '../services/embeddingService.js';

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

    // ==========================================
    // BACKGROUND SYNC: Pinecone Vectorization
    // ==========================================
    try {
      const pineconeIndex = getPineconeIndex();
      if (pineconeIndex) {
        const text = transactionToText(transaction);
        const vector = await getTransactionEmbedding(text);
        
        await pineconeIndex.upsert({
          records: [{
            id: transaction._id.toString(),
            values: vector,
            metadata: {
              userId: transaction.user.toString(),
              from: transaction.from,
              to: transaction.to,
              amount: transaction.amount,
              asset: transaction.asset,
              network: transaction.network,
              createdAt: transaction.createdAt.toISOString(),
              status: transaction.status
            }
          }]
        });
        console.log(`✅ Upserted transaction ${transaction._id} vector to Pinecone`);
      }
    } catch (pcError) {
      console.error(`⚠️ Failed to upsert transaction ${transaction._id} to Pinecone:`, pcError.message);
    }
    
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to save transaction', details: error.message });
  }
};

// GET /api/transactions/stats
// Get aggregated statistics for the logged in user
export const getTransactionStats = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId });

    const totalTransactions = transactions.length;
    let totalVolumeUSD = 0;
    const activeAssets = new Set();
    const monthlyData = {};
    const assetAllocation = {};

    // For testnet demo purposes, assume ETH = $3500, others roughly equivalent or zero.
    const ETH_PRICE = 3500;
    let dayOfWeekData = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // For Top 5 Transactions
    const enrichedTransactions = transactions.map(tx => {
      const amt = parseFloat(tx.amount) || 0;
      let usdVal = 0;
      if (tx.asset.toLowerCase().includes('eth')) usdVal = amt * ETH_PRICE;
      else if (tx.asset.toLowerCase().includes('usd')) usdVal = amt; // USDT, USDC
      else usdVal = amt * 10; // Dummy fallback
      return { ...tx.toObject(), usdVal };
    });

    enrichedTransactions.forEach(tx => {
      const usdVal = tx.usdVal;
      totalVolumeUSD += usdVal;
      activeAssets.add(tx.asset);

      // Monthly Chart Data (Format: YYYY-MM)
      const date = new Date(tx.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { volume: 0, count: 0 };
      }
      monthlyData[monthKey].volume += usdVal;
      monthlyData[monthKey].count += 1;

      // Asset Allocation (Total volume by asset)
      if (!assetAllocation[tx.asset]) {
        assetAllocation[tx.asset] = 0;
      }
      assetAllocation[tx.asset] += usdVal;

      // Day of Week
      const day = dayNames[date.getDay()];
      dayOfWeekData[day] += usdVal;
    });

    // Format chart data for frontend (last 12 months)
    const now = new Date();
    const chartData = [];
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      chartData.push({
        label: monthNames[d.getMonth()],
        volume: monthlyData[key]?.volume || 0,
        count: monthlyData[key]?.count || 0,
        key
      });
    }

    // Month over Month Growth
    let growthPct = 0;
    if (chartData.length >= 2) {
      const currentMonthVolume = chartData[11].volume;
      const previousMonthVolume = chartData[10].volume;
      if (previousMonthVolume > 0) {
        growthPct = ((currentMonthVolume - previousMonthVolume) / previousMonthVolume) * 100;
      } else if (currentMonthVolume > 0) {
        growthPct = 100;
      }
    }

    // Top 5 Transactions
    const topTransactions = enrichedTransactions
      .sort((a, b) => b.usdVal - a.usdVal)
      .slice(0, 5)
      .map(tx => ({
        id: tx._id,
        date: tx.createdAt,
        asset: tx.asset,
        amount: tx.amount,
        usdVal: tx.usdVal,
        fromAddress: tx.fromAddress || tx.sender
      }));

    // Format asset allocation
    const allocationArr = Object.keys(assetAllocation).map(asset => ({
      asset,
      volumeUSD: assetAllocation[asset],
      percentage: totalVolumeUSD > 0 ? (assetAllocation[asset] / totalVolumeUSD) * 100 : 0
    })).sort((a, b) => b.volumeUSD - a.volumeUSD);

    res.json({
      totalVolumeUSD,
      totalTransactions,
      averageOrderValue: totalTransactions > 0 ? totalVolumeUSD / totalTransactions : 0,
      activeAssetsCount: activeAssets.size,
      chartData,
      allocation: allocationArr,
      growthPct,
      topTransactions,
      dayOfWeekData
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction stats' });
  }
};
