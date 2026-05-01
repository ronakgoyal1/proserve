import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dbService } from '../lib/dbService';
import {
  Loader2, ShieldCheck, AlertCircle, MessageSquare,
  Mail, Phone, Check, MapPin, Globe, Star,
  ChevronDown, ChevronUp, ExternalLink, ArrowRight,
  Users, Briefcase, Clock, TrendingUp, Award, Zap
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// ─── Theme Registry ───────────────────────────────────────────────────────────
function resolveTheme(themeKey = '') {
  return {
    heroBg: '#F8F8F5', heroText: '#1A1A1A', heroSubText: '#6B7280',
    accent: '#7A9A6E', accentLight: '#92B284', accentRgb: '122,154,110',
    pill: 'rgba(122,154,110,0.14)', pillText: '#5E7D52',
    btnBg: '#1A1A1A', btnColor: '#ffffff',
    glow1: 'rgba(122,154,110,0.16)', glow2: 'rgba(26,26,26,0.08)',
    altBg: '#F2F4F0', nameGrad: 'linear-gradient(to right,#1A1A1A 40%,#7A9A6E 100%)',
    footerBg: '#111111', cardBorder: '#E8E8E5',
    statBg: '#ffffff', statBorder: '#E8E8E5'
  };
}

// ─── Safe content parser ──────────────────────────────────────────────────────
function parseContent(raw) {
  let c = raw || {};
  if (typeof c === 'string') { try { c = JSON.parse(c); } catch { c = {}; } }
  return c;
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
class PortfolioErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  componentDidCatch(e, i) { console.error('Portfolio render error:', e, i); }
  render() {
    if (this.state.hasError) return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0f1a', color: 'white', padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={64} style={{ color: '#ef4444', marginBottom: '1rem' }} />
        <h1>Display Error</h1>
        <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '1rem auto 2rem' }}>
          This portfolio has a render error. Please regenerate it from your Pro Dashboard.
        </p>
        <button onClick={() => window.location.href = '/'} style={{ padding: '12px 28px', background: '#3b82f6', border: 'none', borderRadius: '999px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Return Home</button>
      </div>
    );
    return this.props.children;
  }
}

// ─── Shared Subcomponents ─────────────────────────────────────────────────────

function FaqItem({ faq, t }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 16, border: `1px solid ${open ? t.cardBorder : '#e2e8f0'}`, marginBottom: 10, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', background: open ? `rgba(${t.accentRgb},0.04)` : 'transparent', border: 'none', cursor: 'pointer', gap: 16, textAlign: 'left' }}>
        <span style={{ fontWeight: 700, fontSize: 14.5, color: '#1e293b', lineHeight: 1.4 }}>{faq.q}</span>
        {open ? <ChevronUp size={17} style={{ color: t.accent, flexShrink: 0 }} /> : <ChevronDown size={17} style={{ color: '#94a3b8', flexShrink: 0 }} />}
      </button>
      {open && <div style={{ padding: '0 22px 18px', color: '#64748b', lineHeight: 1.75, fontSize: 14, borderTop: '1px solid #f1f5f9' }}>{faq.a}</div>}
    </div>
  );
}

function SectionLabel({ text, t }) {
  return <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: t.accent, marginBottom: 14 }}>{text}</p>;
}

function Avatar({ initials, t, size = 100 }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle at 30% 30%, rgba(${t.accentRgb},0.5), rgba(${t.accentRgb},0.05))`, padding: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 1px rgba(${t.accentRgb},0.3), 0 0 40px rgba(${t.accentRgb},0.2)` }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg,#1e293b,#0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 900, color: 'white', letterSpacing: '-1px', fontFamily: 'Inter,system-ui,sans-serif' }}>
          {initials}
        </div>
      </div>
    </div>
  );
}

function VerifiedBadge({ t }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: t.pill, color: t.pillText, border: `1px solid rgba(${t.accentRgb},0.2)`, borderRadius: 999, padding: '5px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
      <ShieldCheck size={12} /> Wisor Verified
    </span>
  );
}

function LuxuryBtn({ children, onClick, t, style = {} }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: t.btnBg, color: t.btnColor, border: 'none', borderRadius: 999, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 ${hov ? 14 : 8}px ${hov ? 40 : 24}px rgba(${t.accentRgb},${hov ? 0.4 : 0.28})`, transform: hov ? 'translateY(-2px)' : 'translateY(0)', transition: 'all 0.22s', ...style }}>
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, style = {} }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? 'rgba(26,26,26,0.05)' : 'transparent', color: hov ? '#1A1A1A' : '#6B7280', border: '1px solid rgba(26,26,26,0.15)', borderRadius: 999, padding: '14px 28px', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', ...style }}>
      {children}
    </button>
  );
}

// ─── Shared Sections ──────────────────────────────────────────────────────────

function WhoIHelpSection({ items = [], t, bg = '#fff' }) {
  if (!items.length) return null;
  return (
    <section style={{ padding: '80px 24px', background: bg }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <SectionLabel text="Who I Help" t={t} />
          <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>My clients</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 20 }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: '#ffffff', border: `1px solid #e8edf5`, borderRadius: 20, padding: '28px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.22s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 28px rgba(${t.accentRgb},0.12)`; e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e8edf5'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{item.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemsSection({ items = [], t, name }) {
  if (!items.length) return null;
  const firstName = (name || 'I').split(' ')[0];
  return (
    <section style={{ padding: '80px 24px', background: t.altBg }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <SectionLabel text="Problems I Solve" t={t} />
          <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Sound familiar?
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, marginTop: 10, maxWidth: 520, margin: '10px auto 0' }}>
            These are the problems {firstName} solves every day.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 20, background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e8edf5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0, paddingTop: 2 }}>😣</span>
                <span style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{item.pain}</span>
              </div>
              <ArrowRight size={18} style={{ color: t.accent, flexShrink: 0 }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Check size={16} style={{ color: '#22c55e', flexShrink: 0, marginTop: 3 }} />
                <span style={{ fontSize: 14, color: '#334155', fontWeight: 600, lineHeight: 1.6 }}>{item.fix}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ items = [], t, bg = '#fff' }) {
  const safeItems = items.filter(Boolean).map(s =>
    typeof s === 'string'
      ? { name: s, icon: '⚡', tagline: 'Expert delivery', problem: '', solution: '' }
      : s
  );
  if (!safeItems.length) return null;
  return (
    <section id="pp-services" style={{ padding: '80px 24px', background: bg }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <SectionLabel text="Services" t={t} />
          <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>What I do</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          {safeItems.map((svc, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid #e8edf5`, borderRadius: 20, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.22s', borderTop: `3px solid transparent` }}
              onMouseEnter={e => { e.currentTarget.style.borderTopColor = t.accent; e.currentTarget.style.boxShadow = `0 8px 28px rgba(${t.accentRgb},0.12)`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderTopColor = 'transparent'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{svc.icon || '⚡'}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{svc.name}</h3>
              <p style={{ fontSize: 12, color: t.accent, fontWeight: 600, marginBottom: 12, letterSpacing: 0.3 }}>{svc.tagline || ''}</p>
              {svc.solution && <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{svc.solution}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResultsSection({ items = [], t, bg = '#f8fafc' }) {
  if (!items.length) return null;
  return (
    <section style={{ padding: '72px 24px', background: bg }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <SectionLabel text="Results" t={t} />
        <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, color: '#0f172a', marginBottom: 44, letterSpacing: '-0.5px' }}>
          Real outcomes, not promises
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
          {items.map((r, i) => (
            <div key={i} style={{ flex: '1 1 200px', background: '#fff', border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: '28px 20px', boxShadow: `0 4px 16px rgba(${t.accentRgb},0.08)`, textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, color: t.accent, letterSpacing: '-1px', lineHeight: 1 }}>{r.metric}</div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 8, fontSize: 14 }}>{r.label}</div>
              <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{r.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ items = [], t, bg = '#fff' }) {
  if (!items.length) return null;
  return (
    <section style={{ padding: '80px 24px', background: bg }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <SectionLabel text="FAQ" t={t} />
          <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.2rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>Common questions</h2>
        </div>
        {items.map((faq, i) => <FaqItem key={i} faq={faq} t={t} />)}
      </div>
    </section>
  );
}

function FooterCTA({ c, t, onBook }) {
  return (
    <section style={{ padding: '80px 24px', background: t.heroBg, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 0%, rgba(${t.accentRgb},0.14) 0%,transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, color: t.heroText, marginBottom: 14, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
          {c.ctaHeadline || 'Let\'s work together.'}
        </h2>
        <p style={{ color: t.heroSubText, fontSize: 15, lineHeight: 1.75, marginBottom: 40 }}>
          {c.ctaBody || 'Book a consultation and get a plan tailored to your situation.'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <LuxuryBtn t={t} onClick={onBook}><MessageSquare size={17} /> Book Consultation</LuxuryBtn>
          {c.contactEmail && (
            <a href={`mailto:${c.contactEmail}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(26,26,26,0.05)', color: t.heroText, border: '1px solid rgba(26,26,26,0.15)', borderRadius: 999, padding: '14px 24px', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              <Mail size={15} /> Email Me
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function PortfolioFooter({ c, t }) {
  return (
    <footer style={{ background: t.footerBg, padding: '20px 24px', paddingBottom: 80 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {c.contactEmail && <a href={`mailto:${c.contactEmail}`} style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13 }}><Mail size={13} /> {c.contactEmail}</a>}
          {c.contactPhone && <a href={`tel:${c.contactPhone}`} style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13 }}><Phone size={13} /> {c.contactPhone}</a>}
          {c.socials?.linkedin && <a href={c.socials.linkedin.startsWith('http') ? c.socials.linkedin : `https://${c.socials.linkedin}`} target="_blank" rel="noreferrer" style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13 }}><ExternalLink size={13} /> LinkedIn</a>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none', justifyContent: 'flex-end' }}>
            <ShieldCheck size={12} style={{ color: t.accent }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Powered by Wisor</span>
          </a>
          <span style={{ fontSize: 11, color: '#1e293b' }}>© {new Date().getFullYear()} {c.name}</span>
        </div>
      </div>
    </footer>
  );
}

// ─── LAYOUT A: THE AUTHORITY ───────────────────────────────────────────────────
// Dark full-width hero with left-aligned identity block, strong typography
function LayoutAuthority({ c, t, onBook }) {
  const initials = (c.name || 'P').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const stats = c.stats || [];
  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#fff' }}>
      {/* HERO */}
      <section style={{ background: t.heroBg, minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '80px 24px 60px' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '60vw', height: '60vw', borderRadius: '50%', background: `radial-gradient(circle,${t.glow1} 0%,transparent 55%)`, filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: `radial-gradient(circle,${t.glow2} 0%,transparent 60%)`, filter: 'blur(100px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr auto', gap: 60, alignItems: 'center', position: 'relative', zIndex: 2 }}>
          {/* Left text */}
          <div>
            <VerifiedBadge t={t} />
            <h1 style={{ background: t.nameGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: 'clamp(2.8rem,6vw,5rem)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1, margin: '20px 0 14px' }}>
              {c.name}
            </h1>
            <p style={{ fontSize: 'clamp(1rem,2vw,1.3rem)', color: t.heroSubText, marginBottom: 12, fontWeight: 400 }}>
              {c.profession}{c.city && c.city !== 'India' ? ` · ${c.city}` : ''}
            </p>
            <p style={{ fontSize: 16, color: t.heroSubText, maxWidth: 560, lineHeight: 1.75, marginBottom: 36 }}>
              {c.heroStatement || c.bio || ''}
            </p>
            {c.tagline && (
              <p style={{ fontSize: 13, letterSpacing: 1.5, color: t.accentLight, fontWeight: 600, textTransform: 'uppercase', marginBottom: 36 }}>
                {c.tagline}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <LuxuryBtn t={t} onClick={onBook}><MessageSquare size={16} /> Book Consultation</LuxuryBtn>
              {c.contactPhone && (
                <a href={`https://wa.me/${c.contactPhone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(37,211,102,0.12)', color: '#25d366', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 999, padding: '14px 22px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
              <GhostBtn onClick={() => document.getElementById('pp-services')?.scrollIntoView({ behavior: 'smooth' })}>
                View Services
              </GhostBtn>
            </div>
          </div>

          {/* Right: Avatar + stats */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
            <Avatar initials={initials} t={t} size={140} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minWidth: 240 }}>
              {stats.map((s, i) => (
                <div key={i} style={{ background: t.statBg, border: `1px solid ${t.statBorder}`, backdropFilter: 'blur(10px)', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: t.heroText, letterSpacing: '-0.5px' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: t.heroSubText, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      {/* About */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <SectionLabel text="About" t={t} />
          <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', fontWeight: 800, color: '#0f172a', marginBottom: 24, letterSpacing: '-0.5px' }}>
            Who is {(c.name || '').split(' ')[0]}?
          </h2>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.85, marginBottom: 36 }}>{c.bio}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {['Identity Verified', 'Credentials Checked', 'Background Cleared', 'Fast Response'].map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                <Check size={15} style={{ color: '#22c55e' }} /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <WhoIHelpSection items={c.whoIHelp || []} t={t} bg={t.altBg} />
      <ProblemsSection items={c.problemsSolved || []} t={t} name={c.name} />
      <ServicesSection items={c.services || []} t={t} bg={t.altBg} />
      <ResultsSection items={c.results || []} t={t} />
      <FaqSection items={c.faqs || []} t={t} bg={t.altBg} />
      <FooterCTA c={c} t={t} onBook={onBook} />
      <PortfolioFooter c={c} t={t} />
    </div>
  );
}

// ─── LAYOUT B: THE SPECIALIST ──────────────────────────────────────────────────
// Full-width centered hero, trust bar, then alternating sections
function LayoutSpecialist({ c, t, onBook }) {
  const initials = (c.name || 'P').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const stats = c.stats || [];
  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#fff' }}>
      {/* HERO — centered, no avatar in header */}
      <section style={{ background: t.heroBg, padding: '90px 24px 80px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '80vh', borderRadius: '0 0 50% 50%', background: `radial-gradient(ellipse at center top,${t.glow1} 0%,transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <Avatar initials={initials} t={t} size={90} />
          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <VerifiedBadge t={t} />
          </div>
          <h1 style={{ background: t.nameGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: 'clamp(2.6rem,6vw,4.5rem)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 16 }}>
            {c.name}
          </h1>
          <p style={{ fontSize: 18, color: t.heroSubText, marginBottom: 10, fontWeight: 400 }}>
            {c.profession}{c.city && c.city !== 'India' ? <> &nbsp;·&nbsp; <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {c.city}</> : ''}
          </p>
          <p style={{ fontSize: 15, color: t.heroSubText, maxWidth: 580, margin: '0 auto 36px', lineHeight: 1.75 }}>
            {c.heroStatement || c.bio || ''}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <LuxuryBtn t={t} onClick={onBook}><MessageSquare size={16} /> Book Consultation</LuxuryBtn>
            <GhostBtn onClick={() => document.getElementById('pp-services')?.scrollIntoView({ behavior: 'smooth' })}>
              See What I Do
            </GhostBtn>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{ background: t.heroBg, borderTop: 'none', borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 32px', display: 'flex', flexWrap: 'wrap', gap: 0, justifyContent: 'center' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ flex: '1 1 180px', textAlign: 'center', padding: '20px 16px', borderRight: i < stats.length - 1 ? '1px solid rgba(26,26,26,0.1)' : 'none' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: t.heroText, letterSpacing: '-0.5px' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: t.heroSubText, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tagline strip */}
      {c.tagline && (
        <div style={{ background: `rgba(${t.accentRgb},0.06)`, borderBottom: `1px solid rgba(${t.accentRgb},0.12)`, padding: '14px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 12.5, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>{c.tagline}</p>
        </div>
      )}

      {/* ABOUT */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <SectionLabel text="About" t={t} />
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 800, color: '#0f172a', marginBottom: 20, letterSpacing: '-0.5px' }}>
              The expert behind the work
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.85, fontSize: 15.5 }}>{c.bio}</p>
          </div>
          <div style={{ background: t.altBg, borderRadius: 24, padding: '36px 32px', border: `1px solid ${t.cardBorder}` }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['Identity Verified', 'Credentials Authenticated', 'Professional History Confirmed', 'Background Cleared'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={14} style={{ color: '#22c55e' }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${t.cardBorder}` }}>
              <div style={{ display: 'flex', items: 'center', gap: 8 }}>
                <ShieldCheck size={16} style={{ color: t.accent }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: t.accent }}>Wisor Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WhoIHelpSection items={c.whoIHelp || []} t={t} bg={t.altBg} />
      <ProblemsSection items={c.problemsSolved || []} t={t} name={c.name} />
      <ServicesSection items={c.services || []} t={t} />
      <ResultsSection items={c.results || []} t={t} bg={t.altBg} />
      <FaqSection items={c.faqs || []} t={t} />
      <FooterCTA c={c} t={t} onBook={onBook} />
      <PortfolioFooter c={c} t={t} />
    </div>
  );
}

// ─── LAYOUT C: THE TRUSTED ADVISOR ────────────────────────────────────────────
// Minimal luxury, editorial feel, large statement typography
function LayoutAdvisor({ c, t, onBook }) {
  const initials = (c.name || 'P').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const stats = c.stats || [];
  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#fff' }}>
      {/* HERO — two column editorial */}
      <section style={{ background: t.heroBg, minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'stretch' }}>
        {/* Left accent strip */}
        <div style={{ width: 5, background: t.btnBg, flexShrink: 0 }} />

        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 70% 40%,${t.glow1} 0%,transparent 60%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 40px 80px', width: '100%', display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 48, alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div>
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <VerifiedBadge t={t} />
              {c.city && c.city !== 'India' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#475569', fontWeight: 500 }}>
                  <MapPin size={12} /> {c.city}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(3rem,7vw,5.5rem)', fontWeight: 900, color: t.heroText, letterSpacing: '-3px', lineHeight: 0.95, marginBottom: 24 }}>
              {(c.name || '').split(' ').map((word, i) => (
                <span key={i} style={{ display: 'block', color: i === 0 ? t.heroText : t.accent }}>{word}</span>
              ))}
            </h1>

            <div style={{ width: 60, height: 3, background: t.btnBg, borderRadius: 999, marginBottom: 24 }} />

            <p style={{ fontSize: 18, color: t.heroSubText, fontWeight: 300, lineHeight: 1.65, maxWidth: 500, marginBottom: 40 }}>
              {c.heroStatement || c.bio || ''}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <LuxuryBtn t={t} onClick={onBook}><MessageSquare size={16} /> Book a Call</LuxuryBtn>
              {c.contactPhone && (
                <a href={`tel:${c.contactPhone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.heroSubText, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                  <Phone size={15} style={{ color: t.accent }} /> {c.contactPhone}
                </a>
              )}
            </div>
          </div>

          {/* Right: card */}
          <div style={{ background: t.statBg, border: `1px solid ${t.statBorder}`, backdropFilter: 'blur(20px)', borderRadius: 28, padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Avatar initials={initials} t={t} size={80} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: t.accent, marginBottom: 4, letterSpacing: 0.5 }}>{c.profession}</p>
              <p style={{ fontSize: 12, color: t.heroSubText }}>{c.languages?.join(' · ')}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: i < stats.length - 1 ? '1px solid rgba(26,26,26,0.1)' : 'none' }}>
                  <span style={{ fontSize: 12, color: t.heroSubText }}>{s.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: t.heroText }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tagline bar */}
      {c.tagline && (
        <div style={{ background: t.heroBg, borderTop: `1px solid rgba(255,255,255,0.05)`, padding: '20px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: 3.5, color: '#475569', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>{c.tagline}</p>
        </div>
      )}

      {/* ABOUT -- editorial */}
      <section style={{ padding: '100px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionLabel text="About" t={t} />
          <p style={{ fontSize: 'clamp(1.4rem,2.8vw,2rem)', lineHeight: 1.55, color: '#1e293b', fontWeight: 300, letterSpacing: '-0.3px', marginBottom: 36 }}>
            "{c.bio}"
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {['Identity Verified', 'Credentials Authenticated', 'Background Cleared', 'Fast Response'].map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                <Check size={14} style={{ color: '#22c55e' }} /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <WhoIHelpSection items={c.whoIHelp || []} t={t} bg={t.altBg} />
      <ProblemsSection items={c.problemsSolved || []} t={t} name={c.name} />
      <ServicesSection items={c.services || []} t={t} />
      <ResultsSection items={c.results || []} t={t} bg={t.altBg} />
      <FaqSection items={c.faqs || []} t={t} />
      <FooterCTA c={c} t={t} onBook={onBook} />
      <PortfolioFooter c={c} t={t} />
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
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
          const uid = found.user_id || found.userId;
          const pros = await dbService.getProfessionals();
          const match = pros.find(p => String(p.user_id || p.userId) === String(uid));
          if (match) setExpertId(match.id);
        }
      } catch (e) { console.error('Portfolio load error:', e); }
      finally { setLoading(false); }
    }
    load();
  }, [slug]);

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#020617' }}>
      <Loader2 size={40} className="spin" style={{ color: '#7A9A6E' }} />
    </div>
  );

  if (!portfolio) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white', textAlign: 'center', padding: 24 }}>
      <ShieldCheck size={64} style={{ color: '#334155', marginBottom: 24 }} />
      <h1 style={{ fontSize: 'clamp(1.4rem,4vw,2.4rem)', marginBottom: 12 }}>Portfolio Not Found</h1>
      <p style={{ color: '#475569', marginBottom: 32, maxWidth: 400 }}>This link is inactive or doesn't exist. Browse verified experts instead.</p>
      <Link to="/experts" style={{ padding: '12px 32px', background: '#7A9A6E', color: '#1A1A1A', borderRadius: 999, fontWeight: 700, textDecoration: 'none' }}>Browse Experts</Link>
    </div>
  );

  return <PortfolioErrorBoundary><PortfolioMain portfolio={portfolio} expertId={expertId} navigate={navigate} /></PortfolioErrorBoundary>;
}

function PortfolioMain({ portfolio, expertId, navigate }) {
  const c = parseContent(portfolio?.content);

  // Normalize services — support both old string format and new enriched object format
  const services = Array.isArray(c.services) ? c.services : [];

  const t = resolveTheme(c.themeKey || c.profession || '');
  const layout = typeof c.layout === 'number' ? c.layout : 0;
  const onBook = () => expertId ? navigate(`/professional/${expertId}?book=true`) : navigate('/login');

  // Sticky CTA
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const fn = () => setShowSticky(window.scrollY > 600);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const content = { ...c, services };

  return (
    <>
      <Helmet>
        <title>{`${c.name || 'Expert'} | ${c.profession || 'Professional'} | Wisor`}</title>
        <meta name="description" content={c.heroStatement || c.bio || `${c.name} on Wisor.`} />
      </Helmet>

      {/* Sticky Navbar */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500, background: 'rgba(248,248,245,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(26,26,26,0.06)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
          <ShieldCheck size={17} style={{ color: t.accent }} />
          <span style={{ fontWeight: 800, fontSize: 14, color: '#1A1A1A' }}>Wi<span style={{ color: t.accent }}>sor</span></span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {c.contactPhone && (
            <a href={`tel:${c.contactPhone}`} style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
              <Phone size={13} /> Call
            </a>
          )}
          <button onClick={onBook} style={{ background: t.btnBg, color: t.btnColor, border: 'none', borderRadius: 999, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 14px rgba(${t.accentRgb},0.3)` }}>
            Book Consultation
          </button>
        </div>
      </header>

      {/* Padding for fixed nav */}
      <div style={{ paddingTop: 52 }}>
        {layout === 2 ? <LayoutAdvisor c={content} t={t} onBook={onBook} /> :
         layout === 1 ? <LayoutSpecialist c={content} t={t} onBook={onBook} /> :
                        <LayoutAuthority c={content} t={t} onBook={onBook} />}
      </div>

      {/* Mobile sticky CTA — slides up after scroll */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '10px 16px 10px', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', borderTop: '1px solid #e2e8f0', zIndex: 400, display: 'flex', gap: 10, boxShadow: '0 -4px 24px rgba(0,0,0,0.08)', transform: showSticky ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.3s ease' }}>
        <button onClick={onBook} style={{ flex: 1, background: t.btnBg, color: t.btnColor, border: 'none', borderRadius: 999, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 16px rgba(${t.accentRgb},0.25)` }}>
          Book Consultation
        </button>
        {c.contactPhone && (
          <a href={`https://wa.me/${c.contactPhone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', textDecoration: 'none', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        )}
      </div>
    </>
  );
}
