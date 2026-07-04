import UserProfilePopup from '../components/UserProfilePopup';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AppSidebar from '../components/AppSidebar';
import Loader from '../components/Loader';

const API = 'http://localhost:5000';

const Statistics = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchStats(token);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchStats = async (token) => {
    try {
      const res = await fetch(`${API}/api/transactions/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toFixed(2)}`;
  };

  // Find max volume in chart data for relative heights
  const maxVolume = stats?.chartData?.reduce((max, item) => Math.max(max, item.volume), 0) || 1;

  // Asset colors
  const getAssetColor = (asset) => {
    const a = asset.toLowerCase();
    if (a.includes('eth')) return { bg: '#627EEA', icon: 'bx bxl-ethereum', name: 'Ethereum', color: '#fff' };
    if (a.includes('btc')) return { bg: '#FCD535', icon: 'bx bx-bitcoin', name: 'Bitcoin', color: '#000' };
    if (a.includes('usd')) return { bg: '#26A17B', icon: 'bx bx-dollar-circle', name: 'Stablecoin', color: '#fff' };
    return { bg: 'var(--primary)', icon: 'bx bx-coin-stack', name: asset, color: '#fff' };
  };

  return (
    <div className="dashboard-layout stat-page">
      <style>{`
        .stat-page { background: var(--bg-color); }
        .stat-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card {
          background: var(--glass-bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .stat-card::after {
          content: ''; position: absolute; top: 0; right: 0; width: 100px; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05)); pointer-events: none;
        }
        .stat-card-title { color: var(--text-muted); font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .stat-card-val { font-size: 1.8rem; font-weight: 700; color: var(--text-color); margin: 0; }
        .stat-card-sub { font-size: 0.8rem; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.3rem; font-weight: 500; }
        
        .stat-chart-container {
          background: var(--glass-bg); border: 1px solid var(--border);
          border-radius: 24px; padding: 2rem; margin-bottom: 2rem;
          display: flex; flex-direction: column; height: 400px;
        }
        .stat-chart-area {
          flex: 1; display: flex; align-items: flex-end; justify-content: space-between;
          background: linear-gradient(180deg, rgba(123, 63, 191, 0.04) 0%, transparent 100%);
          border-radius: 12px; padding: 2rem 1rem 0; gap: 4px; position: relative;
        }
        .stat-bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; position: relative; group; }
        .stat-bar { 
          width: 80%; background: var(--primary-light); border-radius: 6px 6px 0 0; opacity: 0.6; transition: 0.3s;
          cursor: pointer; position: relative;
        }
        .stat-bar:hover { opacity: 1; background: var(--primary); }
        .stat-tooltip {
          position: absolute; top: -45px; left: 50%; transform: translateX(-50%) translateY(10px);
          background: var(--text-color); color: var(--bg-color); padding: 6px 10px; border-radius: 8px;
          font-size: 0.75rem; font-weight: 700; opacity: 0; pointer-events: none; transition: 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15); white-space: nowrap; z-index: 10;
        }
        .stat-bar:hover .stat-tooltip { opacity: 1; transform: translateX(-50%) translateY(0); }
        .stat-tooltip::after { content: ''; position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); border-width: 5px 5px 0; border-style: solid; border-color: var(--text-color) transparent transparent transparent; }

        .stat-alloc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .stat-alloc-card { background: var(--glass-bg); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; transition: 0.2s; }
        .stat-alloc-card:hover { border-color: var(--primary-light); }
        .stat-alloc-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
        .stat-alloc-info { flex: 1; }
        .stat-alloc-name { font-weight: 700; color: var(--text-color); margin: 0 0 0.2rem; }
        .stat-alloc-pct { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
        .stat-alloc-val { font-weight: 700; color: var(--text-color); font-size: 1.1rem; }
      `}</style>

      <AppSidebar activeRoute="/statistics" user={user} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />

      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}><i className='bx bx-menu'></i></div>
            <div className="header-greeting">
              <h1>Financial Statistics</h1>
              <p>Analyze your transaction history and portfolio growth.</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme}><i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} /></button>
              <button className="icon-btn"><i className='bx bx-bell' /></button>
              <UserProfilePopup user={user} />
            </div>
          </header>

          {loading ? (
            <div style={{ padding: '4rem 0' }}><Loader text="Crunching your numbers..." /></div>
          ) : (
            <>
              {/* KPI Grid */}
              <div className="stat-kpi-grid">
                <div className="stat-card">
                  <div className="stat-card-title"><i className='bx bx-line-chart' style={{ color: 'var(--primary)' }}></i> Total Volume</div>
                  <h3 className="stat-card-val">{formatCurrency(stats?.totalVolumeUSD || 0)}</h3>
                  <div className="stat-card-sub" style={{ color: '#10B981' }}>Est. Total Transacted</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title"><i className='bx bx-transfer-alt' style={{ color: 'var(--primary)' }}></i> Transactions</div>
                  <h3 className="stat-card-val">{stats?.totalTransactions?.toLocaleString() || 0}</h3>
                  <div className="stat-card-sub" style={{ color: 'var(--text-muted)' }}>Recorded on PayChain</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title"><i className='bx bx-wallet' style={{ color: 'var(--primary)' }}></i> Active Assets</div>
                  <h3 className="stat-card-val">{stats?.activeAssetsCount || 0}</h3>
                  <div className="stat-card-sub" style={{ color: 'var(--text-muted)' }}>Distinct currencies used</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title"><i className='bx bx-receipt' style={{ color: 'var(--primary)' }}></i> Platform Fees</div>
                  <h3 className="stat-card-val">$0.00</h3>
                  <div className="stat-card-sub" style={{ color: '#10B981' }}><i className='bx bx-check-shield'></i> 100% Fee-Free</div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="stat-chart-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>Transaction Volume (Last 12 Months)</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--surface)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>Estimated USD</div>
                </div>
                <div className="stat-chart-area">
                  {stats?.chartData?.map((data, i) => {
                    const heightPct = data.volume === 0 ? 2 : Math.max(5, (data.volume / maxVolume) * 100);
                    const isCurrent = i === stats.chartData.length - 1;
                    return (
                      <div className="stat-bar-wrapper" key={i}>
                        <div className="stat-bar" style={{ height: `${heightPct}%`, background: isCurrent ? 'var(--primary)' : '', opacity: isCurrent ? 1 : '' }}>
                          <div className="stat-tooltip">
                            {formatCurrency(data.volume)}<br/>
                            <span style={{ fontSize: '0.65rem', fontWeight: 500, opacity: 0.8 }}>{data.count} txs</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, padding: '0 0.5rem' }}>
                  {stats?.chartData?.map((d, i) => <span key={i} style={{ flex: 1, textAlign: 'center' }}>{d.label}</span>)}
                </div>
              </div>

              {/* Asset Allocation */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)', fontSize: '1.2rem' }}>Asset Volume Breakdown</h3>
                {stats?.allocation?.length === 0 ? (
                  <div style={{ background: 'var(--glass-bg)', border: '1px dashed var(--border)', padding: '3rem', textAlign: 'center', borderRadius: '16px', color: 'var(--text-muted)' }}>
                    No assets transacted yet.
                  </div>
                ) : (
                  <div className="stat-alloc-grid">
                    {stats?.allocation?.map((alloc, i) => {
                      const style = getAssetColor(alloc.asset);
                      return (
                        <div className="stat-alloc-card" key={i}>
                          <div className="stat-alloc-icon" style={{ background: style.bg, color: style.color }}><i className={style.icon}></i></div>
                          <div className="stat-alloc-info">
                            <h4 className="stat-alloc-name">{style.name} ({alloc.asset})</h4>
                            <p className="stat-alloc-pct">{alloc.percentage.toFixed(1)}% of total volume</p>
                          </div>
                          <div className="stat-alloc-val">{formatCurrency(alloc.volumeUSD)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default Statistics;
