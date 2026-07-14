// * React
// biome-ignore assist/source/organizeImports: <ignore lint: false positive>
import { useEffect, useState } from "react";

// * React Native
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
} from "react-native";

// * Expo
import * as LocalAuthentication from "expo-local-authentication";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/build/Ionicons";

// * Libraries
import { z } from "zod";
import { Buffer } from "buffer";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

// * Hooks
import { useTheme } from "@/hooks/use-theme";

// * Stores
import { useAuthStore } from "@/store/auth";

// * Components
import { ThemeToggle } from "@/components/theme-toggle";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const loginSchema = z.object({
  emailAddress: z.email("Invalid email."),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type Schema = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  // ? Hooks
  const { colors, isDark } = useTheme();
  const { login } = useAuthStore();
  const router = useRouter();

  // ? States
  const [showPassword, setShowPassword] = useState(false);
  const [isCompatible, setIsCompatible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkDeviceCompatibility() {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      setIsCompatible(hasHardware);
    }
    checkDeviceCompatibility();
  }, []);

  async function handleBiometricAuth() {
    try {
      // Check if any biometric records (fingerprint/face) exist on the device
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!isEnrolled) {
        return Alert.alert(
          "Not Enrolled",
          "No biometric records found. Please log in with a password or set up biometrics in device settings.",
        );
      }

      // Authenticate using the system prompt
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with Face ID or Fingerprint",
        fallbackLabel: "Use Passcode", // iOS fallback button label
        disableDeviceFallback: false, // Allows passcode if biometric fails
      });

      if (result.success) {
        setIsAuthenticated(true);
        Alert.alert("Success", "Authenticated successfully!");
      } else {
        Alert.alert(
          "Authentication Failed",
          result.error || "Please try again.",
        );
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    }
  }

  // ? Form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Schema>({
    mode: "onChange",
    resolver: zodResolver(loginSchema),
    defaultValues: { emailAddress: "", password: "" },
  });

  // ? Mutations
  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: async (creds: Schema) => {
      const response = await axios.post("/login", creds);
      return response.data;
    },
  });

  // ? Theme-aware gradient colors
  const gradientColors: [string, string, string] = isDark
    ? ["#2d1b69", "#1e1b4b", "#1e1b4b"]
    : ["#faf5ff", "#f3e8ff", "#ede9fe"];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View
        style={{
          position: "absolute",
          width: width * 0.72,
          height: width * 0.72,
          borderRadius: width,
          top: -width * 0.25,
          right: -width * 0.18,
          backgroundColor: isDark
            ? "rgba(196,181,253,0.08)"
            : "rgba(147,51,234,0.06)",
        }}
      />

      <View
        style={{
          position: "absolute",
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: width,
          bottom: -width * 0.32,
          left: -width * 0.22,
          backgroundColor: isDark
            ? "rgba(216,180,254,0.06)"
            : "rgba(147,51,234,0.04)",
        }}
      />

      <View className="absolute top-13.5 right-5 z-10">
        <ThemeToggle size={15} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 26,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-7">
            <View
              className="w-14.5 h-14.5 rounded-full border items-center justify-center mb-3.5"
              style={{
                borderColor: colors.border,
                backgroundColor: `${colors.accent}15`,
              }}
            >
              <Image
                source={require("@/assets/images/foresee-logo.png")}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            </View>
            <Text
              className="text-4xl font-bold tracking-wide"
              style={{
                fontFamily: "JetBrainsMono-Regular",
                color: colors.text,
              }}
            >
              Foresee Scanner
            </Text>
            <Text
              className="mt-1.5 text-[13px] tracking-[0.4px]"
              style={{
                color: colors.textSecondary,
                fontFamily: "JetBrainsMono-Regular",
              }}
            >
              Field Inventory Intelligence
            </Text>
          </View>

          <View
            className="rounded-[26px] p-6 border"
            style={{
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.15,
              shadowRadius: 18,
              elevation: 14,
            }}
          >
            <Text
              className="text-xs uppercase mb-2 tracking-[1.2px]"
              style={{
                color: colors.accent,
                fontFamily: "JetBrainsMono-Regular",
              }}
            >
              Welcome Back
            </Text>
            <Text
              className="text-[30px] font-bold mb-2 tracking-[0.4px]"
              style={{
                color: colors.text,
                fontFamily: "JetBrainsMono-Regular",
              }}
            >
              Sign In
            </Text>
            <Text
              className="text-[13px] mb-5.5 leading-5"
              style={{
                color: colors.textSecondary,
                fontFamily: "JetBrainsMono-Regular",
              }}
            >
              Access your store audits, scans, and reconciliation workflow.
            </Text>

            <View className="mb-5">
              <View className="mb-4">
                <Text
                  className="text-xs font-semibold mb-2 tracking-[0.5px] uppercase"
                  style={{
                    color: colors.accent,
                    fontFamily: "JetBrainsMono-Regular",
                  }}
                >
                  EMAIL ADDRESS
                </Text>
                <Controller
                  control={control}
                  name="emailAddress"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View
                        className="flex-row items-center border rounded-xl px-3"
                        style={{
                          borderColor: errors.emailAddress
                            ? "#ef4444"
                            : colors.border,
                          backgroundColor: colors.background,
                        }}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={18}
                          color={colors.accent}
                        />
                        <TextInput
                          className="flex-1 px-2.5 py-3 text-base"
                          style={{
                            color: colors.text,
                            fontFamily: "JetBrainsMono-Regular",
                          }}
                          placeholder="name@company.com"
                          placeholderTextColor={colors.textSecondary}
                          value={value}
                          onChangeText={onChange}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          editable={!isPending}
                        />
                      </View>
                      {errors.emailAddress && (
                        <Text
                          className="text-xs text-red-500 mt-1.5 px-1"
                          style={{ fontFamily: "JetBrainsMono-Regular" }}
                        >
                          {errors.emailAddress.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              <View className="mb-4">
                <Text
                  className="text-xs font-semibold mb-2 tracking-[0.5px] uppercase"
                  style={{
                    color: colors.accent,
                    fontFamily: "JetBrainsMono-Regular",
                  }}
                >
                  PASSWORD
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View
                        className="flex-row items-center border rounded-xl"
                        style={{
                          borderColor: errors.password
                            ? "#ef4444"
                            : colors.border,
                          backgroundColor: colors.background,
                        }}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={18}
                          color={colors.accent}
                          className="ml-3"
                        />
                        <TextInput
                          className="flex-1 px-2.5 py-3 text-base"
                          style={{
                            color: colors.text,
                            fontFamily: "JetBrainsMono-Regular",
                          }}
                          placeholder="••••••••"
                          placeholderTextColor={colors.textSecondary}
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showPassword}
                          editable={!isPending}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          className="p-2 pr-4"
                          disabled={isPending}
                        >
                          <Ionicons
                            name={showPassword ? "eye-off" : "eye"}
                            size={20}
                            color={colors.accent}
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.password && (
                        <Text
                          className="text-xs text-red-500 mt-1.5 px-1"
                          style={{ fontFamily: "JetBrainsMono-Regular" }}
                        >
                          {errors.password.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              <TouchableOpacity
                className={`py-3.5 rounded-[14px] mt-3 items-center justify-center${isPending || !isValid ? " opacity-70" : ""}`}
                style={{
                  backgroundColor: colors.accent,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.28,
                  shadowRadius: 14,
                  elevation: 7,
                }}
                onPress={handleSubmit((formdata: Schema) =>
                  loginMutation(
                    {
                      ...formdata,
                      password: Buffer.from(formdata.password).toString(
                        "base64",
                      ),
                    },
                    {
                      onSuccess: (data) => {
                        login(data);
                        router.replace("/(tabs)/stores");
                      },
                      onError: (error: unknown) =>
                        Alert.alert(
                          "Login Failed",
                          error instanceof axios.AxiosError
                            ? error.response?.data?.message || error.message
                            : "Please check your credentials and try again",
                        ),
                    },
                  ),
                )}
                disabled={isPending || !isValid}
                activeOpacity={0.8}
              >
                {isPending ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Text
                    className="text-base font-bold tracking-[0.5px]"
                    style={{
                      color: colors.background,
                      fontFamily: "JetBrainsMono-Regular",
                    }}
                  >
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>

              {/* <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View> */}

              {isCompatible && !isAuthenticated && (
                <Pressable onPress={handleBiometricAuth}>
                  <MaterialIcons
                    name="fingerprint"
                    size={32}
                    color={colors.accent}
                    style={{ alignSelf: "center", marginTop: 20 }}
                  />
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
