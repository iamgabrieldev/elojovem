import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/lib/types/domain';

interface UserStore {
  user: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearUser: () => set({ user: null, error: null }),
    }),
    {
      name: 'user-store',
      version: 1,
    }
  )
);
