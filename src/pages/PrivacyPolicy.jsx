import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <main className="static-page" style={{ padding: 'var(--space-8) 0', minHeight: '80vh' }}>
      <Helmet>
        <title>Privacy Policy | Wisor</title>
        <meta name="description" content="Wisor Privacy Policy and Data Handling guidelines." />
      </Helmet>
      
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ marginBottom: 'var(--space-4)' }}>Privacy Policy</h1>
        
        <div style={{ background: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', color: 'var(--color-gray-700)', lineHeight: 1.7 }}>
          <p style={{ marginBottom: 'var(--space-4)' }}><em>Last Updated: April 2026</em></p>
          
          <h3 style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>1. Information We Collect</h3>
          <p>We collect information you provide directly to us matching standard marketplace operations: account details, booking times, and professional verification data.</p>
          
          <h3 style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>2. How We Use Your Data</h3>
          <p>Data is primarily used to connect you with verified CA and CMA professionals, send booking confirmations (via EmailJS), and maintain secure access to your Dashboard.</p>

          <h3 style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>3. Information Sharing</h3>
          <p>We do not sell your personal data. We only share necessary booking details with the specific professional you choose to hire through Wisor.</p>

          <h3 style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>4. Security</h3>
          <p>Your authentication and sensitive data are secured via Supabase using enterprise-grade encryption and Row Level Security (RLS) policies.</p>
        </div>
      </div>
    </main>
  );
}
