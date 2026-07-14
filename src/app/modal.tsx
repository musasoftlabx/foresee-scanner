import { View, Text } from "react-native";
import { useTheme } from "@/hooks/use-theme";

export default function Modal() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ color: colors.text }}>Modal</Text>
    </View>
  );
}
