import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Cards = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isFrozen, setIsFrozen] = useState(false);

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
          <Link to="/transfers" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-transfer'></i> Transfers</Link>
          <Link to="/cards" className="active" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-credit-card'></i> Cards</Link>
          <Link to="/statistics" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-line-chart'></i> Statistics</Link>
          <Link to="/settings" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-cog'></i> Settings</Link>
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
              <h1>Virtual Cards 💳</h1>
              <p>Manage your crypto debit cards and spending limits.</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn"><i className='bx bx-bell'></i></button>
              <div className="user-profile">
                <img src={`https://ui-avatars.com/api/?name=${user ? user.name.replace(' ', '+') : 'User'}&background=4B1D8F&color=fff`} alt="User" />
              </div>
            </div>
          </header>

          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1.5fr' }}>

            {/* Card Display */}
            <div className="glass-panel" style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ width: '100%', maxWidth: '350px', height: '220px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary) 0%, #1a0836 100%)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', filter: isFrozen ? 'grayscale(1)' : 'none', transition: 'all 0.3s ease' }}>
                {/* Decoration */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className='bx bx-link' style={{ color: 'var(--secondary)' }}></i> PayChain
                  </span>
                  <i className='bx bx-wifi' style={{ fontSize: '1.5rem', transform: 'rotate(90deg)' }}></i>
                </div>

                <div style={{ zIndex: 1, textAlign: 'left', letterSpacing: '2px', fontSize: '1.25rem', marginTop: '1rem' }}>
                  **** **** **** 4289
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8 }}>Cardholder Name</span>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>{user ? user.name : 'User'}</div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8 }}>Valid Thru</span>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>12/28</div>
                  </div>
                  <div>
                    <div style={{ width: '40px', height: '25px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', fontStyle: 'italic' }}>VISA</span>
                    </div>
                  </div>
                </div>

                {isFrozen && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <span style={{ background: '#EF4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.875rem' }}><i className='bx bx-lock-alt'></i> Card Frozen</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', width: '100%', maxWidth: '350px' }}>
                <button onClick={() => setIsFrozen(!isFrozen)} className="btn-secondary" style={{ flex: 1, padding: '0.75rem', background: isFrozen ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isFrozen ? '#10B981' : '#EF4444', border: 'none' }}>
                  <i className={`bx ${isFrozen ? 'bx-lock-open-alt' : 'bx-lock-alt'}`}></i> {isFrozen ? 'Unfreeze' : 'Freeze Card'}
                </button>
                <button className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>
                  <i className='bx bx-show'></i> Show Details
                </button>
              </div>
            </div>

            {/* Card Settings & Limits */}
            <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              <div className="glass-panel">
                <div className="section-header">
                  <h3>Monthly Limit</h3>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>$2,450 / $5,000</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(75, 29, 143, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '49%', height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Used: 49%</span>
                  <span>Resets in 14 days</span>
                </div>
              </div>

              <div className="glass-panel" style={{ flex: 1 }}>
                <div className="section-header">
                  <h3>Card Settings</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Online Payments</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enable transactions on the web</p>
                    </div>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                      <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--primary)', transition: '.4s', borderRadius: '34px' }}></span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>ATM Withdrawals</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Allow cash withdrawals</p>
                    </div>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                      <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#ccc', transition: '.4s', borderRadius: '34px' }}></span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>International Usage</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Allow foreign currency transactions</p>
                    </div>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                      <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--primary)', transition: '.4s', borderRadius: '34px' }}></span>
                    </label>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .switch input:checked + span {
          background-color: var(--primary);
        }
        .switch input:focus + span {
          box-shadow: 0 0 1px var(--primary);
        }
        .switch input:checked + span:before {
          transform: translateX(16px);
        }
        .switch span:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
      `}} />
    </div>
  );
};

export default Cards;
