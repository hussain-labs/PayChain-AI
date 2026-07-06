import UserProfilePopup from '../components/UserProfilePopup';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AppSidebar from '../components/AppSidebar';

const Statistics = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/statistics"
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
              <i className='bx bx-menu'></i>
            </div>
            <div className="header-greeting">
              <h1>Financial Statistics</h1>
              
            </div>
            <div className="header-actions">
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize:'1.2rem' }}>
              <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
            </button>
            <button className="icon-btn"><i className='bx bx-bell' /></button>
            <UserProfilePopup user={user} />
          </div>
        </header>

          <div className="page-header-description" style={{ margin: "-1rem 0 2rem 0", color: "var(--text-muted)", padding: "0 1rem" }}>
            <p>Analyze your transaction history and portfolio growth.</p>
          </div>

          {/* Statistics Grid */}
          <div className="dashboard-grid">

            {/* KPI Cards */}
            <div className="quick-actions glass-panel" style={{ gridColumn: '1 / -1' }}>
              <div className="action-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', width: '100%' }}>
                <div className="action-btn" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', background: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Volume</span>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', margin: 0 }}>$2.4M</h3>
                  <span style={{ color: '#10B981', fontSize: '0.75rem', marginTop: '0.5rem' }}><i className='bx bx-trending-up'></i> +12.5%</span>
                </div>
                <div className="action-btn" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', background: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Transactions</span>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', margin: 0 }}>1,248</h3>
                  <span style={{ color: '#10B981', fontSize: '0.75rem', marginTop: '0.5rem' }}><i className='bx bx-trending-up'></i> +5.2%</span>
                </div>
                <div className="action-btn" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', background: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Active Assets</span>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', margin: 0 }}>8</h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}><i className='bx bx-minus'></i> No change</span>
                </div>
                <div className="action-btn" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.5rem', background: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Fees</span>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', margin: 0 }}>$142.50</h3>
                  <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.5rem' }}><i className='bx bx-trending-down'></i> -2.1%</span>
                </div>
              </div>
            </div>

            {/* Main Chart Placeholder */}
            <div className="connected-accounts glass-panel" style={{ gridColumn: '1 / -1', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
              <div className="section-header">
                <h3>Portfolio Growth</h3>
                <select style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent' }}>
                  <option>This Month</option>
                  <option>Last 3 Months</option>
                  <option>This Year</option>
                  <option>All Time</option>
                </select>
              </div>
              <div style={{ flex: 1, background: 'linear-gradient(180deg, rgba(75, 29, 143, 0.05) 0%, rgba(75, 29, 143, 0) 100%)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '2rem 1rem 0 1rem', position: 'relative' }}>
                {/* Dummy Chart Bars */}
                {[40, 60, 45, 80, 55, 90, 70, 100, 85, 95, 110, 130].map((height, i) => (
                  <div key={i} style={{ width: '6%', height: `${height}px`, background: i === 11 ? 'var(--primary)' : 'var(--primary-light)', opacity: i === 11 ? 1 : 0.4, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                    {i === 11 && (
                      <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-dark)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        $124k
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
              </div>
            </div>

            {/* Asset Allocation */}
            <div className="recent-activity glass-panel" style={{ gridColumn: '1 / -1' }}>
              <div className="section-header">
                <h3>Asset Allocation</h3>
              </div>
              <div className="transaction-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="transaction-item" style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                  <div className="t-icon" style={{ background: '#FCD535', color: '#000' }}>
                    <i className='bx bx-bitcoin'></i>
                  </div>
                  <div className="t-details">
                    <h4>Bitcoin (BTC)</h4>
                    <p>45% of portfolio</p>
                  </div>
                  <div className="t-amount" style={{ color: 'var(--primary-dark)' }}>$56,052.00</div>
                </div>
                <div className="transaction-item" style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                  <div className="t-icon" style={{ background: '#627EEA', color: '#fff' }}>
                    <i className='bx bxl-ethereum'></i>
                  </div>
                  <div className="t-details">
                    <h4>Ethereum (ETH)</h4>
                    <p>30% of portfolio</p>
                  </div>
                  <div className="t-amount" style={{ color: 'var(--primary-dark)' }}>$37,368.00</div>
                </div>
                <div className="transaction-item" style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                  <div className="t-icon" style={{ background: '#26A17B', color: '#fff' }}>
                    <i className='bx bx-dollar-circle'></i>
                  </div>
                  <div className="t-details">
                    <h4>Tether (USDT)</h4>
                    <p>25% of portfolio</p>
                  </div>
                  <div className="t-amount" style={{ color: 'var(--primary-dark)' }}>$31,140.00</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Statistics;
