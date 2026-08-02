import { create } from "zustand";
import type { SafeUser } from "@/types/auth";
import * as authApi from "@/lib/auth.api";

interface AuthState {
  user: SafeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    fullName: string;
    role: "STUDENT" | "INSTRUCTOR";
  }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  // Starts true, not false. ProtectedRoute reads isLoading/isAuthenticated
  // synchronously on first render, before AuthProvider's loadUser() effect
  // has a chance to run (child effects fire before parent effects in React).
  // With isLoading defaulting to false, a real logged-in user hitting a hard
  // refresh on a protected page would be redirected to /login before their
  // session cookie is ever checked. Starting true forces ProtectedRoute to
  // wait and show a loading state until loadUser() genuinely resolves.
  isLoading: true,
  isAuthenticated: false,

  login: async (input) => {
    set({ isLoading: true });
    try {
      const user = await authApi.login(input);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (input) => {
    set({ isLoading: true });
    try {
      const user = await authApi.register(input);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Called on app boot to restore session from httpOnly cookie
  loadUser: async () => {
    set({ isLoading: true });
    try {
      await authApi.refreshToken();
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearAuth: () => {
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));