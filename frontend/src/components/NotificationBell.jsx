import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const NotificationBell = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(user?.notifications || []);
  const wrapperRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.notifications) {
      setNotifications(user.notifications);
    }
  }, [user]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close when routing changes
  useEffect(() => { setIsOpen(false); }, [location]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (index) => {
    if (!notifications[index]) return;
    const notif = notifications[index];

    // Optimistic update
    const newNotifs = [...notifications];
    newNotifs[index].isRead = true;
    setNotifications(newNotifs);

    // We update localstorage as well to persist without extra fetch
    if (user) {
      const u = { ...user, notifications: newNotifs };
      localStorage.setItem('user', JSON.stringify(u));
    }

    // Navigate if there is a link
    if (notif.link) {
      setIsOpen(false);
      navigate(notif.link);
    }
  };

  const markAllAsRead = () => {
    const newNotifs = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(newNotifs);
    if (user) {
      const u = { ...user, notifications: newNotifs };
      localStorage.setItem('user', JSON.stringify(u));
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        className="icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative' }}
      >
        <i className='bx bx-bell' />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '2px', right: '2px',
            width: '8px', height: '8px',
            background: '#ef4444',
            borderRadius: '50%',
            border: '2px solid var(--bg)',
            boxSizing: 'content-box'
          }} />
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 15px)',
          right: '-10px',
          width: '320px',
          maxWidth: 'calc(100vw - 2rem)',
          background: 'var(--glass-bg, rgba(255,255,255,0.85))',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'fadeInDown 0.2s ease-out',
          zIndex: 9999,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <i className='bx bx-bell-off' style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }} />
                <div>No notifications yet</div>
              </div>
            ) : (
              [...notifications].reverse().map((n, i) => {
                const originalIndex = notifications.length - 1 - i;
                return (
                  <div
                    key={i}
                    onClick={() => markAsRead(originalIndex)}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--border)',
                      background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.05)',
                      cursor: n.isRead ? 'default' : 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.isRead ? 'transparent' : 'var(--primary)', marginTop: '6px', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-color)', fontWeight: n.isRead ? 500 : 700, lineHeight: 1.4, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
