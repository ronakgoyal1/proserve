import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { dbService } from '../lib/dbService';
import { generateAIPortfolioPayload } from '../lib/mockAIEngine';
import { Loader2, Sparkles, Wand2, Copy, CheckCircle2, Globe, FileText, Share2, LayoutTemplate, Zap } from 'lucide-react';

export default function AiPortfolio() {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activePortfolio, setActivePortfolio] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: session?.user?.user_metadata?.full_name || '',
    profession: 'Chartered Accountant',
    experience: '5',
    city: '',
    services: 'Tax Filing, Audit, Advisory',
    targetClients: 'Startups, SMEs',
    bio: '',
    achievements: 'Handled 500+ clients',
    languages: 'English, Hindi',
    contactEmail: session?.user?.email || '',
    contactPhone: '',
    linkedin: '',
    twitter: ''
  });

  useEffect(() => {
    async function fetchExisting() {
      try {
        const existing = await dbService.getMyPortfolio(session.user.id);
        if (existing) {
          setActivePortfolio(existing);
          // Pre-fill form from existing content
          const c = existing.content;
          setFormData(prev => ({
             ...prev,
             name: c.name || prev.name,
             profession: c.profession || prev.profession,
             experience: c.experience || prev.experience,
             city: c.city || prev.city,
             services: c.services?.join(', ') || prev.services,
             targetClients: c.targetClients || prev.targetClients,
             bio: c.bio || prev.bio,
             achievements: c.achievements?.join(', ') || prev.achievements,
             languages: c.languages?.join(', ') || prev.languages,
             contactEmail: c.contactEmail || prev.contactEmail,
             contactPhone: c.contactPhone || prev.contactPhone,
             linkedin: c.socials?.linkedin || prev.linkedin,
             twitter: c.socials?.twitter || prev.twitter
          }));
        }
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      } finally {
        setLoading(false);
      }
    }
    if (session?.user?.id) fetchExisting();
  }, [session]);

  const generateUniqueSlug = async (baseName) => {
    let baseSlug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let counter = 0;
    while (true) {
      let testSlug = counter === 0 ? baseSlug : `${baseSlug}-${counter}`;
      const existing = await dbService.getPortfolioBySlug(testSlug);
      // If it exists but belongs to the current user, it's fine.
      // For Supabase, it has user_id. For LocalMock it's userId.
      const ownerId = existing ? (existing.user_id || existing.userId) : null;
      if (existing && ownerId !== session.user.id) {
         counter++;
      } else {
         return testSlug;
      }
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const slug = await generateUniqueSlug(formData.name);
      
      // AI Generation Process
      await new Promise(r => setTimeout(r, 2200));
      
      const content = generateAIPortfolioPayload(formData);

      const result = await dbService.savePortfolio(session.user.id, slug, content);
      setActivePortfolio(result);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate portfolio.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/portfolio/${activePortfolio.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} className="spin" style={{ color: 'var(--color-accent)' }} />
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-gray-50)', padding: 'var(--space-8) 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutTemplate size={32} style={{ color: 'var(--color-accent)' }} />
              AI Portfolio Studio
            </h1>
            <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-lg)' }}>Instantly generate a premium, client-converting public website.</p>
          </div>
          <button onClick={() => navigate('/pro-dashboard')} className="btn btn-ghost">Back to Dashboard</button>
        </div>

        {error && (
           <div style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
             {error}
           </div>
        )}

        {/* Success / Active Portfolio State */}
        {activePortfolio && !processing && (
          <div style={{ background: 'var(--color-primary)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', color: 'white', marginBottom: 'var(--space-8)', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Sparkles style={{ color: 'var(--color-accent)' }} />
              <h2 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>Your Portfolio is Live!</h2>
            </div>
            
            <div style={{ padding: 'var(--space-4)', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.8, fontSize: '14px', fontFamily: 'monospace' }}>
                {window.location.origin}/portfolio/{activePortfolio.slug}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleCopyLink} className="btn btn-secondary btn-sm" style={{ background: 'white', color: 'var(--color-primary)', padding: '8px 12px' }}>
                  {copied ? <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} /> : <Copy size={16} />} 
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={() => window.open(`/portfolio/${activePortfolio.slug}`, '_blank')} className="btn btn-primary btn-sm" style={{ background: 'var(--color-accent)', color: 'var(--color-primary)' }}>
                  <Globe size={16} /> View Live
                </button>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-gray-400)', margin: 0 }}>You can edit your content below and re-generate to update the live site.</p>
          </div>
        )}

        {/* Input Form */}
        <div style={{ background: 'white', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)' }}>
          
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Profession / Title</label>
                <input required type="text" value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} placeholder="e.g. Chartered Accountant" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Experience (Years)</label>
                <input required type="number" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Primary City</label>
                <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Services Offered (Comma separated)</label>
                <textarea required rows="2" value={formData.services} onChange={e => setFormData({...formData, services: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-primary)' }}><Zap size={14} style={{ display: 'inline', color: 'var(--color-accent)' }}/> Target Clients</label>
                <textarea required rows="2" value={formData.targetClients} onChange={e => setFormData({...formData, targetClients: e.target.value})} placeholder="e.g. Startups, E-commerce, HNI" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-accent)', resize: 'vertical' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Short Bio</label>
              <textarea rows="3" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Leave blank for AI to generate based on your profession and city." style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', resize: 'vertical' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Key Achievements (Comma separated)</label>
              <textarea rows="2" value={formData.achievements} onChange={e => setFormData({...formData, achievements: e.target.value})} placeholder="e.g. Saved 10Cr in taxes, Fast-tracked 50 startups" style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Contact Email</label>
                <input required type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Phone / WhatsApp (Optional)</label>
                <input type="tel" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>LinkedIn URL</label>
                <input type="text" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Twitter URL</label>
                <input type="text" value={formData.twitter} onChange={e => setFormData({...formData, twitter: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} />
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-4)' }}>
              <button disabled={processing} type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', gap: '8px', fontSize: '16px' }}>
                {processing ? <><Loader2 size={20} className="spin" /> Generating AI Landing Page...</> : <><Wand2 size={20} /> {activePortfolio ? 'Update AI Portfolio' : 'Generate AI Portfolio'}</>}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </main>
  );
}
