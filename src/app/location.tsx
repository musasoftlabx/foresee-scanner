import { FlatList, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";

type ScannedBarcode = {
  id: string;
  barcode: string;
  name: string;
  lastScannedOn: string;
};

const barcodeItems: ScannedBarcode[] = Array.from(
  { length: 50 },
  (_, index) => {
    const id = index + 1;
    const barcode = String(1000000000000 + id);
    const scannedDate = new Date();
    scannedDate.setMinutes(scannedDate.getMinutes() - index * 17);

    return {
      id: String(id),
      barcode,
      name: `Product ${id}`,
      lastScannedOn: scannedDate.toISOString().replace("T", " ").slice(0, 16),
    };
  },
);

export default function Location() {
  const navigation = useNavigation();

  const physicalCount = barcodeItems.length;
  const systemCount = 47;
  const discrepancy = physicalCount - systemCount;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: `Barcodes scanned under ${"location"}`,
      headerStyle: { backgroundColor: "#59168b", fontFamily: "JetBrainsMono" },
    });
  }, [navigation]);

  return (
    <View className="flex flex-1 bg-purple-100 dark:bg-purple-900 px-4 pt-6">
      <StatusBar style="dark" animated />

      <LinearGradient
        colors={["#2563eb", "#16a34a"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 10,
          marginBottom: 14,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-white text-xs"
            >
              Physical Count
            </Text>
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-white text-xl mt-2"
            >
              {physicalCount}
            </Text>
          </View>

          <View className="w-px bg-white/40 mx-2" />

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-white text-xs"
            >
              Discrepancy
            </Text>
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-white text-xl mt-2"
            >
              {discrepancy}
            </Text>
          </View>

          <View className="w-px bg-white/40 mx-2" />

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-white text-xs"
            >
              System Count
            </Text>
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-white text-xl mt-2"
            >
              {systemCount}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View className="rounded-t-lg border border-white/20 bg-white/20 px-3 py-2 flex-row">
        <Text
          style={{ fontFamily: "JetBrainsMono", flex: 1.3 }}
          className="text-white text-xs"
        >
          Barcode
        </Text>
        <Text
          style={{ fontFamily: "JetBrainsMono", flex: 1 }}
          className="text-white text-xs"
        >
          Name
        </Text>
        <Text
          style={{ fontFamily: "JetBrainsMono", flex: 1.2 }}
          className="text-white text-xs"
        >
          Last Scanned On
        </Text>
      </View>

      <FlatList
        data={barcodeItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View className="border-x border-b border-white/20 bg-white/10 px-3 py-3 flex-row">
            <Text
              style={{ fontFamily: "JetBrainsMono", flex: 1.3 }}
              className="text-white text-xs"
            >
              {item.barcode}
            </Text>
            <Text
              style={{ fontFamily: "JetBrainsMono", flex: 1 }}
              className="text-white text-xs"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={{ fontFamily: "JetBrainsMono", flex: 1.2 }}
              className="text-white text-xs"
              numberOfLines={1}
            >
              {item.lastScannedOn}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
