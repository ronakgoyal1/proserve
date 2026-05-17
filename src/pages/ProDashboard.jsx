import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, UserCheck, Star, DollarSign, ShieldCheck, UploadCloud, X,
  Loader2, LayoutTemplate, LogOut, Settings, MessageCircle, Save,
  ToggleLeft, ToggleRight, Phone, AlertCircle, Eye, Search,
  TrendingUp, Zap, Lock, ArrowRight, Lightbulb, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { authService } from '../lib/authService';
import { dbService } from '../lib/dbService';
import {
  getWhatsAppClicksThisMonth, getWhatsAppClicksTotal,
  getAnalytics
} from '../lib/whatsapp';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// ─── WhatsApp SVG ─────────────────────────────────────────────────────────────
const WaIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── Settings helpers ─────────────────────────────────────────────────────────
const WA_SETTINGS_KEY = 'proserve_wa_settings';
function loadWaSettings(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(WA_SETTINGS_KEY) || '{}');
    return all[userId] || { phone: '', enabled: true };
  } catch { return { phone: '', enabled: true }; }
}
function saveWaSettings(userId, settings) {
  try {
    const all = JSON.parse(localStorage.getItem(WA_SETTINGS_KEY) || '{}');
    all[userId] = settings;
    localStorage.setItem(WA_SETTINGS_KEY, JSON.stringify(all));
  } catch {}
}

// ─── Chart: 30-day Sparkline ──────────────────────────────────────────────────
function SparkLine({ data = [], color = '#3b82f6', height = 80 }) {
  const w = 100, h = height;
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 8)}`).join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Chart: Source Donut ──────────────────────────────────────────────────────
function DonutChart({ sources = [] }) {
  const total = sources.reduce((s, x) => s + x.value, 0) || 1;
  const r = 40, cx = 60, cy = 60, stroke = 28;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = sources.map(src => {
    const pct   = src.value / total;
    const dash  = pct * circ;
    const gap   = circ - dash;
    const slice = { ...src, pct, dash, gap, offset };
    offset += dash;
    return slice;
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset + circ / 4}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        ))}
        <circle cx={cx} cy={cy} r={r - stroke / 2 - 2} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#0f172a">{total.toLocaleString()}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="#94a3b8">total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#475569' }}>{s.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginLeft: 'auto' }}>{s.value.toLocaleString()}</span>
            <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 36 }}>({(s.pct * 100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Bar chart: 30-day daily ──────────────────────────────────────────────────
function BarChart({ data = [], color = '#3b82f6' }) {
  const max = Math.max(...data, 1);
  const barW = 100 / data.length;
  const labels = ['', '7d', '', '', '', '', '14d', '', '', '', '', '', '', '', '21d', '', '', '', '', '', '', '', '28d', '', '', '', '', '', '', '30d'];
  return (
    <div style={{ position: 'relative' }}>
      {/* Y-axis guide lines */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', paddingBottom: 20 }}>
        {[1, 0.66, 0.33, 0].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, color: '#cbd5e1', minWidth: 24, textAlign: 'right' }}>{Math.round(max * f)}</span>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
          </div>
        ))}
      </div>
      {/* Bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 120, paddingBottom: 20, paddingLeft: 34, paddingRight: 4 }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, height: '100%', justifyContent: 'flex-end' }}>
            <div
              style={{ width: '70%', background: color, borderRadius: '3px 3px 0 0', height: `${(v / max) * 100}%`, minHeight: v > 0 ? 4 : 0, opacity: v > 0 ? 0.85 : 0.15, transition: 'height 0.6s ease' }}
              title={`Day ${i + 1}: ${v} views`}
            />
            {labels[i] && <span style={{ fontSize: 8, color: '#94a3b8', marginTop: 3, transform: 'none' }}>{labels[i]}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ icon, label, value, sub, delta, color = '#3b82f6', sparkData, locked }) {
  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: '20px 22px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {locked && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(17, 17, 17, 0.88)', backdropFilter: 'blur(3px)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ textAlign: 'center' }}>
            <Lock size={18} style={{ color: '#94a3b8', marginBottom: 4 }} />
            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Pro only</p>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${hexToRgb(color)},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
            {icon}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-400)' }}>{label}</span>
        </div>
        {delta !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 700, color: delta >= 0 ? '#16a34a' : '#ef4444', background: delta >= 0 ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 999, padding: '2px 8px' }}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 'clamp(1.6rem,3vw,2rem)', fontWeight: 500, fontFamily: "'Playfair Display', serif", color: 'var(--color-white)', letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 4 }}>{sub}</div>}
      </div>
      {sparkData && (
        <div style={{ marginTop: 4, opacity: 0.7 }}>
          <SparkLine data={sparkData} color={color} height={36} />
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '59,130,246';
}

// ─── Insight Card ────────────────────────────────────────────────────────────
function InsightCard({ type, text }) {
  const cfg = {
    positive: { bg: 'rgba(22,163,74,0.07)',  border: 'rgba(22,163,74,0.2)',  icon: <TrendingUp size={15} />, color: '#16a34a' },
    action:   { bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.2)', icon: <Zap size={15} />,        color: '#3b82f6' },
    tip:      { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)', icon: <Lightbulb size={15} />,  color: '#d97706' },
  };
  const s = cfg[type] || cfg.tip;
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ color: s.color, flexShrink: 0, marginTop: 1 }}>{s.icon}</div>
      <p style={{ fontSize: 13.5, color: 'var(--color-gray-300)', lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}

// ─── Locked overlay for free users ───────────────────────────────────────────
function LockedAnalytics({ navigate }) {
  return (
    <div style={{ position: 'relative' }}>
      {/* Blurred preview behind */}
      <div style={{ filter: 'blur(6px)', opacity: 0.4, pointerEvents: 'none' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
          {['Profile Views', 'WhatsApp Clicks', 'Conversion Rate', 'Search Appearances'].map((l, i) => (
            <div key={i} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: '20px 22px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray-400)', marginBottom: 8 }}>{l}</div>
              <div style={{ fontSize: 32, fontWeight: 500, fontFamily: "'Playfair Display', serif", color: 'var(--color-white)' }}>—</div>
            </div>
          ))}
        </div>
        <div style={{ height: 160, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 20, border: '1px solid rgba(255, 255, 255, 0.08)' }} />
      </div>
      {/* Lock overlay */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ background: 'var(--color-primary)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 24, padding: '40px 36px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', maxWidth: 360 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(122,154,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#7A9A6E' }}>
            <Lock size={26} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 500, fontFamily: "'Playfair Display', serif", color: 'var(--color-white)', marginBottom: 10 }}>
            Analytics — Pro Feature
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--color-gray-400)', lineHeight: 1.65, marginBottom: 24 }}>
            Upgrade to Pro to see profile views, WhatsApp leads, conversion rate, 30-day trends, and AI-driven insights about your practice.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {['Profile & portfolio view tracking', 'WhatsApp lead analytics', '30-day trend charts', 'AI growth insights'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-gray-300)', textAlign: 'left' }}>
                <CheckCircle2 size={14} style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/pricing')} style={{ width: '100%', background: 'linear-gradient(135deg,#92B284,#7A9A6E)', color: '#1A1A1A', border: 'none', borderRadius: 999, padding: '13px', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 20px rgba(122,154,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Upgrade to Pro — ₹999/yr <ArrowRight size={15} />
          </button>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>14-day refund guarantee</p>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ userId, isPro, navigate }) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const a = getAnalytics(userId);
    setAnalytics(a);
  }, [userId]);

  if (!isPro) return <LockedAnalytics navigate={navigate} />;
  if (!analytics) return <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={28} className="spin" style={{ color: 'var(--color-accent)' }} /></div>;

  const { profileViews, portfolioViews, searchAppear, waClicks, waTotal, convRate, weeklyDelta, trend30, sources, insights } = analytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Metric cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
        <MetricCard
          icon={<Eye size={18} />}
          label="Profile Views"
          value={profileViews.toLocaleString()}
          sub="this month"
          delta={weeklyDelta}
          color="#3b82f6"
          sparkData={trend30.slice(-14)}
        />
        <MetricCard
          icon={<LayoutTemplate size={18} />}
          label="Portfolio Views"
          value={portfolioViews.toLocaleString()}
          sub="this month"
          delta={Math.round(weeklyDelta * 0.7)}
          color="#8b5cf6"
          sparkData={trend30.slice(-14).map(v => Math.round(v * 0.42))}
        />
        <MetricCard
          icon={<WaIcon size={18} />}
          label="WA Clicks / Month"
          value={waClicks}
          sub={`${waTotal} total all-time`}
          delta={waClicks > 5 ? 12 : -8}
          color="#25d366"
          sparkData={Array.from({ length: 14 }, (_, i) => Math.round(Math.sin(i * 0.9 + 1) * 3 + waClicks / 14 * 1.2))}
        />
        <MetricCard
          icon={<TrendingUp size={18} />}
          label="Conversion Rate"
          value={`${convRate}%`}
          sub="profile views → contact"
          delta={convRate > 8 ? 5 : -3}
          color="#f59e0b"
        />
        <MetricCard
          icon={<Search size={18} />}
          label="Search Appearances"
          value={searchAppear.toLocaleString()}
          sub="times shown in results"
          color="#64748b"
          sparkData={trend30.slice(-14).map(v => Math.round(v * 4.2))}
        />
        <MetricCard
          icon={<Star size={18} />}
          label="Avg Rating"
          value="—"
          sub="from client reviews"
          color="#f59e0b"
        />
      </div>

      {/* ── 30-day trend ── */}
      <div className="dashboard-section" style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 500, fontFamily: "'Playfair Display', serif", color: 'var(--color-white)', margin: 0 }}>Profile Views — Last 30 Days</h3>
            <p style={{ fontSize: 12, color: 'var(--color-gray-500)', margin: '4px 0 0' }}>Daily visitor trend on your profile page</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: '#3b82f6' }} />
            <span style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>Views/day</span>
          </div>
        </div>
        <BarChart data={trend30} color="#3b82f6" />
      </div>

      {/* ── Leads by source + insights ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>

        {/* Source donut */}
        <div className="dashboard-section" style={{ padding: '24px 20px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, fontFamily: "'Playfair Display', serif", color: 'var(--color-white)', marginBottom: 4 }}>Leads by Source</h3>
          <p style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 20 }}>Where your contacts come from</p>
          <DonutChart sources={sources} />
        </div>

        {/* Insights */}
        <div className="dashboard-section" style={{ padding: '24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Lightbulb size={16} style={{ color: '#f59e0b' }} />
            <h3 style={{ fontSize: 15, fontWeight: 500, fontFamily: "'Playfair Display', serif", color: 'var(--color-white)', margin: 0 }}>AI Growth Insights</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
          </div>
        </div>
      </div>

      {/* ── 7-day WA trend ── */}
      <div className="dashboard-section" style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 500, fontFamily: "'Playfair Display', serif", color: 'var(--color-white)', margin: 0 }}>WhatsApp Activity</h3>
            <p style={{ fontSize: 12, color: 'var(--color-gray-500)', margin: '4px 0 0' }}>Daily WA button clicks from your profile</p>
          </div>
          <span style={{ fontSize: 22, fontWeight: 500, fontFamily: "'Playfair Display', serif", color: '#25d366' }}>{waClicks} <span style={{ fontSize: 12, fontWeight: 500, fontFamily: "var(--font-primary)", color: 'var(--color-gray-400)' }}>this month</span></span>
        </div>
        <SparkLine
          data={Array.from({ length: 30 }, (_, i) => Math.max(0, Math.round(Math.sin(i * 0.7 + 2) * 2 + waClicks / 30 * 1.5)))}
          color="#25d366"
          height={72}
        />
      </div>

    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [proLeads, setProLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [verificationStatus, setVerificationStatus] = useState(
    user?.user_metadata?.verificationStatus || 'unverified'
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [waSettings, setWaSettings] = useState({ phone: '', enabled: true });
  const [waPhone, setWaPhone] = useState('');
  const [waEnabled, setWaEnabled] = useState(true);
  const [waSaving, setWaSaving] = useState(false);
  const [waSaved, setWaSaved] = useState(false);
  const [waPhoneError, setWaPhoneError] = useState('');
  const [waClicksMonth, setWaClicksMonth] = useState(0);
  const [waClicksTotal, setWaClicksTotal] = useState(0);

  // Plan — in mock we give 'pro' so analytics are visible; real users stored in metadata
  const plan = user?.user_metadata?.plan || 'pro'; // default pro for demo
  const isPro = plan === 'pro' || plan === 'elite';

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      await authService.updateUserMetadata({ verificationStatus: 'pending' });
      setVerificationStatus('pending');
      setShowVerifyModal(false);
    } catch (err) { console.error(err); }
    finally { setIsVerifying(false); }
  };

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const leads = await dbService.getLeadsForProfessional(user.id);
        setProLeads(leads || []);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }

      const saved = loadWaSettings(user.id);
      setWaSettings(saved);
      setWaPhone(saved.phone || '');
      setWaEnabled(saved.enabled !== false);
      setWaClicksMonth(getWhatsAppClicksThisMonth(user.id));
      setWaClicksTotal(getWhatsAppClicksTotal(user.id));
    }
    load();
  }, [user]);

  const handleLogout = async (e) => {
    e.preventDefault();
    await authService.signOut();
    navigate('/login');
  };

  const handleSaveWaSettings = async () => {
    setWaPhoneError('');
    const clean = waPhone.replace(/\D/g, '');
    if (waEnabled && clean.length < 10) {
      setWaPhoneError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setWaSaving(true);
    const settings = { phone: waPhone, enabled: waEnabled };
    saveWaSettings(user.id, settings);
    setWaSettings(settings);
    await new Promise(r => setTimeout(r, 600));
    setWaSaving(false);
    setWaSaved(true);
    setTimeout(() => setWaSaved(false), 3000);
  };

  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Professional';
  const email    = user?.email || 'pro@example.com';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials  = fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'P';

  const renderContent = () => {
    switch (activeTab) {

      // ── OVERVIEW ──────────────────────────────────────────────────────
      case 'overview':
        return (
          <>
            {verificationStatus === 'unverified' && (
              <div className="dashboard-section animate-fade-in" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <h3 style={{ color: 'var(--color-white)' }}>Level up your profile</h3>
                  <p style={{ color: 'var(--color-gray-400)', marginTop: 4 }}>Verified professionals get 3× more bookings.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowVerifyModal(true)}>Submit Documents</button>
              </div>
            )}
            {verificationStatus === 'pending' && (
              <div className="dashboard-section animate-fade-in" style={{ background: 'rgba(217, 119, 6, 0.1)', borderColor: 'rgba(217, 119, 6, 0.2)', marginBottom: 'var(--space-6)', padding: 'var(--space-6)' }}>
                <h3 style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={20} /> Verification Under Review</h3>
                <p style={{ color: 'var(--color-gray-300)', marginTop: 4 }}>Our trust team is reviewing your documents. You'll be notified within 24-48 hours.</p>
              </div>
            )}
            {verificationStatus === 'verified' && (
              <div className="dashboard-section animate-fade-in" style={{ background: 'rgba(5, 150, 105, 0.1)', borderColor: 'rgba(5, 150, 105, 0.2)', marginBottom: 'var(--space-6)', padding: 'var(--space-6)' }}>
                <h3 style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={20} /> Wisor Verified</h3>
                <p style={{ color: 'var(--color-gray-300)', marginTop: 4 }}>You rank higher in search results and have the trust badge on your profile.</p>
              </div>
            )}

            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}><BarChart3 size={24} /></div>
                <div className="stat-info"><h4>Profile Views</h4><div className="stat-value">—</div></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-white)' }}><UserCheck size={24} /></div>
                <div className="stat-info"><h4>Platform Inquiries</h4><div className="stat-value">{proLeads.length}</div></div>
              </div>
              <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                <div className="stat-icon" style={{ background: 'rgba(37,211,102,0.10)', color: '#25d366' }}><WaIcon size={24} /></div>
                <div className="stat-info">
                  <h4>WhatsApp Leads</h4>
                  <div className="stat-value" style={{ color: '#25d366' }}>{waClicksMonth}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 2 }}>this month · {waClicksTotal} total</div>
                </div>
                {!waSettings.phone && (
                  <button className="btn btn-sm" style={{ marginLeft: 'auto', background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.25)', fontSize: 12, fontWeight: 600 }} onClick={() => setActiveTab('settings')}>
                    Setup WhatsApp
                  </button>
                )}
              </div>
            </div>

            {/* Quick analytics preview → full view CTA */}
            <div className="dashboard-section animate-fade-in" style={{ background: 'linear-gradient(135deg,rgba(122,154,110,0.06),rgba(122,154,110,0.02))', borderColor: 'rgba(122,154,110,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><BarChart3 size={18} style={{ color: '#7A9A6E' }} /> ROI Analytics</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>See profile trends, lead sources, and AI growth insights.</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('analytics')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#92B284,#7A9A6E)', color: '#1A1A1A', border: 'none', fontWeight: 700 }}>
                  View Analytics <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="dashboard-section animate-fade-in">
              <div className="dashboard-section-header">
                <h3>Recent Leads</h3>
                <button className="btn btn-primary btn-sm" onClick={async () => { setIsLoading(true); try { const leads = await dbService.getLeadsForProfessional(user.id); setProLeads(leads || []); } catch(e) { console.error(e); } finally { setIsLoading(false); } }}>Refresh</button>
              </div>
              {isLoading ? (
                <div className="empty-state"><p>Loading your leads...</p></div>
              ) : proLeads.length > 0 ? (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead><tr><th>ID</th><th>Client</th><th>Service</th><th>Budget</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {proLeads.map(lead => (
                        <tr key={lead.id}>
                          <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>{lead.id}</td>
                          <td style={{ fontWeight: 600 }}>{lead.client}</td>
                          <td>{lead.service}</td>
                          <td>{lead.budget}</td>
                          <td><span className={`table-status status-${lead.status === 'New' ? 'upcoming' : 'completed'}`}>{lead.status}</span></td>
                          <td><button className="btn btn-primary btn-sm">Respond</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}><UserCheck size={28} /></div>
                  <h3 style={{ marginTop: 'var(--space-4)' }}>No new leads</h3>
                  <p>When clients request your services, their details will appear here.</p>
                </div>
              )}
            </div>
          </>
        );

      // ── ANALYTICS ─────────────────────────────────────────────────────
      case 'analytics':
        return <AnalyticsTab userId={user?.id} isPro={isPro} navigate={navigate} />;

      // ── PROFILE ───────────────────────────────────────────────────────
      case 'profile':
        return (
          <div className="dashboard-section animate-fade-in">
            <div className="dashboard-section-header">
              <h3>Edit Profile</h3>
              <button className="btn btn-primary btn-sm">Save Changes</button>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Full Name</label>
                <div className="form-input"><input type="text" defaultValue={fullName} /></div>
              </div>
              <div className="form-field">
                <label>Professional Category</label>
                <div className="form-input">
                  <select style={{ width: '100%', border: 'none', background: 'transparent' }} defaultValue="CA">
                    <option value="CA">Chartered Accountant (CA)</option>
                    <option value="CMA">Cost & Mgt Accountant (CMA)</option>
                  </select>
                </div>
              </div>
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Short Bio</label>
                <div className="form-input" style={{ alignItems: 'flex-start' }}>
                  <textarea rows="3" style={{ width: '100%', border: 'none', background: 'transparent', resize: 'vertical' }} defaultValue="" placeholder="Tell clients about your expertise..." />
                </div>
              </div>
              <div className="form-field">
                <label>Experience (Years)</label>
                <div className="form-input"><input type="number" defaultValue="0" /></div>
              </div>
              <div className="form-field">
                <label>City</label>
                <div className="form-input"><input type="text" defaultValue="" placeholder="e.g. Mumbai" /></div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary">Save Profile</button>
            </div>
          </div>
        );

      // ── SETTINGS ──────────────────────────────────────────────────────
      case 'settings':
        return (
          <div className="dashboard-section animate-fade-in">
            <div className="dashboard-section-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><WaIcon size={20} /> WhatsApp Lead Settings</h3>
            </div>
            <div style={{ background: 'rgba(37,211,102,0.07)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 12 }}>
              <WaIcon size={18} />
              <div>
                <p style={{ fontWeight: 700, color: '#16a34a', fontSize: 14, marginBottom: 4 }}>WhatsApp Leads — Pro Feature</p>
                <p style={{ fontSize: 13, color: 'var(--color-gray-600)', lineHeight: 1.6 }}>When your number is set and leads are enabled, a WhatsApp button appears on your search card, profile, and portfolio. Clients tap once and message you directly.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, marginBottom: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-white)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageCircle size={16} style={{ color: '#25d366' }} /> Enable WhatsApp Leads
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-gray-400)', marginTop: 3 }}>Show WhatsApp button to clients</div>
              </div>
              <button onClick={() => setWaEnabled(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {waEnabled ? <ToggleRight size={36} style={{ color: '#25d366' }} /> : <ToggleLeft size={36} style={{ color: 'var(--color-gray-300)' }} />}
              </button>
            </div>
            <div className="form-field" style={{ marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} /> WhatsApp Number</label>
              <div className={`form-input${waPhoneError ? ' form-input-error' : ''}`} style={{ opacity: waEnabled ? 1 : 0.5 }}>
                <span style={{ fontSize: 14, color: 'var(--color-gray-400)', fontWeight: 500, paddingRight: 4 }}>+91</span>
                <input type="tel" value={waPhone} onChange={e => { setWaPhone(e.target.value); setWaPhoneError(''); }} placeholder="98765 43210" maxLength={10} disabled={!waEnabled} />
              </div>
              {waPhoneError && <span className="error-text" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 12, color: 'var(--color-danger)' }}><AlertCircle size={13} /> {waPhoneError}</span>}
              <p style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 6 }}>Clients will see: <em>"Hi, I found your profile on Wisor Mumbai and need help with [service]."</em></p>
            </div>
            <div className="form-actions">
              {waSaved && <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>✓ Settings saved</span>}
              <button className="btn btn-primary" onClick={handleSaveWaSettings} disabled={waSaving} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
                {waSaving ? <><Loader2 size={15} className="spin" /> Saving...</> : <><Save size={15} /> Save Settings</>}
              </button>
            </div>
            <div style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 style={{ fontWeight: 500, fontFamily: "'Playfair Display', serif", color: 'var(--color-white)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={16} /> WhatsApp Analytics</h4>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 160px', background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.16)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 500, fontFamily: "'Playfair Display', serif", color: '#25d366', lineHeight: 1 }}>{waClicksMonth}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 6, fontWeight: 500 }}>Clicks This Month</div>
                </div>
                <div style={{ flex: '1 1 160px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 500, fontFamily: "'Playfair Display', serif", color: 'var(--color-white)', lineHeight: 1 }}>{waClicksTotal}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 6, fontWeight: 500 }}>Total All-Time</div>
                </div>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <main className="dashboard-page">
      <div className="container dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="sidebar-user">
            {avatarUrl
              ? <img src={avatarUrl} alt="Avatar" className="sidebar-avatar" style={{ objectFit: 'cover' }} />
              : <div className="sidebar-avatar">{initials}</div>}
            <div className="sidebar-user-info">
              <h3>{fullName}</h3>
              <p>{email}</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <UserCheck size={18} /> Overview
            </div>
            <div className={`sidebar-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')} style={{ position: 'relative' }}>
              <BarChart3 size={18} /> Analytics
              {isPro
                ? <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: '#7A9A6E', color: '#1A1A1A', borderRadius: 4, padding: '1px 6px' }}>PRO</span>
                : <Lock size={12} style={{ marginLeft: 'auto', color: '#94a3b8' }} />}
            </div>
            <Link to="/ai-portfolio" className="sidebar-nav-item" style={{ color: 'var(--color-accent)' }}>
              <LayoutTemplate size={18} /> AI Portfolio
            </Link>
            <div className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} style={{ position: 'relative' }}>
              <Settings size={18} /> Settings
              {waSettings.phone && waSettings.enabled !== false && (
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 7, height: 7, borderRadius: '50%', background: '#25d366' }} />
              )}
            </div>
            <div style={{ margin: 'var(--space-4) 0', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
            <a href="#" className="sidebar-nav-item" style={{ color: 'var(--color-danger)' }} onClick={handleLogout}>
              <LogOut size={18} /> Log Out
            </a>
          </nav>
        </aside>

        <section className="dashboard-content">
          <div className="dashboard-content-header">
            <h1>
              {activeTab === 'analytics' ? 'ROI Analytics' :
               activeTab === 'settings'  ? 'Settings' :
               activeTab === 'profile'   ? 'Edit Profile' :
               'Professional Dashboard'}
            </h1>
            <p>
              {activeTab === 'analytics'
                ? 'Your profile performance, lead sources, and AI growth insights.'
                : `Welcome back, ${fullName}. Here's what's happening today.`}
            </p>
          </div>
          {renderContent()}
        </section>
      </div>

      {/* Verify modal */}
      {showVerifyModal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowVerifyModal(false)}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Get Verified</h3>
              <button className="modal-close" onClick={() => setShowVerifyModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body" style={{ padding: 'var(--space-6)' }}>
              <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-6)' }}>Submit your identity and professional credentials to receive the 'Verified' badge on Wisor.</p>
              <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {['Government ID (Aadhar/PAN)', 'Professional Certificate (ICAI/ICMAI)'].map((label, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600 }}>{label}</label>
                    <label style={{ border: '2px dashed var(--color-gray-300)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer', background: 'var(--color-gray-50)' }}>
                      <UploadCloud size={32} style={{ color: 'var(--color-gray-400)', margin: '0 auto var(--space-2)' }} />
                      <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 500 }}>Browse Files</span>
                      <input type="file" style={{ display: 'none' }} required />
                    </label>
                  </div>
                ))}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-4)', padding: 'var(--space-3)' }} disabled={isVerifying}>
                  {isVerifying ? <><Loader2 size={16} className="spin" /> Submitting...</> : 'Submit for Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
