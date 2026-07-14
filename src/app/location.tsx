import { FlatList, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import { useTheme } from "@/hooks/use-theme";

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
  const { colors, isDark } = useTheme();

  const physicalCount = barcodeItems.length;
  const systemCount = 47;
  const discrepancy = physicalCount - systemCount;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: `Barcodes scanned under ${"location"}`,
      headerStyle: {
        backgroundColor: colors.headerBackground,
        fontFamily: "JetBrainsMono",
      },
      headerTintColor: colors.headerTint,
    });
  }, [navigation, colors]);

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
              style={{
                fontFamily: "JetBrainsMono",
                color: "#fff",
                fontSize: 12,
              }}
            >
              Physical Count
            </Text>
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                color: "#fff",
                fontSize: 20,
                marginTop: 8,
              }}
            >
              {physicalCount}
            </Text>
          </View>

          <View className="w-px bg-white/40 mx-2" />

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                color: "#fff",
                fontSize: 12,
              }}
            >
              Discrepancy
            </Text>
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                color: "#fff",
                fontSize: 20,
                marginTop: 8,
              }}
            >
              {discrepancy}
            </Text>
          </View>

          <View className="w-px bg-white/40 mx-2" />

          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                color: "#fff",
                fontSize: 12,
              }}
            >
              System Count
            </Text>
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                color: "#fff",
                fontSize: 20,
                marginTop: 8,
              }}
            >
              {systemCount}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View
        style={{
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.backgroundElement,
          paddingHorizontal: 12,
          paddingVertical: 8,
          flexDirection: "row",
        }}
      >
        <Text
          style={{
            fontFamily: "JetBrainsMono",
            flex: 1.3,
            color: colors.textSecondary,
            fontSize: 12,
          }}
        >
          Barcode
        </Text>
        <Text
          style={{
            fontFamily: "JetBrainsMono",
            flex: 1,
            color: colors.textSecondary,
            fontSize: 12,
          }}
        >
          Name
        </Text>
        <Text
          style={{
            fontFamily: "JetBrainsMono",
            flex: 1.2,
            color: colors.textSecondary,
            fontSize: 12,
          }}
        >
          Last Scanned On
        </Text>
      </View>

      <FlatList
        data={barcodeItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View
            style={{
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderBottomWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.backgroundElement,
              paddingHorizontal: 12,
              paddingVertical: 12,
              flexDirection: "row",
            }}
          >
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                flex: 1.3,
                color: colors.text,
                fontSize: 12,
              }}
            >
              {item.barcode}
            </Text>
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                flex: 1,
                color: colors.text,
                fontSize: 12,
              }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                flex: 1.2,
                color: colors.textSecondary,
                fontSize: 12,
              }}
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
