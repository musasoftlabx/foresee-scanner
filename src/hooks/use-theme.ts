/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeStore, type ThemePreference } from "@/store/theme";

export function useTheme() {
  const scheme = useColorScheme();
  const resolvedScheme = scheme === "dark" ? "dark" : "light";
  return {
    colors: Colors[resolvedScheme],
    isDark: resolvedScheme === "dark",
    scheme: resolvedScheme,
  };
}

export function useThemePreference(): {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
} {
  const { preference, setPreference } = useThemeStore();
  return { preference, setPreference };
}
