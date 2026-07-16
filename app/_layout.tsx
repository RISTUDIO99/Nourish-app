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
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PurchaseProvider } from "@/contexts/PurchaseContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const DISCLAIMER_KEY = "nourish:disclaimer:accepted:v1";

function DisclaimerGate({ children }: { children: React.ReactNode }) {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(DISCLAIMER_KEY).then((v) => setAccepted(v === "true"));
  }, []);

  const accept = async () => {
    await AsyncStorage.setItem(DISCLAIMER_KEY, "true");
    setAccepted(true);
  };

  if (accepted === null) return null;

  return (
    <>
      {children}
      <Modal visible={!accepted} transparent animationType="fade">
        <View style={dStyles.overlay}>
          <View style={dStyles.card}>
            <View style={dStyles.iconRow}>
              <Text style={dStyles.icon}>⚕️</Text>
            </View>
            <Text style={dStyles.title}>Medical Disclaimer</Text>
            <Text style={dStyles.subtitle}>RI Studio LLC · Nourish App</Text>

            <ScrollView style={dStyles.scroll} showsVerticalScrollIndicator={false}>
              <Text style={dStyles.body}>
                The content in this application — including meal plans, food guides, wellness tools, and nutritional information — is provided for{" "}
                <Text style={dStyles.bold}>general informational and educational purposes only.</Text>
              </Text>
              <Text style={dStyles.body}>
                <Text style={dStyles.bold}>Nourish is not a medical application.</Text> Nothing in this app constitutes medical advice, diagnosis, or treatment, nor is it a substitute for professional medical consultation. It is not designed or intended to diagnose, treat, cure, or prevent any disease or medical condition.
              </Text>
              <Text style={dStyles.body}>
                Always consult your physician, registered dietitian, or licensed healthcare provider before making changes to your diet, supplementation, or wellness routine — especially if you have a pre-existing medical condition, take prescription medication, or are pregnant or nursing.
              </Text>
              <Text style={dStyles.body}>
                By tapping <Text style={dStyles.bold}>"I Understand & Agree,"</Text> you acknowledge that you have read this disclaimer and agree to use this application for informational purposes only.
              </Text>
            </ScrollView>

            <Pressable style={dStyles.btn} onPress={accept}>
              <Text style={dStyles.btnText}>I Understand & Agree</Text>
            </Pressable>

            <Pressable onPress={() => router.push("/disclaimer" as never)} style={dStyles.readMore}>
              <Text style={dStyles.readMoreText}>Read Full Medical Disclaimer & Copyright Notice</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const dStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "center", alignItems: "center", padding: 24 },
  card: { backgroundColor: "#ffffff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 420, maxHeight: "85%" },
  iconRow: { alignItems: "center", marginBottom: 12 },
  icon: { fontSize: 36 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#1e3a2f", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#888", textAlign: "center", letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 },
  scroll: { maxHeight: 260, marginBottom: 20 },
  body: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#444", lineHeight: 21, marginBottom: 12 },
  bold: { fontFamily: "Inter_600SemiBold", color: "#1e3a2f" },
  btn: { backgroundColor: "#3d6b52", borderRadius: 12, paddingVertical: 15, alignItems: "center", marginBottom: 12 },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  readMore: { alignItems: "center" },
  readMoreText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#3d6b52", textDecorationLine: "underline" },
});

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="plan/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="checkout" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="templates/index" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="templates/meal-prep" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="templates/grocery-bundles" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="templates/reset-protocol" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="templates/wellness-journal" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="templates/meal-planner" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="privacy" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="disclaimer" options={{ headerShown: false, presentation: "card" }} />
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
            <KeyboardProvider>
              <PurchaseProvider>
                <DisclaimerGate>
                  <RootLayoutNav />
                </DisclaimerGate>
              </PurchaseProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
