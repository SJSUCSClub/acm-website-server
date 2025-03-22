import { createFileRoute, Navigate } from '@tanstack/react-router';
import SignIn from '../pages/LogIn';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/login')({
  component: LoginRouteComponent
});

function LoginRouteComponent() {
  const { isLoggedIn, isLoading } = useAuth();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setAuthenticated(isLoggedIn);
    }
  }, [isLoggedIn, isLoading]);

  if (isLoading || authenticated === null) {
    return null;
  }

  if (authenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <SignIn />;
}
