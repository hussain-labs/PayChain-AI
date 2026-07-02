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
  const [expandedFaq, setExpandedFaq] = useState(null);

  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  const faqs = [
    { question: "How long do international transfers take?", answer: "Most international transfers are completed within 1-2 business days. Some destinations may take up to 3 business days depending on local banking networks." },
    { question: "Are there any hidden transaction fees?", answer: "No, we pride ourselves on transparency. All fees are clearly displayed before you confirm any transaction. We use real mid-market exchange rates." },
    { question: "How can I reset my account password?", answer: "You can reset your password by navigating to the Settings page and selecting \"Security\", or by clicking \"Forgot Password\" on the login screen." },
    { question: "What payment methods do you support?", answer: "We support a variety of payment methods including all major credit/debit cards, direct bank transfers, and selected cryptocurrencies depending on your region." },
    { question: "Is my personal information and money secure?", answer: "Absolutely. PayChain uses bank-level 256-bit encryption to protect your data. We also employ strict two-factor authentication (2FA) and continuous fraud monitoring." },
    { question: "How can I upgrade my current plan?", answer: "You can upgrade your plan at any time by navigating to the \"Upgrade\" section in your sidebar menu. From there, you can compare plans and select the one that best fits your needs." }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

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

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/support', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchComplaints();
    }
  }, [activeTab]);

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

          <div className="support-page" style={{ width: '100%', margin: '0 auto', marginTop: '-1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div className="contact-cards-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(280px, 1fr))', gap: '1.5rem', width: '100%', overflowX: 'auto', paddingBottom: '1rem' }}>
              <div className="glass-panel contact-info-card fade-in" style={{ animationDelay: '0.1s', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '12px', wordBreak: 'break-word' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <i className='bx bx-envelope'></i>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>Email Support</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Get in touch via email</p>
                <a href="mailto:support@paychain.com" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', marginTop: '0.5rem' }}>support@paychain.com</a>
              </div>
              
              <div className="glass-panel contact-info-card fade-in" style={{ animationDelay: '0.2s', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '12px', wordBreak: 'break-word' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <i className='bx bx-phone-call'></i>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>Phone Support</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Call us directly</p>
                <a href="tel:+18001234567" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', marginTop: '0.5rem' }}>+1 (800) 123-4567</a>
              </div>
              
              <div className="glass-panel contact-info-card fade-in" style={{ animationDelay: '0.3s', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '12px', wordBreak: 'break-word' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <i className='bx bx-time-five'></i>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>Live Chat</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Available 24/7</p>
                <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500', marginTop: '0.5rem' }}>Start a Chat</a>
              </div>
            </div>

            <div className="glass-panel support-tabs-container fade-in" style={{ animationDelay: '0.4s', borderRadius: '16px', padding: '1.5rem', overflow: 'hidden' }}>
              <div className="support-tabs-header" style={{ display: 'flex', flexWrap: 'nowrap', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', overflowX: 'auto' }}>
                <button 
                  className={`support-tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
                  onClick={() => setActiveTab('faq')}
                >
                  <i className='bx bx-help-circle'></i> <span className="tab-text">FAQs</span>
                </button>
                <button 
                  className={`support-tab-btn ${activeTab === 'message' ? 'active' : ''}`}
                  onClick={() => setActiveTab('message')}
                >
                  <i className='bx bx-message-square-edit'></i> <span className="tab-text">Send a Message</span>
                </button>
                <button 
                  className={`support-tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
                  onClick={() => setActiveTab('complaints')}
                >
                  <i className='bx bx-list-ul'></i> <span className="tab-text">Complaints</span>
                </button>
              </div>

              <div className="support-tab-content">
                {activeTab === 'faq' && (
                  <div className="faq-list" style={{ maxWidth: '100%', width: '100%', margin: 0 }}>
                    {faqs.map((faq, index) => (
                      <div 
                        key={index} 
                        className="faq-item" 
                        onClick={() => toggleFaq(index)}
                        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                          <h4 style={{ margin: 0, color: expandedFaq === index ? 'var(--primary)' : 'var(--text-color)', transition: 'color 0.2s' }}>{faq.question}</h4>
                          <i className={`bx ${expandedFaq === index ? 'bx-chevron-up' : 'bx-chevron-down'}`} style={{ fontSize: '1.5rem', color: expandedFaq === index ? 'var(--primary)' : 'var(--text-muted)', transition: 'transform 0.3s ease', transform: expandedFaq === index ? 'rotate(180deg)' : 'rotate(0deg)' }}></i>
                        </div>
                        {expandedFaq === index && (
                          <div style={{ marginTop: '1rem', animation: 'fadeInDown 0.3s ease' }}>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
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
                          background: 'linear-gradient(135deg, #4a148c, #311b92)', 
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

                {activeTab === 'complaints' && (
                  <div className="complaints-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                    {loadingComplaints ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading complaints...</div>
                    ) : complaints.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>You have no complaints yet.</div>
                    ) : (
                      complaints.map(comp => (
                        <div key={comp._id} style={{ background: 'var(--input-bg, rgba(0,0,0,0.02))', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <h4 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.1rem' }}>{comp.subject}</h4>
                            <span style={{ 
                              padding: '0.4rem 0.8rem', 
                              borderRadius: '20px', 
                              fontSize: '0.8rem', 
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              backgroundColor: (comp.status === 'open' || comp.status === 'pending') ? 'rgba(245, 158, 11, 0.15)' : comp.status === 'process' ? 'rgba(59, 130, 246, 0.15)' : (comp.status === 'cancel' || comp.status === 'cancelled') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: (comp.status === 'open' || comp.status === 'pending') ? '#f59e0b' : comp.status === 'process' ? '#3b82f6' : (comp.status === 'cancel' || comp.status === 'cancelled') ? '#ef4444' : '#10b981'
                            }}>
                              {comp.status === 'open' ? 'Pending' : comp.status}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{comp.message}</p>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            Submitted on {new Date(comp.createdAt).toLocaleDateString()}
                          </div>
                          {comp.adminComment && (
                            <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(74, 28, 130, 0.05)', borderLeft: '4px solid #4a1c82', borderRadius: '4px' }}>
                              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-color)' }}><strong>Admin Response:</strong> {comp.adminComment}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
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
