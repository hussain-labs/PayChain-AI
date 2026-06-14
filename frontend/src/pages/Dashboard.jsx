import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Binance', type: 'bitcoin', wallets: 2, balance: '$45,200.00', bgColor: '#FCD535', color: '#000' },
    { id: 2, name: 'OKX', type: 'wallet', wallets: 1, balance: '$12,850.50', bgColor: '#000000', color: '#fff' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleConnect = (e) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    const newAccount = {
      id: Date.now(),
      name: newAccountName,
      type: 'wallet',
      wallets: 1,
      balance: '$0.00',
      bgColor: '#4B1D8F',
      color: '#fff'
    };

    setAccounts([...accounts, newAccount]);
    setNewAccountName('');
    setIsModalOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <i className='bx bx-link'></i> Pay<span>Chain</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="active"><i className='bx bx-grid-alt'></i> Overview</Link>
          <Link to="/transfers"><i className='bx bx-transfer'></i> Transfers</Link>
          <Link to="/cards"><i className='bx bx-credit-card'></i> Cards</Link>
          <Link to="/statistics"><i className='bx bx-line-chart'></i> Statistics</Link>
          <Link to="/settings"><i className='bx bx-cog'></i> Settings</Link>
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
            <div className="header-greeting">
              <h1>Hello, {user ? user.name.split(' ')[0] : 'User'}! 👋</h1>
              <p>Here's your financial overview for today.</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn"><i className='bx bx-bell'></i></button>
              <div className="user-profile">
                <img src={`https://ui-avatars.com/api/?name=${user ? user.name.replace(' ', '+') : 'User'}&background=4B1D8F&color=fff`} alt="User" />
              </div>
            </div>
          </header>

          {/* Dashboard Grid */}
          <div className="dashboard-grid">

            {/* Main Balance Card */}
            <div className="dashboard-balance-card glass-panel dark-panel">
              <div className="card-top">
                <p>Total Balance</p>
                <i className='bx bx-dots-horizontal-rounded'></i>
              </div>
              <h2>$124,560.00</h2>
              <div className="card-bottom">
                <span><i className='bx bx-trending-up'></i> +$2,500 this week</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions glass-panel">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-btn">
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

            {/* Connected Accounts */}
            <div className="connected-accounts glass-panel" style={{ gridColumn: '1 / -1' }}>
              <div className="section-header">
                <h3>Connected Accounts</h3>
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => setIsModalOpen(true)}><i className='bx bx-plus'></i> Connect</button>
              </div>
              <div className="accounts-list">

                {accounts.map(acc => (
                  <div key={acc.id} className="account-card">
                    <div className="account-icon" style={{ background: acc.bgColor, color: acc.color }}>
                      <i className={`bx bx-${acc.type}`}></i>
                    </div>
                    <div className="account-info">
                      <h4>{acc.name}</h4>
                      <p>Connected • {acc.wallets} Wallet{acc.wallets > 1 ? 's' : ''}</p>
                    </div>
                    <div className="account-balance">
                      {acc.balance}
                    </div>
                  </div>
                ))}

                <div className="account-card connect-new" onClick={() => setIsModalOpen(true)}>
                  <i className='bx bx-link-alt'></i>
                  <span>Connect Exchange / Wallet</span>
                </div>

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
                  <div className="t-icon bg-primary-light">
                    <i className='bx bx-coffee'></i>
                  </div>
                  <div className="t-details">
                    <h4>Starbucks</h4>
                    <p>Today, 09:41 AM</p>
                  </div>
                  <div className="t-amount negative">-$4.50</div>
                </div>
                <div className="transaction-item">
                  <div className="t-icon bg-success-light">
                    <i className='bx bx-briefcase'></i>
                  </div>
                  <div className="t-details">
                    <h4>Upwork Escrow</h4>
                    <p>Yesterday, 02:30 PM</p>
                  </div>
                  <div className="t-amount positive">+$1,200.00</div>
                </div>
                <div className="transaction-item">
                  <div className="t-icon bg-primary-light">
                    <i className='bx bx-shopping-bag'></i>
                  </div>
                  <div className="t-details">
                    <h4>Amazon</h4>
                    <p>Nov 12, 11:20 AM</p>
                  </div>
                  <div className="t-amount negative">-$49.99</div>
                </div>
                <div className="transaction-item">
                  <div className="t-icon bg-success-light">
                    <i className='bx bx-transfer'></i>
                  </div>
                  <div className="t-details">
                    <h4>Transfer from Muzamil</h4>
                    <p>Nov 10, 08:15 AM</p>
                  </div>
                  <div className="t-amount positive">+$250.00</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Connect New Account</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><i className='bx bx-x'></i></button>
            </div>
            <form onSubmit={handleConnect} className="modal-form">
              <div className="form-group">
                <label>Select Exchange / Wallet</label>
                <select value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} required>
                  <option value="" disabled>Select an option</option>
                  <option value="Coinbase">Coinbase</option>
                  <option value="KuCoin">KuCoin</option>
                  <option value="Kraken">Kraken</option>
                  <option value="MetaMask">MetaMask</option>
                  <option value="Trust Wallet">Trust Wallet</option>
                </select>
              </div>
              <div className="form-group">
                <label>API Key / Wallet Address</label>
                <input type="text" placeholder="Enter key or address" required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Connect Account
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
