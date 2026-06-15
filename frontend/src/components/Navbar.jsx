import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isHome = location.pathname === '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById('navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      <header className={`navbar ${isHome ? 'home-navbar' : ''}`} id="navbar">
        <div className="container nav-container">
          <Link to="/" className="logo">
            <i className='bx bx-link'></i> Pay<span>Chain</span>
          </Link>
          <nav className="nav-menu">
            <ul>
              <li>
                <Link to="/" className={location.pathname === '/' ? 'active-link' : ''}>Home</Link>
              </li>
              <li>
                <Link to="/about" className={location.pathname === '/about' ? 'active-link' : ''}>About</Link>
              </li>
              <li>
                <Link to="/pricing" className={location.pathname === '/pricing' ? 'active-link' : ''}>Pricing</Link>
              </li>
              <li>
                <Link to="/contact" className={location.pathname === '/contact' ? 'active-link' : ''}>Contact Us</Link>
              </li>
            </ul>
          </nav>
          <div className="nav-actions">
            {localStorage.getItem('token') ? (
              <Link to="/dashboard" className="btn-primary">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-text">Log In</Link>
                <Link to="/login" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>
          <div className="mobile-toggle" id="mobile-toggle" onClick={() => setIsMobileMenuOpen(true)}>
            <i className='bx bx-menu'></i>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <Link to="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
            <i className='bx bx-link'></i> Pay<span>Chain</span>
          </Link>
          <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
            <i className='bx bx-x'></i>
          </button>
        </div>
        <nav className="mobile-nav-links">
          <Link
            to="/"
            className={location.pathname === '/' ? 'active-link' : ''}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <i className='bx bx-home-alt'></i> Home
          </Link>
          <Link
            to="/about"
            className={location.pathname === '/about' ? 'active-link' : ''}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <i className='bx bx-info-circle'></i> About
          </Link>
          <Link
            to="/pricing"
            className={location.pathname === '/pricing' ? 'active-link' : ''}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <i className='bx bx-purchase-tag'></i> Pricing
          </Link>
          <Link
            to="/contact"
            className={location.pathname === '/contact' ? 'active-link' : ''}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <i className='bx bx-envelope'></i> Contact Us
          </Link>
        </nav>
        <div className="mobile-drawer-actions">
          {localStorage.getItem('token') ? (
            <Link to="/dashboard" className="btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-text" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
              <Link to="/login" className="btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
