import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Eye, EyeOff, Shield, AlertCircle, CheckCircle2, Loader2, Clock } from 'lucide-react';
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
  
  // Rate Limit UI
  const [cooldownTime, setCooldownTime] = useState(0);

  const { session } = useAuth(); // Monitor global session
  
  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldownTime > 0) {
      timer = setInterval(() => setCooldownTime(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownTime]);

  // Handle Intent Hydration for OAuth on existing sessions
  // If the user logs in via Google without setting metadata beforehand, 
  // we catch the intent from localStorage and apply it now.
  useEffect(() => {
    async function hydrateOAuthIntent() {
      if (session && session.user) {
        const intentRole = localStorage.getItem('proserve_oauth_intent_role');
        const isSignUpIntent = intentRole === 'user' || intentRole === 'professional';

        if (isSignUpIntent && !session.user.user_metadata?.role) {
          console.log('[Login] Hydrating OAuth Role Intent:', intentRole);
          try {
             await authService.updateUserMetadata({ 
               role: intentRole, 
               onboardingStatus: intentRole === 'professional' ? 'required' : 'complete' 
             });
             // Instantly mutate local object so the router below reads the fresh state
             session.user.user_metadata = session.user.user_metadata || {};
             session.user.user_metadata.role = intentRole;
             session.user.user_metadata.onboardingStatus = intentRole === 'professional' ? 'required' : 'complete';
          } catch(e) { console.error("Hydration failed:", e); }
        }
        localStorage.removeItem('proserve_oauth_intent_role');
        
        // Auto-redirect logic
        const userRole = session.user?.user_metadata?.role || (isSignUpIntent ? intentRole : 'user');
        const userEmail = session.user?.email;
        const onboardingStatus = session.user?.user_metadata?.onboardingStatus || (userRole === 'professional' ? 'required' : 'complete');

        if (userEmail === 'ronakdiscord@gmail.com' || userRole === 'admin') {
          navigate('/admin', { replace: true });
        } else if (userRole === 'professional') {
          if (onboardingStatus !== 'approved') navigate('/onboarding', { replace: true });
          else navigate('/pro-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    }
    hydrateOAuthIntent();
  }, [session, navigate]);

  // Don't render the form while auto-redirect is resolving
  if (session) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)' }}>
        <Loader2 size={40} className="spin" style={{ color: 'var(--color-accent)' }} />
      </div>
    );
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

  const handleErrorContext = (errorMsg) => {
    const msg = String(errorMsg).toLowerCase();
    if (msg.includes('rate limit') || msg.includes('too many requests')) {
      setCooldownTime(15);
      setErrors({ global: 'Security pause: Please wait 15 seconds before trying again.' });
    } else if (msg.includes('already registered')) {
      setTab('login');
      setErrors({ email: 'An account with this email already exists. Please sign in instead.' });
    } else {
      setErrors({ email: errorMsg || 'Authentication failed. Please check credentials.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || cooldownTime > 0) return; 
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    
    try {
      let finalRole = role;
      let userObj = null;

      if (tab === 'signup') {
        const metadata = { role: role, name: formData.name, onboardingStatus: role === 'professional' ? 'required' : 'complete' };
        
        console.log('[Login] Initiating signUp for:', formData.email);
        const response = await authService.signUp(formData.email, formData.password, metadata);
        
        const { user, session: newSession } = response;
        userObj = user;
        
        if (!newSession && authService.hasSupabaseConfig) {
          setSuccess(true);
          return;
        }
      } else {
        console.log('[Login] Initiating signIn for:', formData.email);
        const response = await authService.signIn(formData.email, formData.password);
        
        userObj = response?.user;
        finalRole = userObj?.user_metadata?.role;
      }

      let routeTo = '/dashboard';
      if (userObj?.email === 'ronakdiscord@gmail.com' || finalRole === 'admin') {
        routeTo = '/admin';
      } else if (finalRole === 'professional') {
        let currentStatus = userObj?.user_metadata?.onboardingStatus;
        if (currentStatus === 'required' || currentStatus === 'pending') {
          try {
            const { dbService } = await import('../lib/dbService');
            const realStatus = await dbService.getMyApplicationStatus(userObj.id);
            if (realStatus === 'Approved') {
               currentStatus = 'approved';
               await authService.updateUserMetadata({ onboardingStatus: 'approved' });
            }
          } catch(e) { console.error("Cached check failed", e); }
          
          if (currentStatus !== 'approved') routeTo = '/onboarding';
          else routeTo = '/pro-dashboard';
        } else {
          routeTo = '/pro-dashboard';
        }
      }

      window.location.href = routeTo;

    } catch (error) {
      console.error('[Login] Exact Authentication Error:', error);
      handleErrorContext(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name] || errors.global) setErrors(prev => ({ ...prev, [name]: null, global: null }));
  };

  const handleGoogleLogin = async () => {
    if (isSubmitting || cooldownTime > 0) return;
    setIsSubmitting(true);
    setErrors({});
    
    // Store exact role intent for Google SSO resolution upon callback
    const intent = tab === 'login' ? 'login' : role;
    localStorage.setItem('proserve_oauth_intent_role', intent);

    try {
      await authService.signInWithOAuth('google');
    } catch (error) {
      setIsSubmitting(false);
      handleErrorContext(error.message || 'Failed to authenticate with Google.');
    }
  };

  const handleDevLogin = async (devRole) => {
    if (isSubmitting || cooldownTime > 0) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      const response = await authService.devSignIn(devRole);
      const userObj = response.user;
      
      let routeTo = '/dashboard';
      if (devRole === 'admin') {
        routeTo = '/admin';
      } else if (devRole.startsWith('expert')) {
        try {
          const { dbService } = await import('../lib/dbService');
          const realStatus = await dbService.getMyApplicationStatus(userObj.id);
          
          if (realStatus === 'Approved') {
            await authService.updateUserMetadata({ onboardingStatus: 'approved' });
            routeTo = '/pro-dashboard';
          } else if (realStatus === 'Pending') {
            await authService.updateUserMetadata({ onboardingStatus: 'pending' });
            routeTo = '/onboarding';
          } else if (realStatus === 'Rejected') {
            await authService.updateUserMetadata({ onboardingStatus: 'rejected' });
            routeTo = '/onboarding';
          } else {
            await authService.updateUserMetadata({ onboardingStatus: 'required' });
            routeTo = '/onboarding';
          }
        } catch(e) {
          routeTo = '/onboarding';
        }
      }
      
      window.location.href = routeTo;
    } catch (err) {
      handleErrorContext(err.message);
      setIsSubmitting(false);
    }
  };

  const handleResetLocalData = () => {
    if (!window.confirm("Delete all local test data safely?")) return;
    const keysToClear = [
      'proserve_applications', 
      'proserve_professionals', 
      'proserve_bookings', 
      'proserve_leads', 
      'proserve_portfolios',
      'proserve_reviews',
      'proserve_dev_mock_session',
      'proserve_mock_user',
      'proserve_oauth_intent_role'
    ];
    keysToClear.forEach(k => localStorage.removeItem(k));
    alert("Local data wiped safely! Refreshing to clean state.");
    window.location.reload();
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
                  onClick={() => { setTab('login'); setErrors({}); }}
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

              {/* Role Selector (signup only) - Preserves state cross-tab */}
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

              {/* Globally Displayed API Errors / Rate Limits */}
              {errors.global && (
                <div style={{ background: 'var(--color-warning-bg)', margin: '0 0 var(--space-4)', padding: '12px', border: '1px solid var(--color-warning)', color: 'var(--color-warning)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
                   {cooldownTime > 0 ? <Clock size={16} /> : <AlertCircle size={16} />}
                   {errors.global}
                </div>
              )}

              {/* Google OAuth (Moved Up for Primary Focus) */}
              <div className="social-login" style={{ marginTop: tab === 'signup' ? '1rem' : '1.5rem', marginBottom: '1.5rem', flexDirection: 'column' }}>
                <button type="button" className="social-btn" onClick={handleGoogleLogin} disabled={isSubmitting || cooldownTime > 0} style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="login-divider">
                <span>or continue with email</span>
              </div>

              {/* Explicit Email Form */}
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
                        disabled={isSubmitting || cooldownTime > 0}
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
                      disabled={isSubmitting || cooldownTime > 0}
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
                      disabled={isSubmitting || cooldownTime > 0}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                      disabled={isSubmitting || cooldownTime > 0}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <span className="error-text"><AlertCircle size={14}/> {errors.password}</span>}
                </div>

                {tab === 'login' && (
                  <div className="form-row">
                    <label>
                      <input type="checkbox" disabled={isSubmitting || cooldownTime > 0} /> Remember me
                    </label>
                    <a href="#">Forgot password?</a>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting || cooldownTime > 0}>
                  {cooldownTime > 0 ? (
                    <><Clock size={18} /> Try again in {cooldownTime}s</>
                  ) : isSubmitting ? (
                    <><Loader2 size={18} className="spin" /> Processing...</>
                  ) : (
                    tab === 'login' ? 'Sign In' : `Create ${role === 'professional' ? 'Expert ' : ''}Account`
                  )}
                </button>
              </form>

              {/* Dev Only Testing Block */}
              {import.meta.env.DEV && (
                <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px dashed var(--color-gray-200)', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-3)' }}>
                    Test Environment Bypass
                  </p>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDevLogin('user')} disabled={isSubmitting || cooldownTime > 0}>Test User</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDevLogin('expert_approved')} disabled={isSubmitting || cooldownTime > 0}>Test Pro</button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={handleResetLocalData} style={{ color: 'var(--color-danger)', borderColor: 'rgba(220, 38, 38, 0.2)' }}>Wipe Dev Data</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
