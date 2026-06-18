import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import AppSidebar from '../components/AppSidebar';

const API = 'http://localhost:5000';

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
  if (!name) return { bg: 'linear-gradient(135deg,#20B2AA,#1A8A70)', border: '#20B2AA' };
  const n = name.toLowerCase();
  if (n.includes('meta') || n.includes('mask')) return WALLET_COLORS['MetaMask'];
  if (n.includes('kucoin')) return WALLET_COLORS['KuCoin'];
  if (n.includes('kraken')) return WALLET_COLORS['Kraken'];
  if (n.includes('coinbase')) return WALLET_COLORS['Coinbase'];
  if (n.includes('trust')) return WALLET_COLORS['Trust Wallet'];
  if (n.includes('binance')) return WALLET_COLORS['Binance'];
  if (n.includes('okx')) return WALLET_COLORS['OKX'];
  return { bg: 'linear-gradient(135deg,#7B3FBF,#4B1D8F)', border: '#7B3FBF' };
};
const WalletOverview = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { address: web3Address } = useWeb3Auth();

  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [walletDetail, setWalletDetail] = useState(null); // nickname etc
  const [assets, setAssets] = useState(null);
  const [loading, setLoading] = useState(true);

  const activeName = walletDetail?.nickname || (address.toLowerCase() === web3Address?.toLowerCase() ? 'MetaMask' : '');
  const wStyle = getWS(activeName);

  // ── Auth & Data Load ──────────────────────────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) { navigate('/login'); return; }
    setUser(JSON.parse(storedUser));

    // Fetch user wallets to get the nickname
    fetch(`${API}/api/wallets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(wallets => {
        if (Array.isArray(wallets)) {
          const w = wallets.find(w => w.address.toLowerCase() === address.toLowerCase());
          if (w) setWalletDetail(w);
        }
      })
      .catch(console.error);

    // Fetch assets
    fetch(`${API}/api/wallets/${address}/assets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setAssets(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

  }, [address, navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect and remove this wallet?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API}/api/wallets/${address}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      alert('Failed to remove wallet');
    }
  };

  // Mock Activity
  const activities = [
    { name: 'Starbucks', time: 'Today, 09:41 AM', amount: '-$4.50', icon: 'bx bx-coffee', color: '#8b5cf6' },
    { name: 'Upwork Escrow', time: 'Yesterday, 02:30 PM', amount: '+$1,200.00', icon: 'bx bx-briefcase', color: '#10b981', positive: true },
    { name: 'Amazon', time: 'Nov 12, 11:20 AM', amount: '-$49.99', icon: 'bx bx-shopping-bag', color: '#8b5cf6' },
    { name: 'Transfer from Muzamil', time: 'Nov 10, 08:15 AM', amount: '+$250.00', icon: 'bx bx-transfer', color: '#10b981', positive: true },
  ];

  return (
    <div className="dashboard-layout wallet-overview-page fade-in">
      {/* Dynamic CSS for this page specifically to match mockup */}
      <style>{`
        .wallet-overview-page { background: var(--bg-color); }
        .wo-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
        .wo-title-group { display: flex; align-items: center; gap: 1rem; }
        .wo-back-btn { width: 40px; height: 40px; border-radius: 10px; background: rgba(123, 63, 191, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; cursor: pointer; text-decoration: none; transition: 0.2s; }
        .wo-back-btn:hover { background: rgba(123, 63, 191, 0.2); }
        
        .wo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr)); gap: 2rem; margin-bottom: 2rem; }
        
        /* Dynamic Colored Card */
        .wo-balance-card { border-radius: 20px; padding: 2.5rem 2rem; color: #fff; display: flex; flex-direction: column; justify-content: space-between; min-height: 240px; position: relative; overflow: hidden; }
        .wo-balance-card::after { content: ''; position: absolute; top: 1.5rem; right: 1.5rem; width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.2); backdrop-filter: blur(5px); }
        .wo-bc-label { font-size: 0.95rem; opacity: 0.9; margin-bottom: 0.5rem; }
        .wo-bc-amount { font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; margin: 0 0 2rem; word-break: break-word; }
        
        .wo-bc-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; background: rgba(0,0,0,0.15); border-radius: 12px; padding: 0.6rem 1rem; backdrop-filter: blur(10px); }
        .wo-bc-address { font-family: monospace; font-size: 0.9rem; opacity: 0.9; display: flex; align-items: center; gap: 0.5rem; word-break: break-all; }
        .wo-disconnect { background: transparent; border: 1px solid rgba(255,255,255,0.4); color: #fff; padding: 0.4rem 1rem; border-radius: 8px; font-size: 0.85rem; cursor: pointer; transition: 0.2s; white-space: nowrap; }
        .wo-disconnect:hover { background: rgba(255,255,255,0.1); border-color: #fff; }
        
        /* Actions Card */
        .wo-actions-card { background: var(--glass-bg); border: 1px solid var(--border); border-radius: 20px; padding: 2rem; height: 100%; display: flex; flex-direction: column; }
        .wo-actions-card h3 { font-size: 1.1rem; margin-top: 0; margin-bottom: 1.5rem; color: var(--text-color); font-weight: 700; }
        .wo-actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 1rem; text-align: center; margin-top: auto; margin-bottom: auto; }
        .wo-action-item { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; text-decoration: none; color: var(--text-color); }
        .wo-action-icon { width: 50px; height: 50px; border-radius: 14px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; transition: transform 0.2s, box-shadow 0.2s, filter 0.2s; }
        .wo-action-item:hover .wo-action-icon { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15); filter: brightness(1.1); }
        .wo-action-item span { font-size: 0.85rem; font-weight: 500; }

        /* Recent Activity */
        .wo-activity-card { background: var(--glass-bg); border: 1px solid var(--border); border-radius: 20px; padding: 2rem; }
        .wo-activity-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .wo-activity-header h3 { font-size: 1.1rem; margin: 0; color: var(--text-color); font-weight: 700; }
        .wo-activity-header a { color: var(--primary); text-decoration: none; font-size: 0.9rem; font-weight: 600; }
        
        .wo-activity-list { display: flex; flex-direction: column; gap: 1rem; }
        .wo-activity-item { display: flex; align-items: center; justify-content: space-between; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
        .wo-activity-item:last-child { border-bottom: none; padding-bottom: 0; }
        .wo-activity-info { display: flex; align-items: center; gap: 1rem; }
        .wo-activity-icon { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: #fff; }
        .wo-activity-details h4 { margin: 0 0 0.25rem; font-size: 0.95rem; color: var(--text-color); }
        .wo-activity-details p { margin: 0; font-size: 0.8rem; color: var(--text-muted); }
        .wo-activity-amount { font-weight: 700; font-size: 1rem; }
      `}</style>

      <AppSidebar
        activeRoute="/dashboard"
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content-wrapper" style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '2rem' }}>
          
          {/* Header */}
          <header className="wo-header">
            <div className="wo-title-group">
              <Link to="/dashboard" className="wo-back-btn"><i className='bx bx-left-arrow-alt' /></Link>
              <div>
                <h1 style={{ fontSize: '1.4rem', margin: '0 0 0.2rem' }}>
                  {walletDetail?.nickname || (address.toLowerCase() === web3Address?.toLowerCase() ? 'MetaMask (Live)' : 'Wallet')}
                </h1>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Wallet Overview</p>
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <button className="icon-btn"><i className='bx bx-bell' /></button>
              <div className="user-profile">
                <span style={{ background: '#5a32a3', color: '#fff', width:'35px', height:'35px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold' }}>
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </header>

          {/* Top Grid */}
          <div className="wo-grid">
            {/* Balance Card */}
            <div className="wo-balance-card" style={{ background: wStyle.bg }}>
              <div>
                <div className="wo-bc-label">Total Balance</div>
                <div className="wo-bc-amount">
                  {loading ? '...' : `$${Number(assets?.totalUsd || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </div>
                {!loading && assets?.eth?.balance && (
                  <div style={{ fontSize: '1.1rem', opacity: 0.9, marginTop: '-1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                    ≈ {parseFloat(assets.eth.balance).toFixed(4)} ETH
                  </div>
                )}
              </div>
              <div className="wo-bc-footer">
                <div className="wo-bc-address">
                  <i className='bx bx-wallet-alt' style={{ fontSize: '1.2rem' }} />
                  {address.slice(0, 10)}...{address.slice(-6)}
                </div>
                <button className="wo-disconnect" onClick={handleDisconnect}>Disconnect</button>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="wo-actions-card">
              <h3>Quick Actions</h3>
              <div className="wo-actions-grid">
                <Link to="/transfers" className="wo-action-item">
                  <div className="wo-action-icon" style={{ background: wStyle.border }}><i className='bx bx-send' /></div>
                  <span>Send</span>
                </Link>
                <Link to="#" className="wo-action-item">
                  <div className="wo-action-icon" style={{ background: wStyle.border }}><i className='bx bx-download' /></div>
                  <span>Receive</span>
                </Link>
                <Link to="#" className="wo-action-item">
                  <div className="wo-action-icon" style={{ background: wStyle.border }}><i className='bx bx-plus' /></div>
                  <span>Top Up</span>
                </Link>
                <Link to="#" className="wo-action-item">
                  <div className="wo-action-icon" style={{ background: wStyle.border }}><i className='bx bx-scan' /></div>
                  <span>Scan</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="wo-activity-card">
            <div className="wo-activity-header">
              <h3>Recent Activity</h3>
              <Link to="/transfers">View All</Link>
            </div>
            <div className="wo-activity-list">
              {activities.map((act, i) => (
                <div className="wo-activity-item" key={i}>
                  <div className="wo-activity-info">
                    <div className="wo-activity-icon" style={{ background: act.color }}>
                      <i className={act.icon} />
                    </div>
                    <div className="wo-activity-details">
                      <h4>{act.name}</h4>
                      <p>{act.time}</p>
                    </div>
                  </div>
                  <div className="wo-activity-amount" style={{ color: act.positive ? '#10b981' : 'var(--text-color)' }}>
                    {act.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default WalletOverview;
