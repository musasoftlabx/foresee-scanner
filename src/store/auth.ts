import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Buffer } from "buffer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export type User = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  roles: string[];
};
export type Organization = {
  id: number;
  name: string;
  isActive: boolean;
};

interface AuthStore {
  isLoggedIn: boolean;
  user: User | null;
  organizations: Organization[];
  login: ({
    token,
    organizations,
  }: {
    token: string;
    organizations: Organization[];
  }) => void;
  logout: () => void;
  changeActiveOrganization: (organizations: Organization[]) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      organizations: [],
      login: ({ token, organizations }) =>
        set({
          isLoggedIn: true,
          user: JSON.parse(
            Buffer.from(token.split(".")[1], "base64").toString(),
          ),
          organizations,
        }),
      logout: () => set({ isLoggedIn: false, user: null, organizations: [] }),
      changeActiveOrganization: (organizations) =>
        set({ ...AsyncStorage, organizations }),
    }),
    { name: "user", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
