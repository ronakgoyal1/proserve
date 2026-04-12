import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Check, ShieldCheck, Clock, Calendar as CalendarIcon,
  MessageCircle, Share2, Award, Briefcase, ChevronRight
} from 'lucide-react';
import { professionals, services } from '../data/mockData';
import BookingModal from '../components/BookingModal';
import ReviewForm from '../components/ReviewForm';
import './Profile.css';

const timeSlots = ['10 AM', '11 AM', '2 PM', '3 PM', '4 PM'];

export default function Profile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('about');

  const professional = professionals.find(p => p.id === parseInt(id));

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
                <h1>{professional.name}</h1>
                <span className="badge badge-primary">{professional.category}</span>
                {professional.verified && (
                  <span className="profile-verified">
                    <Shield size={12} /> Verified
                  </span>
                )}
              </div>
              <div className="profile-meta">
                <span className="rating-text">
                  <Star size={14} fill="var(--color-star)" color="var(--color-star)" />
                  {professional.rating} ({professional.reviews} reviews)
                </span>
                <span><Briefcase size={14} /> {professional.experience} years</span>
                <span><MapPin size={14} /> {professional.city}</span>
                <span><Globe size={14} /> {professional.languages.join(', ')}</span>
              </div>
              <div className="profile-actions">
                <Link to="#" className="btn btn-primary">
                  <Calendar size={16} /> Book Consultation
                </Link>
                <button className="btn btn-whatsapp">
                  <MessageCircle size={16} /> WhatsApp
                </button>
                <button className="btn btn-secondary">
                  <Phone size={16} /> Call
                </button>
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
                      Client Reviews ({professional.reviews})
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                      <Star size={20} fill="var(--color-star)" color="var(--color-star)" />
                      {professional.rating}
                    </div>
                  </div>
                  <div className="profile-reviews-list">
                    {mockReviews.map(r => (
                      <div key={r.id} className="profile-review">
                        <div className="review-header">
                          <div className="review-author">
                            <div className="review-avatar">
                              {r.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="review-author-info">
                              <h4>{r.name}</h4>
                              <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                                {Array.from({ length: r.rating }, (_, i) => (
                                  <Star key={i} size={12} fill="var(--color-star)" color="var(--color-star)" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="review-date">{r.date}</span>
                        </div>
                        <p className="review-text">{r.text}</p>
                      </div>
                    ))}
                  </div>
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
              <div className="sidebar-card">
                <h3>Book a Consultation</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-4)' }}>
                  Starting at <strong style={{ color: 'var(--color-gray-900)', fontSize: 'var(--text-xl)' }}>₹{professional.startingPrice.toLocaleString()}</strong>
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 'var(--space-4)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
                  {professional.availability}
                </p>
                <div className="sidebar-cta-buttons">
                  <button className="btn btn-primary btn-lg">
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
                  {weekDays.map(d => (
                    <div key={d} className="availability-day">{d}</div>
                  ))}
                  {weekDays.map((d, di) =>
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
    </main>
  );
}
