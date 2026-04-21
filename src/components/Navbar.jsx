import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Shield, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from './AuthContext';
import { authService } from '../lib/authService';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">
              <Shield size={20} />
            </div>
            Pro<span>Serve</span>
          </Link>

          <div className="navbar-links">
            <Link to="/">Home</Link>
            <Link to="/search">Find Experts</Link>
            <Link to="/ai-discovery" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-accent)', fontWeight: 600 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
              AI Matchmaker
            </Link>
            <Link to="/search?category=CA">CA Services</Link>
            <Link to="/search?category=CMA">CMA Services</Link>
          </div>

          <div className="navbar-actions">
            {session ? (
              <>
                <Link to="/dashboard" className="btn btn-ghost btn-sm">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button 
                  onClick={async () => { await authService.signOut(); navigate('/'); }} 
                  className="btn btn-secondary btn-sm"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
                <Link to="/login?tab=signup" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}
          </div>

          <button
            className="navbar-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`mobile-menu-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">
              <Shield size={18} />
            </div>
            Pro<span>Serve</span>
          </Link>
          <button
            className="mobile-menu-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mobile-menu-links">
          <Link to="/">Home</Link>
          <Link to="/search">Find Experts</Link>
          <Link to="/ai-discovery" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>AI Matchmaker</Link>
          <Link to="/search?category=CA">CA Services</Link>
          <Link to="/search?category=CMA">CMA Services</Link>
        </div>

        <div className="mobile-menu-actions">
          {session ? (
            <>
              <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
              <button 
                onClick={async () => { await authService.signOut(); navigate('/'); setMobileOpen(false); }} 
                className="btn btn-secondary"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Log In</Link>
              <Link to="/login?tab=signup" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
