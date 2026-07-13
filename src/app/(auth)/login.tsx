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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginScreen() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (text: string) => {
    setCredentials({ ...credentials, email: text });
  };

  const handlePasswordChange = (text: string) => {
    setCredentials({ ...credentials, password: text });
  };

  const handleRememberMe = () => {
    setCredentials({ ...credentials, rememberMe: !credentials.rememberMe });
  };

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert("Validation Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // Add your authentication logic here
      console.log("Login attempt:", credentials);
      Alert.alert("Success", `Logged in as ${credentials.email}`);
      // Navigate to home screen
      // navigation.navigate('Home');
    } catch (error) {
      Alert.alert(
        "Login Failed",
        "Please check your credentials and try again",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    console.log("Facebook login");
    Alert.alert(
      "Facebook Login",
      "Facebook login functionality to be implemented",
    );
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Password reset functionality to be implemented",
    );
  };

  const handleSignUp = () => {
    // Navigate to sign up screen
    console.log("Navigate to sign up");
  };

  return (
    <LinearGradient
      colors={["#0b1220", "#10233f", "#0f3e4f"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.bgOrbOne} />
      <View style={styles.bgOrbTwo} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.logoBadge}>
              <Ionicons name="scan" size={24} color="#8be9ff" />
            </View>
            <Text style={styles.mainTitle}>Foresee Scanner</Text>
            <Text style={styles.mainSubtitle}>
              Field Inventory Intelligence
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.welcomeEyebrow}>Welcome Back</Text>
            <Text style={styles.welcomeTitle}>Sign In</Text>
            <Text style={styles.welcomeSubtitle}>
              Access your store audits, scans, and reconciliation workflow.
            </Text>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <View style={styles.inputShell}>
                  <Ionicons name="mail-outline" size={18} color="#9ac7d3" />
                  <TextInput
                    style={styles.input}
                    placeholder="name@company.com"
                    placeholderTextColor="#81a0ab"
                    value={credentials.email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.passwordContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#9ac7d3"
                    style={styles.passwordLeadingIcon}
                  />
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor="#81a0ab"
                    value={credentials.password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    disabled={loading}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#9ac7d3"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.bottomActions}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={handleRememberMe}
                  disabled={loading}
                >
                  <View
                    style={[
                      styles.checkbox,
                      credentials.rememberMe && styles.checkboxChecked,
                    ]}
                  >
                    {credentials.rememberMe && (
                      <Ionicons name="checkmark" size={14} color="#12313a" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>Remember Me</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  disabled={loading}
                >
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#082029" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.facebookButton}
              onPress={handleFacebookLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-facebook" size={20} color="white" />
              <Text style={styles.facebookButtonText}>Facebook</Text>
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                <Text style={styles.signUpLink}>Sign Up</Text>
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
  bgOrbOne: {
    position: "absolute",
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: width,
    backgroundColor: "rgba(88, 203, 229, 0.15)",
    top: -width * 0.25,
    right: -width * 0.18,
  },
  bgOrbTwo: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width,
    backgroundColor: "rgba(248, 168, 94, 0.14)",
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
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.4,
  },
  mainSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(227, 247, 255, 0.86)",
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: "rgba(7, 23, 35, 0.72)",
    borderRadius: 26,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(164, 224, 239, 0.28)",
    shadowColor: "#0a1118",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 14,
  },
  welcomeEyebrow: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#8be9ff",
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: "rgba(220, 239, 247, 0.78)",
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
    color: "#9ac7d3",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(158, 210, 225, 0.42)",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(6, 15, 24, 0.45)",
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    color: "#e9f8ff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(158, 210, 225, 0.42)",
    borderRadius: 12,
    backgroundColor: "rgba(6, 15, 24, 0.45)",
  },
  passwordLeadingIcon: {
    marginLeft: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    color: "#e9f8ff",
  },
  eyeIcon: {
    paddingRight: 16,
    padding: 8,
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: "rgba(158, 210, 225, 0.55)",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(6, 15, 24, 0.45)",
  },
  checkboxChecked: {
    backgroundColor: "#8be9ff",
    borderColor: "#8be9ff",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#d5eff7",
  },
  forgotPassword: {
    fontSize: 14,
    color: "#8be9ff",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#8be9ff",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8be9ff",
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
    color: "#082029",
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(162, 207, 220, 0.28)",
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: "#98bfca",
  },
  facebookButton: {
    flexDirection: "row",
    backgroundColor: "#1b5ea9",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(138, 187, 255, 0.45)",
    shadowColor: "#1b5ea9",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  facebookButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.5,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  signUpText: {
    fontSize: 14,
    color: "#c7e5ee",
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8be9ff",
  },
});
