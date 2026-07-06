import { ethers } from 'ethers';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { getActiveAlchemyKey, rotateToNextAlchemyKey, isQuotaError } from '../services/keyRotationService.js';

const formatAlchemyBaseUrl = (key) => {
  if (!key || key === 'your_key_here') return null;
  return key.startsWith('http') ? key.replace('mainnet', 'sepolia') : `https://eth-sepolia.g.alchemy.com/v2/${key}`;
};

// Public fallback – reads ETH balance only (Sepolia Testnet)
const publicProvider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isValidEthAddress(addr) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

async function fetchEthPrice() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    const data = await res.json();
    return data?.ethereum?.usd ?? 3000;
  } catch {
    return 3000; // safe fallback
  }
}

async function alchemyPost(method, params) {
  for (let attempts = 0; attempts < 3; attempts++) {
    const activeAlchemy = await getActiveAlchemyKey();
    if (!activeAlchemy) throw new Error("No Alchemy key configured.");
    
    const alchemyBase = formatAlchemyBaseUrl(activeAlchemy.key);
    
    try {
      const res = await fetch(alchemyBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      return json.result;
    } catch (err) {
      if (isQuotaError(err) || String(err.message).toLowerCase().includes('rate limit') || String(err.message).toLowerCase().includes('capacity')) {
        console.warn(`[Alchemy Rate Limit] Key ${activeAlchemy.index} hit limit in wallet assets. Rotating...`);
        await rotateToNextAlchemyKey(activeAlchemy.index, activeAlchemy.total);
      } else {
        throw err;
      }
    }
  }
  throw new Error("Alchemy fetch failed after retries.");
}

// ─── Controllers ─────────────────────────────────────────────────────────────

// POST /api/wallets
export const addWallet = async (req, res) => {
  const { nickname, address } = req.body;

  if (!nickname?.trim() || !address?.trim()) {
    return res.status(400).json({ error: 'Nickname and address are required.' });
  }
  if (!isValidEthAddress(address.trim())) {
    return res.status(400).json({ error: 'Invalid Ethereum address format.' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Check for duplicate address
    const exists = user.savedWallets.some(
      w => w.address.toLowerCase() === address.trim().toLowerCase()
    );
    if (exists) {
      return res.status(409).json({ error: 'This wallet address is already saved.' });
    }

    // ── Plan Limits ───────────────────────────────────────────────────────────
    const plan = user.plan || 'free';
    const currentCount = user.savedWallets.length;
    const bonusWallets = user.bonusTransactions || 0; // reuse bonusTransactions field for extra wallet slots

    const PLAN_LIMITS = {
      free:     1,
      pro:      60,
      pro_plus: 200 + bonusWallets,
    };
    const walletLimit = PLAN_LIMITS[plan] ?? 1;

    if (currentCount >= walletLimit) {
      const planLabel = plan === 'pro' ? 'Business Pro' : plan === 'pro_plus' ? 'Enterprise' : 'Free';
      if (plan === 'pro_plus') {
        return res.status(403).json({
          error: `You have reached your ${walletLimit}-wallet limit. You can add extra wallet slots for $1/each. Contact support or upgrade your add-ons.`,
          code: 'WALLET_LIMIT_EXTRA'
        });
      }
      return res.status(403).json({
        error: plan === 'free'
          ? 'Free plan allows only 1 saved wallet. Please delete the existing one or upgrade to Pro.'
          : `${planLabel} plan is limited to ${walletLimit} wallets. Please upgrade to Enterprise.`,
        code: 'WALLET_LIMIT'
      });
    }

    user.savedWallets.push({ nickname: nickname.trim(), address: address.trim() });
    await user.save();

    res.json(user.savedWallets);
  } catch (err) {
    console.error('addWallet error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// DELETE /api/wallets/:address
export const removeWallet = async (req, res) => {
  const { address } = req.params;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const before = user.savedWallets.length;
    user.savedWallets = user.savedWallets.filter(
      w => w.address.toLowerCase() !== address.toLowerCase()
    );

    if (user.savedWallets.length === before) {
      return res.status(404).json({ error: 'Wallet not found.' });
    }

    await user.save();
    res.json(user.savedWallets);
  } catch (err) {
    console.error('removeWallet error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/wallets (list saved wallets for the logged-in user)
export const getWallets = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('savedWallets');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user.savedWallets);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/wallets/:address/assets  – real on-chain balance + token list
export const getWalletAssets = async (req, res) => {
  const { address } = req.params;

  if (!isValidEthAddress(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address.' });
  }

  try {
    // 1. ETH balance (works with or without Alchemy key)
    let ethBalance = 0;
    try {
      const ethBalanceBigInt = await publicProvider.getBalance(address);
      ethBalance = parseFloat(ethers.formatEther(ethBalanceBigInt));
    } catch (err) {
      console.warn('Public RPC failed to fetch ETH balance:', err.message);
    }

    // 2. ETH price in USD
    const ethPrice = await fetchEthPrice();
    const ethUsd = (ethBalance * ethPrice).toFixed(2);

    let tokens = [];
    let totalUsd = parseFloat(ethUsd);

    let hasAlchemy = false;
    // 3. ERC-20 tokens via Alchemy
    const activeAlchemyForAssets = await getActiveAlchemyKey();
    if (activeAlchemyForAssets) {
      hasAlchemy = true;
      try {
        // Get all token balances
        const balancesResult = await alchemyPost('alchemy_getTokenBalances', [address, 'erc20']);
        const nonZero = (balancesResult?.tokenBalances ?? []).filter(
          t => t.tokenBalance && t.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000'
        );

        // Fetch metadata for each token (batch-friendly; limit to 20 to avoid timeout)
        const tokenPromises = nonZero.slice(0, 20).map(async (t) => {
          try {
            const meta = await alchemyPost('alchemy_getTokenMetadata', [t.contractAddress]);
            const decimals = meta?.decimals ?? 18;
            const rawBalance = parseInt(t.tokenBalance, 16);
            const balance = rawBalance / Math.pow(10, decimals);

            // Fetch USD price from CoinGecko by contract address
            let usdValue = 0;
            try {
              const priceRes = await fetch(
                `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${t.contractAddress}&vs_currencies=usd`
              );
              const priceData = await priceRes.json();
              const price = priceData?.[t.contractAddress.toLowerCase()]?.usd ?? 0;
              usdValue = balance * price;
            } catch { /* price unavailable */ }

            return {
              contractAddress: t.contractAddress,
              name: meta?.name ?? 'Unknown Token',
              symbol: meta?.symbol ?? '???',
              decimals,
              balance: balance.toFixed(6),
              usdValue: usdValue.toFixed(2),
              logo: meta?.logo ?? null,
            };
          } catch {
            return null;
          }
        });

        const results = await Promise.all(tokenPromises);
        tokens = results.filter(Boolean).filter(t => parseFloat(t.balance) > 0);
        totalUsd += tokens.reduce((sum, t) => sum + parseFloat(t.usdValue), 0);
      } catch (alchemyErr) {
        console.warn('Alchemy token fetch failed:', alchemyErr.message);
        // Continue – return ETH only
      }
    }

    res.json({
      address,
      eth: {
        balance: ethBalance.toFixed(6),
        usdValue: ethUsd,
        symbol: 'ETH',
        name: 'Ethereum',
        logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      },
      tokens,
      totalUsd: totalUsd.toFixed(2),
      hasAlchemy,
    });
  } catch (err) {
    console.error('getWalletAssets error:', err.message);
    res.status(500).json({ error: 'Failed to fetch wallet assets. ' + err.message });
  }
};

// GET /api/wallets/:address/history
export const getWalletHistory = async (req, res) => {
  const { address } = req.params;
  const onchain = req.query.onchain === 'true';

  if (!isValidEthAddress(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address.' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // 1. DEFAULT BEHAVIOR: Load internal MongoDB transactions (Free, no rate limit)
    if (!onchain) {
      const internalTxs = await Transaction.find({
        $or: [
          { from: { $regex: new RegExp("^" + address + "$", "i") } },
          { to: { $regex: new RegExp("^" + address + "$", "i") } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(15);

      const formatted = internalTxs.map(tx => ({
        id: tx.hash || tx._id,
        hash: tx.hash || tx._id,
        timestamp: new Date(tx.createdAt).getTime(),
        isReceive: tx.to.toLowerCase() === address.toLowerCase(),
        value: parseFloat(tx.amount) || 0,
        symbol: tx.asset,
        from: tx.from,
        to: tx.to,
        status: tx.status
      }));

      return res.json(formatted);
    }

    // 2. ON-CHAIN BEHAVIOR: Check Plan Limits
    const plan = user.plan || 'free';
    let maxCountHex = "0xA"; // Default 10
    let fetchLimit = 10;

    if (plan === 'free') {
      if (user.historyLookups >= 3) {
        return res.status(403).json({
          error: 'You have reached your 3 free on-chain data lookups for this month. Upgrade to Pro to unlock unlimited history.',
          code: 'LIMIT_REACHED'
        });
      }
      maxCountHex = "0xA"; // 10 txs
      fetchLimit = 10;
    } else if (plan === 'pro') {
      maxCountHex = "0x1E"; // 30 txs
      fetchLimit = 30;
    } else if (plan === 'pro_plus') {
      maxCountHex = "0x32"; // 50 txs
      fetchLimit = 50;
    }

    // Fetch from Alchemy
    const activeAlchemy = await getActiveAlchemyKey();
    if (!activeAlchemy) {
      console.warn('No Alchemy key found, returning 503.');
      return res.status(503).json({ error: 'Live on-chain data is currently unavailable. Please try again later.' });
    }

    const fetchTransfers = async (isFrom) => {
      for (let attempts = 0; attempts < 3; attempts++) {
        const currentAlchemy = await getActiveAlchemyKey();
        const alchemyBase = formatAlchemyBaseUrl(currentAlchemy.key);
        
        const payload = {
          jsonrpc: "2.0",
          id: 1,
          method: "alchemy_getAssetTransfers",
          params: [{
            fromBlock: "0x0",
            toBlock: "latest",
            [isFrom ? "fromAddress" : "toAddress"]: address,
            category: ["external", "internal", "erc20"],
            maxCount: maxCountHex
          }]
        };

        try {
          const r = await fetch(alchemyBase, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await r.json();
          if (data.error) throw new Error(data.error.message);
          return data?.result?.transfers || [];
        } catch (err) {
          if (isQuotaError(err) || String(err.message).toLowerCase().includes('rate limit') || String(err.message).toLowerCase().includes('capacity')) {
            console.warn(`[Alchemy Rate Limit] Key ${currentAlchemy.index} hit limit in history. Rotating...`);
            await rotateToNextAlchemyKey(currentAlchemy.index, currentAlchemy.total);
          } else {
            throw err;
          }
        }
      }
      return []; // Return empty if all retries fail
    };

    const [sentTxs, rcvTxs] = await Promise.all([
      fetchTransfers(true),
      fetchTransfers(false)
    ]);

    let combined = [...sentTxs, ...rcvTxs];
    combined.sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16));
    combined = combined.slice(0, fetchLimit);

    // Fetch block timestamps
    const blockCache = {};
    const txs = await Promise.all(combined.map(async tx => {
      if (!blockCache[tx.blockNum]) {
        try {
          const b = await publicProvider.getBlock(tx.blockNum);
          blockCache[tx.blockNum] = b ? b.timestamp * 1000 : Date.now();
        } catch {
          blockCache[tx.blockNum] = Date.now();
        }
      }

      const isReceive = tx.to.toLowerCase() === address.toLowerCase();

      return {
        id: tx.hash,
        hash: tx.hash,
        timestamp: blockCache[tx.blockNum],
        isReceive,
        value: tx.value || 0,
        symbol: tx.asset || 'SepoliaETH',
        from: tx.from,
        to: tx.to,
        status: 'Success'
      };
    }));

    // Increment lookup count for free users ONLY after successful fetch
    if (plan === 'free' && onchain) {
      user.historyLookups += 1;
      await user.save();
    }

    res.json(txs);
  } catch (err) {
    console.error('getWalletHistory error:', err.message);
    res.status(500).json({ error: 'Failed to fetch wallet history.' });
  }
};
