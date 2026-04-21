import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { CheckCircle2, ChevronRight, Loader2, Clock, Phone, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { dbService } from '../lib/dbService';
import { authService } from '../lib/authService';

export default function ProOnboarding() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Extract external status and bridge it loosely to local state to allow instant mutation
  const initialStatus = session?.user?.user_metadata?.onboardingStatus;
  const [localStatus, setLocalStatus] = useState(initialStatus);

  // Modular OTP State Management
  const [otpState, setOtpState] = useState('idle'); // idle | sending | sent | verifying | verified
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  const [formData, setFormData] = useState({
    name: session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || '',
    category: 'CA',
    languages: 'English, Hindi',
    city: '',
    experience: 0,
    specialties: '',
    phone: '',
    bio: '',
    certificationId: ''
  });

  const handleSendOTP = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setOtpError('Enter a valid 10-digit phone number first.');
      return;
    }
    setOtpError('');
    setOtpState('sending');
    try {
      // Modular Stub: Integration ready for Twilio/MessageBird
      await new Promise(r => setTimeout(r, 800));
      setOtpState('sent');
    } catch (e) {
      setOtpError('Failed to send OTP SMS. Please try again.');
      setOtpState('idle');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length < 4) {
      setOtpError('Enter a valid OTP code.');
      return;
    }
    setOtpError('');
    setOtpState('verifying');
    try {
      // Modular Stub: Ready for Endpoint Validation
      await new Promise(r => setTimeout(r, 800));
      if (otpCode === '1234') { // Sandbox key
        setOtpState('verified');
      } else {
        setOtpError("Invalid OTP. Use '1234' for Sandbox testing.");
        setOtpState('sent');
      }
    } catch (e) {
      setOtpError('Failed to verify OTP. Please try again.');
      setOtpState('sent');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otpState !== 'verified') {
      setError('You must verify your phone number before submitting your application.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Duplicate prevention layer
      const queue = await dbService.getPendingApplications();
      if (queue.some(app => app.userId === session?.user?.id)) {
        setLocalStatus('pending');
        return;
      }

      await dbService.submitProfessionalApplication({
        userId: session?.user?.id,
        email: session?.user?.email,
        ...formData
      });
      await authService.updateUserMetadata({ onboardingStatus: 'pending' });
      setLocalStatus('pending'); // Instant render bypasses page reload hang
    } catch (err) {
      console.error('[Onboarding] Submit Error:', err);
      setError(err.message || 'An error occurred during application saving.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;
    async function checkApproval() {
      if (localStatus === 'pending' && session?.user?.id) {
        try {
          const actualStatus = await dbService.getMyApplicationStatus(session.user.id);
          if (actualStatus === 'Approved') {
            setLocalStatus('approved');
            await authService.updateUserMetadata({ onboardingStatus: 'approved' });
            setTimeout(() => navigate('/pro-dashboard'), 3000);
          } else if (actualStatus === 'Rejected') {
            setLocalStatus('rejected');
          }
        } catch (e) {
          console.error("Failed to fetch application status", e);
        }
      }
    }
    
    // Initial check
    checkApproval();
    
    // Poll every 10s while parked on pending screen for MVP
    if (localStatus === 'pending') {
      intervalId = setInterval(checkApproval, 10000);
    }
    return () => clearInterval(intervalId);
  }, [localStatus, session, navigate]);

  if (localStatus === 'pending') {
    return (
      <main style={{ minHeight: '80vh', padding: 'var(--space-8) 0', background: 'var(--color-gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ maxWidth: '500px' }}>
          <div style={{ background: 'white', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: 'var(--space-4)', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', borderRadius: '50%', marginBottom: 'var(--space-4)' }}>
              <Clock size={40} />
            </div>
            <h2>Application Pending</h2>
            <p style={{ color: 'var(--color-gray-500)', marginTop: 'var(--space-4)', lineHeight: '1.6' }}>
              We have received your professional application! Our verification team is currently reviewing your details. This usually takes 24-48 hours. 
            </p>
            <p style={{ color: 'var(--color-gray-500)', marginTop: 'var(--space-4)' }}>
              We will notify you via email once your dashboard is unlocked.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-outline" 
              style={{ marginTop: 'var(--space-6)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <RefreshCw size={16} /> Check Status Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (localStatus === 'approved') {
    return (
      <main style={{ minHeight: '80vh', padding: 'var(--space-8) 0', background: 'var(--color-gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ maxWidth: '500px' }}>
          <div className="animate-fade-in-up" style={{ background: 'white', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: 'var(--space-4)', background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: '50%', marginBottom: 'var(--space-4)' }}>
              <ShieldCheck size={40} />
            </div>
            <h2>Application Approved!</h2>
            <p style={{ color: 'var(--color-gray-500)', marginTop: 'var(--space-4)', lineHeight: '1.6' }}>
              Welcome to ProServe. Your expert registry profile has been created and you are now live.
            </p>
            <p style={{ color: 'var(--color-gray-500)', marginTop: 'var(--space-2)' }}>
              Redirecting to your dashboard...
            </p>
            <Loader2 size={24} className="spin" style={{ margin: 'var(--space-6) auto 0', color: 'var(--color-primary)' }} />
          </div>
        </div>
      </main>
    );
  }

  if (localStatus === 'rejected') {
    return (
      <main style={{ minHeight: '80vh', padding: 'var(--space-8) 0', background: 'var(--color-gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ maxWidth: '500px' }}>
          <div style={{ background: 'white', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: 'var(--space-4)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '50%', marginBottom: 'var(--space-4)' }}>
              <AlertCircle size={40} />
            </div>
            <h2>Application Rejected</h2>
            <p style={{ color: 'var(--color-gray-500)', marginTop: 'var(--space-4)', lineHeight: '1.6' }}>
              We regret to inform you that your professional application was not approved by our verification team. 
            </p>
            <p style={{ color: 'var(--color-gray-500)', marginTop: 'var(--space-4)' }}>
              If you believe this is a mistake, please reach out to our network team.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '80vh', padding: 'var(--space-8) 0', background: 'var(--color-gray-50)' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <div style={{ background: 'white', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'inline-flex', padding: 'var(--space-3)', background: 'var(--color-blue-50)', color: 'var(--color-primary)', borderRadius: '50%', marginBottom: 'var(--space-4)' }}>
              <CheckCircle2 size={32} />
            </div>
            <h2>Complete Your Profile</h2>
            <p style={{ color: 'var(--color-gray-500)' }}>Secure your practitioner identity before accessing the verification queue.</p>
          </div>

          {error && (
            <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '14px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Full Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Profession</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} required>
                  <option value="CA">Chartered Accountant (CA)</option>
                  <option value="CMA">Cost Management Accountant (CMA)</option>
                </select>
              </div>
            </div>

            {/* OTP Flow Block */}
            <div style={{ background: 'var(--color-blue-50)', border: '1px solid var(--color-blue-200)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)'}}>
                <label style={{ display: 'block', margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' }}>Phone Verification (Demo Sandbox)</label>
                <span style={{ fontSize: '12px', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>Testing Mode</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-gray-600)', marginBottom: 'var(--space-4)', lineHeight: '1.4' }}>Live SMS providers are currently disjointed. Enter any number and use sandbox code <strong>1234</strong> to verify.</p>
              
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
                  <input type="tel" value={formData.phone} onChange={e => { setFormData({...formData, phone: e.target.value}); if (otpState !== 'idle') setOtpState('idle'); }} disabled={otpState === 'verified' || otpState === 'sending' || otpState === 'verifying'} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', background: otpState === 'verified' ? 'var(--color-gray-100)' : 'white' }} placeholder="Enter mobile number" required />
                </div>
                
                {otpState === 'idle' && (
                  <button type="button" onClick={handleSendOTP} className="btn btn-secondary" style={{ padding: '0.75rem 1rem' }}>
                    Send OTP
                  </button>
                )}
                
                {otpState === 'sending' && (
                  <button type="button" disabled className="btn btn-secondary" style={{ padding: '0.75rem 1rem', opacity: 0.7 }}>
                    <Loader2 size={16} className="spin" /> Sending...
                  </button>
                )}

                {otpState === 'verified' && (
                  <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontWeight: 500, background: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)' }}>
                    <ShieldCheck size={18} /> Verified
                  </div>
                )}
              </div>

              {/* OTP Entry Phase */}
              {(otpState === 'sent' || otpState === 'verifying') && (
                <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                  <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="Enter sandbox code: 1234" maxLength={4} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${otpError ? 'var(--color-danger)' : 'var(--color-primary)'}` }} />
                  <button type="button" onClick={handleVerifyOTP} disabled={otpState === 'verifying'} className="btn btn-primary" style={{ padding: '0.75rem 1rem' }}>
                    {otpState === 'verifying' ? <Loader2 size={16} className="spin" /> : 'Confirm'}
                  </button>
                  <button type="button" onClick={handleSendOTP} className="btn btn-ghost" style={{ padding: '0.75rem 1rem' }}>
                    Resend
                  </button>
                </div>
              )}

              {otpError && <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginTop: 'var(--space-2)', marginBottom: 0 }}>{otpError}</p>}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Experience <span style={{fontWeight: 'normal', color: 'var(--color-gray-500)'}}>(Years)</span></label>
                <input type="number" min="0" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Base City</label>
                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Key Specialties</label>
                <input type="text" value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} placeholder="e.g. Audit, GST, Startup Tax" required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Certification ID</label>
                <input type="text" value={formData.certificationId} onChange={e => setFormData({...formData, certificationId: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} placeholder="Optional for now" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Short Practitioner Bio</label>
              <textarea rows="3" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', resize: 'vertical' }} placeholder="What drives you? Introduce yourself to leads bridging your expertise..." required />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-6)', width: '100%', padding: '1rem', fontSize: '16px' }} disabled={loading || otpState !== 'verified'}>
              {loading ? <><Loader2 size={18} className="spin" /> Sending to Verification Queues...</> : <>Submit Application <ChevronRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
