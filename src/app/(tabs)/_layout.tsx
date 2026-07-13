import Drawer from "expo-router/drawer";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert, Pressable, Text, View } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from "expo-router/drawer";

const ORGANIZATIONS = ["MusaSoft Labs", "Foresee Retail", "Field Ops East"];

function AppDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: "#3f1d68",
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
            backgroundColor: "rgba(255,255,255,0.18)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.35)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialIcons name="person" size={28} color="#ffffff" />
        </View>
        <Text
          style={{ fontFamily: "JetBrainsMono", marginTop: 12 }}
          className="text-white text-base"
        >
          John Scanner
        </Text>
      </View>

      <View
        style={{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.14)" }}
      >
        <DrawerItemList {...props} />
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
        <Text
          style={{ fontFamily: "JetBrainsMono" }}
          className="text-white/70 text-xs mb-2"
        >
          Organizations
        </Text>
        {ORGANIZATIONS.map((organization) => (
          <View
            key={organization}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 mb-2"
          >
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-white text-xs"
            >
              {organization}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{ marginTop: "auto", paddingHorizontal: 16, paddingBottom: 20 }}
      >
        <Pressable
          onPress={() => Alert.alert("Logout", "You have been logged out.")}
          className="rounded-xl border border-red-300/35 bg-red-500/20 px-4 py-3"
        >
          <View className="flex-row items-center justify-center">
            <MaterialIcons name="logout" size={16} color="#fecaca" />
            <Text
              style={{ fontFamily: "JetBrainsMono" }}
              className="text-red-100 text-xs ml-2"
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
  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#59168b" },
        headerTintColor: "#fff",
        drawerStyle: { backgroundColor: "#3f1d68" },
        drawerActiveTintColor: "#ffffff",
        drawerInactiveTintColor: "rgba(255,255,255,0.78)",
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
