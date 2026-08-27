import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const VIDEOS = [
  {
    id: "blueprint",
    title: "The Anti-Inflammatory Blueprint",
    duration: "~20 min",
    desc: "Joseph's complete framework — what to eat, what to eliminate, and the science behind anti-inflammatory nutrition explained in plain language. The foundation of everything Nourish is built on.",
    icon: "map-outline" as const,
  },
  {
    id: "mealprep",
    title: "The 60-Minute Meal Prep System",
    duration: "~20 min",
    desc: "A full week of anti-inflammatory meals prepped in a single hour. This episode breaks down Joseph's complete system: the prep order, the shortcuts, the containers, and the exact workflow, step by step, so you can run it in your own kitchen this Sunday.",
    icon: "restaurant-outline" as const,
  },
  {
    id: "research",
    title: "RA & Nutrition: What the Research Says",
    duration: "~15 min",
    desc: "Joseph breaks down the peer-reviewed research on rheumatoid arthritis and nutrition. No jargon, no fluff — just what actually works, what's overblown, and what he wishes he'd known earlier.",
    icon: "document-text-outline" as const,
  },
  {
    id: "routines",
    title: "Building Routines That Actually Stick",
    duration: "~15 min",
    desc: "The psychology of habit formation applied to healing. How Joseph built the routines that changed his health — and how you can adapt them to your own schedule, energy, and lifestyle.",
    icon: "repeat-outline" as const,
  },
  {
    id: "gut-health",
    title: "Gut Health & the Inflammation Connection",
    duration: "~20 min",
    desc: "How your microbiome drives systemic inflammation — and the foods that restore balance.",
    icon: "leaf-outline" as const,
  },
  {
    id: "stress-sleep",
    title: "Stress, Sleep & the Healing Cycle",
    duration: "~20 min",
    desc: "The overlooked role of cortisol, sleep quality, and nervous system regulation in chronic inflammation.",
    icon: "moon-outline" as const,
  },
];

export default function VaultVideoScreen() {
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
          <Ionicons name="play-circle" size={12} color="#c9a227" />
          <Text style={styles.badgeText}>VIDEO SERIES</Text>
        </View>
        <Text style={styles.title}>Legacy Vault</Text>
        <Text style={styles.sub}>
          Deep-dive sessions recorded personally by Joseph. Exclusive to Legacy members.
        </Text>
      </LinearGradient>

      <View style={styles.noticeRow}>
        <Ionicons name="videocam-outline" size={16} color="#c9a227" />
        <Text style={styles.noticeText}>
          Joseph is currently filming these sessions. Each video will be added here as soon as it's ready — you'll be the first to see them.
        </Text>
      </View>

      <View style={styles.list}>
        {VIDEOS.map((v, i) => (
          <View key={v.id} style={styles.card}>
            <LinearGradient colors={["#fffef8", "#fdf8ee"]} style={styles.cardGrad}>
              {/* Thumbnail placeholder */}
              <View style={styles.thumbnail}>
                <View style={styles.thumbInner}>
                  <Ionicons name={v.icon} size={32} color="rgba(201,162,39,0.4)" />
                </View>
                <View style={styles.comingSoonOverlay}>
                  <Text style={styles.comingSoonText}>COMING SOON</Text>
                </View>
                <View style={styles.episodeBadge}>
                  <Text style={styles.episodeText}>EP {String(i + 1).padStart(2, "0")}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{v.title}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={12} color="rgba(201,162,39,0.5)" />
                  <Text style={styles.duration}>{v.duration}</Text>
                </View>
                <Text style={styles.cardDesc}>{v.desc}</Text>

                <View style={[styles.watchBtn, styles.watchBtnDisabled]}>
                  <Ionicons name="play" size={16} color="rgba(30,20,0,0.2)" />
                  <Text style={styles.watchBtnTextDisabled}>In Production</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        ))}
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
  noticeRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    marginHorizontal: 16, marginTop: 16, marginBottom: 4,
    padding: 14, borderRadius: 12,
    backgroundColor: "rgba(201,162,39,0.08)",
    borderWidth: 1, borderColor: "rgba(201,162,39,0.2)",
  },
  noticeText: { color: "rgba(201,162,39,0.8)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, flex: 1 },
  list: { padding: 16, gap: 14 },
  card: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(201,162,39,0.25)" },
  cardGrad: { gap: 0 },
  thumbnail: { height: 160, backgroundColor: "#f5edd8", alignItems: "center", justifyContent: "center", position: "relative" },
  thumbInner: { alignItems: "center", justifyContent: "center" },
  comingSoonOverlay: {
    position: "absolute", bottom: 12, left: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    backgroundColor: "rgba(201,162,39,0.15)", borderWidth: 1, borderColor: "rgba(201,162,39,0.3)",
  },
  comingSoonText: { color: "rgba(201,162,39,0.8)", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  episodeBadge: {
    position: "absolute", top: 12, right: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    backgroundColor: "rgba(30,20,0,0.15)",
  },
  episodeText: { color: "rgba(30,20,0,0.6)", fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  cardBody: { padding: 18, gap: 10 },
  cardTitle: { color: "#1e1400", fontSize: 17, fontFamily: "Inter_700Bold" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  duration: { color: "rgba(201,162,39,0.6)", fontSize: 12, fontFamily: "Inter_400Regular" },
  cardDesc: { color: "rgba(30,20,0,0.55)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  watchBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 10, marginTop: 4 },
  watchBtnDisabled: { backgroundColor: "rgba(30,20,0,0.05)" },
  watchBtnTextDisabled: { color: "rgba(30,20,0,0.2)", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
