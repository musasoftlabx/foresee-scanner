import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import type { ListRenderItem } from "react-native";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash/debounce";
import { useTheme } from "@/hooks/use-theme";

type AuditRouteParams = { id?: string; code?: string };

type Location = {
  id: number;
  physicalCount: number;
  systemCount: number;
  modified: { by: string; on: string };
};

type LocationsPage = { locations: Location[]; nextOffset?: number };

type StatCard = {
  title: "Total" | "Counted" | "Not Counted" | "Discrepancies";
  value: number;
  colors: [string, string];
  textColor: string;
};

function formatScanDate(value: string) {
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

function getVariancePalette(variance: number, isDark: boolean) {
  if (variance === 0) {
    return {
      borderColor: isDark ? "rgba(167,243,208,0.35)" : "rgba(16,185,129,0.3)",
      badgeBg: isDark ? "rgba(52,211,153,0.2)" : "rgba(16,185,129,0.1)",
      badgeBorderColor: isDark
        ? "rgba(167,243,208,0.35)"
        : "rgba(16,185,129,0.3)",
      badgeText: isDark ? "#a7f3d0" : "#065f46",
      arrowColor: isDark ? "#a7f3d0" : "#059669",
      label: "Balanced",
    };
  }
  if (Math.abs(variance) <= 5) {
    return {
      borderColor: isDark ? "rgba(253,230,138,0.35)" : "rgba(245,158,11,0.3)",
      badgeBg: isDark ? "rgba(251,191,36,0.2)" : "rgba(245,158,11,0.1)",
      badgeBorderColor: isDark
        ? "rgba(253,230,138,0.35)"
        : "rgba(245,158,11,0.3)",
      badgeText: isDark ? "#fde68a" : "#92400e",
      arrowColor: isDark ? "#fde68a" : "#d97706",
      label: "Minor Drift",
    };
  }
  return {
    borderColor: isDark ? "rgba(252,165,165,0.35)" : "rgba(239,68,68,0.3)",
    badgeBg: isDark ? "rgba(251,113,133,0.2)" : "rgba(239,68,68,0.1)",
    badgeBorderColor: isDark ? "rgba(252,165,165,0.35)" : "rgba(239,68,68,0.3)",
    badgeText: isDark ? "#fecdd3" : "#b91c1c",
    arrowColor: isDark ? "#fecdd3" : "#dc2626",
    label: "High Drift",
  };
}

export default function Locations() {
  // ? Hooks
  const { id } = useLocalSearchParams<AuditRouteParams>();
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const auditId = 4; //Number(id);
  const hasValidAuditId = Number.isFinite(auditId);

  // ? Constants
  const PAGE_SIZE = 10; //Math.max(1, Math.floor(height / 170));

  // ? State
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdateCountModalVisible, setIsUpdateCountModalVisible] =
    useState(false);
  const [newPhysicalCount, setNewPhysicalCount] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null,
  );

  /* const [stats, setStats] = useState([
    {
      color: '#fff',
      colors: ['#8a5bea', '#45e0ff'],
      count: 0,
      filters: [],
      icon: require(`../assets/icons/total.png`),
      name: 'Total',
      onPress: () => {
        storage.set('filterLocationsBy', 'Total');
        fetchLocations([]);
      },
    },
    {
      color: '#fff',
      colors: ['#3CB371', '#98FB98'],
      count: 0,
      filters: [
        {
          operator: 'custom',
          property: 'counted',
          value: 1,
        },
      ],
      icon: require(`../assets/icons/counted.png`),
      name: 'Counted',
      onPress: () => {
        storage.set('filterLocationsBy', 'Counted');
        fetchLocations([
          {
            operator: 'custom',
            property: 'counted',
            value: 1,
          },
        ]);
      },
    },
    {
      border: 1,
      color: 'rgba(0, 0, 0, 0.5)',
      colors: ['#fafafa', '#FFF'],
      count: 0,
      filters: [
        {
          operator: 'eq',
          property: 'isVerified',
          value: 0,
        },
        {
          operator: 'eq',
          property: 'systemCount',
          value: 0,
        },
      ],
      icon: require(`../assets/icons/not_counted.png`),
      name: 'Not Counted',
      onPress: () => {
        storage.set('filterLocationsBy', 'Not Counted');
        fetchLocations([
          {
            operator: 'eq',
            property: 'isVerified',
            value: 0,
          },
          {
            operator: 'eq',
            property: 'systemCount',
            value: 0,
          },
        ]);
      },
    },
    {
      color: '#fff',
      colors: ['#B22222', '#F08080'],
      count: 0,
      filters: [
        {
          operator: 'custom',
          property: 'discrepancy',
          value: 0,
        },
      ],
      icon: require(`../assets/icons/discrepancy.png`),
      name: 'Discrepancies',
      onPress: () => {
        storage.set('filterLocationsBy', 'Discrepancies');
        fetchLocations([
          {
            operator: 'custom',
            property: 'discrepancy',
            value: 0,
          },
        ]);
      },
    },
  ]); */

  // ? Callbacks
  const getSuggestions = useCallback(async (query: string) => {
    if (query.length > 0) {
    } else {
    }
  }, []);

  // ? Debounce entry
  const debounced = useCallback(debounce(getSuggestions, 500), []);

  // ? Query
  const {
    data,
    error,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
    isRefetching,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["locations", auditId],
    queryFn: async ({
      queryKey,
      pageParam: offset,
    }): Promise<LocationsPage> => {
      const response = await axios(`${queryKey[0]}`, {
        params: {
          audit: queryKey[1],
          limit: PAGE_SIZE,
          offset,
          page: Math.floor(offset / PAGE_SIZE) + 1,
          refines: `{"sortModel":[{"field":"id","sort":"asc"}]}`,
          // refines: {
          //   filterModel: {
          //     items: [],
          //     logicOperator: "and",
          //     quickFilterValues: [],
          //     quickFilterLogicOperator: "and",
          //   },
          //   sortModel: [{ field: "name", sort: "asc" }],
          // },
        },
      });

      const payload = response.data;
      const locations: Location[] = payload.dataset;
      const step = locations.length > 0 ? locations.length : PAGE_SIZE;

      const nextOffsetRaw =
        payload.nextOffset ?? payload.next_offset ?? payload.offsetNext;
      const hasMoreRaw = payload.hasMore ?? payload.has_more;
      const totalRaw = payload.total ?? payload.totalCount ?? payload.count;

      const nextOffset =
        typeof nextOffsetRaw === "number"
          ? nextOffsetRaw
          : Number(nextOffsetRaw);
      const hasMore =
        typeof hasMoreRaw === "boolean"
          ? hasMoreRaw
          : String(hasMoreRaw).toLowerCase() === "true";
      const total = typeof totalRaw === "number" ? totalRaw : Number(totalRaw);

      if (Number.isFinite(nextOffset)) {
        return { locations, nextOffset };
      }

      if (typeof hasMoreRaw !== "undefined") {
        return {
          locations,
          nextOffset: hasMore ? offset + step : undefined,
        };
      }

      if (Number.isFinite(total)) {
        const hasMoreFromTotal = offset + locations.length < total;
        return {
          locations,
          nextOffset: hasMoreFromTotal ? offset + step : undefined,
        };
      }

      return {
        locations,
        nextOffset: locations.length >= PAGE_SIZE ? offset + step : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: hasValidAuditId,
  });

  const { mutate: rescanLocationMutate } = useMutation({
    mutationKey: ["rescan-location", auditId],
    mutationFn: async (locationId: number) =>
      axios.put("locations/rescan", {
        audit: auditId,
        location: locationId,
      }),
    onSuccess: () => {
      refetch();
    },
  });

  // ? Memo
  const locations = useMemo(
    () => data?.pages.flatMap((page) => page.locations) ?? [],
    [data],
  );

  const filteredLocations = useMemo(
    () =>
      locations.filter((location) => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
          return true;
        }

        return (
          String(location.id).includes(query) ||
          String(location.physicalCount).includes(query) ||
          String(location.systemCount).includes(query)
        );
      }),
    [locations, searchQuery],
  );

  const stats = useMemo<StatCard[]>(() => {
    const total = locations.length;
    const counted = locations.filter(
      (location) => location.physicalCount > 0,
    ).length;
    const notCounted = total - counted;
    const discrepancies = locations.filter(
      (location) => location.physicalCount !== location.systemCount,
    ).length;

    return [
      {
        title: "Total",
        value: total,
        colors: ["#2563eb", "#1d4ed8"],
        textColor: "#ffffff",
      },
      {
        title: "Counted",
        value: counted,
        colors: ["#22c55e", "#15803d"],
        textColor: "#ffffff",
      },
      {
        title: "Not Counted",
        value: notCounted,
        colors: ["#ffffff", "#e5e7eb"],
        textColor: "#111827",
      },
      {
        title: "Discrepancies",
        value: discrepancies,
        colors: ["#ef4444", "#b91c1c"],
        textColor: "#ffffff",
      },
    ];
  }, [locations]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <MaterialIcons
            color={colors.headerTint}
            name="search"
            size={24}
            style={{ marginRight: 12 }}
          />
          <TextInput
            autoCapitalize="characters"
            maxLength={5}
            //onChangeText={(text: string) => setSearchQuery(text)}
            onChangeText={(text: string) => (
              debounced(text),
              setSearchQuery(text)
            )}
            placeholder="Search Locations"
            placeholderTextColor={`${colors.headerTint}99`}
            returnKeyType="search"
            style={{
              color: colors.headerTint,
              fontFamily: "JetBrainsMono",
              fontSize: 20,
              width: Dimensions.get("window").width * 0.55,
            }}
            value={searchQuery}
          />
          {/* {searchQuery.length > 0 ? (
            // @ts-ignore
            <AnimatedClearIcon
              animation="slideInRight"
              name="close"
              onPress={() => setSearchQuery("")}
              size={26}
              style={{
                color: "rgba(0, 0, 0, 0.3)",
                position: "absolute",
                right: 0,
              }}
            />
          ) : (
            // @ts-ignore
            <AnimatedClearIcon
              animation="fadeOut"
              name="close"
              size={26}
              style={{
                color: "rgba(0, 0, 0, 0.3)",
                position: "absolute",
                right: 0,
              }}
            />
          )} */}
        </View>
      ),
      /* headerTitle: () => (
        <View
          style={{
            width: Math.max(220, width - 24),
            height: 46,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.35)",
            borderRadius: 10,
            backgroundColor: "rgba(0, 0, 0, 0.15)",
          }}
        >
          <MaterialIcons
            name="search"
            size={18}
            color="rgba(255, 255, 255, 0.85)"
          />
          <TextInput
            allowFontScaling={false}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={5}
            placeholder="Search location"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            returnKeyType="search"
            selectionColor="rgba(255, 255, 255, 0.9)"
            value={searchQuery}
            onChangeText={(text: string) => (
              debounced(text),
              setSearchQuery(text)
            )}
            style={{
              color: "white",
              fontFamily: "JetBrainsMono",
              fontSize: 16,
              flex: 1,
              marginLeft: 8,
              paddingVertical: 2,
            }}
          />
          {searchQuery.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
              onPress={() => setSearchQuery("")}
              style={{ padding: 2 }}
            >
              <MaterialIcons
                name="close"
                size={18}
                color="rgba(255, 255, 255, 0.85)"
              />
            </Pressable>
          ) : null}
        </View>
      ), */
      headerStyle: {
        backgroundColor: colors.headerBackground,
      },
      headerTintColor: colors.headerTint,
      headerRight: () => null,
      headerTitleContainerStyle: {
        left: 0,
        right: 0,
        alignItems: "center",
      },
    });
  }, [navigation, searchQuery, colors, debounced]);

  const refresh = useCallback(async () => await refetch(), [refetch]);

  const loadMoreLocations = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const confirmRescan = useCallback(
    (locationId: number) => {
      Alert.alert("Rescan Location", "Proceed to rescan this location?", [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => rescanLocationMutate(locationId),
        },
      ]);
    },
    [rescanLocationMutate],
  );

  const openRecountModal = useCallback((locationId: number) => {
    setSelectedLocationId(locationId);
    setNewPhysicalCount("");
    setIsUpdateCountModalVisible(true);
  }, []);

  const closeRecountModal = useCallback(() => {
    setIsUpdateCountModalVisible(false);
    setNewPhysicalCount("");
    setSelectedLocationId(null);
  }, []);

  const setCount = useCallback(() => {
    // TODO: Wire this to your recount/update endpoint.
    closeRecountModal();
  }, [closeRecountModal]);

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: 24 }}
    >
      <StatusBar style={isDark ? "light" : "dark"} animated />

      <FlatList
        horizontal
        data={stats}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => {
          return (
            <LinearGradient
              colors={item.colors}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                width: 146,
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 12,
                marginRight: 10,
              }}
            >
              <Text
                style={{
                  color: item.textColor,
                  fontFamily: "JetBrainsMono",
                  fontSize: 12,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  color: item.textColor,
                  fontFamily: "JetBrainsMono",
                  fontSize: 24,
                  marginTop: 8,
                }}
              >
                {item.value}
              </Text>
            </LinearGradient>
          );
        }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 14, paddingLeft: 16 }}
      />

      <FlatList
        data={filteredLocations}
        keyExtractor={(item) => String(item.id)}
        onEndReachedThreshold={0.4}
        onEndReached={loadMoreLocations}
        contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}
        refreshing={isRefetching}
        onRefresh={refresh}
        ListFooterComponent={
          <View style={{ paddingVertical: 12, alignItems: "center" }}>
            {isFetchingNextPage ? (
              <>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text
                  style={{
                    fontFamily: "JetBrainsMono",
                    color: colors.textSecondary,
                    fontSize: 11,
                    marginTop: 6,
                  }}
                >
                  Loading more locations...
                </Text>
              </>
            ) : hasNextPage ? (
              <Pressable
                onPress={loadMoreLocations}
                style={{
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundElement,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: "JetBrainsMono",
                    color: colors.textSecondary,
                    fontSize: 11,
                  }}
                >
                  Load more
                </Text>
              </Pressable>
            ) : locations.length > 0 ? (
              <Text
                style={{
                  fontFamily: "JetBrainsMono",
                  color: colors.textSecondary,
                  fontSize: 11,
                }}
              >
                You have reached the end.
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item: location }) => {
          const variance = location.physicalCount - location.systemCount;
          const palette = getVariancePalette(variance, isDark);

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/location",
                  params: { storecode: location.id },
                })
              }
              style={({ pressed }) => ({
                borderRadius: 16,
                borderWidth: 1,
                borderColor: palette.borderColor,
                backgroundColor: colors.backgroundElement,
                paddingHorizontal: 14,
                paddingVertical: 14,
                marginBottom: 10,
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              })}
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
                    }}
                    numberOfLines={1}
                  >
                    Location {location.id}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.textSecondary,
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    {formatScanDate(location.modified.on)}
                  </Text>
                </View>

                <View
                  style={{
                    borderRadius: 50,
                    borderWidth: 1,
                    borderColor: palette.badgeBorderColor,
                    backgroundColor: palette.badgeBg,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: palette.badgeText,
                      fontSize: 10,
                    }}
                  >
                    {palette.label}
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
                <View
                  style={{
                    paddingVertical: 8,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.textSecondary,
                      fontSize: 10,
                    }}
                  >
                    Physical
                  </Text>
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.text,
                      fontSize: 22,
                      marginTop: 4,
                    }}
                  >
                    {location.physicalCount}
                  </Text>
                </View>

                <View
                  style={{
                    width: 1,
                    backgroundColor: colors.border,
                    marginHorizontal: 8,
                  }}
                />

                <View
                  style={{
                    paddingVertical: 8,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.textSecondary,
                      fontSize: 10,
                    }}
                  >
                    System
                  </Text>
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.text,
                      fontSize: 22,
                      marginTop: 4,
                    }}
                  >
                    {location.systemCount}
                  </Text>
                </View>

                <View style={{ flex: 1 }} />

                <View
                  style={{
                    paddingLeft: 10,
                    paddingVertical: 8,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: colors.textSecondary,
                      fontSize: 10,
                    }}
                  >
                    Variance
                  </Text>
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: palette.badgeText,
                      fontSize: 22,
                      marginTop: 4,
                    }}
                  >
                    {variance > 0 ? `+${variance}` : variance}
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => confirmRescan(location.id)}
                  style={({ pressed }) => ({
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: isDark
                      ? "rgba(0,0,0,0.2)"
                      : colors.backgroundSelected,
                    paddingVertical: 10,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <MaterialIcons
                    name="qr-code-scanner"
                    size={15}
                    color={palette.arrowColor}
                  />
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: palette.arrowColor,
                      fontSize: 11,
                      marginLeft: 6,
                    }}
                  >
                    Rescan
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => openRecountModal(location.id)}
                  style={({ pressed }) => ({
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundSelected,
                    paddingVertical: 10,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <MaterialIcons
                    name="playlist-add-check-circle"
                    size={15}
                    color={palette.arrowColor}
                  />
                  <Text
                    style={{
                      fontFamily: "JetBrainsMono",
                      color: palette.arrowColor,
                      fontSize: 11,
                      marginLeft: 6,
                    }}
                  >
                    Recount
                  </Text>
                </Pressable>
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
            No locations found.
          </Text>
        }
      />

      <Modal
        transparent
        visible={isUpdateCountModalVisible}
        animationType="fade"
        onRequestClose={closeRecountModal}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.55)",
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              width: "100%",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.backgroundElement,
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                color: colors.text,
                fontSize: 15,
              }}
            >
              Update Physical Count
            </Text>

            {selectedLocationId ? (
              <Text
                style={{
                  fontFamily: "JetBrainsMono",
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Location {selectedLocationId}
              </Text>
            ) : null}

            <TextInput
              value={newPhysicalCount}
              onChangeText={setNewPhysicalCount}
              keyboardType="number-pad"
              placeholder="New Physical Count"
              placeholderTextColor={
                isDark ? "rgba(165,180,252,0.5)" : "rgba(99,102,241,0.4)"
              }
              style={{
                marginTop: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: isDark
                  ? "rgba(0,0,0,0.2)"
                  : colors.backgroundSelected,
                paddingHorizontal: 12,
                paddingVertical: 12,
                color: colors.text,
                fontFamily: "JetBrainsMono",
              }}
            />

            <View
              style={{
                marginTop: 16,
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <Pressable
                onPress={closeRecountModal}
                style={({ pressed }) => ({
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundSelected,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text
                  style={{
                    fontFamily: "JetBrainsMono",
                    color: colors.textSecondary,
                    fontSize: 12,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={setCount}
                style={({ pressed }) => ({
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark
                    ? "rgba(167,243,208,0.35)"
                    : "rgba(16,185,129,0.4)",
                  backgroundColor: isDark
                    ? "rgba(52,211,153,0.2)"
                    : "rgba(16,185,129,0.1)",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text
                  style={{
                    fontFamily: "JetBrainsMono",
                    color: isDark ? "#a7f3d0" : "#065f46",
                    fontSize: 12,
                  }}
                >
                  Set Count
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
