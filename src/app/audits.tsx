import { useCallback, useLayoutEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/hooks/use-theme";

type AuditRouteParams = {
  id?: string;
  code?: string;
  name?: string;
};

type Audit = {
  id: string;
  code: string;
  date: string;
  barcode: { mode: string; characters: number };
  locations: number;
  scans: number;
};

function formatAuditDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getCoveragePalette(coverage: number, isDark: boolean) {
  if (coverage < 40) {
    return {
      cardBorderColor: isDark
        ? "rgba(252,165,165,0.35)"
        : "rgba(239,68,68,0.3)",
      actionColor: isDark ? "#fecdd3" : "#dc2626",
    };
  }
  if (coverage < 75) {
    return {
      cardBorderColor: isDark
        ? "rgba(253,230,138,0.35)"
        : "rgba(245,158,11,0.3)",
      actionColor: isDark ? "#fde68a" : "#d97706",
    };
  }
  return {
    cardBorderColor: isDark ? "rgba(167,243,208,0.35)" : "rgba(16,185,129,0.3)",
    actionColor: isDark ? "#a7f3d0" : "#059669",
  };
}

export default function Audits() {
  // ? Hooks
  const { id, code, name } = useLocalSearchParams<AuditRouteParams>();
  const navigation = useNavigation();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // ? Validate
  const storeId = Number(id);
  const hasValidStoreId = Number.isFinite(storeId);

  const { data, error, isError, isPending, isRefetching, refetch } = useQuery({
    queryKey: ["audits", storeId],
    queryFn: ({ queryKey }) =>
      axios(
        `${queryKey[0]}?store=${queryKey[1]}&limit=20&offset=0&refines=%7B%22sortModel%22:%5B%7B%22field%22:%22id%22,%22sort%22:%22desc%22%7D%5D%7D`,
      ),
    select: ({ data }: { data: { dataset: Audit[] } }) => data.dataset,
    enabled: hasValidStoreId,
  });

  const refreshStores = useCallback(async () => await refetch(), [refetch]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: `Audits under ${name}`,
      headerStyle: {
        backgroundColor: colors.headerBackground,
        fontFamily: "JetBrainsMono",
      },
      headerTintColor: colors.headerTint,
    });
  }, [navigation, name, colors]);

  if (isPending) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} animated />
        <ActivityIndicator size="large" color={colors.accent} />
        <Text
          style={{
            fontFamily: "JetBrainsMono",
            color: colors.textSecondary,
            fontSize: 13,
            marginTop: 12,
          }}
        >
          Loading audits...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} animated />
        <Text
          style={{
            fontFamily: "JetBrainsMono",
            color: colors.text,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          Failed to load audits. {error instanceof Error ? error.message : ""}
        </Text>
        <Pressable
          onPress={refreshStores}
          style={{
            marginTop: 16,
            borderRadius: 8,
            backgroundColor: colors.backgroundElement,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{ fontFamily: "JetBrainsMono", color: colors.textSecondary }}
          >
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!hasValidStoreId) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} animated />
        <Text
          style={{
            fontFamily: "JetBrainsMono",
            color: colors.text,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          Missing store params from route.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingTop: 24,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} animated />

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
        refreshing={isRefetching}
        onRefresh={refreshStores}
        renderItem={({ item }) => {
          const scanCoverage =
            item.locations > 0
              ? Math.min(100, Math.round((item.scans / item.locations) * 100))
              : 0;
          const palette = getCoveragePalette(scanCoverage, isDark);

          return (
            <Pressable
              style={({ pressed }) => ({
                flex: 1,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: palette.cardBorderColor,
                backgroundColor: colors.backgroundElement,
                padding: 14,
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              })}
              onPress={() =>
                router.push({
                  pathname: "/locations",
                  params: { id: item.id, code: item.code },
                })
              }
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.text,
                      fontSize: 15,
                      fontWeight: "700",
                    }}
                    numberOfLines={1}
                  >
                    {item.code}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.textSecondary,
                      fontSize: 11,
                      marginTop: 4,
                    }}
                    numberOfLines={1}
                  >
                    {formatAuditDate(item.date)}
                  </Text>
                </View>

                <View
                  style={{
                    marginTop: 4,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      fontSize: 14,
                      marginRight: 2,
                      color: palette.actionColor,
                    }}
                  >
                    Open
                  </Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={16}
                    color={palette.actionColor}
                  />
                </View>
              </View>

              <View
                style={{
                  marginTop: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: isDark
                    ? "rgba(0,0,0,0.2)"
                    : colors.backgroundSelected,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.textSecondary,
                      fontSize: 10,
                    }}
                  >
                    Barcode Mode
                  </Text>
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.text,
                      fontSize: 10,
                    }}
                  >
                    {item.barcode.mode}
                  </Text>
                </View>
                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.border,
                    marginVertical: 8,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.textSecondary,
                      fontSize: 10,
                    }}
                  >
                    Characters
                  </Text>
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.text,
                      fontSize: 10,
                    }}
                  >
                    {item.barcode.characters}
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
                <View
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundSelected,
                    paddingHorizontal: 8,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.textSecondary,
                      fontSize: 10,
                    }}
                  >
                    Locations
                  </Text>
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.text,
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  >
                    {item.locations}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundSelected,
                    paddingHorizontal: 8,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.textSecondary,
                      fontSize: 10,
                    }}
                  >
                    Scans
                  </Text>
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.text,
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  >
                    {item.scans}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text
            style={{
              fontFamily: "JetBrainsMono",
              color: colors.textSecondary,
              textAlign: "center",
              marginTop: 32,
            }}
          >
            No audits found.
          </Text>
        }
      />
    </View>
  );
}
