import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, ShieldCheck, Star, Users, Clock,
  CreditCard, ArrowRight, BadgeCheck, Calculator, FileText,
  ChevronRight, Zap
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

      {/* Feature Cards overlap */}
      <div className="hero-features-wrapper">
        <div className="hero-features-grid">
          <div className="hero-feature-card animate-fade-in-up delay-1">
            <div className="feature-icon-wrapper"><ShieldCheck size={24} /></div>
            <div className="feature-content">
              <h4>Verified Profiles</h4>
              <p>100% background and credential checked experts.</p>
            </div>
          </div>
          <div className="hero-feature-card animate-fade-in-up delay-2">
            <div className="feature-icon-wrapper"><Zap size={24} /></div>
            <div className="feature-content">
              <h4>AI Matching</h4>
              <p>Smart algorithms to find the perfect professional for your needs.</p>
            </div>
          </div>
          <div className="hero-feature-card animate-fade-in-up delay-3">
            <div className="feature-icon-wrapper"><Clock size={24} /></div>
            <div className="feature-content">
              <h4>Instant Booking</h4>
              <p>Secure available time slots effortlessly in seconds.</p>
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
            <Link to="/search?category=CA" className="category-card animate-fade-in-up delay-1">
              <div className="category-card-icon">
                <FileText size={28} />
              </div>
              <h3>Chartered Accountant (CA)</h3>
              <p>Tax filing, GST, audits, company registration & more</p>
              <div className="services-list">
                <span>ITR Filing</span>
                <span>GST</span>
                <span>Audit</span>
                <span>Tax Planning</span>
              </div>
            </Link>

            <Link to="/search?category=CMA" className="category-card animate-fade-in-up delay-2">
              <div className="category-card-icon">
                <Calculator size={28} />
              </div>
              <h3>Cost & Management Accountant</h3>
              <p>Cost analysis, budgeting, MIS reporting & financial strategy</p>
              <div className="services-list">
                <span>Cost Analysis</span>
                <span>Budgeting</span>
                <span>MIS</span>
                <span>Costing</span>
              </div>
            </Link>
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

      {/* Why Choose */}
      <section className="section" id="why-choose">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose ProServe?</h2>
            <p>Built for trust, transparency, and convenience</p>
          </div>

          <div className="why-grid">
            <div className="why-card animate-fade-in-up delay-1">
              <div className="why-card-icon">
                <ShieldCheck size={24} />
              </div>
              <h3>Verified Experts</h3>
              <p>Every professional is verified with valid credentials and background checks.</p>
            </div>

            <div className="why-card animate-fade-in-up delay-2">
              <div className="why-card-icon">
                <CreditCard size={24} />
              </div>
              <h3>Transparent Pricing</h3>
              <p>Compare packages and prices upfront. No hidden fees, ever.</p>
            </div>

            <div className="why-card animate-fade-in-up delay-3">
              <div className="why-card-icon">
                <Clock size={24} />
              </div>
              <h3>Easy Booking</h3>
              <p>Book consultations instantly. Get matched with an expert in minutes.</p>
            </div>

            <div className="why-card animate-fade-in-up delay-4">
              <div className="why-card-icon">
                <Star size={24} />
              </div>
              <h3>Rated & Reviewed</h3>
              <p>Read genuine reviews from real clients before making a choice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Professionals */}
      <section className="section" id="top-professionals" style={{ background: 'var(--color-gray-50)' }}>
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

      {/* Testimonials */}
      <section className="section" id="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Clients Say</h2>
            <p>Trusted by 10,000+ individuals and businesses across India</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map(t => (
              <div key={t.id} className="testimonial-card animate-fade-in-up">
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
                    <h4>{t.name}</h4>
                    <p>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section" id="cta-section">
        <div className="container">
          <div className="cta-grid">
            <div className="cta-card cta-card-user">
              <h3>Need Expert Help?</h3>
              <p>
                Find the right CA or CMA professional for your tax, compliance,
                or financial needs. Get started in minutes.
              </p>
              <Link to="/search" className="btn btn-lg">
                Find an Expert <ChevronRight size={18} />
              </Link>
            </div>

            <div className="cta-card cta-card-pro">
              <h3>Are You a Professional?</h3>
              <p>
                Join ProServe and get discovered by thousands of potential clients.
                Grow your practice online.
              </p>
              <Link to="/login?tab=signup&role=professional" className="btn btn-lg">
                Join as Expert <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
