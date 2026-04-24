import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User, token: string) => void;
  updateUser: (partial: Partial<User>) => void;
  clearAuth: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user, token) => set({ user, token }),
      updateUser: (partial) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...partial } });
      },
      clearAuth: () => set({ user: null, token: null }),
      setLoading: (v) => set({ isLoading: v }),
    }),
    {
      name: "edyrix_student_auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);
