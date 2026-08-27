import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const VAULT_ITEMS = [
  {
    id: "audio",
    route: "/vault-audio",
    icon: "headset-outline" as const,
    label: "LEGACY RESERVE",
    title: "The Legacy Reserve",
    desc: "Guided meditations, breathwork sessions, and anti-inflammatory lifestyle audio curated exclusively for Legacy members.",
    tag: "Live",
    tagColor: "#4caf82",
    items: [
      "Guided Meditations",
      "Work Sessions",
      "Morning Inflammation Reset (12 min)",
      "Evening Wind-Down Protocol (10 min)",
    ],
    note: "Available Through the Legacy Reserve",
  },
  {
    id: "content",
    route: "/vault-content",
    icon: "newspaper-outline" as const,
    label: "WEEKLY UPDATES",
    title: "Weekly Premium Content",
    desc: "Every week, fresh research summaries, seasonal ingredient guides, and exclusive recipes land directly in your app.",
    tag: "Live",
    tagColor: "#4caf82",
    items: [
      "Seasonal anti-inflammatory ingredients",
      "New research summaries (no jargon)",
      "Exclusive member-only recipes",
      "Monthly healing protocol updates",
    ],
    note: null,
  },
  {
    id: "tools",
    route: "/vault-tools",
    icon: "construct-outline" as const,
    label: "MEMBER TOOLS",
    title: "Exclusive Member Tools",
    desc: "Advanced tracking, personalized resources, and tools built specifically around the needs of Legacy members.",
    tag: "Live",
    tagColor: "#4caf82",
    items: [
      "Personal inflammation tracker",
      "Custom supplement stack guide",
      "Priority support line (24hr response)",
      "Monthly Wellness Blueprint",
    ],
    note: null,
  },
];

export default function VaultScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={["#fdf8f0", "#faf3e4", "#fdf8f0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color="#c9a227" />
        </Pressable>

        <View style={styles.headerBadge}>
          <Ionicons name="diamond" size={12} color="#c9a227" />
          <Text style={styles.headerBadgeText}>LEGACY EXCLUSIVE</Text>
        </View>

        <Text style={styles.headerTitle}>Legacy Vault</Text>
        <Text style={styles.headerSub}>
          Your highest-tier access. Exclusive content, tools, and resources curated just for you.
        </Text>

        {/* Gem divider */}
        <View style={styles.gemRow}>
          <View style={styles.gemLine} />
          <Ionicons name="diamond" size={16} color="#c9a227" />
          <View style={styles.gemLine} />
        </View>
      </LinearGradient>

      {/* Vault items */}
      <View style={styles.grid}>
        {VAULT_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}
            onPress={() => router.push(item.route as never)}
          >
            <LinearGradient
              colors={["#fffef8", "#fdf8ee"]}
              style={styles.cardGrad}
            >
              {/* Top row */}
              <View style={styles.cardTop}>
                <View style={styles.cardIconWrap}>
                  <Ionicons name={item.icon} size={22} color="#c9a227" />
                </View>
                <View style={styles.cardTopRight}>
                  <Text style={styles.cardLabel}>{item.label}</Text>
                  <View style={[styles.cardTag, { borderColor: item.tagColor + "60" }]}>
                    <View style={[styles.tagDot, { backgroundColor: item.tagColor }]} />
                    <Text style={[styles.tagText, { color: item.tagColor }]}>{item.tag}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>

              {/* Item list */}
              <View style={styles.itemList}>
                {item.items.map((line) => (
                  <View key={line} style={styles.itemRow}>
                    <Ionicons name="checkmark" size={14} color="#c9a227" />
                    <Text style={styles.itemText}>{line}</Text>
                  </View>
                ))}
              </View>

              {/* Tap indicator */}
              <View style={styles.tapRow}>
                <Text style={styles.tapLabel}>Open</Text>
                <Ionicons name="chevron-forward" size={14} color="rgba(201,162,39,0.5)" />
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </View>

      {/* Footer note */}
      <View style={styles.footer}>
        <Ionicons name="shield-checkmark-outline" size={16} color="#c9a227" />
        <Text style={styles.footerText}>
          Content is continuously updated. As a Legacy member, you receive every new addition automatically.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf8f0",
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  backBtn: {
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  headerBadgeText: {
    color: "#c9a227",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  headerTitle: {
    color: "#1e1400",
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    marginBottom: 10,
  },
  headerSub: {
    color: "rgba(30,20,0,0.6)",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 23,
    marginBottom: 24,
  },
  gemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  gemLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201,162,39,0.3)",
  },
  grid: {
    padding: 16,
    gap: 14,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.3)",
  },
  cardGrad: {
    padding: 20,
    gap: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(201,162,39,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTopRight: {
    flex: 1,
    gap: 6,
  },
  cardLabel: {
    color: "rgba(201,162,39,0.7)",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  cardTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 1,
  },
  tagDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  cardTitle: {
    color: "#1e1400",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  cardDesc: {
    color: "rgba(30,20,0,0.6)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  itemList: {
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(201,162,39,0.2)",
    marginTop: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  itemText: {
    color: "rgba(30,20,0,0.7)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(201,162,39,0.08)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.2)",
  },
  footerText: {
    color: "rgba(201,162,39,0.7)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    flex: 1,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#c9a227",
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 4,
  },
  actionBtnText: {
    color: "#0d0b00",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  tapRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  tapLabel: {
    color: "rgba(201,162,39,0.5)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
