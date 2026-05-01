import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <main className="static-page" style={{ padding: 'var(--space-8) 0', minHeight: '80vh' }}>
      <Helmet>
        <title>About Us | Wisor</title>
        <meta name="description" content="Learn about Wisor's mission to connect people with India's best CA and CMA experts." />
      </Helmet>
      
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ marginBottom: 'var(--space-4)' }}>About Wisor</h1>
        
        <div style={{ background: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ marginBottom: 'var(--space-3)' }}>Our Mission</h2>
          <p style={{ color: 'var(--color-gray-700)', marginBottom: 'var(--space-6)', lineHeight: 1.7 }}>
            At Wisor, we believe that finding reliable financial and compliance expertise shouldn't be a daunting task. 
            Our mission is to bridge the gap between individuals, startups, and established businesses with India's top 
            Chartered Accountants (CAs) and Cost & Management Accountants (CMAs). We bring transparency, trust, and 
            efficiency to professional services.
          </p>

          <h2 style={{ marginBottom: 'var(--space-3)' }}>Why We Started</h2>
          <p style={{ color: 'var(--color-gray-700)', marginBottom: 'var(--space-6)', lineHeight: 1.7 }}>
            The financial compliance landscape in India is incredibly complex. However, discovering verified professionals 
            who offer straightforward pricing and modern digital communication was surprisingly difficult. Wisor was 
            built to solve this. Whether it's GST filing, company incorporation, or complex tax structuring, we provide 
            a premium directory of vetted experts ready to help.
          </p>

          <h2 style={{ marginBottom: 'var(--space-3)' }}>Our Promise</h2>
          <ul style={{ color: 'var(--color-gray-700)', paddingLeft: 'var(--space-4)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Verification First:</strong> Every professional on our platform is strictly verified against their ICAI/ICMAI registration.</li>
            <li><strong>Transparent Pricing:</strong> No hidden costs. Consultations and package prices are explicitly listed.</li>
            <li><strong>Secure Communications:</strong> Privacy is paramount when handling financial data.</li>
            <li><strong>Continuous Support:</strong> Dedicated support queues for both clients and professionals.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
