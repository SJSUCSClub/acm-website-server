import { ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import NotFoundPage from '@/components/organisms/not-found-page';

interface ProtectedRouteProps {
  children: ReactNode;
  requireNoAuth?: boolean;
  requireAdmin?: boolean;
  showNotFoundOnUnauthorized?: boolean;
}

export function ProtectedRoute({
  children,
  requireNoAuth = false,
  requireAdmin = false,
  showNotFoundOnUnauthorized = false
}: ProtectedRouteProps) {
  const { isLoggedIn, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !showNotFoundOnUnauthorized) {
      if (!isLoggedIn) {
        if (!requireNoAuth) {
          navigate({ to: '/login' });
        } else if (requireAdmin && !isAdmin) {
          navigate({ to: '/dashboard' });
        }
      } else if (requireNoAuth) {
        navigate({ to: '/dashboard' });
      }
    }
  }, [
    isLoggedIn,
    isLoading,
    isAdmin,
    requireAdmin,
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
      (isLoggedIn && requireNoAuth))
  ) {
    return <NotFoundPage />;
  }

  if (
    (!requireNoAuth && !isLoggedIn) ||
    (requireAdmin && !isAdmin) ||
    (isLoggedIn && requireNoAuth)
  ) {
    return null;
  }

  return <>{children}</>;
}
