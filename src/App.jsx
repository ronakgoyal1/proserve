import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { usePageTracking } from './lib/analytics';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loading for performance optimization
const Home = lazy(() => import('./pages/Home'));
const SearchPage = lazy(() => import('./pages/Search'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const ProDashboard = lazy(() => import('./pages/ProDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const ProOnboarding = lazy(() => import('./components/ProOnboarding'));
const AiDiscovery = lazy(() => import('./pages/AiDiscovery'));
const AiPortfolio = lazy(() => import('./pages/AiPortfolio'));
const PublicPortfolio = lazy(() => import('./pages/PublicPortfolio'));
const Pricing = lazy(() => import('./pages/Pricing'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const PageLoader = () => (
  <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
    <Loader2 size={32} className="spin" />
  </div>
);

export default function App() {
  // Trigger basic analytics
  usePageTracking();

  return (
    <>
      <ScrollToTop />
      <Helmet>
        <title>Wisor | Verified CA & CMA Experts in India</title>
        <meta name="description" content="Find and book premium Chartered Accountants and Cost Management Accountants for your tax, compliance, and financial needs." />
      </Helmet>
      
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/professional/:id" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute requireUser><UserDashboard /></ProtectedRoute>} />
          <Route path="/pro-dashboard" element={<ProtectedRoute requirePro><ProDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute requirePro requireOnboardingFlow><ProOnboarding /></ProtectedRoute>} />
          <Route path="/ai-discovery" element={<AiDiscovery />} />
          <Route path="/ai-portfolio" element={<ProtectedRoute requirePro><AiPortfolio /></ProtectedRoute>} />
          <Route path="/portfolio/:slug" element={<PublicPortfolio />} />
          <Route path="/pricing" element={<Pricing />} />
          
          {/* Static Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}
