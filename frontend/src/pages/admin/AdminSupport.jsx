import { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const AdminSupport = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchMessages();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/support', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessages(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load support messages');
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/support/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessages(messages.map(msg => msg._id === id ? data : msg));
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

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
          <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-grid-alt'></i> Overview</Link>
          <Link to="/transfers" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-transfer'></i> Transfers</Link>
          <Link to="/cards" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-credit-card'></i> Cards</Link>
          <Link to="/statistics" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-line-chart'></i> Statistics</Link>
          <Link to="/settings" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-cog'></i> Settings</Link>
          <Link to="/support" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-help-circle'></i> Support</Link>

          {user?.isAdmin && (
            <>
              <div style={{ padding: '1rem 1rem 0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin</div>
              <Link to="/admin/users" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-user-circle'></i> Users</Link>
              <Link to="/admin/support" className="active" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-message-square-detail'></i> Tickets</Link>
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
              <h1>Support Tickets</h1>
              <p>Review and resolve user support messages.</p>
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

          <div className="admin-support">
            {loading ? (
              <p>Loading messages...</p>
            ) : error ? (
              <p style={{ color: 'var(--danger)' }}>{error}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {messages.length === 0 ? (
                  <div className="glass-panel dark-panel">
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No support messages found.</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg._id} className="glass-panel dark-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.2rem' }}>{msg.subject}</h3>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            From: <strong style={{ color: '#fff' }}>{msg.user?.name || 'Unknown User'}</strong> ({msg.user?.email || 'N/A'})
                          </p>
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span style={{ 
                            background: msg.status === 'Resolved' ? 'rgba(16, 185, 129, 0.15)' : msg.status === 'In Progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                            color: msg.status === 'Resolved' ? '#34d399' : msg.status === 'In Progress' ? '#fbbf24' : '#fca5a5', 
                            padding: '0.4rem 1rem', 
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}>
                            {msg.status}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', color: '#e2e8f0', lineHeight: '1.6' }}>
                        {msg.message}
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        {msg.status !== 'Open' && (
                          <button 
                            onClick={() => updateStatus(msg._id, 'Open')}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Mark Open
                          </button>
                        )}
                        {msg.status !== 'In Progress' && (
                          <button 
                            onClick={() => updateStatus(msg._id, 'In Progress')}
                            style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Mark In Progress
                          </button>
                        )}
                        {msg.status !== 'Resolved' && (
                          <button 
                            onClick={() => updateStatus(msg._id, 'Resolved')}
                            style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSupport;
