// * React Native
import { Text, View } from "react-native";

// * Icons
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";

// * Hooks
import { useTheme } from "@/hooks/use-theme";

export default function ListEmptyComponent({ entity }: { entity: string }) {
  // ? Hooks
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        marginTop: 48,
        paddingHorizontal: 24,
      }}
    >
      <MaterialIcons
        name="store"
        size={80}
        color={colors.textSecondary}
        style={{ opacity: 0.4, marginBottom: 16 }}
      />
      <Text
        style={{
          fontFamily: "JetBrainsMono",
          color: colors.textSecondary,
          textAlign: "center",
          fontSize: 14,
          fontWeight: "600",
        }}
      >
        No {entity} found.
      </Text>
      <Text
        style={{
          fontFamily: "JetBrainsMono",
          color: colors.textSecondary,
          textAlign: "center",
          fontSize: 12,
          marginTop: 8,
          opacity: 0.7,
        }}
      >
        Try adjusting your search filters
      </Text>
    </View>
  );
}
