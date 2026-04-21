import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dbService } from '../lib/dbService';
import { Loader2, ShieldCheck, CheckCircle2, Award, Briefcase, Calendar, MessageSquare, ArrowRight, Mail, Phone, Linkedin, Twitter, Quote, Check, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function PublicPortfolio() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [expertId, setExpertId] = useState(null); // Used to link to booking

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const found = await dbService.getPortfolioBySlug(slug);
        setPortfolio(found);
        
        if (found) {
           // We need to fetch the underlying professional ID to wire up "Book Now"
           // Mocks tie by user_id/userId, so we can try getting all pros and finding the match 
           // by name, or simply routing them to ProServe root booking if we lack the direct relational map in MVP.
           // Let's grab all pros and find the matching user_id.
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
        <Link to="/" className="btn btn-primary" style={{ background: 'var(--color-accent)', color: 'var(--color-primary-dark)' }}>
          Visit ProServe Directory
        </Link>
      </div>
    );
  }

  const content = portfolio?.content || {};
  
  // Safe Fallback Extractors
  const safeName = content.name || 'ProServe Expert';
  const safeProfession = content.profession || 'Consultant';
  const safeBio = content.bio || 'A dedicated professional bringing structured expertise to help businesses scale securely.';
  const safeServices = Array.isArray(content.services) ? content.services : [];
  const safeAchievements = Array.isArray(content.achievements) ? content.achievements : [];
  const safeLanguages = Array.isArray(content.languages) ? content.languages : [];
  
  return (
    <div style={{ background: '#fcfcfc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Dynamic SEO */}
      <Helmet>
        <title>{`${safeName} | ${safeProfession}`}</title>
      </Helmet>
      
      {/* Floating CTA Mobile Bar (if needed) but we use standard responsive */}
      
      {/* 1. Hero Intro */}
      <section style={{ background: 'var(--bg-gradient-premium)', color: 'white', paddingTop: 'var(--space-20)', paddingBottom: 'var(--space-20)', position: 'relative', overflow: 'hidden' }}>
        {/* Abstract Background Shapes */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(197,160,89,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '14px', fontWeight: 600, color: 'var(--color-accent)', marginBottom: 'var(--space-6)' }}>
             <ShieldCheck size={16} style={{ marginRight: '8px' }} /> Verified Professional
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 'var(--space-4)' }}>
             {safeName}
          </h1>
          <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)', color: 'var(--color-gray-300)', fontWeight: 400, marginBottom: 'var(--space-8)' }}>
             {content.heroTitle || safeProfession}
          </h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'center', marginBottom: 'var(--space-10)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gray-200)' }}>
               <Briefcase size={18} style={{ color: 'var(--color-accent)' }} /> <span>{content.experience} Years Exp.</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gray-200)' }}>
               <MapPin size={18} style={{ color: 'var(--color-accent)' }} /> <span>{content.city} &amp; Remote</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gray-200)' }}>
               <MessageSquare size={18} style={{ color: 'var(--color-accent)' }} /> <span>{safeLanguages.join(', ') || 'English'}</span>
             </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
             <button onClick={() => expertId ? navigate(`/professional/${expertId}?book=true`) : navigate('/login')} className="btn btn-primary" style={{ background: 'var(--color-accent)', color: 'var(--color-primary-dark)', fontSize: '18px', padding: '16px 32px' }}>
               Book Consultation
             </button>
             <button onClick={() => document.getElementById('services').scrollIntoView()} className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', fontSize: '18px', padding: '16px 32px' }}>
               View Services
             </button>
          </div>
        </div>
      </section>

      {/* 2. About Area */}
      <section className="container" style={{ padding: 'var(--space-16) 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
           <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)' }}>About Me</h2>
           <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-gray-600)', lineHeight: 1.8 }}>
             {safeBio}
           </p>
        </div>
      </section>

      {/* 3. Services */}
      <section id="services" style={{ background: 'var(--color-gray-50)', padding: 'var(--space-16) 0' }}>
         <div className="container">
           <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
             <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Areas of Expertise</h2>
             <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-lg)' }}>Comprehensive solutions tailored to your business.</p>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
             {safeServices.map((svc, idx) => (
               <div key={idx} style={{ background: 'white', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', borderTop: '4px solid var(--color-accent)' }}>
                 <CheckCircle2 size={32} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }} />
                 <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>{svc}</h3>
                 <p style={{ color: 'var(--color-gray-500)', lineHeight: 1.6 }}>Strategic planning, detailed execution, and compliance review tailored exactly to your requirements.</p>
               </div>
             ))}
           </div>
         </div>
      </section>

      {/* 4. Why Choose Me (Achievements) */}
      <section className="container" style={{ padding: 'var(--space-16) 0' }}>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-10)', alignItems: 'center' }}>
            <div style={{ flex: '1 1 400px' }}>
               <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)' }}>Why Work With Me?</h2>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                 {safeAchievements.map((ach, idx) => (
                   <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                     <div style={{ flexShrink: 0, padding: '12px', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', borderRadius: '50%' }}>
                       <Award size={24} />
                     </div>
                     <div>
                       <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-gray-800)', marginTop: '4px' }}>Proven Results</h4>
                       <p style={{ color: 'var(--color-gray-600)', marginTop: '4px' }}>{ach}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            
            <div style={{ flex: '1 1 400px', background: 'var(--color-primary-dark)', padding: 'var(--space-8)', borderRadius: 'var(--radius-2xl)', color: 'white',  boxShadow: 'var(--shadow-xl)' }}>
              <ShieldCheck size={48} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }} />
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

      {/* 5. Trust / Testimonials */}
      <section style={{ background: 'var(--color-primary)', color: 'white', padding: 'var(--space-16) 0' }}>
         <div className="container">
           <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
             <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Client Feedback</h2>
             <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-lg)' }}>Don't just take my word for it.</p>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
             {[1, 2].map((i) => (
               <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <Quote size={32} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }} />
                 <p style={{ fontSize: 'var(--text-lg)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 'var(--space-6)', color: 'var(--color-gray-300)' }}>
                   "Absolutely phenomenal service. Very quick to understand the core requirements and produced an audit report matching strict compliance parameters without errors."
                 </p>
                 <div style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                   — Startup Founder, {content.city !== 'Any' ? content.city : 'India'}
                 </div>
               </div>
             ))}
           </div>
         </div>
      </section>

      {/* 6. FAQ */}
      {content.faqs && content.faqs.length > 0 && (
        <section className="container" style={{ padding: 'var(--space-16) 0' }}>
           <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ textAlign: 'center', fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-10)' }}>Frequently Asked Questions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                 {content.faqs.map((faq, idx) => (
                   <div key={idx} style={{ background: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--color-accent)' }}>
                     <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>{faq.q}</h4>
                     <p style={{ color: 'var(--color-gray-600)', margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* 7. Footer & Final CTA */}
      <footer style={{ background: 'var(--color-gray-900)', color: 'white', marginTop: 'auto' }}>
        <div className="container" style={{ padding: 'var(--space-16) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
             <h2 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>Ready to scale together?</h2>
             <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-gray-400)', marginBottom: 'var(--space-8)', maxWidth: '600px' }}>
                Book a primary consultation to review your requirements, scope constraints, and long term advisory needs.
             </p>
             <button onClick={() => expertId ? navigate(`/professional/${expertId}?book=true`) : navigate('/search')} className="btn btn-primary" style={{ background: 'var(--color-accent)', color: 'var(--color-primary-dark)', fontSize: '20px', padding: '20px 48px', borderRadius: 'var(--radius-full)' }}>
                Schedule Consultation
             </button>
          </div>
        </div>

        {/* Contact Links & "Powered By" */}
        <div className="container" style={{ padding: 'var(--space-8) 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-6)' }}>
           
           <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
              {content.contactEmail && (
                <a href={`mailto:${content.contactEmail}`} style={{ color: 'var(--color-gray-400)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <Mail size={18} /> Email
                </a>
              )}
              {content.contactPhone && (
                <a href={`tel:${content.contactPhone}`} style={{ color: 'var(--color-gray-400)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <Phone size={18} /> Direct Line
                </a>
              )}
              {content.socials?.linkedin && (
                <a href={content.socials.linkedin.startsWith('http') ? content.socials.linkedin : `https://${content.socials.linkedin}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-gray-400)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  <Linkedin size={18} /> LinkedIn
                </a>
              )}
           </div>

           <a href="/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: 'var(--radius-full)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
             <span style={{ color: 'var(--color-gray-400)', fontSize: '13px', marginRight: '8px' }}>Powered by</span>
             <ShieldCheck size={16} style={{ color: 'var(--color-accent)', marginRight: '6px' }} />
             <span style={{ color: 'white', fontWeight: 600, fontSize: '14px', letterSpacing: '0.5px' }}>ProServe <span style={{ color: 'var(--color-accent)' }}>Network</span></span>
           </a>

        </div>
      </footer>
    </div>
  );
}
