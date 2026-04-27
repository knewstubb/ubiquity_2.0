import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import { ComingSoonPlaceholder } from '../shared/ComingSoonPlaceholder';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { isRouteEnabled } = useFeatureFlags();
  const location = useLocation();

  // Still resolving auth state — render nothing to prevent login flash
  if (isLoading) {
    return null;
  }

  // Not authenticated — redirect to login with returnTo
  if (!user) {
    const returnTo = location.pathname + location.search;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  // Route disabled by feature flag — show coming soon placeholder
  if (!isRouteEnabled(location.pathname)) {
    return <ComingSoonPlaceholder />;
  }

  // Authenticated + route enabled — render children
  return <>{children}</>;
}
