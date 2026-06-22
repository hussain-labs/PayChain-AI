import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppSidebar from '../components/AppSidebar';
import UserProfilePopup from '../components/UserProfilePopup';
import NotificationBell from '../components/NotificationBell';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const Notifications = () => {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      navigate('/');
      return;
    }
    const u = JSON.parse(userStr);
    setUser(u);
  }, [navigate]);

  if (!user) return <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-color)' }}>Loading...</div>;

  const notifications = user.notifications || [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const markAsRead = (index) => {
    const notif = notifications[index];
    if (!notif) return;
    
    const newNotifs = [...notifications];
    newNotifs[index].isRead = true;
    
    const updatedUser = { ...user, notifications: newNotifs };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const markAllAsRead = () => {
    const newNotifs = notifications.map(n => ({ ...n, isRead: true }));
    const updatedUser = { ...user, notifications: newNotifs };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success('All notifications marked as read');
  };

  return (
    <div className="dashboard-layout">
      <AppSidebar 
        activeRoute="/notifications" 
        user={user} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={handleLogout} 
      />

      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}>
              <i className='bx bx-menu' />
            </div>
            <div className="header-greeting">
              <h1>Notifications</h1>
              <p>Your recent activity and system updates</p>
            </div>
            
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize: '1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <NotificationBell user={user} />
              <UserProfilePopup user={user} />
            </div>
          </header>

        <div className="dashboard-content" style={{ width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>All Notifications</h2>
            {notifications.some(n => !n.isRead) && (
              <button 
                onClick={markAllAsRead}
                style={{ background: 'transparent', color: 'var(--primary)', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <i className='bx bx-check-double' style={{ fontSize: '1.2rem' }} /> Mark all as read
              </button>
            )}
          </div>

          <div style={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <i className='bx bx-bell-off' style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5, display: 'block' }} />
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>No notifications yet</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>When you get updates, they'll show up here.</p>
              </div>
            ) : (
              [...notifications].reverse().map((n, i) => {
                const originalIndex = notifications.length - 1 - i;
                return (
                  <div 
                    key={i} 
                    onClick={() => markAsRead(originalIndex)}
                    style={{ 
                      padding: '1.25rem 1.5rem', 
                      borderBottom: i === notifications.length - 1 ? 'none' : '1px solid var(--border)', 
                      background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.05)',
                      cursor: n.link ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      background: n.isRead ? 'transparent' : 'var(--primary)', 
                      marginTop: '8px', 
                      flexShrink: 0 
                    }} />
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '1rem', 
                        color: 'var(--text-color)', 
                        fontWeight: n.isRead ? 500 : 700, 
                        lineHeight: 1.5,
                        marginBottom: '0.3rem'
                      }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <i className='bx bx-time-five' />
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {n.link && (
                      <div style={{ color: 'var(--primary)', opacity: 0.7, padding: '0.5rem' }}>
                        <i className='bx bx-chevron-right' style={{ fontSize: '1.5rem' }} />
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
