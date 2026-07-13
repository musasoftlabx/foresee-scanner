import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { DrawerActions } from "expo-router/react-navigation";

type Store = {
  id: string;
  code: string;
  name: string;
  client: string;
  country: string;
};

type StoresPage = {
  stores: Store[];
  nextOffset?: number;
};

// function toArrayPayload(payload: unknown): unknown[] {
//   if (Array.isArray(payload)) {
//     return payload;
//   }

//   if (payload && typeof payload === "object") {
//     const record = payload as Record<string, unknown>;
//     const candidates = [
//       record.stores,
//       record.items,
//       record.dataset,
//       record.results,
//       record.data,
//       record.rows,
//     ];

//     for (const candidate of candidates) {
//       if (Array.isArray(candidate)) {
//         return candidate;
//       }

//       if (candidate && typeof candidate === "object") {
//         const nested = candidate as Record<string, unknown>;
//         if (Array.isArray(nested.stores)) {
//           return nested.stores;
//         }
//         if (Array.isArray(nested.items)) {
//           return nested.items;
//         }
//       }
//     }
//   }

//   return [];
// }

// function normalizeStore(item: unknown, index: number): Store {
//   const record = (item ?? {}) as Record<string, unknown>;
//   const storeCode = String(
//     record.storeCode ??
//       record.store_code ??
//       record.code ??
//       `STORE-${index + 1}`,
//   );
//   const id = String(record.id ?? record._id ?? storeCode);

//   return {
//     id,
//     storeCode,
//     storeName: String(record.storeName ?? record.store_name ?? "Unknown Store"),
//     client: String(record.client ?? record.clientName ?? "N/A"),
//     country: String(record.country ?? record.countryName ?? "N/A"),
//   };
// }

export default function Stores() {
  // ? Hooks
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const router = useRouter();

  // ? Constants
  const PAGE_SIZE = height / 50;

  // ? State
  const [searchQuery, setSearchQuery] = useState("");

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
    queryKey: ["stores"],
    queryFn: async ({ queryKey, pageParam: offset }): Promise<StoresPage> => {
      const response = await axios(
        `${queryKey[0]}?limit=20&offset=0&refines={%22filterModel%22:{%22items%22:[],%22logicOperator%22:%22and%22,%22quickFilterValues%22:[],%22quickFilterLogicOperator%22:%22and%22},%22sortModel%22:[{%22field%22:%22name%22,%22sort%22:%22asc%22}]}`,
        {
          params: {
            limit: PAGE_SIZE,
            offset,
            page: Math.floor(offset / PAGE_SIZE) + 1,
          },
        },
      );

      const payload = response.data;
      const stores: Store[] = payload.dataset;

      const nextOffsetRaw =
        payload.nextOffset ?? payload.next_offset ?? payload.offsetNext;
      const hasMoreRaw = payload.hasMore ?? payload.has_more;
      const totalRaw = payload.total ?? payload.totalCount ?? payload.count;

      if (typeof nextOffsetRaw === "number") {
        return { stores, nextOffset: nextOffsetRaw };
      }

      if (typeof hasMoreRaw === "boolean") {
        return {
          stores,
          nextOffset: hasMoreRaw ? offset + PAGE_SIZE : undefined,
        };
      }

      if (typeof totalRaw === "number") {
        const hasMoreFromTotal = offset + stores.length < totalRaw;
        return {
          stores,
          nextOffset: hasMoreFromTotal ? offset + PAGE_SIZE : undefined,
        };
      }

      return {
        stores,
        nextOffset:
          stores.length === PAGE_SIZE ? offset + PAGE_SIZE : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });

  // ? Memo
  const stores = useMemo(
    () => data?.pages.flatMap((page) => page.stores) ?? [],
    [data],
  );

  const filteredStores = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return stores;
    }

    return stores.filter((store) => {
      return (
        store.code.toLowerCase().includes(normalizedQuery) ||
        store.name.toLowerCase().includes(normalizedQuery) ||
        store.client.toLowerCase().includes(normalizedQuery) ||
        store.country.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchQuery, stores]);

  // const loadMoreStores = useCallback(() => {
  //   if (!hasNextPage || isFetchingNextPage) {
  //     return;
  //   }

  //   fetchNextPage();
  // }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const refresh = useCallback(async () => await refetch(), [refetch]);

  useLayoutEffect(() => {
    if (typeof navigation.setOptions !== "function") {
      return;
    }

    navigation.setOptions({
      headerTitle: () => (
        <View
          style={{
            width: Math.max(220, width - 24),
            height: 48,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.35)",
            borderRadius: 50,
            backgroundColor: "rgba(0, 0, 0, 0.15)",
          }}
        >
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            className="mr-3 px-1"
          >
            <MaterialIcons color="white" name="menu" size={24} />
          </Pressable>

          <MaterialIcons
            name="search"
            size={24}
            color="rgba(255, 255, 255, 1)"
          />
          <TextInput
            allowFontScaling={false}
            autoCapitalize="words"
            autoCorrect={false}
            placeholder="Search store"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            returnKeyType="search"
            selectionColor="rgba(255, 255, 255, 0.9)"
            value={searchQuery}
            onChangeText={setSearchQuery}
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
      ),
      headerStyle: { backgroundColor: "#59168b" },
      headerTintColor: "white",
      headerLeft: () => null,
      headerRight: () => null,
      headerTitleContainerStyle: { left: 0, right: 0, alignItems: "center" },
    });
  }, [navigation, searchQuery, width]);

  if (isPending) {
    return (
      <View className="flex flex-1 bg-purple-100 dark:bg-purple-900 items-center justify-center">
        <StatusBar style="light" animated />
        <ActivityIndicator size="large" color="white" />
        <Text
          style={{ fontFamily: "JetBrainsMono" }}
          className="text-white/80 text-sm mt-3"
        >
          Loading stores...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex flex-1 bg-purple-100 dark:bg-purple-900 items-center justify-center px-6">
        <StatusBar style="light" animated />
        <Text
          style={{ fontFamily: "JetBrainsMono" }}
          className="text-white text-center text-sm"
        >
          Failed to load stores. {error instanceof Error ? error.message : ""}
        </Text>
        <Pressable
          onPress={refresh}
          className="mt-4 rounded-lg bg-white/20 px-4 py-2"
        >
          <Text style={{ fontFamily: "JetBrainsMono" }} className="text-white">
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex flex-1 bg-purple-100 dark:bg-purple-900 px-4 pt-6">
      <StatusBar style="light" animated />

      <FlatList
        data={filteredStores}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
        refreshing={isRefetching}
        onRefresh={refresh}
        onEndReachedThreshold={0.4}
        onEndReached={useCallback(() => {
          if (!hasNextPage || isFetchingNextPage) return;
          fetchNextPage();
        }, [fetchNextPage, hasNextPage, isFetchingNextPage])}
        renderItem={({ item }) => {
          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/audits",
                  params: { id: item.id, code: item.code, name: item.name },
                })
              }
              className="flex flex-1 rounded-xl border border-white/20 bg-white/10 p-3"
            >
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-white text-base font-bold"
              >
                {item.code}
              </Text>
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-white text-sm mt-1"
              >
                {item.name}
              </Text>
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-white/90 text-xs mt-2"
              >
                Client: {item.client}
              </Text>
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-white/90 text-xs"
              >
                Country: {item.country}
              </Text>
            </Pressable>
          );
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ paddingVertical: 10, alignItems: "center" }}>
              <ActivityIndicator size="small" color="white" />
              <Text
                style={{ fontFamily: "JetBrainsMono" }}
                className="text-white/80 text-xs mt-2"
              >
                Loading more stores...
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <Text
            style={{ fontFamily: "JetBrainsMono" }}
            className="text-white/80 text-center mt-8"
          >
            No stores found.
          </Text>
        }
      />
    </View>
  );
}
