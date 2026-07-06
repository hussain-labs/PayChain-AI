import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  const [loadingText, setLoadingText] = useState('Analyzing your sales data...');
  const abortControllerRef = useRef(null);
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

  const stopAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const sendMessage = async (text) => {
    const userMessage = text.trim();
    if (!userMessage) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    const loadingTexts = [
      'Analyzing your sales data...',
      'Searching Vector Database...',
      'Getting data...',
      'Recognizing patterns...',
      'Generating insights...'
    ];
    let textIndex = 0;
    setLoadingText(loadingTexts[0]);
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[textIndex]);
    }, 1500);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/analytics/advisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage }),
        signal: abortControllerRef.current.signal
      });

      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        toast.error(data.error || "Failed to fetch insights");
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => [...prev, { role: 'assistant', content: "Analysis stopped by user. What else can I help you with?" }]);
      } else {
        toast.error("Network error");
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm currently unreachable. Please try again later." }]);
      }
    } finally {
      clearInterval(textInterval);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="dashboard-layout">
      <AppSidebar activeRoute="/ai-advisor" user={user} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />

      <main className="dashboard-main fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Scrollable content area with bottom padding for fixed input */}
        <div className="dashboard-content-wrapper" style={{ paddingBottom: '90px', flex: 1 }}>

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
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
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
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem',
                  fontSize: '0.93rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="bx bx-loader-alt bx-spin" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}></i>
                    {loadingText}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* INPUT BAR — sticky at bottom of scroll container, takes exact width of parent automatically */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          padding: '1rem 3rem 1.25rem',
          borderTop: '1px solid var(--border)',
          background: 'var(--background)',
          zIndex: 200,
          width: '100%',
        }}>
          {/* Permanent Suggested Chips */}
          <div style={{
            display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem',
            marginBottom: '0.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none'
          }}>
            {SUGGESTED_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p)} style={{
                background: 'var(--glass-bg)', border: '1px solid var(--border)',
                borderRadius: '20px', padding: '0.5rem 1rem', whiteSpace: 'nowrap',
                cursor: 'pointer', color: 'var(--text-color)', fontSize: '0.82rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
                transition: 'all 0.2s'
              }} className="hover-brightness">
                <i className='bx bx-sparkles' style={{ color: 'var(--primary)', fontSize: '1rem' }}></i>
                {p}
              </button>
            ))}
          </div>

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
            {isLoading ? (
              <button
                type="button"
                onClick={stopAnalysis}
                className="btn-primary"
                style={{ padding: '0 1.5rem', borderRadius: '12px', flexShrink: 0, background: 'var(--surface)', color: 'var(--text-color)', border: '1px solid var(--border)' }}
                title="Stop Analysis"
              >
                <i className="bx bx-stop" style={{ fontSize: '1.4rem' }}></i>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="btn-primary"
                style={{ padding: '0 1.5rem', borderRadius: '12px', flexShrink: 0 }}
              >
                <i className="bx bx-send" style={{ fontSize: '1.2rem' }}></i>
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default AIAdvisor;
