import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SUPPORT_EMAIL = "joseph@nourishbyri.com";

export default function VaultToolsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#fdf8f0", "#faf3e4", "#fdf8f0"]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#c9a227" />
        </Pressable>
        <View style={styles.badge}>
          <Ionicons name="construct" size={12} color="#c9a227" />
          <Text style={styles.badgeText}>MEMBER TOOLS</Text>
        </View>
        <Text style={styles.title}>Exclusive Member Tools</Text>
        <Text style={styles.sub}>
          Built specifically for Legacy members. Personalized tracking, curated resources, and direct access to Joseph.
        </Text>
      </LinearGradient>

      <View style={styles.section}>

        {/* Inflammation Tracker */}
        <View style={styles.toolCard}>
          <LinearGradient colors={["#fffef8", "#fdf8ee"]} style={styles.toolGrad}>
            <View style={styles.toolTop}>
              <View style={styles.toolIconWrap}>
                <Ionicons name="pulse" size={24} color="#c9a227" />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Inflammation Tracker</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
            </View>
            <Text style={styles.toolDesc}>
              Log your daily pain level, energy, sleep, and flaring joints. Track patterns over time to understand exactly what's helping your body heal — and what isn't.
            </Text>
            <View style={styles.featureList}>
              {["Daily pain & energy scale (1–10)","Joint flare tracking by area","Sleep hours log","Personal notes (food, habits)","14-day history view"].map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#c9a227" />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.85 }]}
              onPress={() => router.push("/tracker" as never)}
            >
              <LinearGradient colors={["#c9a227", "#a07a10"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionGrad}>
                <Ionicons name="pulse" size={16} color="#0d0b00" />
                <Text style={styles.actionBtnText}>Open Tracker</Text>
                <Ionicons name="arrow-forward" size={16} color="#0d0b00" />
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Supplement Stack Guide */}
        <View style={styles.toolCard}>
          <LinearGradient colors={["#fffef8", "#fdf8ee"]} style={styles.toolGrad}>
            <View style={styles.toolTop}>
              <View style={styles.toolIconWrap}>
                <Ionicons name="flask" size={24} color="#c9a227" />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Supplement Stack Guide</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>AVAILABLE</Text>
                </View>
              </View>
            </View>
            <Text style={styles.toolDesc}>
              Joseph's personal supplement notebook. What he takes, why he chose it, and what the research says. Based on years of personal experience managing RA through nutrition. Educational only: bring this guide to your doctor or pharmacist before making changes.
            </Text>
            <View style={styles.featureList}>
              {[
                "Joseph's personal stack with reasoning",
                "Anti-inflammatory supplements: what the research says",
                "What he avoids and why",
                "Budget vs. premium options",
                "Questions to ask your doctor",
              ].map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#c9a227" />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.85 }]}
              onPress={() => router.push("/vault-supplement" as never)}
            >
              <LinearGradient colors={["#c9a227", "#a07a10"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionGrad}>
                <Ionicons name="flask" size={16} color="#0d0b00" />
                <Text style={styles.actionBtnText}>Open Guide</Text>
                <Ionicons name="arrow-forward" size={16} color="#0d0b00" />
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Priority Support */}
        <View style={styles.toolCard}>
          <LinearGradient colors={["#fffef8", "#fdf8ee"]} style={styles.toolGrad}>
            <View style={styles.toolTop}>
              <View style={styles.toolIconWrap}>
                <Ionicons name="headset" size={24} color="#c9a227" />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Priority Support Line</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>ACTIVE</Text>
                </View>
              </View>
            </View>
            <Text style={styles.toolDesc}>
              Direct access to Joseph. As a Legacy member you receive priority responses within 24 hours. Questions about the meal plans, the content library, or how Joseph approaches his own routine. Ask anything.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.85 }]}
              onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Legacy Member Support Request`)}
            >
              <LinearGradient colors={["#c9a227", "#a07a10"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionGrad}>
                <Ionicons name="mail" size={16} color="#0d0b00" />
                <Text style={styles.actionBtnText}>Email Joseph Directly</Text>
                <Ionicons name="arrow-forward" size={16} color="#0d0b00" />
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Monthly Wellness Blueprint */}
        <View style={styles.toolCard}>
          <LinearGradient colors={["#fffef8", "#fdf8ee"]} style={styles.toolGrad}>
            <View style={styles.toolTop}>
              <View style={styles.toolIconWrap}>
                <Ionicons name="mail" size={24} color="#c9a227" />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Monthly Wellness Blueprint</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>INCLUDED</Text>
                </View>
              </View>
            </View>
            <Text style={styles.toolDesc}>
              Every month, Joseph personally curates and delivers your Wellness Blueprint — a focused anti-inflammatory dispatch straight to your inbox. That month's featured foods, what to cut back on, a supplement spotlight, and one lifestyle tweak you can apply immediately. Research-backed, practical, and built around how real people actually live and heal.
            </Text>
            <Text style={styles.mentorDisclaimer}>
              The Monthly Wellness Blueprint is for educational and wellness purposes only. Always work with your care team on medical decisions.
            </Text>
            <Text style={styles.scheduleNote}>
              Your Blueprint arrives in your inbox on the first of each month. Make sure your email is up to date in your account.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.85 }]}
              onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Monthly Wellness Blueprint&body=Hi Joseph,%0A%0AI'm a Legacy member and I'd like to confirm my email for the Monthly Wellness Blueprint.%0A%0ALooking forward to it!`)}
            >
              <LinearGradient colors={["#c9a227", "#a07a10"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionGrad}>
                <Ionicons name="mail" size={16} color="#0d0b00" />
                <Text style={styles.actionBtnText}>Confirm My Email</Text>
                <Ionicons name="arrow-forward" size={16} color="#0d0b00" />
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf8f0" },
  header: { paddingHorizontal: 24, paddingBottom: 28 },
  backBtn: { marginBottom: 20, alignSelf: "flex-start" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  badgeText: { color: "#c9a227", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  title: { color: "#1e1400", fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 10 },
  sub: { color: "rgba(30,20,0,0.55)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  section: { padding: 16, gap: 14 },
  toolCard: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(201,162,39,0.25)" },
  toolGrad: { padding: 20, gap: 14 },
  toolTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  toolIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(201,162,39,0.12)", alignItems: "center", justifyContent: "center" },
  toolInfo: { flex: 1, gap: 6 },
  toolTitle: { color: "#1e1400", fontSize: 18, fontFamily: "Inter_700Bold" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, backgroundColor: "rgba(76,175,130,0.15)", borderWidth: 1, borderColor: "rgba(76,175,130,0.4)" },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#4caf82" },
  liveText: { color: "#4caf82", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  soonBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, backgroundColor: "rgba(30,20,0,0.07)", borderWidth: 1, borderColor: "rgba(30,20,0,0.15)" },
  soonText: { color: "rgba(30,20,0,0.45)", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  toolDesc: { color: "rgba(30,20,0,0.6)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  featureList: { gap: 8 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  featureText: { color: "rgba(30,20,0,0.65)", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  mentorDisclaimer: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(30,20,0,0.35)",
    lineHeight: 16,
    fontStyle: "italic",
    marginTop: -4,
  },
  scheduleNote: { color: "rgba(201,162,39,0.6)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, fontStyle: "italic" },
  actionBtn: { borderRadius: 12, overflow: "hidden" },
  actionGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 14 },
  actionBtnText: { color: "#0d0b00", fontSize: 15, fontFamily: "Inter_700Bold" },
});
