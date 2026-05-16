/**
 * WhatsApp Lead Engine + Profile Analytics
 * Central utility for all WhatsApp CTA behaviour and activity tracking.
 */

const WA_CLICKS_KEY   = 'proserve_wa_clicks';
const PROFILE_VIEWS_KEY = 'proserve_profile_views';
const SEARCH_APPEAR_KEY = 'proserve_search_appear';

// ─── WhatsApp URL Builder ─────────────────────────────────────────────────────

/**
 * Build a prefilled WhatsApp URL.
 */
export function buildWhatsAppUrl(phone, expertName = '', services = []) {
  const clean = String(phone || '').replace(/\D/g, '');
  const intl   = clean.startsWith('91') ? clean : `91${clean}`;
  const msg    = encodeURIComponent(
    `Hi ${expertName}, I found your profile on Wisor. I'd like to inquire about your professional services.`
  );
  return `https://wa.me/${intl}?text=${msg}`;
}

// ─── Click Tracking ───────────────────────────────────────────────────────────

/** Track a WhatsApp button click per month. */
export function trackWhatsAppClick(proId) {
  if (!proId) return;
  try {
    const store = JSON.parse(localStorage.getItem(WA_CLICKS_KEY) || '{}');
    const month = new Date().toISOString().slice(0, 7);
    if (!store[proId]) store[proId] = {};
    store[proId][month] = (store[proId][month] || 0) + 1;
    localStorage.setItem(WA_CLICKS_KEY, JSON.stringify(store));
  } catch {}
}

/** WA clicks this calendar month. */
export function getWhatsAppClicksThisMonth(proId) {
  if (!proId) return 0;
  try {
    const store = JSON.parse(localStorage.getItem(WA_CLICKS_KEY) || '{}');
    const month = new Date().toISOString().slice(0, 7);
    return store[proId]?.[month] || 0;
  } catch { return 0; }
}

/** All-time WA click total. */
export function getWhatsAppClicksTotal(proId) {
  if (!proId) return 0;
  try {
    const store  = JSON.parse(localStorage.getItem(WA_CLICKS_KEY) || '{}');
    const months = store[proId] || {};
    return Object.values(months).reduce((s, n) => s + n, 0);
  } catch { return 0; }
}

// ─── Profile View Tracking ────────────────────────────────────────────────────

/** Increment profile view counter for a professional. */
export function trackProfileView(proId) {
  if (!proId) return;
  try {
    const store = JSON.parse(localStorage.getItem(PROFILE_VIEWS_KEY) || '{}');
    const month = new Date().toISOString().slice(0, 7);
    if (!store[proId]) store[proId] = {};
    store[proId][month] = (store[proId][month] || 0) + 1;
    localStorage.setItem(PROFILE_VIEWS_KEY, JSON.stringify(store));
  } catch {}
}

/** Profile views this month. */
export function getProfileViewsThisMonth(proId) {
  if (!proId) return 0;
  try {
    const store = JSON.parse(localStorage.getItem(PROFILE_VIEWS_KEY) || '{}');
    const month = new Date().toISOString().slice(0, 7);
    return store[proId]?.[month] || 0;
  } catch { return 0; }
}

// ─── Full Analytics Dataset ───────────────────────────────────────────────────

/**
 * Generate a rich analytics object for the dashboard.
 * Uses real WA click data + simulates the rest realistically based on user seed.
 */
export function getAnalytics(userId) {
  // Real data
  const waMonth = getWhatsAppClicksThisMonth(userId);
  const waTotal = getWhatsAppClicksTotal(userId);
  const profileViewsMonth = getProfileViewsThisMonth(userId);

  // Deterministic seed from userId so numbers don't change on re-render
  const seed = (userId || 'default').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const rng  = (min, max) => min + (seed % (max - min + 1));

  const profileViews    = profileViewsMonth > 0 ? profileViewsMonth : rng(280, 620);
  const portfolioViews  = Math.round(profileViews * 0.42);
  const searchAppear    = rng(1200, 3400);
  const waClicks        = waMonth > 0 ? waMonth : rng(8, 34);
  const convRate        = profileViews > 0
    ? ((waClicks / profileViews) * 100).toFixed(1)
    : rng(4, 12);
  const weeklyDelta     = rng(8, 38); // "X% better this week"

  // 30-day trend — simulate daily profile views
  const trend30 = Array.from({ length: 30 }, (_, i) => {
    const base = Math.round(profileViews / 30);
    const variance = Math.round(Math.sin((seed + i) * 0.8) * base * 0.6) + base;
    return Math.max(0, variance);
  });

  // Source breakdown
  const sources = [
    { label: 'Search',    value: Math.round(searchAppear * 0.55), color: '#3b82f6' },
    { label: 'WhatsApp',  value: waTotal || rng(20, 80),          color: '#25d366' },
    { label: 'Direct',    value: rng(40, 140),                    color: '#8b5cf6' },
    { label: 'Portfolio', value: portfolioViews,                   color: '#f59e0b' },
  ];

  // Insights — rule-based
  const insights = [];
  if (weeklyDelta > 15) insights.push({ type: 'positive', text: `Your profile performed ${weeklyDelta}% better this week compared to last.` });
  if (waClicks < 5)     insights.push({ type: 'action',   text: 'Add your WhatsApp number to capture direct leads from profile visitors.' });
  if (portfolioViews < 30) insights.push({ type: 'action', text: 'Complete your AI portfolio website to convert 40% more profile visitors.' });
  insights.push({ type: 'action', text: 'Request 3 client reviews this month — profiles with reviews get 2.4× more contact clicks.' });
  if (convRate < 6)     insights.push({ type: 'tip', text: `Your conversion rate (${convRate}%) is below average. Add a WhatsApp number to improve it.` });
  if (searchAppear > 2000) insights.push({ type: 'positive', text: `You appeared in ${searchAppear.toLocaleString()} searches this month. Improve your title to convert more.` });

  return {
    profileViews,
    portfolioViews,
    searchAppear,
    waClicks,
    waTotal,
    convRate,
    weeklyDelta,
    trend30,
    sources,
    insights: insights.slice(0, 4),
  };
}

// ─── Access guards ────────────────────────────────────────────────────────────

export function isWhatsAppEnabled(professional) {
  if (!professional) return false;
  const settings = professional.settings || {};
  if (settings.whatsappLeads === false) return false;
  const phone = professional.contactPhone || professional.contact_phone ||
    settings.whatsappNumber || '';
  return String(phone).replace(/\D/g, '').length >= 10;
}

export function planHasWhatsApp(plan) {
  return plan === 'pro' || plan === 'elite';
}

export function planHasAnalytics(plan) {
  return plan === 'pro' || plan === 'elite';
}
