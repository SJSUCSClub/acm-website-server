import { create } from 'zustand';
import { paths } from '@/types/schema.v1';
import { api } from '@/hooks/useFetch';

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
      const { data, response } = await api.GET('/v1/users/my');

      if (!response.ok) {
        set({
          isLoading: false,
          error: 'Failed to fetch user',
          isAuthenticated: false
        });
        return;
      }

      set({
        user: data || null,
        isLoading: false,
        error: null,
        isAuthenticated: true
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        isAuthenticated: false
      });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const { response } = await api.GET('/v1/auth/logout');

      set({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false
      });

      if (!response.ok) {
        console.error('Failed to logout on server, but local state has been cleared');
        return;
      }
    } catch (error) {
      set({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false
      });
      console.error(
        'Error during logout:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  },

  clearError: () => set({ error: null })
}));
