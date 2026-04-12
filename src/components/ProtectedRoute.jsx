import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowAdmin = false, requirePro = false }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <Loader2 size={32} className="spin" />
      </div>
    );
  }

  if (!session) {
    // Save the route they were trying to access to redirect later if needed
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Basic Role Based Logic implementation if User Metadata holds "role"
  // If the app scales, we can enforce `session.user.user_metadata.role` here.
  // We'll trust the route assignments for now as an MVP.
  if (requirePro && session.user?.user_metadata?.role === 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin routing protection
  if (allowAdmin && session.user?.email !== 'admin@proserve.in') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
