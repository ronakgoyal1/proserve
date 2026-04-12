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
  // Professional routing protection
  if (requirePro) {
    if (session.user?.user_metadata?.role !== 'professional') {
      return <Navigate to="/dashboard" replace />;
    }
    const onboardingStatus = session.user?.user_metadata?.onboardingStatus;
    if (onboardingStatus === 'required' || onboardingStatus === 'pending') {
      return <Navigate to="/onboarding" replace />;
    }
  }

  // Admin routing protection
  // 1. Temporary email-based bypass for direct testing
  const isTestingAdmin = session.user?.email === 'ronakdiscord@gmail.com';
  
  // 2. Scalable Role-Based Authorization
  // This verifies the role injected into user_metadata from the Supabase auth token
  const isRoleAdmin = session.user?.user_metadata?.role === 'admin';

  if (allowAdmin && !(isTestingAdmin || isRoleAdmin)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
