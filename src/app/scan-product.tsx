import { Text, View } from "react-native";
import { useTheme } from "@/hooks/use-theme";

export default function ScanProduct() {
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
        Scan Product Screen
      </Text>
      <Text
        style={{ fontSize: 16, color: colors.textSecondary, marginTop: 12 }}
      >
        This is a simple scan product page boilerplate.
      </Text>
    </View>
  );
}
