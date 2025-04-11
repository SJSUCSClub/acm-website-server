import { ReactNode, useEffect } from 'react';
import { useUserStore } from './store/userStore';
import Spinner from '@/components/atoms/spinner';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { fetchUser, isLoading } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return <Spinner />;
  }

  return <>{children}</>;
}
