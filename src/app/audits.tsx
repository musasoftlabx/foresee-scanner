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

function getCoveragePalette(coverage: number) {
  if (coverage < 40) {
    return {
      badgeWrap: "bg-rose-400/20 border-rose-300/35",
      badgeText: "text-rose-200",
      cardBorder: "border-rose-300/35",
      actionText: "text-rose-200",
      actionIcon: "#fecdd3",
    };
  }

  if (coverage < 75) {
    return {
      badgeWrap: "bg-amber-400/20 border-amber-300/35",
      badgeText: "text-amber-100",
      cardBorder: "border-amber-300/35",
      actionText: "text-amber-100",
      actionIcon: "#fde68a",
    };
  }

  return {
    badgeWrap: "bg-emerald-400/20 border-emerald-300/35",
    badgeText: "text-emerald-200",
    cardBorder: "border-emerald-300/35",
    actionText: "text-emerald-200",
    actionIcon: "#a7f3d0",
  };
}

export default function Audits() {
  // ? Hooks
  const { id, code, name } = useLocalSearchParams<AuditRouteParams>();
  const navigation = useNavigation();
  const router = useRouter();

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
      headerStyle: { backgroundColor: "#59168b", fontFamily: "JetBrainsMono" },
    });
  }, [navigation]);

  if (isPending) {
    return (
      <View className="flex flex-1 bg-purple-100 dark:bg-purple-900 items-center justify-center">
        <StatusBar style="light" animated />
        <ActivityIndicator size="large" color="white" />
        <Text
          style={{ fontFamily: "JetBrainsMono" }}
          className="text-white/80 text-sm mt-3"
        >
          Loading audits...
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
          Failed to load audits. {error instanceof Error ? error.message : ""}
        </Text>
        <Pressable
          onPress={refreshStores}
          className="mt-4 rounded-lg bg-white/20 px-4 py-2"
        >
          <Text style={{ fontFamily: "JetBrainsMono" }} className="text-white">
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!hasValidStoreId) {
    return (
      <View className="flex flex-1 bg-purple-100 dark:bg-purple-900 items-center justify-center px-6">
        <StatusBar style="light" animated />
        <Text
          style={{ fontFamily: "JetBrainsMono" }}
          className="text-white text-center text-sm"
        >
          Missing store params from route.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex flex-1 bg-purple-100 dark:bg-purple-900 px-4 pt-6">
      <StatusBar style="light" animated />

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
          const palette = getCoveragePalette(scanCoverage);

          return (
            <Pressable
              className={`flex flex-1 rounded-2xl border bg-white/12 p-3.5 ${palette.cardBorder}`}
              style={({ pressed }) => ({
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
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white text-base font-bold"
                    numberOfLines={1}
                  >
                    {item.code}
                  </Text>
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white/75 text-[11px] mt-1"
                    numberOfLines={1}
                  >
                    {formatAuditDate(item.date)}
                  </Text>
                </View>

                <View className="mt-1 flex-row items-center justify-end">
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className={`text-[16px] mr-1 ${palette.actionText}`}
                  >
                    Open
                  </Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={16}
                    color={palette.actionIcon}
                  />
                </View>

                {/* <View
                  className={`rounded-full border px-2 py-1 ${palette.badgeWrap}`}
                >
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className={`text-[10px] ${palette.badgeText}`}
                  >
                    {scanCoverage}%
                  </Text>
                </View> */}
              </View>

              <View className="mt-3 rounded-lg border border-white/20 bg-black/15 px-2.5 py-2">
                <View className="flex-row items-center justify-between">
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white/80 text-[10px]"
                  >
                    Barcode Mode
                  </Text>
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white text-[10px]"
                  >
                    {item.barcode.mode}
                  </Text>
                </View>
                <View className="h-px bg-white/10 my-2" />
                <View className="flex-row items-center justify-between">
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white/80 text-[10px]"
                  >
                    Characters
                  </Text>
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white text-[10px]"
                  >
                    {item.barcode.characters}
                  </Text>
                </View>
              </View>

              <View className="mt-3 flex-row gap-2">
                <View className="flex-1 rounded-lg bg-white/12 border border-white/20 px-2 py-2">
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white/75 text-[10px]"
                  >
                    Locations
                  </Text>
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white text-sm mt-1"
                  >
                    {item.locations}
                  </Text>
                </View>
                <View className="flex-1 rounded-lg bg-white/12 border border-white/20 px-2 py-2">
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white/75 text-[10px]"
                  >
                    Scans
                  </Text>
                  <Text
                    style={{ fontFamily: "JetBrainsMono" }}
                    className="text-white text-sm mt-1"
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
            style={{ fontFamily: "JetBrainsMono" }}
            className="text-white/80 text-center mt-8"
          >
            No audits found.
          </Text>
        }
      />
    </View>
  );
}
