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
    { q: "How are professionals verified on Wisor?", a: "Every professional undergoes a rigorous 3-step verification process validating their identity, firm registration, and active ICAI/ICMA credentials." },
    { q: "Is the initial consultation completely free?", a: "Professionals set their own rates. However, you can freely chat or message them through our platform to discuss your requirements before committing to a paid booking." },
    { q: "How do payments and bookings work?", a: "Once you select an expert, you can book a specific time slot directly on their calendar. Payment flows depend on the package but are protected by our satisfaction guarantee." }
  ];

  return (
    <main id="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="container hero-container">
          {/* LEFT SIDE */}
          <div className="hero-left animate-fade-in-up" style={{ position: 'relative' }}>
            <div className="hero-badge-new" style={{ position: 'relative', zIndex: 1 }}>
              <span className="dot" />
              India's verified professional network
            </div>

            <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '120%', height: '100%', background: 'radial-gradient(circle, rgba(122,154,110,0.06) 0%, transparent 60%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

            <h1 className="hero-heading-new" style={{ position: 'relative', zIndex: 1, marginBottom: '28px' }}>
              The right professional,<br/>without the guesswork.
            </h1>

            <p className="hero-subtext-new" style={{ position: 'relative', zIndex: 1, marginBottom: '40px', fontSize: '19px' }}>
              Discover trusted Chartered Accountants, lawyers, and architects — verified by their statutory bodies, not by anonymous reviews.
            </p>

            <div className="hero-ctas-new" style={{ position: 'relative', zIndex: 1, marginBottom: '16px', gap: '20px' }}>
              <Link to="/search" className="btn-hero-primary-new" style={{ fontSize: '16px', padding: '0 32px', height: '52px', boxShadow: '0 8px 20px rgba(122,154,110,0.15)' }}>Find a professional</Link>
              <Link to="/login?tab=signup&role=professional" className="btn-hero-secondary-new" style={{ opacity: 0.7, fontWeight: 500 }}>I'm a professional</Link>
            </div>
            
            <div style={{ fontSize: '13.5px', color: '#9CA3AF', marginBottom: '56px', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
              <ShieldCheck size={16} style={{ color: '#92B284' }} /> Talk directly on WhatsApp. No platform fees.
            </div>

            <div className="hero-stats-new" style={{ position: 'relative', zIndex: 1 }}>
              <div className="hero-stat-item">
                <div className="stat-number" style={{ fontSize: '20px' }}>Growing network</div>
                <div className="stat-label">Verified professionals</div>
              </div>
              <div className="hero-stat-item">
                <div className="stat-number" style={{ fontSize: '20px' }}>Mumbai-first</div>
                <div className="stat-label">Current focus</div>
              </div>
              <div className="hero-stat-item">
                <div className="stat-number" style={{ fontSize: '20px' }}>5 min</div>
                <div className="stat-label">To go live</div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="hero-right animate-fade-in-up delay-1" style={{ transform: 'translateX(-24px)' }}>
            <div className="featured-pro-card" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)', borderColor: 'rgba(122,154,110,0.15)' }}>
              <div className="featured-pro-header">
                <div className="featured-pro-avatar">
                  PR
                </div>
                <div className="featured-pro-info">
                  <div className="featured-pro-name">
                    Priya Rao
                    <ShieldCheck size={14} className="verified-icon" />
                  </div>
                  <div className="featured-pro-subtitle">CA · Mumbai · CA since 2014</div>
                </div>
                <div className="featured-pro-badge">
                  <span className="dot" /> Verified
                </div>
              </div>
              <div className="featured-pro-body">
                Tax structuring for D2C startups across fashion, beauty and F&B.
              </div>
              <div className="featured-pro-tags">
                <span>GST</span>
                <span>Direct tax</span>
                <span>Startup advisory</span>
              </div>
              <div className="featured-pro-footer">
                <div className="featured-pro-langs">English · Hindi · Marathi</div>
                <button className="btn-get-in-touch" onClick={() => navigate('/search')}>Get in touch</button>
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
              <h2 style={{color: 'var(--color-white)'}}>Why Choose Wisor?</h2>
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
              <p style={{color: 'var(--color-gray-400)'}}>Everything you need to know about navigating Wisor.</p>
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
