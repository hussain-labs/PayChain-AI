import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppSidebar from '../../components/AppSidebar';
import UserProfilePopup from '../../components/UserProfilePopup';
import NotificationBell from '../../components/NotificationBell';
import Pagination from '../../components/Pagination';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const AdminTransactions = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [adminUser, setAdminUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterNetwork, setFilterNetwork] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterNetwork, filterStatus]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) { navigate('/login'); return; }
    const u = JSON.parse(storedUser);
    if (!u.isAdmin) { navigate('/dashboard'); return; }
    setAdminUser(u);
    fetchTransactions(token);
  }, [navigate]);

  const token = () => localStorage.getItem('token');

  const fetchTransactions = async (tk) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/transactions`, {
        headers: { Authorization: `Bearer ${tk || token()}` },
      });
      const data = await res.json();
      if (res.ok) setTransactions(data);
      else toast.error(data.error || 'Failed to load transactions');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const filtered = transactions.filter(t => {
    const searchString = search.toLowerCase();
    const matchSearch = 
      t.user?.email?.toLowerCase().includes(searchString) || 
      t.user?.name?.toLowerCase().includes(searchString) ||
      t.hash?.toLowerCase().includes(searchString);
    const matchNetwork = filterNetwork === 'all' || t.network === filterNetwork;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchNetwork && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return <span className="admin-status-badge active" style={{ flexShrink: 0 }}>Success</span>;
      case 'Pending':
        return <span className="admin-status-badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', flexShrink: 0 }}>Pending</span>;
      case 'Failed':
        return <span className="admin-status-badge inactive" style={{ flexShrink: 0 }}>Failed</span>;
      default:
        return <span className="admin-status-badge" style={{ flexShrink: 0 }}>{status}</span>;
    }
  };

  const getNetworkBadge = (network) => {
    return (
      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: '9px', background: 'var(--surface)', color: 'var(--text-color)', border: '1px solid var(--border)' }}>
        {network}
      </span>
    );
  };

  // Get unique networks for filter
  const uniqueNetworks = [...new Set(transactions.map(t => t.network))];

  // Stats
  const totalSuccess = transactions.filter(t => t.status === 'Success').length;
  const totalPending = transactions.filter(t => t.status === 'Pending').length;
  const totalFailed = transactions.filter(t => t.status === 'Failed').length;

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/admin/transactions"
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
              <h1>Transactions Hub</h1>
              <p>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''} found</p>
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
            {/* Quick Stats Grid - uses responsive horizontal scroll flex from index.css */}
            {!loading && transactions.length > 0 && (
              <div className="admin-stats-grid" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: `rgba(99, 102, 241, 0.1)`, color: '#6366f1' }}>
                    <i className="bx bx-transfer" />
                  </div>
                  <div className="admin-stat-body">
                    <div className="admin-stat-value">{transactions.length}</div>
                    <div className="admin-stat-label">Total Transactions</div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: `rgba(16, 185, 129, 0.1)`, color: '#10b981' }}>
                    <i className="bx bx-check-circle" />
                  </div>
                  <div className="admin-stat-body">
                    <div className="admin-stat-value">{totalSuccess}</div>
                    <div className="admin-stat-label">Successful</div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: `rgba(245, 158, 11, 0.1)`, color: '#f59e0b' }}>
                    <i className="bx bx-time-five" />
                  </div>
                  <div className="admin-stat-body">
                    <div className="admin-stat-value">{totalPending}</div>
                    <div className="admin-stat-label">Pending</div>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: `rgba(239, 68, 68, 0.1)`, color: '#ef4444' }}>
                    <i className="bx bx-x-circle" />
                  </div>
                  <div className="admin-stat-body">
                    <div className="admin-stat-value">{totalFailed}</div>
                    <div className="admin-stat-label">Failed</div>
                  </div>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="admin-toolbar" style={{ marginTop: loading || transactions.length === 0 ? '1.5rem' : '0' }}>
              <div className="admin-search-wrap" style={{ flex: 2 }}>
                <i className='bx bx-search' />
                <input
                  type="text"
                  placeholder="Search by user email, name, or hash…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="admin-search-input"
                />
              </div>
              <select value={filterNetwork} onChange={e => setFilterNetwork(e.target.value)} className="admin-select">
                <option value="all">All Networks</option>
                {uniqueNetworks.map(net => (
                  <option key={net} value={net}>{net}</option>
                ))}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="admin-select">
                <option value="all">All Status</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
              <button onClick={() => fetchTransactions()} className="admin-btn-outline">
                <i className='bx bx-refresh' /> Refresh
              </button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="admin-loading">
                <i className='bx bx-loader-alt bx-spin' /> Loading transactions…
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Amount & Asset</th>
                      <th>Network</th>
                      <th>Hash</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                          <i className='bx bx-transfer' style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }} />
                          No transactions found
                        </td>
                      </tr>
                    )}
                    {currentItems.map(t => (
                      <tr key={t._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {t.user?.avatar
                              ? <img src={t.user.avatar} alt={t.user.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99,102,241,0.2)' }} />
                              : (
                                <div
                                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}
                                >
                                  {t.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                              )
                            }
                            <div style={{ minWidth: 0 }}>
                              <div className="admin-table-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.user?.name || 'Unknown'}</div>
                              <div className="admin-table-email" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.user?.email || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-color)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                            {t.amount} {t.asset}
                          </div>
                        </td>
                        <td>{getNetworkBadge(t.network)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--surface)', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                              {t.hash.substring(0, 8)}...{t.hash.substring(t.hash.length - 6)}
                            </span>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(t.hash); toast.success('Hash copied!'); }}
                              style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '0.2rem' }}
                              title="Copy full hash"
                            >
                              <i className="bx bx-copy" />
                            </button>
                          </div>
                        </td>
                        <td>{getStatusBadge(t.status)}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                          {new Date(t.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filtered.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminTransactions;
