import { useUserStore } from '@/lib/store/userStore';

export function useAuth() {
  const { user, isLoading, error, isAuthenticated, fetchUser, logout, clearError } = useUserStore();

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    fetchUser,
    logout,
    clearError,
    isLoggedIn: isAuthenticated && user !== null,
    isAdmin: isAuthenticated && user?.role === 'admin',
    isMember: isAuthenticated && (user?.role === 'member' || user?.role === 'admin')
  };
}
