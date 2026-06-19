import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppSidebar from '../components/AppSidebar';
import Pricing from '../components/Pricing';
import { useTheme } from '../context/ThemeContext';

const Upgrade = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  return (
    <div className="dashboard-layout">
      <AppSidebar 
        activeRoute="/upgrade" 
        user={user} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }}
      />
      
      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}>
              <i className='bx bx-menu' />
            </div>
            <div className="header-greeting">
              <h1>Upgrade Your Plan</h1>
              <p>Unlock higher limits, instant settlements, and priority support.</p>
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

          <div style={{ padding: '0 0 2rem 0' }}>
            <Pricing />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upgrade;
