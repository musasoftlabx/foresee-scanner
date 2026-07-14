import { Text, View } from "react-native";
import { useTheme } from "@/hooks/use-theme";

export default function ScanLocation() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 16,
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ fontWeight: "700", fontSize: 24, color: colors.text }}>
        Scan Location Screen
      </Text>
      <Text
        style={{ fontSize: 16, color: colors.textSecondary, marginTop: 12 }}
      >
        This is a simple scan location page boilerplate.
      </Text>
    </View>
  );
}
