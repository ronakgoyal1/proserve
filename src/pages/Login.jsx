import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Eye, EyeOff, Shield, AlertCircle, CheckCircle2, Loader2, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { authService } from '../lib/authService';
import { useAuth } from '../components/AuthContext';
import './Login.css';

// ─── Routing Helper ──────────────────────────────────────────────────────────
async function resolveRoute(userObj) {
  const email = userObj?.email;
  const meta  = userObj?.user_metadata || {};
  const role  = meta.role;
  const onboardingStatus = meta.onboardingStatus;

  if (email === 'ronakdiscord@gmail.com' || role === 'admin') return '/admin';

  if (role === 'professional') {
    let status = onboardingStatus;
    if (status === 'required' || status === 'pending') {
      try {
        const { dbService } = await import('../lib/dbService');
        const real = await dbService.getMyApplicationStatus(userObj.id);
        if (real === 'Approved') {
          await authService.updateUserMetadata({ onboardingStatus: 'approved' });
          status = 'approved';
        }
      } catch (e) { /* ignore */ }
    }
    return status === 'approved' ? '/pro-dashboard' : '/onboarding';
  }

  return '/dashboard';
}

// ─── Google SVG ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Login() {
  const navigate  = useNavigate();
  const { session } = useAuth();

  // Screens: 'entry' | 'email' | 'role-select' | 'success'
  const [screen, setScreen] = useState('entry');
  const [emailMode, setEmailMode]   = useState('signin'); // 'signin' | 'signup'
  const [formData, setFormData]     = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [pendingUser, setPendingUser] = useState(null); // new user waiting for role pick
  const [selectedRole, setSelectedRole] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors]         = useState({});
  const [cooldownTime, setCooldownTime] = useState(0);

  // ── Cooldown timer ──
  useEffect(() => {
    let t;
    if (cooldownTime > 0) t = setInterval(() => setCooldownTime(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldownTime]);

  // ── Handle returned Google OAuth session ──
  useEffect(() => {
    if (!session?.user) return;

    async function handleSession() {
      const intentRole = localStorage.getItem('proserve_oauth_intent_role');
      localStorage.removeItem('proserve_oauth_intent_role');

      const meta = session.user.user_metadata || {};
      const hasRole = !!meta.role;

      // Returning user — route directly
      if (hasRole) {
        const route = await resolveRoute(session.user);
        navigate(route, { replace: true });
        return;
      }

      // Intentful OAuth (stored role before clicking Google)
      if (intentRole && intentRole !== 'login') {
        try {
          await authService.updateUserMetadata({
            role: intentRole,
            onboardingStatus: intentRole === 'professional' ? 'required' : 'complete'
          });
          session.user.user_metadata = { ...meta, role: intentRole, onboardingStatus: intentRole === 'professional' ? 'required' : 'complete' };
        } catch (e) { console.error('Hydration failed:', e); }
        const route = await resolveRoute(session.user);
        navigate(route, { replace: true });
        return;
      }

      // Truly new — show role picker
      setPendingUser(session.user);
      setScreen('role-select');
    }

    handleSession();
  }, [session, navigate]);

  // ── Error helpers ──
  const setGlobalError = (msg) => setErrors({ global: msg });
  const clearErrors = () => setErrors({});

  const handleRateLimit = (msg) => {
    const lower = String(msg).toLowerCase();
    if (lower.includes('rate limit') || lower.includes('too many')) {
      setCooldownTime(15);
      setGlobalError('Security pause: wait 15 seconds before retrying.');
    } else if (lower.includes('already registered') || lower.includes('already exists')) {
      setEmailMode('signin');
      setErrors({ email: 'Account exists. Sign in instead.' });
    } else {
      setGlobalError(msg || 'Authentication failed.');
    }
  };

  // ── Google OAuth ──
  const handleGoogle = async () => {
    if (isSubmitting || cooldownTime > 0) return;
    setIsSubmitting(true);
    clearErrors();
    // Don't store a role — we'll detect new vs returning after callback
    localStorage.setItem('proserve_oauth_intent_role', 'login');
    try {
      await authService.signInWithOAuth('google');
    } catch (err) {
      setIsSubmitting(false);
      handleRateLimit(err.message || 'Google auth failed.');
    }
  };

  // ── Email form submit ──
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || cooldownTime > 0) return;

    const errs = {};
    if (emailMode === 'signup' && !formData.name.trim()) errs.name = 'Full name required';
    if (!formData.email) errs.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password required';
    else if (emailMode === 'signup' && formData.password.length < 8) errs.password = 'Min 8 characters';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSubmitting(true);
    clearErrors();

    try {
      if (emailMode === 'signup') {
        // Sign up without role — we'll ask after
        const { user, session: newSession } = await authService.signUp(
          formData.email, formData.password,
          { name: formData.name }
        );
        if (!newSession && authService.hasSupabaseConfig) {
          setScreen('success');
          return;
        }
        // No metadata role yet — show role picker
        setPendingUser(user);
        setScreen('role-select');
      } else {
        const { user } = await authService.signIn(formData.email, formData.password);
        const route = await resolveRoute(user);
        window.location.href = route;
      }
    } catch (err) {
      handleRateLimit(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Role selection confirm ──
  const handleRoleConfirm = async () => {
    if (!selectedRole || isSubmitting) return;
    setIsSubmitting(true);
    clearErrors();
    try {
      const meta = {
        role: selectedRole,
        onboardingStatus: selectedRole === 'professional' ? 'required' : 'complete'
      };
      await authService.updateUserMetadata(meta);
      const route = selectedRole === 'professional' ? '/onboarding' : '/dashboard';
      window.location.href = route;
    } catch (err) {
      setGlobalError('Could not save your role. Please try again.');
      setIsSubmitting(false);
    }
  };

  // ── Dev helpers ──
  const handleDevLogin = async (devRole) => {
    if (isSubmitting || cooldownTime > 0) return;
    setIsSubmitting(true);
    clearErrors();
    try {
      const { user: userObj } = await authService.devSignIn(devRole);
      let routeTo = '/dashboard';
      if (devRole === 'admin') routeTo = '/admin';
      else if (devRole.startsWith('expert')) {
        const { dbService } = await import('../lib/dbService');
        const real = await dbService.getMyApplicationStatus(userObj.id).catch(() => null);
        if (real === 'Approved') { await authService.updateUserMetadata({ onboardingStatus: 'approved' }); routeTo = '/pro-dashboard'; }
        else { await authService.updateUserMetadata({ onboardingStatus: real === 'Pending' ? 'pending' : 'required' }); routeTo = '/onboarding'; }
      }
      window.location.href = routeTo;
    } catch (err) {
      handleRateLimit(err.message);
      setIsSubmitting(false);
    }
  };

  const handleResetLocalData = () => {
    if (!window.confirm('Delete all local test data safely?')) return;
    ['proserve_applications','proserve_professionals','proserve_bookings','proserve_leads',
     'proserve_portfolios','proserve_reviews','proserve_dev_mock_session','proserve_mock_user',
     'proserve_oauth_intent_role','proserve_mock_professionals'].forEach(k => localStorage.removeItem(k));
    alert('Local data wiped! Refreshing...');
    window.location.reload();
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: null, global: null }));
  };

  // ── Guard: session resolving ──
  if (session && screen === 'entry') {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-dark)' }}>
        <Loader2 size={40} className="spin" style={{ color: 'var(--color-accent)' }} />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCREEN: SUCCESS (email confirmation sent)
  // ─────────────────────────────────────────────────────────────────────────────
  if (screen === 'success') {
    return (
      <main className="login-page">
        <div className="login-container">
          <div className="login-card animate-scale-in" style={{ textAlign: 'center' }}>
            <CheckCircle2 size={56} style={{ color: 'var(--color-success)', margin: '0 auto var(--space-4)' }} />
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Check your inbox</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              We've sent a verification link to <strong>{formData.email}</strong>. Click it to activate your account.
            </p>
            <button className="btn btn-ghost btn-sm" onClick={() => setScreen('entry')}>Back to Sign In</button>
          </div>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCREEN: ROLE SELECT (new users only)
  // ─────────────────────────────────────────────────────────────────────────────
  if (screen === 'role-select') {
    return (
      <main className="login-page">
        <div className="login-container" style={{ maxWidth: '520px' }}>
          <div className="login-card animate-scale-in">
            <div className="login-header">
              <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--surface-elevated)', borderRadius: '50%', marginBottom: 'var(--space-4)' }}>
                <Shield size={28} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h1>How will you use Wisor?</h1>
              <p>Choose your account type. You can always change this later.</p>
            </div>

            {errors.global && (
              <div className="auth-error-banner"><AlertCircle size={16} />{errors.global}</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', margin: 'var(--space-2) 0 var(--space-6)' }}>
              {[
                { id: 'user', icon: <User size={28} />, label: 'I need an expert', sub: 'Find and book verified CAs, CMAs, and more.' },
                { id: 'professional', icon: <Briefcase size={28} />, label: 'I am an expert', sub: 'Get verified and offer your services to clients.' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedRole(opt.id)}
                  className={`role-card-btn${selectedRole === opt.id ? ' selected' : ''}`}
                >
                  <div className="role-card-icon">{opt.icon}</div>
                  <div className="role-card-text">
                    <strong>{opt.label}</strong>
                    <span>{opt.sub}</span>
                  </div>
                  <div className={`role-card-check${selectedRole === opt.id ? ' visible' : ''}`}>
                    <CheckCircle2 size={22} />
                  </div>
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={!selectedRole || isSubmitting}
              onClick={handleRoleConfirm}
            >
              {isSubmitting
                ? <><Loader2 size={18} className="spin" /> Setting up your account...</>
                : <>Continue <ChevronRight size={18} /></>
              }
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCREEN: EMAIL FORM
  // ─────────────────────────────────────────────────────────────────────────────
  if (screen === 'email') {
    return (
      <main className="login-page">
        <div className="login-container">
          <div className="login-card animate-scale-in">
            <button
              type="button"
              onClick={() => { setScreen('entry'); clearErrors(); }}
              className="auth-back-btn"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <div className="login-header" style={{ marginTop: 'var(--space-2)' }}>
              <h1>{emailMode === 'signin' ? 'Sign in' : 'Create account'}</h1>
              <p>{emailMode === 'signin' ? 'Welcome back to Wisor' : 'Join Wisor — free forever'}</p>
            </div>

            {/* Mode toggle */}
            <div className="login-tabs" style={{ marginBottom: 'var(--space-5)' }}>
              <button className={`login-tab ${emailMode === 'signin' ? 'active' : ''}`} onClick={() => { setEmailMode('signin'); clearErrors(); }}>Sign In</button>
              <button className={`login-tab ${emailMode === 'signup' ? 'active' : ''}`} onClick={() => { setEmailMode('signup'); clearErrors(); }}>Sign Up</button>
            </div>

            {errors.global && (
              <div className="auth-error-banner">
                {cooldownTime > 0 ? <Clock size={16} /> : <AlertCircle size={16} />}
                {errors.global}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {emailMode === 'signup' && (
                <div className="form-field">
                  <label>Full Name</label>
                  <div className={`form-input ${errors.name ? 'form-input-error' : ''}`}>
                    <User size={18} />
                    <input type="text" name="name" placeholder="Your full name" value={formData.name} onChange={handleInput} disabled={isSubmitting || cooldownTime > 0} autoFocus />
                  </div>
                  {errors.name && <span className="error-text"><AlertCircle size={14}/> {errors.name}</span>}
                </div>
              )}

              <div className="form-field">
                <label>Email</label>
                <div className={`form-input ${errors.email ? 'form-input-error' : ''}`}>
                  <Mail size={18} />
                  <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleInput} disabled={isSubmitting || cooldownTime > 0} autoFocus={emailMode === 'signin'} />
                </div>
                {errors.email && <span className="error-text"><AlertCircle size={14}/> {errors.email}</span>}
              </div>

              <div className="form-field">
                <label>Password</label>
                <div className={`form-input ${errors.password ? 'form-input-error' : ''}`}>
                  <Lock size={18} />
                  <input type={showPassword ? 'text' : 'password'} name="password" placeholder={emailMode === 'signup' ? 'Min 8 characters' : 'Your password'} value={formData.password} onChange={handleInput} disabled={isSubmitting || cooldownTime > 0} />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="password-toggle" disabled={isSubmitting}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="error-text"><AlertCircle size={14}/> {errors.password}</span>}
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting || cooldownTime > 0}>
                {cooldownTime > 0 ? <><Clock size={18} /> Retry in {cooldownTime}s</>
                  : isSubmitting ? <><Loader2 size={18} className="spin" /> Processing...</>
                  : emailMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Dev tools */}
            {import.meta.env.DEV && (
              <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px dashed var(--color-gray-200)', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-3)' }}>Dev Bypass</p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDevLogin('user')} disabled={isSubmitting}>Test User</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDevLogin('expert_approved')} disabled={isSubmitting}>Test Pro</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleResetLocalData} style={{ color: 'var(--color-danger)', borderColor: 'rgba(220,38,38,0.2)' }}>Wipe Data</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SCREEN: ENTRY (default)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-card animate-scale-in">
          <div className="login-header">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: 'var(--space-5)' }}>
              <div style={{ background: 'var(--accent-primary)', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                <Shield size={20} style={{ color: '#111' }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>Wi<span style={{ color: 'var(--accent-primary)' }}>sor</span></span>
            </Link>
            <h1>Welcome</h1>
            <p>Sign in or create your account in seconds</p>
          </div>

          {errors.global && (
            <div className="auth-error-banner">
              {cooldownTime > 0 ? <Clock size={16} /> : <AlertCircle size={16} />}
              {errors.global}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {/* Google */}
            <button
              type="button"
              className="social-btn"
              onClick={handleGoogle}
              disabled={isSubmitting || cooldownTime > 0}
              style={{ width: '100%', padding: '14px 20px', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 600 }}
            >
              {isSubmitting
                ? <Loader2 size={20} className="spin" />
                : <GoogleIcon />
              }
              <span>Continue with Google</span>
            </button>

            {/* Email */}
            <button
              type="button"
              onClick={() => setScreen('email')}
              disabled={isSubmitting}
              style={{
                width: '100%', padding: '14px 20px',
                background: 'var(--surface-elevated)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                fontSize: 'var(--text-sm)', fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <Mail size={20} />
              <span>Continue with Email</span>
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-5)', lineHeight: 1.6 }}>
            By continuing, you agree to our{' '}
            <Link to="/terms" style={{ color: 'var(--accent-primary)' }}>Terms</Link> and{' '}
            <Link to="/privacy" style={{ color: 'var(--accent-primary)' }}>Privacy Policy</Link>.
          </p>

          {/* Dev tools on entry screen too */}
          {import.meta.env.DEV && (
            <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px dashed var(--color-gray-200)', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-3)' }}>Dev Bypass</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDevLogin('user')} disabled={isSubmitting}>Test User</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDevLogin('expert_approved')} disabled={isSubmitting}>Test Pro</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleResetLocalData} style={{ color: 'var(--color-danger)', borderColor: 'rgba(220,38,38,0.2)' }}>Wipe Data</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
