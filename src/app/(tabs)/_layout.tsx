import Drawer from "expo-router/drawer";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert, Pressable, Text, View } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from "expo-router/drawer";
import { useTheme } from "@/hooks/use-theme";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNavigation, useRouter } from "expo-router";

const ORGANIZATIONS = ["MusaSoft Labs", "Foresee Retail", "Field Ops East"];

function AppDrawerContent(props: DrawerContentComponentProps) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const router = useRouter();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.drawerBackground,
        paddingTop: 0,
      }}
    >
      <View
        style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 18 }}
      >
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: isDark
              ? "rgba(196,181,253,0.15)"
              : "rgba(147,51,234,0.12)",
            borderWidth: 1,
            borderColor: isDark
              ? "rgba(196,181,253,0.3)"
              : "rgba(147,51,234,0.25)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons
            name="person"
            size={28}
            color={isDark ? "#ddd6fe" : "#6d28d9"}
          />
        </View>
        <Text
          style={{
            fontFamily: "JetBrainsMono",
            marginTop: 12,
            color: colors.text,
            fontSize: 15,
          }}
        >
          John Scanner
        </Text>
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
        <DrawerItemList {...props} />
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
        <Text
          style={{
            fontFamily: "JetBrainsMono",
            color: colors.textSecondary,
            fontSize: 11,
            marginBottom: 8,
          }}
        >
          Organizations
        </Text>
        {ORGANIZATIONS.map((organization) => (
          <View
            key={organization}
            style={{
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: isDark
                ? "rgba(196,181,253,0.08)"
                : "rgba(147,51,234,0.06)",
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                color: colors.text,
                fontSize: 12,
              }}
            >
              {organization}
            </Text>
          </View>
        ))}
      </View>

      {/* Theme toggle */}
      <View
        style={{
          paddingHorizontal: 16,
          marginTop: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: "JetBrainsMono",
            color: colors.textSecondary,
            fontSize: 11,
          }}
        >
          Appearance
        </Text>
        <ThemeToggle size={15} />
      </View>

      <View
        style={{ marginTop: "auto", paddingHorizontal: 16, paddingBottom: 20 }}
      >
        <Pressable
          onPress={() => router.replace("/(auth)/login")}
          //onPress={() => navigation.navigate("/(auth)/login")}
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(252,165,165,0.35)",
            backgroundColor: "rgba(239,68,68,0.15)",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="logout" size={16} color="#fca5a5" />
            <Text
              style={{
                fontFamily: "JetBrainsMono",
                color: "#fca5a5",
                fontSize: 12,
                marginLeft: 8,
              }}
            >
              Logout
            </Text>
          </View>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerTint,
        drawerStyle: { backgroundColor: colors.drawerBackground },
        drawerActiveTintColor: colors.drawerActiveTint,
        drawerInactiveTintColor: colors.drawerInactiveTint,
      }}
    >
      <Drawer.Screen
        name="stores"
        options={{
          title: "Stores",
          headerShown: true,
          drawerIcon: ({ color }) => (
            <MaterialIcons size={28} name="store" color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="scanners"
        options={{
          title: "Scan Operators",
          drawerIcon: ({ color }) => (
            <MaterialIcons size={24} name="groups" color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
