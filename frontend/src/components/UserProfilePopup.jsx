import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';

const UserProfilePopup = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState({});
  const triggerRef = useRef(null);
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Calculate popup position based on the avatar button position
  const openPopup = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopupStyle({
        position: 'fixed',
        top: rect.bottom + 12,
        right: window.innerWidth - rect.right,
        zIndex: 99999,
        width: '290px',
      });
    }
    setIsOpen(prev => !prev);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target) &&
        popupRef.current && !popupRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    setShowLogoutConfirm(true);
  };

  const getLimitText = () => {
    const plan = user?.plan || 'free';
    const used = user?.transactionCount || 0;
    const bonus = user?.bonusTransactions || 0;
    const base = plan === 'free' ? 3 : plan === 'pro' ? 1000 : null;
    
    if (base === null) return 'Unlimited';
    return `${used} / ${base} Used ${bonus > 0 ? `(+${bonus} Bonus)` : ''}`;
  };

  const getLimitPercentage = () => {
    const plan = user?.plan || 'free';
    const used = user?.transactionCount || 0;
    const bonus = user?.bonusTransactions || 0;
    const base = plan === 'free' ? 3 : plan === 'pro' ? 1000 : null;
    
    if (base === null) return 0;
    return Math.min(100, (used / (base + bonus)) * 100);
  };

  // Calculate time until 1st of next month (01:00 AM UTC) — when monthly reset fires
  const getNextResetText = () => {
    const now = new Date();
    const nextReset = new Date(Date.UTC(
      now.getUTCMonth() === 11 ? now.getUTCFullYear() + 1 : now.getUTCFullYear(),
      now.getUTCMonth() === 11 ? 0 : now.getUTCMonth() + 1,
      1, 1, 0, 0, 0   // 1st of next month at 01:00 AM UTC
    ));

    const diffMs = nextReset - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffH  = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffM  = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 1) return `Resets in ${diffDays}d ${diffH}h`;
    if (diffDays === 1) return `Resets in 1d ${diffH}h`;
    if (diffH > 0) return `Resets in ${diffH}h ${diffM}m`;
    return `Resets in ${diffM}m`;
  };

  const avatarSrc = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4B1D8F&color=fff`;
  const pct = getLimitPercentage();

  const popupContent = (
    <div
      ref={popupRef}
      style={{
        ...popupStyle,
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        background: 'var(--modal-bg, #fff)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'fadeInDown 0.15s ease-out',
      }}
    >
      {/* User info row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.2rem' }}>
        <img src={avatarSrc} alt="User" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
        </div>
        {user?.isAdmin ? (
          <div style={{ marginLeft: 'auto', flexShrink: 0, background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)' }}>
            ADMIN
          </div>
        ) : (user?.plan === 'pro' || user?.plan === 'pro_plus') && (
          <div style={{ marginLeft: 'auto', flexShrink: 0, background: 'linear-gradient(45deg, #f59e0b, #fbbf24)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '10px' }}>
            {user.plan === 'pro_plus' ? 'PRO+' : 'PRO'}
          </div>
        )}
      </div>

      {/* Usage card - Hidden for Admin */}
      {!user?.isAdmin && (
        <div style={{ background: 'var(--surface, rgba(0,0,0,0.04))', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.6rem', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-color)' }}>
                {user?.plan === 'pro_plus' ? 'Enterprise' : user?.plan === 'pro' ? 'Business Pro' : 'Starter Plan'}
              </span>
              <span style={{ fontSize: '0.78rem', color: pct >= 100 ? '#ef4444' : 'var(--text-color)', fontWeight: 700 }}>
                {user?.transactionCount || 0} / {user?.plan === 'free' ? 3 : user?.plan === 'pro' ? 1000 : '∞'} Used
              </span>
            </div>
            {user?.bonusTransactions > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 700 }}>
                +{user.bonusTransactions} Bonus Transactions
              </div>
            )}
          </div>

          {user?.plan !== 'pro_plus' && (
            <div style={{ width: '100%', height: '7px', background: 'var(--border, #e5e7eb)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: pct >= 100 ? '#ef4444' : pct >= 70 ? '#f59e0b' : 'var(--primary)',
                transition: 'width 0.4s ease',
                borderRadius: '4px',
              }} />
            </div>
          )}
          {pct >= 100 && user?.plan !== 'pro_plus' && (
            <p style={{ fontSize: '0.72rem', color: '#ef4444', margin: '0.5rem 0 0' }}>⚠️ Limit reached! Upgrade your plan.</p>
          )}
          {(user?.plan === 'free' || user?.plan === 'pro') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.6rem' }}>
              <i className='bx bx-time-five' style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{getNextResetText()} (resets monthly)</span>
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      {user?.isAdmin && (
        <button
          onClick={() => { setIsOpen(false); navigate('/settings'); }}
          style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', padding: '0.7rem', borderRadius: '8px', color: 'var(--text-color)', cursor: 'pointer', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.88rem', transition: 'background 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--surface)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <i className='bx bx-user' /> Profile
        </button>
      )}

      {!user?.isAdmin && (
        <button
          onClick={() => { setIsOpen(false); navigate('/upgrade'); }}
          style={{ width: '100%', background: 'var(--primary)', border: 'none', padding: '0.7rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.88rem', transition: 'opacity 0.2s' }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          <i className='bx bx-up-arrow-circle' /> Upgrade Plan
        </button>
      )}

      <button
        onClick={() => { setIsOpen(false); navigate(user?.isAdmin ? '/admin/settings' : '/settings'); }}
        style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', padding: '0.7rem', borderRadius: '8px', color: 'var(--text-color)', cursor: 'pointer', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.88rem', transition: 'background 0.2s' }}
        onMouseOver={e => e.currentTarget.style.background = 'var(--surface)'}
        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
      >
        <i className='bx bx-cog' /> Settings
      </button>

      <button
        onClick={handleLogoutClick}
        style={{ width: '100%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.7rem', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.88rem', transition: 'background 0.2s' }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
      >
        <i className='bx bx-log-out' /> Log Out
      </button>
    </div>
  );

  return (
    <>
      {/* Avatar trigger button */}
      <div ref={triggerRef} style={{ position: 'relative', cursor: 'pointer' }} onClick={openPopup} className="user-profile">
        <img src={avatarSrc} alt="User" />
        {user?.isAdmin ? (
          <div style={{
            position: 'absolute', bottom: '-4px', right: '-8px',
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            color: '#fff', fontSize: '0.55rem', fontWeight: 800,
            padding: '2px 5px', borderRadius: '10px',
            border: '2px solid var(--surface)', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
            pointerEvents: 'none',
          }}>
            ADMIN
          </div>
        ) : (user?.plan === 'pro' || user?.plan === 'pro_plus') && (
          <div style={{
            position: 'absolute', bottom: '-4px', right: '-4px',
            background: 'linear-gradient(45deg, #f59e0b, #fbbf24)',
            color: '#fff', fontSize: '0.6rem', fontWeight: 800,
            padding: '2px 6px', borderRadius: '10px',
            border: '2px solid var(--surface)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
          }}>
            {user.plan === 'pro_plus' ? 'PRO+' : 'PRO'}
          </div>
        )}
      </div>

      {/* Popup rendered via portal directly at body level to escape overflow clipping */}
      {isOpen && createPortal(popupContent, document.body)}

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        isCritical={true}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default UserProfilePopup;
