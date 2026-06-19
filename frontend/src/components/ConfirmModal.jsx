import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isCritical = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 9999 }}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth:'400px', textAlign:'center', padding:'2rem' }}>
        <div style={{ fontSize:'3rem', color: isCritical ? '#f87171' : 'var(--primary)', marginBottom:'1rem' }}>
          <i className={`bx ${isCritical ? 'bx-error-circle' : 'bx-question-mark'}`} />
        </div>
        <h3 style={{ margin:'0 0 1rem', fontSize:'1.2rem' }}>{title}</h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', margin:'0 0 1.5rem', lineHeight:'1.5' }}>
          {message}
        </p>
        <div style={{ display:'flex', gap:'1rem' }}>
          <button className="btn-secondary" style={{ flex:1 }} onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn-primary" style={{ flex:1, background: isCritical ? '#ef4444' : '' }} onClick={() => { onConfirm(); onCancel(); }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
