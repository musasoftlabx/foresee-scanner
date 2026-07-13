import {
  DarkTheme,
  DefaultTheme,
  SplashScreen,
  Stack,
  ThemeProvider,
} from "expo-router";
import "@/global.css";
import { useColorScheme } from "react-native";
//import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Device from "expo-device";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Reactotron from "reactotron-react-native";
import axios from "axios";
import { ENDPOINT } from "@/store/default";

const queryClient = new QueryClient();

if (__DEV__) {
  Reactotron.configure({ name: "Foresee Scanner" }).useReactNative().connect();
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const isLoggedIn = false;

  const role: string = "Scanner_"; // Replace with actual role logic

  // const [loaded, error] = useFonts({
  //   JetBrainsMono: require("../../assets/fonts/JetBrainsMono-Regular.ttf"),
  // });

  const [loaded, error] = useFonts({
    JetBrainsMono: require("../../assets/fonts/JetBrainsMono-Regular.ttf"),
    "JetBrainsMono-Bold": require("../../assets/fonts/JetBrainsMono-Bold.ttf"),
    "JetBrainsMono-ExtraBold": require("../../assets/fonts/JetBrainsMono-ExtraBold.ttf"),
    "JetBrainsMono-Light": require("../../assets/fonts/JetBrainsMono-Light.ttf"),
    "JetBrainsMono-Thin": require("../../assets/fonts/JetBrainsMono-Thin.ttf"),
    "JetBrainsMono-Italic": require("../../assets/fonts/JetBrainsMono-Italic.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  // * Axios config
  axios.defaults.baseURL = ENDPOINT;
  axios.defaults.timeout = 60000;
  axios.defaults.headers.post["Content-Type"] = "application/json";
  axios.defaults.headers.post.Accept = "application/json";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        {/* <HeroUINativeProvider> */}
        <Stack
          // initialRouteName={
          //   role === "Scanner" && Device.brand === "EA500"
          //     ? "scan-location"
          //     : role === "Scanner" && Device.brand !== "EA500"
          //       ? "scan-location-with-camera"
          //       : "(tabs)"
          //   //:"locations"
          //   //:"location"
          // }
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: "#f4511e" },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
          }}
        >
          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen name="audits" options={{ title: "Audits" }} />
            <Stack.Screen name="locations" options={{ title: "Locations" }} />
            <Stack.Screen name="location" options={{ title: "Location" }} />
            <Stack.Screen
              name="scan-location"
              options={{ title: "ScanLocation" }}
            />
            <Stack.Screen
              name="scan-product"
              options={{ title: "ScanProduct" }}
            />
            <Stack.Screen
              name="scan-location-with-camera"
              options={{ title: "ScanLocationWithCamera" }}
            />
            <Stack.Screen
              name="scan-product-with-camera"
              options={{ title: "ScanProductWithCamera" }}
            />
          </Stack.Protected>

          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
        {/* </HeroUINativeProvider> */}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );

  // return (
  //   <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
  //     <AnimatedSplashOverlay />
  //     <AppTabs />
  //   </ThemeProvider>
  // );
}
