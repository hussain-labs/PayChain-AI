import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Transfers = () => {
  const navigate = useNavigate();
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
          <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-grid-alt'></i> Overview</Link>
          <Link to="/transfers" className="active" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-transfer'></i> Transfers</Link>
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
              <h1>Transfers</h1>
              <p>Send and receive funds globally with low fees.</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn"><i className='bx bx-bell'></i></button>
              <div className="user-profile">
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user ? user.name.replace(' ', '+') : 'User'}&background=4B1D8F&color=fff`} alt="User" />
              </div>
            </div>
          </header>

          <div className="dashboard-grid">

            {/* Transfer Form */}
            <div className="glass-panel" style={{ gridColumn: 'span 1' }}>
              <div className="section-header">
                <h3>Send Money</h3>
              </div>
              <form className="modal-form" style={{ marginTop: '1rem' }} onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label>Select Network</label>
                  <select defaultValue="ethereum" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent' }}>
                    <option value="ethereum">Ethereum (ERC-20)</option>
                    <option value="binance">Binance Smart Chain (BEP-20)</option>
                    <option value="polygon">Polygon</option>
                    <option value="solana">Solana</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Recipient Address / Email</label>
                  <input type="text" placeholder="0x... or name@email.com" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent' }} required />
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Amount (USD)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                    <input type="number" placeholder="0.00" style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', fontSize: '1.25rem', fontWeight: 'bold' }} required />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', padding: '1rem', background: 'rgba(75, 29, 143, 0.05)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Network Fee</span>
                    <strong style={{ fontSize: '0.875rem' }}>$1.50</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Time</span>
                    <strong style={{ fontSize: '0.875rem' }}>~2 mins</strong>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}>
                  Review Transfer
                </button>
              </form>
            </div>

            {/* Recent Contacts & Saved */}
            <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              <div className="glass-panel">
                <div className="section-header">
                  <h3>Recent Contacts</h3>
                  <a href="#" className="view-all">See All</a>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {[
                    { name: 'Sarah', color: '#10B981' },
                    { name: 'David', color: '#FCD535' },
                    { name: 'Emma', color: '#627EEA' },
                    { name: 'Mike', color: '#EF4444' }
                  ].map((contact, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: '70px', cursor: 'pointer' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: contact.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: contact.color === '#FCD535' ? '#000' : '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {contact.name[0]}
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{contact.name}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: '70px', cursor: 'pointer' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px dashed var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.5rem' }}>
                      <i className='bx bx-plus'></i>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>New</span>
                  </div>
                </div>
              </div>

              <div className="recent-activity glass-panel" style={{ flex: 1 }}>
                <div className="section-header">
                  <h3>Transfer History</h3>
                </div>
                <div className="transaction-list" style={{ marginTop: '1rem' }}>
                  <div className="transaction-item">
                    <div className="t-icon bg-primary-light">
                      <i className='bx bx-up-arrow-alt'></i>
                    </div>
                    <div className="t-details">
                      <h4>Sent to Sarah</h4>
                      <p>Today, 10:24 AM • Ethereum</p>
                    </div>
                    <div className="t-amount negative">-$450.00</div>
                  </div>
                  <div className="transaction-item">
                    <div className="t-icon bg-success-light">
                      <i className='bx bx-down-arrow-alt'></i>
                    </div>
                    <div className="t-details">
                      <h4>Received from David</h4>
                      <p>Yesterday, 04:15 PM • Binance</p>
                    </div>
                    <div className="t-amount positive">+$1,200.00</div>
                  </div>
                  <div className="transaction-item">
                    <div className="t-icon bg-primary-light">
                      <i className='bx bx-up-arrow-alt'></i>
                    </div>
                    <div className="t-details">
                      <h4>Sent to Emma</h4>
                      <p>Nov 14, 09:30 AM • Polygon</p>
                    </div>
                    <div className="t-amount negative">-$120.00</div>
                  </div>
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
