import React, { useState, useEffect } from 'react';

const steps = [
  {
    icon: 'bx-network-chart',
    title: 'Querying Vector Database',
    desc: 'Matching transaction patterns against past data'
  },
  {
    icon: 'bx-link-alt',
    title: 'Fetching On-Chain History',
    desc: 'Analyzing recipient wallet on the blockchain'
  },
  {
    icon: 'bx-brain',
    title: 'AI Risk Analysis',
    desc: 'Evaluating fraud risk using AI model'
  }
];

const RiskAnalysisModal = ({ isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      const timer1 = setTimeout(() => setCurrentStep(1), 1500);
      const timer2 = setTimeout(() => setCurrentStep(2), 3000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <style>{`
        .risk-modal-content {
          background: var(--surface);
          border-radius: 20px;
          padding: 2.5rem;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }
        .risk-modal-content::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 6px;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          border-radius: 20px 20px 0 0;
        }
        .risk-step {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          opacity: 0.4;
          transition: all 0.4s ease;
          position: relative;
        }
        .risk-step.active {
          opacity: 1;
          transform: translateX(10px);
        }
        .risk-step.completed {
          opacity: 0.8;
        }
        .risk-step-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(123, 63, 191, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--primary);
          position: relative;
          z-index: 2;
        }
        .risk-step.completed .risk-step-icon {
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
        }
        .risk-step-connector {
          position: absolute;
          left: 23px;
          top: 48px;
          width: 2px;
          height: 1.5rem;
          background: var(--border);
          z-index: 1;
        }
        .risk-step.completed .risk-step-connector {
          background: #10B981;
        }
        .risk-title {
          font-weight: 700;
          color: var(--text-main);
          font-size: 0.95rem;
          margin: 0 0 0.2rem 0;
        }
        .risk-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }
        .spinner-active {
          animation: spin 2s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
      <div className="risk-modal-content">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <i className="bx bx-shield-quarter" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem' }}></i>
          <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-main)' }}>Securing Transaction</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Please wait while we verify this transfer.</p>
        </div>

        <div className="risk-steps-container">
          {steps.map((step, i) => {
            const isActive = currentStep === i;
            const isCompleted = currentStep > i;

            return (
              <div key={i} className={`risk-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="risk-step-icon">
                  {isCompleted ? (
                    <i className="bx bx-check"></i>
                  ) : isActive ? (
                    <i className="bx bx-loader-alt spinner-active"></i>
                  ) : (
                    <i className={`bx ${step.icon}`}></i>
                  )}
                </div>
                {i < steps.length - 1 && <div className="risk-step-connector"></div>}
                <div>
                  <h4 className="risk-title">{step.title}</h4>
                  <p className="risk-desc">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysisModal;
