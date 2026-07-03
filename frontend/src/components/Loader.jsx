import React from 'react';

const Loader = ({ fullScreen = false, text = "Loading..." }) => {
  return (
    <div 
      className={`loader-wrapper ${fullScreen ? 'loader-fullscreen' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
    >
      <div className="modern-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-dot"></div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;
