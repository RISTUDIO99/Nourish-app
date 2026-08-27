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

// ─── Content ────────────────────────────────────────────────────────────────
// [CONFIRM: affiliate links should use Amazon Associates ID ristudio99-20]

type Product = {
  name: string;
  brand: string;
  why: string;
  dose: string;
  link: string; // [CONFIRM: replace with affiliate link]
  icon: "flask-outline" | "leaf-outline" | "heart-outline" | "nutrition-outline";
  accentColor: string;
};

const PRODUCTS: Product[] = [
  {
    name: "Omega-3 Fish Oil",
    brand: "Sports Research · Triple Strength",
    why: "Omega-3 fatty acids (EPA and DHA) are the most studied anti-inflammatory supplements available. I take 2,000 mg EPA/DHA per day — one softgel with breakfast and one with dinner. Sports Research uses triglyceride-form fish oil, which research suggests absorbs better than ethyl ester form. I've tried cheaper brands and always come back to this one. My morning stiffness noticeably improved in the first 8–10 weeks.\n\nThe research: Several well-designed trials show omega-3 supplementation reduces joint tenderness and morning stiffness in rheumatoid arthritis. It doesn't eliminate the disease, but it consistently moves the needle in the right direction.",
    dose: "2 softgels daily with food. I split them — one in the morning, one at dinner.",
    link: "[CONFIRM: link to Sports Research Triple Strength Omega-3 via Amazon Associates ristudio99-20]",
    icon: "flask-outline",
    accentColor: "#3a8fcf",
  },
  {
    name: "Avocado Oil",
    brand: "Chosen Foods · 100% Pure",
    why: "I cook almost everything in avocado oil. It has a high smoke point (above 500°F), which means it doesn't break down into harmful compounds the way many vegetable oils do when heated. It's also rich in oleic acid and oleocanthal — compounds that appear to support an anti-inflammatory environment in the body.\n\nI switched away from canola and vegetable oil several years ago and haven't gone back. This is the one I buy in bulk. The Chosen Foods version is expeller-pressed and consistently clean.\n\nThis is a food, not a supplement, but I include it here because the oil you cook in matters more than most people realize.",
    dose: "Use as your primary cooking oil. No capsule needed — just use it.",
    link: "[CONFIRM: link to Chosen Foods Avocado Oil via Amazon Associates ristudio99-20]",
    icon: "leaf-outline",
    accentColor: "#4caf82",
  },
];

const AVOID = [
  "Vegetable oil, canola oil, soybean oil — all high in omega-6 and pro-inflammatory when heated",
  "Most 'joint support' blends — the individual doses are often too low to do anything meaningful",
  "Supplements with proprietary blends that hide individual ingredient amounts",
  "Any supplement promising to 'cure' or 'reverse' RA — that's not how this works",
];

const DOCTOR_QUESTIONS = [
  "Are there any supplements on this list that would interact with my current medications?",
  "Is my omega-3 dose appropriate given my current blood markers?",
  "Are there other anti-inflammatory supplements worth evaluating in my specific case?",
  "Are there any dietary changes that would make a meaningful difference for me?",
];

// ─── Screen ─────────────────────────────────────────────────────────────────
export default function VaultSupplementScreen() {
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
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#c9a227" />
        </Pressable>
        <View style={styles.badge}>
          <Ionicons name="flask" size={12} color="#c9a227" />
          <Text style={styles.badgeText}>LEGACY EXCLUSIVE</Text>
        </View>
        <Text style={styles.title}>My Supplement Notebook</Text>
        <Text style={styles.subtitle}>
          What I take, what I dropped, and the expensive lesson I learned first.
        </Text>
        <Text style={styles.byline}>— Joseph Young</Text>
      </LinearGradient>

      {/* Intro */}
      <View style={styles.introCard}>
        <Text style={styles.introText}>
          I spent the first two years after my RA diagnosis buying whatever showed up in search results for "best supplements for rheumatoid arthritis." Some of it was harmless. Some of it was expensive nonsense. A few things actually helped.{"\n\n"}
          What's here is not a complete protocol and it is not medical advice. It's my personal notebook — what I currently take, why I chose it, and what the research actually says. Bring it to your doctor. Ask questions. Build your own list.{"\n\n"}
          This is a living document. I'll update it when I change something.
        </Text>
        <View style={styles.disclaimerRow}>
          <Ionicons name="information-circle-outline" size={14} color="rgba(201,162,39,0.7)" />
          <Text style={styles.disclaimerText}>Educational only. Not medical advice.</Text>
        </View>
      </View>

      {/* Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What I Currently Take</Text>
        {PRODUCTS.map((product) => (
          <View key={product.name} style={styles.productCard}>
            <LinearGradient colors={["#fffef8", "#fdf8ee"]} style={styles.productGrad}>
              <View style={styles.productTop}>
                <View style={[styles.productIcon, { backgroundColor: product.accentColor + "18", borderColor: product.accentColor + "40" }]}>
                  <Ionicons name={product.icon} size={22} color={product.accentColor} />
                </View>
                <View style={styles.productMeta}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                </View>
              </View>

              <Text style={styles.productBody}>{product.why}</Text>

              <View style={styles.doseRow}>
                <Ionicons name="timer-outline" size={13} color="rgba(201,162,39,0.7)" />
                <Text style={styles.doseText}>{product.dose}</Text>
              </View>

              <View style={styles.linkNote}>
                <Ionicons name="link-outline" size={13} color="rgba(30,20,0,0.3)" />
                <Text style={styles.linkNoteText}>{product.link}</Text>
              </View>
            </LinearGradient>
          </View>
        ))}
      </View>

      {/* What I avoid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What I Avoid</Text>
        <View style={styles.avoidCard}>
          <LinearGradient colors={["#fffef8", "#fdf8ee"]} style={styles.avoidGrad}>
            {AVOID.map((item, i) => (
              <View key={i} style={styles.avoidRow}>
                <Ionicons name="close-circle-outline" size={16} color="rgba(232,80,80,0.8)" />
                <Text style={styles.avoidText}>{item}</Text>
              </View>
            ))}
          </LinearGradient>
        </View>
      </View>

      {/* Questions for your doctor */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Questions to Ask Your Doctor</Text>
        <Text style={styles.sectionSub}>
          Print this page or copy these questions before your next appointment.
        </Text>
        <View style={styles.questionsCard}>
          <LinearGradient colors={["#fffef8", "#fdf8ee"]} style={styles.questionsGrad}>
            {DOCTOR_QUESTIONS.map((q, i) => (
              <View key={i} style={styles.questionRow}>
                <View style={styles.questionNum}>
                  <Text style={styles.questionNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.questionText}>{q}</Text>
              </View>
            ))}
          </LinearGradient>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This guide reflects Joseph's personal experience and is provided for educational purposes only. It does not constitute medical advice and does not replace consultation with your physician, rheumatologist, or pharmacist. Always discuss supplement changes with your care team.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf8f0" },
  header: { paddingHorizontal: 24, paddingBottom: 32 },
  backBtn: { marginBottom: 20, alignSelf: "flex-start" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  badgeText: { color: "#c9a227", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  title: { color: "#1e1400", fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 10 },
  subtitle: { color: "rgba(30,20,0,0.6)", fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 23, marginBottom: 8 },
  byline: { color: "rgba(201,162,39,0.7)", fontSize: 13, fontFamily: "Inter_600SemiBold", fontStyle: "italic" },

  introCard: {
    marginHorizontal: 16, marginTop: 20, marginBottom: 4,
    padding: 20, borderRadius: 16,
    backgroundColor: "rgba(30,20,0,0.04)",
    borderWidth: 1, borderColor: "rgba(30,20,0,0.08)",
  },
  introText: { color: "rgba(30,20,0,0.65)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 23 },
  disclaimerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(30,20,0,0.08)" },
  disclaimerText: { color: "rgba(201,162,39,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },

  section: { paddingHorizontal: 16, marginTop: 28 },
  sectionTitle: { color: "#1e1400", fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 6 },
  sectionSub: { color: "rgba(30,20,0,0.5)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, marginBottom: 12 },

  productCard: { marginBottom: 14, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(201,162,39,0.2)" },
  productGrad: { padding: 18, gap: 14 },
  productTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  productIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  productMeta: { flex: 1 },
  productName: { color: "#1e1400", fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  productBrand: { color: "rgba(30,20,0,0.5)", fontSize: 12, fontFamily: "Inter_400Regular" },
  productBody: { color: "rgba(30,20,0,0.65)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 22 },
  doseRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, backgroundColor: "rgba(201,162,39,0.07)", borderWidth: 1, borderColor: "rgba(201,162,39,0.15)" },
  doseText: { color: "rgba(201,162,39,0.8)", fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 18, flex: 1 },
  linkNote: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  linkNoteText: { color: "rgba(30,20,0,0.25)", fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 17, flex: 1 },

  avoidCard: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(232,80,80,0.2)" },
  avoidGrad: { padding: 18, gap: 12 },
  avoidRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  avoidText: { color: "rgba(30,20,0,0.6)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, flex: 1 },

  questionsCard: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(30,20,0,0.1)" },
  questionsGrad: { padding: 18, gap: 14 },
  questionRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  questionNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(201,162,39,0.15)", alignItems: "center", justifyContent: "center", marginTop: 1 },
  questionNumText: { color: "#c9a227", fontSize: 12, fontFamily: "Inter_700Bold" },
  questionText: { color: "rgba(30,20,0,0.65)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, flex: 1 },

  footer: { marginHorizontal: 16, marginTop: 32, paddingTop: 20, borderTopWidth: 1, borderTopColor: "rgba(30,20,0,0.08)" },
  footerText: { color: "rgba(30,20,0,0.3)", fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 17, textAlign: "center" },
});
