import UserProfilePopup from '../components/UserProfilePopup';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import AppSidebar from '../components/AppSidebar';
import ConfirmModal from '../components/ConfirmModal';
import QRScannerModal from '../components/QRScannerModal';
import TopUpModal from '../components/TopUpModal';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';
const fmt = (addr) => addr ? `${addr.slice(0,8)}…${addr.slice(-6)}` : '';

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
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

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

    // Fetch history
    fetch(`${API}/api/wallets/${address}/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(console.error);

  }, [address, navigate]);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleDisconnect = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API}/api/wallets/${address}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Wallet removed");
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      toast.error('Failed to remove wallet');
    } finally {
      setShowDisconnectConfirm(false);
    }
  };

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
        <div className="dashboard-content-wrapper fade-in">
          
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}><i className='bx bx-menu' /></div>
            <div className="header-greeting" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/dashboard" className="wo-back-btn"><i className='bx bx-left-arrow-alt' /></Link>
              <div>
                <h1>{walletDetail?.nickname || (address.toLowerCase() === web3Address?.toLowerCase() ? 'Web3 Wallet' : 'Wallet')}</h1>
                <p>Wallet Overview</p>
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize:'1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <button className="icon-btn"><i className='bx bx-bell' /></button>
              <UserProfilePopup user={user} />
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
                <button className="wo-disconnect" onClick={() => setShowDisconnectConfirm(true)}>Disconnect</button>
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
                <div className="wo-action-item" style={{ cursor: 'pointer' }} onClick={() => setShowReceiveModal(true)}>
                  <div className="wo-action-icon" style={{ background: wStyle.border }}><i className='bx bx-download' /></div>
                  <span>Receive</span>
                </div>
                <div className="wo-action-item" style={{ cursor: 'pointer' }} onClick={() => setShowTopUp(true)}>
                  <div className="wo-action-icon" style={{ background: wStyle.border }}><i className='bx bx-plus' /></div>
                  <span>Top Up</span>
                </div>
                <div className="wo-action-item" style={{ cursor: 'pointer' }} onClick={() => setShowScanner(true)}>
                  <div className="wo-action-icon" style={{ background: wStyle.border }}><i className='bx bx-scan' /></div>
                  <span>Scan</span>
                </div>
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
              {history.length === 0 && !loading && (
                <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>No recent transactions found on Sepolia Testnet.</div>
              )}
              {loading && <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>Loading history...</div>}
              {history.map((tx, i) => (
                <div className="wo-activity-item" key={tx.id || i}>
                  <div className="wo-activity-info">
                    <div className="wo-activity-icon" style={{ background: tx.isReceive ? '#10b981' : '#8b5cf6' }}>
                      <i className={tx.isReceive ? 'bx bx-down-arrow-alt' : 'bx bx-up-arrow-alt'} />
                    </div>
                    <div className="wo-activity-details">
                      <h4>{tx.isReceive ? 'Received' : 'Sent'} {tx.symbol}</h4>
                      <p>{new Date(tx.timestamp).toLocaleString()} • {tx.isReceive ? 'From: ' : 'To: '} {fmt(tx.isReceive ? tx.from : tx.to)}</p>
                    </div>
                  </div>
                  <div className="wo-activity-amount" style={{ color: tx.isReceive ? '#10b981' : 'inherit' }}>
                    {tx.isReceive ? '+' : '-'}{tx.value.toFixed(4)} {tx.symbol}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <ConfirmModal 
        isOpen={showDisconnectConfirm}
        title="Disconnect Wallet"
        message={`Are you sure you want to remove ${activeName} from your account? You will lose access to its fast-checkout features.`}
        onConfirm={handleDisconnect}
        onCancel={() => setShowDisconnectConfirm(false)}
        confirmText="Yes, Disconnect"
        isDanger={true}
      />

      {/* Receive Modal */}
      {showReceiveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--modal-overlay)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: 'var(--modal-bg)', border: '1px solid var(--modal-border)', borderRadius: '24px', padding: '2.5rem', width: '90%', maxWidth: '400px', textAlign: 'center', position: 'relative', boxShadow: 'var(--modal-shadow)', animation: 'slideUp 0.3s ease' }}>
            <button 
              onClick={() => setShowReceiveModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', transition: '0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-color)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <i className='bx bx-x' />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', color: 'var(--text-color)' }}>Receive Funds</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Scan this QR code or copy the address below to receive assets.</p>
            
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '16px', display: 'inline-block', marginBottom: '2rem', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`} alt="QR Code" style={{ display: 'block', borderRadius: '8px' }} />
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-color)', wordBreak: 'break-all', textAlign: 'left' }}>{address}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  toast.success("Address copied to clipboard!");
                }}
                style={{ background: 'var(--primary)', border: 'none', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: '0.2s', flexShrink: 0 }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <i className='bx bx-copy' style={{ fontSize: '1.2rem' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
        walletAddress={address}
      />

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onAddressFound={(scannedAddress) => {
          setShowScanner(false);
          navigate(`/transfers?to=${encodeURIComponent(scannedAddress)}`);
        }}
      />
    </div>
  );
};

export default WalletOverview;
