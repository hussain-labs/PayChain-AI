import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import AppSidebar from '../components/AppSidebar';
import NotificationBell from '../components/NotificationBell';
import UserProfilePopup from '../components/UserProfilePopup';

const API = 'http://localhost:5000';

const POSMode = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [savedWallets, setSavedWallets] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [selectedWallet, setSelectedWallet] = useState('');
  const [fiatAmount, setFiatAmount] = useState('0.00');
  const [ethPrice, setEthPrice] = useState(0);

  // Auth & initial data load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));

    // Fetch wallets
    fetch(`${API}/api/wallets`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => {
        if (r.status === 401) {
          localStorage.clear();
          navigate('/login');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (Array.isArray(d)) {
          setSavedWallets(d);
          if (d.length > 0) {
            setSelectedWallet(d[0].address);
          }
        }
      })
      .catch(console.error);

    // Fetch ETH price
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      .then(res => res.json())
      .then(data => {
        if (data && data.ethereum && data.ethereum.usd) {
          setEthPrice(data.ethereum.usd);
        }
      })
      .catch(err => {
        console.error('Failed to fetch ETH price:', err);
        // Fallback price if API fails
        setEthPrice(1620.62); 
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleCopyUri = () => {
    if (!paymentUri) return;
    navigator.clipboard.writeText(paymentUri);
    toast.success('URI copied to clipboard');
  };

  // Format wallet address
  const formatAddress = (addr) => addr ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : '';

  // Handle amount change ensuring it's a valid number format
  const handleAmountChange = (e) => {
    const val = e.target.value;
    // Allow numbers and a single decimal point
    if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
      setFiatAmount(val);
    }
  };

  // Calculate ETH equivalent and construct URI
  const { ethAmount, paymentUri } = useMemo(() => {
    const amountNum = parseFloat(fiatAmount) || 0;
    const ethCalc = ethPrice > 0 ? amountNum / ethPrice : 0;
    
    // Construct URI: ethereum:<address>[?value=<wei>]
    let uri = '';
    if (selectedWallet) {
      uri = `ethereum:${selectedWallet}`;
      if (ethCalc > 0) {
        // Convert ETH to Wei (1e18)
        const weiStr = (ethCalc * 1e18).toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 0 });
        uri += `?value=${weiStr}`;
      }
    }

    return {
      ethAmount: ethCalc.toFixed(4),
      paymentUri: uri
    };
  }, [fiatAmount, ethPrice, selectedWallet]);

  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/pos"
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}>
              <i className='bx bx-menu' />
            </div>
            <div className="header-greeting">
              <h1>Point of Sale</h1>
              
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize: '1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <NotificationBell user={user} />
              <UserProfilePopup user={user} />
            </div>
          </header>

          <div className="page-header-description" style={{ margin: "-1rem 0 0.5rem 0", color: "var(--text-muted)", padding: "0 1rem" }}>
            <p>Turn your device into a Web3 cash register.</p>
          </div>

          <div className="dashboard-grid pos-grid" style={{ alignItems: 'stretch' }}>
            
            {/* Payment Details Panel */}
            <div className="glass-panel pos-panel" style={{ borderRadius: '24px', background: theme === 'dark' ? 'var(--glass-bg, rgba(255,255,255,0.05))' : '#FFFFFF', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ textAlign: 'center', margin: '0 0 2rem 0', fontSize: '1.5rem', fontWeight: 700 }}>Payment Details</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                
                {/* Wallet Selector */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.95rem' }}>Receiving Wallet</label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: 'var(--glass-bg, rgba(255,255,255,0.05))',
                      color: 'var(--text-color)',
                      fontSize: '1rem',
                      appearance: 'none'
                    }}
                  >
                    {savedWallets.length === 0 && <option value="">No wallets saved</option>}
                    {savedWallets.map(w => (
                      <option key={w.address} value={w.address}>
                        {w.nickname} ({formatAddress(w.address)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fiat Amount Input */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.95rem' }}>Amount to Request (USD)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '1rem', fontSize: '1.5rem', color: 'var(--text-muted)' }}>$</span>
                    <input
                      type="text"
                      value={fiatAmount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 2.5rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        background: 'var(--glass-bg, rgba(255,255,255,0.05))',
                        color: 'var(--text-color)',
                        fontSize: '2rem',
                        fontWeight: 700,
                        minWidth: 0
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    ≈ {ethAmount} ETH (@ ${ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/ETH)
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}></div>

                {/* Info Box */}
                <div style={{ 
                  background: 'rgba(123, 63, 191, 0.1)', 
                  border: '1px solid rgba(123, 63, 191, 0.3)', 
                  borderRadius: '12px', 
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start'
                }}>
                  <i className='bx bx-info-circle' style={{ color: '#a855f7', fontSize: '1.25rem', marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Customers can scan the generated QR code with their mobile Web3 wallet. The exact Ethereum amount and your wallet address will automatically populate in their app.
                  </p>
                </div>

              </div>
            </div>

            {/* QR Code Panel */}
            <div className="glass-panel pos-panel" style={{ borderRadius: '24px', background: theme === 'dark' ? 'var(--glass-bg, rgba(255,255,255,0.05))' : '#FFFFFF', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px' }}>
              
              <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
                {paymentUri ? (
                  <QRCodeSVG 
                    value={paymentUri} 
                    size={280} 
                    level={"H"}
                    includeMargin={false}
                  />
                ) : (
                  <div style={{ width: 280, height: 280, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Select a wallet</p>
                  </div>
                )}
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>
                Scan or Copy URI to Pay
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--glass-bg, rgba(255,255,255,0.05))', border: '1px solid var(--border)', borderRadius: '24px', padding: '0.5rem 0.5rem 0.5rem 1rem', width: '100%', maxWidth: '360px' }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  {paymentUri || 'Select a wallet to generate URI'}
                </span>
                <button
                  onClick={handleCopyUri}
                  disabled={!paymentUri}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: paymentUri ? 'var(--text-color)' : 'var(--text-muted)',
                    cursor: paymentUri ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem',
                    borderRadius: '50%'
                  }}
                  title="Copy URI"
                >
                  <i className='bx bx-copy' style={{ fontSize: '1.2rem' }} />
                </button>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default POSMode;
