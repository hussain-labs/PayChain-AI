import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import loginBg from '../assets/login_bg.png';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error('Please enter your email.');
    setForgotLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      setForgotStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset code');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!forgotCode) return toast.error('Please enter the verification code.');
    setForgotLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: forgotCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      setForgotStep(3);
    } catch (err) {
      toast.error(err.message || 'Invalid or expired code');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (forgotNewPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    setForgotLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: forgotCode, newPassword: forgotNewPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      
      // Reset Modal State
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotEmail('');
      setForgotCode('');
      setForgotNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Login successful, save to localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      const redirect = searchParams.get('redirect');
      if (redirect === 'pricing') {
        const autoCheckout = searchParams.get('autoCheckout');
        const wallets = searchParams.get('wallets');
        navigate(`/pricing?autoCheckout=${autoCheckout}&wallets=${wallets}`);
      } else {
        // Admin users go to admin dashboard, regular users go to user dashboard
        if (data.user?.isAdmin) navigate('/admin/dashboard');
        else navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrapper fade-in">
      <div className="auth-container glass-panel">
        
        <div className="auth-image-side">
          <img src={loginBg} alt="Login Illustration" />
        </div>

        <div className="auth-form-side">
          <h2>Welcome Back</h2>
          <p>Please enter your details to sign in.</p>
          
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
              color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.9rem 1.1rem',
              borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 500,
              animation: 'fadeInDown 0.3s ease-out'
            }}>
              <i className='bx bx-error-circle' style={{ fontSize: '1.2rem', marginTop: '0.1rem' }}></i>
              <span style={{ lineHeight: 1.4 }}>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  required 
                />
                <i 
                  className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} password-toggle-icon`} 
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
            </div>
            <div className="auth-options">
              <label className="checkbox-container">
                <input type="checkbox" /> Remember me
              </label>
              <button 
                type="button" 
                className="forgot-password" 
                onClick={() => setShowForgotModal(true)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Forgot password?
              </button>
            </div>
            <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '1rem'}} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <p className="auth-redirect">
            Don't have an account? <Link to={`/register?${searchParams.toString()}`}>Sign Up</Link>
          </p>
        </div>
        
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem', width: '90%', maxWidth: '400px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s ease' }}>
            <button
              onClick={() => { setShowForgotModal(false); setForgotStep(1); setForgotEmail(''); setForgotCode(''); setForgotNewPassword(''); }}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.5rem', cursor: 'pointer', transition: '0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
            >
              <i className='bx bx-x' />
            </button>
            
            {forgotStep === 1 && (
              <form onSubmit={handleForgotPassword}>
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', color: '#111827' }}>Forgot Password?</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem' }}>Enter your email address and we'll send you a 6-digit verification code.</p>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>Email Address</label>
                  <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="john@example.com" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #d1d5db', outline: 'none', transition: '0.2s', fontSize: '1rem' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.9rem' }} disabled={forgotLoading}>
                  {forgotLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyCode}>
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', color: '#111827' }}>Enter Verification Code</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem' }}>We sent a 6-digit code to <strong>{forgotEmail}</strong>.</p>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>6-Digit Code</label>
                  <input type="text" maxLength={6} value={forgotCode} onChange={(e) => setForgotCode(e.target.value.replace(/\\D/g, ''))} placeholder="123456" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #d1d5db', outline: 'none', transition: '0.2s', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '5px' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.9rem' }} disabled={forgotLoading}>
                  {forgotLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setForgotStep(1)} style={{ background: 'none', border: 'none', color: '#7B3FBF', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Change Email</button>
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword}>
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.5rem', color: '#111827' }}>Set New Password</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem' }}>Please enter a strong new password for your account.</p>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>New Password</label>
                  <input type="password" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #d1d5db', outline: 'none', transition: '0.2s', fontSize: '1rem' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.9rem' }} disabled={forgotLoading}>
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default Login;
