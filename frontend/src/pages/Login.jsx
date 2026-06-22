import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import loginBg from '../assets/login_bg.png';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
              <a href="#" className="forgot-password">Forgot password?</a>
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
    </main>
  );
};

export default Login;
