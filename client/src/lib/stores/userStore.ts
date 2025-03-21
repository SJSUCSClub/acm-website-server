import { create } from 'zustand';
import { paths } from '@/types/schema.v1';

type User = paths['/v1/users/my']['get']['responses']['200']['content']['application/json'];

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/v1/auth/me', {
        method: 'GET',
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        set({
          isLoading: false,
          error: errorData.error || 'Failed to fetch user',
          isAuthenticated: false,
        });
        return;
      }

      const userData = await response.json();
      set({
        user: userData[0] || null,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        isAuthenticated: false,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        set({
          isLoading: false,
          error: errorData.error || 'Failed to logout',
        });
        return;
      }

      set({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      });

      window.location.href = '/';
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
