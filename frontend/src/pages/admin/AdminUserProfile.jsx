import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AppSidebar from '../../components/AppSidebar';
import UserProfilePopup from '../../components/UserProfilePopup';
import NotificationBell from '../../components/NotificationBell';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';
const PLANS = ['free', 'pro', 'pro_plus'];
const PLAN_LABELS = { free: 'Starter (Free)', pro: 'Business Pro', pro_plus: 'Enterprise' };
const PLAN_LIMITS = { free: '3 transactions / day', pro: '1,000 transactions / month', pro_plus: 'Unlimited' };
const PLAN_COLORS = { free: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)' }, pro: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' }, pro_plus: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' } };

const InfoRow = ({ icon, label, value, valueColor }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.1rem', borderRadius: '12px', background: 'var(--glass-bg, rgba(255,255,255,0.5))', border: '1px solid var(--border)', backdropFilter: 'blur(10px)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'var(--text-muted)', fontSize: '0.87rem', fontWeight: 500 }}>
      <i className={`bx ${icon}`} style={{ fontSize: '1.1rem', color: 'var(--primary)' }} />
      {label}
    </div>
    <span style={{ fontSize: '0.87rem', fontWeight: 700, color: valueColor || 'var(--text-color)' }}>{value}</span>
  </div>
);

const SectionCard = ({ title, icon, children }) => (
  <div style={{ background: 'var(--glass-bg, rgba(255,255,255,0.6))', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.5rem', backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <i className={`bx ${icon}`} style={{ color: 'var(--primary)', fontSize: '1.2rem' }} />
      {title}
    </h3>
    {children}
  </div>
);

const AdminUserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('accounts');
  const [accountSubTab, setAccountSubTab] = useState('edit');
  const [transactionSubTab, setTransactionSubTab] = useState('plan');

  // Form states
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '', gender: '', address: '', city: '', country: '' });
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [limitValue, setLimitValue] = useState(0);
  const [bonusValue, setBonusValue] = useState('');
  const [saving, setSaving] = useState({ info: false, plan: false, usage: false, bonus: false });

  const token = () => localStorage.getItem('token');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const tok = localStorage.getItem('token');
    if (!storedUser || !tok) { navigate('/login'); return; }
    const u = JSON.parse(storedUser);
    if (!u.isAdmin) { navigate('/dashboard'); return; }
    setAdminUser(u);
    fetchUser(tok);
  }, [id, navigate]);

  const fetchUser = async (tok) => {
    try {
      const res = await fetch(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${tok || token()}` } });
      const data = await res.json();
      if (res.ok) {
        const found = data.find(u => u._id === id);
        if (!found) { toast.error('User not found'); navigate('/admin/users'); return; }
        setUser(found);
        const nameParts = found.name ? found.name.split(' ') : [];
        const fName = nameParts[0] || '';
        const lName = nameParts.slice(1).join(' ') || '';
        setEditForm({ firstName: fName, lastName: lName, email: found.email || '', phone: found.phone || '', gender: found.gender || '', address: found.address || '', city: found.city || '', country: found.country || '' });
        setSelectedPlan(found.plan || 'free');
        setLimitValue(found.transactionCount ?? 0);
      }
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const handleSaveInfo = async () => {
    setSaving(s => ({ ...s, info: true }));
    try {
      const payload = { ...editForm, name: `${editForm.firstName} ${editForm.lastName}`.trim() };
      delete payload.firstName;
      delete payload.lastName;

      const res = await fetch(`${API}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) { toast.success('Profile updated!'); setUser(data); }
      else toast.error(data.error || 'Failed');
    } catch { toast.error('Network error'); }
    setSaving(s => ({ ...s, info: false }));
  };

  const handleSavePlan = async () => {
    setSaving(s => ({ ...s, plan: true }));
    try {
      const res = await fetch(`${API}/api/admin/users/${id}/plan`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (res.ok) { toast.success('Plan updated!'); setUser(data); }
      else toast.error(data.error || 'Failed');
    } catch { toast.error('Network error'); }
    setSaving(s => ({ ...s, plan: false }));
  };

  const handleSaveUsage = async () => {
    setSaving(s => ({ ...s, usage: true }));
    try {
      const res = await fetch(`${API}/api/admin/users/${id}/limit`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionCount: Number(limitValue) }),
      });
      const data = await res.json();
      if (res.ok) { toast.success('Usage updated!'); setUser(data); }
      else toast.error(data.error || 'Failed');
    } catch { toast.error('Network error'); }
    setSaving(s => ({ ...s, usage: false }));
  };

  const handleUpdateBonus = async (isRevoke = false) => {
    if (!bonusValue || Number(bonusValue) <= 0) { toast.error('Please enter a valid amount'); return; }

    const amountToUpdate = isRevoke ? -Math.abs(Number(bonusValue)) : Math.abs(Number(bonusValue));

    setSaving(s => ({ ...s, bonus: true }));
    try {
      const res = await fetch(`${API}/api/admin/users/${id}/bonus`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountToUpdate }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(isRevoke ? `Revoked ${bonusValue} bonus transactions.` : `Granted ${bonusValue} bonus transactions!`);
        setUser(data);
        setBonusValue('');
      }
      else toast.error(data.error || 'Failed');
    } catch { toast.error('Network error'); }
    setSaving(s => ({ ...s, bonus: false }));
  };

  const handleToggleActive = async () => {
    try {
      const res = await fetch(`${API}/api/admin/users/${id}/active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(u => ({ ...u, isActive: data.isActive }));
        toast.success(data.isActive ? 'User activated!' : 'User deactivated!');
      } else toast.error(data.error);
    } catch { toast.error('Network error'); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${user?.name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/api/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) { toast.success('User deleted'); navigate('/admin/users'); }
      else { const d = await res.json(); toast.error(d.error); }
    } catch { toast.error('Network error'); }
  };

  const avatarSrc = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&size=200`;
  const planUsed = user?.transactionCount ?? 0;
  const basePlanMax = user?.plan === 'free' ? 3 : user?.plan === 'pro' ? 1000 : null;
  const planMax = basePlanMax ? basePlanMax + (user?.bonusTransactions || 0) : null;
  const usagePct = planMax ? Math.min(100, (planUsed / planMax) * 100) : 0;
  const pc = PLAN_COLORS[user?.plan || 'free'];

  return (
    <div className="dashboard-layout">
      <AppSidebar activeRoute="/admin/users" user={adminUser} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={() => { localStorage.clear(); navigate('/'); }} />

      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">

          {/* Header */}
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}><i className='bx bx-menu' /></div>
            <div className="header-greeting">
              <h1>User Profile</h1>
              <p>{loading || !user ? 'Loading...' : `Manage ${user?.name}'s account`}</p>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} style={{ fontSize: '1.2rem' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <NotificationBell user={adminUser} />
              <UserProfilePopup user={adminUser} />
            </div>
          </header>

          {(loading || !user) ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)', gap: '0.75rem', fontSize: '1.1rem' }}>
              <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '1.5rem' }} /> Loading user profile…
            </div>
          ) : (
            <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Top Navigation Tabs */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveTab('accounts')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: activeTab === 'accounts' ? '#fff' : 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', background: activeTab === 'accounts' ? 'var(--primary)' : 'rgba(99,102,241,0.08)', padding: '0.6rem 1.3rem', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)', transition: 'all 0.2s', cursor: 'pointer' }}
                >
                  <i className='bx bx-user-circle' style={{ fontSize: '1.2rem' }} /> Accounts
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: activeTab === 'transactions' ? '#fff' : '#10b981', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', background: activeTab === 'transactions' ? '#10b981' : 'rgba(16,185,129,0.08)', padding: '0.6rem 1.3rem', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)', transition: 'all 0.2s', cursor: 'pointer' }}
                >
                  <i className='bx bx-transfer' style={{ fontSize: '1.2rem' }} /> Transactions
                </button>
              </div>

              {/* Profile Hero Card */}
              <div className="profile-hero-card">
                {/* bg decoration */}
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

                <div className="profile-hero-content">
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={avatarSrc} alt={user?.name} className="profile-hero-avatar" />
                    <div className="profile-hero-status-dot" style={{ background: user?.isActive !== false ? '#10b981' : '#ef4444' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <h2 className="profile-hero-name">{user?.name}</h2>
                    <p className="profile-hero-email">{user?.email}</p>
                    <div className="profile-hero-badges">
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }}>
                        {user?.plan === 'pro_plus' ? 'PRO+' : user?.plan === 'pro' ? 'PRO' : 'FREE'} — {PLAN_LABELS[user?.plan || 'free']}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '10px', background: user?.isActive !== false ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)', color: user?.isActive !== false ? '#a7f3d0' : '#fca5a5', border: `1px solid ${user?.isActive !== false ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}` }}>
                        {user?.isActive !== false ? '● Active' : '● Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="profile-hero-stats-wrap">
                    {[
                      { label: 'Transactions', value: planUsed, icon: 'bx-transfer' },
                      { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: 'bx-calendar' },
                      { label: 'Plan Limit', value: planMax ? `${basePlanMax}/day` : '∞', icon: 'bx-shield' },
                    ].map(s => (
                      <div key={s.label} className="profile-stat-box">
                        <i className={`bx ${s.icon} profile-stat-icon`} />
                        <div className="profile-stat-value" title={s.value}>{s.value}</div>
                        <div className="profile-stat-label" title={s.label}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {activeTab === 'accounts' && (
                  <>
                    {/* Account Sub Navigation */}
                    <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.8rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                      <button onClick={() => setAccountSubTab('edit')} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', border: 'none', background: accountSubTab === 'edit' ? 'var(--primary)' : 'transparent', color: accountSubTab === 'edit' ? '#fff' : 'var(--text-color)' }}>
                        <i className='bx bx-user-edit' style={{ marginRight: '0.4rem' }} /> Edit Profile
                      </button>
                      <button onClick={() => setAccountSubTab('info')} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', border: 'none', background: accountSubTab === 'info' ? 'var(--primary)' : 'transparent', color: accountSubTab === 'info' ? '#fff' : 'var(--text-color)' }}>
                        <i className='bx bx-info-circle' style={{ marginRight: '0.4rem' }} /> Account Info
                      </button>
                      <button onClick={() => setAccountSubTab('controls')} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', border: 'none', background: accountSubTab === 'controls' ? 'var(--primary)' : 'transparent', color: accountSubTab === 'controls' ? '#fff' : 'var(--text-color)' }}>
                        <i className='bx bx-cog' style={{ marginRight: '0.4rem' }} /> Controls
                      </button>
                    </div>

                    {/* Edit Profile */}
                    {accountSubTab === 'edit' && (
                      <SectionCard title="Edit Profile Information" icon="bx-user-edit">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                            {[
                              { label: 'First Name', key: 'firstName', type: 'text', icon: 'bx-user', placeholder: 'First name' },
                              { label: 'Last Name', key: 'lastName', type: 'text', icon: 'bx-user', placeholder: 'Last name' },
                              { label: 'Email Address', key: 'email', type: 'email', icon: 'bx-envelope', placeholder: 'email@example.com' },
                              { label: 'Phone Number', key: 'phone', type: 'tel', icon: 'bx-phone', placeholder: '+1 (555) 000-0000' },
                              { label: 'Gender', key: 'gender', type: 'select', icon: 'bx-male-female', options: ['', 'Male', 'Female', 'Other'] },
                              { label: 'Street Address', key: 'address', type: 'text', icon: 'bx-map', placeholder: '123 Main St' },
                              { label: 'City', key: 'city', type: 'text', icon: 'bx-buildings', placeholder: 'New York' },
                              { label: 'Country', key: 'country', type: 'text', icon: 'bx-globe', placeholder: 'USA' },
                            ].map(f => (
                              <div key={f.key}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <i className={`bx ${f.icon}`} style={{ color: 'var(--primary)' }} />{f.label}
                                </label>
                                {f.type === 'select' ? (
                                  <select
                                    value={editForm[f.key]}
                                    onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                    className="form-input"
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text-color)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', appearance: 'none' }}
                                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                  >
                                    {f.options.map(opt => <option key={opt} value={opt}>{opt || 'Select...'}</option>)}
                                  </select>
                                ) : (
                                  <input
                                    type={f.type}
                                    value={editForm[f.key]}
                                    placeholder={f.placeholder}
                                    onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                    className="form-input"
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text-color)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={handleSaveInfo}
                            disabled={saving.info}
                            style={{ alignSelf: 'flex-end', marginTop: '0.25rem', padding: '0.8rem 2.5rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '12px', cursor: saving.info ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: saving.info ? 0.7 : 1, transition: 'opacity 0.2s' }}
                          >
                            <i className='bx bx-check-circle' /> {saving.info ? 'Saving…' : 'Save Profile'}
                          </button>
                        </div>
                      </SectionCard>

                    )}

                    {/* Account Info */}
                    {accountSubTab === 'info' && (
                      <SectionCard title="Account Information" icon="bx-info-circle">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                          <InfoRow icon="bx-user" label="Full Name" value={user?.name} />
                          <InfoRow icon="bx-envelope" label="Email" value={user?.email} />
                          <InfoRow icon="bx-phone" label="Phone" value={user?.phone || '—'} />
                          <InfoRow icon="bx-male-female" label="Gender" value={user?.gender || '—'} />
                          <InfoRow icon="bx-map" label="Address" value={user?.address || '—'} />
                          <InfoRow icon="bx-buildings" label="City" value={user?.city || '—'} />
                          <InfoRow icon="bx-globe" label="Country" value={user?.country || '—'} />
                          <InfoRow icon="bx-calendar" label="Joined" value={new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                          <InfoRow icon="bx-crown" label="Current Plan" value={PLAN_LABELS[user?.plan || 'free']} />
                          <InfoRow icon="bx-shield" label="Account Status" value={user?.isActive !== false ? '● Active' : '● Inactive'} valueColor={user?.isActive !== false ? '#10b981' : '#ef4444'} />
                        </div>
                      </SectionCard>

                    )}

                    {/* Danger Zone */}
                    {accountSubTab === 'controls' && (
                      <SectionCard title="Account Controls" icon="bx-cog">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0 }}>
                            Control this user's account access and membership status.
                          </p>

                          <button
                            onClick={handleToggleActive}
                            style={{ padding: '0.85rem 1.2rem', borderRadius: '12px', border: `1.5px solid ${user?.isActive !== false ? 'rgba(245,158,11,0.35)' : 'rgba(16,185,129,0.35)'}`, background: user?.isActive !== false ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)', color: user?.isActive !== false ? '#d97706' : '#10b981', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.2s' }}
                          >
                            <i className={`bx ${user?.isActive !== false ? 'bx-pause-circle' : 'bx-play-circle'}`} style={{ fontSize: '1.2rem' }} />
                            {user?.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.7 }}>
                              {user?.isActive !== false ? 'Block user login access' : 'Restore user login access'}
                            </span>
                          </button>

                          <div style={{ height: '1px', background: 'var(--border)' }} />

                          <button
                            onClick={handleDelete}
                            style={{ padding: '0.85rem 1.2rem', borderRadius: '12px', border: '1.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.2s' }}
                          >
                            <i className='bx bx-trash' style={{ fontSize: '1.2rem' }} />
                            Delete User Permanently
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.7 }}>Cannot be undone</span>
                          </button>
                        </div>
                      </SectionCard>
                    )}
                  </>
                )}

                {activeTab === 'transactions' && (
                  <>
                    {/* Transaction Sub Navigation */}
                    <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.8rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                      <button onClick={() => setTransactionSubTab('plan')} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', border: 'none', background: transactionSubTab === 'plan' ? '#10b981' : 'transparent', color: transactionSubTab === 'plan' ? '#fff' : 'var(--text-color)' }}>
                        <i className='bx bx-crown' style={{ marginRight: '0.4rem' }} /> Subscription Plan
                      </button>
                      <button onClick={() => setTransactionSubTab('usage')} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', border: 'none', background: transactionSubTab === 'usage' ? '#10b981' : 'transparent', color: transactionSubTab === 'usage' ? '#fff' : 'var(--text-color)' }}>
                        <i className='bx bx-bar-chart-alt-2' style={{ marginRight: '0.4rem' }} /> Usage Control
                      </button>
                      <button onClick={() => setTransactionSubTab('bonus')} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', border: 'none', background: transactionSubTab === 'bonus' ? '#10b981' : 'transparent', color: transactionSubTab === 'bonus' ? '#fff' : 'var(--text-color)' }}>
                        <i className='bx bx-gift' style={{ marginRight: '0.4rem' }} /> Bonus Limits
                      </button>
                    </div>

                    {/* Plan Management */}
                    {transactionSubTab === 'plan' && (
                      <SectionCard title="Subscription Plan" icon="bx-crown">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {PLANS.map(p => {
                            const pColor = PLAN_COLORS[p];
                            const isSelected = selectedPlan === p;
                            return (
                              <div
                                key={p}
                                onClick={() => setSelectedPlan(p)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.1rem', borderRadius: '14px', border: `2px solid ${isSelected ? pColor.color : 'var(--border)'}`, background: isSelected ? pColor.bg : 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2.5px solid ${isSelected ? pColor.color : 'var(--border)'}`, background: isSelected ? pColor.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {isSelected && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff' }} />}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-color)' }}>{PLAN_LABELS[p]}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{PLAN_LIMITS[p]}</div>
                                  </div>
                                </div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 9px', borderRadius: '8px', background: pColor.bg, color: pColor.color, border: `1px solid ${pColor.border}` }}>
                                  {p === 'pro_plus' ? 'PRO+' : p === 'pro' ? 'PRO' : 'FREE'}
                                </span>
                              </div>
                            );
                          })}
                          <button
                            onClick={handleSavePlan}
                            disabled={saving.plan || selectedPlan === user?.plan}
                            style={{ marginTop: '0.25rem', padding: '0.8rem', background: selectedPlan === user?.plan ? 'var(--border)' : 'var(--primary)', color: selectedPlan === user?.plan ? 'var(--text-muted)' : '#fff', border: 'none', borderRadius: '12px', cursor: (saving.plan || selectedPlan === user?.plan) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                          >
                            <i className='bx bx-crown' /> {saving.plan ? 'Updating…' : selectedPlan === user?.plan ? 'Current Plan' : `Switch to ${PLAN_LABELS[selectedPlan]}`}
                          </button>
                        </div>
                      </SectionCard>

                    )}

                    {/* Usage Control */}
                    {transactionSubTab === 'usage' && (
                      <SectionCard title="Transaction Usage" icon="bx-bar-chart-alt-2">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {/* Bar */}
                          <div style={{ background: 'var(--bg)', borderRadius: '14px', padding: '1.1rem', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-color)' }}>Usage this period</span>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: usagePct >= 100 ? '#ef4444' : 'var(--primary)' }}>
                                {planUsed} / {planMax ?? '∞'}
                              </span>
                            </div>
                            {planMax && (
                              <>
                                <div style={{ height: '10px', background: 'var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                                  <div style={{ height: '100%', width: `${usagePct}%`, background: usagePct >= 100 ? 'linear-gradient(90deg, #ef4444, #f87171)' : usagePct >= 70 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, var(--primary), #8b5cf6)', borderRadius: '8px', transition: 'width 0.4s ease' }} />
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{usagePct.toFixed(0)}% of plan limit used</div>
                              </>
                            )}
                            {!planMax && <div style={{ fontSize: '0.78rem', color: '#8b5cf6', fontWeight: 600 }}>✦ Enterprise — No usage limits</div>}
                          </div>

                          {/* Set Count */}
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <i className='bx bx-slider' style={{ color: 'var(--primary)' }} />Manually Set Usage Count
                            </label>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                              <input
                                type="number"
                                min={0}
                                value={limitValue}
                                onChange={e => setLimitValue(e.target.value)}
                                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text-color)', fontSize: '0.9rem', outline: 'none' }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                              />
                              <button
                                onClick={() => setLimitValue(0)}
                                style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                              >
                                Reset to 0
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={handleSaveUsage}
                            disabled={saving.usage}
                            style={{ padding: '0.8rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '12px', cursor: saving.usage ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: saving.usage ? 0.7 : 1 }}
                          >
                            <i className='bx bx-save' /> {saving.usage ? 'Saving…' : 'Update Usage Count'}
                          </button>
                        </div>
                      </SectionCard>

                    )}

                    {/* Bonus Transactions */}
                    {transactionSubTab === 'bonus' && (
                      <SectionCard title="Bonus Transactions" icon="bx-gift">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ background: 'rgba(139,92,246,0.08)', borderRadius: '14px', padding: '1.1rem', border: '1px solid rgba(139,92,246,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-color)' }}>Current Bonus Limit</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#8b5cf6' }}>
                                +{user?.bonusTransactions || 0} Transactions
                              </span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                              Bonuses are permanently added to the user's base plan limit.
                            </p>
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <i className='bx bx-edit' style={{ color: 'var(--primary)' }} />Modify Bonus Limit
                            </label>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                              <input
                                type="number"
                                min={1}
                                placeholder="e.g. 10"
                                value={bonusValue}
                                onChange={e => setBonusValue(e.target.value)}
                                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text-color)', fontSize: '0.9rem', outline: 'none', minWidth: '80px' }}
                                onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                              />
                              <button
                                onClick={() => handleUpdateBonus(false)}
                                disabled={saving.bonus || !bonusValue}
                                style={{ padding: '0.75rem 1rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '10px', cursor: (saving.bonus || !bonusValue) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: (saving.bonus || !bonusValue) ? 0.7 : 1 }}
                              >
                                <i className='bx bx-plus' /> {saving.bonus ? '...' : 'Grant'}
                              </button>
                              <button
                                onClick={() => handleUpdateBonus(true)}
                                disabled={saving.bonus || !bonusValue || user?.bonusTransactions === 0}
                                style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', cursor: (saving.bonus || !bonusValue || user?.bonusTransactions === 0) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: (saving.bonus || !bonusValue || user?.bonusTransactions === 0) ? 0.5 : 1 }}
                              >
                                <i className='bx bx-minus' /> Revoke
                              </button>
                            </div>
                            {user?.bonusTransactions > 0 && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', paddingLeft: '0.2rem' }}>
                                ℹ️ You can revoke up to <strong>{user.bonusTransactions}</strong> transactions.
                              </div>
                            )}
                          </div>
                        </div>
                      </SectionCard>
                    )}

                  </>
                )}

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUserProfile;
