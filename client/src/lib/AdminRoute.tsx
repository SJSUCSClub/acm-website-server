import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import NotFoundPage from '@/components/organisms/not-found-page';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isLoggedIn, isLoading, isAdmin } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setAuthorized(isLoggedIn && isAdmin);
    }
  }, [isLoggedIn, isLoading, isAdmin]);

  if (isLoading || authorized === null) {
    return null;
  }

  if (!authorized) {
    return <NotFoundPage />;
  }

  return <>{children}</>;
}
