import { ethers } from 'ethers';
import User from '../models/User.js';

// ─── Providers ───────────────────────────────────────────────────────────────
// We try Alchemy first (full token support), fall back to public RPC for ETH only
const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_BASE = ALCHEMY_KEY && ALCHEMY_KEY !== 'your_key_here'
  ? (ALCHEMY_KEY.startsWith('http') ? ALCHEMY_KEY.replace('mainnet', 'sepolia') : `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`)
  : null;

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
  const res = await fetch(ALCHEMY_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
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

    // Check for duplicate
    const exists = user.savedWallets.some(
      w => w.address.toLowerCase() === address.trim().toLowerCase()
    );
    if (exists) {
      return res.status(409).json({ error: 'This wallet address is already saved.' });
    }

    // Check Plan Limits
    const currentWalletsCount = user.savedWallets.length;
    if (user.plan === 'free' && currentWalletsCount >= 1) {
      return res.status(403).json({ error: 'Free plan is limited to 1 wallet. Please upgrade to Pro.' });
    }
    if (user.plan === 'pro' && currentWalletsCount >= 10) {
      return res.status(403).json({ error: 'Pro plan is limited to 10 wallets. Please upgrade to Enterprise.' });
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

    // 3. ERC-20 tokens via Alchemy (only if key is configured)
    if (ALCHEMY_BASE) {
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
      hasAlchemy: !!ALCHEMY_BASE,
    });
  } catch (err) {
    console.error('getWalletAssets error:', err.message);
    res.status(500).json({ error: 'Failed to fetch wallet assets. ' + err.message });
  }
};

// GET /api/wallets/:address/history
export const getWalletHistory = async (req, res) => {
  const { address } = req.params;

  if (!isValidEthAddress(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address.' });
  }

  try {
    if (!ALCHEMY_BASE) {
      console.warn('No Alchemy key found, returning empty history.');
      return res.json([]);
    }

    const fetchTransfers = async (isFrom) => {
      const payload = {
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getAssetTransfers",
        params: [{
          fromBlock: "0x0",
          toBlock: "latest",
          [isFrom ? "fromAddress" : "toAddress"]: address,
          category: ["external", "internal", "erc20"],
          maxCount: "0x15"
        }]
      };

      const r = await fetch(ALCHEMY_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      return data?.result?.transfers || [];
    };

    const [sentTxs, rcvTxs] = await Promise.all([
      fetchTransfers(true),
      fetchTransfers(false)
    ]);

    let combined = [...sentTxs, ...rcvTxs];

    // Sort by blockNum descending
    combined.sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16));

    // Take top 15 recent
    combined = combined.slice(0, 15);

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

    res.json(txs);
  } catch (err) {
    console.error('getWalletHistory error:', err.message);
    res.status(500).json({ error: 'Failed to fetch wallet history.' });
  }
};
