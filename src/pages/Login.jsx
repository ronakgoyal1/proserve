import { useState } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Eye, EyeOff, Shield, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { authService } from '../lib/authService';
import { useAuth } from '../components/AuthContext';
import './Login.css';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const initialRole = searchParams.get('role') === 'professional' ? 'professional' : 'user';

  const [tab, setTab] = useState(initialTab);
  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { session } = useAuth(); // Monitor global session
  
  // Auto-redirect if session exists (e.g. successful OAuth or previous login)
  if (session) {
    const userRole = session.user?.user_metadata?.role;
    const userEmail = session.user?.email;

    if (userEmail === 'ronakdiscord@gmail.com' || userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'professional') {
      return <Navigate to="/pro-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  const validate = () => {
    const newErrors = {};
    if (tab === 'signup' && !formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (tab === 'signup' && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    
    try {
      if (tab === 'signup') {
        const metadata = { role: role, name: formData.name };
        const { user, session: newSession } = await authService.signUp(formData.email, formData.password, metadata);
        
        // Supabase edge case: If confirmed email is required, session might be null.
        if (!newSession && authService.hasSupabaseConfig) {
          setSuccess(true);
          setIsSubmitting(false);
          return;
        }
      } else {
        await authService.signIn(formData.email, formData.password);
      }
      // If successful, Global session will update and trigger the smart redirect block above.
    } catch (error) {
      console.error('[Login] Error:', error);
      setIsSubmitting(false);
      setErrors({ email: error.message || 'Authentication failed. Please check credentials.' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error as user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrors({});
    console.log('[Login] Google SSO clicked. Triggering Supabase OAuth...');
    try {
      await authService.signInWithOAuth('google');
      // No immediate navigate() call here.
      // We rely on Supabase redirecting the user to Google, then bounding back.
    } catch (error) {
      console.error('[Login] Google login caught exception:', error);
      setIsSubmitting(false);
      setErrors({ email: error.message || 'Failed to authenticate with Google.' });
    }
  };

  return (
    <main className="login-page" id="login-page">
      <div className="login-container">
        <div className="login-card animate-scale-in">
          <div className="login-header">
            {success ? (
              <div className="success-header animate-fade-in">
                <CheckCircle2 size={48} color="var(--color-success)" />
                <h1>Check your email!</h1>
                <p>We've sent a verification link. Please confirm your account before logging in.</p>
              </div>
            ) : (
              <>
                <h1>{tab === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
                <p>
                  {tab === 'login'
                    ? 'Sign in to access your ProServe account'
                    : 'Join ProServe to find or become a verified expert'
                  }
                </p>
              </>
            )}
          </div>

          {!success && (
            <>
              {/* Tab Toggle */}
              <div className="login-tabs">
                <button
                  className={`login-tab ${tab === 'login' ? 'active' : ''}`}
                  onClick={() => { setTab('login'); setErrors({}); setFormData({name:'', email:'', password:''}); }}
                >
                  Log In
                </button>
                <button
                  className={`login-tab ${tab === 'signup' ? 'active' : ''}`}
                  onClick={() => { setTab('signup'); setErrors({}); }}
                >
                  Sign Up
                </button>
              </div>

              {/* Role Selector (signup only) */}
              {tab === 'signup' && (
                <div className="role-selector">
                  <div
                    className={`role-option ${role === 'user' ? 'active' : ''}`}
                    onClick={() => setRole('user')}
                  >
                    <div className="role-option-icon"><User size={20} /></div>
                    <span>I need an expert</span>
                  </div>
                  <div
                    className={`role-option ${role === 'professional' ? 'active' : ''}`}
                    onClick={() => setRole('professional')}
                  >
                    <div className="role-option-icon"><Briefcase size={20} /></div>
                    <span>I am an expert</span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form className="login-form" onSubmit={handleSubmit} noValidate>
                {tab === 'signup' && (
                  <div className="form-field">
                    <label>Full Name</label>
                    <div className={`form-input ${errors.name ? 'form-input-error' : ''}`}>
                      <User size={18} />
                      <input 
                        type="text" 
                        name="name"
                        placeholder="Enter your full name" 
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.name && <span className="error-text"><AlertCircle size={14}/> {errors.name}</span>}
                  </div>
                )}

                <div className="form-field">
                  <label>Email Address</label>
                  <div className={`form-input ${errors.email ? 'form-input-error' : ''}`}>
                    <Mail size={18} />
                    <input 
                      type="email" 
                      name="email"
                      placeholder="you@example.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && <span className="error-text"><AlertCircle size={14}/> {errors.email}</span>}
                </div>

                <div className="form-field">
                  <label>Password</label>
                  <div className={`form-input ${errors.password ? 'form-input-error' : ''}`}>
                    <Lock size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <span className="error-text"><AlertCircle size={14}/> {errors.password}</span>}
                </div>

                {tab === 'login' && (
                  <div className="form-row">
                    <label>
                      <input type="checkbox" disabled={isSubmitting} /> Remember me
                    </label>
                    <a href="#">Forgot password?</a>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 size={18} className="spin" /> Processing...</>
                  ) : (
                    tab === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              <div className="login-divider">
                <span>or</span>
              </div>

              <div className="social-login">
                <button type="button" className="social-btn" onClick={handleGoogleLogin} disabled={isSubmitting}>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </button>
                <button type="button" className="social-btn" disabled={isSubmitting}>
                  <Shield size={18} />
                  SSO
                </button>
              </div>

              <div className="login-footer">
                {tab === 'login'
                  ? <>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setTab('signup'); setErrors({}); }}>Sign up</a></>
                  : <>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setTab('login'); setErrors({}); }}>Log in</a></>
                }
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
