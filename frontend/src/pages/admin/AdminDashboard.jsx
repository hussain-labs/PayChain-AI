import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppSidebar from '../../components/AppSidebar';
import UserProfilePopup from '../../components/UserProfilePopup';
import NotificationBell from '../../components/NotificationBell';
import { useTheme } from '../../context/ThemeContext';
const API = 'http://localhost:5000';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="admin-stat-card">
    <div className="admin-stat-icon" style={{ background: `${color}20`, color }}>
      <i className={`bx ${icon}`} />
    </div>
    <div className="admin-stat-body">
      <div className="admin-stat-value">{value ?? '—'}</div>
      <div className="admin-stat-label">{label}</div>
      {sub && <div className="admin-stat-sub">{sub}</div>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser]   = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token      = localStorage.getItem('token');
    if (!storedUser || !token) { navigate('/login'); return; }
    const u = JSON.parse(storedUser);
    if (!u.isAdmin) { navigate('/dashboard'); return; }
    setUser(u);
    fetchStats(token);
  }, [navigate]);

  const fetchStats = async (token) => {
    try {
      const res  = await fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const planPct = (count) => stats?.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0;

  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/admin/dashboard"
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => { localStorage.clear(); navigate('/'); }}
      />
      
      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}>
              <i className='bx bx-menu'></i>
            </div>
            <div className="header-greeting">
              <h1>Admin Dashboard</h1>
              
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize:'1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <NotificationBell user={user} />
              <UserProfilePopup user={user} />
            </div>
          </header>

          <div className="page-header-description" style={{ margin: "-1rem 0 2rem 0", color: "var(--text-muted)", padding: "0 1rem" }}>
            <p>System overview and analytics</p>
          </div>

          <div style={{ marginTop: 0 }}>
      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)', fontSize:'1.1rem' }}>
          <i className='bx bx-loader-alt bx-spin' style={{ marginRight:'0.5rem', fontSize:'1.5rem' }} />
          Loading stats…
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="admin-stats-grid">
            <StatCard icon="bx-group"         label="Total Users"        value={stats?.totalUsers}        color="#6366f1" sub={`${stats?.activeUsers} active`} />
            <StatCard icon="bx-user-check"    label="Active Users"       value={stats?.activeUsers}       color="#10b981" />
            <StatCard icon="bx-user-x"        label="Inactive Users"     value={stats?.inactiveUsers}     color="#ef4444" />
            <StatCard icon="bx-transfer"      label="Total Transactions"  value={stats?.totalTransactions} color="#f59e0b" />
            <StatCard icon="bx-message-square-detail" label="Open Tickets"  value={stats?.openTickets}    color="#3b82f6" sub={`${stats?.totalTickets} total`} />
            <StatCard icon="bx-check-circle"  label="Closed Tickets"     value={stats?.closedTickets}     color="#8b5cf6" />
          </div>

          <div className="admin-two-col">
            {/* Plan Distribution */}
            <div className="admin-panel">
              <h3 className="admin-panel-title"><i className='bx bx-pie-chart-alt-2' /> Plan Distribution</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', marginTop:'1rem' }}>
                {[
                  { label:'Starter (Free)', count: stats?.freeUsers,    color:'#6366f1', pct: planPct(stats?.freeUsers) },
                  { label:'Business Pro',   count: stats?.proUsers,     color:'#10b981', pct: planPct(stats?.proUsers) },
                  { label:'Enterprise',     count: stats?.proPlusUsers, color:'#f59e0b', pct: planPct(stats?.proPlusUsers) },
                ].map(p => (
                  <div key={p.label}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                      <span style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--text-color)' }}>{p.label}</span>
                      <span style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{p.count} users ({p.pct}%)</span>
                    </div>
                    <div style={{ height:'8px', background:'var(--border)', borderRadius:'4px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${p.pct}%`, background:p.color, borderRadius:'4px', transition:'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/admin/plans')} className="admin-view-all-btn">
                View Plan Details <i className='bx bx-right-arrow-alt' />
              </button>
            </div>

            {/* Recent Sign-ups */}
            <div className="admin-panel">
              <h3 className="admin-panel-title"><i className='bx bx-user-plus' /> Recent Sign-ups</h3>
              <div style={{ marginTop:'0.5rem' }}>
                {stats?.recentUsers?.length === 0 && (
                  <p style={{ color:'var(--text-muted)', textAlign:'center', padding:'2rem 0' }}>No users yet</p>
                )}
                {stats?.recentUsers?.map(u => (
                  <div key={u._id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'0.9rem', flexShrink:0 }}>
                      {u.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:'0.9rem', color:'var(--text-color)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.name}</div>
                      <div style={{ fontSize:'0.77rem', color:'var(--text-muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.email}</div>
                    </div>
                    <span className={`admin-plan-badge plan-${u.plan}`} style={{ flexShrink: 0 }}>
                      {u.plan === 'pro_plus' ? 'PRO+' : u.plan === 'pro' ? 'PRO' : 'FREE'}
                    </span>
                    <span className={`admin-status-badge ${u.isActive !== false ? 'active' : 'inactive'}`} style={{ flexShrink: 0 }}>
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/admin/users')} className="admin-view-all-btn">
                View All Users <i className='bx bx-right-arrow-alt' />
              </button>
            </div>
          </div>
        </>
      )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
