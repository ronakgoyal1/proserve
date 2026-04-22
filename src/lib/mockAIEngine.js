/**
 * Upgraded AI Portfolio Engine
 * Generates rich, niche-specific, non-generic portfolio content
 */

// ─── Persona Intelligence ─────────────────────────────────────────────────────

const PERSONA_MAP = {
  ca: {
    heroStatement: (name, clients, city) =>
      `${name} helps ${clients || 'businesses'} in ${city || 'India'} cut tax bills, stay 100% compliant, and scale — without the financial stress.`,
    tagline: (services) => {
      const top = services[0] || 'Tax Planning';
      return `Precision ${top} · Zero Surprises · Full Compliance`;
    },
    whoIHelp: [
      { icon: '🚀', title: 'Startup Founders', desc: 'Pre-Series A founders who need tax structure, compliance, and investor-ready financials — fast.' },
      { icon: '🏢', title: 'SME Owners', desc: 'Growing businesses with complex GST, payroll and audit requirements needing an experienced hand.' },
      { icon: '👨‍💻', title: 'Freelancers & Creators', desc: 'High-income freelancers and digital professionals who are overpaying taxes without realising it.' },
      { icon: '🌏', title: 'NRIs & Expats', desc: 'Non-residents navigating dual taxation, FEMA regulations, and Indian portfolio management.' },
    ],
    problemsSolved: [
      { pain: 'Missed ITR deadlines causing penalties', fix: 'Proactive compliance calendar and deadline management' },
      { pain: 'GST errors triggering notices', fix: 'Accurate return filing with pre-submission reconciliation' },
      { pain: 'Overpaying taxes due to poor structuring', fix: 'Legal tax planning to minimise liability across all income types' },
      { pain: 'Audit anxiety and documentation gaps', fix: 'Audit readiness review and systematic documentation support' },
    ],
    results: [
      { metric: '₹40L+', label: 'Tax Saved for Clients', sub: 'via structured planning' },
      { metric: '100%', label: 'On-Time Filing Rate', sub: 'zero missed deadlines' },
      { metric: '0', label: 'Penalty Notices', sub: 'for managed clients in last 3 years' },
    ],
    ctaHeadline: 'Stop overpaying. Start planning.',
    ctaBody: 'One consultation can uncover savings you didn\'t know existed.',
  },
  cma: {
    heroStatement: (name, clients, city) =>
      `${name} helps ${clients || 'manufacturers and businesses'} in ${city || 'India'} slash costs, improve margins, and make faster decisions with accurate management data.`,
    tagline: (services) => {
      return `Cost Intelligence · Margin Optimisation · Decision Ready`;
    },
    whoIHelp: [
      { icon: '🏭', title: 'Manufacturers', desc: 'Production units battling rising input costs, shrinking margins, and outdated costing systems.' },
      { icon: '📦', title: 'Distribution Businesses', desc: 'Traders and distributors needing product-wise profitability and inventory cost clarity.' },
      { icon: '🏗️', title: 'Project Contractors', desc: 'Contractors who need accurate project costing, billing milestones, and WIP tracking.' },
      { icon: '📊', title: 'CFOs & Finance Heads', desc: 'Senior finance leaders who need reliable MIS and variance analysis to report upward with confidence.' },
    ],
    problemsSolved: [
      { pain: 'No clarity on which products are profitable', fix: 'Product-wise P&L and contribution margin analysis' },
      { pain: 'Budget overruns with no early warning', fix: 'Rolling budgets with variance alerts and reforecast cycles' },
      { pain: 'Management decisions made on gut, not data', fix: 'Real-time MIS dashboards connecting ops to finance' },
      { pain: 'Costing systems built on spreadsheet guesswork', fix: 'Standard costing with activity-based allocation' },
    ],
    results: [
      { metric: '18%', label: 'Average Cost Reduction', sub: 'for manufacturing clients' },
      { metric: '3×', label: 'Faster Close Cycles', sub: 'with structured MIS' },
      { metric: '₹2Cr+', label: 'Cost Identified', sub: 'as misspent or duplicated' },
    ],
    ctaHeadline: 'Your margins deserve better data.',
    ctaBody: 'Book a cost diagnostic call and see where the money is actually going.',
  },
  consultant: {
    heroStatement: (name, clients, city) =>
      `${name} partners with ${clients || 'founders and leaders'} to turn business complexity into strategic clarity — and strategy into measurable results.`,
    tagline: () => `Strategic Clarity · Execution Focus · Measurable ROI`,
    whoIHelp: [
      { icon: '🧑‍💼', title: 'Growth-Stage Founders', desc: 'Founders who have product-market fit but need the financial and operational structure to scale safely.' },
      { icon: '🏦', title: 'Investors & HNIs', desc: 'High-net-worth individuals and family offices needing structured advisory across asset classes.' },
      { icon: '🤝', title: 'Corporate Leaders', desc: 'C-suite executives navigating restructuring, M&A readiness, or entering new markets.' },
      { icon: '🌐', title: 'International Businesses', desc: 'Foreign companies entering India who need a trusted local advisory partner from day one.' },
    ],
    problemsSolved: [
      { pain: 'Strategy documents that sit in folders', fix: 'Action-oriented plans with weekly accountability checkpoints' },
      { pain: 'Financial models that don\'t reflect reality', fix: 'Dynamic, scenario-based models tied to actual operations' },
      { pain: 'No structured approach to fundraising', fix: 'Investor narrative, cap table modelling, and pitch support' },
      { pain: 'Scaling without the right financial guardrails', fix: 'Unit economics review and runway optimisation' },
    ],
    results: [
      { metric: '₹50Cr+', label: 'Capital Advised', sub: 'across funding rounds' },
      { metric: '40+', label: 'Business Transformations', sub: 'in last 5 years' },
      { metric: '92%', label: 'Client Retention', sub: 'return for ongoing advisory' },
    ],
    ctaHeadline: 'Clarity is the first step to growth.',
    ctaBody: 'Let\'s map your biggest obstacle and build the plan around it.',
  },
  default: {
    heroStatement: (name, clients, city) =>
      `${name} delivers expert financial and compliance services to ${clients || 'businesses'} across ${city || 'India'} — with speed, accuracy, and complete accountability.`,
    tagline: () => `Expert Advice · Full Accountability · Real Results`,
    whoIHelp: [
      { icon: '🏢', title: 'Business Owners', desc: 'Entrepreneurs who need reliable professional support to stay compliant and financially healthy.' },
      { icon: '👩‍💼', title: 'Professionals', desc: 'Salaried individuals and high-income professionals optimising their tax and wealth planning.' },
      { icon: '🚀', title: 'Startups', desc: 'Early-stage ventures needing financial structure from day one.' },
      { icon: '🌱', title: 'Growing Companies', desc: 'Mid-size businesses ready to professionalise their finance function.' },
    ],
    problemsSolved: [
      { pain: 'Compliance requirements feeling overwhelming', fix: 'Structured compliance calendar with proactive management' },
      { pain: 'No clear picture of financial health', fix: 'Regular reporting and financial clarity reviews' },
      { pain: 'Missed opportunities due to poor planning', fix: 'Forward-looking advisory that spots opportunities early' },
      { pain: 'Wasted time on financial admin', fix: 'Efficient systems that free you to focus on the business' },
    ],
    results: [
      { metric: '200+', label: 'Clients Served', sub: 'across industries' },
      { metric: '100%', label: 'Compliance Rate', sub: 'no penalties for managed clients' },
      { metric: '5★', label: 'Average Rating', sub: 'consistently rated top professional' },
    ],
    ctaHeadline: 'Let\'s work together.',
    ctaBody: 'Book a consultation and get a clear plan for your financial challenges.',
  },
};

function getPersona(profession = '') {
  const prof = profession.toLowerCase();
  if (prof.includes('ca') || prof.includes('chartered') || prof.includes('accountant') || prof.includes('tax') || prof.includes('gst') || prof.includes('audit')) return PERSONA_MAP.ca;
  if (prof.includes('cma') || prof.includes('cost') || prof.includes('management accountant') || prof.includes('mis')) return PERSONA_MAP.cma;
  if (prof.includes('consult') || prof.includes('advisor') || prof.includes('strategy') || prof.includes('coach')) return PERSONA_MAP.consultant;
  return PERSONA_MAP.default;
}

// ─── Layout Assignment ────────────────────────────────────────────────────────
// 0 = Authority (dark, left-split hero)
// 1 = Specialist (light, full-width hero, asymmetric)
// 2 = Trusted Advisor (minimal luxury, centered everything)

function assignLayout(name, profession = '') {
  const prof = profession.toLowerCase();
  const hash = (name + profession).split('').reduce((h, c) => h + c.charCodeAt(0), 0);
  if (prof.includes('cma') || prof.includes('cost')) return 1;
  if (prof.includes('consult') || prof.includes('advisor') || prof.includes('coach')) return 2;
  return hash % 3;
}

// ─── Service Intelligence ─────────────────────────────────────────────────────

const SERVICE_DEEP = {
  'itr filing': {
    icon: '📋', tagline: 'Error-free, maximally optimised',
    problem: 'Most people overpay taxes simply because they don\'t know what to claim.',
    solution: 'I audit every deduction, ensure accurate filing, and identify refunds you\'re owed.',
  },
  'gst': {
    icon: '🏛️', tagline: 'Accurate, reconciled, zero-notice',
    problem: 'GST mismatches in GSTR-2A/2B are causing notices for thousands of businesses.',
    solution: 'I reconcile every transaction before filing — so your credit claims are airtight.',
  },
  'audit': {
    icon: '🔍', tagline: 'Rigorous, documented, stress-free',
    problem: 'Audits feel stressful because documentation is always incomplete or scattered.',
    solution: 'I build audit trails throughout the year so that audit season is just a formality.',
  },
  'company registration': {
    icon: '🏢', tagline: 'Structured right, from day one',
    problem: 'Founders choose the wrong structure and pay the price for years in avoidable taxes.',
    solution: 'I analyse your goals upfront and structure your entity for optimal tax efficiency.',
  },
  'cost analysis': {
    icon: '📉', tagline: 'Find the hidden leaks',
    problem: 'Most businesses don\'t know their true cost per product, service, or customer.',
    solution: 'I map your actual cost flows and surface the profitability you\'re missing.',
  },
  'budget': {
    icon: '🎯', tagline: 'Plans that survive reality',
    problem: 'Budgets get abandoned by Q2 because they\'re built on assumptions, not data.',
    solution: 'I build rolling, driver-based budgets that flex with your business reality.',
  },
  'tax planning': {
    icon: '🧮', tagline: 'Legal, strategic, significant',
    problem: 'Tax planning done in March is too late — opportunities close throughout the year.',
    solution: 'I plan year-round to legally minimise your liability across every income stream.',
  },
  'financial consulting': {
    icon: '💡', tagline: 'Strategy that moves the numbers',
    problem: 'Generic financial advice doesn\'t account for your specific business model.',
    solution: 'I tailor financial strategy to your actual stage, sector, and growth objective.',
  },
  'mis': {
    icon: '📊', tagline: 'Decisions need data, not gut',
    problem: 'Management reports arrive late, are hard to read, or don\'t answer the right questions.',
    solution: 'I design MIS that\'s weekly, visual, and built around the decisions you actually make.',
  },
  'startup advisory': {
    icon: '🚀', tagline: 'Built for the chaotic early days',
    problem: 'Startups burn runway on preventable compliance mistakes and poor financial structure.',
    solution: 'I set up the financial foundation from day one — so you scale on solid ground.',
  },
  'nri taxation': {
    icon: '🌏', tagline: 'Two countries, one expert',
    problem: 'NRI tax obligations span FEMA, DTAA, and Indian income — most advisors handle only one.',
    solution: 'I provide end-to-end NRI tax compliance — from DTAA optimisation to repatriation.',
  },
};

function enrichService(svc) {
  const key = svc.toLowerCase().replace(/^(strategic|advanced|comprehensive|optimized|precision)\s+/i, '');
  for (const [k, v] of Object.entries(SERVICE_DEEP)) {
    if (key.includes(k) || k.includes(key.split(' ')[0])) {
      return { ...v, name: svc };
    }
  }
  return {
    icon: '⚡',
    tagline: 'Delivered with precision',
    problem: 'Generic advisory misses the nuances of your specific situation.',
    solution: 'I bring deep expertise and accountability to every engagement.',
    name: svc,
  };
}

// ─── Theme Map ────────────────────────────────────────────────────────────────

const THEME_MAP = {
  ca: {
    heroBg: '#020617',
    accent: '#C5A059',
    accentLight: '#DBC086',
    accentRgb: '197,160,89',
    pill: 'rgba(197,160,89,0.15)',
    pillText: '#DBC086',
    btnBg: 'linear-gradient(135deg,#DBC086,#C5A059)',
    btnColor: '#020617',
    glow1: 'rgba(197,160,89,0.18)',
    glow2: 'rgba(14,165,233,0.10)',
    sectionAlt: '#fafaf7',
    nameGrad: 'linear-gradient(to right,#fff 30%,#DBC086 100%)',
  },
  cma: {
    heroBg: '#042f2e',
    accent: '#10b981',
    accentLight: '#6ee7b7',
    accentRgb: '16,185,129',
    pill: 'rgba(16,185,129,0.15)',
    pillText: '#6ee7b7',
    btnBg: 'linear-gradient(135deg,#10b981,#059669)',
    btnColor: '#ffffff',
    glow1: 'rgba(16,185,129,0.18)',
    glow2: 'rgba(5,150,105,0.1)',
    sectionAlt: '#f0fdf7',
    nameGrad: 'linear-gradient(to right,#fff 30%,#6ee7b7 100%)',
  },
  consultant: {
    heroBg: '#0d0520',
    accent: '#8b5cf6',
    accentLight: '#c4b5fd',
    accentRgb: '139,92,246',
    pill: 'rgba(139,92,246,0.15)',
    pillText: '#c4b5fd',
    btnBg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    btnColor: '#ffffff',
    glow1: 'rgba(139,92,246,0.2)',
    glow2: 'rgba(236,72,153,0.1)',
    sectionAlt: '#faf5ff',
    nameGrad: 'linear-gradient(to right,#fff 30%,#c4b5fd 100%)',
  },
  default: {
    heroBg: '#0f2044',
    accent: '#3b82f6',
    accentLight: '#93c5fd',
    accentRgb: '59,130,246',
    pill: 'rgba(59,130,246,0.15)',
    pillText: '#93c5fd',
    btnBg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    btnColor: '#ffffff',
    glow1: 'rgba(59,130,246,0.18)',
    glow2: 'rgba(16,185,129,0.10)',
    sectionAlt: '#f0f7ff',
    nameGrad: 'linear-gradient(to right,#fff 30%,#93c5fd 100%)',
  },
};

function getTheme(profession = '') {
  const prof = profession.toLowerCase();
  if (prof.includes('ca') || prof.includes('chartered') || prof.includes('tax') || prof.includes('audit')) return THEME_MAP.ca;
  if (prof.includes('cma') || prof.includes('cost') || prof.includes('management')) return THEME_MAP.cma;
  if (prof.includes('consult') || prof.includes('advisor') || prof.includes('coach') || prof.includes('strategy')) return THEME_MAP.consultant;
  return THEME_MAP.default;
}

// ─── FAQ Templates (richer) ───────────────────────────────────────────────────

const FAQ_MAP = {
  ca: [
    { q: 'How quickly can you file my ITR?', a: 'For most individuals, within 2–3 business days of receiving all documents. Business ITRs with audit requirement typically take 1–2 weeks.' },
    { q: 'Can you help if I have received a tax notice?', a: 'Yes. I handle notice response, assessment proceedings, and representation before the Income Tax Department. Early intervention usually leads to the best outcomes.' },
    { q: 'Do you work with clients outside your city?', a: 'Absolutely. 80%+ of my client work is remote — all filings, reviews, and meetings are handled digitally with the same quality you\'d expect in-person.' },
    { q: 'What\'s different about your approach to GST?', a: 'I reconcile your GSTR-2A/2B before every filing cycle, which eliminates mismatches that trigger notices. Most practitioners skip this step.' },
  ],
  cma: [
    { q: 'How long does a cost audit take?', a: 'A standard cost audit for a manufacturing unit typically takes 3–4 weeks, including data collection, field visits if needed, and the final report.' },
    { q: 'Can you build MIS dashboards for our management team?', a: 'Yes. I design monthly MIS in a format that\'s immediately readable by non-finance leadership — visual, concise, decision-focused.' },
    { q: 'We already have an accountant — how is this different?', a: 'Management accounting is forward-looking, not backward-looking. Your accountant records what happened; I help you decide what to do next with that data.' },
    { q: 'What\'s the ROI on a cost reduction engagement?', a: 'Most clients recover my fees within the first quarter via identified cost leaks alone. Average savings in the first year range from 8–18% of operational cost.' },
  ],
  consultant: [
    { q: 'How structured are your engagements?', a: 'Every engagement starts with a diagnostic, then a scoped proposal. We define clear milestones, deliverables, and success metrics before starting execution.' },
    { q: 'Do you work on retainer or project basis?', a: 'Both. Project-based for defined outcomes (fundraising, restructuring, specific financial models). Retainer for ongoing advisory and monthly CFO-style support.' },
    { q: 'Can you help with investor presentations?', a: 'Yes — from financial model review and story structuring to pitch deck financials and Q&A prep. I\'ve supported multiple successful funding rounds.' },
    { q: 'How do you measure the success of your work?', a: 'Agreed KPIs at the start — cost saved, capital raised, decision cycle speed, or revenue unlocked. I believe in accountability, not just activity.' },
  ],
  default: [
    { q: 'What is your typical turnaround time?', a: 'Most deliverables are completed within 3–5 business days. For urgent requirements, I offer priority processing with 24–48 hour turnaround.' },
    { q: 'Do you work remotely with clients?', a: 'Yes. I serve clients across India digitally, using secure document systems and video calls. The service quality is identical to in-person work.' },
    { q: 'How do we get started?', a: 'Book a consultation via this page. We\'ll discuss your requirements and I\'ll send a clear proposal with timeline and fees within 24 hours.' },
    { q: 'What if I\'m not satisfied with the work?', a: 'I offer revisions on all deliverables until you\'re completely satisfied. My reputation is built on results — not just completion.' },
  ],
};

function getFaqs(profession = '') {
  const prof = profession.toLowerCase();
  if (prof.includes('ca') || prof.includes('chartered') || prof.includes('tax') || prof.includes('audit')) return FAQ_MAP.ca;
  if (prof.includes('cma') || prof.includes('cost') || prof.includes('management')) return FAQ_MAP.cma;
  if (prof.includes('consult') || prof.includes('advisor') || prof.includes('strategy')) return FAQ_MAP.consultant;
  return FAQ_MAP.default;
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export const generateAIPortfolioPayload = (formData) => {
  const {
    name, profession, experience, city, services, bio,
    achievements, languages, targetClients,
    contactEmail, contactPhone, linkedin, twitter
  } = formData;

  const safeProf    = profession   || 'Financial Consultant';
  const safeExp     = experience   || '5';
  const safeCity    = city         || 'India';
  const safeClients = targetClients || 'businesses';

  const persona  = getPersona(safeProf);
  const theme    = getTheme(safeProf);
  const layout   = assignLayout(name || '', safeProf);

  // Hero
  const heroStatement = persona.heroStatement(name || 'This expert', safeClients, safeCity);
  const tagline       = persona.tagline(services ? services.split(',').map(s => s.trim()) : []);

  // Bio
  const rawServiceList = services ? services.split(',').map(s => s.trim()).filter(Boolean) : ['General Consultation'];
  let finalBio = bio?.trim();
  if (!finalBio) {
    const expLabel = parseInt(safeExp) > 10 ? 'veteran' : parseInt(safeExp) > 5 ? 'experienced' : 'dedicated';
    finalBio = `I am a ${expLabel} ${safeProf} based in ${safeCity}, helping ${safeClients} navigate ${rawServiceList.slice(0, 2).join(' and ')} with clarity and confidence. Over ${safeExp}+ years, I have built a practice on a simple principle: clients come first, and results speak louder than credentials.`;
  }

  // Services (enriched)
  const enrichedServices = rawServiceList.map(enrichService);

  // Achievements
  const rawAch = achievements ? achievements.split(',').map(s => s.trim()).filter(Boolean) : ['Trusted by 200+ clients across India'];
  const formattedAchievements = rawAch.map(a => a.match(/[.!?]$/) ? a : `${a}.`);

  // Stats
  const expNum = parseInt(safeExp) || 5;
  const clientsEst = Math.max(50, expNum * 42 + rawServiceList.length * 15);
  const stats = [
    { value: `${safeExp}+`, label: 'Years Experience' },
    { value: `${clientsEst}+`, label: 'Clients Served' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '< 2hrs', label: 'Response Time' },
  ];

  // Who I Help + Problems
  const whoIHelp      = persona.whoIHelp;
  const problemsSolved = persona.problemsSolved;
  const results        = persona.results;
  const ctaHeadline    = persona.ctaHeadline;
  const ctaBody        = persona.ctaBody;

  // FAQs
  const faqs = formData.faqs?.length ? formData.faqs : getFaqs(safeProf);

  return {
    name,
    profession: safeProf,
    experience: safeExp,
    city: safeCity,
    targetClients: safeClients,
    heroStatement,
    tagline,
    bio: finalBio,
    services: enrichedServices,          // array of enriched objects now
    rawServices: rawServiceList,          // keep raw strings too
    achievements: formattedAchievements,
    languages: languages ? languages.split(',').map(s => s.trim()).filter(Boolean) : ['English'],
    stats,
    whoIHelp,
    problemsSolved,
    results,
    ctaHeadline,
    ctaBody,
    faqs,
    contactEmail,
    contactPhone,
    socials: { linkedin, twitter },
    layout,                               // 0 | 1 | 2
    themeKey: safeProf,                   // used by renderer to pick theme
  };
};
