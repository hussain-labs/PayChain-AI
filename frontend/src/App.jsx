import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
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
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSupport from './pages/admin/AdminSupport';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUserProfile from './pages/admin/AdminUserProfile';
import AdminPlanDistribution from './pages/admin/AdminPlanDistribution';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminReports from './pages/admin/AdminReports';
import WalletOverview from './pages/WalletOverview';
import Upgrade from './pages/Upgrade';
import POSMode from './pages/POSMode';
import { ThemeProvider } from './context/ThemeContext';
import PricingPage from './pages/PricingPage';
import Chatbot from './components/Chatbot';
import ThemeSwitcher from './components/ThemeSwitcher';
import { Toaster } from 'react-hot-toast';

const ADMIN_ROUTES = ['/admin/dashboard', '/admin/users', '/admin/support', '/admin/settings', '/admin/plans', '/admin/transactions', '/admin/reports'];
const ADMIN_PREFIXES = ['/admin/users/'];
const USER_ROUTES = ['/dashboard', '/pos', '/statistics', '/transfers', '/cards', '/support', '/upgrade', '/notifications'];
const SHARED_ROUTES = ['/settings'];
const WALLET_PREFIX = '/wallet/';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRole === 'admin' && !user.isAdmin) return <Navigate to="/dashboard" replace />;
  if (allowedRole === 'user' && user.isAdmin) return <Navigate to="/admin/dashboard" replace />;

  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AnimationObserver = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    setTimeout(() => { document.querySelectorAll('.fade-in').forEach(el => observer.observe(el)); }, 100);
    return () => observer.disconnect();
  }, [pathname]);
  return null;
};

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const isAdminRoute = ADMIN_ROUTES.includes(path) || ADMIN_PREFIXES.some(p => path.startsWith(p));
  const isUserRoute = USER_ROUTES.includes(path) || path.startsWith(WALLET_PREFIX);
  const isSharedRoute = SHARED_ROUTES.includes(path);
  const isDashboardLayout = isAdminRoute || isUserRoute || isSharedRoute;
  const isAuthPage = ['/login', '/register'].includes(path);

  // Route guard: redirect logged-in users away from public/auth pages
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token && !isDashboardLayout) {
      // Logged in user hitting public page → redirect to correct home
      if (user.isAdmin) navigate('/admin/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [path, isDashboardLayout, navigate]);

  return (
    <>
      {!isDashboardLayout && <Navbar />}

      <div className="main-content-wrapper">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User dashboard pages */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRole="user"><Dashboard /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute allowedRole="user"><POSMode /></ProtectedRoute>} />
          <Route path="/wallet/:address" element={<ProtectedRoute allowedRole="user"><WalletOverview /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute allowedRole="user"><Statistics /></ProtectedRoute>} />
          <Route path="/transfers" element={<ProtectedRoute allowedRole="user"><Transfers /></ProtectedRoute>} />
          <Route path="/cards" element={<ProtectedRoute allowedRole="user"><Cards /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRole="shared"><Settings /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute allowedRole="user"><Support /></ProtectedRoute>} />
          <Route path="/upgrade" element={<ProtectedRoute allowedRole="user"><Upgrade /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute allowedRole="user"><Notifications /></ProtectedRoute>} />

          {/* Admin dashboard pages */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRole="admin"><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/plans" element={<ProtectedRoute allowedRole="admin"><AdminPlanDistribution /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/transactions" element={<ProtectedRoute allowedRole="admin"><AdminTransactions /></ProtectedRoute>} />
          <Route path="/admin/support" element={<ProtectedRoute allowedRole="admin"><AdminSupport /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRole="admin"><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute allowedRole="admin"><AdminUserProfile /></ProtectedRoute>} />

          {/* Legacy route fallback */}
          <Route path="/admin/tickets" element={<Navigate to="/admin/support" replace />} />
        </Routes>
      </div>

      {!isAuthPage && !isAdminRoute && <Chatbot />}
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
        <div className="bg-shape shape-1" />
        <div className="bg-shape shape-2" />
        <MainLayout />
      </Router>
    </ThemeProvider>
  );
}

export default App;
