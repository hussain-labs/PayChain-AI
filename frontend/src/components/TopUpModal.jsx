import toast from 'react-hot-toast';

const FAUCETS = [
  { name: 'Alchemy Sepolia Faucet', url: 'https://sepoliafaucet.com/', icon: 'bx-droplet', desc: 'Get 0.5 Sepolia ETH/day — requires sign-in' },
  { name: 'Google Cloud Faucet', url: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia', icon: 'bx-cloud', desc: 'Get 0.05 Sepolia ETH/day — fast & free' },
  { name: 'Chainlink Faucet', url: 'https://faucets.chain.link/sepolia', icon: 'bx-link', desc: 'Get testnet ETH + LINK tokens' },
  { name: 'Infura Faucet', url: 'https://www.infura.io/faucet/sepolia', icon: 'bx-server', desc: 'Get 0.5 Sepolia ETH/day — requires sign-in' },
];

const TopUpModal = ({ isOpen, onClose, walletAddress }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'var(--modal-overlay)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: 'var(--modal-bg)',
        border: '1px solid var(--modal-border)',
        borderRadius: '24px', padding: '2rem', width: '90%', maxWidth: '480px',
        position: 'relative',
        boxShadow: 'var(--modal-shadow)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '14px', right: '14px',
          background: 'transparent', border: 'none',
          color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer',
          transition: '0.2s'
        }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-color, var(--text-main))'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <i className='bx bx-x' />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #7B3FBF, #4B1D8F)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <i className='bx bx-plus-circle' style={{ fontSize: '1.8rem', color: '#fff' }} />
          </div>
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 700 }}>
            Top Up Wallet
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            <strong>Top Up</strong> means adding more crypto funds to your wallet. Since you're on the <strong style={{ color: '#a78bfa' }}>Sepolia Testnet</strong>, you can get free test ETH from a faucet in seconds.
          </p>
        </div>

        {/* Your address */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Your Wallet Address
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: 'var(--input-surface, rgba(248,246,255,0.9))',
            padding: '0.85rem 1rem',
            borderRadius: '12px', border: '1px solid var(--modal-border)'
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-main)', flex: 1, wordBreak: 'break-all' }}>
              {walletAddress}
            </span>
            <button
              onClick={() => { navigator.clipboard.writeText(walletAddress); toast.success('Wallet address copied!'); }}
              style={{
                background: 'var(--primary)', border: 'none', borderRadius: '8px',
                width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', cursor: 'pointer', flexShrink: 0,
                transition: 'transform 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <i className='bx bx-copy' style={{ fontSize: '1rem' }} />
            </button>
          </div>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Copy this address and paste it on the faucet website below
          </p>
        </div>

        {/* How it works */}
        <div style={{
          background: 'rgba(123,63,191,0.06)', border: '1px solid rgba(123,63,191,0.2)',
          borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9b6de3', marginBottom: '0.6rem' }}>
            <i className='bx bx-info-circle' style={{ marginRight: '0.4rem' }} />How it works
          </div>
          {['Visit one of the faucet links below', 'Paste your wallet address', 'Click "Send ETH" or "Request"', 'Wait ~30 seconds — ETH arrives in your wallet!'].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: i < 3 ? '0.4rem' : 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ fontWeight: 700, color: '#9b6de3', flexShrink: 0 }}>{i + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>

        {/* Faucet links */}
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Free Testnet ETH Faucets
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {FAUCETS.map((f, i) => (
              <a
                key={i}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.9rem 1rem', borderRadius: '12px', textDecoration: 'none',
                  background: 'var(--input-surface, rgba(248,246,255,0.7))',
                  border: '1px solid var(--modal-border)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(123,63,191,0.1)'; e.currentTarget.style.borderColor = 'rgba(123,63,191,0.4)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'var(--input-surface, rgba(248,246,255,0.7))'; e.currentTarget.style.borderColor = 'var(--modal-border)'; }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(123,63,191,0.2), rgba(75,29,143,0.2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <i className={`bx ${f.icon}`} style={{ fontSize: '1.2rem', color: '#9b6de3' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{f.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{f.desc}</div>
                </div>
                <i className='bx bx-link-external' style={{ color: 'var(--text-muted)', fontSize: '1rem', flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpModal;
