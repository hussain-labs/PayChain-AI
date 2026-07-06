import React, { useState, useEffect } from 'react';
import AppSidebar from '../components/AppSidebar';
import UserProfilePopup from '../components/UserProfilePopup';
import { useWeb3Auth } from '../hooks/useWeb3Auth';
import { useNavigate } from 'react-router-dom';
import { useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';
const API = 'http://localhost:5000';

const Escrow = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const user = JSON.parse(localStorage.getItem('user'));
  const [escrows, setEscrows] = useState([]);
  const [savedWallets, setSavedWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { address: web3Address, isConnected, connector } = useWeb3Auth();
  const { sendTransactionAsync } = useSendTransaction();

  const isRelatedWallet = (nickname, connectorName) => {
    if (!connectorName || !nickname) return true;
    const n = nickname.toLowerCase().replace(/\s/g, '');
    const c = connectorName.toLowerCase().replace(/\s/g, '');

    if (c.includes('metamask') && n.includes('metamask')) return true;
    if (c.includes('okx') && n.includes('okx')) return true;
    if (c.includes('binance') && n.includes('binance')) return true;
    if (c.includes('trust') && n.includes('trust')) return true;
    if (c.includes('kucoin') && n.includes('kucoin')) return true;
    if (c.includes('kraken') && n.includes('kraken')) return true;
    if (c.includes('coinbase') && n.includes('coinbase')) return true;

    if (!['metamask', 'okx', 'binance', 'trust', 'kucoin', 'kraken', 'coinbase'].some(key => c.includes(key))) {
      return true;
    }
    return false;
  };

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('ETH');
  const [buyerWallet, setBuyerWallet] = useState('');
  const [sellerWallet, setSellerWallet] = useState('');
  const [role, setRole] = useState('buyer'); // Am I the buyer or seller?

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [escrowRes, userRes] = await Promise.all([
        fetch(`${API}/api/escrows`, { headers }),
        fetch(`${API}/api/user/profile`, { headers })
      ]);

      if (escrowRes.ok) {
        const escrowData = await escrowRes.json();
        setEscrows(escrowData);
      }
      
      if (userRes.ok) {
        const userData = await userRes.json();
        setSavedWallets(userData.savedWallets || []);
        // Auto-select first wallet if available
        if (userData.savedWallets && userData.savedWallets.length > 0) {
          if (role === 'buyer') setBuyerWallet(userData.savedWallets[0].address);
          else setSellerWallet(userData.savedWallets[0].address);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch escrows when form submitted
  const fetchEscrows = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/escrows`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setEscrows(await res.json());
    } catch (err) {}
  };

  const handleDeploy = async (e) => {
    e.preventDefault();
    
    // Ensure we capture the dropdown's visual value even if the user didn't trigger onChange
    const finalBuyerWallet = buyerWallet || (role === 'buyer' && buyerAvailableWallets.length > 0 ? buyerAvailableWallets[0].address : '');
    const finalSellerWallet = sellerWallet || (role === 'seller' && savedWallets.length > 0 ? savedWallets[0].address : '');

    if (!title || !amount || !finalBuyerWallet || !finalSellerWallet) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/escrows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: title.trim(), 
          description: description.trim(), 
          amount, 
          asset, 
          buyerWallet: finalBuyerWallet.trim(), 
          sellerWallet: finalSellerWallet.trim(), 
          role 
        })
      });
      if (res.ok) {
        setTitle(''); setDescription(''); setAmount(''); setBuyerWallet(''); setSellerWallet('');
        toast.success('Escrow Smart Contract Deployed!');
        fetchEscrows();
      } else {
        const data = await res.json();
        toast.error(`Error: ${data.error || 'Failed to deploy'}`);
      }
    } catch (err) {
      console.error('Failed to deploy', err);
      toast.error('Network error occurred.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/escrows/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchEscrows();
      } else {
        const data = await res.json();
        toast.error(`Error: ${data.error || 'Failed to update escrow status'}`);
      }
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Network error occurred.');
    }
  };

  const handleFund = async (escrow) => {
    try {
      if (web3Address && escrow.buyerWallet && web3Address.toLowerCase() !== escrow.buyerWallet.toLowerCase()) {
        const matchedWallet = savedWallets.find(w => w.address.toLowerCase() === escrow.buyerWallet.toLowerCase());
        const walletName = matchedWallet ? matchedWallet.nickname : escrow.buyerWallet.slice(0, 6) + '...';
        toast.error(`You selected ${walletName} as the Buyer, but your active MetaMask account is ${web3Address.slice(0,6)}... Please open your MetaMask extension and switch to the correct account to proceed.`);
        return;
      }

      // Trigger MetaMask to actually transfer the amount to the contract address
      const txHash = await sendTransactionAsync({
        to: escrow.contractAddress,
        value: parseEther(escrow.amount.toString()),
      });
      console.log('Transaction sent:', txHash);
      // Once the user approves and the tx is sent, update backend state
      updateStatus(escrow._id, 'funded');
    } catch (err) {
      console.error('User rejected transaction or it failed', err);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Handle role change to auto-select wallet
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    
    if (savedWallets.length > 0) {
      if (newRole === 'buyer') {
        const available = savedWallets.filter(w => isConnected && isRelatedWallet(w.nickname, connector?.name));
        setBuyerWallet(available.length > 0 ? available[0].address : '');
        setSellerWallet('');
      } else {
        setSellerWallet(savedWallets[0].address);
        setBuyerWallet('');
      }
    }
  };

  const buyerAvailableWallets = savedWallets.filter(w => isConnected && isRelatedWallet(w.nickname, connector?.name));

  return (
    <div className="dashboard-layout">
      <AppSidebar 
        activeRoute="/escrow" 
        user={user} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onLogout={handleLogout} 
      />

      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}>
              <i className='bx bx-menu'></i>
            </div>
            <div className="header-greeting">
              <h1>High-Ticket Escrow</h1>
              <p>Secure decentralized locking for high-value sales.</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme}><i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} /></button>
              <button className="icon-btn"><i className='bx bx-bell' /></button>
              <UserProfilePopup user={user} />
            </div>
          </header>

          <div className="dashboard-grid">
            
            {/* Create Escrow Form */}
            <div className="glass-panel" style={{ gridColumn: 'span 1', alignSelf: 'flex-start' }}>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}><i className='bx bx-info-circle'></i> How Escrow Works</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  When you fund an escrow, the ETH is <b>NOT</b> sent to the seller. It is securely locked inside the Smart Contract. The seller ships the item with peace of mind. Only when the buyer receives the item and clicks "Release", does the contract forward the funds to the seller.
                </p>
              </div>
              <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Create Escrow Contract</h2>
              </div>
              <form onSubmit={handleDeploy} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Item / Service Title</label>
                  <input type="text" className="form-input" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Rolex Submariner" />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" step="0.01" className="form-input" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="5.00" />
                    <select className="form-input" style={{ width: '100px' }} value={asset} onChange={(e) => setAsset(e.target.value)}>
                      <option value="ETH">ETH</option>
                      <option value="USDT">USDT</option>
                      <option value="USDC">USDC</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Your Role</label>
                  <select className="form-input" value={role} onChange={handleRoleChange}>
                    <option value="buyer">I am the Buyer</option>
                    <option value="seller">I am the Merchant/Seller</option>
                  </select>
                </div>

                {savedWallets.length === 0 ? (
                  <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid #ef4444' }}>
                    <i className='bx bx-error-circle'></i> Firstly connect your account and add a wallet from the Dashboard!
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Buyer Wallet Address</label>
                      {role === 'buyer' ? (
                        buyerAvailableWallets.length > 0 ? (
                          <select className="form-input" required value={buyerWallet} onChange={(e) => setBuyerWallet(e.target.value)}>
                            {buyerAvailableWallets.map(w => <option key={w._id || w.address} value={w.address}>{w.nickname || 'Wallet'} ({w.address.slice(0,6)}...{w.address.slice(-4)})</option>)}
                          </select>
                        ) : (
                          <div style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem' }}>
                            <i className='bx bx-error-circle'></i> Please connect one of your saved wallets via MetaMask to act as a Buyer.
                          </div>
                        )
                      ) : (
                        <input type="text" className="form-input" required value={buyerWallet} onChange={(e) => setBuyerWallet(e.target.value)} placeholder="0x..." />
                      )}
                    </div>
                    <div className="form-group">
                      <label>Merchant Wallet Address</label>
                      {role === 'seller' ? (
                        <select className="form-input" required value={sellerWallet} onChange={(e) => setSellerWallet(e.target.value)}>
                          {savedWallets.map(w => <option key={w._id || w.address} value={w.address}>{w.nickname || 'Wallet'} ({w.address.slice(0,6)}...{w.address.slice(-4)})</option>)}
                        </select>
                      ) : (
                        <input type="text" className="form-input" required value={sellerWallet} onChange={(e) => setSellerWallet(e.target.value)} placeholder="0x..." />
                      )}
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={role === 'buyer' && buyerAvailableWallets.length === 0}>Deploy Smart Contract</button>
                  </>
                )}
              </form>
            </div>

            {/* Active Escrows */}
            <div className="glass-panel" style={{ gridColumn: 'span 1', alignSelf: 'flex-start' }}>
              <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Active Escrows</h2>
              </div>
              {loading ? <p>Loading...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '65vh', overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
                  {escrows.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No active escrow contracts.</p>
                  ) : (
                    escrows.map((escrow) => {
                      const displayRole = escrow.user === user?._id ? escrow.role
                                        : escrow.sellerUserId === user?._id ? 'seller' 
                                        : escrow.buyerUserId === user?._id ? 'buyer' 
                                        : escrow.role;

                      return (
                      <div key={escrow._id} style={{ padding: '1.5rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{escrow.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>Smart Contract: <span style={{ fontFamily: 'monospace' }}>{escrow.contractAddress}</span></p>
                          </div>
                          <div style={{ padding: '0.4rem 1rem', borderRadius: '50px', background: 'var(--primary)', color: 'white', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                            {escrow.status.replace('_', ' ')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '2rem', padding: '1rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Locked Amount</span>
                            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{escrow.amount} {escrow.asset}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Your Role</span>
                            <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{displayRole}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {escrow.status === 'awaiting_funds' && displayRole === 'buyer' && (
                            <button className="btn-primary" onClick={() => handleFund(escrow)}>Fund Escrow</button>
                          )}
                          {escrow.status === 'funded' && displayRole === 'seller' && (
                            <button className="btn-primary" onClick={() => updateStatus(escrow._id, 'delivered')}>Mark as Delivered</button>
                          )}
                          {(escrow.status === 'delivered' || escrow.status === 'funded') && displayRole === 'buyer' && (
                            <button className="btn-primary" style={{ background: '#22c55e' }} onClick={() => updateStatus(escrow._id, 'released')}>Approve & Release Funds</button>
                          )}
                          {(escrow.status === 'funded' || escrow.status === 'delivered') && displayRole === 'seller' && (
                            <button className="btn-secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => updateStatus(escrow._id, 'refunded')}>Cancel & Refund Buyer</button>
                          )}
                          {(escrow.status === 'funded' || escrow.status === 'delivered') && (
                            <button className="btn-secondary" style={{ color: '#f59e0b', borderColor: '#f59e0b' }} onClick={() => updateStatus(escrow._id, 'disputed')}>Open Dispute</button>
                          )}
                          {escrow.status === 'disputed' && (
                            <button className="btn-secondary" style={{ color: '#8b5cf6', borderColor: '#8b5cf6' }} onClick={() => updateStatus(escrow._id, 'released')}>Resolve Dispute (Admin Demo)</button>
                          )}
                          {escrow.status === 'released' && (
                            <span style={{ color: '#22c55e', fontWeight: 600 }}><i className='bx bx-check-circle'></i> Complete</span>
                          )}
                          {escrow.status === 'disputed' && (
                            <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}><i className='bx bx-error-circle'></i> Under manual review by Support. Escrow locked.</span>
                          )}
                        </div>
                      </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Escrow;
