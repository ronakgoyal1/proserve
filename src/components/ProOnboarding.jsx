import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { dbService } from '../lib/dbService';

export default function ProOnboarding() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.user_metadata?.full_name || '',
    category: 'CA',
    languages: 'English, Hindi',
    city: 'Mumbai',
    experience: 5
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // In a real flow, this pushes to dbService.updateProfessionalProfile(session.user.id, formData)
    setTimeout(() => {
      setLoading(false);
      navigate('/pro-dashboard');
    }, 1200);
  };

  return (
    <main style={{ minHeight: '80vh', padding: 'var(--space-8) 0', background: 'var(--color-gray-50)' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div style={{ background: 'white', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'inline-flex', padding: 'var(--space-3)', background: 'var(--color-blue-50)', color: 'var(--color-primary)', borderRadius: '50%', marginBottom: 'var(--space-4)' }}>
              <CheckCircle2 size={32} />
            </div>
            <h2>Complete Your Profile</h2>
            <p style={{ color: 'var(--color-gray-500)' }}>Tell us a bit more about your practice to get verified.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} 
                required 
              />
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }}
                >
                  <option value="CA">Chartered Accountant (CA)</option>
                  <option value="CMA">Cost Management Accountant (CMA)</option>
                </select>
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Base City</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: '14px', fontWeight: 500 }}>Experience (Years)</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.experience}
                  onChange={e => setFormData({...formData, experience: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} 
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-4)', width: '100%', padding: '1rem' }} disabled={loading}>
              {loading ? <><Loader2 size={18} className="spin" /> Saving Profile...</> : <>Finish Onboarding <ChevronRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
