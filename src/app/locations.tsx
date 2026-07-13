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

function getVariancePalette(variance: number) {
  if (variance === 0) {
    return {
      border: "border-emerald-300/35",
      badgeWrap: "bg-emerald-400/20 border-emerald-300/35",
      badgeText: "text-emerald-200",
      arrow: "#a7f3d0",
      arrowText: "text-emerald-200",
      label: "Balanced",
    };
  }

  if (Math.abs(variance) <= 5) {
    return {
      border: "border-amber-300/35",
      badgeWrap: "bg-amber-400/20 border-amber-300/35",
      badgeText: "text-amber-100",
      arrow: "#fde68a",
      arrowText: "text-amber-100",
      label: "Minor Drift",
    };
  }

  return {
    border: "border-rose-300/35",
    badgeWrap: "bg-rose-400/20 border-rose-300/35",
    badgeText: "text-rose-200",
    arrow: "#fecdd3",
    arrowText: "text-rose-200",
    label: "High Drift",
  };
}

export default function Locations() {
  // ? Hooks
  const { id } = useLocalSearchParams<AuditRouteParams>();
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const router = useRouter();
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
            color="white"
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
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            returnKeyType="search"
            style={{
              color: "white",
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
        backgroundColor: "#59168b",
      },
      headerTintColor: "white",
      headerRight: () => null,
      headerTitleContainerStyle: {
        left: 0,
        right: 0,
        alignItems: "center",
      },
    });
  }, [navigation, searchQuery, width]);

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
    <View className="flex flex-1 bg-purple-100 dark:bg-purple-900 pt-6">
      <StatusBar style="dark" animated />

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
                <ActivityIndicator size="small" color="white" />
                <Text
                  style={{ fontFamily: "JetBrainsMono", marginTop: 6 }}
                  className="text-white/80 text-xs"
                >
                  Loading more locations...
                </Text>
              </>
            ) : hasNextPage ? (
              <Pressable
                onPress={loadMoreLocations}
                className="rounded-lg border border-white/30 bg-white/10 px-3 py-2"
              >
                <Text
                  style={{ fontFamily: "JetBrainsMono" }}
                  className="text-white/90 text-xs"
                >
                  Load more
                </Text>
              </Pressable>
            ) : locations.length > 0 ? (
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-white/60 text-xs"
              >
                You have reached the end.
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item: location }) => {
          const variance = location.physicalCount - location.systemCount;
          const palette = getVariancePalette(variance);

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/location",
                  params: { storecode: location.id },
                })
              }
              className={`rounded-2xl border bg-white/12 px-3.5 py-3.5 ${palette.border}`}
              style={({ pressed }) => ({
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.99 : 1 }],
                marginBottom: 10,
              })}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white text-base"
                    numberOfLines={1}
                  >
                    Location {location.id}
                  </Text>
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white/70 text-[11px] mt-1"
                  >
                    {formatScanDate(location.modified.on)}
                  </Text>
                </View>

                <View
                  className={`rounded-full border px-2 py-1 ${palette.badgeWrap}`}
                >
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className={`text-[10px] ${palette.badgeText}`}
                  >
                    {palette.label}
                  </Text>
                </View>
              </View>

              <View className="mt-3 flex-row gap-2">
                <View className="py-2 items-center justify-center">
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white/75 text-[10px]"
                  >
                    Physical
                  </Text>
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white text-2xl mt-1"
                  >
                    {location.physicalCount}
                  </Text>
                </View>

                <View className="w-px bg-white/20 mx-2" />

                <View className="py-2 items-center justify-center">
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white/75 text-[10px]"
                  >
                    System
                  </Text>
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white text-2xl mt-1"
                  >
                    {location.systemCount}
                  </Text>
                </View>

                {/* <View className="flex-1 rounded-lg border border-white/20 bg-black/15 px-2.5 py-2">
                  <View className="flex-row items-center justify-between">
                    <Text
                      style={{ fontFamily: "JetBrainsMono" }}
                      className="text-white/80 text-[10px]"
                    >
                      Variance
                    </Text>
                    <Text
                      style={{ fontFamily: "JetBrainsMono" }}
                      className={`text-[10px] ${palette.badgeText}`}
                    >
                      {variance > 0 ? `+${variance}` : variance}
                    </Text>
                  </View>
                </View> */}

                <View className="flex flex-1" />

                <View className="pl-2.5 py-2 items-center justify-center">
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white/75 text-[10px]"
                  >
                    Variance
                  </Text>
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className={`${palette.badgeText} text-white text-2xl mt-1`}
                  >
                    {variance > 0 ? `+${variance}` : variance}
                  </Text>
                </View>
              </View>

              <View className="mt-3 flex-row items-center justify-between">
                <View className="flex-1 flex-row gap-2">
                  <Pressable
                    onPress={() => confirmRescan(location.id)}
                    className="flex-1 flex-row items-center justify-center rounded-xl border border-white/25 bg-black/20 py-2.5"
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    <MaterialIcons
                      name="qr-code-scanner"
                      size={15}
                      color={palette.arrow}
                    />
                    <Text
                      style={{ fontFamily: "JetBrainsMono" }}
                      className={`text-[11px] ml-1.5 ${palette.arrowText}`}
                    >
                      Rescan
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => openRecountModal(location.id)}
                    className="flex-1 flex-row items-center justify-center rounded-xl border border-white/25 bg-white/12 py-2.5"
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    <MaterialIcons
                      name="playlist-add-check-circle"
                      size={15}
                      color={palette.arrow}
                    />
                    <Text
                      style={{ fontFamily: "JetBrainsMono" }}
                      className={`text-[11px] ml-1.5 ${palette.arrowText}`}
                    >
                      Recount
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text
            style={{ fontFamily: "JetBrainsMono" }}
            className="text-white/80 text-center mt-8"
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
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-2xl border border-white/25 bg-[#2c1450] px-4 py-4">
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-white text-base"
            >
              Update Physical Count
            </Text>

            {selectedLocationId ? (
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-white/70 text-xs mt-1"
              >
                Location {selectedLocationId}
              </Text>
            ) : null}

            <TextInput
              value={newPhysicalCount}
              onChangeText={setNewPhysicalCount}
              keyboardType="number-pad"
              placeholder="New Physical Count"
              placeholderTextColor="rgba(255,255,255,0.55)"
              className="mt-4 rounded-xl border border-white/25 bg-black/20 px-3 py-3 text-white"
              style={{ fontFamily: "JetBrainsMono" }}
            />

            <View className="mt-4 flex-row justify-end gap-2">
              <Pressable
                onPress={closeRecountModal}
                className="rounded-xl border border-white/25 bg-white/10 px-4 py-2"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text
                  style={{ fontFamily: "JetBrainsMono" }}
                  className="text-white text-xs"
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={setCount}
                className="rounded-xl border border-white/25 bg-emerald-500/25 px-4 py-2"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text
                  style={{ fontFamily: "JetBrainsMono" }}
                  className="text-emerald-100 text-xs"
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
