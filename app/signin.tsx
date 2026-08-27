import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

type Mode = "magic" | "password" | "register";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { sendMagicLink, signInWithPassword, register } = useAuth();

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handleMagicLink = async () => {
    if (!email.trim()) {
      Alert.alert("Enter your email", "Please enter the email address linked to your membership.");
      return;
    }
    setLoading(true);
    try {
      await sendMagicLink(email.trim());
      setMagicSent(true);
    } catch (e: any) {
      Alert.alert("Couldn't send link", e.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async () => {
    if (!email.trim()) {
      Alert.alert("Missing email", "Please enter the email address linked to your membership.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Password required", "Please enter your password to sign in.");
      return;
    }
    setLoading(true);
    try {
      await signInWithPassword(email.trim(), password);
      router.replace("/(tabs)" as never);
    } catch (e: any) {
      Alert.alert("Sign in failed", e.message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email.trim()) {
      Alert.alert("Missing email", "Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Password required", "Please create a password for your account.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Password too short", "Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim() || undefined);
      router.replace("/(tabs)" as never);
    } catch (e: any) {
      Alert.alert("Registration failed", e.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#080c0a", "#0f1a13"]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandDot} />
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>
              Access your Nourish membership
            </Text>
          </View>

          {/* Mode tabs */}
          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, mode === "password" && styles.tabActive]}
              onPress={() => setMode("password")}
            >
              <Text style={[styles.tabText, mode === "password" && styles.tabTextActive]}>Password</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === "magic" && styles.tabActive]}
              onPress={() => { setMode("magic"); setMagicSent(false); }}
            >
              <Text style={[styles.tabText, mode === "magic" && styles.tabTextActive]}>Magic Link</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === "register" && styles.tabActive]}
              onPress={() => setMode("register")}
            >
              <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>Register</Text>
            </Pressable>
          </View>

          {/* Magic link sent state */}
          {mode === "magic" && magicSent ? (
            <View style={styles.sentBox}>
              <Text style={styles.sentIcon}>📬</Text>
              <Text style={styles.sentTitle}>Check your email</Text>
              <Text style={styles.sentBody}>
                We sent a sign-in link to{"\n"}<Text style={styles.sentEmail}>{email}</Text>
              </Text>
              <Text style={styles.sentHint}>Tap the link in your email to sign in. It expires in 15 minutes.</Text>
              <Pressable onPress={() => setMagicSent(false)} style={styles.resendBtn}>
                <Text style={styles.resendText}>Resend link</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              {/* Name field (register only) */}
              {mode === "register" && (
                <View style={styles.field}>
                  <Text style={styles.label}>Your name (optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Joseph Young"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              )}

              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>Email address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password (password/register modes) */}
              {(mode === "password" || mode === "register") && (
                <View style={styles.field}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={mode === "register" ? "Min. 8 characters" : "Your password"}
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}

              {/* Submit button */}
              <Pressable
                style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }]}
                onPress={
                  mode === "magic"
                    ? handleMagicLink
                    : mode === "password"
                    ? handlePassword
                    : handleRegister
                }
                disabled={loading}
              >
                <LinearGradient
                  colors={["#3d7a56", "#2d5c40"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGrad}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitText}>
                      {mode === "magic"
                        ? "Send Magic Link"
                        : mode === "password"
                        ? "Sign In"
                        : "Create Account"}
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>

              {mode === "magic" && (
                <Text style={styles.hint}>
                  We'll email you a secure link — no password needed.
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080c0a" },
  scroll: { paddingHorizontal: 28, flexGrow: 1 },
  backBtn: { marginBottom: 32 },
  backText: { color: "rgba(255,255,255,0.5)", fontSize: 15, fontFamily: "Inter_400Regular" },
  header: { marginBottom: 36 },
  brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#5cb87a", marginBottom: 16 },
  title: { color: "#fff", fontSize: 36, fontFamily: "Inter_700Bold", letterSpacing: -1, marginBottom: 8 },
  subtitle: { color: "rgba(255,255,255,0.55)", fontSize: 16, fontFamily: "Inter_400Regular" },
  tabs: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 4, marginBottom: 32 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: "rgba(255,255,255,0.12)" },
  tabText: { color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "Inter_500Medium" },
  tabTextActive: { color: "#fff" },
  form: { gap: 20 },
  field: { gap: 8 },
  label: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_500Medium", letterSpacing: 0.3 },
  input: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  submitBtn: { borderRadius: 14, overflow: "hidden", marginTop: 8 },
  submitGrad: { paddingVertical: 18, alignItems: "center" },
  submitText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  hint: { color: "rgba(255,255,255,0.35)", fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  sentBox: { alignItems: "center", paddingTop: 24, gap: 12 },
  sentIcon: { fontSize: 48 },
  sentTitle: { color: "#fff", fontSize: 24, fontFamily: "Inter_700Bold" },
  sentBody: { color: "rgba(255,255,255,0.7)", fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  sentEmail: { color: "#5cb87a", fontFamily: "Inter_600SemiBold" },
  sentHint: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  resendBtn: { marginTop: 12, paddingVertical: 12 },
  resendText: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular", textDecorationLine: "underline" },
});
