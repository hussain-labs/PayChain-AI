import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

/**
 * AppSidebar – shared sidebar used across all dashboard pages.
 * Props:
 *   activeRoute  : string – the route path to mark as active, e.g. '/dashboard'
 *   user         : object – the logged-in user (for admin links)
 *   isOpen       : bool   – mobile overlay open state
 *   onClose      : fn     – close the mobile overlay
 *   onLogout     : fn     – logout handler
 */
const AppSidebar = ({ activeRoute = '/dashboard', user, isOpen, onClose, onLogout }) => {
  // Persist collapsed state in localStorage so it survives navigation
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebarCollapsed') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('sidebarCollapsed', collapsed); } catch { }
  }, [collapsed]);

  const nav = (href, icon, label) => (
    <Link
      to={href}
      className={href === activeRoute ? 'active' : ''}
      onClick={onClose}
      title={collapsed ? label : undefined}
    >
      <i className={icon} />
      <span className="nav-label"> {label}</span>
    </Link>
  );

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        {/* Header */}
        <div className="sidebar-header" style={{
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          justifyContent: collapsed ? 'center' : 'space-between',
          alignItems: 'center',
          gap: collapsed ? '0.75rem' : '0.4rem',
          marginBottom: '2rem',
          width: '100%',
        }}>
          {/* Logo */}
          <div className="sidebar-logo" style={{ marginBottom: 0, fontSize: collapsed ? '1.6rem' : undefined, display: 'flex', justifyContent: 'center' }}>
            <i className='bx bx-link' />
            {!collapsed && <> Pay<span>Chain</span></>}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {/* Collapse / Expand toggle button */}
            <button
              className="sidebar-toggle-btn"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setCollapsed(c => !c)}
            >
              <i className='bx bx-chevrons-left' />
            </button>

            {/* Close button (mobile) – only when expanded */}
            {!collapsed && (
              <button className="sidebar-close-btn" onClick={onClose}>
                <i className='bx bx-x' />
              </button>
            )}
          </div>
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          {nav(user?.isAdmin ? '/admin/dashboard' : '/dashboard', 'bx bx-grid-alt', 'Overview')}
          {!user?.isAdmin && (
            <>
              {nav('/pos', 'bx bx-scan', 'POS Mode')}
              {nav('/transfers', 'bx bx-transfer', 'Transfers')}
              {nav('/cards', 'bx bx-credit-card', 'Cards')}
              {nav('/statistics', 'bx bx-line-chart', 'Statistics')}
              {nav('/upgrade', 'bx bx-up-arrow-circle', 'Upgrade')}
              {nav('/notifications', 'bx bx-bell', 'Notifications')}
              {nav('/settings', 'bx bx-cog', 'Settings')}
              {nav('/support', 'bx bx-help-circle', 'Support')}
            </>
          )}
          {user?.isAdmin && (
            <>
              <div
                className="sidebar-section-label"
                style={{ padding: '1rem 1rem 0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}
              >
                Admin
              </div>
              {nav('/admin/users', 'bx bx-user-circle', 'Users')}
              {nav('/admin/support', 'bx bx-message-square-detail', 'Tickets')}
              {nav('/admin/settings', 'bx bx-cog', 'Settings')}
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={onLogout}>
            <i className='bx bx-log-out' />
            <span className="logout-label"> Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
