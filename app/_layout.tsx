import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PurchaseProvider } from "@/contexts/PurchaseContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BEFORE_YOU_BEGIN_KEY } from "@/constants/keys";

// ─── Onboarding Reset Context ──────────────────────────────────────────────
// Allows any screen (e.g. about.tsx dev panel) to re-trigger the gate without
// restarting the app. Only meaningful in dev mode — the gate itself guards display.

type OnboardingContextType = { resetOnboarding: () => void };
const OnboardingContext = createContext<OnboardingContextType>({ resetOnboarding: () => {} });
export function useOnboarding() { return useContext(OnboardingContext); }

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// ─── Before You Begin Gate (v2) ────────────────────────────────────────────
// Uses BEFORE_YOU_BEGIN_KEY so this shows to ALL users — including existing
// users who already accepted the old disclaimer — exactly once after install.

function BeforeYouBeginGate({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(BEFORE_YOU_BEGIN_KEY)
      .then((v) => setAccepted(v === "true"))
      .catch(() => setAccepted(false)); // storage read failed → show gate
  }, []);

  const resetOnboarding = () => {
    AsyncStorage.removeItem(BEFORE_YOU_BEGIN_KEY).catch((e) =>
      console.warn("BeforeYouBegin: failed to clear acceptance", e)
    );
    setChecked(false);
    setAccepted(false);
  };

  const accept = async () => {
    if (!checked) return;
    // Unblock the user immediately — don't wait on storage.
    // If storage fails/hangs, they see the gate again next launch — that's fine.
    setAccepted(true);
    // Best-effort persist in background.
    AsyncStorage.setItem(BEFORE_YOU_BEGIN_KEY, "true").catch((e) =>
      console.warn("BeforeYouBegin: failed to persist acceptance", e)
    );
  };

  // Still loading storage — show nothing (splash already hidden by fonts).
  if (accepted === null) return null;

  // User has not accepted — show ONLY the gate, no Modal, no children.
  // Plain View (not Modal) avoids the separate UIWindow that Modal creates,
  // which can interfere with gesture recognition on the new architecture.
  // Children (RootLayoutNav) don't mount until after acceptance, eliminating
  // the JS-thread burst that made touches unresponsive on slower devices.
  if (!accepted) {
    return (
      <View style={dStyles.gateRoot}>
        <StatusBar barStyle="light-content" />
        <View style={dStyles.overlay}>
          <ScrollView
            style={dStyles.scrollContainer}
            contentContainerStyle={dStyles.card}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            <View style={dStyles.iconRow}>
              <Text style={dStyles.icon}>🌿</Text>
            </View>
            <Text style={dStyles.title}>Before you begin</Text>
            <Text style={dStyles.body}>
              Nourish provides educational meal-planning content, global recipe inspiration, estimated nutrition, and optional wellness collections.
            </Text>
            <Text style={dStyles.body}>
              It is <Text style={dStyles.bold}>not medical advice</Text> and does not replace your doctor, dietitian, or care team. Always consult a licensed healthcare provider before making changes to your diet, supplements, or routine.
            </Text>

            {/* Checkbox */}
            <Pressable style={dStyles.checkRow} onPress={() => setChecked((c) => !c)}>
              <View style={[dStyles.checkbox, checked && dStyles.checkboxChecked]}>
                {checked && <Text style={dStyles.checkMark}>✓</Text>}
              </View>
              <Text style={dStyles.checkLabel}>I understand</Text>
            </Pressable>

            <Pressable
              style={[dStyles.btn, !checked && dStyles.btnDisabled]}
              onPress={accept}
              disabled={!checked}
            >
              <Text style={dStyles.btnText}>Continue</Text>
            </Pressable>

            <Pressable onPress={() => router.push("/disclaimer" as never)} style={dStyles.readMore}>
              <Text style={dStyles.readMoreText}>Read the full Medical Disclaimer</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    );
  }

  // Accepted — render the app normally, no Modal overhead at all.
  return (
    <OnboardingContext.Provider value={{ resetOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

const dStyles = StyleSheet.create({
  gateRoot: { flex: 1, backgroundColor: "#000" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 24 },
  scrollContainer: { width: "100%", maxHeight: "90%", borderRadius: 20 },
  card: { backgroundColor: "#ffffff", borderRadius: 20, padding: 28 },
  iconRow: { alignItems: "center", marginBottom: 14 },
  icon: { fontSize: 40 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#1e3a2f", textAlign: "center", marginBottom: 16 },
  body: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#444", lineHeight: 22, marginBottom: 12 },
  bold: { fontFamily: "Inter_600SemiBold", color: "#1e3a2f" },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, marginVertical: 8, borderTopWidth: 1, borderTopColor: "#eee" },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: "#ccc", alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: "#3d6b52", borderColor: "#3d6b52" },
  checkMark: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  checkLabel: { fontSize: 15, fontFamily: "Inter_500Medium", color: "#1e3a2f", flex: 1 },
  btn: { backgroundColor: "#3d6b52", borderRadius: 12, paddingVertical: 15, alignItems: "center", marginBottom: 12 },
  btnDisabled: { backgroundColor: "#ccc" },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  readMore: { alignItems: "center" },
  readMoreText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#3d6b52", textDecorationLine: "underline" },
});

// ─── Navigation ────────────────────────────────────────────────────────────

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="plan/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="library/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="checkout" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="about" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="vault" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="tracker" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="vault-audio" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="vault-video" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="vault-tools" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="vault-supplement" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="vault-content" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="templates/index" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="templates/meal-prep" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="templates/grocery-bundles" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="templates/reset-protocol" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="templates/wellness-journal" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="templates/meal-planner" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="privacy" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="tracking-profile" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="health-report" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="nutrition-tracker" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="disclaimer" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="signin" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      <Stack.Screen name="cookbook" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="cookbook-recipe" options={{ headerShown: false, presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
              <AuthProvider>
                <PurchaseProvider>
                  <BeforeYouBeginGate>
                    <RootLayoutNav />
                  </BeforeYouBeginGate>
                </PurchaseProvider>
              </AuthProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
