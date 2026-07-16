import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { plans } from "@/data/plans";
import { usePurchase } from "@/contexts/PurchaseContext";

const HERO_IMAGE = require("../../assets/images/nourish-premium.png");
const BANNER_IMAGE = require("../../assets/images/nourish-banner.png");
const { width } = Dimensions.get("window");

const PLAN_COLORS = ["#4a7c59", "#b5813a", "#2e6b8a", "#7a4a8a"];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tier } = usePurchase();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 + bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <ImageBackground
        source={HERO_IMAGE}
        style={[styles.hero, { paddingTop: topPad + 20 }]}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.riStudio}>RI Studio presents</Text>
          <Text style={styles.heroTitle}>Nourish</Text>
          <Text style={styles.heroTagline}>
            Eat well. Heal naturally.{"\n"}Feel the difference.
          </Text>
          <View style={styles.heroCtas}>
            <Pressable
              style={({ pressed }) => [
                styles.heroPrimary,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => router.push("/checkout")}
            >
              <Text style={styles.heroPrimaryText}>Get Full Access</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.heroSecondary,
                pressed && { opacity: 0.75 },
              ]}
              onPress={() => router.push("/(tabs)/plans")}
            >
              <Text style={styles.heroSecondaryText}>Browse Plans</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>

      {/* Tagline strip */}
      <View style={[styles.strip, { backgroundColor: colors.primary }]}>
        <Text style={styles.stripText}>
          Four science-backed meal plans · Anti-inflammatory eating · Natural healing
        </Text>
      </View>


      {/* Founder Circle Card */}
      {tier === "founder" && (
        <View style={styles.founderCard}>
          <View style={styles.founderCardInner}>
            {/* Decorative circles */}
            <View style={styles.founderCircle1} />
            <View style={styles.founderCircle2} />

            {/* Top row */}
            <View style={styles.founderTopRow}>
              <View style={styles.founderCrownWrap}>
                <Ionicons name="ribbon" size={22} color="#e8c97a" />
              </View>
              <View style={styles.founderPill}>
                <Text style={styles.founderPillText}>FOUNDING MEMBER</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.founderCardTitle}>Founder Circle</Text>
            <Text style={styles.founderInnerLabel}>Inner Circle</Text>
            <Text style={styles.founderCardSub}>
              You believed in Nourish from the beginning.{"\n"}This membership is yours — forever.
            </Text>

            {/* Divider */}
            <View style={styles.founderDivider} />

            {/* Perks row */}
            <View style={styles.founderPerks}>
              {[
                { icon: "call-outline" as const, label: "Monthly 1-on-1" },
                { icon: "star-outline" as const, label: "All Features" },
                { icon: "shield-checkmark-outline" as const, label: "Priority Access" },
              ].map((p) => (
                <View key={p.label} style={styles.founderPerk}>
                  <Ionicons name={p.icon} size={16} color="#e8c97a" />
                  <Text style={styles.founderPerkText}>{p.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Plans preview */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Your Meal Plans
        </Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
          Choose your plan and start your 7-day journey today.
        </Text>
        <View style={styles.planGrid}>
          {plans.map((plan, i) => (
            <Pressable
              key={plan.id}
              style={({ pressed }) => [
                styles.planCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => router.push(`/plan/${plan.id}`)}
            >
              <View style={[styles.planAccent, { backgroundColor: PLAN_COLORS[i] }]} />
              <View style={styles.planCardBody}>
                <Text style={[styles.planCardTitle, { color: colors.foreground }]}>
                  {plan.title}
                </Text>
                <Text style={[styles.planCardSub, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {plan.shortDescription}
                </Text>
                <View style={styles.planCardArrow}>
                  <Ionicons name="arrow-forward-circle" size={22} color={PLAN_COLORS[i]} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Food banner */}
      <ImageBackground
        source={BANNER_IMAGE}
        style={styles.bannerSection}
        resizeMode="cover"
      >
        <View style={styles.bannerOverlay} />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>The Science of Anti-Inflammatory Eating</Text>
          <Text style={styles.bannerBody}>
            Every meal in Nourish is chosen to reduce inflammation at the cellular level — through omega-3s, curcumin, polyphenols, and gut-supporting foods.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.bannerBtn, pressed && { opacity: 0.8 }]}
            onPress={() => router.push("/(tabs)/guide")}
          >
            <Text style={styles.bannerBtnText}>Explore the Food Guide</Text>
          </Pressable>
        </View>
      </ImageBackground>

      {/* Why Nourish */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Why Nourish</Text>
        {[
          { icon: "leaf-outline" as const, title: "Research-Backed", body: "Every food recommendation is grounded in peer-reviewed science, not trends." },
          { icon: "fitness-outline" as const, title: "Whole-Body Healing", body: "From joint support to gut health — food is your most powerful daily medicine." },
          { icon: "heart-outline" as const, title: "Built for Real Life", body: "Practical 7-day plans you can actually follow, shop for, and enjoy." },
        ].map((item) => (
          <View key={item.title} style={[styles.whyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.whyIcon, { backgroundColor: colors.primary + "18" }]}>
              <Ionicons name={item.icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.whyTitle, { color: colors.foreground }]}>{item.title}</Text>
              <Text style={[styles.whyBody, { color: colors.mutedForeground }]}>{item.body}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={[styles.ctaSection, { backgroundColor: colors.primary }]}>
        <Text style={styles.ctaTitle}>Ready to start your journey?</Text>
        <Text style={styles.ctaSub}>Two plans. Full access. Natural healing.</Text>
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.85 }]}
          onPress={() => router.push("/checkout")}
        >
          <Text style={styles.ctaBtnText}>See Pricing →</Text>
        </Pressable>
      </View>

      {/* Legal Footer */}
      <View style={[styles.legalFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.legalDisclaimer, { color: colors.mutedForeground }]}>
          <Text style={[styles.legalDisclaimerBold, { color: colors.mutedForeground }]}>Medical Disclaimer: </Text>
          The content in this app is for informational and educational purposes only. It is not intended to diagnose, treat, cure, or prevent any disease or medical condition, and is not a substitute for professional medical advice. Always consult a qualified healthcare provider before making dietary or lifestyle changes.
        </Text>
        <View style={styles.legalLinks}>
          <Pressable onPress={() => router.push("/disclaimer" as never)}>
            <Text style={[styles.legalLink, { color: colors.primary }]}>Medical Disclaimer & Copyright</Text>
          </Pressable>
          <Text style={[styles.legalDot, { color: colors.mutedForeground }]}>·</Text>
          <Pressable onPress={() => router.push("/privacy" as never)}>
            <Text style={[styles.legalLink, { color: colors.primary }]}>Privacy Policy</Text>
          </Pressable>
        </View>
        <Text style={[styles.legalCopy, { color: colors.mutedForeground }]}>
          © {new Date().getFullYear()} RI Studio LLC. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    minHeight: 520,
    justifyContent: "flex-end",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 30, 20, 0.58)",
  },
  heroContent: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    alignItems: "flex-start",
  },
  founderCard: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#3a1a5a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  founderCardInner: {
    backgroundColor: "#2a1040",
    padding: 24,
    overflow: "hidden",
  },
  founderCircle1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#7a4a8a",
    opacity: 0.18,
    top: -40,
    right: -40,
  },
  founderCircle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e8c97a",
    opacity: 0.08,
    bottom: -20,
    left: 20,
  },
  founderTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  founderCrownWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(232,201,122,0.15)",
    borderWidth: 1,
    borderColor: "rgba(232,201,122,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  founderPill: {
    backgroundColor: "rgba(232,201,122,0.15)",
    borderWidth: 1,
    borderColor: "rgba(232,201,122,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  founderPillText: {
    color: "#e8c97a",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  founderCardTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  founderInnerLabel: {
    color: "#e8c97a",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  founderCardSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  founderDivider: {
    height: 1,
    backgroundColor: "rgba(232,201,122,0.2)",
    marginVertical: 18,
  },
  founderPerks: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  founderPerk: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  founderPerkText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  riStudio: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 62,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    lineHeight: 66,
    marginBottom: 14,
  },
  heroTagline: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
    marginBottom: 32,
  },
  heroCtas: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  heroPrimary: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 100,
  },
  heroPrimaryText: {
    color: "#1e3a2f",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  heroSecondary: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.45)",
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 100,
  },
  heroSecondaryText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  strip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  stripText: {
    color: "rgba(255,255,255,0.80)",
    fontSize: 11.5,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 20,
  },
  planGrid: {
    gap: 12,
  },
  planCard: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  planAccent: {
    width: 5,
  },
  planCardBody: {
    flex: 1,
    padding: 16,
  },
  planCardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  planCardSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
    flex: 1,
  },
  planCardArrow: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  bannerSection: {
    marginTop: 36,
    width: "100%",
    minHeight: 240,
    justifyContent: "center",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 20, 12, 0.68)",
  },
  bannerContent: {
    padding: 28,
  },
  bannerTitle: {
    color: "#ffffff",
    fontSize: 21,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    lineHeight: 28,
  },
  bannerBody: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
    marginBottom: 20,
  },
  bannerBtn: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 100,
  },
  bannerBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  whyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  whyIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  whyTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 3,
  },
  whyBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  ctaSection: {
    marginTop: 36,
    padding: 32,
    alignItems: "center",
  },
  legalFooter: {
    padding: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  legalDisclaimer: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    textAlign: "center",
  },
  legalDisclaimerBold: {
    fontFamily: "Inter_600SemiBold",
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  legalLink: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textDecorationLine: "underline",
  },
  legalDot: {
    fontSize: 11,
  },
  legalCopy: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  ctaTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  ctaSub: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
    textAlign: "center",
  },
  ctaBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
  },
  ctaBtnText: {
    color: "#1e3a2f",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
