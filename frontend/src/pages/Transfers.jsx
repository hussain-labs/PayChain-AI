import UserProfilePopup from '../components/UserProfilePopup';
import NotificationBell from '../components/NotificationBell';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import AppSidebar from '../components/AppSidebar';
import { useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';
const fmt = (addr) => addr ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : '';
const riskColor = (lvl) => ({
  Low: { text: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)' },
  Moderate: { text: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.25)' },
  High: { text: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.25)' },
  Critical: { text: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
}[lvl] ?? { text: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' });
const riskIcon = (lvl) => ({ Low: 'bx-check-shield', Moderate: 'bx-shield', High: 'bx-error', Critical: 'bx-block' }[lvl] ?? 'bx-shield');

const isRelatedWallet = (nickname, connectorName) => {
  if (!connectorName || !nickname) return true;
  const n = nickname.toLowerCase().replace(/\s/g, '');
  const c = connectorName.toLowerCase().replace(/\s/g, '');
  
  if (c.includes('metamask') && n.includes('metamask')) return true;
  if (c.includes('okx') && n.includes('okx')) return true;
  if (c.includes('binance') && n.includes('binance')) return true;
  if (c.includes('trust') && n.includes('trust')) return true;
  if (c.includes('kucoin') && n.includes('kucoin')) return true;
  if (c.includes('kraken') && n.includes('kraken')) return true;
  if (c.includes('coinbase') && n.includes('coinbase')) return true;
  
  if (!['metamask', 'okx', 'binance', 'trust', 'kucoin', 'kraken', 'coinbase'].some(key => c.includes(key))) {
    return true;
  }
  return false;
};
const Transfers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { address: web3Address, addresses: web3Addresses, isConnected, connector, chainId, switchChain } = useWeb3Auth();

  const { sendTransaction, isPending } = useSendTransaction();

  // Saved wallets + assets
  const [savedWallets, setSavedWallets] = useState([]);
  const [fromWallet, setFromWallet] = useState('');
  const [assets, setAssets] = useState(null);
  const [assetsLoading, setAssetsLoading] = useState(false);

  // Form state
  const [sendCoin, setSendCoin] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');

  // Risk
  const [riskResult, setRiskResult] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);

  // Transfer history
  const [history, setHistory] = useState([]);

  // ── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) { navigate('/login'); return; }
    setUser(JSON.parse(storedUser));

    // Fetch latest user profile to get accurate transaction count and plan
    fetch(`${API}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.email) setUser(d); })
      .catch(console.error);

    // Load saved wallets
    fetch(`${API}/api/wallets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { 
        if (Array.isArray(d)) { 
          setSavedWallets(d); 
          // Do not overwrite fromWallet if it was already set by URL params or web3Address
          setFromWallet(prev => {
            if (prev) return prev;
            if (d.length > 0) return d[0].address;
            return '';
          });
        } 
      })
      .catch(console.error);

    // Load transaction history
    fetch(`${API}/api/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setHistory(d.map(tx => ({
            id: tx._id,
            type: 'send',
            label: `Sent ${tx.amount} ${tx.asset}`,
            detail: `${new Date(tx.createdAt).toLocaleString()} • ${tx.network}`,
            amount: `-${tx.amount} ${tx.asset}`,
            hash: tx.hash
          })));
        }
      })
      .catch(console.error);
    // Pre-fill recipient from QR scan (?to=address)
    const params = new URLSearchParams(location.search);
    const toAddress = params.get('to');
    if (toAddress) setSendTo(toAddress);
  }, [navigate, location.search]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  // ── Auto-select connected Web3 wallet (with case matching) ───────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromAddress = params.get('from');
    
    const getExactCase = (addr) => {
      if (!addr) return addr;
      const found = savedWallets.find(w => w.address.toLowerCase() === addr.toLowerCase());
      return found ? found.address : addr;
    };

    if (fromAddress) {
      setFromWallet(getExactCase(fromAddress));
    } else if (web3Address) {
      setFromWallet(getExactCase(web3Address));
    }
  }, [web3Address, location.search, savedWallets]);

  // ── Load assets when "From Wallet" changes ────────────────────────────────
  useEffect(() => {
    if (!fromWallet) return;
    setAssets(null); setSendCoin(''); setSendAmount(''); setRiskResult(null);
    setAssetsLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${API}/api/wallets/${fromWallet}/assets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setAssets(data);
        setSendCoin('ETH'); // default to ETH
      })
      .catch(console.error)
      .finally(() => setAssetsLoading(false));
  }, [fromWallet]);

  // ── Coin list ─────────────────────────────────────────────────────────────
  const coinList = assets ? [
    { symbol: 'ETH', name: 'Ethereum', balance: assets.eth.balance, usdValue: assets.eth.usdValue },
    ...assets.tokens.map(t => ({ symbol: t.symbol, name: t.name, balance: t.balance, usdValue: t.usdValue })),
  ] : [];
  const selectedCoin = coinList.find(c => c.symbol === sendCoin) || coinList[0];
  const coinUsdPrice = selectedCoin && parseFloat(selectedCoin.balance) > 0
    ? parseFloat(selectedCoin.usdValue) / parseFloat(selectedCoin.balance)
    : 0;
  const sendAmountUsd = sendAmount && coinUsdPrice ? (parseFloat(sendAmount) * coinUsdPrice).toFixed(2) : null;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromWallet) { toast.error("Please select a 'From' wallet."); return; }
    if (!sendTo || !sendAmount || parseFloat(sendAmount) <= 0) { toast.error("Please enter a valid amount and recipient."); return; }

    // Check Limits
    if (user) {
      const plan = user.plan || 'free';
      const count = user.transactionCount || 0;
      const bonus = user.bonusTransactions || 0;

      const baseMax = plan === 'free' ? 3 : plan === 'pro' ? 10000 : Infinity;
      const totalMax = baseMax === Infinity ? Infinity : baseMax + bonus;

      if (totalMax !== Infinity && count >= totalMax) {
        toast.error(`Monthly transaction limit reached (${totalMax} transactions max). Please upgrade your plan.`);
        navigate('/upgrade');
        return;
      }
    }

    setRiskLoading(true);
    setRiskResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/v1/checkout/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ buyerWallet: fromWallet, targetContract: sendTo, valueRequested: sendAmount, asset: sendCoin }),
      });
      setRiskResult(await res.json());
    } catch { setRiskResult({ error: 'AI engine unavailable.' }); }
    finally { setRiskLoading(false); }
  };

  const handleConfirm = () => {
    if (sendCoin !== 'ETH') {
      toast.error("Only native ETH transfers are supported right now.");
      return;
    }
    if (!isConnected) {
      toast.error("Please connect your Web3 wallet first.");
      return;
    }

    sendTransaction({ 
      to: sendTo, 
      value: parseEther(sendAmount),
      account: web3Address,
      chainId: 11155111
    }, {
      async onSuccess(hash) {
        const newTx = {
          from: fromWallet,
          to: sendTo,
          amount: sendAmount,
          asset: sendCoin,
          network: 'Sepolia',
          hash: hash,
          status: 'Success',
          aiUnavailable: riskResult?.aiUnavailable || !!riskResult?.error
        };
        try {
          const token = localStorage.getItem('token');
          await fetch(`${API}/api/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(newTx)
          });
          // Update local state
          setHistory(prev => [{
            id: hash, type: 'send',
            label: `Sent ${sendAmount} ${sendCoin}`,
            detail: `Just now • Sepolia`,
            amount: `-${sendAmount} ${sendCoin}`,
            hash: hash
          }, ...prev]);
          setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev };
            if (!riskResult?.aiUnavailable && !riskResult?.error) {
              updated.transactionCount = (prev.transactionCount || 0) + 1;
            }
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
          });
        } catch (e) { console.error('Failed to save tx:', e); }
        setRiskResult(null); setSendAmount(''); setSendTo(''); setSendCoin('ETH');
        toast.success(`Transaction submitted to the blockchain!`);
      },
      onError(err) {
        toast.error("Transaction failed or was rejected");
      }
    });
  };

  const allWallets = isConnected ? savedWallets.filter(w => isRelatedWallet(w.nickname, connector?.name)) : [];
  if (isConnected && web3Address && !savedWallets.some(w => w.address.toLowerCase() === web3Address.toLowerCase())) {
    allWallets.unshift({ _id: 'web3', nickname: 'Connected Wallet (Live)', address: web3Address });
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/transfers"
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main */}
      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}><i className='bx bx-menu' /></div>
            <div className="header-greeting">
              <h1>Transfers</h1>
              
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize: '1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <NotificationBell user={user} />
              <UserProfilePopup user={user} />
            </div>
          </header>

          <div className="page-header-description" style={{ margin: "-1rem 0 2rem 0", color: "var(--text-muted)", padding: "0 1rem" }}>
            <p>Send crypto from any of your saved wallets.</p>
          </div>

          <div className="dashboard-grid">

            {/* ── LEFT: Transfer Form ── */}
            <div className="glass-panel" style={{ gridColumn: 'span 1' }}>
              <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                <h3><i className='bx bx-send' /> Send Crypto</h3>
              </div>

              {allWallets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <i className='bx bx-wallet' style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }} />
                  <p>No wallets saved yet.</p>
                  <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', textDecoration: 'none', padding: '0.65rem 1.5rem' }}>
                    <i className='bx bx-plus' /> Add a Wallet
                  </Link>
                </div>
              ) : !riskResult ? (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                  {/* From Wallet */}
                  <div className="form-group">
                    <label>From Wallet</label>
                    <select
                      value={fromWallet}
                      onChange={e => setFromWallet(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--glass-bg,rgba(255,255,255,0.05))', color: 'var(--text-color)', fontSize: '0.95rem' }}
                      required
                    >
                      <option value="">Select wallet…</option>
                      {allWallets.map(w => (
                        <option key={w._id} value={w.address}>
                          {w.nickname} — {fmt(w.address)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* From wallet ETH balance badge */}
                  {assetsLoading && (
                    <div style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <i className='bx bx-loader-alt bx-spin' /> Loading wallet assets…
                    </div>
                  )}
                  {assets && !assetsLoading && (
                    <div style={{ background: 'rgba(123,63,191,0.1)', border: '1px solid rgba(123,63,191,0.3)', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Portfolio Value</span>
                      <strong style={{ color: '#a78bfa', fontSize: '1.05rem' }}>${Number(assets.totalUsd).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  )}

                  {/* Select Coin */}
                  <div className="form-group">
                    <label>Coin to Send</label>
                    {assetsLoading ? (
                      <select disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
                        <option>Loading coins…</option>
                      </select>
                    ) : (
                      <select
                        value={sendCoin}
                        onChange={e => { setSendCoin(e.target.value); setSendAmount(''); setRiskResult(null); }}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--glass-bg,rgba(255,255,255,0.05))', color: 'var(--text-color)', fontSize: '0.95rem' }}
                        required
                        disabled={coinList.length === 0}
                      >
                        {coinList.length === 0 && <option value="">No coins found</option>}
                        {coinList.map(c => (
                          <option key={c.symbol} value={c.symbol}>
                            {c.symbol} ({c.name}) — {parseFloat(c.balance).toFixed(4)} ≈ ${parseFloat(c.usdValue).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Recipient */}
                  <div className="form-group">
                    <label>Recipient Address</label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={sendTo}
                      onChange={e => {
                        const val = e.target.value;
                        if (val.toLowerCase().startsWith('ethereum:')) {
                          const [addressPart, queryPart] = val.substring(9).split('?');
                          setSendTo(addressPart);
                          if (queryPart) {
                            const params = new URLSearchParams(queryPart);
                            const valueWei = params.get('value');
                            if (valueWei) {
                              setSendAmount((Number(valueWei) / 1e18).toString());
                            }
                          }
                        } else {
                          setSendTo(val);
                        }
                      }}
                      style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                      required
                    />
                  </div>

                  {/* Amount + MAX */}
                  <div className="form-group">
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Amount</span>
                      {selectedCoin && <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Available: {parseFloat(selectedCoin.balance).toFixed(6)} {sendCoin}</span>}
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max={selectedCoin?.balance || undefined}
                        placeholder="0.00"
                        value={sendAmount}
                        onChange={e => setSendAmount(e.target.value)}
                        style={{ flex: 1, fontSize: '1.1rem', fontWeight: 600 }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedCoin) return;
                          let max = parseFloat(selectedCoin.balance);
                          // Leave a small buffer for gas if sending native ETH
                          if (sendCoin === 'ETH' && max > 0.0005) max -= 0.0005;
                          setSendAmount(Math.max(0, max).toFixed(6));
                        }}
                        style={{ padding: '0 1.2rem', background: 'rgba(123,63,191,0.2)', color: '#a78bfa', border: '1px solid rgba(123,63,191,0.4)', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.9rem', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(123,63,191,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(123,63,191,0.2)'; }}
                        disabled={!selectedCoin}
                      >
                        MAX
                      </button>
                    </div>
                    {sendAmountUsd && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>≈ ${sendAmountUsd} USD</p>
                    )}
                  </div>

                  {/* Fee estimate */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(75,29,143,0.06)', border: '1px solid rgba(75,29,143,0.15)', borderRadius: '10px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Fee</span>
                      <strong style={{ fontSize: '0.9rem' }}>~$1.50</strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Time</span>
                      <strong style={{ fontSize: '0.9rem' }}>~2 mins</strong>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }} disabled={riskLoading || coinList.length === 0}>
                    {riskLoading
                      ? <><i className='bx bx-loader-alt bx-spin' /> Analyzing Risk…</>
                      : <><i className='bx bx-shield-quarter' /> Analyze & Review Transfer</>
                    }
                  </button>
                </form>

              ) : (
                /* ── Risk Result ── */
                <div>
                  {/* Summary */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>From</span>
                      <strong style={{ fontFamily: 'monospace' }}>{fmt(fromWallet)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>To</span>
                      <strong style={{ fontFamily: 'monospace' }}>{fmt(sendTo)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                      <strong>{sendAmount} {sendCoin} {sendAmountUsd ? `(~$${sendAmountUsd})` : ''}</strong>
                    </div>
                  </div>

                  {riskResult.aiUnavailable ? (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 1.5rem', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '16px', gap: '1rem' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(248,113,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className='bx bx-bot' style={{ fontSize: '1.8rem', color: '#f87171' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f87171', marginBottom: '0.4rem' }}>AI Service Unavailable</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>{riskResult.aiError}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)', width: '100%', textAlign: 'left' }}>
                          <i className='bx bx-info-circle' style={{ color: '#a78bfa', marginRight: '0.4rem' }} />
                          You can still proceed with the transfer below, but please manually verify the recipient address before confirming.
                        </div>
                      </div>
                    </div>
                  ) : riskResult.error ? (
                    <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', marginBottom: '1rem' }}>
                      <i className='bx bx-error-circle' /> {riskResult.error}
                    </div>
                  ) : (() => {
                    const c = riskColor(riskResult.riskLevel);
                    return (
                      <div style={{ marginBottom: '1rem' }}>
                        {/* Score banner */}
                        <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <i className={`bx ${riskIcon(riskResult.riskLevel)}`} style={{ color: c.text, fontSize: '1.6rem' }} />
                              <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{riskResult.riskCategory || 'Risk Analysis'}</div>
                                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: c.text }}>{riskResult.riskLevel} Risk</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '2rem', fontWeight: 800, color: c.text, lineHeight: 1 }}>{riskResult.riskScore}<span style={{ fontSize: '1rem', fontWeight: 500 }}>/100</span></div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Risk Score</div>
                            </div>
                          </div>
                          {/* Score bar */}
                          <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${riskResult.riskScore}%`, borderRadius: '99px', background: c.text, transition: 'width 0.8s ease' }} />
                          </div>
                        </div>

                        {/* Verdict */}
                        {riskResult.verdict && (
                          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: '1.55', color: 'var(--text-color)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--primary)', marginRight: '0.4rem' }}><i className='bx bx-bulb' /> Verdict:</span>
                            {riskResult.verdict}
                          </div>
                        )}

                        {/* Recommendation badge */}
                        {riskResult.recommendation && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', background: c.bg, border: `1px solid ${c.border}`, marginBottom: '1rem', fontWeight: 600, color: c.text, fontSize: '0.9rem' }}>
                            <i className='bx bx-directions' /> {riskResult.recommendation}
                          </div>
                        )}

                        {/* Risk Factors */}
                        {riskResult.riskFactors?.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Risk Factors</div>
                            {riskResult.riskFactors.map((f, i) => (
                              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.45rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                                <i className='bx bx-radio-circle-marked' style={{ color: c.text, marginTop: '2px', flexShrink: 0 }} />
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tips */}
                        {riskResult.tips?.length > 0 && (
                          <div style={{ background: 'rgba(123,63,191,0.08)', border: '1px solid rgba(123,63,191,0.2)', borderRadius: '10px', padding: '1rem' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a78bfa', marginBottom: '0.6rem' }}><i className='bx bx-info-circle' /> Tips</div>
                            {riskResult.tips.map((tip, i) => (
                              <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '0.5rem', marginBottom: i < riskResult.tips.length - 1 ? '0.4rem' : 0 }}><i className='bx bx-chevron-right' style={{ marginRight: '2px' }} /> {tip}</div>
                            ))}
                          </div>
                        )}

                        {/* Recipient History (from Blockchain) */}
                        {riskResult.recipientTransfers && riskResult.recipientTransfers.length > 0 && (
                          <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '1rem' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.8rem' }}><i className='bx bx-history' /> Recipient's Recent On-Chain History</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {riskResult.recipientTransfers.map((tx, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', paddingBottom: '0.4rem', borderBottom: i < riskResult.recipientTransfers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                  <div style={{ color: 'var(--text-color)' }}>
                                    <span style={{ color: tx.direction === 'in' ? '#10b981' : '#a78bfa', marginRight: '0.5rem', fontWeight: 600 }}>{tx.direction === 'in' ? 'RECEIVED' : 'SENT'}</span>
                                    <span style={{ opacity: 0.8 }}>{tx.asset || 'ETH'}</span>
                                  </div>
                                  <div style={{ fontFamily: 'monospace', opacity: 0.8, color: tx.direction === 'in' ? '#10b981' : '#e5e7eb' }}>
                                    {tx.direction === 'in' ? '+' : '-'}{tx.value ? tx.value.toFixed(4) : '0.00'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {riskResult.recipientTransfers && riskResult.recipientTransfers.length === 0 && !riskResult.aiUnavailable && (
                          <div style={{ marginTop: '1rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', padding: '1rem', color: '#f87171', fontSize: '0.85rem' }}>
                            <i className='bx bx-error' /> <strong>Warning:</strong> This recipient address has <strong>0 prior transactions</strong>. It is a brand new wallet.
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div style={{ display: 'flex', gap: '0.75rem', position: 'sticky', bottom: '0', padding: '1rem', margin: '1rem 0 0 0', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', zIndex: 10, boxShadow: '0 -10px 40px rgba(0,0,0,0.05)' }}>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setRiskResult(null)}>← Edit</button>
                    {chainId !== 11155111 ? (
                      <button
                        className="btn-primary"
                        style={{ flex: 1, background: 'var(--primary)' }}
                        onClick={(e) => {
                          e.preventDefault();
                          switchChain({ chainId: 11155111 });
                        }}
                      >
                        <i className='bx bx-refresh' /> Switch to Sepolia Network
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        style={{ flex: 1, opacity: (riskResult.riskLevel === 'Critical' || isPending) ? 0.5 : 1 }}
                        disabled={riskResult.riskLevel === 'Critical' || !!riskResult.error || isPending}
                        onClick={handleConfirm}
                      >
                        {isPending ? <><i className='bx bx-loader-alt bx-spin' /> Awaiting Signature...</> : riskResult.riskLevel === 'Critical' ? <><i className='bx bx-block' /> Blocked</> : <><i className='bx bx-check-circle' /> Confirm Transfer</>}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: History ── */}
            <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '100px', height: 'fit-content' }}>

              {/* Wallet quick-pick */}
              {allWallets.length > 0 && (
                <div className="glass-panel">
                  <div className="section-header" style={{ marginBottom: '1rem' }}>
                    <h3>My Wallets</h3>
                    <Link to="/dashboard" style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none' }}>Manage</Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                    {allWallets.map(w => (
                      <div
                        key={w._id}
                        onClick={() => setFromWallet(w.address)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '10px', cursor: 'pointer', background: fromWallet === w.address ? 'rgba(123,63,191,0.2)' : 'rgba(255,255,255,0.03)', border: fromWallet === w.address ? '1px solid rgba(123,63,191,0.5)' : '1px solid rgba(255,255,255,0.07)', transition: 'all 0.2s' }}
                      >
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{w.nickname}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{fmt(w.address)}</p>
                        </div>
                        {fromWallet === w.address && <i className='bx bx-check-circle' style={{ color: '#a78bfa', fontSize: '1.2rem' }} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transfer history */}
              <div className="recent-activity glass-panel">
                <div className="section-header" style={{ marginBottom: '1rem' }}>
                  <h3>Transfer History</h3>
                </div>
                <div className="transaction-list" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                  {history.map(tx => (
                    <div key={tx.id} className="transaction-item">
                      <div className={`t-icon ${tx.type === 'receive' ? 'bg-success-light' : 'bg-primary-light'}`}>
                        <i className={`bx ${tx.type === 'receive' ? 'bx-down-arrow-alt' : 'bx-up-arrow-alt'}`} />
                      </div>
                      <div className="t-details">
                        <h4>{tx.label}</h4>
                        <p>{tx.detail}</p>
                      </div>
                      <div className={`t-amount ${tx.type === 'receive' ? 'positive' : 'negative'}`}>{tx.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Transfers;
