import { create } from "zustand";
import type { SafeUser } from "@/types/auth";
import * as authApi from "@/lib/auth.api";

interface AuthState {
  user: SafeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (input: {
    email: string;
    password: string;
  }) => Promise<void>;

  register: (input: {
    email: string;
    password: string;
    fullName: string;
    role: "STUDENT" | "INSTRUCTOR";
  }) => Promise<void>;

  logout: () => Promise<void>;

  loadUser: () => Promise<void>;

  clearAuth: () => void;

  setSession: (user: SafeUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  // Keep true during initial session restoration.
  isLoading: true,

  isAuthenticated: false,

  login: async (input) => {
    set({ isLoading: true });

    try {
      const user = await authApi.login(input);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
      });

      throw error;
    }
  },

  register: async (input) => {
    set({ isLoading: true });

    try {
      const user = await authApi.register(input);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
      });

      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await authApi.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // ---------------------------------------------------------------------------
  // Restore session after page refresh.
  //
  // The refresh call uses the shared single-flight refresh mechanism.
  // ---------------------------------------------------------------------------
  loadUser: async () => {
    set({
      isLoading: true,
    });

    try {
      console.log("[AUTH] Restoring session...");

      await authApi.refreshToken();

      console.log("[AUTH] Access token restored");

      const user = await authApi.getMe();

      console.log("[AUTH] Session restored successfully");

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.warn(
        "[AUTH] Session restoration failed:",
        error
      );

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setSession: (user) => {
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },
}));
