// A deterministic mock AI engine to simulate personalized portfolio generation

const headlines = [
  "Strategic {PROFESSION} Driving Growth for {CLIENTS}",
  "Expert {PROFESSION} in {CITY} | Scaling {CLIENTS}",
  "Next-Gen {PROFESSION} Advisory for {CLIENTS}",
  "{EXPERIENCE}+ Years of Excellence as a {PROFESSION}",
  "Your Trusted {PROFESSION} Partner in {CITY}"
];

const bios = [
  "With over {EXPERIENCE} years of dedicated experience, I bring specialized {PROFESSION} expertise to {CLIENTS} in {CITY}. My approach blends rigorous compliance with forward-thinking financial strategy.",
  "As a {PROFESSION} operating out of {CITY}, my core mission is empowering {CLIENTS}. For {EXPERIENCE} years, I've transformed complex regulatory and financial challenges into clear growth opportunities.",
  "I am a {AUTHORITY} {PROFESSION} committed to the success of {CLIENTS}. Over the past {EXPERIENCE} years, I've built a reputation in {CITY} for delivering uncompromising quality, strategic foresight, and sustainable financial architecture."
];

const faqTemplates = {
  'CA': [
    { q: 'How can you optimize my corporate tax structure?', a: 'I conduct a thorough review of your existing operations and leverage the latest tax codes to restructure your liabilities efficiently.' },
    { q: 'Do you assist with statutory audits?', a: 'Yes, statutory and internal audits are a core competency, ensuring 100% regulatory compliance.' }
  ],
  'CMA': [
    { q: 'How do you approach cost reduction?', a: 'I implement advanced cost management frameworks to identify operational inefficiencies without sacrificing quality.' },
    { q: 'Can you assist with strategic pricing?', a: 'Absolutely. We analyze market constraints and marginal costs to develop highly competitive pricing strategies.' }
  ],
  'default': [
    { q: 'What is your operational process?', a: 'We begin with a deep-dive diagnostic of your current state, followed by a prioritized execution roadmap tailored to your specific goals.' },
    { q: 'Do you work remotely with clients?', a: 'Yes, I utilize secure digital infrastructure to support clients seamlessly, regardless of location.' },
    { q: 'How do we get started?', a: 'Book a primary consultation via this portfolio to discuss your exact requirements and timeline.' }
  ]
};

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function selectRandom(arr) {
  return arr[getRandomInt(arr.length)];
}

export const generateAIPortfolioPayload = (formData) => {
  const { name, profession, experience, city, services, bio, achievements, languages, targetClients, contactEmail, contactPhone, linkedin, twitter } = formData;

  const safeProf = profession || 'Financial Consultant';
  const safeExp = experience || 'Several';
  const safeCity = city || 'India';
  const safeClients = targetClients || 'Businesses';

  // 1. Custom Headline
  const rawHeadline = selectRandom(headlines);
  const heroTitle = rawHeadline
    .replace('{PROFESSION}', safeProf)
    .replace('{CLIENTS}', safeClients)
    .replace('{CITY}', safeCity)
    .replace('{EXPERIENCE}', safeExp);

  // 2. Unique About Section
  let finalBio = bio;
  if (!finalBio || finalBio.trim() === '') {
    const rawBio = selectRandom(bios);
    finalBio = rawBio
      .replace('{PROFESSION}', safeProf)
      .replace('{CLIENTS}', safeClients)
      .replace('{CITY}', safeCity)
      .replace('{EXPERIENCE}', safeExp)
      .replace('{AUTHORITY}', parseInt(safeExp) > 10 ? 'veteran' : 'dynamic');
  }

  // 3. Reframed Services
  const originalServices = services.split(',').map(s => s.trim()).filter(Boolean);
  const reframedServices = originalServices.map(svc => {
    // Add marketing flair
    const verbs = ['Strategic', 'Advanced', 'Comprehensive', 'Optimized', 'Precision'];
    return `${selectRandom(verbs)} ${svc}`;
  });

  // 4. Why Choose Me / Achievements
  const originalAchievements = achievements.split(',').map(s => s.trim()).filter(Boolean);
  const formattedAchievements = originalAchievements.map(ach => {
      // If it doesn't end with punctuation, add a period
      return ach.match(/[.!?]$/) ? ach : `${ach}.`;
  });

  // 5. Niche-specific FAQs
  let faqs = faqTemplates['default'];
  if (safeProf.toLowerCase().includes('ca') || safeProf.toLowerCase().includes('chartered')) {
    faqs = faqTemplates['CA'];
  } else if (safeProf.toLowerCase().includes('cma') || safeProf.toLowerCase().includes('cost')) {
    faqs = faqTemplates['CMA'];
  }

  // 6. Return Structured Payload
  return {
    name,
    profession: safeProf,
    experience: safeExp,
    city: safeCity,
    targetClients: safeClients,
    services: reframedServices.length > 0 ? reframedServices : ['General Consultation'],
    bio: finalBio,
    achievements: formattedAchievements,
    languages: languages.split(',').map(s => s.trim()).filter(Boolean),
    contactEmail,
    contactPhone,
    socials: {
      linkedin,
      twitter
    },
    heroTitle,
    faqs
  };
};
