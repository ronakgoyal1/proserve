import { Helmet } from 'react-helmet-async';

export default function Terms() {
  return (
    <main className="static-page" style={{ padding: 'var(--space-8) 0', minHeight: '80vh' }}>
      <Helmet>
        <title>Terms of Service | Wisor</title>
        <meta name="description" content="Wisor Terms of Service." />
      </Helmet>
      
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ marginBottom: 'var(--space-4)' }}>Terms of Service</h1>
        
        <div style={{ background: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', color: 'var(--color-gray-700)', lineHeight: 1.7 }}>
          <p style={{ marginBottom: 'var(--space-4)' }}><em>Last Updated: April 2026</em></p>
          
          <h3 style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>1. Acceptance of Terms</h3>
          <p>By accessing and using Wisor, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our marketplace.</p>
          
          <h3 style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>2. Platform Role</h3>
          <p>Wisor is a marketplace connecting users with independent CA and CMA professionals. Wisor itself does not provide financial, tax, or legal advice.</p>

          <h3 style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>3. Professional Obligations</h3>
          <p>Professionals must maintain active and valid registrations with their respective governing bodies (ICAI / ICMAI). Misrepresentation will result in immediate ban.</p>

          <h3 style={{ margin: 'var(--space-4) 0 var(--space-2)' }}>4. Dispute Resolution</h3>
          <p>Any disputes arising from services booked on Wisor should first be attempted to resolve directly between the Client and Professional. Our Support Team can mediate if necessary.</p>
        </div>
      </div>
    </main>
  );
}
