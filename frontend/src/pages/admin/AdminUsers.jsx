import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppSidebar from '../../components/AppSidebar';
import UserProfilePopup from '../../components/UserProfilePopup';
import NotificationBell from '../../components/NotificationBell';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const Badge = ({ plan }) => {
  const map = {
    free: ['FREE', '#6366f1', '#eef2ff'],
    pro: ['PRO', '#f59e0b', '#fffbeb'],
    pro_plus: ['PRO+', '#8b5cf6', '#f5f3ff'],
  };
  const [label, color, bg] = map[plan] || map.free;
  return (
    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: '9px', background: bg, color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  );
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [adminUser, setAdminUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) { navigate('/login'); return; }
    const u = JSON.parse(storedUser);
    if (!u.isAdmin) { navigate('/dashboard'); return; }
    setAdminUser(u);
    fetchUsers(token);
  }, [navigate]);

  const token = () => localStorage.getItem('token');

  const fetchUsers = async (tk) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${tk || token()}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
      else toast.error(data.error || 'Failed to load users');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === 'all' || u.plan === filterPlan;
    const matchActive = filterActive === 'all' || (filterActive === 'active' ? u.isActive !== false : u.isActive === false);
    return matchSearch && matchPlan && matchActive && !u.isAdmin;
  });

  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/admin/users"
        user={adminUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => { localStorage.clear(); navigate('/'); }}
      />

      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}>
              <i className='bx bx-menu' />
            </div>
            <div className="header-greeting">
              <h1>User Management</h1>
              <p>{filtered.length} user{filtered.length !== 1 ? 's' : ''} found</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} style={{ fontSize: '1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <NotificationBell user={adminUser} />
              <UserProfilePopup user={adminUser} />
            </div>
          </header>

          <div style={{ marginTop: '2rem' }}>
            {/* Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-search-wrap">
                <i className='bx bx-search' />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>
              <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} className="admin-select">
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="pro_plus">Pro+</option>
              </select>
              <select value={filterActive} onChange={e => setFilterActive(e.target.value)} className="admin-select">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button onClick={() => fetchUsers()} className="admin-btn-outline">
                <i className='bx bx-refresh' /> Refresh
              </button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="admin-loading">
                <i className='bx bx-loader-alt bx-spin' /> Loading users…
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Plan</th>
                      <th>Transactions Used</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                          <i className='bx bx-user-x' style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }} />
                          No users found
                        </td>
                      </tr>
                    )}
                    {filtered.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {u.avatar
                              ? <img src={u.avatar} alt={u.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99,102,241,0.2)' }} />
                              : (
                                <div
                                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}
                                >
                                  {u.name?.charAt(0)?.toUpperCase()}
                                </div>
                              )
                            }
                            <div>
                              <div className="admin-table-name">{u.name}</div>
                              <div className="admin-table-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><Badge plan={u.plan} /></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-color)' }}>{u.transactionCount ?? 0}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              / {u.plan === 'free' ? '3' : u.plan === 'pro' ? '1,000' : '∞'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                              fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '10px',
                              background: u.isActive !== false ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                              color: u.isActive !== false ? '#10b981' : '#ef4444',
                              border: `1px solid ${u.isActive !== false ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                            {u.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          <button
                            onClick={() => navigate(`/admin/users/${u._id}`)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                              padding: '0.5rem 1.1rem', borderRadius: '10px',
                              background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                              border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer',
                              fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#6366f1'; }}
                          >
                            <i className='bx bx-user-circle' style={{ fontSize: '1.05rem' }} /> View Profile
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
