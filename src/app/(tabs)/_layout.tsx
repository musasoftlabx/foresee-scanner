// biome-ignore assist/source/organizeImports: <ignore lint: false positive>
// * React
import { useEffect, useState } from "react";

// * React Native
import { Pressable, Text, TouchableOpacity, View } from "react-native";

// * Libraries
import { useQueryClient } from "@tanstack/react-query";

// * Expo
import { DrawerContentScrollView, DrawerItemList } from "expo-router/drawer";
import Drawer from "expo-router/drawer";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// * Hooks
import { useTheme } from "@/hooks/use-theme";

// * Components
import { ThemeToggle } from "@/components/theme-toggle";

// * Stores
import { useAuthStore } from "@/store/auth";

export default function DrawerLayout() {
  const { colors, isDark } = useTheme();
  const { user, organizations, logout, changeActiveOrganization } =
    useAuthStore();
  const queryClient = useQueryClient();

  const [newOrganizations, setNewOrganizations] =
    useState<typeof organizations>(organizations);

  useEffect(() => {
    changeActiveOrganization(newOrganizations);
    queryClient.refetchQueries({
      queryKey: ["stores", newOrganizations.find((org) => org.isActive)?.id],
    });
  }, [newOrganizations]);

  return (
    <Drawer
      drawerContent={(props) => (
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: colors.drawerBackground,
            paddingTop: 0,
          }}
        >
          <View className="px-1 pt-6 pb-4">
            <View
              className="rounded-full border items-center justify-center size-14"
              style={{
                backgroundColor: isDark
                  ? "rgba(196,181,253,0.15)"
                  : "rgba(147,51,234,0.12)",
                borderColor: isDark
                  ? "rgba(196,181,253,0.3)"
                  : "rgba(147,51,234,0.25)",
              }}
            >
              <MaterialIcons
                name="person"
                size={28}
                color={isDark ? "#ddd6fe" : "#6d28d9"}
              />
            </View>
            <Text
              className="mt-2 text-xl"
              style={{
                color: colors.textSecondary,
                fontFamily: "JetBrainsMono-Bold",
              }}
            >
              {user?.firstName} {user?.lastName}
            </Text>
            <Text
              className="text-[14px] tracking-[1.2px]"
              style={{
                color: `${colors.textSecondary}95`,
                fontFamily: "JetBrainsMono",
              }}
            >
              {user?.roles[0]}
            </Text>
          </View>

          <View
            className="border-t pt-2"
            style={{ borderTopColor: colors.border }}
          >
            <DrawerItemList {...props} />
          </View>

          {newOrganizations.length > 0 ? (
            <View className="mt-4 px-4">
              <Text
                className="mb-2 text-[11px] tracking-[1.2px]"
                style={{
                  fontFamily: "JetBrainsMono",
                  color: colors.textSecondary,
                }}
              >
                Organizations
              </Text>

              {newOrganizations.map(({ id, name, isActive }) => (
                <TouchableOpacity
                  key={id}
                  className="mb-2 rounded-lg border px-3 py-2"
                  onPress={() => {
                    props.navigation.closeDrawer();
                    setNewOrganizations((prev) =>
                      prev.map((org) =>
                        org.id === id
                          ? { ...org, isActive: true }
                          : { ...org, isActive: false },
                      ),
                    );
                  }}
                  style={{
                    backgroundColor: isActive
                      ? colors.accent
                      : colors.backgroundElement,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? colors.background : colors.text,
                      fontFamily: isActive
                        ? "JetBrainsMono-Bold"
                        : "JetBrainsMono",
                      fontSize: 12,
                    }}
                  >
                    {name}
                  </Text>

                  <MaterialIcons
                    name={isActive ? "check-circle" : "circle"}
                    size={16}
                    color={isActive ? colors.background : colors.textSecondary}
                    style={{ position: "absolute", right: 8, top: 8 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <View className="flex-row justify-between items-center mt-4 px-4">
            <Text
              className="text-[11px] tracking-[1.2px]"
              style={{
                color: colors.textSecondary,
                fontFamily: "JetBrainsMono",
              }}
            >
              Appearance
            </Text>
            <ThemeToggle size={15} />
          </View>

          <View className="px-4 pb-5 mt-auto">
            <Pressable
              onPress={logout}
              className="rounded-lg border px-4 py-3"
              style={{
                borderColor: "rgba(252,165,165,0.35)",
                backgroundColor: "rgba(239,68,68,0.15)",
              }}
            >
              <View className="flex-row items-center justify-center">
                <MaterialIcons name="logout" size={16} color="#fca5a5" />
                <Text
                  className="ml-2 text-[13px] tracking-[1.2px]"
                  style={{ color: "#fca5a5", fontFamily: "JetBrainsMono" }}
                >
                  LOGOUT
                </Text>
              </View>
            </Pressable>
          </View>
        </DrawerContentScrollView>
      )}
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerTint,
        drawerStyle: {
          backgroundColor: colors.drawerBackground,
          maxWidth: "75%",
        },
        drawerActiveTintColor: colors.drawerActiveTint,
        drawerInactiveTintColor: colors.drawerInactiveTint,
        drawerLabelStyle: { fontFamily: "JetBrainsMono", fontSize: 14 },
        drawerItemStyle: { marginVertical: 3, borderRadius: 8 },
      }}
    >
      <Drawer.Screen
        name="stores"
        options={{
          title: "Stores",
          headerShown: true,
          drawerIcon: ({ color }) => (
            <MaterialIcons size={24} name="store" color={color} />
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
