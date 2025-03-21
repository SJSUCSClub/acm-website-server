import { ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireMember?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireMember = false,
}: ProtectedRouteProps) {
  const { isLoggedIn, isLoading, isAdmin, isMember } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        navigate({ to: '/login' });
      } else if (requireAdmin && !isAdmin) {
        navigate({ to: '/' });
      } else if (requireMember && !isMember) {
        navigate({ to: '/' });
      }
    }
  }, [isLoggedIn, isLoading, isAdmin, isMember, requireAdmin, requireMember, navigate]);

  if (isLoading || !isLoggedIn || (requireAdmin && !isAdmin) || (requireMember && !isMember)) {
    return null;
  }

  return <>{children}</>;
}
