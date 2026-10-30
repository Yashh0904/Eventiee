import { create } from "zustand";

export type UserRole = "USER" | "ADMIN";

export type AuthStatus = "loading" | "authenticated" | "anonymous"

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  authStatus: AuthStatus;
  setAuth: (user: User, accessToken: string) => void;
  setAuthStatus: (status: AuthStatus) => void;
  updateUser: (updatedFields: Partial<User>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    user: null,
    accessToken: null,
    authStatus: "loading",
    setAuth: (user, accessToken) =>
      set({
        user,
        accessToken,
        authStatus: "authenticated",
      }),
      setAuthStatus: (authStatus) => set({ authStatus }),
    updateUser: (updatedFields) =>
      set((state) => ({
        user: state.user ? { ...state.user, ...updatedFields } : null,
      })),
    clearAuth: () =>
      set({
        user: null,
        accessToken: null,
        authStatus: "anonymous",
      }),
  }),
);
