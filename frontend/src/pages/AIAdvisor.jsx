import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import AppSidebar from '../components/AppSidebar';
import UserProfilePopup from '../components/UserProfilePopup';

const API = 'http://localhost:5000';

const SUGGESTED_PROMPTS = [
  "Analyze my recent sales trends and volume.",
  "When is the best time for me to run a promotional discount?",
  "Which transaction patterns should I be aware of?",
  "How can I maximize my revenue based on my history?"
];

const AIAdvisor = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your **AI Financial Advisor**. I have access to your chronological sales data and transaction patterns from our Vector Database.\n\nAsk me anything about your business performance, sales trends, or revenue strategies!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const sendMessage = async (text) => {
    const userMessage = text.trim();
    if (!userMessage) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/analytics/advisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        toast.error(data.error || "Failed to fetch insights");
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
      }
    } catch (err) {
      toast.error("Network error");
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm currently unreachable. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const showSuggested = messages.length === 1;

  return (
    <div className="dashboard-layout">
      <AppSidebar activeRoute="/ai-advisor" user={user} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />

      <main className="dashboard-main fade-in">
        {/* Scrollable content area with bottom padding for fixed input */}
        <div className="dashboard-content-wrapper" style={{ paddingBottom: '90px' }}>

          {/* Header */}
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}><i className='bx bx-menu'></i></div>
            <div className="header-greeting">
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <i className='bx bx-sparkles' style={{ color: 'var(--primary)' }}></i>
                Predictive AI Advisor
              </h1>
              <p>Chat with our AI model to get personalized business insights from your sales data.</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme}><i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} /></button>
              <button className="icon-btn"><i className='bx bx-bell' /></button>
              <UserProfilePopup user={user} />
            </div>
          </header>

          {/* Messages — full width, scrolls freely with the page */}
          <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

            {/* Suggested prompts */}
            {showSuggested && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '0.5rem' }}>
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => sendMessage(p)} style={{
                    background: 'var(--glass-bg)', border: '1px solid var(--border)',
                    borderRadius: '14px', padding: '1rem', textAlign: 'left',
                    cursor: 'pointer', color: 'var(--text-color)', fontSize: '0.88rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    transition: 'all 0.2s', lineHeight: 1.4
                  }}>
                    <i className='bx bx-sparkles' style={{ color: 'var(--primary)', fontSize: '1.2rem', flexShrink: 0 }}></i>
                    {p}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
              }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
                  background: msg.role === 'user' ? 'var(--primary)' : 'rgba(123, 63, 191, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', color: msg.role === 'user' ? '#fff' : 'var(--primary)',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none'
                }}>
                  <i className={msg.role === 'user' ? 'bx bx-user' : 'bx bx-bot'}></i>
                </div>
                <div style={{
                  background: msg.role === 'user' ? 'var(--primary)' : 'var(--glass-bg)',
                  padding: '1rem 1.25rem',
                  borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-color)',
                  maxWidth: '90%', lineHeight: '1.65', fontSize: '0.93rem'
                }} className={msg.role === 'assistant' ? 'markdown-body full-width-markdown' : ''}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
                  background: 'rgba(123, 63, 191, 0.12)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', color: 'var(--primary)'
                }}>
                  <i className='bx bx-bot'></i>
                </div>
                <div style={{
                  background: 'var(--glass-bg)', padding: '1rem 1.25rem',
                  borderRadius: '4px 18px 18px 18px', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <i className="bx bx-loader-alt bx-spin" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}></i>
                  Analyzing your sales data...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

        </div>
      </main>

      {/* INPUT BAR — truly fixed at viewport bottom, offset for sidebar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '280px',
        right: 0,
        padding: '1rem 3rem 1.25rem',
        borderTop: '1px solid var(--border)',
        background: 'var(--background)',
        zIndex: 200,
      }}>
        <div style={{ width: '100%' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your sales trends, peak times, or revenue strategies..."
              style={{
                flex: 1, background: 'var(--glass-bg)', border: '1px solid var(--border)',
                padding: '0.9rem 1.25rem', borderRadius: '12px',
                color: 'var(--text-main)', outline: 'none', fontSize: '0.95rem'
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="btn-primary"
              style={{ padding: '0 1.5rem', borderRadius: '12px', flexShrink: 0 }}
            >
              <i className="bx bx-send" style={{ fontSize: '1.2rem' }}></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
