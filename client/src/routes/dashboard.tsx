import { createFileRoute, Navigate } from '@tanstack/react-router';
import Dashboard from '@/pages/dashboard/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/dashboard')({
  component: DashboardRouteComponent
});

function DashboardRouteComponent() {
  const { isLoggedIn, isLoading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setAuthorized(isLoggedIn);
    }
  }, [isLoggedIn, isLoading]);

  if (isLoading || authorized === null) {
    return null;
  }

  if (!authorized) {
    return <Navigate to="/login" />;
  }

  return <Dashboard />;
}
