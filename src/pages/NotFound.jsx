import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'var(--space-8)' }}>
      <h1 style={{ fontSize: '6rem', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>404</h1>
      <h2 style={{ marginBottom: 'var(--space-4)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--color-gray-500)', maxWidth: '400px', marginBottom: 'var(--space-6)' }}>
        We couldn't find the page you were looking for. It might have been moved or doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <Home size={18} /> Back to Home
      </Link>
    </main>
  );
}
