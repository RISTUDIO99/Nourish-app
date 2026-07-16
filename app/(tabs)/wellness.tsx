import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { wellnessProducts } from "@/data/wellness";

const HEADER_IMAGE = require("../../assets/images/nourish-banner.png");

const BENEFITS = [
  { icon: "body-outline" as const, title: "Physical Recovery", desc: "Reduce muscle tension, soreness, and inflammation so your body can repair and rebuild." },
  { icon: "heart-outline" as const, title: "Circulation & Flow", desc: "Improved blood flow delivers oxygen and nutrients while flushing out inflammatory waste." },
  { icon: "happy-outline" as const, title: "Mental Relaxation", desc: "Physical release triggers the parasympathetic system — calming the mind and lowering stress hormones." },
  { icon: "bed-outline" as const, title: "Sleep & Rest", desc: "Lower cortisol, relaxed muscles, and less tension all contribute to deeper, more restorative sleep." },
];

export default function WellnessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 110 + bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header — beautiful background image */}
      <ImageBackground
        source={HEADER_IMAGE}
        style={[styles.header, { paddingTop: topPad + 24 }]}
        resizeMode="cover"
      >
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <Text style={styles.riStudio}>RI Studio</Text>
          <Text style={styles.headerTitle}>Wellness Toolkit</Text>
          <Text style={styles.headerSub}>
            Tools that support your body, mind, and healing.
          </Text>
        </View>
      </ImageBackground>

      {/* Intro */}
      <View style={styles.introSection}>
        <Text style={[styles.introHeading, { color: colors.foreground }]}>
          Healing Beyond the Plate
        </Text>
        <Text style={[styles.introParagraph, { color: colors.mutedForeground }]}>
          What you eat is the foundation — but true wellness is built on multiple layers. Alongside an anti-inflammatory diet, wellness tools play a powerful role in helping your body physically release tension, reduce pain, and recover more fully.
        </Text>
        <Text style={[styles.introParagraph, { color: colors.mutedForeground }]}>
          Devices that support circulation, muscle recovery, and nervous system regulation work hand-in-hand with your nutrition. When your body is less tense and your stress response is calmer, inflammation decreases, sleep improves, and your cells can do the work of healing more effectively.
        </Text>
        <Text style={[styles.introParagraph, { color: colors.mutedForeground }]}>
          Mental and physical relaxation are not luxuries — they are medicine. The Nourish Wellness Toolkit brings you vetted tools that address the whole picture: body, mind, and recovery.
        </Text>

        <View style={styles.benefitsGrid}>
          {BENEFITS.map((b) => (
            <View key={b.title} style={[styles.benefitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.primary + "18" }]}>
                <Ionicons name={b.icon} size={22} color={colors.primary} />
              </View>
              <Text style={[styles.benefitTitle, { color: colors.foreground }]}>{b.title}</Text>
              <Text style={[styles.benefitDesc, { color: colors.mutedForeground }]}>{b.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.divider, { borderColor: colors.border }]} />

      {/* Products */}
      <View style={styles.productsSection}>
        <Text style={[styles.productsHeading, { color: colors.foreground }]}>Recommended Tools</Text>
        <Text style={[styles.productsSub, { color: colors.mutedForeground }]}>
          Each Nourish update brings a new vetted wellness tool. These are the ones we stand behind.
        </Text>

        {wellnessProducts.map((product) => (
          <View key={product.id} style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.secondary }]}>
            {product.badge && (
              <View style={[styles.productBadge, { backgroundColor: colors.secondary }]}>
                <Text style={styles.productBadgeText}>{product.badge}</Text>
              </View>
            )}
            <View style={styles.categoryRow}>
              <Ionicons name="hardware-chip-outline" size={13} color={colors.mutedForeground} />
              <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>Recovery Device</Text>
            </View>
            <Text style={[styles.productName, { color: colors.foreground }]}>{product.name}</Text>
            <Text style={[styles.productTagline, { color: colors.secondary }]}>{product.tagline}</Text>
            <Text style={[styles.productDesc, { color: colors.mutedForeground }]}>{product.description}</Text>

            <Text style={[styles.physicalNote, { color: colors.mutedForeground }]}>
              Physical device · Sold externally · Not an in-app purchase
            </Text>

            <Pressable
              style={({ pressed }) => [styles.productBtn, { backgroundColor: "#111111" }, pressed && { opacity: 0.80 }]}
              onPress={() => Linking.openURL(product.url)}
            >
              <Text style={styles.productBtnText}>View Physical Device</Text>
              <Ionicons name="arrow-forward" size={15} color="#fff" />
            </Pressable>

            <Text style={[styles.productUrlHint, { color: colors.mutedForeground }]}>
              theonedevice.com/theraroad
            </Text>
          </View>
        ))}

        <View style={[styles.comingSoon, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="add-circle-outline" size={28} color={colors.mutedForeground} />
          <Text style={[styles.comingSoonTitle, { color: colors.foreground }]}>New Tools Coming on Future Updates</Text>
          <Text style={[styles.comingSoonSub, { color: colors.mutedForeground }]}>
            A new vetted wellness device is added with every Nourish software update. Stay tuned.
          </Text>
        </View>

        <View style={[styles.legalRow, { borderTopColor: colors.border }]}>
          <Pressable
            style={({ pressed }) => [styles.legalLink, pressed && { opacity: 0.6 }]}
            onPress={() => router.push("/privacy" as never)}
          >
            <Ionicons name="shield-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.legalLinkText, { color: colors.mutedForeground }]}>Privacy Policy</Text>
          </Pressable>
          <Text style={[styles.legalDot, { color: colors.mutedForeground }]}>·</Text>
          <Pressable
            style={({ pressed }) => [styles.legalLink, pressed && { opacity: 0.6 }]}
            onPress={() => router.push("/disclaimer" as never)}
          >
            <Ionicons name="medical-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.legalLinkText, { color: colors.mutedForeground }]}>Medical Disclaimer</Text>
          </Pressable>
        </View>
        <View style={[styles.copyrightRow, { borderTopColor: colors.border }]}>
          <Ionicons name="shield-checkmark-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.legalCopy, { color: colors.mutedForeground }]}>© {new Date().getFullYear()} RI Studio LLC. All rights reserved. Content protected by copyright.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { width: "100%", minHeight: 240, justifyContent: "flex-end" },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10,30,20,0.60)" },
  headerContent: { padding: 24, paddingBottom: 28 },
  riStudio: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 4 },
  headerTitle: { fontSize: 34, fontFamily: "Inter_700Bold", color: "#ffffff", marginBottom: 8 },
  headerSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  introSection: { padding: 24 },
  introHeading: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 14, lineHeight: 30 },
  introParagraph: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 23, marginBottom: 14 },
  benefitsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  benefitCard: { width: "47.5%", padding: 14, borderRadius: 12, borderWidth: 1, gap: 8 },
  benefitIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  benefitTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  benefitDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  divider: { borderTopWidth: 1, marginHorizontal: 24, marginBottom: 8 },
  productsSection: { padding: 24 },
  productsHeading: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4 },
  productsSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 20 },
  productCard: { borderRadius: 16, borderWidth: 2, padding: 20, marginBottom: 16 },
  productBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100, marginBottom: 14 },
  productBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8 },
  categoryText: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.5, textTransform: "uppercase" },
  productName: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 4 },
  productTagline: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 12, fontStyle: "italic" },
  productDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 20 },
  productBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12, marginBottom: 10 },
  productBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  productUrlHint: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", opacity: 0.6 },
  physicalNote: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 10, opacity: 0.7 },
  comingSoon: { borderRadius: 14, borderWidth: 1, borderStyle: "dashed", padding: 24, alignItems: "center", gap: 8 },
  comingSoonTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  comingSoonSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  legalRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8, paddingTop: 20, borderTopWidth: 1, marginTop: 8 },
  legalLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  legalLinkText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  legalDot: { fontSize: 12 },
  legalCopy: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", flex: 1 },
  copyrightRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingTop: 12, borderTopWidth: 1, marginTop: 10, marginHorizontal: 8 },
});
