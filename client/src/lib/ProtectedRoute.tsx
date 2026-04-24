import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireNoAuth?: boolean;
  requireAdmin?: boolean;
  requireMember?: boolean;
}

export function ProtectedRoute({
  children,
  requireNoAuth = false,
  requireAdmin = false,
  requireMember = false
}: ProtectedRouteProps) {
  const { isLoggedIn, isLoading, isAdmin, isMember } = useAuth();
  const navigate = useNavigate();

  const canAccess = isLoading
    ? true
    : requireNoAuth
      ? !isLoggedIn
      : isLoggedIn && (!requireAdmin || isAdmin) && (!requireMember || isMember);

  useEffect(() => {
    if (isLoading || canAccess) return;

    if (requireNoAuth && isLoggedIn) {
      navigate({ to: '/account/dashboard' });
    } else {
      navigate({ to: '/login' });
    }
  }, [isLoading, canAccess, requireNoAuth, isLoggedIn, navigate]);

  if (isLoading || !canAccess) {
    return null;
  }

  return <>{children}</>;
}
