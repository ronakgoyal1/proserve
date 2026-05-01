import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, MapPin, Check, ShieldCheck, Clock, Calendar,
  MessageCircle, Share2, Award, Briefcase, ChevronRight,
  Globe, Phone, Shield
} from 'lucide-react';
import { services } from '../data/mockData';
import { dbService } from '../lib/dbService';
import { buildWhatsAppUrl, trackWhatsAppClick, isWhatsAppEnabled } from '../lib/whatsapp';
import BookingModal from '../components/BookingModal';
import ReviewForm from '../components/ReviewForm';
import './Profile.css';

const timeSlots = ['10 AM', '11 AM', '2 PM', '3 PM', '4 PM'];

export default function Profile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('about');
  const [professional, setProfessional] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState({ average: 0, count: 0 });

  useEffect(() => {
    async function load() {
      try {
        const data = await dbService.getProfessionalById(id);
        setProfessional(data);
        // Load reviews
        const proReviews = dbService.getReviewsForProfessional(id);
        setReviews(proReviews);
        const avg = dbService.getAverageRating(id);
        setAvgRating(avg);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const handleReviewSubmitted = (newReview) => {
    // Prepend the new review and recalculate average
    setReviews(prev => [newReview, ...prev]);
    const updatedReviews = [newReview, ...reviews];
    const sum = updatedReviews.reduce((acc, r) => acc + Number(r.rating), 0);
    setAvgRating({
      average: Math.round((sum / updatedReviews.length) * 10) / 10,
      count: updatedReviews.length,
    });
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

  // Use live review count if we have reviews, otherwise fall back to professional.reviews
  const displayRating = avgRating.count > 0 ? avgRating.average : professional.rating;
  const displayCount = avgRating.count > 0 ? avgRating.count : professional.reviews;

  const tabs = ['about', 'services', 'reviews', 'certifications'];

  return (
    <main className="profile-page" id="profile-page">
      {/* Header */}
      <section className="profile-header">
        <div className="container">
          <div className="profile-header-inner">
            <div className="profile-avatar">{professional.initials}</div>
            <div className="profile-info">
              <div className="profile-name-row">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {professional.name}
                  {professional.verification?.status === 'verified' && (
                    <span className="badge badge-gold" style={{ fontSize: '12px' }}>
                      <Shield size={14} /> Wisor Verified
                    </span>
                  )}
                </h1>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{professional.category}</span>
                {professional.verification?.status === 'verified' ? (
                  <>
                    <span className="badge badge-success">
                      <ShieldCheck size={12} /> Documents Verified
                    </span>
                    <span className="badge" style={{ background: 'var(--color-gray-100)', color: 'var(--color-gray-600)'}}>
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
                <span className="rating-text">
                  <Star size={14} fill="var(--color-star)" color="var(--color-star)" />
                  {displayRating} ({displayCount} reviews)
                </span>
                <span><Briefcase size={14} /> {professional.experience} years</span>
                <span><MapPin size={14} /> {professional.city}</span>
                <span><Globe size={14} /> {professional.languages.join(', ')}</span>
              </div>
              <div className="profile-actions">
                <button className="btn btn-primary" onClick={() => setIsBookingOpen(true)}>
                  <Calendar size={16} /> Book Consultation
                </button>
                {isWhatsAppEnabled(professional) ? (
                  <a
                    href={buildWhatsAppUrl(
                      professional.contactPhone || professional.contact_phone ||
                      professional.settings?.whatsappNumber || '',
                      professional.name,
                      professional.services
                    )}
                    onClick={() => trackWhatsAppClick(professional.id)}
                    className="btn btn-whatsapp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                ) : (
                  <button className="btn btn-whatsapp" style={{ opacity: 0.45, cursor: 'not-allowed' }} disabled title="WhatsApp not available for this expert">
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                )}
                {(professional.contactPhone || professional.contact_phone) && (
                  <a href={`tel:${professional.contactPhone || professional.contact_phone}`} className="btn btn-secondary">
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
                <div className="animate-fade-in">
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', fontFamily: 'var(--font-display)' }}>
                    About
                  </h2>
                  <p className="profile-bio">{professional.bio}</p>

                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', fontFamily: 'var(--font-display)' }}>
                    Services Offered
                  </h2>
                  <div className="profile-services-list">
                    {professional.services.map(s => (
                      <span key={s} className="profile-service-tag">{s}</span>
                    ))}
                  </div>

                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', fontFamily: 'var(--font-display)' }}>
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
                <div className="animate-fade-in">
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', fontFamily: 'var(--font-display)' }}>
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

              {/* Reviews */}
              {activeTab === 'reviews' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                      Client Reviews ({displayCount})
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                      <Star size={20} fill="var(--color-star)" color="var(--color-star)" />
                      {displayRating}
                    </div>
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
                                <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                                  {Array.from({ length: r.rating }, (_, i) => (
                                    <Star key={i} size={12} fill="var(--color-star)" color="var(--color-star)" />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className="review-date">
                                {new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              {r.service_used && (
                                <div style={{ fontSize: '11px', color: 'var(--color-gray-400)', marginTop: '2px' }}>
                                  Service: {r.service_used}
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="review-text">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-gray-400)' }}>
                      <p>No reviews yet. Be the first to leave a review!</p>
                    </div>
                  )}

                  {/* Review Form */}
                  <ReviewForm professionalId={id} onReviewSubmitted={handleReviewSubmitted} />
                </div>
              )}

              {/* Certifications */}
              {activeTab === 'certifications' && (
                <div className="animate-fade-in">
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', fontFamily: 'var(--font-display)' }}>
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
              <div className="sidebar-card" style={{ borderColor: 'var(--color-primary)', background: 'linear-gradient(180deg, rgba(26, 86, 219, 0.05) 0%, var(--color-primary-dark) 100%)' }}>
                <h3 style={{ color: 'var(--color-primary-light)' }}><ShieldCheck size={18} style={{ verticalAlign: 'middle', marginRight: 8, marginTop: -2 }}/> Trust & Verification</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-gray-300)', fontSize: '13px', fontWeight: 500 }}>
                    <div style={{ padding: 4, background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: '50%' }}><Check size={12} strokeWidth={3} /></div>
                    Identity Verified
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-gray-300)', fontSize: '13px', fontWeight: 500 }}>
                    <div style={{ padding: 4, background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: '50%' }}><Check size={12} strokeWidth={3} /></div>
                    Credentials Verified
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-gray-300)', fontSize: '13px', fontWeight: 500 }}>
                    <div style={{ padding: 4, background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: '50%' }}><Check size={12} strokeWidth={3} /></div>
                    Documents Verified
                  </div>
                </div>
                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: 'var(--color-gray-400)', textAlign: 'center' }}>
                  Verified since {professional.verification?.date}
                </div>
              </div>
              ) : (
              <div className="sidebar-card" style={{ borderColor: 'var(--color-warning)' }}>
                 <h3 style={{ color: 'var(--color-warning)' }}>Verification Pending</h3>
                 <p style={{ fontSize: '12px', color: 'var(--color-gray-400)', marginTop: '8px', lineHeight: 1.5 }}>This professional's credentials are currently unverified or under review by our trust team.</p>
              </div>
              )}

              <div className="sidebar-card">
                <h3>Book a Consultation</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)', marginBottom: 'var(--space-4)' }}>
                  Starting at <strong style={{ color: 'var(--color-white)', fontSize: 'var(--text-xl)' }}>₹{professional.startingPrice.toLocaleString()}</strong>
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 'var(--space-4)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
                  {professional.availability}
                </p>
                <div className="sidebar-cta-buttons">
                  <button className="btn btn-primary btn-lg" onClick={() => setIsBookingOpen(true)}>
                    <Calendar size={18} /> Book Now
                  </button>
                  <button className="btn btn-whatsapp">
                    <MessageCircle size={18} /> Chat on WhatsApp
                  </button>
                </div>
              </div>

              <div className="sidebar-card">
                <h3>Availability This Week</h3>
                <div className="availability-grid">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="availability-day">{d}</div>
                  ))}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, di) =>
                    timeSlots.slice(0, 1).map((t, ti) => (
                      <div
                        key={`${d}-${t}`}
                        className={`availability-slot ${di < 5 ? 'available' : 'unavailable'}`}
                      >
                        {di < 5 ? '✓' : '—'}
                      </div>
                    ))
                  )}
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', textAlign: 'center' }}>
                  Click on a slot to book
                </p>
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
