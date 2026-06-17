import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import { useBalance } from 'wagmi';
import { useTheme } from '../context/ThemeContext';

const WALLET_ICONS = {
  MetaMask: '🦊',
  KuCoin: '🔵',
  Kraken: '🐙',
  Coinbase: '🔷',
  'Trust Wallet': '🛡️',
  Binance: '🟡',
  OKX: '⚫',
  'Web3 Wallet': '💎',
};

const WALLET_COLORS = {
  MetaMask: { bg: 'linear-gradient(135deg, #E2761B, #CD6116)', border: '#E2761B' },
  KuCoin: { bg: 'linear-gradient(135deg, #23AF91, #1A8A70)', border: '#23AF91' },
  Kraken: { bg: 'linear-gradient(135deg, #5741D9, #3D2EBF)', border: '#5741D9' },
  Coinbase: { bg: 'linear-gradient(135deg, #0052FF, #003DB3)', border: '#0052FF' },
  'Trust Wallet': { bg: 'linear-gradient(135deg, #3375BB, #1A5A9A)', border: '#3375BB' },
  Binance: { bg: 'linear-gradient(135deg, #F3BA2F, #D4A017)', border: '#F3BA2F' },
  OKX: { bg: 'linear-gradient(135deg, #1E88E5, #0D47A1)', border: '#1E88E5' },
  'Web3 Wallet': { bg: 'linear-gradient(135deg, #7B3FBF, #4B1D8F)', border: '#7B3FBF' },
};

const getWalletStyle = (name) =>
  WALLET_COLORS[name] || { bg: 'linear-gradient(135deg, #4B1D8F, #7B3FBF)', border: '#7B3FBF' };

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountAddress, setNewAccountAddress] = useState('');
  const [user, setUser] = useState(null);
  const [addError, setAddError] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null); // null = wallet list view

  // Send modal state
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendData, setSendData] = useState({ targetAddress: '', amount: '' });
  const [isCheckingRisk, setIsCheckingRisk] = useState(false);
  const [aiRiskResult, setAiRiskResult] = useState(null);

  const { address, isConnected, connect, disconnect } = useWeb3Auth();
  const { data: balanceData } = useBalance({ address });
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetch('http://localhost:5000/api/user/accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            return null;
          }
          return res.json();
        })
        .then(data => { if (data && Array.isArray(data)) setAccounts(data); })
        .catch(err => console.error('Error fetching accounts:', err));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAddWallet = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!newAccountName.trim() || !newAccountAddress.trim()) {
      setAddError('Please fill in all fields.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setAddError('You are not logged in. Please log in again.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/user/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newAccountName, address: newAccountAddress })
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      const data = await response.json();
      console.log('Add wallet response:', response.status, data);
      if (response.ok) {
        setAccounts(data);
        setNewAccountName('');
        setNewAccountAddress('');
        setAddError('');
        setIsModalOpen(false);
      } else {
        setAddError(data.error || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving account:', error);
      setAddError('Could not reach the server. Is the backend running?');
    }
  };

  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet);
  };

  const handleSelectWeb3 = () => {
    if (!isConnected) {
      connect();
    } else {
      setSelectedWallet({ name: 'Web3 Wallet', address, isWeb3: true });
    }
  };

  const handleDisconnectWallet = () => {
    if (selectedWallet?.isWeb3) disconnect();
    setSelectedWallet(null);
  };

  const handleSendClick = () => {
    setIsSendModalOpen(true);
    setAiRiskResult(null);
    setSendData({ targetAddress: '', amount: '' });
  };

  const handleSendSubmit = async (e) => {
    e.preventDefault();
    setIsCheckingRisk(true);
    setAiRiskResult(null);
    const buyerWallet = selectedWallet?.address || '0x000';
    try {
      const response = await fetch('http://localhost:5000/api/v1/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerWallet, targetContract: sendData.targetAddress, valueRequested: sendData.amount })
      });
      const data = await response.json();
      setAiRiskResult(data);
    } catch {
      setAiRiskResult({ error: 'Failed to connect to AI engine.' });
    } finally {
      setIsCheckingRisk(false);
    }
  };

  // After Web3 connect, auto-open the wallet detail view
  useEffect(() => {
    if (isConnected && selectedWallet?.isWeb3) {
      setSelectedWallet({ name: 'Web3 Wallet', address, isWeb3: true });
    }
  }, [isConnected, address]);

  const walletStyle = selectedWallet ? getWalletStyle(selectedWallet.name) : {};

  return (
    <div className="dashboard-layout">
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', width: '100%' }}>
          <div className="sidebar-logo" style={{ marginBottom: 0 }}>
            <i className='bx bx-link'></i> Pay<span>Chain</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
            <i className='bx bx-x'></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="active" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-grid-alt'></i> Overview</Link>
          <Link to="/transfers" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-transfer'></i> Transfers</Link>
          <Link to="/cards" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-credit-card'></i> Cards</Link>
          <Link to="/statistics" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-line-chart'></i> Statistics</Link>
          <Link to="/settings" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-cog'></i> Settings</Link>
          <Link to="/support" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-help-circle'></i> Support</Link>

          {user?.isAdmin && (
            <>
              <div style={{ padding: '1rem 1rem 0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin</div>
              <Link to="/admin/users" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-user-circle'></i> Users</Link>
              <Link to="/admin/support" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-message-square-detail'></i> Tickets</Link>
            </>
          )}
        </nav>
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleLogout}>
            <i className='bx bx-log-out'></i> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
              <i className='bx bx-menu'></i>
            </div>
            <div className="header-greeting">
              {selectedWallet ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <button
                      onClick={() => setSelectedWallet(null)}
                      style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}
                    >
                      <i className='bx bx-arrow-back'></i>
                    </button>
                    <div>
                      <h1 style={{ margin: 0, fontSize: '1.6rem', lineHeight: '1.2' }}>{selectedWallet.name}</h1>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Wallet Overview</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h1>Hello, {user ? user.name.split(' ')[0] : 'User'}!</h1>
                  <p>Here's your financial overview for today.</p>
                </>
              )}
            </div>
            <div className="header-actions">
              <button
                className="icon-btn"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                style={{ fontSize: '1.2rem' }}
              >
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`}></i>
              </button>
              <button className="icon-btn"><i className='bx bx-bell'></i></button>
              <div className="user-profile">
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user ? user.name.replace(' ', '+') : 'User'}&background=4B1D8F&color=fff`} alt="User" />
              </div>
            </div>
          </header>

          {/* ─── WALLET LIST VIEW ─── */}
          {!selectedWallet && (
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>My Wallets</h2>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {accounts.length + (isConnected ? 1 : 0)} wallet{accounts.length + (isConnected ? 1 : 0) !== 1 ? 's' : ''} connected
                  </p>
                </div>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsModalOpen(true)}>
                  <i className='bx bx-plus'></i> Add Wallet
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>

                {/* Manual wallet cards */}
                {accounts.map(acc => {
                  const ws = getWalletStyle(acc.name);
                  return (
                    <div
                      key={acc._id || acc.id}
                      onClick={() => handleSelectWallet({ ...acc, isWeb3: false })}
                      style={{
                        background: 'var(--glass-bg, rgba(255,255,255,0.05))',
                        border: `1px solid ${ws.border}33`,
                        borderRadius: '16px',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${ws.border}33`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: ws.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                          {WALLET_ICONS[acc.name] || '💳'}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{acc.name}</h3>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {acc.address ? `${acc.address.slice(0, 10)}...${acc.address.slice(-6)}` : 'Manual Account'}
                          </p>
                        </div>
                      </div>
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Balance</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '1.3rem', fontWeight: 700, color: ws.border }}>{acc.balance || '$0.00'}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Web3 connected wallet card */}
                {isConnected && (
                  <div
                    onClick={() => setSelectedWallet({ name: 'Web3 Wallet', address, isWeb3: true })}
                    style={{
                      background: 'linear-gradient(135deg, rgba(75,29,143,0.25), rgba(123,63,191,0.1))',
                      border: '2px solid #7B3FBF',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(123,63,191,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #7B3FBF, #4B1D8F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                          💎
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Web3 Wallet</h3>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{address?.slice(0, 10)}...{address?.slice(-6)}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid #4ade80', borderRadius: '20px', padding: '0.2rem 0.6rem' }}>Live</span>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Balance</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '1.3rem', fontWeight: 700, color: '#a78bfa' }}>
                        {balanceData ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : '0.0000 ETH'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Connect Web3 card */}
                {!isConnected && (
                  <div
                    onClick={handleSelectWeb3}
                    style={{ border: '2px dashed #7B3FBF', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', minHeight: '160px', opacity: 0.8, transition: 'opacity 0.2s, transform 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0.8; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <i className='bx bx-link-alt' style={{ fontSize: '2rem', color: '#a78bfa' }}></i>
                    <p style={{ margin: 0, fontWeight: 600, color: '#a78bfa' }}>Connect Web3 Wallet</p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>MetaMask or any browser wallet</p>
                  </div>
                )}

              </div>

              {accounts.length === 0 && !isConnected && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <i className='bx bx-wallet' style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'block', opacity: 0.3 }}></i>
                  <p>No wallets yet. Click <strong>Add Wallet</strong> to get started.</p>
                </div>
              )}
            </div>
          )}

          {/* ─── WALLET DETAIL VIEW ─── */}
          {selectedWallet && (
            <div className="dashboard-grid">

              {/* Balance Card */}
              <div className="dashboard-balance-card glass-panel dark-panel" style={{ background: walletStyle.bg, display: 'flex', flexDirection: 'column' }}>
                <div className="card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.9 }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500, margin: 0 }}>Total Balance</p>
                  <span style={{ fontSize: '1.5rem', background: 'rgba(255,255,255,0.2)', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {WALLET_ICONS[selectedWallet.name] || '💳'}
                  </span>
                </div>
                <h2 style={{ fontSize: '2.8rem', fontWeight: 700, margin: '1.5rem 0', letterSpacing: '-0.5px', color: '#ffffff' }}>
                  {selectedWallet.isWeb3
                    ? (balanceData?.formatted ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : 'Loading...')
                    : selectedWallet.balance || '$0.00'}
                </h2>
                <div className="card-bottom" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 500 }}>
                    <i className='bx bx-wallet' style={{ opacity: 0.7 }}></i>
                    {selectedWallet.address
                      ? `${selectedWallet.address.slice(0, 10)}...${selectedWallet.address.slice(-6)}`
                      : selectedWallet.name}
                  </span>
                  <button
                    onClick={handleDisconnectWallet}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '8px', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)' }}
                    onMouseOut={(e) => { e.target.style.background = 'transparent' }}
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions glass-panel">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button className="action-btn" onClick={handleSendClick}>
                    <div className="icon-wrapper"><i className='bx bx-send'></i></div>
                    <span>Send</span>
                  </button>
                  <button className="action-btn">
                    <div className="icon-wrapper"><i className='bx bx-download'></i></div>
                    <span>Receive</span>
                  </button>
                  <button className="action-btn">
                    <div className="icon-wrapper"><i className='bx bx-plus'></i></div>
                    <span>Top Up</span>
                  </button>
                  <button className="action-btn">
                    <div className="icon-wrapper"><i className='bx bx-qr-scan'></i></div>
                    <span>Scan</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity glass-panel" style={{ gridColumn: '1 / -1' }}>
                <div className="section-header">
                  <h3>Recent Activity</h3>
                  <a href="#" className="view-all">View All</a>
                </div>
                <div className="transaction-list">
                  <div className="transaction-item">
                    <div className="t-icon bg-primary-light"><i className='bx bx-coffee'></i></div>
                    <div className="t-details"><h4>Starbucks</h4><p>Today, 09:41 AM</p></div>
                    <div className="t-amount negative">-$4.50</div>
                  </div>
                  <div className="transaction-item">
                    <div className="t-icon bg-success-light"><i className='bx bx-briefcase'></i></div>
                    <div className="t-details"><h4>Upwork Escrow</h4><p>Yesterday, 02:30 PM</p></div>
                    <div className="t-amount positive">+$1,200.00</div>
                  </div>
                  <div className="transaction-item">
                    <div className="t-icon bg-primary-light"><i className='bx bx-shopping-bag'></i></div>
                    <div className="t-details"><h4>Amazon</h4><p>Nov 12, 11:20 AM</p></div>
                    <div className="t-amount negative">-$49.99</div>
                  </div>
                  <div className="transaction-item">
                    <div className="t-icon bg-success-light"><i className='bx bx-transfer'></i></div>
                    <div className="t-details"><h4>Transfer from Muzamil</h4><p>Nov 10, 08:15 AM</p></div>
                    <div className="t-amount positive">+$250.00</div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Add Wallet Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Wallet</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><i className='bx bx-x'></i></button>
            </div>
            <form onSubmit={handleAddWallet} className="modal-form">
              <div className="form-group">
                <label>Select Exchange / Wallet</label>
                <select value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} required>
                  <option value="" disabled>Select an option</option>
                  <option value="Coinbase">Coinbase</option>
                  <option value="KuCoin">KuCoin</option>
                  <option value="Kraken">Kraken</option>
                  <option value="MetaMask">MetaMask</option>
                  <option value="Trust Wallet">Trust Wallet</option>
                  <option value="Binance">Binance</option>
                  <option value="OKX">OKX</option>
                </select>
              </div>
              <div className="form-group">
                <label>Wallet Address</label>
                <input type="text" placeholder="0x..." value={newAccountAddress} onChange={(e) => setNewAccountAddress(e.target.value)} required />
              </div>
              {addError && (
                <div style={{ background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.4)', color: '#ff4d4f', borderRadius: '8px', padding: '0.7rem 1rem', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <i className='bx bx-error-circle'></i> {addError}
                </div>
              )}
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Add Wallet</button>
            </form>
          </div>
        </div>
      )}

      {/* Send Transaction Modal */}
      {isSendModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSendModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Funds</h3>
              <button className="close-btn" onClick={() => setIsSendModalOpen(false)}><i className='bx bx-x'></i></button>
            </div>
            {!aiRiskResult ? (
              <form onSubmit={handleSendSubmit} className="modal-form">
                <div className="form-group">
                  <label>Recipient Address / Contract</label>
                  <input type="text" placeholder="0x..." value={sendData.targetAddress} onChange={(e) => setSendData({ ...sendData, targetAddress: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input type="number" step="0.0001" placeholder="Enter amount" value={sendData.amount} onChange={(e) => setSendData({ ...sendData, amount: e.target.value })} required />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isCheckingRisk}>
                  {isCheckingRisk ? 'Analyzing Risk...' : 'Verify Transaction'}
                </button>
              </form>
            ) : (
              <div className="ai-risk-results" style={{ marginTop: '1rem' }}>
                {aiRiskResult.error ? (
                  <div style={{ padding: '1rem', background: 'rgba(255,0,0,0.1)', borderLeft: '4px solid #ff4d4f', borderRadius: '4px' }}>
                    <h4 style={{ color: '#ff4d4f', margin: '0 0 0.5rem 0' }}><i className='bx bx-error-circle'></i> Error</h4>
                    <p style={{ margin: 0, color: '#ccc', fontSize: '0.9rem' }}>{aiRiskResult.error}</p>
                  </div>
                ) : (
                  <>
                    <div style={{ padding: '1rem', background: aiRiskResult.merchantAction === 'REJECT' ? 'rgba(255,0,0,0.1)' : aiRiskResult.merchantAction === 'WARN_USER' ? 'rgba(255,165,0,0.1)' : 'rgba(0,255,0,0.1)', borderLeft: `4px solid ${aiRiskResult.merchantAction === 'REJECT' ? '#ff4d4f' : aiRiskResult.merchantAction === 'WARN_USER' ? '#ffa500' : '#00ff00'}`, borderRadius: '4px', marginBottom: '1rem' }}>
                      <h4 style={{ color: aiRiskResult.merchantAction === 'REJECT' ? '#ff4d4f' : aiRiskResult.merchantAction === 'WARN_USER' ? '#ffa500' : '#00ff00', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className={`bx ${aiRiskResult.merchantAction === 'REJECT' ? 'bx-block' : aiRiskResult.merchantAction === 'WARN_USER' ? 'bx-error' : 'bx-check-shield'}`}></i>
                        {aiRiskResult.merchantAction === 'REJECT' ? 'Transaction Blocked' : aiRiskResult.merchantAction === 'WARN_USER' ? 'Risk Warning' : 'Transaction Safe'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}>Risk: <strong>{aiRiskResult.riskCategory}</strong> ({aiRiskResult.riskScore}/100)</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsSendModalOpen(false)}>Cancel</button>
                      <button className="btn-primary" style={{ flex: 1, opacity: aiRiskResult.merchantAction === 'REJECT' ? 0.5 : 1 }} disabled={aiRiskResult.merchantAction === 'REJECT'} onClick={() => { alert('Transaction proceeded!'); setIsSendModalOpen(false); }}>
                        {aiRiskResult.merchantAction === 'REJECT' ? 'Blocked' : 'Proceed'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;

