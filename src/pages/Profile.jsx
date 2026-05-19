import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  MapPin, Check, ShieldCheck, Clock, Calendar,
  MessageCircle, Share2, Award, Briefcase, ChevronRight,
  Globe, Phone, Shield, MessageSquare, Users
} from 'lucide-react';
import { dbService } from '../lib/dbService';
import { buildWhatsAppUrl, trackWhatsAppClick, isWhatsAppEnabled } from '../lib/whatsapp';
import BookingModal from '../components/BookingModal';
import ReviewForm from '../components/ReviewForm';
import './Profile.css';

export default function Profile() {
  const { id } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('about');
  const [professional, setProfessional] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('book') === 'true') {
      setIsBookingOpen(true);
    }
  }, [location.search]);

  useEffect(() => {
    async function load() {
      try {
        const data = await dbService.getProfessionalById(id);
        setProfessional(data);
        const proReviews = dbService.getReviewsForProfessional(id);
        setReviews(proReviews);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const handleReviewSubmitted = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
  };

  if (isLoading) {
    return (
      <main className="profile-page">
        <div className="container" style={{ padding: 'var(--space-20) 0', textAlign: 'center' }}>
          <h2>Loading...</h2>
        </div>
      </main>
    );
  }

  if (!professional) {
    return (
      <main className="profile-page">
        <div className="container" style={{ padding: 'var(--space-20) 0', textAlign: 'center' }}>
          <h2>Professional not found</h2>
          <p style={{ color: 'var(--color-gray-500)', marginTop: 'var(--space-2)' }}>The professional you're looking for doesn't exist.</p>
          <Link to="/search" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            Browse Experts
          </Link>
        </div>
      </main>
    );
  }

  const tabs = ['about', 'services', 'testimonials', 'certifications'];

  return (
    <main className="profile-page" id="profile-page">
      {/* Header */}
      <section className="profile-header">
        <div className="container">
          <div className="profile-header-inner">
            <div className="profile-avatar">{professional.initials}</div>
            <div className="profile-info">
              <div className="profile-name-row">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 500, letterSpacing: '-0.5px' }}>
                  {professional.name}
                  {professional.verification?.status === 'verified' && (
                    <span className="badge badge-gold" style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: 'normal' }}>
                      <Shield size={14} /> Wisor Verified
                    </span>
                  )}
                </h1>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{professional.category}</span>
                {professional.verification?.status === 'verified' ? (
                  <>
                    <span className="badge badge-success">
                      <ShieldCheck size={12} /> Documents Verified
                    </span>
                    <span className="badge" style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)'}}>
                      Verified {professional.verification.date}
                    </span>
                  </>
                ) : (
                  <span className="badge" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)'}}>
                    Verification Pending
                  </span>
                )}
              </div>
              <div className="profile-meta">
                {reviews.length > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={14} style={{ color: 'var(--accent-primary)' }} />
                    {reviews.length} client {reviews.length === 1 ? 'testimonial' : 'testimonials'}
                  </span>
                )}
                <span><Briefcase size={14} /> {professional.experience} years</span>
                <span><MapPin size={14} /> {professional.city}</span>
                <span><Globe size={14} /> {professional.languages.join(', ')}</span>
              </div>
              <div className="profile-actions" style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                {isWhatsAppEnabled(professional) ? (
                  <a
                    href={buildWhatsAppUrl(
                      professional.contactPhone || professional.contact_phone ||
                      professional.settings?.whatsappNumber || '',
                      professional.name,
                      professional.services
                    )}
                    onClick={() => trackWhatsAppClick(professional.id)}
                    className="btn"
                    style={{ background: '#25d366', color: 'white', border: '1px solid #25d366', padding: '0 24px', height: '48px', borderRadius: '8px', fontWeight: 600 }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={16} /> Chat on WhatsApp
                  </a>
                ) : (
                  <button className="btn" style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', padding: '0 24px', height: '48px', borderRadius: '8px', fontWeight: 600, cursor: 'not-allowed' }} disabled title="WhatsApp not available for this expert">
                    <MessageCircle size={16} /> Chat on WhatsApp
                  </button>
                )}
                <button className="btn" style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', padding: '0 24px', height: '48px', borderRadius: '8px', fontWeight: 600 }} onClick={() => setIsBookingOpen(true)}>
                  <Calendar size={16} /> Book Consultation
                </button>
                {(professional.contactPhone || professional.contact_phone) && (
                  <a href={`tel:${professional.contactPhone || professional.contact_phone}`} className="btn" style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', padding: '0 24px', height: '48px', borderRadius: '8px', fontWeight: 600 }}>
                    <Phone size={16} /> Call
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="profile-body">
        <div className="container">
          <div className="profile-layout">
            {/* Main */}
            <div className="profile-main">
              {/* Tabs */}
              <div className="profile-tabs">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* About */}
              {activeTab === 'about' && (
                <div className="animate-fade-in" style={{ padding: '24px 0' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>
                    About
                  </h2>
                  <p className="profile-bio" style={{ lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '40px' }}>{professional.bio}</p>

                  <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>
                    Services Offered
                  </h2>
                  <div className="profile-services-list" style={{ marginBottom: '40px' }}>
                    {professional.services.map(s => (
                      <span key={s} className="profile-service-tag">{s}</span>
                    ))}
                  </div>

                  <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>
                    Certifications
                  </h2>
                  <div className="profile-certs">
                    {professional.certifications.map(c => (
                      <span key={c} className="profile-cert">
                        <Award size={14} /> {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services & Pricing */}
              {activeTab === 'services' && (
                <div className="animate-fade-in" style={{ padding: '24px 0' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>
                    Pricing Packages
                  </h2>
                  <div className="profile-packages">
                    {professional.packages.map((pkg, idx) => (
                      <div key={pkg.name} className={`package-card ${idx === 1 ? 'featured-package' : ''}`}>
                        {idx === 1 && <span className="package-popular">Popular</span>}
                        <h3>{pkg.name}</h3>
                        <div className="package-price">₹{pkg.price.toLocaleString()}</div>
                        <p className="package-desc">{pkg.description}</p>
                        <div className="package-features">
                          {pkg.features.map(f => (
                            <div key={f} className="package-feature">
                              <Check size={14} /> {f}
                            </div>
                          ))}
                        </div>
                        <button className={`btn ${idx === 1 ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%' }}>
                          Choose {pkg.name} <ChevronRight size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Testimonials */}
              {activeTab === 'testimonials' && (
                <div className="animate-fade-in" style={{ padding: '24px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 500, fontFamily: "'Playfair Display', serif" }}>
                      Client Testimonials {reviews.length > 0 && <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>({reviews.length})</span>}
                    </h2>
                  </div>

                  {reviews.length > 0 ? (
                    <div className="profile-reviews-list">
                      {reviews.map(r => (
                        <div key={r.id} className="profile-review">
                          <div className="review-header">
                            <div className="review-author">
                              <div className="review-avatar">
                                {(r.author_name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                              <div className="review-author-info">
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {r.author_name}
                                  {r.is_verified_client && (
                                    <span style={{ 
                                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                                      fontSize: '10px', fontWeight: 600, color: 'var(--color-success)',
                                      background: 'var(--color-success-bg)', padding: '1px 8px',
                                      borderRadius: 'var(--radius-full)'
                                    }}>
                                      <ShieldCheck size={10} /> Verified Client
                                    </span>
                                  )}
                                </h4>
                                {r.service_used && (
                                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {r.service_used}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="review-date">
                                {new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <p className="review-text">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  {reviews.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                      <MessageSquare size={32} style={{ margin: '0 auto var(--space-3)', opacity: 0.3 }} />
                      <p>No testimonials yet. Be the first to share your experience!</p>
                    </div>
                  )}

                  {/* Review Form */}
                  <ReviewForm professionalId={id} onReviewSubmitted={handleReviewSubmitted} />
                </div>
              )}

              {/* Certifications */}
              {activeTab === 'certifications' && (
                <div className="animate-fade-in" style={{ padding: '24px 0' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>
                    Certifications & Qualifications
                  </h2>
                  <div className="profile-certs">
                    {professional.certifications.map(c => (
                      <span key={c} className="profile-cert">
                        <Award size={14} /> {c}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: 'var(--space-6)' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Languages</h3>
                    <div className="profile-services-list">
                      {professional.languages.map(l => (
                        <span key={l} className="profile-service-tag">{l}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="profile-sidebar">
              {professional.verification?.status === 'verified' ? (
              <div className="sidebar-card" style={{ border: '1px solid var(--border-subtle)', background: 'var(--surface-elevated)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}><ShieldCheck size={18} style={{ verticalAlign: 'middle', marginRight: 8, marginTop: -2, color: 'var(--accent-primary)' }}/> Trust & Verification</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
                    <div style={{ padding: 2, background: 'var(--surface-base)', color: 'var(--accent-primary)', borderRadius: '50%' }}><Check size={14} strokeWidth={3} /></div>
                    Identity Verified
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
                    <div style={{ padding: 2, background: 'var(--surface-base)', color: 'var(--accent-primary)', borderRadius: '50%' }}><Check size={14} strokeWidth={3} /></div>
                    Credentials Verified
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
                    <div style={{ padding: 2, background: 'var(--surface-base)', color: 'var(--accent-primary)', borderRadius: '50%' }}><Check size={14} strokeWidth={3} /></div>
                    Documents Verified
                  </div>
                </div>
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Verified since {professional.verification?.date}
                </div>
              </div>
              ) : (
              <div className="sidebar-card" style={{ border: '1px solid #FDE68A', background: '#FFFBEB', borderRadius: '16px', padding: '24px' }}>
                 <h3 style={{ color: '#D97706', fontSize: '16px', fontWeight: 600 }}>Verification Pending</h3>
                 <p style={{ fontSize: '13px', color: '#92400E', marginTop: '8px', lineHeight: 1.5 }}>This professional's credentials are currently unverified or under review by our trust team.</p>
              </div>
              )}

              <div className="sidebar-card" style={{ border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '24px', marginTop: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Get in Touch</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Starting at <strong style={{ color: 'var(--text-primary)', fontSize: '20px' }}>₹{professional.startingPrice.toLocaleString()}</strong>
                </p>
                <div className="sidebar-cta-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {isWhatsAppEnabled(professional) ? (
                    <a
                      href={buildWhatsAppUrl(
                        professional.contactPhone || professional.contact_phone ||
                        professional.settings?.whatsappNumber || '',
                        professional.name,
                        professional.services
                      )}
                      onClick={() => trackWhatsAppClick(professional.id)}
                      className="btn"
                      style={{ background: '#25d366', color: 'white', border: '1px solid #25d366', padding: '0 24px', height: '48px', borderRadius: '8px', fontWeight: 600, width: '100%', display: 'flex', justifyContent: 'center', textDecoration: 'none' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={18} /> Chat on WhatsApp
                    </a>
                  ) : (
                    <button className="btn" style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', padding: '0 24px', height: '48px', borderRadius: '8px', fontWeight: 600, width: '100%', display: 'flex', justifyContent: 'center', cursor: 'not-allowed' }} disabled title="WhatsApp not available for this expert">
                      <MessageCircle size={18} /> Chat on WhatsApp
                    </button>
                  )}
                  <button className="btn" style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', padding: '0 24px', height: '48px', borderRadius: '8px', fontWeight: 600, width: '100%', display: 'flex', justifyContent: 'center' }} onClick={() => setIsBookingOpen(true)}>
                    <Calendar size={18} /> Request Callback
                  </button>
                </div>
              </div>

              </aside>
          </div>
        </div>
      </section>

      {isBookingOpen && (
        <BookingModal 
          isOpen={isBookingOpen} 
          onClose={() => setIsBookingOpen(false)} 
          professional={professional} 
        />
      )}
    </main>
  );
}
