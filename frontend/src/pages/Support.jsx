import UserProfilePopup from '../components/UserProfilePopup';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import AppSidebar from '../components/AppSidebar';

const Support = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('message');

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
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize: '1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <button className="icon-btn"><i className='bx bx-bell' /></button>
              <UserProfilePopup user={user} />
            </div>
          </header>

          <div className="support-page" style={{ width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div className="contact-cards-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', width: '100%' }}>
              <div className="glass-panel contact-info-card fade-in" style={{ animationDelay: '0.1s', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <i className='bx bx-envelope'></i>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>Email Support</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Get in touch via email</p>
                <a href="mailto:support@paychain.com" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', marginTop: '0.5rem' }}>support@paychain.com</a>
              </div>
              
              <div className="glass-panel contact-info-card fade-in" style={{ animationDelay: '0.2s', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <i className='bx bx-phone-call'></i>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>Phone Support</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Call us directly</p>
                <a href="tel:+18001234567" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', marginTop: '0.5rem' }}>+1 (800) 123-4567</a>
              </div>
              
              <div className="glass-panel contact-info-card fade-in" style={{ animationDelay: '0.3s', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <i className='bx bx-time-five'></i>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>Live Chat</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Available 24/7</p>
                <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', marginTop: '0.5rem' }}>Start a Chat</a>
              </div>
            </div>

            <div className="glass-panel support-tabs-container fade-in" style={{ animationDelay: '0.4s', borderRadius: '16px', padding: '1.5rem' }}>
              <div className="support-tabs-header" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <button 
                  className={`support-tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
                  onClick={() => setActiveTab('faq')}
                >
                  <i className='bx bx-help-circle'></i> FAQs
                </button>
                <button 
                  className={`support-tab-btn ${activeTab === 'message' ? 'active' : ''}`}
                  onClick={() => setActiveTab('message')}
                >
                  <i className='bx bx-message-square-edit'></i> Send a Message
                </button>
              </div>

              <div className="support-tab-content">
                {activeTab === 'faq' && (
                  <div className="faq-list">
                    <div className="faq-item">
                      <h4>How long do international transfers take?</h4>
                      <p>Most international transfers are completed within 1-2 business days. Some destinations may take up to 3 business days depending on local banking networks.</p>
                    </div>
                    <div className="faq-item">
                      <h4>Are there any hidden transaction fees?</h4>
                      <p>No, we pride ourselves on transparency. All fees are clearly displayed before you confirm any transaction. We use real mid-market exchange rates.</p>
                    </div>
                    <div className="faq-item">
                      <h4>How can I reset my account password?</h4>
                      <p>You can reset your password by navigating to the Settings page and selecting "Security", or by clicking "Forgot Password" on the login screen.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'message' && (
                  <div>
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

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Subject</label>
                        <input 
                          type="text" 
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="What do you need help with?"
                          style={{ width: '100%', padding: '1rem', background: 'var(--input-bg, rgba(0,0,0,0.05))', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-color)', fontSize: '1rem', boxSizing: 'border-box' }}
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
                          style={{ width: '100%', padding: '1rem', background: 'var(--input-bg, rgba(0,0,0,0.05))', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-color)', fontSize: '1rem', resize: 'vertical', boxSizing: 'border-box' }}
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
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Support;
