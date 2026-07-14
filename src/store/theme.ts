import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

// In-memory fallback (used when native MMKV/NitroModules are unavailable, e.g. Expo Go)
const memoryMap = new Map<string, string>();
const fallbackStorage = {
  getItem: (name: string) => memoryMap.get(name) ?? null,
  setItem: (name: string, value: string) => {
    memoryMap.set(name, value);
  },
  removeItem: (name: string) => {
    memoryMap.delete(name);
  },
};

function buildMMKVStorage() {
  try {
    // Dynamic require so the import doesn't crash at module-load time
    // when NitroModules native bindings are missing (e.g. Expo Go).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createMMKV } =
      require("react-native-mmkv") as typeof import("react-native-mmkv");
    const instance = createMMKV({ id: "theme-storage" });
    return {
      getItem: (name: string) => instance.getString(name) ?? null,
      setItem: (name: string, value: string) => instance.set(name, value),
      removeItem: (name: string) => instance.remove(name),
    };
  } catch {
    return fallbackStorage;
  }
}

const storage = buildMMKVStorage();

interface ThemeStore {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      preference: "system",
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: "theme-preference",
      storage: createJSONStorage(() => storage),
    },
  ),
);
