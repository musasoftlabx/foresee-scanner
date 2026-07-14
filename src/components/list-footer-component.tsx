// * React Native
import { ActivityIndicator, Text, View } from "react-native";

// * Hooks
import { useTheme } from "@/hooks/use-theme";

export default function ListFooterComponent({
  isFetchingNextPage,
}: {
  isFetchingNextPage: boolean;
}) {
  // ? Hooks
  const { colors } = useTheme();

  return isFetchingNextPage ? (
    <View style={{ paddingVertical: 10, alignItems: "center" }}>
      <ActivityIndicator size="small" color={colors.accent} />
      <Text
        style={{
          fontFamily: "JetBrainsMono",
          color: colors.textSecondary,
          fontSize: 11,
          marginTop: 8,
        }}
      >
        Loading more stores...
      </Text>
    </View>
  ) : null;
}
