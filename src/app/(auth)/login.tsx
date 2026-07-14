import { useState } from "react";
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
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Buffer } from "buffer";

const { width } = Dimensions.get("window");

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginCredentials = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting, dirtyFields: dirty },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: async (creds: LoginCredentials) => {
      const response = await axios.post("/login", creds);
      return response.data;
    },
  });

  // Theme-aware gradient colors
  const gradientColors: [string, string, string] = isDark
    ? ["#2d1b69", "#1e1b4b", "#1e1b4b"]
    : ["#faf5ff", "#f3e8ff", "#ede9fe"];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View
        style={[
          styles.bgOrbOne,
          {
            backgroundColor: isDark
              ? "rgba(196,181,253,0.08)"
              : "rgba(147,51,234,0.06)",
          },
        ]}
      />
      <View
        style={[
          styles.bgOrbTwo,
          {
            backgroundColor: isDark
              ? "rgba(216,180,254,0.06)"
              : "rgba(147,51,234,0.04)",
          },
        ]}
      />

      {/* Theme toggle — top-right corner */}
      <View style={styles.themeToggleWrapper}>
        <ThemeToggle size={15} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View
              style={[
                styles.logoBadge,
                {
                  borderColor: colors.border,
                  backgroundColor: `${colors.accent}15`,
                },
              ]}
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
              style={[
                styles.mainSubtitle,
                {
                  color: colors.textSecondary,
                  fontFamily: "JetBrainsMono-Regular",
                },
              ]}
            >
              Field Inventory Intelligence
            </Text>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.welcomeEyebrow,
                { color: colors.accent, fontFamily: "JetBrainsMono-Regular" },
              ]}
            >
              Welcome Back
            </Text>
            <Text
              style={[
                styles.welcomeTitle,
                { color: colors.text, fontFamily: "JetBrainsMono-Regular" },
              ]}
            >
              Sign In
            </Text>
            <Text
              style={[
                styles.welcomeSubtitle,
                {
                  color: colors.textSecondary,
                  fontFamily: "JetBrainsMono-Regular",
                },
              ]}
            >
              Access your store audits, scans, and reconciliation workflow.
            </Text>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: colors.accent,
                      fontFamily: "JetBrainsMono-Regular",
                    },
                  ]}
                >
                  EMAIL ADDRESS
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View
                        style={[
                          styles.inputShell,
                          {
                            borderColor: errors.email
                              ? "#ef4444"
                              : colors.border,
                            backgroundColor: colors.background,
                          },
                        ]}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={18}
                          color={colors.accent}
                        />
                        <TextInput
                          style={[
                            styles.input,
                            {
                              color: colors.text,
                              fontFamily: "JetBrainsMono-Regular",
                            },
                          ]}
                          placeholder="name@company.com"
                          placeholderTextColor={colors.textSecondary}
                          value={value}
                          onChangeText={onChange}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          editable={!isPending}
                        />
                      </View>
                      {errors.email && (
                        <Text
                          style={[
                            styles.errorText,
                            { fontFamily: "JetBrainsMono-Regular" },
                          ]}
                        >
                          {errors.email.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: colors.accent,
                      fontFamily: "JetBrainsMono-Regular",
                    },
                  ]}
                >
                  PASSWORD
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View
                        style={[
                          styles.passwordContainer,
                          {
                            borderColor: errors.password
                              ? "#ef4444"
                              : colors.border,
                            backgroundColor: colors.background,
                          },
                        ]}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={18}
                          color={colors.accent}
                          style={styles.passwordLeadingIcon}
                        />
                        <TextInput
                          style={[
                            styles.passwordInput,
                            {
                              color: colors.text,
                              fontFamily: "JetBrainsMono-Regular",
                            },
                          ]}
                          placeholder="••••••••"
                          placeholderTextColor={colors.textSecondary}
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showPassword}
                          editable={!isPending}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeIcon}
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
                          style={[
                            styles.errorText,
                            { fontFamily: "JetBrainsMono-Regular" },
                          ]}
                        >
                          {errors.password.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: colors.accent },
                  (isPending || !isValid) && styles.loginButtonDisabled,
                ]}
                onPress={handleSubmit((formdata: LoginCredentials) =>
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
                    style={[
                      styles.loginButtonText,
                      {
                        color: colors.background,
                        fontFamily: "JetBrainsMono-Regular",
                      },
                    ]}
                  >
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeToggleWrapper: {
    position: "absolute",
    top: 54,
    right: 20,
    zIndex: 10,
  },
  bgOrbOne: {
    position: "absolute",
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: width,
    top: -width * 0.25,
    right: -width * 0.18,
  },
  bgOrbTwo: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width,
    bottom: -width * 0.32,
    left: -width * 0.22,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 26,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  mainSubtitle: {
    marginTop: 6,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  card: {
    borderRadius: 26,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 14,
  },
  welcomeEyebrow: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    marginBottom: 22,
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
  },
  passwordLeadingIcon: {
    marginLeft: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    paddingRight: 16,
    padding: 8,
  },
  loginButton: {
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 7,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 6,
    paddingHorizontal: 4,
  },
});
