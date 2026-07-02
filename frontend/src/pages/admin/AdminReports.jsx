import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppSidebar from '../../components/AppSidebar';
import UserProfilePopup from '../../components/UserProfilePopup';
import NotificationBell from '../../components/NotificationBell';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API = 'http://localhost:5000';

const AdminReports = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [adminUser, setAdminUser] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) { navigate('/login'); return; }
    const u = JSON.parse(storedUser);
    if (!u.isAdmin) { navigate('/dashboard'); return; }
    setAdminUser(u);
    fetchReports(token);
  }, [navigate]);

  const fetchReports = async (tk) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/reports`, {
        headers: { Authorization: `Bearer ${tk}` },
      });
      const data = await res.json();
      if (res.ok) setReports(data);
      else toast.error(data.error || 'Failed to load reports data');
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Theme colors for charts
  const textColor = theme === 'dark' ? '#cbd5e1' : '#64748b';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const primaryColor = '#6366f1';
  const successColor = '#10b981';
  const pieColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          padding: '10px 15px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: 'var(--text-color)' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: 0, color: entry.color, fontSize: '0.9rem' }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/admin/reports"
        user={adminUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => { localStorage.clear(); navigate('/'); }}
      />

      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}>
              <i className='bx bx-menu' />
            </div>
            <div className="header-greeting">
              <h1>Reports & Analytics</h1>
              <p>Platform growth and transaction metrics</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} style={{ fontSize: '1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <NotificationBell user={adminUser} />
              <UserProfilePopup user={adminUser} />
            </div>
          </header>

          <div style={{ marginTop: 0 }}>
            {loading ? (
              <div className="admin-loading" style={{ marginTop: '3rem' }}>
                <i className='bx bx-loader-alt bx-spin' /> Generating reports…
              </div>
            ) : reports ? (
              <>
                {/* KPIs */}
                <div className="admin-stats-grid" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: `rgba(99, 102, 241, 0.1)`, color: '#6366f1' }}>
                      <i className="bx bx-line-chart" />
                    </div>
                    <div className="admin-stat-body">
                      <div className="admin-stat-value">{reports.kpis.totalUsers}</div>
                      <div className="admin-stat-label">Total Users</div>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: `rgba(16, 185, 129, 0.1)`, color: '#10b981' }}>
                      <i className="bx bx-crown" />
                    </div>
                    <div className="admin-stat-body">
                      <div className="admin-stat-value">{reports.kpis.paidSubscribers}</div>
                      <div className="admin-stat-label">Active Pro Subscribers</div>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: `rgba(245, 158, 11, 0.1)`, color: '#f59e0b' }}>
                      <i className="bx bx-transfer" />
                    </div>
                    <div className="admin-stat-body">
                      <div className="admin-stat-value">{reports.kpis.totalTransactions}</div>
                      <div className="admin-stat-label">Total Transactions Processed</div>
                    </div>
                  </div>
                </div>

                {/* Charts Area */}
                <div className="admin-charts-grid" style={{ marginBottom: '2rem' }}>
                  
                  {/* User Growth Chart */}
                  <div className="admin-panel" style={{ padding: '1.5rem 1rem' }}>
                    <h3 className="admin-panel-title" style={{ paddingLeft: '0.5rem' }}>
                      <i className='bx bx-trending-up' /> User Growth (Last 6 Months)
                    </h3>
                    <div style={{ width: '100%', height: 300, marginTop: '1.5rem' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={reports.userGrowth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                          <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="users" name="New Users" stroke={primaryColor} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Transaction Volume Chart */}
                  <div className="admin-panel" style={{ padding: '1.5rem 1rem' }}>
                    <h3 className="admin-panel-title" style={{ paddingLeft: '0.5rem' }}>
                      <i className='bx bx-bar-chart' /> Transaction Volume (Last 6 Months)
                    </h3>
                    <div style={{ width: '100%', height: 300, marginTop: '1.5rem' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reports.transactionVolume} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                          <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="transactions" name="Transactions" fill={successColor} radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Network Distribution Pie */}
                  <div className="admin-panel" style={{ padding: '1.5rem 1rem' }}>
                    <h3 className="admin-panel-title" style={{ paddingLeft: '0.5rem' }}>
                      <i className='bx bx-pie-chart-alt-2' /> Network Usage Distribution
                    </h3>
                    <div style={{ width: '100%', height: 300, marginTop: '1.5rem' }}>
                      {reports.networkDistribution.length === 0 ? (
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-muted)' }}>
                          No transactions yet
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reports.networkDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {reports.networkDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.85rem', color: 'var(--text-color)' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Plan Distribution Pie */}
                  <div className="admin-panel" style={{ padding: '1.5rem 1rem' }}>
                    <h3 className="admin-panel-title" style={{ paddingLeft: '0.5rem' }}>
                      <i className='bx bx-user-circle' /> Plan Subscriptions
                    </h3>
                    <div style={{ width: '100%', height: 300, marginTop: '1.5rem' }}>
                       {reports.planDistribution.length === 0 ? (
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-muted)' }}>
                          No users yet
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reports.planDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {reports.planDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={pieColors[(index + 2) % pieColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.85rem', color: 'var(--text-color)' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                </div>
              </>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;
