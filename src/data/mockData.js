export const professionals = [
  {
    id: 1,
    name: "Rajesh Sharma",
    category: "CA",
    photo: null,
    initials: "RS",
    rating: 4.9,
    reviews: 127,
    experience: 12,
    city: "Mumbai",
    languages: ["Hindi", "English", "Marathi"],
    startingPrice: 1499,
    verification: { status: 'verified', date: '2026-01-10', checks: { identity: true, documents: true, credentials: true } },
    featured: true,
    availability: "Available Today",
    bio: "Senior Chartered Accountant with 12+ years of expertise in taxation, audit, and financial consulting. Helping individuals and businesses streamline their financial operations.",
    services: [
      "ITR Filing", "GST Registration", "GST Return Filing",
      "Company Registration", "Audit Support", "Financial Consulting"
    ],
    certifications: ["ICAI Member", "GST Practitioner", "Registered Auditor"],
    packages: [
      { name: "Basic", price: 1499, description: "Individual ITR filing with basic consultation", features: ["ITR Filing", "Form 16 Processing", "Email Support"] },
      { name: "Standard", price: 3999, description: "Complete tax & GST management for small businesses", features: ["ITR Filing", "GST Returns", "TDS Filing", "Phone Support", "Quarterly Review"] },
      { name: "Premium", price: 9999, description: "Full financial management & advisory services", features: ["All Standard Features", "Audit Support", "Financial Planning", "Dedicated Manager", "Priority Support"] }
    ]
  },
  {
    id: 2,
    name: "Priya Mehta",
    category: "CA",
    photo: null,
    initials: "PM",
    rating: 4.8,
    reviews: 98,
    experience: 8,
    city: "Mumbai",
    languages: ["Hindi", "English", "Gujarati"],
    startingPrice: 1299,
    verification: { status: 'verified', date: '2026-02-15', checks: { identity: true, documents: true, credentials: true } },
    featured: true,
    availability: "Available Today",
    bio: "Chartered Accountant specializing in startup advisory, GST compliance, and business registration services.",
    services: [
      "Startup Advisory", "GST Registration", "GST Return Filing",
      "Company Registration", "MSME Registration", "Compliance Management"
    ],
    certifications: ["ICAI Member", "Startup India Mentor"],
    packages: [
      { name: "Basic", price: 1299, description: "GST registration and basic compliance", features: ["GST Registration", "Basic Compliance", "Email Support"] },
      { name: "Standard", price: 3499, description: "Complete startup registration package", features: ["Company Registration", "GST Setup", "MSME Registration", "Phone Support"] },
      { name: "Premium", price: 7999, description: "End-to-end startup financial advisory", features: ["All Standard Features", "Monthly Advisory", "Fundraising Support", "Priority Support"] }
    ]
  },
  {
    id: 3,
    name: "Amit Kulkarni",
    category: "CMA",
    photo: null,
    initials: "AK",
    rating: 4.7,
    reviews: 74,
    experience: 15,
    city: "Mumbai",
    languages: ["Hindi", "English", "Marathi"],
    startingPrice: 1999,
    verification: { status: 'verified', date: '2026-03-01', checks: { identity: true, documents: true, credentials: true } },
    featured: false,
    availability: "Next Available: Tomorrow",
    bio: "Cost & Management Accountant with expertise in cost optimization, budget planning, and management information systems for manufacturing companies.",
    services: [
      "Cost Analysis", "Budget Planning", "MIS Reporting",
      "Financial Consulting", "Variance Analysis", "Cost Audit"
    ],
    certifications: ["ICMAI Member", "Cost Auditor", "Six Sigma Green Belt"],
    packages: [
      { name: "Basic", price: 1999, description: "Basic cost analysis and reporting", features: ["Cost Analysis Report", "Basic MIS", "Email Support"] },
      { name: "Standard", price: 4999, description: "Complete cost management solution", features: ["Detailed Cost Analysis", "Budget Planning", "Monthly MIS", "Phone Support"] },
      { name: "Premium", price: 11999, description: "Strategic cost management advisory", features: ["All Standard Features", "Cost Optimization Strategy", "Quarterly Reviews", "On-site Visits"] }
    ]
  },
  {
    id: 4,
    name: "Neha Desai",
    category: "CA",
    photo: null,
    initials: "ND",
    rating: 4.9,
    reviews: 156,
    experience: 10,
    city: "Mumbai",
    languages: ["Hindi", "English", "Gujarati"],
    startingPrice: 999,
    verification: { status: 'verified', date: '2025-11-20', checks: { identity: true, documents: true, credentials: true } },
    featured: true,
    availability: "Available Today",
    bio: "Trusted Chartered Accountant specializing in individual tax planning, NRI taxation, and investment advisory.",
    services: [
      "ITR Filing", "Tax Planning", "NRI Taxation",
      "Investment Advisory", "Capital Gains", "TDS Returns"
    ],
    certifications: ["ICAI Member", "SEBI Registered Advisor"],
    packages: [
      { name: "Basic", price: 999, description: "Simple ITR filing for salaried individuals", features: ["ITR-1 Filing", "Form 16 Processing", "Email Support"] },
      { name: "Standard", price: 2999, description: "Advanced tax planning and filing", features: ["ITR Filing (All Types)", "Tax Planning", "Capital Gains", "Phone Support"] },
      { name: "Premium", price: 6999, description: "Complete wealth management advisory", features: ["All Standard Features", "Investment Advisory", "NRI Tax Services", "Dedicated Support"] }
    ]
  },
  {
    id: 5,
    name: "Vikram Joshi",
    category: "CMA",
    photo: null,
    initials: "VJ",
    rating: 4.6,
    reviews: 52,
    experience: 7,
    city: "Mumbai",
    languages: ["Hindi", "English"],
    startingPrice: 1799,
    verification: { status: 'verified', date: '2026-02-28', checks: { identity: true, documents: true, credentials: true } },
    featured: false,
    availability: "Available Today",
    bio: "CMA professional focused on cost accounting, budgeting, and financial performance management for SMEs.",
    services: [
      "Cost Analysis", "Budget Planning", "Variance Analysis",
      "Financial Consulting", "Profitability Analysis"
    ],
    certifications: ["ICMAI Member", "MBA Finance"],
    packages: [
      { name: "Basic", price: 1799, description: "Basic cost & budget analysis", features: ["Cost Sheet Preparation", "Budget Review", "Email Support"] },
      { name: "Standard", price: 3999, description: "Monthly cost management", features: ["Monthly Cost Analysis", "Budget Planning", "Variance Reports", "Phone Support"] },
      { name: "Premium", price: 8999, description: "Full performance management", features: ["All Standard Features", "Profitability Analysis", "Strategy Sessions", "Priority Support"] }
    ]
  },
  {
    id: 6,
    name: "Ananya Iyer",
    category: "CA",
    photo: null,
    initials: "AI",
    rating: 4.8,
    reviews: 89,
    experience: 9,
    city: "Mumbai",
    languages: ["Hindi", "English", "Tamil"],
    startingPrice: 1199,
    verification: { status: 'pending', date: null, checks: { identity: true, documents: false, credentials: false } },
    featured: false,
    availability: "Next Available: Tomorrow",
    bio: "Experienced CA with specialization in GST compliance, internal audit, and corporate tax planning for mid-size businesses.",
    services: [
      "GST Return Filing", "Internal Audit", "Corporate Tax",
      "Transfer Pricing", "Compliance Management", "Due Diligence"
    ],
    certifications: ["ICAI Member", "DISA (ICAI)", "GST Certified"],
    packages: [
      { name: "Basic", price: 1199, description: "GST return filing and basic compliance", features: ["Monthly GST Returns", "Basic Compliance", "Email Support"] },
      { name: "Standard", price: 3999, description: "Full compliance management", features: ["GST & TDS Filing", "Internal Audit", "Quarterly Reports", "Phone Support"] },
      { name: "Premium", price: 8999, description: "Comprehensive tax & audit services", features: ["All Standard Features", "Corporate Tax Planning", "Annual Audit", "Dedicated Manager"] }
    ]
  },
  {
    id: 7,
    name: "Sanjay Patil",
    category: "CMA",
    photo: null,
    initials: "SP",
    rating: 4.5,
    reviews: 41,
    experience: 20,
    city: "Mumbai",
    languages: ["Hindi", "English", "Marathi"],
    startingPrice: 2499,
    verification: { status: 'verified', date: '2025-12-05', checks: { identity: true, documents: true, credentials: true } },
    featured: false,
    availability: "Available Today",
    bio: "Veteran CMA with 20 years of industry experience in cost management, project costing, and strategic financial advisory for large enterprises.",
    services: [
      "Project Costing", "Cost Audit", "Strategic Advisory",
      "MIS Reporting", "Financial Modeling", "Cost Optimization"
    ],
    certifications: ["ICMAI Fellow", "Cost Auditor", "PMP Certified"],
    packages: [
      { name: "Basic", price: 2499, description: "Project cost estimation", features: ["Project Cost Analysis", "Basic Report", "Email Support"] },
      { name: "Standard", price: 5999, description: "Ongoing cost management", features: ["Monthly Cost Audit", "MIS Reports", "Cost Optimization", "Phone Support"] },
      { name: "Premium", price: 14999, description: "Strategic cost advisory", features: ["All Standard Features", "Financial Modeling", "Board Presentations", "On-site Consulting"] }
    ]
  },
  {
    id: 8,
    name: "Kavita Reddy",
    category: "CA",
    photo: null,
    initials: "KR",
    rating: 4.7,
    reviews: 63,
    experience: 6,
    city: "Mumbai",
    languages: ["Hindi", "English", "Telugu"],
    startingPrice: 1099,
    verification: { status: 'unverified', date: null, checks: { identity: false, documents: false, credentials: false } },
    featured: false,
    availability: "Available Today",
    bio: "Dynamic Chartered Accountant offering affordable tax filing, bookkeeping, and compliance services for freelancers and small businesses.",
    services: [
      "ITR Filing", "Bookkeeping", "GST Registration",
      "MSME Registration", "Payroll Processing", "TDS Returns"
    ],
    certifications: ["ICAI Member", "Tally Certified"],
    packages: [
      { name: "Basic", price: 1099, description: "ITR filing for freelancers", features: ["ITR-3/4 Filing", "TDS Verification", "Email Support"] },
      { name: "Standard", price: 2499, description: "Monthly bookkeeping & compliance", features: ["Bookkeeping", "GST Returns", "TDS Filing", "Phone Support"] },
      { name: "Premium", price: 5999, description: "Full financial operations support", features: ["All Standard Features", "Payroll Processing", "Compliance Calendar", "Dedicated Support"] }
    ]
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Arjun Patel",
    role: "Startup Founder",
    text: "ProServe made it incredibly easy to find a reliable CA for my startup. The entire process from discovery to booking was seamless. Highly recommended!",
    rating: 5
  },
  {
    id: 2,
    name: "Meera Gupta",
    role: "Freelance Designer",
    text: "I was always confused about tax filing. ProServe connected me with an amazing CA who explained everything clearly. Filed my ITR in just 2 days!",
    rating: 5
  },
  {
    id: 3,
    name: "Rohan Nair",
    role: "Manufacturing Business Owner",
    text: "The CMA I found through ProServe helped us reduce our production costs by 18%. The platform's verification process gave me confidence in my choice.",
    rating: 5
  },
  {
    id: 4,
    name: "Sneha Kapoor",
    role: "HR Manager",
    text: "We needed help with GST compliance urgently. Found a verified expert within hours through ProServe. The booking system is super convenient.",
    rating: 4
  }
];

export const services = [
  { id: 1, name: "ITR Filing", category: "CA", icon: "FileText", popular: true },
  { id: 2, name: "GST Registration", category: "CA", icon: "ClipboardCheck", popular: true },
  { id: 3, name: "GST Return Filing", category: "CA", icon: "FileSpreadsheet", popular: true },
  { id: 4, name: "Company Registration", category: "CA", icon: "Building2", popular: true },
  { id: 5, name: "Audit Support", category: "CA", icon: "Search", popular: false },
  { id: 6, name: "Cost Analysis", category: "CMA", icon: "TrendingDown", popular: true },
  { id: 7, name: "Budget Planning", category: "CMA", icon: "PieChart", popular: true },
  { id: 8, name: "MIS Reporting", category: "CMA", icon: "BarChart3", popular: false },
  { id: 9, name: "Financial Consulting", category: "Both", icon: "Landmark", popular: true },
  { id: 10, name: "Compliance Management", category: "Both", icon: "ShieldCheck", popular: false }
];

export const cities = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad",
  "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat"
];
