import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore, type ThemePreference } from "@/store/theme";
import { useTheme } from "@/hooks/use-theme";

const OPTIONS: {
  value: ThemePreference;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "light", icon: "sunny-outline" },
  { value: "dark", icon: "moon-outline" },
  { value: "system", icon: "phone-portrait-outline" },
];

interface ThemeToggleProps {
  size?: number;
}

export function ThemeToggle({ size = 16 }: ThemeToggleProps) {
  const { preference, setPreference } = useThemeStore();
  const { isDark, colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 10,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {OPTIONS.map((option) => {
        const isActive = preference === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => setPreference(option.value)}
            accessibilityRole="button"
            accessibilityLabel={`${option.value} theme`}
            style={{
              paddingVertical: 7,
              paddingHorizontal: 11,
              backgroundColor: isActive
                ? isDark
                  ? "rgba(165,180,252,0.2)"
                  : "rgba(99,102,241,0.12)"
                : "transparent",
            }}
          >
            <Ionicons
              name={option.icon}
              size={size}
              color={
                isActive
                  ? colors.accent
                  : isDark
                    ? "rgba(165,180,252,0.4)"
                    : "rgba(99,102,241,0.35)"
              }
            />
          </Pressable>
        );
      })}
    </View>
  );
}
