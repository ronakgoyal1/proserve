import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, requireAdmin = false, requirePro = false, requireUser = false, requireOnboardingFlow = false }) {
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Identity extraction
  const isTestingAdmin = session.user?.email === 'ronakdiscord@gmail.com';
  const isRoleAdmin = session.user?.user_metadata?.role === 'admin';
  const isAdmin = isTestingAdmin || isRoleAdmin;
  const isPro = session.user?.user_metadata?.role === 'professional';
  const isGenericUser = (!isAdmin && !isPro);

  // 1. Admin Routing Isolation
  if (requireAdmin) {
    if (!isAdmin) {
      if (isPro) return <Navigate to="/pro-dashboard" replace />;
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 2. Expert Routing Isolation
  if (requirePro) {
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (!isPro) return <Navigate to="/dashboard" replace />;

    const onboardingStatus = session.user?.user_metadata?.onboardingStatus;
    
    // If they are on the Onboarding route but already approved, boot them to dashboard
    if (requireOnboardingFlow) {
        if (onboardingStatus === 'approved') return <Navigate to="/pro-dashboard" replace />;
    } else {
        // Normal Pro routes (e.g. ProDashboard) - block access if not approved
        if (onboardingStatus !== 'approved') return <Navigate to="/onboarding" replace />;
    }
  }

  // 3. Strict User Isolation
  if (requireUser) {
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isPro) return <Navigate to="/pro-dashboard" replace />;
  }

  return children;
}
