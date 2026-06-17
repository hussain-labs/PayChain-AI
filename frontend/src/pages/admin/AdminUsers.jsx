import { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchUsers();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load users');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  const handleRoleToggle = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setUsers(users.map(u => u._id === id ? { ...u, isAdmin: data.isAdmin } : u));
    } catch (err) {
      alert(err.message || 'Failed to update role');
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
              <Link to="/admin/users" className="active" onClick={() => setIsSidebarOpen(false)}><i className='bx bx-user-circle'></i> Users</Link>
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
              <h1>Manage Users</h1>
              <p>View and manage all registered users.</p>
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

          <div className="admin-users">
            {loading ? (
              <p>Loading users...</p>
            ) : error ? (
              <p style={{ color: 'var(--danger)' }}>{error}</p>
            ) : (
              <div className="glass-panel dark-panel" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name</th>
                      <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Email</th>
                      <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Joined</th>
                      <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Role</th>
                      <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem', color: 'var(--text-color)' }}>{u.name}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-color)' }}>{u.email}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-color)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            background: u.isAdmin ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.1)', 
                            color: u.isAdmin ? '#34d399' : '#ccc', 
                            padding: '0.3rem 0.8rem', 
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 500
                          }}>
                            {u.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleRoleToggle(u._id)}
                            style={{ background: 'var(--primary-light)', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Toggle Role
                          </button>
                          <button 
                            onClick={() => handleDelete(u._id)}
                            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
