import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import AppSidebar from '../components/AppSidebar';

const API = 'http://localhost:5000';
const fmt = (addr) => addr ? `${addr.slice(0,8)}…${addr.slice(-6)}` : '';
const riskColor = (lvl) => ({ Low:'#4ade80', Moderate:'#facc15', High:'#fb923c', Critical:'#f87171' }[lvl] ?? '#a78bfa');

const Transfers = () => {
  const navigate = useNavigate();
  const [user,          setUser]          = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { address: web3Address, isConnected } = useWeb3Auth();

  // Saved wallets + assets
  const [savedWallets,  setSavedWallets]  = useState([]);
  const [fromWallet,    setFromWallet]    = useState('');
  const [assets,        setAssets]        = useState(null);
  const [assetsLoading, setAssetsLoading] = useState(false);

  // Form state
  const [sendCoin,      setSendCoin]      = useState('');
  const [sendTo,        setSendTo]        = useState('');
  const [sendAmount,    setSendAmount]    = useState('');

  // Risk
  const [riskResult,    setRiskResult]    = useState(null);
  const [riskLoading,   setRiskLoading]   = useState(false);

  // Transfer history (mock)
  const [history, setHistory] = useState([
    { id:1, type:'send',    label:'Sent ETH',            detail:'Today, 10:24 AM • Ethereum',       amount:'-0.5 ETH'  },
    { id:2, type:'receive', label:'Received USDT',        detail:'Yesterday, 04:15 PM • Ethereum',   amount:'+500 USDT' },
    { id:3, type:'send',    label:'Sent LINK',            detail:'Nov 14, 09:30 AM • Ethereum',      amount:'-12.5 LINK'},
  ]);

  // ── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token      = localStorage.getItem('token');
    if (!storedUser || !token) { navigate('/login'); return; }
    setUser(JSON.parse(storedUser));

    // Load saved wallets
    fetch(`${API}/api/wallets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) { setSavedWallets(d); if (d.length > 0) setFromWallet(d[0].address); } })
      .catch(console.error);
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

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
    { symbol:'ETH',  name:'Ethereum', balance:assets.eth.balance, usdValue:assets.eth.usdValue },
    ...assets.tokens.map(t => ({ symbol:t.symbol, name:t.name, balance:t.balance, usdValue:t.usdValue })),
  ] : [];
  const selectedCoin = coinList.find(c => c.symbol === sendCoin) || coinList[0];
  const coinUsdPrice = selectedCoin && parseFloat(selectedCoin.balance) > 0
    ? parseFloat(selectedCoin.usdValue) / parseFloat(selectedCoin.balance)
    : 0;
  const sendAmountUsd = sendAmount && coinUsdPrice ? (parseFloat(sendAmount) * coinUsdPrice).toFixed(2) : null;

  // ── Submit (AI Risk) ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setRiskLoading(true); setRiskResult(null);
    try {
      const res = await fetch(`${API}/api/v1/checkout/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerWallet: fromWallet, targetContract: sendTo, valueRequested: sendAmount, asset: sendCoin }),
      });
      setRiskResult(await res.json());
    } catch { setRiskResult({ error: 'AI engine unavailable.' }); }
    finally { setRiskLoading(false); }
  };

  const handleConfirm = () => {
    const wallet = allWallets.find(w => w.address === fromWallet);
    setHistory(prev => [{
      id: Date.now(), type:'send',
      label: `Sent ${sendAmount} ${sendCoin}`,
      detail: `Just now • ${wallet?.nickname || 'Wallet'}`,
      amount: `-${sendAmount} ${sendCoin}`,
    }, ...prev]);
    setRiskResult(null); setSendAmount(''); setSendTo(''); setSendCoin('ETH');
    alert(`✅ Transfer of ${sendAmount} ${sendCoin} submitted successfully!`);
  };

  const allWallets = [...savedWallets];
  if (isConnected && web3Address && !savedWallets.some(w => w.address.toLowerCase() === web3Address.toLowerCase())) {
    allWallets.unshift({ _id: 'web3', nickname: 'MetaMask (Live)', address: web3Address });
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
              <p>Send crypto from any of your saved wallets.</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn"><i className='bx bx-bell' /></button>
              <div className="user-profile">
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4B1D8F&color=fff`} alt="User" />
              </div>
            </div>
          </header>

          <div className="dashboard-grid">

            {/* ── LEFT: Transfer Form ── */}
            <div className="glass-panel" style={{ gridColumn:'span 1' }}>
              <div className="section-header" style={{ marginBottom:'1.5rem' }}>
                <h3><i className='bx bx-send' /> Send Crypto</h3>
              </div>

              {allWallets.length === 0 ? (
                <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>
                  <i className='bx bx-wallet' style={{ fontSize:'3rem', display:'block', marginBottom:'1rem', opacity:0.3 }} />
                  <p>No wallets saved yet.</p>
                  <Link to="/dashboard" className="btn-primary" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', marginTop:'0.5rem', textDecoration:'none', padding:'0.65rem 1.5rem' }}>
                    <i className='bx bx-plus' /> Add a Wallet
                  </Link>
                </div>
              ) : !riskResult ? (
                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>

                  {/* From Wallet */}
                  <div className="form-group">
                    <label>From Wallet</label>
                    <select
                      value={fromWallet}
                      onChange={e => setFromWallet(e.target.value)}
                      style={{ width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid var(--border)', background:'var(--glass-bg,rgba(255,255,255,0.05))', color:'var(--text-color)', fontSize:'0.95rem' }}
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
                    <div style={{ textAlign:'center', padding:'0.75rem', color:'var(--text-muted)', fontSize:'0.85rem' }}>
                      <i className='bx bx-loader-alt bx-spin' /> Loading wallet assets…
                    </div>
                  )}
                  {assets && !assetsLoading && (
                    <div style={{ background:'rgba(123,63,191,0.1)', border:'1px solid rgba(123,63,191,0.3)', borderRadius:'10px', padding:'0.85rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>Portfolio Value</span>
                      <strong style={{ color:'#a78bfa', fontSize:'1.05rem' }}>${Number(assets.totalUsd).toLocaleString('en-US', { minimumFractionDigits:2 })}</strong>
                    </div>
                  )}

                  {/* Select Coin */}
                  <div className="form-group">
                    <label>Coin to Send</label>
                    {assetsLoading ? (
                      <select disabled style={{ width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid var(--border)', background:'rgba(255,255,255,0.03)', color:'var(--text-muted)' }}>
                        <option>Loading coins…</option>
                      </select>
                    ) : (
                      <select
                        value={sendCoin}
                        onChange={e => { setSendCoin(e.target.value); setSendAmount(''); setRiskResult(null); }}
                        style={{ width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid var(--border)', background:'var(--glass-bg,rgba(255,255,255,0.05))', color:'var(--text-color)', fontSize:'0.95rem' }}
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
                      onChange={e => setSendTo(e.target.value)}
                      style={{ fontFamily:'monospace', fontSize:'0.9rem' }}
                      required
                    />
                  </div>

                  {/* Amount + MAX */}
                  <div className="form-group">
                    <label style={{ display:'flex', justifyContent:'space-between' }}>
                      <span>Amount</span>
                      {selectedCoin && <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>Available: {parseFloat(selectedCoin.balance).toFixed(6)} {sendCoin}</span>}
                    </label>
                    <div style={{ display:'flex', gap:'0.5rem' }}>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max={selectedCoin?.balance || undefined}
                        placeholder="0.00"
                        value={sendAmount}
                        onChange={e => setSendAmount(e.target.value)}
                        style={{ flex:1, fontSize:'1.1rem', fontWeight:600 }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setSendAmount(selectedCoin ? parseFloat(selectedCoin.balance).toFixed(6) : '0')}
                        style={{ padding:'0 1.2rem', background:'rgba(123,63,191,0.2)', color:'#a78bfa', border:'1px solid rgba(123,63,191,0.4)', borderRadius:'8px', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontSize:'0.9rem', transition:'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(123,63,191,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='rgba(123,63,191,0.2)'; }}
                        disabled={!selectedCoin}
                      >
                        MAX
                      </button>
                    </div>
                    {sendAmountUsd && (
                      <p style={{ margin:'0.25rem 0 0', fontSize:'0.8rem', color:'var(--text-muted)' }}>≈ ${sendAmountUsd} USD</p>
                    )}
                  </div>

                  {/* Fee estimate */}
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'0.85rem 1rem', background:'rgba(75,29,143,0.06)', border:'1px solid rgba(75,29,143,0.15)', borderRadius:'10px' }}>
                    <div>
                      <span style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)' }}>Estimated Fee</span>
                      <strong style={{ fontSize:'0.9rem' }}>~$1.50</strong>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <span style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)' }}>Estimated Time</span>
                      <strong style={{ fontSize:'0.9rem' }}>~2 mins</strong>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width:'100%', padding:'1rem', fontSize:'1rem' }} disabled={riskLoading || coinList.length === 0}>
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
                  <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'1rem', marginBottom:'1rem', fontSize:'0.9rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                      <span style={{ color:'var(--text-muted)' }}>From</span>
                      <strong style={{ fontFamily:'monospace' }}>{fmt(fromWallet)}</strong>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                      <span style={{ color:'var(--text-muted)' }}>To</span>
                      <strong style={{ fontFamily:'monospace' }}>{fmt(sendTo)}</strong>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-muted)' }}>Amount</span>
                      <strong>{sendAmount} {sendCoin} {sendAmountUsd ? `(~$${sendAmountUsd})` : ''}</strong>
                    </div>
                  </div>

                  {riskResult.error ? (
                    <div style={{ padding:'1rem', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', color:'#f87171', marginBottom:'1rem' }}>
                      <i className='bx bx-error-circle' /> {riskResult.error}
                    </div>
                  ) : (
                    <div style={{ padding:'1.25rem', borderRadius:'12px', background:`${riskColor(riskResult.riskLevel)}15`, border:`1px solid ${riskColor(riskResult.riskLevel)}44`, marginBottom:'1rem' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                        <h4 style={{ margin:0, color:riskColor(riskResult.riskLevel), display:'flex', alignItems:'center', gap:'0.5rem' }}>
                          <i className={`bx ${riskResult.riskLevel === 'Low' ? 'bx-check-shield' : riskResult.riskLevel === 'Critical' ? 'bx-block' : 'bx-error'}`} />
                          {riskResult.riskLevel} Risk
                        </h4>
                        <span style={{ background:riskColor(riskResult.riskLevel), color:'#000', borderRadius:'20px', padding:'0.2rem 0.75rem', fontWeight:700, fontSize:'0.9rem' }}>
                          {riskResult.riskScore}/100
                        </span>
                      </div>
                      <p style={{ margin:'0 0 0.5rem', fontSize:'0.85rem', color:'var(--text-muted)' }}><strong>Category:</strong> {riskResult.riskCategory}</p>
                      <p style={{ margin:0, fontSize:'0.9rem', lineHeight:'1.5' }}>{riskResult.recommendation}</p>
                    </div>
                  )}

                  <div style={{ display:'flex', gap:'0.75rem' }}>
                    <button className="btn-secondary" style={{ flex:1 }} onClick={() => setRiskResult(null)}>← Edit</button>
                    <button
                      className="btn-primary"
                      style={{ flex:1, opacity: riskResult.riskLevel === 'Critical' ? 0.5 : 1 }}
                      disabled={riskResult.riskLevel === 'Critical' || !!riskResult.error}
                      onClick={handleConfirm}
                    >
                      {riskResult.riskLevel === 'Critical' ? '🚫 Blocked' : '✅ Confirm Transfer'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: History ── */}
            <div style={{ gridColumn:'span 1', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

              {/* Wallet quick-pick */}
              {savedWallets.length > 0 && (
                <div className="glass-panel">
                  <div className="section-header" style={{ marginBottom:'1rem' }}>
                    <h3>My Wallets</h3>
                    <Link to="/dashboard" style={{ color:'var(--primary)', fontSize:'0.85rem', textDecoration:'none' }}>Manage</Link>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                    {savedWallets.map(w => (
                      <div
                        key={w._id}
                        onClick={() => setFromWallet(w.address)}
                        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem 1rem', borderRadius:'10px', cursor:'pointer', background: fromWallet === w.address ? 'rgba(123,63,191,0.2)' : 'rgba(255,255,255,0.03)', border: fromWallet === w.address ? '1px solid rgba(123,63,191,0.5)' : '1px solid rgba(255,255,255,0.07)', transition:'all 0.2s' }}
                      >
                        <div>
                          <p style={{ margin:0, fontWeight:600, fontSize:'0.9rem' }}>{w.nickname}</p>
                          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-muted)', fontFamily:'monospace' }}>{fmt(w.address)}</p>
                        </div>
                        {fromWallet === w.address && <i className='bx bx-check-circle' style={{ color:'#a78bfa', fontSize:'1.2rem' }} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transfer history */}
              <div className="recent-activity glass-panel" style={{ flex:1 }}>
                <div className="section-header" style={{ marginBottom:'1rem' }}>
                  <h3>Transfer History</h3>
                </div>
                <div className="transaction-list">
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
