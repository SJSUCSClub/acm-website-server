import { ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import NotFoundPage from '@/components/organisms/not-found-page';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireMember?: boolean;
  showNotFoundOnUnauthorized?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireMember = false,
  showNotFoundOnUnauthorized = false
}: ProtectedRouteProps) {
  const { isLoggedIn, isLoading, isAdmin, isMember } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !showNotFoundOnUnauthorized) {
      if (!isLoggedIn) {
        navigate({ to: '/login' });
      } else if (requireAdmin && !isAdmin) {
        navigate({ to: '/' });
      } else if (requireMember && !isMember) {
        navigate({ to: '/' });
      }
    }
  }, [
    isLoggedIn,
    isLoading,
    isAdmin,
    isMember,
    requireAdmin,
    requireMember,
    navigate,
    showNotFoundOnUnauthorized
  ]);

  if (isLoading) {
    return null;
  }

  if (
    showNotFoundOnUnauthorized &&
    (!isLoggedIn || (requireAdmin && !isAdmin) || (requireMember && !isMember))
  ) {
    return <NotFoundPage />;
  }

  if (!isLoggedIn || (requireAdmin && !isAdmin) || (requireMember && !isMember)) {
    return null;
  }

  return <>{children}</>;
}
