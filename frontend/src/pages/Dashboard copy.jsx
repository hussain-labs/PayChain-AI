import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Basic mock auth check
  useEffect(() => {
    // In a real app, verify token here
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-layout fade-in">
      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

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
          <a href="#" className="active" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-grid-alt'></i> Overview</a>
          <a href="#" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-transfer'></i> Transfers</a>
          <a href="#" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-credit-card'></i> Cards</a>
          <a href="#" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-line-chart'></i> Statistics</a>
          <a href="#" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-cog'></i> Settings</a>
        </nav>
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleLogout}>
            <i className='bx bx-log-out'></i> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content-wrapper">
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
              <i className='bx bx-menu'></i>
            </div>
            <div className="header-greeting">
              <h1>Hello, Alex!</h1>
              
            </div>
            <div className="header-actions">
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize:'1.2rem' }}>
              <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
            </button>
            <button className="icon-btn"><i className='bx bx-bell' /></button>
            <div className="user-profile" style={{ position: 'relative' }}>
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4B1D8F&color=fff`} alt="User" />
              {(user?.plan === 'pro' || user?.plan === 'pro_plus') && (
                <div style={{
                  position: 'absolute', bottom: '-4px', right: '-4px', 
                  background: 'linear-gradient(45deg, #f59e0b, #fbbf24)', 
                  color: '#fff', fontSize: '0.6rem', fontWeight: 800, 
                  padding: '2px 6px', borderRadius: '10px', 
                  border: '2px solid var(--surface)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {user.plan === 'pro_plus' ? 'PRO+' : 'PRO'}
                </div>
              )}
            </div>
          </div>
        </header>

          <div className="page-header-description" style={{ margin: "-1rem 0 0.5rem 0", color: "var(--text-muted)", padding: "0 1rem" }}>
            <p>Here's your financial overview for today.</p>
          </div>

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
    </div>
  );
};

export default Dashboard;
