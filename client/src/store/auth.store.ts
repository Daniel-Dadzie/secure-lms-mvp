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
  isLoading: false,
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