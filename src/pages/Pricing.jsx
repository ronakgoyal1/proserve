import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Check, X, Zap, Star, ChevronDown, ChevronUp, ArrowRight, Clock, Users, TrendingUp, Award, MapPin } from 'lucide-react';

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = '', prefix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (target === 0) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = Math.ceil(target / 40);
      const id = setInterval(() => {
        start = Math.min(start + step, target);
        setVal(start);
        if (start >= target) clearInterval(id);
      }, 30);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 16, border: `1px solid ${open ? '#7A9A6E' : 'rgba(255,255,255,0.08)'}`, overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: open ? '0 0 0 1px rgba(122,154,110,0.15)' : 'none' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: open ? 'rgba(122,154,110,0.06)' : 'rgba(255,255,255,0.02)', border: 'none', cursor: 'pointer', gap: 16, textAlign: 'left' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.4 }}>{q}</span>
        {open ? <ChevronUp size={18} style={{ color: '#7A9A6E', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: '#64748b', flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{ padding: '0 24px 20px', color: '#94a3b8', lineHeight: 1.75, fontSize: 14.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Plan card ───────────────────────────────────────────────────────────────
function PlanCard({ plan, isHighlighted, navigate }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        borderRadius: 16,
        padding: isHighlighted ? '44px 32px' : '32px 28px',
        background: isHighlighted
          ? 'rgba(122,154,110,0.06)'
          : 'rgba(255,255,255,0.03)',
        border: isHighlighted
          ? '1px solid rgba(122,154,110,0.4)'
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isHighlighted
          ? (hov ? '0 16px 40px rgba(122,154,110,0.14)' : '0 6px 18px rgba(122,154,110,0.08)')
          : (hov ? '0 8px 24px rgba(0,0,0,0.12)' : 'none'),
        transform: hov ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        flex: '1 1 280px',
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {isHighlighted && (
        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#92B284,#7A9A6E)', color: '#1A1A1A', fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', padding: '5px 18px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(122,154,110,0.4)' }}>
          ⭐ Recommended
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: isHighlighted ? '#7A9A6E' : '#475569', marginBottom: 8 }}>{plan.label}</div>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: '0 0 4px' }}>{plan.name}</h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{plan.tagline}</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 'clamp(2rem,4vw,2.6rem)', fontWeight: 600, fontFamily: "'Playfair Display', serif", color: plan.price === 'Free' ? '#94a3b8' : 'white', letterSpacing: '-1px' }}>{plan.price}</span>
        {plan.period && <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{plan.period}</div>}
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: f.included ? '#e2e8f0' : '#475569' }}>
            {f.included
              ? <Check size={15} style={{ color: isHighlighted ? '#7A9A6E' : '#7A9A6E', flexShrink: 0, marginTop: 2 }} />
              : <X size={15} style={{ color: '#334155', flexShrink: 0, marginTop: 2 }} />}
            <span style={{ textDecoration: f.included ? 'none' : 'line-through', opacity: f.included ? 1 : 0.4 }}>{f.text}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          if (plan.cta.href.startsWith('http') || plan.cta.href.startsWith('mailto')) {
            window.location.href = plan.cta.href;
          } else {
            navigate(plan.cta.href);
          }
        }}
        className={`btn ${isHighlighted ? 'btn-sage' : 'btn-secondary'}`}
        style={{ width: '100%' }}
      >
        {plan.cta.label} {isHighlighted && <ArrowRight size={15} style={{ display: 'inline', marginLeft: 4, verticalAlign: 'middle' }} />}
      </button>
    </div>
  );
}

// ─── Pricing Data ─────────────────────────────────────────────────────────────
const PLANS = [
  {
    label: 'Starter',
    name: 'Free',
    tagline: 'Basic directory listing',
    price: 'Free',
    period: 'forever',
    cta: { label: 'Get Started for Free', href: '/login?tab=signup&role=professional' },
    features: [
      { text: 'Basic directory listing', included: true },
      { text: 'Wisor profile page', included: true },
      { text: 'Limited search visibility', included: true },
      { text: 'Client leads & WhatsApp', included: false },
      { text: 'Verified badge', included: false },
      { text: 'AI portfolio website', included: false },
    ],
  },
  {
    label: 'Most Popular',
    name: 'Pro',
    tagline: 'Complete growth infrastructure',
    price: '₹999',
    period: 'per month · billed annually',
    cta: { label: 'Start Pro Free Trial', href: '/login?tab=signup&role=professional&plan=pro' },
    features: [
      { text: 'Verified badge on profile', included: true },
      { text: 'Priority search ranking', included: true },
      { text: 'WhatsApp & direct leads', included: true },
      { text: 'AI-generated portfolio website', included: true },
      { text: 'Analytics & lead dashboard', included: true },
      { text: 'Onboarding call with our team', included: true },
    ],
  },
  {
    label: 'Agency',
    name: 'Elite',
    tagline: 'Maximum exposure for firms',
    price: '₹2,499',
    period: 'per month · billed annually',
    cta: { label: 'Contact Sales', href: 'mailto:partners@wisor.in?subject=Wisor%20Elite%20Plan%20Inquiry' },
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Homepage featured placement', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Multi-expert firm listing', included: true },
      { text: 'Custom portfolio domain', included: true },
    ],
  },
];

const FAQS = [
  {
    q: 'Why should I pay? Listing sites are usually free.',
    a: 'Free directories give you a name on a page. Wisor gives you a verified identity, a premium portfolio website clients can share, WhatsApp lead delivery, and analytics — the infrastructure of a professional digital practice. Our paid members are seeing clients reach out directly within days of going live.',
  },
  {
    q: 'How do client leads actually work?',
    a: 'When a potential client searches for an expert on Wisor and views your profile, they can click "Book Consultation" or message you directly on WhatsApp. You receive the lead instantly — no middleman, no commission per lead. It\'s direct contact, always.',
  },
  {
    q: 'What is the AI portfolio website?',
    a: 'Every Pro member gets an AI-generated personal website. It includes your services, bio, testimonials, FAQ, and a contact CTA — designed to look professional. You can share it on your visiting card, WhatsApp status, and LinkedIn.',
  },
  {
    q: 'Can I cancel if I don\'t see results?',
    a: 'Yes. You can cancel before renewal and you won\'t be charged again. We believe results speak for themselves — but we\'ll never hold you to a plan that isn\'t working. We also offer a 14-day refund on your first payment if you\'re completely unsatisfied.',
  },
];

const TRUST_STATS = [
  { icon: <Users size={20} />, value: 0, customValue: 'Growing', label: 'Community of Experts' },
  { icon: <MapPin size={20} />, value: 0, customValue: 'Mumbai-first', label: 'Current focus' },
  { icon: <TrendingUp size={20} />, value: 3, suffix: 'x', label: 'More Profile Views on Pro' },
  { icon: <Award size={20} />, value: 0, customValue: 'Verified', label: 'Trust Badge' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Pricing() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Pricing — Wisor | Verified Expert Listings for CAs & CMAs</title>
        <meta name="description" content="Join Wisor as a verified expert." />
      </Helmet>

      <main style={{ background: '#1A1A1A', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', paddingTop: 80 }}>

        {/* ── HERO ───────────────────────────────────────────────────── */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(64px,10vw,120px) 24px clamp(48px,8vw,96px)' }}>
          {/* Glows */}
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(122,154,110,0.14) 0%,transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(14,165,233,0.08) 0%,transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(122,154,110,0.12)', border: '1px solid rgba(122,154,110,0.25)', borderRadius: 999, padding: '6px 16px', fontSize: 12, fontWeight: 700, color: '#92B284', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 28 }}>
              <Zap size={12} /> verified expert platform
            </div>

            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 500, color: 'white', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 20 }}>
              Grow Your Practice
              <br />
              <span style={{ color: '#92B284' }}>
                with Wisor
              </span>
            </h1>

            <p style={{ fontSize: 'clamp(1rem,2.2vw,1.2rem)', color: '#94a3b8', lineHeight: 1.6, maxWidth: 600, margin: '0 auto 40px' }}>
              Get listed, get discovered, get your own premium website, and receive direct client inquiries — all in one place.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => { document.getElementById('pricing-cards')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="btn btn-sage"
              >
                View Plans <ArrowRight size={16} />
              </button>
              <Link to="/search" className="btn btn-secondary">
                Browse Live Profiles
              </Link>
            </div>

            {/* Micro social proof */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 28 }}>
              <div style={{ display: 'flex', gap: -4 }}>
                {['#1e40af','#7c3aed','#065f46'].map((bg, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: bg, border: '2px solid #1A1A1A', marginLeft: i ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white' }}>
                    {['R','P','A'][i]}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                Join the fastest-growing platform for financial experts
              </span>
            </div>
          </div>
        </section>

        {/* ── TRUST STATS ────────────────────────────────────────────── */}
        <section style={{ padding: '0 24px 72px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 0, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden' }}>
            {TRUST_STATS.map((s, i) => (
              <div key={i} style={{ flex: '1 1 180px', padding: '36px 20px', textAlign: 'center', borderRight: i < TRUST_STATS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ color: '#7A9A6E', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <div style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 600, color: 'white', letterSpacing: '-0.5px', lineHeight: 1 }}>
                  {s.customValue ? s.customValue : <Counter target={s.value} suffix={s.suffix} />}
                </div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING CARDS ──────────────────────────────────────────── */}
        <section id="pricing-cards" style={{ padding: '0 24px 96px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#7A9A6E', marginBottom: 14 }}>Pricing</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 500, color: 'white', letterSpacing: '-1px', marginBottom: 12 }}>
              Simple, transparent pricing
            </h2>
            <p style={{ color: '#64748b', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
              No commissions. No lead fees. Pay once, keep all the leads.
            </p>
          </div>

          <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', alignItems: 'flex-start' }}>
            {PLANS.map((plan, i) => (
              <PlanCard key={i} plan={plan} isHighlighted={i === 1} navigate={navigate} />
            ))}
          </div>

          {/* Guarantee strip */}
          <div style={{ maxWidth: 560, margin: '40px auto 0', display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
            {['14-day refund guarantee', 'No commission on leads', 'Cancel anytime'].map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                <Check size={14} style={{ color: '#7A9A6E' }} /> {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── WHY WISOR ───────────────────────────────────────────── */}
        <section style={{ padding: '0 24px 96px' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#7A9A6E', marginBottom: 14 }}>Why Wisor</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 500, color: 'white', letterSpacing: '-1px' }}>What you actually get</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
              {[
                { icon: '🌐', title: 'Your Own Website', desc: 'An AI-generated premium portfolio — shareable on WhatsApp, LinkedIn, and visiting cards.' },
                { icon: '📲', title: 'Direct WhatsApp Leads', desc: 'Clients tap one button and land in your WhatsApp — no form fills, no middleman, no referral fee per lead.' },
                { icon: '🔍', title: 'Priority Visibility', desc: 'Pro members rank above free listings in every search. When someone searches, you appear first.' },
                { icon: '✅', title: 'Verified Badge', desc: 'Wisor verification signals trust instantly. Clients filter for verified experts — and you\'ve already passed.' },
                { icon: '📊', title: 'Analytics Dashboard', desc: 'Know how many people viewed your profile, clicked your WhatsApp, and booked a call — every week.' },
                { icon: '🤝', title: 'Onboarding Support', desc: 'Our team personally helps you set up your profile and portfolio. You don\'t have to figure anything out alone.' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '28px 24px', transition: 'all 0.22s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(122,154,110,0.05)'; e.currentTarget.style.borderColor = 'rgba(122,154,110,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: 36, marginBottom: 14 }}>{item.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────── */}
        <section style={{ padding: '0 24px 96px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#7A9A6E', marginBottom: 14 }}>FAQ</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 500, color: 'white', letterSpacing: '-1px' }}>Common questions</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FAQS.map((faq, i) => <FaqItem key={i} {...faq} />)}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ───────────────────────────────────────────────── */}
        <section style={{ padding: '0 24px 96px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 500, color: 'white', letterSpacing: '-1px', marginBottom: 14, lineHeight: 1.1 }}>
              Your next client is already searching.
            </h2>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.75, marginBottom: 36 }}>
              Join the growing community of verified experts on Wisor.
            </p>
            <button
              onClick={() => { document.getElementById('pricing-cards')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="btn btn-sage"
            >
              View Plans <ArrowRight size={18} />
            </button>
            <p style={{ fontSize: 12, color: '#334155', marginTop: 16 }}>14-day refund guarantee · No contracts · Cancel anytime</p>
          </div>
        </section>

      </main>
    </>
  );
}
