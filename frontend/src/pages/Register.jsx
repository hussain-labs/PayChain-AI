import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import registerBg from '../assets/register_bg.png';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful
      navigate(`/login?${searchParams.toString()}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrapper fade-in">
      <div className="auth-container glass-panel">
        
        <div className="auth-form-side">
          <h2>Create Account</h2>
          <p>Join PayChain and unlock borderless payments.</p>
          
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
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
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
                  placeholder="Create a strong password" 
                  required 
                />
                <i 
                  className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} password-toggle-icon`} 
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '1rem'}} disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
          
          <p className="auth-redirect">
            Already have an account? <Link to={`/login?${searchParams.toString()}`}>Log In</Link>
          </p>
        </div>
        
        <div className="auth-image-side">
          <img src={registerBg} alt="Register Illustration" />
        </div>

      </div>
    </main>
  );
};

export default Register;
