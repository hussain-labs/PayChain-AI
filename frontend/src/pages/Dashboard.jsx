import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import { useBalance } from 'wagmi';
import { useTheme } from '../context/ThemeContext';
import AppSidebar from '../components/AppSidebar';

const API = 'http://localhost:5000';

// ─── Wallet visual identity ───────────────────────────────────────────────────
const WALLET_ICONS  = { MetaMask: '🦊', KuCoin: '🔵', Kraken: '🐙', Coinbase: '🔷', 'Trust Wallet': '🛡️', Binance: '🟡', OKX: '⚫', 'Web3 Wallet': '💎' };
const WALLET_COLORS = {
  MetaMask:      { bg: 'linear-gradient(135deg,#E2761B,#CD6116)', border: '#E2761B' },
  KuCoin:        { bg: 'linear-gradient(135deg,#23AF91,#1A8A70)', border: '#23AF91' },
  Kraken:        { bg: 'linear-gradient(135deg,#5741D9,#3D2EBF)', border: '#5741D9' },
  Coinbase:      { bg: 'linear-gradient(135deg,#0052FF,#003DB3)', border: '#0052FF' },
  'Trust Wallet':{ bg: 'linear-gradient(135deg,#3375BB,#1A5A9A)', border: '#3375BB' },
  Binance:       { bg: 'linear-gradient(135deg,#F3BA2F,#D4A017)', border: '#F3BA2F' },
  OKX:           { bg: 'linear-gradient(135deg,#1E88E5,#0D47A1)', border: '#1E88E5' },
  'Web3 Wallet': { bg: 'linear-gradient(135deg,#7B3FBF,#4B1D8F)', border: '#7B3FBF' },
};
const getWS = (name) => {
  const n = name.toLowerCase();
  if (n.includes('meta') || n.includes('mask')) return WALLET_COLORS['MetaMask'];
  if (n.includes('kucoin')) return WALLET_COLORS['KuCoin'];
  if (n.includes('kraken')) return WALLET_COLORS['Kraken'];
  if (n.includes('coinbase')) return WALLET_COLORS['Coinbase'];
  if (n.includes('trust')) return WALLET_COLORS['Trust Wallet'];
  if (n.includes('binance')) return WALLET_COLORS['Binance'];
  if (n.includes('okx')) return WALLET_COLORS['OKX'];
  return { bg: 'linear-gradient(135deg,#4B1D8F,#7B3FBF)', border: '#7B3FBF' };
};

const getIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('meta') || n.includes('mask')) return WALLET_ICONS['MetaMask'];
  if (n.includes('kucoin')) return WALLET_ICONS['KuCoin'];
  if (n.includes('kraken')) return WALLET_ICONS['Kraken'];
  if (n.includes('coinbase')) return WALLET_ICONS['Coinbase'];
  if (n.includes('trust')) return WALLET_ICONS['Trust Wallet'];
  if (n.includes('binance')) return WALLET_ICONS['Binance'];
  if (n.includes('okx')) return WALLET_ICONS['OKX'];
  return '💳';
};

const fmt = (addr) => addr ? `${addr.slice(0,8)}…${addr.slice(-6)}` : '';
const riskColor = (lvl) => ({ Low:'#4ade80', Moderate:'#facc15', High:'#fb923c', Critical:'#f87171' }[lvl] ?? '#a78bfa');

// ─── Component ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { address: web3Address, isConnected, connect, disconnect } = useWeb3Auth();
  const { data: web3Balance } = useBalance({ address: web3Address });

  // core state
  const [user,            setUser]            = useState(null);
  const [savedWallets,    setSavedWallets]    = useState([]);
  const [isSidebarOpen,      setIsSidebarOpen]      = useState(false);

  // Add-wallet modal
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [newNickname,     setNewNickname]     = useState('');
  const [newAddress,      setNewAddress]      = useState('');
  const [addError,        setAddError]        = useState('');
  const [addLoading,      setAddLoading]      = useState(false);


  // ── Auth & initial data load ──────────────────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token      = localStorage.getItem('token');
    if (!storedUser || !token) { navigate('/login'); return; }
    setUser(JSON.parse(storedUser));

    fetch(`${API}/api/wallets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.status === 401) { localStorage.clear(); navigate('/login'); return null; } return r.json(); })
      .then(d => { if (Array.isArray(d)) setSavedWallets(d); })
      .catch(console.error);
  }, [navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  // ── Add wallet ────────────────────────────────────────────────────────────
  const handleAddWallet = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!newNickname.trim() || !newAddress.trim()) { setAddError('Both fields are required.'); return; }
    setAddLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API}/api/wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nickname: newNickname.trim(), address: newAddress.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error || 'Failed to add wallet.'); return; }
      setSavedWallets(data);
      setNewNickname(''); setNewAddress(''); setShowAddModal(false);
    } catch { setAddError('Cannot reach server.'); }
    finally { setAddLoading(false); }
  };

  // ── Remove wallet ─────────────────────────────────────────────────────────
  const handleRemoveWallet = async (address) => {
    if (!window.confirm('Remove this wallet from your profile?')) return;
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API}/api/wallets/${address}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setSavedWallets(data);
    } catch { console.error('Remove wallet error'); }
  };


  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/dashboard"
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* ── Main ── */}
      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">

          {/* Header */}
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}><i className='bx bx-menu' /></div>
            <div className="header-greeting">
              <h1>Hello, {user?.name?.split(' ')[0] || 'User'}!</h1>
              <p>Manage your wallets and view real balances.</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize:'1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <button className="icon-btn"><i className='bx bx-bell' /></button>
              <div className="user-profile">
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4B1D8F&color=fff`} alt="User" />
              </div>
            </div>
          </header>

          {/* ── Wallets Section ── */}
          <div style={{ padding:'2rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
              <div>
                <h2 style={{ margin:0, fontSize:'1.5rem', fontWeight:700 }}>My Wallets</h2>
                <p style={{ margin:'0.25rem 0 0', color:'var(--text-muted)', fontSize:'0.9rem' }}>
                  {savedWallets.length} saved wallet{savedWallets.length !== 1 ? 's' : ''} • Click to view real balance
                </p>
              </div>
              <button className="btn-primary" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }} onClick={() => { setShowAddModal(true); setAddError(''); }}>
                <i className='bx bx-plus' /> Add Wallet
              </button>
            </div>

            {/* Wallet grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1.25rem' }}>

              {savedWallets.map(w => {
                const style = getWS(w.nickname);
                return (
                  <div key={w._id || w.address} style={{ position:'relative' }}>
                    {/* Remove button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveWallet(w.address); }}
                      title="Remove wallet"
                      style={{ position:'absolute', top:'0.75rem', right:'0.75rem', zIndex:2, background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'8px', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'0.9rem' }}
                    >
                      <i className='bx bx-trash' />
                    </button>

                    {/* Card */}
                    <div
                      className="glass-panel"
                      onClick={() => navigate('/wallet/' + w.address)}
                      style={{ border:`1px solid ${style.border}33`, borderRadius:'16px', padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem', cursor:'pointer', transition:'transform 0.2s,box-shadow 0.2s', background: theme === 'dark' ? 'var(--glass-bg, rgba(255,255,255,0.05))' : '#FFFFFF' }}
                      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 8px 24px ${style.border}44`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
                    >
                      <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                        <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:style.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>
                          {getIcon(w.nickname)}
                        </div>
                        <div style={{ minWidth:0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                          <div>
                            <h3 style={{ margin:0, fontSize:'1rem', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{w.nickname}</h3>
                            <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-muted)', fontFamily:'monospace' }}>{fmt(w.address)}</p>
                          </div>
                          {w.address.toLowerCase() === web3Address?.toLowerCase() && (
                            <span style={{ fontSize:'0.65rem', background:'rgba(74,222,128,0.15)', color:'#4ade80', border:'1px solid #4ade8066', borderRadius:'20px', padding:'0.15rem 0.4rem', whiteSpace:'nowrap' }}>● Live</span>
                          )}
                        </div>
                      </div>
                      <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div>
                          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-muted)' }}>Click to view balance</p>
                        </div>
                        <span style={{ background:`${style.border}22`, color:style.border, padding:'0.3rem 0.7rem', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600 }}>
                          <i className='bx bx-link-external' /> View
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Web3 live card (only if NOT saved in DB) */}
              {isConnected && !savedWallets.some(w => w.address.toLowerCase() === web3Address?.toLowerCase()) && (
                <div style={{ position:'relative' }}>
                  {/* Save to Profile button */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const token = localStorage.getItem('token');
                        const res = await fetch(`${API}/api/wallets`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ nickname: 'Web3 Wallet', address: web3Address })
                        });
                        const data = await res.json();
                        if (res.ok) setSavedWallets(data);
                        else alert(data.error || 'Failed to save wallet');
                      } catch { alert('Cannot reach server.'); }
                    }}
                    style={{ position:'absolute', top:'-12px', right:'-12px', zIndex:2, background:'var(--primary)', color:'#fff', border:'none', borderRadius:'20px', padding:'0.4rem 0.8rem', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', boxShadow:'0 4px 12px rgba(123,63,191,0.4)', transition:'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform=''}
                  >
                    <i className='bx bx-save' /> Save to Profile
                  </button>

                  <div
                    className="glass-panel"
                    onClick={() => navigate('/wallet/' + web3Address)}
                    style={{ border:`1px solid #7B3FBF33`, borderRadius:'16px', padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem', cursor:'pointer', transition:'transform 0.2s,box-shadow 0.2s', background: theme === 'dark' ? 'var(--glass-bg, rgba(255,255,255,0.05))' : '#FFFFFF' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 8px 24px #7B3FBF44`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                      <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'linear-gradient(135deg,#7B3FBF,#4B1D8F)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>💎</div>
                      <div style={{ minWidth:0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <div>
                          <h3 style={{ margin:0, fontSize:'1rem', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>MetaMask (Live)</h3>
                          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-muted)', fontFamily:'monospace' }}>{fmt(web3Address)}</p>
                        </div>
                        <span style={{ fontSize:'0.65rem', background:'rgba(74,222,128,0.15)', color:'#4ade80', border:'1px solid #4ade8066', borderRadius:'20px', padding:'0.15rem 0.4rem', whiteSpace:'nowrap' }}>● Live</span>
                      </div>
                    </div>
                    <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-muted)' }}>Click to view balance</p>
                      </div>
                      <span style={{ background:`#7B3FBF22`, color:'#7B3FBF', padding:'0.3rem 0.7rem', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600 }}>
                        <i className='bx bx-link-external' /> View
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!isConnected && (
                <div
                  onClick={connect}
                  style={{ border:'2px dashed #7B3FBF', borderRadius:'16px', padding:'1.5rem', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.75rem', cursor:'pointer', minHeight:'160px', opacity:0.75, transition:'opacity 0.2s,transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity='0.75'; e.currentTarget.style.transform=''; }}
                >
                  <i className='bx bx-link-alt' style={{ fontSize:'2rem', color:'#a78bfa' }} />
                  <p style={{ margin:0, fontWeight:600, color:'#a78bfa' }}>Connect Web3 Wallet</p>
                  <p style={{ margin:0, fontSize:'0.78rem', color:'var(--text-muted)', textAlign:'center' }}>MetaMask or any browser wallet</p>
                </div>
              )}
            </div>

            {savedWallets.length === 0 && !isConnected && (
              <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-muted)' }}>
                <i className='bx bx-wallet' style={{ fontSize:'3.5rem', marginBottom:'1rem', display:'block', opacity:0.3 }} />
                <p>No wallets saved yet. Click <strong>Add Wallet</strong> to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ════════════════════════════════════════════
          ADD WALLET MODAL
      ════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth:'460px' }}>
            <div className="modal-header">
              <h3><i className='bx bx-wallet-alt' /> Add Wallet</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><i className='bx bx-x' /></button>
            </div>
            <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', margin:'0 0 1.5rem' }}>
              Enter a nickname and the Ethereum wallet address you want to track.
            </p>
            <form onSubmit={handleAddWallet} className="modal-form">
              <div className="form-group">
                <label>Select Wallet</label>
                <select
                  value={newNickname}
                  onChange={e => setNewNickname(e.target.value)}
                  style={{ width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid var(--border)', background:'var(--glass-bg,rgba(255,255,255,0.05))', color:'var(--text-color)', fontSize:'0.95rem' }}
                  required
                >
                  <option value="" disabled>Choose a wallet...</option>
                  {Object.keys(WALLET_ICONS).filter(k => k !== 'Web3 Wallet').map(k => (
                    <option key={k} value={k}>{WALLET_ICONS[k]} {k}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ethereum Wallet Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  style={{ fontFamily:'monospace', fontSize:'0.9rem' }}
                  required
                />
              </div>
              {addError && (
                <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'8px', padding:'0.75rem 1rem', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <i className='bx bx-error-circle' /> {addError}
                </div>
              )}
              <button type="submit" className="btn-primary" style={{ width:'100%', marginTop:'0.5rem' }} disabled={addLoading}>
                {addLoading ? 'Saving…' : 'Save Wallet'}
              </button>
            </form>
          </div>
        </div>
      )}



    </div>
  );
};

export default Dashboard;
