import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, ShieldCheck, Star, Users, Clock,
  CreditCard, ArrowRight, BadgeCheck, Calculator, FileText,
  ChevronRight, Zap, ChevronDown
} from 'lucide-react';
import ProfessionalCard from '../components/ProfessionalCard';
import { professionals as mockProfessionals, testimonials, cities } from '../data/mockData';
import { dbService } from '../lib/dbService';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [searchService, setSearchService] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [featuredPros, setFeaturedPros] = useState([]);

  React.useEffect(() => {
    async function loadPros() {
      try {
        const data = await dbService.getProfessionals();
        setFeaturedPros(data.filter(p => p.featured));
      } catch (error) {
        console.error('Failed to load professionals for home', error);
      }
    }
    loadPros();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchService) params.set('service', searchService);
    if (searchCity) params.set('city', searchCity);
    navigate(`/search?${params.toString()}`);
  };

  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  const faqs = [
    { q: "How are professionals verified on ProServe?", a: "Every professional undergoes a rigorous 3-step verification process validating their identity, firm registration, and active ICAI/ICMA credentials." },
    { q: "Is the initial consultation completely free?", a: "Professionals set their own rates. However, you can freely chat or message them through our platform to discuss your requirements before committing to a paid booking." },
    { q: "How do payments and bookings work?", a: "Once you select an expert, you can book a specific time slot directly on their calendar. Payment flows depend on the package but are protected by our satisfaction guarantee." }
  ];

  return (
    <main id="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="container">
          <div className="hero-content animate-fade-in-up">
            <div className="hero-badge">
              <span className="dot" />
              ProServe verified network 2026
            </div>

            <h1>
              India's Premier Network of <br/><span className="highlight">Verified CA & CMA Experts</span>
            </h1>

            <p>
              Elevate your business with trusted financial guidance. Discover elite, 
              background-checked professionals for Tax, Audit, and Compliance.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <div className="hero-search-input">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                />
              </div>
              <div className="hero-search-divider" />
              <div className="hero-search-input">
                <MapPin size={20} />
                <input
                  type="text"
                  placeholder="City"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  list="city-list"
                />
                <datalist id="city-list">
                  {cities.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <button type="submit" className="btn">
                Find Expert
              </button>
            </form>

            <div className="hero-ctas">
              <Link to="/search" className="btn-hero-primary">Browse Experts</Link>
              <Link to="/login?tab=signup&role=professional" className="btn-hero-secondary">Apply as Professional</Link>
            </div>

            <div className="hero-social-proof">
              <div className="avatars-overlap">
                <img src="https://ui-avatars.com/api/?name=Anita+R&background=C5A059&color=fff" alt="User 1" />
                <img src="https://ui-avatars.com/api/?name=David+M&background=182C4D&color=fff" alt="User 2" />
                <img src="https://ui-avatars.com/api/?name=Sanjay+K&background=0A192F&color=fff" alt="User 3" />
              </div>
              <div className="social-proof-text">
                <strong>10,000+ Businesses</strong>
                trust ProServe experts
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <div className="hero-features-wrapper">
        <div className="container">
          <div className="hero-features-grid">
            <div className="card-premium dark-card hero-feature-card animate-fade-in-up delay-1">
              <div className="feature-icon-wrapper"><ShieldCheck size={24} /></div>
              <div className="feature-content">
                <h4 style={{ color: 'var(--color-white)' }}>Verified Profiles</h4>
                <p style={{ color: 'var(--color-gray-400)' }}>100% background and credential checked experts.</p>
              </div>
            </div>
            <div className="card-premium dark-card hero-feature-card animate-fade-in-up delay-2">
              <div className="feature-icon-wrapper"><Zap size={24} /></div>
              <div className="feature-content">
                <h4 style={{ color: 'var(--color-white)' }}>AI Matching</h4>
                <p style={{ color: 'var(--color-gray-400)' }}>Smart algorithms to find the perfect professional for your needs.</p>
              </div>
            </div>
            <div className="card-premium dark-card hero-feature-card animate-fade-in-up delay-3">
              <div className="feature-icon-wrapper"><Clock size={24} /></div>
              <div className="feature-content">
                <h4 style={{ color: 'var(--color-white)' }}>Instant Booking</h4>
                <p style={{ color: 'var(--color-gray-400)' }}>Secure available time slots effortlessly in seconds.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section-header animate-fade-in-up">
            <h2>Browse by Category</h2>
            <p>Choose from India's top-rated finance and compliance professionals</p>
          </div>

          <div className="categories-grid">
            <div className="card-premium category-card" onClick={() => navigate('/search?category=CA')}>
              <div className="category-card-icon">
                <Calculator size={32} />
              </div>
              <h3>Chartered Accountant (CA)</h3>
              <p>Tax filing, GST, audits, company registration & more</p>
              <div className="services-list">
                <span>ITR Filing</span>
                <span>GST</span>
                <span>Audit</span>
                <span>Tax Planning</span>
              </div>
            </div>

            <div className="card-premium category-card" onClick={() => navigate('/search?category=CMA')}>
              <div className="category-card-icon">
                <Calculator size={32} />
              </div>
              <h3>Cost & Management Accountant</h3>
              <p>Cost analysis, budgeting, MIS reporting & financial strategy</p>
              <div className="services-list">
                <span>Cost Analysis</span>
                <span>Budgeting</span>
                <span>MIS</span>
                <span>Costing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get expert financial help in three simple steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card animate-fade-in-up delay-1">
              <div className="step-number">
                <Search size={28} />
              </div>
              <h3>Search & Compare</h3>
              <p>Browse verified CA & CMA experts. Filter by service, city, price, and ratings.</p>
            </div>

            <div className="step-card animate-fade-in-up delay-2">
              <div className="step-number">
                <BadgeCheck size={28} />
              </div>
              <h3>Choose & Book</h3>
              <p>Review profiles, compare packages, and book a consultation in seconds.</p>
            </div>

            <div className="step-card animate-fade-in-up delay-3">
              <div className="step-number">
                <Zap size={28} />
              </div>
              <h3>Get It Done</h3>
              <p>Receive expert assistance, track progress, and stay compliant effortlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Professionals */}
      <section className="section" id="top-professionals">
        <div className="container">
          <div className="section-header">
            <h2>Top-Rated Professionals</h2>
            <p>Handpicked experts trusted by thousands of clients</p>
          </div>

          <div className="pros-grid">
            {featuredPros.map(pro => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <Link to="/search" className="btn btn-secondary btn-lg">
              View All Experts <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CONTINUOUS DARK SECTION (Premium Footer Lead-in) */}
      <div className="bg-dark text-white" style={{ paddingTop: 'var(--space-20)' }}>
        
        {/* Why Choose */}
        <section className="section-sm" id="why-choose">
          <div className="container">
            <div className="section-header">
              <h2 style={{color: 'var(--color-white)'}}>Why Choose ProServe?</h2>
              <p style={{color: 'var(--color-gray-400)'}}>Built for trust, transparency, and high-end convenience</p>
            </div>

            <div className="why-grid">
              <div className="card-premium dark-card why-card animate-fade-in-up delay-1">
                <div className="why-card-icon">
                  <ShieldCheck size={24} />
                </div>
                <h3 style={{color: 'var(--color-white)'}}>Verified Experts</h3>
                <p style={{color: 'var(--color-gray-400)'}}>Every professional is verified with valid credentials and checks.</p>
              </div>

              <div className="card-premium dark-card why-card animate-fade-in-up delay-2">
                <div className="why-card-icon">
                  <CreditCard size={24} />
                </div>
                <h3>Transparent Pricing</h3>
                <p>Compare packages and prices upfront. No hidden fees, ever.</p>
              </div>

              <div className="card-premium dark-card why-card animate-fade-in-up delay-3">
                <div className="why-card-icon">
                  <Clock size={24} />
                </div>
                <h3>Easy Booking</h3>
                <p>Book consultations instantly. Get matched with an expert in minutes.</p>
              </div>

              <div className="card-premium dark-card why-card animate-fade-in-up delay-4">
                <div className="why-card-icon">
                  <Star size={24} />
                </div>
                <h3 style={{color: 'var(--color-white)'}}>Rated & Reviewed</h3>
                <p style={{color: 'var(--color-gray-400)'}}>Read genuine reviews from real clients before making a choice.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-sm" id="testimonials">
          <div className="container">
            <div className="section-header">
              <h2 style={{color: 'var(--color-white)'}}>What Our Clients Say</h2>
              <p style={{color: 'var(--color-gray-400)'}}>Trusted by 10,000+ individuals and businesses across India</p>
            </div>

            <div className="testimonials-grid">
              {testimonials.map(t => (
                <div key={t.id} className="card-premium dark-card testimonial-card animate-fade-in-up">
                  <div className="testimonial-stars">
                    {Array.from({ length: t.rating }, (_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <blockquote>"{t.text}"</blockquote>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="testimonial-author-info">
                      <h4 style={{color: 'var(--color-white)'}}>{t.name}</h4>
                      <p style={{color: 'var(--color-gray-400)'}}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section-sm" id="faq">
          <div className="container" style={{ maxWidth: '800px' }}>
            <div className="section-header">
              <h2 style={{color: 'var(--color-white)'}}>Frequently Asked Questions</h2>
              <p style={{color: 'var(--color-gray-400)'}}>Everything you need to know about navigating ProServe.</p>
            </div>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className={`faq-item dark-card ${openFaq === index ? 'open' : ''}`} onClick={() => toggleFaq(index)}>
                  <div className="faq-question">
                    <h4>{faq.q}</h4>
                    <ChevronDown size={20} className="faq-icon" />
                  </div>
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final Massive CTA */}
        <section className="section text-center" id="final-cta" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-4)' }}>
              Ready to secure your financial future?
            </h2>
            <p style={{ color: 'var(--color-gray-300)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-10)', maxWidth: '600px', margin: '0 auto var(--space-8)' }}>
              Join thousands of smart businesses who trust our verified CA and CMA network to handle compliance seamlessly.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/search" className="btn-hero-primary btn-lg">Find an Expert Now</Link>
              <Link to="/login?tab=signup&role=professional" className="btn-hero-secondary btn-lg">Apply as Professional</Link>
            </div>
          </div>
          <div style={{ position: 'absolute', top: '10%', right: '15%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(197, 160, 89, 0.15) 0%, transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }} />
        </section>
      </div>
    </main>
  );
}
