import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Settings = () => {
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
          <Link to="/transfers" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-transfer'></i> Transfers</Link>
          <Link to="/cards" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-credit-card'></i> Cards</Link>
          <Link to="/statistics" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-line-chart'></i> Statistics</Link>
          <Link to="/settings" className="active" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-cog'></i> Settings</Link>
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
              <h1>Settings ⚙️</h1>
              <p>Manage your account preferences and security.</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn"><i className='bx bx-bell'></i></button>
              <div className="user-profile">
                <img src={`https://ui-avatars.com/api/?name=${user ? user.name.replace(' ', '+') : 'User'}&background=4B1D8F&color=fff`} alt="User" />
              </div>
            </div>
          </header>

          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>

            {/* Profile Settings */}
            <div className="glass-panel" style={{ gridColumn: 'span 1' }}>
              <div className="section-header">
                <h3>Profile Information</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={`https://ui-avatars.com/api/?name=${user ? user.name.replace(' ', '+') : 'User'}&background=4B1D8F&color=fff`} alt="User" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--primary)' }} />
                  <div>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Change Avatar</button>
                  </div>
                </div>

                <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" defaultValue={user ? user.name : ''} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" defaultValue={user ? user.email : ''} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+1 (555) 000-0000" />
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Save Changes</button>
                </form>
              </div>
            </div>

            <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* Security */}
              <div className="glass-panel">
                <div className="section-header">
                  <h3>Security</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Two-Factor Authentication</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secure your account with 2FA.</p>
                    </div>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                      <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#ccc', transition: '.4s', borderRadius: '34px' }}></span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Change Password</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Update your password regularly.</p>
                    </div>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Update</button>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="glass-panel" style={{ flex: 1 }}>
                <div className="section-header">
                  <h3>Preferences</h3>
                </div>
                <form className="modal-form" style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label>Default Currency</label>
                    <select defaultValue="USD">
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Language</label>
                    <select defaultValue="EN">
                      <option value="EN">English</option>
                      <option value="ES">Spanish</option>
                      <option value="FR">French</option>
                    </select>
                  </div>
                </form>
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

export default Settings;
