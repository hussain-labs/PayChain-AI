import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppSidebar from '../../components/AppSidebar';
import UserProfilePopup from '../../components/UserProfilePopup';
import NotificationBell from '../../components/NotificationBell';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

const ToggleSwitch = ({ checked, onChange }) => (
  <div 
    onClick={() => onChange(!checked)}
    style={{
      width: '46px',
      height: '24px',
      background: checked ? 'var(--primary)' : 'var(--border)',
      borderRadius: '24px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.3s',
      flexShrink: 0
    }}
  >
    <div 
      style={{
        width: '18px',
        height: '18px',
        background: '#fff',
        borderRadius: '50%',
        position: 'absolute',
        top: '3px',
        left: checked ? '25px' : '3px',
        transition: 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
    />
  </div>
);

const SettingsRow = ({ icon, title, description, children, isLast }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '1.5rem 0',
    borderBottom: isLast ? 'none' : '1px solid var(--border)',
    gap: '2rem',
    flexWrap: 'wrap'
  }}>
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: '1 1 300px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)' }}>
        <i className={`bx ${icon}`} style={{ fontSize: '1.4rem' }}></i>
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: 'var(--text-color)', fontWeight: 600 }}>{title}</h4>
        {description && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{description}</p>}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: '1 1 200px' }}>
      {children}
    </div>
  </div>
);

const InputField = ({ type = "text", value, onChange, name, placeholder }) => (
  <input 
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{
      width: '100%',
      maxWidth: '300px',
      padding: '0.75rem 1rem',
      borderRadius: '10px',
      border: '1.5px solid var(--border)',
      background: 'var(--bg)',
      color: 'var(--text-color)',
      fontSize: '0.9rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    }}
    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'}
  />
);

const SelectField = ({ value, onChange, name, options }) => (
  <select 
    name={name}
    value={value}
    onChange={onChange}
    style={{
      width: '100%',
      maxWidth: '300px',
      padding: '0.75rem 1rem',
      borderRadius: '10px',
      border: '1.5px solid var(--border)',
      background: 'var(--bg)',
      color: 'var(--text-color)',
      fontSize: '0.9rem',
      outline: 'none',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236366f1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem top 50%',
      backgroundSize: '0.65rem auto',
    }}
    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'}
  >
    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
);

const AdminSettings = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Form State
  const [settings, setSettings] = useState({
    siteName: 'PayChain AI',
    supportEmail: 'support@paychain.com',
    currency: 'USD',
    timezone: 'UTC',
    enforce2FA: false,
    sessionTimeout: '24h',
    allowRegistrations: true,
    smtpServer: 'smtp.mailgun.org',
    smtpPort: '587',
    alertNewUsers: true,
    alertLargeTransactions: true,
    maintenanceMode: false
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token      = localStorage.getItem('token');
    if (!storedUser || !token) { navigate('/login'); return; }
    const u = JSON.parse(storedUser);
    if (!u.isAdmin) { navigate('/dashboard'); return; }
    setAdminUser(u);
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name, value) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="dashboard-layout">
      <AppSidebar
        activeRoute="/admin/settings"
        user={adminUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={() => { localStorage.clear(); navigate('/'); }}
      />
      
      <main className="dashboard-main fade-in">
        <div className="dashboard-content-wrapper" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <header className="dashboard-header" style={{ background: 'transparent', boxShadow: 'none', padding: '0 0 2rem 0' }}>
            <div className="header-toggle" onClick={() => setIsSidebarOpen(true)}>
              <i className='bx bx-menu'></i>
            </div>
            <div className="header-greeting">
              <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>System Settings</h1>
              
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" style={{ fontSize:'1.2rem', background: 'var(--surface)' }}>
                <i className={`bx ${theme === 'dark' ? 'bx-sun' : 'bx-moon'}`} />
              </button>
              <NotificationBell user={adminUser} />
              <UserProfilePopup user={adminUser} />
            </div>
          </header>

          <div className="page-header-description" style={{ margin: "-1rem 0 0.5rem 0", color: "var(--text-muted)", padding: "0 1rem" }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Manage your platform configurations and preferences.</p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
            
            {/* Custom Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border)', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {[
                { id: 'general', icon: 'bx-slider', label: 'General' },
                { id: 'security', icon: 'bx-shield-quarter', label: 'Security' },
                { id: 'notifications', icon: 'bx-bell', label: 'Notifications' },
                { id: 'maintenance', icon: 'bx-wrench', label: 'Maintenance' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.8rem 1.5rem',
                    background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab.id ? '#fff' : 'var(--text-color)',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <i className={`bx ${tab.icon}`} style={{ fontSize: '1.2rem' }}></i> {tab.label}
                </button>
              ))}
            </div>

            {/* Settings Container */}
            <div className="glass-panel" style={{ padding: '0 2rem', borderRadius: '20px', minHeight: '300px' }}>
              
              {activeTab === 'general' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <SettingsRow 
                    icon="bx-globe" 
                    title="Platform Name" 
                    description="The name of your platform displayed to users and in emails."
                  >
                    <InputField name="siteName" value={settings.siteName} onChange={handleInputChange} />
                  </SettingsRow>
                  
                  <SettingsRow 
                    icon="bx-envelope" 
                    title="Support Email" 
                    description="The primary email address where users can send inquiries."
                  >
                    <InputField type="email" name="supportEmail" value={settings.supportEmail} onChange={handleInputChange} />
                  </SettingsRow>

                  <SettingsRow 
                    icon="bx-dollar-circle" 
                    title="Default Currency" 
                    description="The primary fiat currency used for displaying conversions."
                  >
                    <SelectField 
                      name="currency" 
                      value={settings.currency} 
                      onChange={handleInputChange}
                      options={[ {value: 'USD', label: 'USD ($)'}, {value: 'EUR', label: 'EUR (€)'}, {value: 'GBP', label: 'GBP (£)'} ]}
                    />
                  </SettingsRow>

                  <SettingsRow 
                    icon="bx-time-five" 
                    title="System Timezone" 
                    description="The default timezone for all admin dashboard timestamps."
                    isLast
                  >
                    <SelectField 
                      name="timezone" 
                      value={settings.timezone} 
                      onChange={handleInputChange}
                      options={[ {value: 'UTC', label: 'UTC'}, {value: 'EST', label: 'Eastern Time (EST)'}, {value: 'PST', label: 'Pacific Time (PST)'} ]}
                    />
                  </SettingsRow>
                </div>
              )}

              {activeTab === 'security' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <SettingsRow 
                    icon="bx-user-plus" 
                    title="Allow Registrations" 
                    description="Allow new users to create accounts on the platform."
                  >
                    <ToggleSwitch checked={settings.allowRegistrations} onChange={v => handleToggle('allowRegistrations', v)} />
                  </SettingsRow>
                  
                  <SettingsRow 
                    icon="bx-lock-alt" 
                    title="Enforce 2FA" 
                    description="Require all administrator accounts to enable Two-Factor Authentication."
                  >
                    <ToggleSwitch checked={settings.enforce2FA} onChange={v => handleToggle('enforce2FA', v)} />
                  </SettingsRow>

                  <SettingsRow 
                    icon="bx-timer" 
                    title="Session Timeout" 
                    description="Automatically log administrators out after a period of inactivity."
                    isLast
                  >
                    <SelectField 
                      name="sessionTimeout" 
                      value={settings.sessionTimeout} 
                      onChange={handleInputChange}
                      options={[ {value: '15m', label: '15 Minutes'}, {value: '30m', label: '30 Minutes'}, {value: '1h', label: '1 Hour'}, {value: '24h', label: '24 Hours'} ]}
                    />
                  </SettingsRow>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <SettingsRow 
                    icon="bx-server" 
                    title="SMTP Server" 
                    description="Configure your outbound email server provider."
                  >
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '300px' }}>
                      <InputField name="smtpServer" value={settings.smtpServer} onChange={handleInputChange} placeholder="smtp.provider.com" />
                      <div style={{ width: '80px' }}>
                        <InputField name="smtpPort" value={settings.smtpPort} onChange={handleInputChange} placeholder="Port" />
                      </div>
                    </div>
                  </SettingsRow>

                  <SettingsRow 
                    icon="bx-user-check" 
                    title="New User Alerts" 
                    description="Receive an email notification when a new user registers."
                  >
                    <ToggleSwitch checked={settings.alertNewUsers} onChange={v => handleToggle('alertNewUsers', v)} />
                  </SettingsRow>

                  <SettingsRow 
                    icon="bx-transfer-alt" 
                    title="Large Transaction Alerts" 
                    description="Receive an email when a transaction exceeds 1 ETH."
                    isLast
                  >
                    <ToggleSwitch checked={settings.alertLargeTransactions} onChange={v => handleToggle('alertLargeTransactions', v)} />
                  </SettingsRow>
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <SettingsRow 
                    icon="bx-error-circle" 
                    title="Maintenance Mode" 
                    description="Take the user-facing site offline. Only administrators will be able to log in."
                  >
                    <ToggleSwitch checked={settings.maintenanceMode} onChange={v => handleToggle('maintenanceMode', v)} />
                  </SettingsRow>

                  <SettingsRow 
                    icon="bx-refresh" 
                    title="Restart API Server" 
                    description="Restart the backend services. This will cause a brief 5-second downtime."
                    isLast
                  >
                    <button 
                      style={{ 
                        padding: '0.75rem 1.5rem', background: 'transparent', border: '1.5px solid var(--border)', 
                        borderRadius: '10px', color: 'var(--text-color)', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', width: '100%', maxWidth: '300px', justifyContent: 'center'
                      }}
                      onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <i className='bx bx-power-off'></i> Restart Server
                    </button>
                  </SettingsRow>
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '1rem 3rem',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
                  opacity: isSaving ? 0.7 : 1,
                  transition: 'all 0.2s',
                  minWidth: '200px',
                  justifyContent: 'center'
                }}
              >
                {isSaving ? (
                  <><i className='bx bx-loader-alt bx-spin' style={{ fontSize: '1.3rem' }}></i> Saving...</>
                ) : (
                  <><i className='bx bx-check-circle' style={{ fontSize: '1.3rem' }}></i> Save Settings</>
                )}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
