import { create } from "zustand";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  name: string;
};

interface AuthStore {
  isLoggedIn: boolean;
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  isLoggedIn: true,
  user: null,
  login: (user) => set({ isLoggedIn: true, user }),
  logout: () => set({ isLoggedIn: false, user: null }),
}));
