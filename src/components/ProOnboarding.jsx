import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { CheckCircle2, ChevronRight, Loader2, Clock } from 'lucide-react';
import { dbService } from '../lib/dbService';
import { authService } from '../lib/authService';

export default function ProOnboarding() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Extract real onboarding status
  const onboardingStatus = session?.user?.user_metadata?.onboardingStatus;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Submit to the admin queue
      await dbService.submitProfessionalApplication({
        userId: session?.user?.id,
        email: session?.user?.email,
        ...formData
      });

      // 2. Update local metadata to lock out the strict pending screen
      await authService.updateUserMetadata({ onboardingStatus: 'pending' });
      
      // Reload page to reflect auth constraint immediately
      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (onboardingStatus === 'pending') {
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
            <p style={{ color: 'var(--color-gray-500)' }}>Tell us a bit more about your practice to enter the verification queue.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Full Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Phone Number</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} required />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Profession</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} required>
                  <option value="CA">Chartered Accountant (CA)</option>
                  <option value="CMA">Cost Management Accountant (CMA)</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Experience (Years)</label>
                <input type="number" min="0" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Base City</label>
                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Certification ID <span style={{color: 'var(--color-gray-400)', fontWeight: 'normal'}}>(Optional)</span></label>
                <input type="text" value={formData.certificationId} onChange={e => setFormData({...formData, certificationId: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} placeholder="e.g. ICAI Mem. No" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Key Specialties <span style={{color: 'var(--color-gray-400)', fontWeight: 'normal'}}>(Comma separated)</span></label>
              <input type="text" value={formData.specialties} onChange={e => setFormData({...formData, specialties: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} placeholder="e.g. GST Registration, Startup Tax" required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Short Bio</label>
              <textarea rows="3" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', resize: 'vertical' }} placeholder="Introduce yourself to potential clients..." required />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-6)', width: '100%', padding: '1rem', fontSize: '16px' }} disabled={loading}>
              {loading ? <><Loader2 size={18} className="spin" /> Submitting Application...</> : <>Submit Application <ChevronRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
