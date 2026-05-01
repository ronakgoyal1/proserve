import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, User, Zap, Building, HelpCircle, FileText, Search, BookOpen, MessageSquare, IndianRupee, Clock, Calendar, MapPin, CheckCircle2, ChevronRight, Loader2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { dbService } from '../lib/dbService';

const WIZARD_STEPS = [
  {
    id: 'entity',
    title: 'How are you organized?',
    subtitle: 'This helps us match you with experts experienced in your specific legal/corporate structure.',
    options: [
      { id: 'Individual', icon: User, label: 'Individual / Freelancer', desc: 'Personal taxes & compliance' },
      { id: 'Startup', icon: Zap, label: 'Early-stage Startup', desc: 'Scalable finance & registration' },
      { id: 'Company', icon: Building, label: 'Registered Company', desc: 'Corporate tax & complex audits' },
      { id: 'Not Sure', icon: HelpCircle, label: 'Need Guidance', desc: 'Help me figure it out' },
    ]
  },
  {
    id: 'service',
    title: 'What is your primary need?',
    subtitle: 'Select the core service you are looking for right now.',
    options: [
      { id: 'Tax Filing', icon: FileText, label: 'Tax & GST Filing', desc: 'Income tax, GST, Corporate' },
      { id: 'Audit', icon: Search, label: 'Audit & Assurance', desc: 'Statutory, Internal, Concurrent' },
      { id: 'Compliance', icon: BookOpen, label: 'Accounting & Compliance', desc: 'Daily books, reconciliation' },
      { id: 'Consultation', icon: MessageSquare, label: 'General Consultation', desc: 'Not sure yet, let\'s talk' },
    ]
  },
  {
    id: 'budget',
    title: 'What is your expected budget?',
    subtitle: 'We will filter professionals who align closely with your financial scope.',
    options: [
      { id: 'Low', icon: IndianRupee, label: 'Under ₹5,000', desc: 'Basic assignments & filings' },
      { id: 'Medium', icon: IndianRupee, label: '₹5k - ₹20k', desc: 'Standard comprehensive jobs' },
      { id: 'High', icon: IndianRupee, label: 'Above ₹20k', desc: 'Complex corporate handling' },
      { id: 'Flexible', icon: HelpCircle, label: 'Flexible / Not Sure', desc: 'Depends on the scope' },
    ]
  },
  {
    id: 'urgency',
    title: 'How urgent is this request?',
    subtitle: 'Matching you with experts who have the right availability.',
    options: [
      { id: 'Immediate', icon: Zap, label: 'Immediate (24hr)', desc: 'I need to start right now' },
      { id: 'This Week', icon: Clock, label: 'This Week', desc: 'Fast, but not an emergency' },
      { id: 'Flexible', icon: Calendar, label: 'Flexible Timeline', desc: 'Just planning ahead' },
      { id: 'Exploring', icon: Search, label: 'Just Exploring', desc: 'Comparing expert profiles' },
    ]
  },
  {
    id: 'city',
    title: 'Preferred Expert Location',
    subtitle: 'Would you like a local professional or is remote acceptable?',
    options: [
      { id: 'Mumbai', icon: MapPin, label: 'Mumbai', desc: 'Local experts' },
      { id: 'Delhi', icon: MapPin, label: 'Delhi NCR', desc: 'Local experts' },
      { id: 'Bangalore', icon: MapPin, label: 'Bangalore', desc: 'Local experts' },
      { id: 'Any', icon: Sparkles, label: 'Anywhere (Remote)', desc: 'Best expert, regardless of city' },
    ]
  }
];

export default function AiDiscovery() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [matches, setMatches] = useState(null);

  const handleSelect = (optionId) => {
    const stepId = WIZARD_STEPS[currentStep].id;
    setAnswers(prev => ({ ...prev, [stepId]: optionId }));
    
    // Auto-advance
    setTimeout(() => {
      if (currentStep < WIZARD_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        processAI();
      }
    }, 200); // Small delay for visual feedback
  };

  const processAI = async () => {
    setIsProcessing(true);
    setCurrentStep(WIZARD_STEPS.length); // Enter loading state
    
    try {
      const allPros = await dbService.getProfessionals();
      
      // Safety net for empty DB
      if (!allPros || allPros.length === 0) {
         setMatches([]);
         setIsProcessing(false);
         return;
      }

      // Heuristic Scoring Mock
      const scoredPros = allPros.map(pro => {
        let score = 0;
        const reasons = [];

        // 1. City / Location Fit
        if (answers.city === 'Any') {
          score += 15;
          reasons.push({ label: 'Remote Friendly', type: 'info', icon: Sparkles });
        } else if (pro.city && pro.city.toLowerCase().includes(answers.city.toLowerCase())) {
          score += 30;
          reasons.push({ label: 'Local to You', type: 'success', icon: MapPin });
        }

        // 2. Budget Fit
        const price = pro.startingPrice || pro.hourlyRate || 1500;
        if (answers.budget === 'Flexible') {
           score += 10;
        } else if (answers.budget === 'Low' && price < 5000) {
           score += 20;
           reasons.push({ label: 'Budget Fit', type: 'success', icon: IndianRupee });
        } else if (answers.budget === 'Medium' && price >= 5000 && price <= 20000) {
           score += 20;
           reasons.push({ label: 'Matches Budget', type: 'success', icon: IndianRupee });
        } else if (answers.budget === 'High' && price > 20000) {
           score += 20;
           reasons.push({ label: 'Premium Match', type: 'info', icon: Sparkles });
        }

        // 3. Entity Specificity
        const profileText = `${pro.bio} ${pro.services?.join(' ')} ${pro.category}`.toLowerCase();
        if (answers.entity === 'Startup' && (profileText.includes('startup') || profileText.includes('scale'))) {
           score += 25;
           reasons.push({ label: 'Startup Expert', type: 'primary', icon: Zap });
        } else if (answers.entity === 'Company' && (profileText.includes('corporate') || profileText.includes('audit'))) {
           score += 25;
           reasons.push({ label: 'Corporate Expert', type: 'primary', icon: Building });
        }

        // 4. Verification Check
        if (pro.verification?.status === 'verified') {
           score += 10;
           reasons.push({ label: 'Highly Verified', type: 'warning', icon: ShieldCheck }); // Gold shield
        }

        // 5. Urgency mapped to availability
        if ((answers.urgency === 'Immediate' || answers.urgency === 'This Week') && pro.availability?.toLowerCase().includes('today')) {
           score += 20;
           reasons.push({ label: 'Fast Response', type: 'success', icon: Clock });
        }
        
        // If they provided "Not sure", we just pad the score baseline
        if (answers.entity === 'Not Sure' || answers.service === 'Consultation') {
           if (pro.experience >= 10) {
              score += 25;
              reasons.push({ label: 'Great for Guidance', type: 'primary', icon: User });
           }
        }

        return { ...pro, matchScore: score, aiReasons: reasons.slice(0, 3) };
      });

      // Sort by descending score
      scoredPros.sort((a, b) => b.matchScore - a.matchScore);
      
      // Mock natural delay for "AI processing" feel
      setTimeout(() => {
        setMatches(scoredPros.slice(0, 3));
        setIsProcessing(false);
      }, 2000);

    } catch (err) {
      console.error("AI matching failed:", err);
      // Fallback
      setMatches([]);
      setIsProcessing(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep(0);
    setAnswers({});
    setMatches(null);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-primary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Header */}
      <div style={{ padding: 'var(--space-4) var(--space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Sparkles style={{ color: 'var(--color-accent)' }} size={24} />
          <span style={{ color: 'white', fontWeight: 700, fontSize: '18px', letterSpacing: '0.5px' }}>Wisor <span style={{ color: 'var(--color-accent)' }}>AI</span></span>
        </div>
        <button className="btn btn-ghost" style={{ color: 'var(--color-gray-300)' }} onClick={() => navigate('/search')}>
          Exit
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8) var(--space-4)' }}>
        
        {/* Wizard Interface */}
        {currentStep < WIZARD_STEPS.length && (
          <div className="container" style={{ maxWidth: '800px', width: '100%' }}>
            
            {/* Progress Indicators */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-8)' }}>
              {WIZARD_STEPS.map((_, idx) => (
                <div key={idx} style={{ 
                  flex: 1, 
                  height: '4px', 
                  borderRadius: '2px', 
                  background: idx <= currentStep ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                  transition: 'background var(--transition-base)'
                }} />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <h1 style={{ color: 'white', fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-3)' }}>
                {WIZARD_STEPS[currentStep].title}
              </h1>
              <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-lg)' }}>
                {WIZARD_STEPS[currentStep].subtitle}
              </p>
            </div>

            {/* Options Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              {WIZARD_STEPS[currentStep].options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  style={{
                    background: answers[WIZARD_STEPS[currentStep].id] === opt.id ? 'rgba(197, 160, 89, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${answers[WIZARD_STEPS[currentStep].id] === opt.id ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-6)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    transition: 'all var(--transition-base)',
                    color: 'white'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
                  onMouseOut={(e) => { 
                    const isSelected = answers[WIZARD_STEPS[currentStep].id] === opt.id;
                    e.currentTarget.style.background = isSelected ? 'rgba(197, 160, 89, 0.1)' : 'rgba(255, 255, 255, 0.05)'; 
                    e.currentTarget.style.borderColor = isSelected ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.1)'; 
                  }}
                >
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                    <opt.icon size={24} style={{ color: answers[WIZARD_STEPS[currentStep].id] === opt.id ? 'var(--color-accent)' : 'white' }} />
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>{opt.label}</h3>
                  <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', margin: 0 }}>{opt.desc}</p>
                </button>
              ))}
            </div>
            
            {/* Back Button */}
            {currentStep > 0 && (
              <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
                <button onClick={() => setCurrentStep(prev => prev - 1)} className="btn btn-ghost" style={{ color: 'var(--color-gray-400)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <ArrowLeft size={16} /> Back
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isProcessing && (
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ position: 'relative', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '80px', height: '80px', marginBottom: 'var(--space-6)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', background: 'var(--color-accent)', opacity: 0.2, animation: 'pulse 2s infinite' }}></div>
              <Sparkles size={40} style={{ color: 'var(--color-accent)' }} className="spin-slow" />
            </div>
            <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)' }}>Analyzing requirements...</h2>
            <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-lg)' }}>Matching you with the top 1% of evaluated professionals.</p>
          </div>
        )}

        {/* Results State */}
        {matches !== null && !isProcessing && (
          <div className="container" style={{ maxWidth: '1000px', width: '100%' }}>
            
            {matches.length === 0 ? (
               <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-12)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'inline-flex', padding: 'var(--space-4)', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%', marginBottom: 'var(--space-4)' }}>
                    <Search size={40} />
                  </div>
                  <h2 style={{ color: 'white', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>No Direct Matches found.</h2>
                  <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-8)' }}>Try broadening your search criteria or explore our complete directory.</p>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                     <button onClick={resetFlow} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>Adjust Answers</button>
                     <button onClick={() => navigate('/search')} className="btn btn-primary" style={{ background: 'var(--color-accent)', color: 'var(--color-primary-dark)' }}>Browse Directory</button>
                  </div>
               </div>
            ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(197, 160, 89, 0.1)', color: 'var(--color-accent)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', border: '1px solid rgba(197, 160, 89, 0.2)' }}>
                      <CheckCircle2 size={16} style={{ marginRight: '8px' }} /> Matchmaking Complete
                    </div>
                    <h2 style={{ color: 'white', fontSize: 'var(--text-4xl)' }}>Your Curated Experts</h2>
                    <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-lg)', marginTop: 'var(--space-2)' }}>We found {matches.length} highly qualified professionals perfectly suited for your needs.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
                    {matches.map((pro, idx) => (
                      <div key={pro.id} style={{ 
                        background: 'white', 
                        borderRadius: 'var(--radius-xl)', 
                        padding: 'var(--space-6)', 
                        boxShadow: 'var(--shadow-xl)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        
                        {/* Rank Badge */}
                        <div style={{ position: 'absolute', top: '-15px', right: 'var(--space-6)', background: 'var(--color-primary)', color: 'var(--color-accent)', padding: '4px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}>
                          Match #{idx + 1}
                        </div>

                        {/* Top Section */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                          {pro.image ? (
                            <img src={pro.image} alt={pro.name} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 600 }}>
                              {pro.initials || pro.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {pro.name}
                              {pro.verification?.status === 'verified' && <ShieldCheck size={18} style={{ color: 'var(--color-warning)' }} title="Verified" />}
                            </h3>
                            <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)' }}>{pro.category} &bull; {pro.city || 'Remote'}</p>
                          </div>
                        </div>

                        {/* AI Reasons */}
                        <div style={{ background: 'var(--color-gray-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-5)', border: '1px solid var(--color-gray-100)' }}>
                           <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--space-3)' }}>Why It's a Match</p>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                             {pro.aiReasons && pro.aiReasons.length > 0 ? (
                               pro.aiReasons.map((r, i) => (
                                 <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '14px', color: 'var(--color-gray-700)' }}>
                                   <div style={{ color: r.type === 'primary' ? 'var(--color-primary)' : r.type === 'success' ? 'var(--color-success)' : r.type === 'warning' ? 'var(--color-warning)' : 'var(--color-accent)' }}>
                                     <r.icon size={16} />
                                   </div>
                                   {r.label}
                                 </div>
                               ))
                             ) : (
                               <div style={{ fontSize: '14px', color: 'var(--color-gray-600)' }}>General capability match based on requirements.</div>
                             )}
                           </div>
                        </div>

                        <div style={{ flex: 1 }}></div>

                        {/* CTAs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginTop: 'auto' }}>
                          <Link to={`/professional/${pro.id}`} className="btn btn-outline" style={{ textAlign: 'center' }}>
                            View Profile
                          </Link>
                          <button onClick={() => navigate(`/professional/${pro.id}?book=true`)} className="btn btn-primary" style={{ textAlign: 'center' }}>
                            Book Now
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
                     <button onClick={resetFlow} className="btn btn-ghost" style={{ color: 'var(--color-gray-400)' }}>
                       Start Over
                     </button>
                  </div>
                </>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
