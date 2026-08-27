import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
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
import { plans } from "@/data/plans";
import { usePurchase } from "@/contexts/PurchaseContext";
import { WELCOME_SEEN_KEY } from "@/constants/keys";

const GEM_IMAGES = {
  emerald: require("../../assets/images/gem-emerald.png"),
  sapphire: require("../../assets/images/gem-sapphire.png"),
  ruby:     require("../../assets/images/gem-ruby.png"),
  diamond:  require("../../assets/images/gem-diamond.png"),
};

const HERO_IMAGE = require("../../assets/images/nourish-premium.png");
const BANNER_IMAGE = require("../../assets/images/nourish-banner.png");

const PLAN_COLORS = ["#4a7c59", "#b5813a", "#2e6b8a", "#7a4a8a"];

// ─── Tier config (mirrors checkout design language) ─────────────────────────
const TIER_CONFIG = {
  essentials: {
    gem: "emerald" as const,
    cardBg: ["#f4fbf7", "#eaf6ef", "#f4fbf7"] as const,
    accentColor: "#1a6b3c",
    goldColor: "#8a6914",
    borderColor: "rgba(26,107,60,0.2)",
    badge: "ESSENTIALS",
    title: "Essentials",
    tagline: "Full access. Flexible planning.",
    perks: [
      { icon: "pulse-outline", label: "Inflammation Tracker" },
      { icon: "leaf-outline", label: "All Meal Plans" },
      { icon: "book-outline", label: "Food Guide" },
    ],
  },
  pro: {
    gem: "sapphire" as const,
    cardBg: ["#f3f6ff", "#eaf0ff", "#f3f6ff"] as const,
    accentColor: "#1a3fa8",
    goldColor: "#8a6914",
    borderColor: "rgba(26,63,168,0.2)",
    badge: "PRO",
    title: "Pro",
    tagline: "Templates, tools & momentum.",
    perks: [
      { icon: "grid-outline", label: "Premium Templates" },
      { icon: "headset-outline", label: "Priority Support" },
      { icon: "flash-outline", label: "Early Access" },
    ],
  },
  founder: {
    gem: "ruby" as const,
    cardBg: ["#fff5f5", "#ffeaea", "#fff5f5"] as const,
    accentColor: "#991b1b",
    goldColor: "#8a6914",
    borderColor: "rgba(153,27,27,0.2)",
    badge: "VIP · FOUNDER CIRCLE",
    title: "Founder Circle",
    tagline: "You believed in Nourish from the beginning.",
    perks: [
      { icon: "pulse-outline", label: "Tracker" },
      { icon: "headset-outline", label: "Audio Library" },
      { icon: "flask-outline", label: "Beta Features" },
    ],
  },
  legacy: {
    gem: "diamond" as const,
    cardBg: ["#fffef5", "#fdf8e8", "#fffef5"] as const,
    accentColor: "#8a6914",
    goldColor: "#8a6914",
    borderColor: "rgba(201,162,39,0.45)",
    badge: "LEGACY EXCLUSIVE",
    title: "Legacy Membership",
    tagline: "The highest tier. Yours by invitation.",
    perks: [
      { icon: "diamond-outline", label: "Legacy Vault" },
      { icon: "mail-outline", label: "Wellness Blueprint" },
      { icon: "shield-checkmark-outline", label: "Priority Everything" },
    ],
  },
};

type TierKey = keyof typeof TIER_CONFIG;

function MemberCard({ tierKey }: { tierKey: TierKey }) {
  const cfg = TIER_CONFIG[tierKey];

  return (
    <View style={[mcStyles.card, { borderColor: cfg.borderColor }]}>
      <LinearGradient
        colors={cfg.cardBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={mcStyles.grad}
      >
        {/* Gem banner */}
        <View style={mcStyles.gemBanner}>
          <View style={[mcStyles.gemLine, { backgroundColor: cfg.goldColor + "40" }]} />
          <Image source={GEM_IMAGES[cfg.gem]} style={mcStyles.gemImage} resizeMode="contain" />
          <View style={[mcStyles.gemLine, { backgroundColor: cfg.goldColor + "40" }]} />
        </View>

        {/* Ornament divider */}
        <View style={mcStyles.ornamentRow}>
          <View style={[mcStyles.ornamentLine, { backgroundColor: cfg.goldColor + "30" }]} />
          <Text style={[mcStyles.ornamentDiamond, { color: cfg.goldColor }]}>◆</Text>
          <View style={[mcStyles.ornamentLine, { backgroundColor: cfg.goldColor + "30" }]} />
        </View>

        {/* Badge + title */}
        <View style={mcStyles.headerSection}>
          <View style={[mcStyles.badge, { borderColor: cfg.goldColor + "70", backgroundColor: cfg.goldColor + "15" }]}>
            <Text style={[mcStyles.badgeText, { color: cfg.goldColor }]}>{cfg.badge}</Text>
          </View>
          <Text style={[mcStyles.title, { color: cfg.goldColor }]}>{cfg.title}</Text>
          <Text style={[mcStyles.tagline, { color: cfg.accentColor }]}>{cfg.tagline}</Text>
        </View>

        {/* Divider */}
        <View style={[mcStyles.divider, { backgroundColor: cfg.goldColor + "25" }]} />

        {/* Perks row */}
        <View style={mcStyles.perksRow}>
          {cfg.perks.map((p) => (
            <View key={p.label} style={mcStyles.perk}>
              <View style={[mcStyles.perkIcon, { backgroundColor: cfg.goldColor + "18", borderColor: cfg.goldColor + "40" }]}>
                <Ionicons name={p.icon as any} size={16} color={cfg.goldColor} />
              </View>
              <Text style={[mcStyles.perkLabel, { color: cfg.accentColor }]}>{p.label}</Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        {tierKey === "legacy" && (
          <>
            <Pressable
              style={({ pressed }) => [mcStyles.actionBtn, { borderColor: cfg.goldColor + "55", backgroundColor: cfg.goldColor + "12" }, pressed && { opacity: 0.75 }]}
              onPress={() => router.push("/vault" as never)}
            >
              <Ionicons name="diamond-outline" size={15} color={cfg.goldColor} />
              <Text style={[mcStyles.actionBtnText, { color: cfg.goldColor }]}>Open Legacy Vault</Text>
              <Ionicons name="arrow-forward" size={14} color={cfg.goldColor} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [mcStyles.actionBtn, { borderColor: cfg.goldColor + "55", backgroundColor: cfg.goldColor + "12" }, pressed && { opacity: 0.75 }]}
              onPress={() => router.push("/vault-audio" as never)}
            >
              <Ionicons name="headset-outline" size={15} color={cfg.goldColor} />
              <Text style={[mcStyles.actionBtnText, { color: cfg.goldColor }]}>Audio Library</Text>
              <Ionicons name="arrow-forward" size={14} color={cfg.goldColor} />
            </Pressable>
          </>
        )}
        {tierKey === "founder" && (
          <>
            <Pressable
              style={({ pressed }) => [mcStyles.actionBtn, { borderColor: cfg.goldColor + "55", backgroundColor: cfg.goldColor + "12" }, pressed && { opacity: 0.75 }]}
              onPress={() => router.push("/tracker" as never)}
            >
              <Ionicons name="pulse-outline" size={15} color={cfg.goldColor} />
              <Text style={[mcStyles.actionBtnText, { color: cfg.goldColor }]}>Tracker</Text>
              <Ionicons name="arrow-forward" size={14} color={cfg.goldColor} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [mcStyles.actionBtn, { borderColor: cfg.goldColor + "55", backgroundColor: cfg.goldColor + "12" }, pressed && { opacity: 0.75 }]}
              onPress={() => router.push("/vault-audio" as never)}
            >
              <Ionicons name="headset-outline" size={15} color={cfg.goldColor} />
              <Text style={[mcStyles.actionBtnText, { color: cfg.goldColor }]}>Audio Library</Text>
              <Ionicons name="arrow-forward" size={14} color={cfg.goldColor} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [mcStyles.actionBtn, { borderColor: cfg.goldColor + "55", backgroundColor: cfg.goldColor + "12" }, pressed && { opacity: 0.75 }]}
              onPress={() => Linking.openURL("mailto:Support@ristudio.app?subject=Founder Circle - Beta Feature Access")}
            >
              <Ionicons name="flask-outline" size={15} color={cfg.goldColor} />
              <Text style={[mcStyles.actionBtnText, { color: cfg.goldColor }]}>Beta Feature Access</Text>
              <Ionicons name="arrow-forward" size={14} color={cfg.goldColor} />
            </Pressable>
          </>
        )}
      </LinearGradient>
    </View>
  );
}

const mcStyles = StyleSheet.create({
  card: {
    marginHorizontal: 16, marginTop: 20, marginBottom: 4,
    borderRadius: 20, overflow: "hidden", borderWidth: 1.5,
    shadowColor: "#c9a227", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 16, elevation: 8,
  },
  grad: { padding: 22, gap: 14 },
  gemBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 4 },
  gemLine: { flex: 1, height: 1 },
  gemImage: { width: 90, height: 90 },
  ornamentRow: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: -4 },
  ornamentLine: { flex: 1, height: 1 },
  ornamentDiamond: { fontSize: 10 },
  headerSection: { gap: 6 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  badgeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  tagline: { fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 19 },
  divider: { height: 1 },
  perksRow: { flexDirection: "row", justifyContent: "space-around" },
  perk: { alignItems: "center", gap: 6, flex: 1 },
  perkIcon: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  perkLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 12, borderWidth: 1 },
  actionBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "center" },
});

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tier } = usePurchase();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  // Redirect first-time users to the welcome/hero screen
  useEffect(() => {
    AsyncStorage.getItem(WELCOME_SEEN_KEY).then((v) => {
      if (v !== "true") {
        router.replace("/welcome" as never);
      }
    });
  }, []);

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
            Plan beautifully. Eat globally.{"\n"}Make every meal your own.
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
              onPress={() => router.push("/(tabs)/library" as never)}
            >
              <Text style={styles.heroSecondaryText}>Explore Foods</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>

      {/* Tagline strip */}
      <View style={[styles.strip, { backgroundColor: colors.primary }]}>
        <Text style={styles.stripText}>
          Global recipes · Visual meal planning · Personal wellness collections
        </Text>
      </View>


      {/* ── Premium Member Cards ── */}
      {tier === "legacy" && <MemberCard tierKey="legacy" />}
      {tier === "founder" && <MemberCard tierKey="founder" />}
      {tier === "pro" && <MemberCard tierKey="pro" />}
      {tier === "essentials" && <MemberCard tierKey="essentials" />}

      {/* Explore preview */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Explore the Library
        </Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
          Discover breakfasts, global cuisines, vibrant drinks, and wellness collections.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.exploreCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => router.push("/(tabs)/library" as never)}
        >
          <View style={[styles.exploreIconWrap, { backgroundColor: colors.primary + "18" }]}>
            <Ionicons name="search" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.exploreTitle, { color: colors.foreground }]}>Food & Meal Library</Text>
            <Text style={[styles.exploreSub, { color: colors.mutedForeground }]}>Browse 24 complete meals, drinks, and snacks</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

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
          <Text style={styles.bannerTitle}>Anti-Inflammatory Collection</Text>
          <Text style={styles.bannerBody}>
            Explore a dedicated collection built around colorful plants, omega-3-rich foods, whole grains, herbs, and practical everyday recipes.
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
          { icon: "earth-outline" as const, title: "Global by Design", body: "Discover everyday favorites alongside Ethiopian, East African, Mediterranean, Caribbean, and Asian-inspired meals." },
          { icon: "options-outline" as const, title: "Made Personal", body: "Adjust servings, save favorites, note substitutions, and build a plan that fits your life." },
          { icon: "heart-outline" as const, title: "Built for Real Life", body: "Practical recipes you can plan, shop for, cook, and genuinely enjoy." },
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
        <Text style={styles.ctaTitle}>Make this week delicious.</Text>
        <Text style={styles.ctaSub}>Global inspiration, practical planning, and room to make every recipe yours.</Text>
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
          <Pressable onPress={() => router.push("/about" as never)}>
            <Text style={[styles.legalLink, { color: colors.primary }]}>About the Founder</Text>
          </Pressable>
          <Text style={[styles.legalDot, { color: colors.mutedForeground }]}>·</Text>
          <Pressable onPress={() => router.push("/disclaimer" as never)}>
            <Text style={[styles.legalLink, { color: colors.primary }]}>Disclaimer</Text>
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
  exploreCard: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
    marginBottom: 8,
  },
  exploreIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  exploreTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  exploreSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
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
