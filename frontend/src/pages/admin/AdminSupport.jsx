import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppSidebar from '../../components/AppSidebar';
import UserProfilePopup from '../../components/UserProfilePopup';
import NotificationBell from '../../components/NotificationBell';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const STATUS_COLORS = { open:'#3b82f6', pending:'#f59e0b', closed:'#10b981' };

const AdminSupport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminUser, setAdminUser] = useState(null);
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [comments, setComments] = useState({});
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token      = localStorage.getItem('token');
    if (!storedUser || !token) { navigate('/login'); return; }
    const u = JSON.parse(storedUser);
    if (!u.isAdmin) { navigate('/dashboard'); return; }
    setAdminUser(u);
    fetchTickets(token);
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ticketId = params.get('ticketId');
    if (ticketId && tickets.some(t => t._id === ticketId)) {
      setExpanded(ticketId);
      // scroll to it eventually
      setTimeout(() => {
        const el = document.getElementById(`ticket-${ticketId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [location.search, tickets]);

  const token = () => localStorage.getItem('token');

  const fetchTickets = async (tk) => {
    try {
      const res  = await fetch(`${API}/api/admin/support`, { headers: { Authorization: `Bearer ${tk || token()}` } });
      const data = await res.json();
      if (res.ok) setTickets(data);
      else toast.error(data.error);
    } catch(e) { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const handleUpdateTicket = async (id, status, comment) => {
    const payload = {};
    if (status) payload.status = status;
    if (comment !== undefined) payload.adminComment = comment;

    try {
      const res  = await fetch(`${API}/api/admin/support/${id}/status`, {
        method: 'PUT',
        headers: { Authorization:`Bearer ${token()}`, 'Content-Type':'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(t => t.map(x => x._id === id ? data : x));
        toast.success(comment !== undefined ? 'Comment saved and user notified!' : `Ticket marked as ${status}`);
      } else toast.error(data.error);
    } catch(e) { toast.error('Network error'); }
  };

  const filtered = tickets.filter(t => filter === 'all' || t.status === filter);

  const counts = {
    all:     tickets.length,
    open:    tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    closed:  tickets.filter(t => t.status === 'closed').length,
  };

  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/admin/support"
        user={adminUser}
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
              <h1>Support Tickets</h1>
              <p>{filtered.length} tickets</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize:'1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <NotificationBell user={adminUser} />
              <UserProfilePopup user={adminUser} />
            </div>
          </header>

          <div style={{ marginTop: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: '1 1 auto' }}>
          {['all','open','pending','closed'].map(s => (
            <button
              key={s}
              className={`admin-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
              style={{ flex: '1 1 120px', justifyContent: 'center' }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="admin-tab-count">{counts[s]}</span>
            </button>
          ))}
        </div>
        <button onClick={() => fetchTickets()} className="admin-btn-outline" style={{ whiteSpace: 'nowrap' }}>
          <i className='bx bx-refresh' /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="admin-loading"><i className='bx bx-loader-alt bx-spin' /> Loading tickets…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', color:'var(--text-muted)', padding:'4rem 0' }}>
          <i className='bx bx-message-square-x' style={{ fontSize:'3rem', display:'block', marginBottom:'1rem' }} />
          No {filter !== 'all' ? filter : ''} tickets found
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {filtered.map(ticket => (
            <div key={ticket._id} id={`ticket-${ticket._id}`} className="admin-ticket-card">
              {/* Ticket Header */}
              <div className="admin-ticket-header" onClick={() => setExpanded(expanded === ticket._id ? null : ticket._id)}>
                <div style={{ display:'flex', alignItems:'center', gap:'1rem', flex:1, minWidth:0 }}>
                  <div className="admin-table-avatar" style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', flexShrink:0 }}>
                    {ticket.user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:700, color:'var(--text-color)', fontSize:'0.95rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {ticket.subject || ticket.category || 'Support Request'}
                    </div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
                      From: <strong>{ticket.user?.name || 'Unknown'}</strong> ({ticket.user?.email || 'N/A'})
                      &nbsp;·&nbsp;{new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexShrink:0 }}>
                  <span className="admin-ticket-status" style={{ background:`${STATUS_COLORS[ticket.status]}20`, color:STATUS_COLORS[ticket.status], borderColor:`${STATUS_COLORS[ticket.status]}40` }}>
                    {ticket.status}
                  </span>
                  <i className={`bx bx-chevron-${expanded === ticket._id ? 'up' : 'down'}`} style={{ color:'var(--text-muted)' }} />
                </div>
              </div>

              {/* Expanded ticket body */}
              {expanded === ticket._id && (
                <div className="admin-ticket-body">
                  <div className="admin-ticket-message">
                    <i className='bx bx-message-square-detail' style={{ color:'var(--primary)', flexShrink:0, fontSize:'1.1rem', marginTop:'2px' }} />
                    <p style={{ margin:0, color:'var(--text-color)', lineHeight:1.6, fontSize:'0.92rem' }}>{ticket.message}</p>
                  </div>
                  
                  {/* Admin Comment Section */}
                  <div style={{ marginTop: '1rem', background: 'var(--bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Admin Response / Comment:</label>
                    <textarea 
                      placeholder="Write a response to the user..."
                      value={comments[ticket._id] !== undefined ? comments[ticket._id] : (ticket.adminComment || '')}
                      onChange={e => setComments({ ...comments, [ticket._id]: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-color)', fontSize: '0.9rem', minHeight: '80px', resize: 'vertical', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button 
                        className="admin-btn-primary"
                        onClick={() => handleUpdateTicket(ticket._id, null, comments[ticket._id])}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      >
                        <i className='bx bx-send' /> Save Response
                      </button>
                    </div>
                  </div>

                  <div className="admin-ticket-actions" style={{ marginTop: '1rem' }}>
                    <span style={{ fontSize:'0.85rem', color:'var(--text-muted)', fontWeight:600 }}>Update Status:</span>
                    {['open','pending','closed'].map(s => (
                      <button
                        key={s}
                        onClick={() => handleUpdateTicket(ticket._id, s, undefined)}
                        disabled={ticket.status === s}
                        className="admin-ticket-status-btn"
                        style={{
                          background: ticket.status === s ? `${STATUS_COLORS[s]}25` : 'transparent',
                          color: STATUS_COLORS[s],
                          borderColor: `${STATUS_COLORS[s]}50`,
                          opacity: ticket.status === s ? 0.7 : 1,
                          cursor: ticket.status === s ? 'default' : 'pointer',
                        }}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                        {ticket.status === s && ' ✓'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSupport;
