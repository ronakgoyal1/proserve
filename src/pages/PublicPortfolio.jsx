import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dbService } from '../lib/dbService';
import { Loader2, ShieldCheck, CheckCircle2, Award, Briefcase, Calendar, MessageSquare, ArrowRight, Mail, Phone, Quote, Check, MapPin, AlertCircle, Globe, Zap, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// Robust Error Boundary to intercept any render exceptions natively and prevent a white-screen crash.
class PortfolioErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("PublicPortfolio Exception Caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-gray-900)', color: 'white', padding: '2rem', textAlign: 'center' }}>
          <AlertCircle size={64} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
          <h1 style={{ marginBottom: '1rem' }}>Display Error</h1>
          <p style={{ color: 'var(--color-gray-400)', maxWidth: '600px', marginBottom: '2rem' }}>We encountered an invalid layout shape while rendering this portfolio. This usually happens if the portfolio content is malformed or missing key parameters.</p>
          <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid var(--color-danger)', padding: '1rem', borderRadius: '8px', textAlign: 'left', maxWidth: '800px', overflowX: 'auto', color: 'var(--color-danger)' }}>
            <pre style={{ margin: 0, fontSize: '12px' }}>{this.state.error && this.state.error.toString()}</pre>
          </div>
          <button onClick={() => window.location.href = '/'} className="btn btn-primary" style={{ marginTop: '2rem' }}>Return Home</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PublicPortfolio() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [expertId, setExpertId] = useState(null);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const found = await dbService.getPortfolioBySlug(slug);
        setPortfolio(found);
        
        if (found) {
           const pros = await dbService.getProfessionals();
           const match = pros.find(p => String(p.user_id || p.userId) === String(found.user_id || found.userId));
           if (match) {
             setExpertId(match.id);
           }
        }
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)' }}>
        <Loader2 size={40} className="spin" style={{ color: 'var(--color-accent)' }} />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary)', color: 'white' }}>
        <ShieldCheck size={64} style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-4)' }} />
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>Profile Not Found</h1>
        <p style={{ color: 'var(--color-gray-400)', marginBottom: 'var(--space-8)' }}>This portfolio link is either inactive or does not exist.</p>
        <Link to="/" className="btn btn-primary" style={{ background: 'var(--color-accent)', color: 'var(--color-primary-dark)', borderRadius: 'var(--radius-full)' }}>
          Visit ProServe Directory
        </Link>
      </div>
    );
  }

  return (
    <PortfolioErrorBoundary>
      <PortfolioRenderer portfolio={portfolio} expertId={expertId} />
    </PortfolioErrorBoundary>
  );
}

// Split the renderer safely to allow ErrorBoundary isolation
function PortfolioRenderer({ portfolio, expertId }) {
  const navigate = useNavigate();
  // Safe Fallback Extractors - Deep structure defense
  const content = (portfolio && typeof portfolio.content === 'object') ? portfolio.content : {};
  // Handle case where content was double-stringified in DB
  const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
  
  const safeName = parsedContent.name || 'ProServe Professional';
  const safeProfession = parsedContent.profession || 'Specialized Consultant';
  const safeBio = parsedContent.bio || `A dedicated professional bringing structured expertise to help businesses scale securely.`;
  const safeExperience = parsedContent.experience || '5+';
  const safeCity = parsedContent.city || 'India';
  const safeTargetClients = parsedContent.targetClients || 'Startups & SMEs';
  const safeServices = Array.isArray(parsedContent.services) ? parsedContent.services : ['General Consultation'];
  const safeAchievements = Array.isArray(parsedContent.achievements) ? parsedContent.achievements : ['Consistently exceeded client expectations and compliance targets.'];
  const safeLanguages = Array.isArray(parsedContent.languages) ? parsedContent.languages : ['English'];
  const safeFaqs = Array.isArray(parsedContent.faqs) ? parsedContent.faqs : [];
  
  const safeContactEmail = parsedContent.contactEmail || '';
  const safeContactPhone = parsedContent.contactPhone || '';
  const safeSocials = (parsedContent.socials && typeof parsedContent.socials === 'object') ? parsedContent.socials : {};

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() || 'P';
  };

  const handleBookSubmit = () => {
    if (expertId) {
      navigate(`/professional/${expertId}?book=true`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Dynamic SEO */}
      <Helmet>
        <title>{`${safeName} | ${safeProfession}`}</title>
      </Helmet>

      {/* Internal Minimal Portfolio Navbar */}
      <header className="portfolio-navbar animate-fade-in">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>
             <ShieldCheck size={20} style={{ color: 'var(--color-accent)' }} />
             <span>ProServe</span>
          </a>
          <button onClick={handleBookSubmit} className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '8px 24px' }}>
            Book Consultation
          </button>
        </div>
      </header>
      
      {/* 1. Ultra Premium Hero Overhaul */}
      <section className="portfolio-hero-bg" style={{ color: 'white', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-12)' }}>
        {/* Deep layered glow blooms */}
        <div className="hero-bloom-1"></div>
        <div className="hero-bloom-2"></div>
        
        <div className="container animate-fade-in-up" style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '800px' }}>
          
          <div className="premium-identity-card">
            <div className="initial-ring">
               {getInitials(safeName)}
            </div>
            <div className="pro-badge">
               <ShieldCheck size={16} /> Verified Elite Partner
            </div>
          </div>

          <h1 className="hero-name-gradient" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 'var(--space-3)' }}>
             {safeName}
          </h1>
          
          <h2 style={{ fontSize: 'var(--text-xl)', color: '#94a3b8', fontWeight: 400, letterSpacing: '0.5px', marginBottom: 'var(--space-8)' }}>
             {parsedContent.heroTitle || safeProfession}
          </h2>
          
          {/* Enhanced Trust Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'center', marginBottom: 'var(--space-10)' }}>
             <div className="trust-pill-new">
               <Briefcase size={16} /> {safeExperience} Years Expertise
             </div>
             <div className="trust-pill-new">
               <Zap size={16} /> Lightning Fast Response
             </div>
             <div className="trust-pill-new">
               <Users size={16} /> 500+ Top Clients
             </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-5)', justifyContent: 'center' }}>
             <button onClick={handleBookSubmit} className="btn-luxury">
               Schedule Strategy Session
             </button>
             <button onClick={() => document.getElementById('services').scrollIntoView()} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '15px', fontWeight: 600, padding: '16px 32px', borderRadius: '999px', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
               View Specializations
             </button>
          </div>
        </div>
      </section>

      {/* 2. About Area */}
      <section className="container section animate-fade-in-up delay-1">
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
           <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>About Me</h2>
           <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-600)', lineHeight: 1.8 }}>
             {safeBio}
           </p>
        </div>
      </section>

      {/* 3. Services */}
      <section id="services" style={{ background: 'var(--color-gray-50)' }} className="section animate-fade-in-up delay-2">
         <div className="container">
           <div className="section-header">
             <h2>Areas of Expertise</h2>
             <p>Comprehensive solutions tailored specifically for {safeTargetClients}.</p>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
             {safeServices.map((svc, idx) => (
               <div key={idx} className="card-premium">
                 <CheckCircle2 size={28} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }} />
                 <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>{svc}</h3>
                 <p style={{ color: 'var(--color-gray-500)', lineHeight: 1.6, margin: 0 }}>Strategic planning and dedicated execution customized to your exact operational requirements.</p>
               </div>
             ))}
           </div>
         </div>
      </section>

      {/* 4. Why Choose Me (Achievements) */}
      <section className="container section animate-fade-in-up delay-3">
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-10)', alignItems: 'center' }}>
            <div style={{ flex: '1 1 400px' }}>
               <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>Why Work With Me?</h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                 {safeAchievements.map((ach, idx) => (
                   <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                     <div style={{ flexShrink: 0, padding: '10px', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', borderRadius: '50%' }}>
                       <Award size={20} />
                     </div>
                     <div>
                       <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-gray-800)', marginTop: '2px' }}>Proven Results</h4>
                       <p style={{ color: 'var(--color-gray-600)', marginTop: '4px', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>{ach}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            
            <div style={{ flex: '1 1 400px', background: 'var(--color-primary-dark)', padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)', color: 'white',  boxShadow: 'var(--shadow-xl)' }}>
              <ShieldCheck size={40} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }} />
              <h3 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>ProServe Verified Network</h3>
              <p style={{ color: 'var(--color-gray-300)', marginBottom: 'var(--space-6)', lineHeight: 1.7 }}>
                 My credentials, identity, and background pass strict standards on the ProServe Network platform, assuring safe, compliant, and fraud-free advisory services.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', color: 'var(--color-gray-200)' }}>
                 <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={18} style={{ color: 'var(--color-success)' }} /> Government Identity Verified</li>
                 <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={18} style={{ color: 'var(--color-success)' }} /> Academic Credentials Checked</li>
                 <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Check size={18} style={{ color: 'var(--color-success)' }} /> Verified Professional History</li>
              </ul>
            </div>
         </div>
      </section>

      {/* 5. FAQ */}
      {safeFaqs && safeFaqs.length > 0 && (
        <section style={{ background: 'var(--color-gray-50)' }} className="section animate-fade-in-up delay-4">
           <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="section-header">
                <h2>Frequently Asked Questions</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                 {safeFaqs.map((faq, idx) => (
                   <div key={idx} className="card-premium" style={{ padding: 'var(--space-6)', borderLeft: '4px solid var(--color-accent)' }}>
                     <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>{faq.q}</h4>
                     <p style={{ color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* 6. Footer & Contact Branding */}
      <footer style={{ background: 'var(--color-gray-900)', color: 'white', marginTop: 'auto', paddingBottom: '80px' /* Pad for mobile sticky CTA */ }}>
        <div className="container" style={{ padding: 'var(--space-12) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
           <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>Ready to scale together?</h2>
             <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-400)', marginBottom: 'var(--space-8)', maxWidth: '600px' }}>
                Book a primary consultation to review your requirements, scope constraints, and long term advisory needs.
             </p>
             <button onClick={handleBookSubmit} className="btn-luxury">
                Schedule Consultation
             </button>
          </div>
        </div>

        <div className="container" style={{ padding: 'var(--space-6) 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-6)' }}>
           <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
              {safeContactEmail && (
                <a href={`mailto:${safeContactEmail}`} style={{ color: 'var(--color-gray-400)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <Mail size={16} /> Email
                </a>
              )}
              {safeContactPhone && (
                <a href={`tel:${safeContactPhone}`} style={{ color: 'var(--color-gray-400)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <Phone size={16} /> Contact Line
                </a>
              )}
              {safeSocials.linkedin && (
                <a href={safeSocials.linkedin.startsWith('http') ? safeSocials.linkedin : `https://${safeSocials.linkedin}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-gray-400)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <Globe size={16} /> LinkedIn
                </a>
              )}
           </div>

           <div style={{ color: 'var(--color-gray-500)', fontSize: '13px' }}>
              &copy; {new Date().getFullYear()} {safeName}. All rights reserved.
           </div>
        </div>
      </footer>

      {/* 7. Sticky Mobile Bottom CTA */}
      <div className="sticky-mobile-cta">
         <button onClick={handleBookSubmit} className="btn-luxury" style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
           Book Consultation
         </button>
      </div>

    </div>
  );
}
