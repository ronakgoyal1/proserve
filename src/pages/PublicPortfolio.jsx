import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dbService } from '../lib/dbService';
import {
  Loader2, ShieldCheck, CheckCircle2, Award, Briefcase, MessageSquare,
  Mail, Phone, Check, MapPin, AlertCircle, Globe, Zap, Users,
  Star, TrendingUp, Clock, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// ─── Theme Engine ────────────────────────────────────────────────────────────
const THEMES = {
  navy_gold: {
    id: 'navy_gold',
    heroBg: '#020617',
    heroBloom1: 'rgba(197,160,89,0.15)',
    heroBloom2: 'rgba(14,165,233,0.10)',
    nameGradient: 'linear-gradient(to right, #ffffff 30%, #DBC086 100%)',
    accentColor: '#C5A059',
    accentRgb: '197,160,89',
    badgeBg: 'rgba(197,160,89,0.15)',
    badgeColor: '#DBC086',
    sectionBg: '#ffffff',
    altSectionBg: '#0a0f1a',
    cardBg: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.08)',
    btnBg: 'linear-gradient(135deg,#DBC086 0%,#C5A059 100%)',
    btnColor: '#020617',
    footerBg: '#010409',
  },
  corporate_blue: {
    id: 'corporate_blue',
    heroBg: '#0f2044',
    heroBloom1: 'rgba(59,130,246,0.2)',
    heroBloom2: 'rgba(16,185,129,0.12)',
    nameGradient: 'linear-gradient(to right, #ffffff 30%, #93c5fd 100%)',
    accentColor: '#3b82f6',
    accentRgb: '59,130,246',
    badgeBg: 'rgba(59,130,246,0.15)',
    badgeColor: '#93c5fd',
    sectionBg: '#ffffff',
    altSectionBg: '#0f2044',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.1)',
    btnBg: 'linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)',
    btnColor: '#ffffff',
    footerBg: '#080f24',
  },
  dark_purple: {
    id: 'dark_purple',
    heroBg: '#0d0520',
    heroBloom1: 'rgba(139,92,246,0.2)',
    heroBloom2: 'rgba(236,72,153,0.12)',
    nameGradient: 'linear-gradient(to right, #ffffff 30%, #c4b5fd 100%)',
    accentColor: '#8b5cf6',
    accentRgb: '139,92,246',
    badgeBg: 'rgba(139,92,246,0.15)',
    badgeColor: '#c4b5fd',
    sectionBg: '#ffffff',
    altSectionBg: '#0d0520',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.09)',
    btnBg: 'linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%)',
    btnColor: '#ffffff',
    footerBg: '#060010',
  },
  trust_green: {
    id: 'trust_green',
    heroBg: '#052e16',
    heroBloom1: 'rgba(34,197,94,0.2)',
    heroBloom2: 'rgba(16,185,129,0.12)',
    nameGradient: 'linear-gradient(to right, #ffffff 30%, #6ee7b7 100%)',
    accentColor: '#22c55e',
    accentRgb: '34,197,94',
    badgeBg: 'rgba(34,197,94,0.15)',
    badgeColor: '#6ee7b7',
    sectionBg: '#ffffff',
    altSectionBg: '#052e16',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.1)',
    btnBg: 'linear-gradient(135deg,#22c55e 0%,#16a34a 100%)',
    btnColor: '#ffffff',
    footerBg: '#011a09',
  },
};

function assignTheme(profession = '', category = '') {
  const prof = (profession + category).toLowerCase();
  if (prof.includes('cma') || prof.includes('cost') || prof.includes('management')) return THEMES.trust_green;
  if (prof.includes('ca') || prof.includes('chartered') || prof.includes('tax') || prof.includes('audit')) return THEMES.navy_gold;
  if (prof.includes('consult') || prof.includes('strategy') || prof.includes('advisor')) return THEMES.dark_purple;
  return THEMES.corporate_blue;
}

// ─── Service Intelligence ────────────────────────────────────────────────────
const SERVICE_CONTEXT = {
  'itr filing': { desc: 'Accurate and timely Income Tax Return filing for individuals, freelancers, and businesses of all sizes.', icon: '📋' },
  'gst registration': { desc: 'Hassle-free GST registration with complete documentation and GSTIN activation support.', icon: '🏛️' },
  'gst return filing': { desc: 'Monthly, quarterly, and annual GST return filing with reconciliation and compliance checks.', icon: '📊' },
  'company registration': { desc: 'End-to-end company formation — Pvt Ltd, LLP, OPC — with MCA filings and legal compliance.', icon: '🏢' },
  'audit support': { desc: 'Statutory, internal, and tax audits conducted with precision and regulatory compliance.', icon: '🔍' },
  'cost analysis': { desc: 'Detailed cost mapping and variance analysis to uncover inefficiencies and protect margins.', icon: '📉' },
  'budget planning': { desc: 'Zero-based and rolling budgets aligned with your business goals and cash flow reality.', icon: '🎯' },
  'mis reporting': { desc: 'Real-time management information dashboards and reports for data-driven decisions.', icon: '📈' },
  'financial consulting': { desc: 'Holistic financial strategy — from fundraising and valuation to restructuring and exits.', icon: '💡' },
  'tax planning': { desc: 'Legal tax optimization strategies to minimize liability across income sources and business structures.', icon: '🧮' },
  'startup advisory': { desc: 'Seed to Series A financial guidance — cap tables, compliance, burn rate, investor readiness.', icon: '🚀' },
  'general consultation': { desc: 'A structured advisory session tailored to your specific financial or compliance challenge.', icon: '🤝' },
  'nri taxation': { desc: 'Specialized tax advisory for Non-Resident Indians covering DTAA, FEMA, and repatriation.', icon: '🌏' },
  'payroll processing': { desc: 'Accurate end-to-end payroll processing with statutory compliance — PF, ESI, PT, TDS.', icon: '💼' },
  'compliance management': { desc: 'Year-round compliance calendar management to ensure zero penalties or missed deadlines.', icon: '📅' },
};

function getServiceContext(svc) {
  const key = svc.toLowerCase();
  for (const [k, v] of Object.entries(SERVICE_CONTEXT)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return { desc: 'A specialized service delivered with precision, professionalism, and deep industry expertise.', icon: '⚡' };
}

// ─── Dynamic Tagline ─────────────────────────────────────────────────────────
function getDynamicTagline(name, profession='', services=[], city='') {
  const firstName = name.split(' ')[0];
  const prof = profession.toLowerCase();
  if (prof.includes('ca') || prof.includes('chartered')) {
    const topSvc = services[0] || 'Taxation';
    return `${firstName} specializes in ${topSvc} and financial compliance — helping clients save more, stress less.`;
  }
  if (prof.includes('cma') || prof.includes('cost')) {
    return `${firstName} helps businesses cut costs and improve margins through data-driven management accounting.`;
  }
  if (prof.includes('consult')) {
    return `${firstName} partners with founders and leaders to unlock sustainable growth and strategic clarity.`;
  }
  const cityPart = city && city !== 'Digital' ? ` based in ${city}` : '';
  return `${firstName}${cityPart} delivers expert financial and compliance services trusted by 500+ clients.`;
}

// ─── Stats ───────────────────────────────────────────────────────────────────
function getStats(experience='', rating=5, services=[]) {
  const exp = parseInt(experience) || 5;
  const clients = Math.max(50, exp * 45 + Math.floor(services.length * 12));
  return [
    { label: 'Years Experience', value: `${exp}+`, icon: <Briefcase size={18} /> },
    { label: 'Clients Served', value: `${clients}+`, icon: <Users size={18} /> },
    { label: 'Client Rating', value: `${Number(rating).toFixed(1)}★`, icon: <Star size={18} /> },
    { label: 'Response Time', value: '< 2 hrs', icon: <Clock size={18} /> },
  ];
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
class PortfolioErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  componentDidCatch(e, i) { console.error('Portfolio render error:', e, i); }
  render() {
    if (this.state.hasError) return (
      <div style={{ display:'flex',flexDirection:'column',height:'100vh',alignItems:'center',justifyContent:'center',background:'#0a0f1a',color:'white',padding:'2rem',textAlign:'center' }}>
        <AlertCircle size={64} style={{ color:'#ef4444',marginBottom:'1rem' }} />
        <h1>Display Error</h1>
        <p style={{ color:'#94a3b8',maxWidth:'500px',margin:'1rem auto 2rem' }}>
          This portfolio encountered a render error. It usually means some content fields are malformed.
        </p>
        <pre style={{ fontSize:12,color:'#ef4444',background:'rgba(239,68,68,0.1)',padding:'1rem',borderRadius:8,maxWidth:'700px' }}>
          {this.state.error?.toString()}
        </pre>
        <button onClick={() => window.location.href='/'} style={{ marginTop:'2rem',padding:'12px 28px',background:'#3b82f6',border:'none',borderRadius:'999px',color:'white',fontWeight:700,cursor:'pointer' }}>Return Home</button>
      </div>
    );
    return this.props.children;
  }
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function FaqItem({ faq, theme }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${theme.cardBorder}`, marginBottom:12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', background:open ? `rgba(${theme.accentRgb},0.06)` : 'transparent', border:'none', cursor:'pointer', textAlign:'left', gap:16 }}
      >
        <span style={{ fontWeight:700, fontSize:15, color:'#1e293b', lineHeight:1.4 }}>{faq.q}</span>
        {open ? <ChevronUp size={18} style={{ color:theme.accentColor, flexShrink:0 }} /> : <ChevronDown size={18} style={{ color:'#94a3b8', flexShrink:0 }} />}
      </button>
      {open && (
        <div style={{ padding:'0 24px 20px', color:'#64748b', lineHeight:1.7, fontSize:14, borderTop:`1px solid ${theme.cardBorder}` }}>
          {faq.a}
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function PublicPortfolio() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [expertId, setExpertId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const found = await dbService.getPortfolioBySlug(slug);
        setPortfolio(found);
        if (found) {
          const pros = await dbService.getProfessionals();
          const uid = found.user_id || found.userId;
          const match = pros.find(p => String(p.user_id || p.userId) === String(uid));
          if (match) setExpertId(match.id);
        }
      } catch (err) {
        console.error('Portfolio load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) return (
    <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#020617' }}>
      <Loader2 size={40} className="spin" style={{ color:'#C5A059' }} />
    </div>
  );

  if (!portfolio) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', alignItems:'center', justifyContent:'center', background:'#020617', color:'white' }}>
      <ShieldCheck size={64} style={{ color:'#475569', marginBottom:24 }} />
      <h1 style={{ marginBottom:16, fontSize:'clamp(1.5rem,4vw,2.5rem)' }}>Portfolio Not Found</h1>
      <p style={{ color:'#64748b', marginBottom:32 }}>This link is inactive or does not exist.</p>
      <Link to="/" style={{ padding:'12px 32px', background:'#C5A059', color:'#020617', borderRadius:'999px', fontWeight:700, textDecoration:'none' }}>
        Browse ProServe Directory
      </Link>
    </div>
  );

  return (
    <PortfolioErrorBoundary>
      <PortfolioInner portfolio={portfolio} expertId={expertId} navigate={navigate} />
    </PortfolioErrorBoundary>
  );
}

// ─── Portfolio Inner ──────────────────────────────────────────────────────────
function PortfolioInner({ portfolio, expertId, navigate }) {
  // Parse content safely
  let content = portfolio?.content || {};
  if (typeof content === 'string') { try { content = JSON.parse(content); } catch { content = {}; } }

  const name        = content.name        || 'ProServe Professional';
  const profession  = content.profession  || content.category || 'Financial Expert';
  const bio         = content.bio         || 'A dedicated professional bringing structured expertise to help businesses grow compliantly and confidently.';
  const experience  = content.experience  || '5';
  const city        = content.city        || '';
  const rating      = content.rating      || 5.0;
  const languages   = Array.isArray(content.languages)   ? content.languages   : ['English'];
  const services    = Array.isArray(content.services)    ? content.services    : ['General Consultation'];
  const achievements= Array.isArray(content.achievements)? content.achievements: ['Trusted by clients across India for consistent, compliant, and results-driven advisory.'];
  const faqs        = Array.isArray(content.faqs)        ? content.faqs        : [];
  const contactEmail= content.contactEmail || '';
  const contactPhone= content.contactPhone || '';
  const socials     = (content.socials && typeof content.socials === 'object') ? content.socials : {};

  const theme   = assignTheme(profession, content.category || '');
  const tagline = getDynamicTagline(name, profession, services, city);
  const stats   = getStats(experience, rating, services);
  const initials= name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'P';

  const handleBook = () => expertId ? navigate(`/professional/${expertId}?book=true`) : navigate('/login');

  // ── Sticky CTA visibility
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background:'#ffffff', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif' }}>
      <Helmet>
        <title>{`${name} | ${profession} | ProServe`}</title>
        <meta name="description" content={`${tagline} Connect with ${name} on ProServe.`} />
      </Helmet>

      {/* ── NAVBAR ────────────────────────────────────────────────────── */}
      <header style={{
        position:'sticky', top:0, zIndex:200,
        background:'rgba(2,6,23,0.85)', backdropFilter:'blur(16px)',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <a href="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
          <ShieldCheck size={18} style={{ color:theme.accentColor }} />
          <span style={{ fontWeight:800, fontSize:14, color:'white' }}>Pro<span style={{ color:theme.accentColor }}>Serve</span></span>
        </a>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {contactPhone && (
            <a href={`tel:${contactPhone}`}
              style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'rgba(255,255,255,0.6)', textDecoration:'none', fontWeight:500 }}>
              <Phone size={14} /> Call
            </a>
          )}
          <button onClick={handleBook} style={{
            background: theme.btnBg, color: theme.btnColor, border:'none',
            borderRadius:'999px', padding:'9px 22px', fontSize:13, fontWeight:700, cursor:'pointer',
            boxShadow:`0 4px 16px rgba(${theme.accentRgb},0.3)`
          }}>
            Book Consultation
          </button>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section style={{ background: theme.heroBg, position:'relative', overflow:'hidden', paddingTop:'72px', paddingBottom:'80px' }}>
        {/* Bloom layers */}
        <div style={{ position:'absolute', top:'-15%', left:'-5%', width:'55vw', height:'55vw', borderRadius:'50%', background:`radial-gradient(circle, ${theme.heroBloom1} 0%, transparent 60%)`, filter:'blur(80px)', zIndex:1, pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-20%', right:'-5%', width:'40vw', height:'40vw', borderRadius:'50%', background:`radial-gradient(circle, ${theme.heroBloom2} 0%, transparent 60%)`, filter:'blur(100px)', zIndex:1, pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:10, maxWidth:820, margin:'0 auto', padding:'0 24px', textAlign:'center' }}>

          {/* Avatar */}
          <div style={{ marginBottom:28, display:'inline-block' }}>
            <div style={{
              position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center',
              width:104, height:104, borderRadius:'50%',
              background:`linear-gradient(135deg, rgba(${theme.accentRgb},0.5), rgba(${theme.accentRgb},0.1))`,
              padding:3
            }}>
              <div style={{
                width:'100%', height:'100%', borderRadius:'50%',
                background:'linear-gradient(135deg,#1e293b,#0f172a)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:36, fontWeight:800, color:'white', letterSpacing:'-1px'
              }}>
                {initials}
              </div>
              {/* Verified ring glow */}
              <div style={{
                position:'absolute', inset:-4, borderRadius:'50%',
                border:`1.5px solid rgba(${theme.accentRgb},0.4)`,
                boxShadow:`0 0 24px rgba(${theme.accentRgb},0.25)`
              }} />
            </div>
          </div>

          {/* Verified badge */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:6,
              background: theme.badgeBg, color: theme.badgeColor,
              border:`1px solid rgba(${theme.accentRgb},0.25)`,
              borderRadius:'999px', padding:'5px 16px', fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase'
            }}>
              <ShieldCheck size={13} /> ProServe Verified Professional
            </span>
          </div>

          {/* Name */}
          <h1 style={{
            background: theme.nameGradient, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundClip:'text', fontSize:'clamp(2.4rem,5vw,4rem)', fontWeight:900,
            letterSpacing:'-1.5px', lineHeight:1.05, marginBottom:12
          }}>
            {name}
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize:'clamp(1rem,2.2vw,1.25rem)', color:'#94a3b8', fontWeight:400, marginBottom:8, letterSpacing:0.2 }}>
            {profession}
            {city && city !== 'Digital' && <> &nbsp;·&nbsp; <MapPin size={14} style={{ display:'inline', verticalAlign:'middle' }} /> {city}</>}
          </p>

          {/* Tagline */}
          <p style={{ fontSize:15, color:'rgba(148,163,184,0.8)', maxWidth:600, margin:'0 auto 36px', lineHeight:1.7 }}>
            {tagline}
          </p>

          {/* Stats row */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center', marginBottom:44 }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:8,
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                backdropFilter:'blur(10px)', borderRadius:999, padding:'10px 20px',
                transition:'all 0.2s'
              }}>
                <span style={{ color:theme.accentColor }}>{s.icon}</span>
                <span style={{ fontSize:14, fontWeight:700, color:'white' }}>{s.value}</span>
                <span style={{ fontSize:12, color:'#64748b' }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Languages */}
          {languages.length > 0 && (
            <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginBottom:44 }}>
              <span style={{ fontSize:12, color:'#475569', display:'flex', alignItems:'center', gap:4 }}>
                <Globe size={13} /> Languages:
              </span>
              {languages.map((l, i) => (
                <span key={i} style={{ fontSize:12, color:'#94a3b8', background:'rgba(255,255,255,0.05)', borderRadius:4, padding:'2px 8px' }}>{l}</span>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:14, justifyContent:'center' }}>
            <button onClick={handleBook} style={{
              background: theme.btnBg, color: theme.btnColor, border:'none',
              borderRadius:'999px', padding:'15px 36px', fontSize:15, fontWeight:700, cursor:'pointer',
              boxShadow:`0 8px 30px rgba(${theme.accentRgb},0.35)`,
              transition:'all 0.25s', display:'flex', alignItems:'center', gap:8
            }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
            >
              <MessageSquare size={17} /> Book Consultation
            </button>
            {contactPhone && (
              <a href={`https://wa.me/${contactPhone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{
                display:'flex', alignItems:'center', gap:8,
                background:'rgba(37,211,102,0.12)', color:'#25d366',
                border:'1px solid rgba(37,211,102,0.25)', borderRadius:'999px',
                padding:'15px 28px', fontSize:15, fontWeight:600, textDecoration:'none',
                transition:'all 0.2s'
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            )}
            <button
              onClick={() => document.getElementById('pp-services')?.scrollIntoView({ behavior:'smooth' })}
              style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', borderRadius:'999px', padding:'15px 28px', fontSize:15, fontWeight:500, cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.35)'; e.currentTarget.style.color='white'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.color='rgba(255,255,255,0.7)'; }}
            >
              View Services
            </button>
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────── */}
      <section style={{ padding:'80px 24px', background:'#ffffff' }}>
        <div style={{ maxWidth:760, margin:'0 auto', textAlign:'center' }}>
          <p style={{ fontSize:12, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:theme.accentColor, marginBottom:16 }}>About</p>
          <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.5rem)', fontWeight:800, color:'#0f172a', marginBottom:24, letterSpacing:'-0.5px' }}>
            Who is {name.split(' ')[0]}?
          </h2>
          <p style={{ fontSize:16, color:'#475569', lineHeight:1.85, margin:'0 auto', maxWidth:680 }}>{bio}</p>

          {/* Inline trust row */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:24, justifyContent:'center', marginTop:44 }}>
            {[
              { icon: <CheckCircle2 size={16} />, label: 'Identity Verified' },
              { icon: <Award size={16} />, label: 'Credentials Checked' },
              { icon: <ShieldCheck size={16} />, label: 'Background Cleared' },
              { icon: <TrendingUp size={16} />, label: 'Fast Response' },
            ].map((t, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:7, color:'#22c55e', fontWeight:600, fontSize:13 }}>
                {t.icon} <span style={{ color:'#334155' }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────── */}
      <section id="pp-services" style={{ padding:'80px 24px', background:'#f8fafc' }}>
        <div style={{ maxWidth:1080, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <p style={{ fontSize:12, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:theme.accentColor, marginBottom:12 }}>Specializations</p>
            <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.5rem)', fontWeight:800, color:'#0f172a', letterSpacing:'-0.5px' }}>What I Do Best</h2>
            <p style={{ color:'#64748b', marginTop:12, fontSize:15, maxWidth:520, margin:'12px auto 0' }}>
              Every service is delivered end-to-end — from planning to filing, with full accountability.
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {services.map((svc, idx) => {
              const ctx = getServiceContext(svc);
              return (
                <div key={idx} style={{
                  background:'#ffffff', border:'1px solid #e2e8f0',
                  borderRadius:20, padding:'28px 24px',
                  boxShadow:'0 2px 12px rgba(0,0,0,0.04)',
                  transition:'all 0.22s', cursor:'default',
                  borderTop:`3px solid transparent`,
                  position:'relative', overflow:'hidden'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderTopColor=theme.accentColor; e.currentTarget.style.boxShadow=`0 8px 32px rgba(${theme.accentRgb},0.12)`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderTopColor='transparent'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.04)'; }}
                >
                  <div style={{ fontSize:36, marginBottom:16, lineHeight:1 }}>{ctx.icon}</div>
                  <h3 style={{ fontSize:16, fontWeight:700, color:'#0f172a', marginBottom:10 }}>{svc}</h3>
                  <p style={{ fontSize:13.5, color:'#64748b', lineHeight:1.7, margin:0 }}>{ctx.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE ME ────────────────────────────────────────────── */}
      <section style={{ padding:'80px 24px', background:'#ffffff' }}>
        <div style={{ maxWidth:1080, margin:'0 auto', display:'flex', flexWrap:'wrap', gap:48, alignItems:'flex-start' }}>
          <div style={{ flex:'1 1 380px' }}>
            <p style={{ fontSize:12, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:theme.accentColor, marginBottom:16 }}>Differentiators</p>
            <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:800, color:'#0f172a', marginBottom:32, letterSpacing:'-0.5px', lineHeight:1.2 }}>
              Why clients choose {name.split(' ')[0]}
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {achievements.map((ach, idx) => (
                <div key={idx} style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                  <div style={{ flexShrink:0, width:40, height:40, borderRadius:12, background:`rgba(${theme.accentRgb},0.1)`, display:'flex', alignItems:'center', justifyContent:'center', color:theme.accentColor, marginTop:2 }}>
                    <Award size={18} />
                  </div>
                  <p style={{ color:'#475569', lineHeight:1.7, fontSize:14.5, margin:0, paddingTop:8 }}>{ach}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verification card */}
          <div style={{ flex:'1 1 340px', background: theme.heroBg, borderRadius:24, padding:'40px 36px', color:'white', boxShadow:`0 20px 60px rgba(0,0,0,0.3)` }}>
            <ShieldCheck size={40} style={{ color:theme.accentColor, marginBottom:20 }} />
            <h3 style={{ fontSize:22, fontWeight:800, marginBottom:16, lineHeight:1.2 }}>ProServe Verified Network</h3>
            <p style={{ color:'rgba(148,163,184,0.85)', lineHeight:1.7, marginBottom:28, fontSize:14 }}>
              My credentials, identity, and professional background have passed strict verification standards — assuring safe, compliant, and authentic advisory services.
            </p>
            <ul style={{ listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:12 }}>
              {['Government Identity Verified','Academic Credentials Checked','Professional History Confirmed','Active License Validated'].map((item, i) => (
                <li key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'rgba(226,232,240,0.9)' }}>
                  <Check size={16} style={{ color:'#22c55e', flexShrink:0 }} /> {item}
                </li>
              ))}
            </ul>
            <button onClick={handleBook} style={{
              marginTop:32, width:'100%',
              background: theme.btnBg, color: theme.btnColor, border:'none',
              borderRadius:'999px', padding:'14px', fontSize:14, fontWeight:700, cursor:'pointer',
              boxShadow:`0 4px 20px rgba(${theme.accentRgb},0.3)`
            }}>
              Book a Consultation →
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <section style={{ padding:'80px 24px', background:'#f8fafc' }}>
          <div style={{ maxWidth:720, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <p style={{ fontSize:12, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:theme.accentColor, marginBottom:12 }}>FAQ</p>
              <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.4rem)', fontWeight:800, color:'#0f172a', letterSpacing:'-0.5px' }}>Common Questions</h2>
            </div>
            {faqs.map((faq, i) => <FaqItem key={i} faq={faq} theme={theme} />)}
          </div>
        </section>
      )}

      {/* ── FOOTER CTA ───────────────────────────────────────────────── */}
      <section style={{ background: theme.heroBg, padding:'80px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 50% 0%, rgba(${theme.accentRgb},0.12) 0%, transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ maxWidth:640, margin:'0 auto', textAlign:'center', position:'relative', zIndex:2 }}>
          <h2 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:900, color:'white', marginBottom:16, letterSpacing:'-0.5px', lineHeight:1.1 }}>
            Ready to get started?
          </h2>
          <p style={{ color:'rgba(148,163,184,0.85)', fontSize:15, marginBottom:40, lineHeight:1.7 }}>
            Book a primary consultation with {name.split(' ')[0]} to review your requirements and plan your next steps.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:14, justifyContent:'center' }}>
            <button onClick={handleBook} style={{
              background: theme.btnBg, color: theme.btnColor, border:'none',
              borderRadius:'999px', padding:'16px 40px', fontSize:16, fontWeight:700, cursor:'pointer',
              boxShadow:`0 8px 32px rgba(${theme.accentRgb},0.4)`,
              display:'flex', alignItems:'center', gap:8
            }}>
              <MessageSquare size={18} /> Book Consultation
            </button>
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} style={{
                display:'flex', alignItems:'center', gap:8,
                background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.8)',
                border:'1px solid rgba(255,255,255,0.12)', borderRadius:'999px',
                padding:'16px 28px', fontSize:15, fontWeight:600, textDecoration:'none'
              }}>
                <Mail size={16} /> Email Me
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ background: theme.footerBg, padding:'24px', paddingBottom: 80 }}>
        <div style={{ maxWidth:1080, margin:'0 auto', display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', gap:20 }}>
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} style={{ color:'#475569', display:'flex', alignItems:'center', gap:6, textDecoration:'none', fontSize:13 }}>
                <Mail size={14} /> {contactEmail}
              </a>
            )}
            {contactPhone && (
              <a href={`tel:${contactPhone}`} style={{ color:'#475569', display:'flex', alignItems:'center', gap:6, textDecoration:'none', fontSize:13 }}>
                <Phone size={14} /> {contactPhone}
              </a>
            )}
            {socials.linkedin && (
              <a href={socials.linkedin.startsWith('http') ? socials.linkedin : `https://${socials.linkedin}`} target="_blank" rel="noreferrer" style={{ color:'#475569', display:'flex', alignItems:'center', gap:6, textDecoration:'none', fontSize:13 }}>
                <ExternalLink size={14} /> LinkedIn
              </a>
            )}
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
            <a href="/" style={{ display:'flex', alignItems:'center', gap:5, textDecoration:'none' }}>
              <ShieldCheck size={13} style={{ color:theme.accentColor }} />
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:600 }}>Powered by ProServe</span>
            </a>
            <span style={{ fontSize:11, color:'#334155' }}>© {new Date().getFullYear()} {name}</span>
          </div>
        </div>
      </footer>

      {/* ── STICKY MOBILE CTA ─────────────────────────────────────────── */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0,
        padding:'12px 16px', background:'rgba(255,255,255,0.96)', backdropFilter:'blur(16px)',
        borderTop:'1px solid #e2e8f0', zIndex:300,
        boxShadow:'0 -4px 24px rgba(0,0,0,0.08)',
        display:'flex', gap:10, alignItems:'center',
        transition:'transform 0.3s ease',
        transform: showSticky ? 'translateY(0)' : 'translateY(100%)',
      }}>
        <button onClick={handleBook} style={{
          flex:1, background:theme.btnBg, color:theme.btnColor, border:'none',
          borderRadius:'999px', padding:'13px', fontSize:14, fontWeight:700, cursor:'pointer',
          boxShadow:`0 4px 16px rgba(${theme.accentRgb},0.25)`
        }}>
          Book Consultation
        </button>
        {contactPhone && (
          <a href={`tel:${contactPhone}`} style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            width:46, height:46, borderRadius:'50%',
            background:'rgba(0,0,0,0.05)', border:'1px solid #e2e8f0',
            color:'#334155', textDecoration:'none', flexShrink:0
          }}>
            <Phone size={18} />
          </a>
        )}
      </div>
    </div>
  );
}
