import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallbackScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { signInWithToken } = useAuth();

  useEffect(() => {
    if (!token) {
      router.replace("/welcome" as never);
      return;
    }
    signInWithToken(token)
      .then(() => router.replace("/(tabs)" as never))
      .catch(() => router.replace("/welcome" as never));
  }, [token]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#5cb87a" />
      <Text style={styles.text}>Signing you in…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080c0a", alignItems: "center", justifyContent: "center", gap: 16 },
  text: { color: "rgba(255,255,255,0.6)", fontSize: 15, fontFamily: "Inter_400Regular" },
});
