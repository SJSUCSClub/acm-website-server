import NotFoundPage from '@/components/organisms/not-found-page';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireNoAuth?: boolean;
  requireAdmin?: boolean;
  requireMember?: boolean;
  showNotFoundOnUnauthorized?: boolean;
}

export function ProtectedRoute({
  children,
  requireNoAuth = false,
  requireAdmin = false,
  requireMember = false,
  showNotFoundOnUnauthorized = false
}: ProtectedRouteProps) {
  const { isLoggedIn, isLoading, isAdmin, isMember } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !showNotFoundOnUnauthorized) {
      if (!isLoggedIn) {
        if (!requireNoAuth) {
          navigate({ to: '/login' });
        } else if (requireAdmin && !isAdmin) {
          navigate({ to: '/account/dashboard' });
        } else if (requireMember && !isMember) {
          navigate({ to: '/account/dashboard' });
        }
      } else if (requireNoAuth) {
        navigate({ to: '/account/dashboard' });
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
    showNotFoundOnUnauthorized,
    requireNoAuth
  ]);

  if (isLoading) {
    return null;
  }

  if (
    showNotFoundOnUnauthorized &&
    ((!requireNoAuth && !isLoggedIn) ||
      (requireAdmin && !isAdmin) ||
      (requireMember && !isMember) ||
      (isLoggedIn && requireNoAuth))
  ) {
    return <NotFoundPage />;
  }

  if (
    (!requireNoAuth && !isLoggedIn) ||
    (requireAdmin && !isAdmin) ||
    (requireMember && !isMember) ||
    (isLoggedIn && requireNoAuth)
  ) {
    return null;
  }

  return <>{children}</>;
}
