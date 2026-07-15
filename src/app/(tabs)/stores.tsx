// * React
// biome-ignore assist/source/organizeImports: <ignore lint: false positive>
import { useCallback, useLayoutEffect, useMemo, useState } from "react";

// * React Native
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

// * Expo
import {
  Feather,
  MaterialIcons,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useNavigation, useRouter } from "expo-router";
import { DrawerActions } from "expo-router/react-navigation";

// * Libraries
import { useInfiniteQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

// * Hooks
import { useTheme } from "@/hooks/use-theme";

// * Stores
import { useAuthStore } from "@/store/auth";

// * Components
import ListEmptyComponent from "@/components/list-empty-component";
import ListFooterComponent from "@/components/list-footer-component";

// * Types
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

export default function Stores() {
  // ? Hooks
  const { colors, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();
  const router = useRouter();
  const { organizations } = useAuthStore();

  // ? Constants
  const PAGE_SIZE = 20; //height / 50;
  const activeOrganization =
    organizations?.find((org) => org.isActive)?.name ??
    "No active organization";

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
    queryKey: ["stores", organizations?.find((org) => org.isActive)?.id],
    queryFn: async ({ queryKey, pageParam: offset }): Promise<StoresPage> => {
      const response = await axios(`${queryKey[0]}`, {
        params: {
          organizationId: queryKey[1],
          limit: PAGE_SIZE,
          offset,
          page: Math.floor(offset / PAGE_SIZE) + 1,
          refines: JSON.stringify({
            sortModel: [{ field: "name", sort: "asc" }],
            filterModel: {
              items: [],
              logicOperator: "and",
              quickFilterValues: [],
              quickFilterLogicOperator: "and",
            },
          }),
        },
      });

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

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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

  const refresh = useCallback(async () => await refetch(), [refetch]);

  useLayoutEffect(() => {
    if (typeof navigation.setOptions !== "function") {
      return;
    }

    navigation.setOptions({
      headerTitle: () => (
        <View
          style={{
            width: Math.max(width - 64, 220),
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            borderColor: "rgba(255,255,255,0.3)",
            //borderWidth: 1,
            //borderRadius: 50,
            //backgroundColor: "rgba(0,0,0,0.15)",
          }}
        >
          <Octicons name="search" size={20} color={`${colors.headerTint}99`} />
          <TextInput
            allowFontScaling={false}
            autoCapitalize="words"
            autoCorrect={false}
            placeholder="Search store"
            placeholderTextColor={`${colors.headerTint}99`}
            returnKeyType="search"
            selectionColor={colors.headerTint}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              color: colors.headerTint,
              fontFamily: "JetBrainsMono",
              fontSize: 16,
              flex: 1,
              marginLeft: 8,
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
                color={`${colors.headerTint}cc`}
              />
            </Pressable>
          ) : null}
        </View>
      ),
      headerStyle: { backgroundColor: colors.headerBackground },
      headerTintColor: colors.headerTint,
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          style={{ marginHorizontal: 15 }}
        >
          <Feather color={colors.headerTint} name="sidebar" size={20} />
        </Pressable>
      ),
      headerRight: () => null,
      headerTitleContainerStyle: { left: 0, right: 0, alignItems: "center" },
    });
  }, [navigation, searchQuery, width, colors]);

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
          Loading stores...
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
        <MaterialCommunityIcons
          name="close-network-outline"
          size={80}
          color={colors.textSecondary}
          style={{ opacity: 0.4, marginBottom: 16 }}
        />

        <Text
          style={{
            fontFamily: "JetBrainsMono",
            color: colors.text,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          Failed to load stores.{" "}
          {error instanceof AxiosError ? error.message : ""}
        </Text>
        <Pressable
          onPress={refresh}
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

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} animated />

      <View
        className="flex-row items-center gap-2 my-4 pb-3 px-4"
        style={{ borderBottomWidth: 1, borderColor: colors.border }}
      >
        <View
          className="w-10 h-10 rounded-md flex items-center justify-center border"
          style={{
            backgroundColor: `${colors.border}`,
            borderColor: colors.border,
          }}
        >
          <Text
            className="text-2xl"
            style={{
              color: colors.textSecondary,
              fontFamily: "JetBrainsMono-ExtraBold",
            }}
          >
            {activeOrganization.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View>
          <Text
            className="text-[13px] tracking-widest"
            style={{
              color: colors.textSecondary,
              fontFamily: "JetBrainsMono-ExtraBold",
            }}
          >
            ORGANIZATION
          </Text>
          <Text
            className="text-xl"
            style={{ color: colors.text, fontFamily: "JetBrainsMono" }}
          >
            {activeOrganization}
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredStores}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{
          gap: 12,
          paddingBottom: 16,
          paddingHorizontal: 16,
        }}
        refreshing={isRefetching}
        onRefresh={refresh}
        onEndReachedThreshold={0.4}
        onEndReached={handleEndReached}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/audits",
                params: { id: item.id, code: item.code, name: item.name },
              })
            }
            style={{
              flex: 1,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.backgroundElement,
              padding: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                color: colors.text,
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              {item.code}
            </Text>
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                color: colors.text,
                fontSize: 13,
                marginTop: 4,
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                color: colors.textSecondary,
                fontSize: 11,
                marginTop: 8,
              }}
            >
              Client: {item.client}
            </Text>
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                color: colors.textSecondary,
                fontSize: 11,
              }}
            >
              Country: {item.country}
            </Text>
          </Pressable>
        )}
        ListFooterComponent={
          <ListFooterComponent isFetchingNextPage={isFetchingNextPage} />
        }
        ListEmptyComponent={<ListEmptyComponent entity="stores" />}
      />
    </View>
  );
}
