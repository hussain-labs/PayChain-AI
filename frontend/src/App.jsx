import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import Transfers from './pages/Transfers';
import Cards from './pages/Cards';
import Settings from './pages/Settings';
import Support from './pages/Support';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSupport from './pages/admin/AdminSupport';
import WalletOverview from './pages/WalletOverview';
import Upgrade from './pages/Upgrade';
import { ThemeProvider } from './context/ThemeContext';
import PricingPage from './pages/PricingPage';
import Chatbot from './components/Chatbot';
import ThemeSwitcher from './components/ThemeSwitcher';
import { Toaster } from 'react-hot-toast';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AnimationObserver = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Give React time to render the new page
    setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
      });
    }, 100);

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboardLayout = ['/dashboard', '/statistics', '/transfers', '/cards', '/settings', '/support', '/upgrade', '/admin/users', '/admin/support'].includes(location.pathname) || location.pathname.startsWith('/wallet/');
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  // Prevent logged-in users from accessing public or auth pages
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isDashboardLayout) {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, isDashboardLayout, navigate]);

  return (
    <>
      {!isDashboardLayout && <Navbar />}

      <div className="main-content-wrapper">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallet/:address" element={<WalletOverview />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/support" element={<Support />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/support" element={<AdminSupport />} />
        <Route path="/upgrade" element={<Upgrade />} />
      </Routes>
      </div>

      {!isAuthPage && <Chatbot />}
      {!isAuthPage && !isDashboardLayout && <ThemeSwitcher />}

      {!isDashboardLayout && <Footer />}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'var(--glass-bg, rgba(255,255,255,0.1))',
            color: 'var(--text-color)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          },
        }} 
      />
      <Router>
        <ScrollToTop />
        <AnimationObserver />

        {/* Background Decor */}
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>

        <MainLayout />
      </Router>
    </ThemeProvider>
  );
}

export default App;
