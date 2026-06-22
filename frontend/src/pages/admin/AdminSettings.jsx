import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppSidebar from '../../components/AppSidebar';
import UserProfilePopup from '../../components/UserProfilePopup';
import NotificationBell from '../../components/NotificationBell';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token      = localStorage.getItem('token');
    if (!storedUser || !token) { navigate('/login'); return; }
    const u = JSON.parse(storedUser);
    if (!u.isAdmin) { navigate('/dashboard'); return; }
    setAdminUser(u);
  }, [navigate]);

  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/admin/settings"
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
              <h1>Admin Settings</h1>
              <p>Manage system configurations</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize:'1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <NotificationBell user={adminUser} />
              <UserProfilePopup user={adminUser} />
            </div>
          </header>

          <div style={{ marginTop: '2rem' }}>
            <div className="admin-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h3 className="admin-panel-title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
                <i className='bx bx-cog' style={{ color: '#6366f1', marginRight: '0.5rem' }} />
                System Configuration
              </h3>
              
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <i className='bx bx-wrench' style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }} />
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Admin Configuration Panel</h4>
                <p>System settings and global preferences will be manageable here in a future update.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
