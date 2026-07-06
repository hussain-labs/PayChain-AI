import UserProfilePopup from '../components/UserProfilePopup';
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
              
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize:'1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <button className="icon-btn"><i className='bx bx-bell' /></button>
              <UserProfilePopup user={user} />
            </div>
          </header>

          <div className="page-header-description" style={{ margin: "-1rem 0 2rem 0", color: "var(--text-muted)", padding: "0 1rem" }}>
            <p>Unlock higher limits, instant settlements, and priority support.</p>
          </div>

          <div style={{ padding: '0 0 2rem 0' }}>
            <Pricing />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upgrade;
