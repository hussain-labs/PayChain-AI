import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isCritical = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 9999 }}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth:'400px', textAlign:'center', padding:'2.5rem 2rem 2rem 2rem', position: 'relative' }}>
        <button 
          onClick={onCancel} 
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', transition: '0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-color)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <i className='bx bx-x' />
        </button>
        <div style={{ fontSize:'3rem', color: isCritical ? '#f87171' : 'var(--primary)', marginBottom:'1rem' }}>
          <i className={`bx ${isCritical ? 'bx-error-circle' : 'bx-question-mark'}`} />
        </div>
        <h3 style={{ margin:'0 0 1rem', fontSize:'1.2rem' }}>{title}</h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', margin:'0 0 1.5rem', lineHeight:'1.5' }}>
          {message}
        </p>
        <div style={{ display:'flex', gap:'1rem', justifyContent: 'center' }}>
          <button className="btn-primary" style={{ flex:1, background: isCritical ? '#ef4444' : '', maxWidth: '200px' }} onClick={() => { onConfirm(); onCancel(); }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
