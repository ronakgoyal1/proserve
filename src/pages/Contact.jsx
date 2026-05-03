import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <main className="static-page" style={{ padding: 'var(--space-8) 0', minHeight: '80vh' }}>
      <Helmet>
        <title>Contact Us | Wisor</title>
        <meta name="description" content="Get in touch with the Wisor team." />
      </Helmet>
      
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-gray-900)' }}>Contact Us</h1>
        <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-8)', fontSize: '1.125rem' }}>
          Have questions or need assistance? We're here to help you navigate your compliance and finance needs.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <div className="contact-card" style={{ padding: 'var(--space-6)', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <Mail size={32} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }} />
            <h3>Email Us</h3>
            <p>support@wisor.in</p>
            <p>partners@wisor.in</p>
          </div>
          
          <div className="contact-card" style={{ padding: 'var(--space-6)', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <Phone size={32} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }} />
            <h3>Call Us</h3>
            <p>+91 800-WISOR-IN</p>
            <p>Mon-Fri, 9AM-6PM IST</p>
          </div>
          
          <div className="contact-card" style={{ padding: 'var(--space-6)', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <MapPin size={32} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }} />
            <h3>Visit Us</h3>
            <p>12th Floor, Wisor Tower<br/>Bandra Kurla Complex<br/>Mumbai, MH 400051</p>
          </div>
        </div>

        <div style={{ background: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Send us a Message</h3>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={(e) => { e.preventDefault(); e.target.reset(); e.target.parentElement.insertAdjacentHTML('afterbegin', '<div style="background:#ecfdf5;color:#059669;padding:12px 16px;border-radius:10px;font-weight:600;margin-bottom:16px;border:1px solid rgba(5,150,105,0.2)">✓ Your message has been sent. We\'ll get back to you soon!</div>'); }}>
            <div className="form-row" style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <input type="text" placeholder="Your Name" style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} required />
              <input type="email" placeholder="Your Email" style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)' }} required />
            </div>
            <textarea placeholder="How can we help?" rows="5" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gray-200)', resize: 'vertical' }} required></textarea>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Submit Inquiry</button>
          </form>
        </div>
      </div>
    </main>
  );
}
