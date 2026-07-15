import { FlatList, Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/hooks/use-theme";

type Scanner = {
  id: string;
  firstName: string;
  lastName: string;
  device: string;
  scanCount: number;
  status: "active" | "idle" | "offline";
};

const MOCK_SCANNERS: Scanner[] = [
  {
    id: "1",
    firstName: "James",
    lastName: "Odhiambo",
    device: "Samsung A54",
    scanCount: 1482,
    status: "active",
  },
  {
    id: "2",
    firstName: "Faith",
    lastName: "Njeri",
    device: "Redmi Note 12",
    scanCount: 973,
    status: "active",
  },
  {
    id: "3",
    firstName: "Brian",
    lastName: "Mutua",
    device: "iPhone 13",
    scanCount: 2104,
    status: "idle",
  },
  {
    id: "4",
    firstName: "Aisha",
    lastName: "Mohamed",
    device: "Tecno Camon 20",
    scanCount: 657,
    status: "active",
  },
  {
    id: "5",
    firstName: "Kevin",
    lastName: "Waweru",
    device: "Samsung A34",
    scanCount: 318,
    status: "offline",
  },
  {
    id: "6",
    firstName: "Grace",
    lastName: "Atieno",
    device: "Infinix Hot 40",
    scanCount: 1290,
    status: "idle",
  },
  {
    id: "7",
    firstName: "Dennis",
    lastName: "Kamau",
    device: "Pixel 7a",
    scanCount: 1751,
    status: "active",
  },
  {
    id: "8",
    firstName: "Mary",
    lastName: "Wanjiku",
    device: "Redmi 12C",
    scanCount: 89,
    status: "offline",
  },
];

const STATUS_CONFIG = {
  active: { label: "Active", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  idle: { label: "Idle", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  offline: { label: "Offline", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

function getInitials(first: string, last: string) {
  return `${first[0]}${last[0]}`.toUpperCase();
}

export default function Scanners() {
  const { colors, isDark } = useTheme();

  const totalScans = MOCK_SCANNERS.reduce((sum, s) => sum + s.scanCount, 0);
  const activeCount = MOCK_SCANNERS.filter((s) => s.status === "active").length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} animated />

      <FlatList
        data={MOCK_SCANNERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View>
            {/* Summary cards */}
            <View className="flex-row gap-3 mt-5 mb-5">
              <View
                className="flex-1 rounded-2xl p-4 border"
                style={{
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                }}
              >
                <MaterialIcons name="groups" size={22} color={colors.accent} />
                <Text
                  className="text-2xl font-bold mt-1"
                  style={{
                    color: colors.text,
                    fontFamily: "JetBrainsMono-Bold",
                  }}
                >
                  {MOCK_SCANNERS.length}
                </Text>
                <Text
                  className="text-[11px] mt-0.5 tracking-wide"
                  style={{
                    color: colors.textSecondary,
                    fontFamily: "JetBrainsMono",
                  }}
                >
                  TOTAL OPERATORS
                </Text>
              </View>

              <View
                className="flex-1 rounded-2xl p-4 border"
                style={{
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                }}
              >
                <MaterialIcons name="wifi" size={22} color="#22c55e" />
                <Text
                  className="text-2xl font-bold mt-1"
                  style={{
                    color: colors.text,
                    fontFamily: "JetBrainsMono-Bold",
                  }}
                >
                  {activeCount}
                </Text>
                <Text
                  className="text-[11px] mt-0.5 tracking-wide"
                  style={{
                    color: colors.textSecondary,
                    fontFamily: "JetBrainsMono",
                  }}
                >
                  ACTIVE NOW
                </Text>
              </View>

              <View
                className="flex-1 rounded-2xl p-4 border"
                style={{
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                }}
              >
                <MaterialIcons
                  name="qr-code-scanner"
                  size={22}
                  color={colors.accent}
                />
                <Text
                  className="text-2xl font-bold mt-1"
                  style={{
                    color: colors.text,
                    fontFamily: "JetBrainsMono-Bold",
                  }}
                >
                  {(totalScans / 1000).toFixed(1)}k
                </Text>
                <Text
                  className="text-[11px] mt-0.5 tracking-wide"
                  style={{
                    color: colors.textSecondary,
                    fontFamily: "JetBrainsMono",
                  }}
                >
                  TOTAL SCANS
                </Text>
              </View>
            </View>

            <Text
              className="text-[11px] tracking-widest mb-3 px-1"
              style={{
                color: colors.textSecondary,
                fontFamily: "JetBrainsMono",
              }}
            >
              SCAN OPERATORS
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = STATUS_CONFIG[item.status];
          const maxScans = Math.max(...MOCK_SCANNERS.map((s) => s.scanCount));
          const progress = item.scanCount / maxScans;

          return (
            <Pressable
              className="mb-3 rounded-2xl border p-4"
              style={{
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center gap-3">
                {/* Avatar */}
                <View
                  className="size-11 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${colors.accent}20` }}
                >
                  <Text
                    className="text-[15px]"
                    style={{
                      color: colors.accent,
                      fontFamily: "JetBrainsMono-Bold",
                    }}
                  >
                    {getInitials(item.firstName, item.lastName)}
                  </Text>
                </View>

                {/* Name & device */}
                <View className="flex-1">
                  <Text
                    className="text-[15px]"
                    style={{
                      color: colors.text,
                      fontFamily: "JetBrainsMono-Bold",
                    }}
                  >
                    {item.firstName} {item.lastName}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <MaterialIcons
                      name="smartphone"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text
                      className="text-[12px]"
                      style={{
                        color: colors.textSecondary,
                        fontFamily: "JetBrainsMono",
                      }}
                    >
                      {item.device}
                    </Text>
                  </View>
                </View>

                {/* Status badge */}
                <View
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: status.bg }}
                >
                  <Text
                    className="text-[11px] tracking-wide"
                    style={{
                      color: status.color,
                      fontFamily: "JetBrainsMono-Bold",
                    }}
                  >
                    {status.label.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Scan count + progress bar */}
              <View className="mt-3">
                <View className="flex-row justify-between items-center mb-1.5">
                  <Text
                    className="text-[11px] tracking-widest"
                    style={{
                      color: colors.textSecondary,
                      fontFamily: "JetBrainsMono",
                    }}
                  >
                    SCANS
                  </Text>
                  <Text
                    className="text-[13px]"
                    style={{
                      color: colors.text,
                      fontFamily: "JetBrainsMono-Bold",
                    }}
                  >
                    {item.scanCount.toLocaleString()}
                  </Text>
                </View>

                {/* Progress bar track */}
                <View
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: `${colors.accent}20` }}
                >
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(progress * 100)}%`,
                      backgroundColor: status.color,
                    }}
                  />
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
