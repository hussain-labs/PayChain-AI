import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import AppSidebar from '../components/AppSidebar';

const Support = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message) return;

    setLoading(true);
    setStatus('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/support', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ subject, message })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      setStatus('success');
      setSubject('');
      setMessage('');
    } catch (err) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/support"
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
              <i className='bx bx-menu'></i>
            </div>
            <div className="header-greeting">
              <h1>Contact Support</h1>
              <p>Need help? Send a message directly to our admin team.</p>
            </div>
            <div className="header-actions">
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize:'1.2rem' }}>
              <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
            </button>
            <button className="icon-btn"><i className='bx bx-bell' /></button>
            <div className="user-profile" style={{ position: 'relative' }}>
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4B1D8F&color=fff`} alt="User" />
              {(user?.plan === 'pro' || user?.plan === 'pro_plus') && (
                <div style={{
                  position: 'absolute', bottom: '-4px', right: '-4px', 
                  background: 'linear-gradient(45deg, #f59e0b, #fbbf24)', 
                  color: '#fff', fontSize: '0.6rem', fontWeight: 800, 
                  padding: '2px 6px', borderRadius: '10px', 
                  border: '2px solid var(--surface)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {user.plan === 'pro_plus' ? 'PRO+' : 'PRO'}
                </div>
              )}
            </div>
          </div>
        </header>

          <div className="support-page">
            <div className="glass-panel dark-panel" style={{ maxWidth: '600px' }}>
              {status === 'success' && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className='bx bx-check-circle' style={{ fontSize: '1.2rem' }}></i>
                  Your message has been sent successfully. Our team will review it shortly!
                </div>
              )}

              {status === 'error' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className='bx bx-error-circle' style={{ fontSize: '1.2rem' }}></i>
                  Failed to send message. Please try again later.
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Subject</label>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What do you need help with?"
                    style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Message</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    rows="6"
                    style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '1rem', resize: 'vertical', boxSizing: 'border-box' }}
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                  {!loading && <i className='bx bx-send'></i>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;
