import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppSidebar from '../../components/AppSidebar';
import UserProfilePopup from '../../components/UserProfilePopup';
import NotificationBell from '../../components/NotificationBell';
import { useTheme } from '../../context/ThemeContext';
const API = 'http://localhost:5000';

const AdminPlanDistribution = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPlan, setFilterPlan] = useState('all');

  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) { navigate('/login'); return; }
    const u = JSON.parse(storedUser);
    if (!u.isAdmin) { navigate('/dashboard'); return; }
    setUser(u);
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      const [resStats, resUsers] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const dataStats = await resStats.json();
      const dataUsers = await resUsers.json();
      if (resStats.ok) setStats(dataStats);
      if (resUsers.ok) setUsers(dataUsers);
    } catch(e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const planPct = (count) => stats?.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0;

  const filteredUsers = filterPlan === 'all' 
    ? users 
    : users.filter(u => u.plan === filterPlan);

  const getPlanColor = (plan) => {
    if (plan === 'free') return '#6366f1';
    if (plan === 'pro') return '#10b981';
    if (plan === 'pro_plus') return '#f59e0b';
    return '#6366f1';
  };

  const getPlanLabel = (plan) => {
    if (plan === 'free') return 'Starter (Free)';
    if (plan === 'pro') return 'Business Pro';
    if (plan === 'pro_plus') return 'Enterprise';
    return plan;
  };

  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/admin/plans"
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
              <h1>Plan Distribution</h1>
              
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize:'1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <NotificationBell user={user} />
              <UserProfilePopup user={user} />
            </div>
          </header>

          <div className="page-header-description" style={{ margin: "-1rem 0 0.5rem 0", color: "var(--text-muted)", padding: "0 1rem" }}>
            <p>Detailed analysis of user subscription plans</p>
          </div>

          <div style={{ marginTop: 0 }}>
            {loading ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)', fontSize:'1.1rem' }}>
                <i className='bx bx-loader-alt bx-spin' style={{ marginRight:'0.5rem', fontSize:'1.5rem' }} />
                Loading distribution data…
              </div>
            ) : (
              <>
                <div className="admin-panel" style={{ marginBottom: '2rem' }}>
                  <h3 className="admin-panel-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}><i className='bx bx-pie-chart-alt-2' /> Overall Plan Distribution</h3>
                  <div style={{ display:'flex', overflowX: 'auto', gap:'1.5rem', paddingBottom: '1rem', flexWrap: 'nowrap' }}>
                    {[
                      { label:'Starter (Free)', id: 'free', count: stats?.freeUsers,    color:'#6366f1', pct: planPct(stats?.freeUsers) },
                      { label:'Business Pro',   id: 'pro', count: stats?.proUsers,     color:'#10b981', pct: planPct(stats?.proUsers) },
                      { label:'Enterprise',     id: 'pro_plus', count: stats?.proPlusUsers, color:'#f59e0b', pct: planPct(stats?.proPlusUsers) },
                    ].map(p => (
                      <div key={p.label} style={{ 
                        flex: '0 0 auto',
                        width: '280px',
                        background: 'var(--surface)', 
                        padding: '1.5rem', 
                        borderRadius: '12px', 
                        border: '1px solid var(--border)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => setFilterPlan(p.id)}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom:'1rem' }}>
                          <span style={{ fontSize:'1.1rem', fontWeight:600, color:'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: p.color, display: 'inline-block' }}></span>
                            {p.label}
                          </span>
                          <span style={{ fontSize:'1.2rem', fontWeight: 700, color:'var(--text-color)' }}>{p.count} <span style={{fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500}}>users</span></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.8rem' }}>
                          <span style={{ fontSize: '2rem', fontWeight: 800, color: p.color }}>{p.pct}%</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>of total user base</span>
                        </div>
                        <div style={{ height:'10px', background:'var(--border)', borderRadius:'5px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${p.pct}%`, background:p.color, borderRadius:'5px', transition:'width 0.6s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 className="admin-panel-title" style={{ margin: 0 }}><i className='bx bx-group' /> Users by Plan</h3>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: '1 1 auto' }}>
                      <button 
                        style={{ flex: '1 1 110px', justifyContent: 'center' }}
                        onClick={() => setFilterPlan('all')} 
                        className={`admin-tab ${filterPlan === 'all' ? 'active' : ''}`}
                      >
                        All Users <span className="admin-tab-count">{users.length}</span>
                      </button>
                      <button 
                        style={{ flex: '1 1 110px', justifyContent: 'center' }}
                        onClick={() => setFilterPlan('free')} 
                        className={`admin-tab ${filterPlan === 'free' ? 'active' : ''}`}
                      >
                        Starter <span className="admin-tab-count">{stats?.freeUsers || 0}</span>
                      </button>
                      <button 
                        style={{ flex: '1 1 110px', justifyContent: 'center' }}
                        onClick={() => setFilterPlan('pro')} 
                        className={`admin-tab ${filterPlan === 'pro' ? 'active' : ''}`}
                      >
                        Pro <span className="admin-tab-count">{stats?.proUsers || 0}</span>
                      </button>
                      <button 
                        style={{ flex: '1 1 110px', justifyContent: 'center' }}
                        onClick={() => setFilterPlan('pro_plus')} 
                        className={`admin-tab ${filterPlan === 'pro_plus' ? 'active' : ''}`}
                      >
                        Enterprise <span className="admin-tab-count">{stats?.proPlusUsers || 0}</span>
                      </button>
                    </div>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Plan</th>
                          <th>Status</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                              No users found for this plan.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map(u => (
                            <tr key={u._id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div className="admin-table-avatar" style={{ background: `linear-gradient(135deg, ${getPlanColor(u.plan)}, ${getPlanColor(u.plan)}88)` }}>
                                    {u.name?.charAt(0)?.toUpperCase()}
                                  </div>
                                  <div className="admin-table-name">{u.name}</div>
                                </div>
                              </td>
                              <td className="admin-table-email">{u.email}</td>
                              <td>
                                <span className={`admin-plan-badge plan-${u.plan}`}>
                                  {getPlanLabel(u.plan)}
                                </span>
                              </td>
                              <td>
                                <span className={`admin-status-badge ${u.isActive !== false ? 'active' : 'inactive'}`}>
                                  {u.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
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

export default AdminPlanDistribution;
