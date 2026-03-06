import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }), // Only persist user
    }
  )
);
