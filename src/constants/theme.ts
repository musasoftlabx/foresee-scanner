/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#2d1b69",
    background: "#faf5ff",
    backgroundElement: "#f3e8ff",
    backgroundSelected: "#ede9fe",
    textSecondary: "#9333ea",
    // drawer / header
    drawerBackground: "#f3f4f6",
    headerBackground: "#9333ea",
    headerTint: "#ffffff",
    drawerActiveTint: "#6d28d9",
    drawerInactiveTint: "#4b5563",
    border: "rgba(147,51,234,0.2)",
    accent: "#9333ea",
  },
  dark: {
    // violet-950 base
    text: "#ede9fe",
    background: "#2d1b69",
    backgroundElement: "#4c1d95",
    backgroundSelected: "#5b21b6",
    textSecondary: "#c4b5fd",
    // drawer / header
    drawerBackground: "#2d1b69",
    headerBackground: "#1e1b4b",
    headerTint: "#ede9fe",
    drawerActiveTint: "#ddd6fe",
    drawerInactiveTint: "rgba(221,214,254,0.6)",
    border: "rgba(196,181,253,0.2)",
    accent: "#d8b4fe",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** JetBrainsMono from Tailwind config */
    sans: "JetBrainsMono-Regular",
    serif: "JetBrainsMono-Regular",
    rounded: "JetBrainsMono-Regular",
    mono: "JetBrainsMono-Regular",
  },
  android: {
    sans: "JetBrainsMono-Regular",
    serif: "JetBrainsMono-Regular",
    rounded: "JetBrainsMono-Regular",
    mono: "JetBrainsMono-Regular",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
