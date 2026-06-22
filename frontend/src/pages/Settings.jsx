import UserProfilePopup from '../components/UserProfilePopup';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import AppSidebar from '../components/AppSidebar';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Profile state
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', avatar: '', currency: 'USD', language: 'EN' });
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const autoLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }

    fetch('http://localhost:5000/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => { if (res.status === 401) { autoLogout(); return null; } return res.json(); })
      .then(data => {
        if (data) {
          setProfile({ name: data.name || '', email: data.email || '', phone: data.phone || '', avatar: data.avatar || '', currency: data.currency || 'USD', language: data.language || 'EN' });
          localStorage.setItem('user', JSON.stringify(data));
        }
      })
      .catch(err => console.error('Error loading profile:', err));
  }, [navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setProfileMsg({ text: '❌ Image must be under 2MB.', type: 'error' }); return;
    }

    setProfileMsg({ text: '⏳ Uploading image...', type: 'success' });

    try {
      // Upload directly from browser to Cloudinary (unsigned preset)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'aychain_unsigned');
      formData.append('folder', 'paychain/avatars');

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dczt7cqfd';
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ text: `❌ ${data.error?.message || 'Upload failed.'}`, type: 'error' }); return;
      }

      const avatarUrl = data.secure_url;
      // Save the URL to our backend
      const token = getToken();
      if (!token) { autoLogout(); return; }
      await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ avatar: avatarUrl })
      });

      setProfile(p => ({ ...p, avatar: avatarUrl }));
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, avatar: avatarUrl }));
      setProfileMsg({ text: '✅ Photo updated!', type: 'success' });
    } catch (err) {
      console.error('Upload error:', err);
      setProfileMsg({ text: '❌ Upload failed. Check console for details.', type: 'error' });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    setProfileLoading(true);
    const token = getToken();
    if (!token) { autoLogout(); return; }
    try {
      const res = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profile)
      });
      if (res.status === 401) { autoLogout(); return; }
      const data = await res.json();
      if (res.ok) {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, ...data }));
        setProfileMsg({ text: '✅ Profile updated successfully!', type: 'success' });
      } else {
        setProfileMsg({ text: `❌ ${data.error}`, type: 'error' });
      }
    } catch {
      setProfileMsg({ text: '❌ Could not reach the server.', type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ text: '❌ Passwords do not match.', type: 'error' }); return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordMsg({ text: '❌ Password must be at least 6 characters.', type: 'error' }); return;
    }
    setPasswordLoading(true);
    const token = getToken();
    if (!token) { autoLogout(); return; }
    try {
      const res = await fetch('http://localhost:5000/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newPassword: passwords.newPassword })
      });
      if (res.status === 401) { autoLogout(); return; }
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ text: '✅ Password changed successfully!', type: 'success' });
        setPasswords({ newPassword: '', confirmPassword: '' });
        setTimeout(() => setShowPasswordModal(false), 1500);
      } else {
        setPasswordMsg({ text: `❌ ${data.error}`, type: 'error' });
      }
    } catch {
      setPasswordMsg({ text: '❌ Could not reach the server.', type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const avatarSrc = profile.avatar || `https://ui-avatars.com/api/?name=${profile.name.replace(' ', '+') || 'User'}&background=4B1D8F&color=fff`;

  const msgStyle = (type) => ({
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    marginTop: '0.75rem',
    background: type === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(255,77,79,0.1)',
    border: `1px solid ${type === 'success' ? 'rgba(74,222,128,0.4)' : 'rgba(255,77,79,0.4)'}`,
    color: type === 'success' ? '#4ade80' : '#ff4d4f',
  });

  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/settings"
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper">
          <header className="dashboard-header">
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
              <i className='bx bx-menu'></i>
            </div>
            <div className="header-greeting">
              <h1>Settings</h1>
              <p>Manage your account preferences and security.</p>
            </div>
            <div className="header-actions">
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize:'1.2rem' }}>
              <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
            </button>
            <button className="icon-btn"><i className='bx bx-bell' /></button>
            <UserProfilePopup user={user} />
          </div>
        </header>

          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', padding: '1rem' }}>

            {/* Profile Information */}
            <div className="glass-panel" style={{ gridColumn: 'span 1' }}>
              <div className="section-header"><h3>Profile Information</h3></div>

              {/* Avatar Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', margin: '1.5rem 0' }}>
                <div style={{ position: 'relative' }}>
                  <img src={avatarSrc} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid var(--primary)', objectFit: 'cover' }} />
                  <label htmlFor="avatarUpload" style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--surface)' }}>
                    <i className='bx bx-camera' style={{ color: '#fff', fontSize: '0.85rem' }}></i>
                  </label>
                  <input id="avatarUpload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </div>
                <div>
                  <p style={{ margin: '0 0 0.25rem', fontWeight: 600, fontSize: '0.9rem' }}>Profile Photo</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Click the camera icon to upload.<br/>Max size: 2MB</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="modal-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} required placeholder="you@example.com" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Currency</label>
                    <select value={profile.currency} onChange={e => setProfile({ ...profile, currency: e.target.value })}>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="PKR">PKR - Pakistani Rupee</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="AED">AED - UAE Dirham</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <select value={profile.language} onChange={e => setProfile({ ...profile, language: e.target.value })}>
                      <option value="EN">English</option>
                      <option value="ES">Spanish</option>
                      <option value="FR">French</option>
                      <option value="AR">Arabic</option>
                      <option value="UR">Urdu</option>
                    </select>
                  </div>
                </div>
                {profileMsg.text && <div style={msgStyle(profileMsg.type)}>{profileMsg.text}</div>}
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }} disabled={profileLoading}>
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Right column */}
            <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Security */}
              <div className="glass-panel">
                <div className="section-header"><h3>Security</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.2rem' }}>Two-Factor Authentication</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Secure your account with 2FA.</p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#ccc', transition: '.4s', borderRadius: '34px' }}></span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.2rem' }}>Change Password</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Update your password regularly.</p>
                    </div>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }} onClick={() => { setShowPasswordModal(true); setPasswordMsg({ text: '', type: '' }); }}>
                      Update
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="glass-panel">
                <div className="section-header"><h3>Account Info</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {[
                    { label: 'Account Status', value: '✅ Active', color: '#4ade80' },
                    { label: 'Member Since', value: 'June 2026' },
                    { label: 'Account Type', value: 'Standard' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: item.color || 'inherit' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleLogout}
                  style={{ marginTop: '1.5rem', width: '100%', padding: '0.7rem', background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.4)', color: '#ff4d4f', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  <i className='bx bx-log-out'></i> Log Out
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button className="close-btn" onClick={() => setShowPasswordModal(false)}><i className='bx bx-x'></i></button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="modal-form">
              <div className="form-group">
                <label>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} required style={{ paddingRight: '2.5rem' }} />
                  <i 
                    className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`} 
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? "text" : "password"} placeholder="Repeat new password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} required style={{ paddingRight: '2.5rem' }} />
                  <i 
                    className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`} 
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>
              {passwordMsg.text && <div style={msgStyle(passwordMsg.type)}>{passwordMsg.text}</div>}
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={passwordLoading}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
