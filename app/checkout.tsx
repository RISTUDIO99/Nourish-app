import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Purchases, { PurchasesPackage, PurchasesError, PURCHASES_ERROR_CODE } from "react-native-purchases";
import { usePurchase, PurchaseTier } from "@/contexts/PurchaseContext";
import { useColors } from "@/hooks/useColors";

const GEM_IMAGES = {
  emerald: require("../assets/images/gem-emerald.png"),
  sapphire: require("../assets/images/gem-sapphire.png"),
  ruby:     require("../assets/images/gem-ruby.png"),
  diamond:  require("../assets/images/gem-diamond.png"),
};

const { width } = Dimensions.get("window");
const isIPad = Platform.OS === "ios" && width >= 768;

// ─── Black Diamond seat configuration ───────────────────────────────────────
// MANUAL: increase BLACK_DIAMOND_SEATS_TAKEN by 1 each time a new member signs up.
// When seats hit 0, the Black Diamond button changes to "Join the Waitlist".
export const BLACK_DIAMOND_SEAT_LIMIT = 25;
export const BLACK_DIAMOND_SEATS_TAKEN = 0; // ← update manually after each signup
const BD_SEATS_REMAINING = BLACK_DIAMOND_SEAT_LIMIT - BLACK_DIAMOND_SEATS_TAKEN;
const BD_IS_FULL = BD_SEATS_REMAINING <= 0;

// ─── Billing period toggle ──────────────────────────────────────────────────

type BillingPeriod = "annual" | "monthly";

// ─── Tier configuration ────────────────────────────────────────────────────

type TierMeta = {
  id: PurchaseTier;
  name: string;
  fallbackPrice: string;
  priceSub: string;
  perMonthNote: string | null;
  trialNote: string | null;
  badge: string | null;
  tagline: string;
  features: string[];
  gem: keyof typeof GEM_IMAGES;
  cardBg: readonly [string, string, string];
  accentColor: string;
  goldColor: string;
  borderColor: string;
  packageId: string;
};

const ESSENTIALS_FEATURES = [
  "Personal inflammation tracker",
  "Full app access: all meal plans",
  "Food guide & shopping list",
  "Email support",
  "Resource library",
];

const PRO_FEATURES = [
  "Everything in Essentials",
  "Priority support",
  "Early access to new features",
  "Premium templates",
];

const FOUNDER_FEATURES = [
  "Everything in Pro",
  "Audio starter pack: Morning Reset + Evening Wind-Down",
  "Priority everything",
  "Email support with 48-hour response",
  "Beta feature access",
];

const ANNUAL_TIERS: TierMeta[] = [
  {
    id: "essentials",
    name: "Essentials",
    fallbackPrice: "$59.99",
    priceSub: "/ year",
    perMonthNote: "that's about $5 / month",
    trialNote: "7 days free, then",
    badge: null,
    tagline: "Everything you need to start healing.",
    features: ESSENTIALS_FEATURES,
    gem: "emerald",
    cardBg: ["#f4fbf7", "#eaf6ef", "#f4fbf7"] as const,
    accentColor: "#1a6b3c",
    goldColor: "#8a6914",
    borderColor: "rgba(26,107,60,0.2)",
    packageId: "$rc_annual",
  },
  {
    id: "pro",
    name: "Pro",
    fallbackPrice: "$119.99",
    priceSub: "/ year",
    perMonthNote: "that's about $10 / month",
    trialNote: "7 days free, then",
    badge: "Most Popular",
    tagline: "Templates, tools & momentum.",
    features: PRO_FEATURES,
    gem: "sapphire",
    cardBg: ["#f3f6ff", "#eaf0ff", "#f3f6ff"] as const,
    accentColor: "#1a3fa8",
    goldColor: "#8a6914",
    borderColor: "rgba(26,63,168,0.2)",
    packageId: "nourish_pro_annual",
  },
  {
    id: "founder",
    name: "Founder Circle",
    fallbackPrice: "$249.99",
    priceSub: "/ year",
    perMonthNote: "that's about $21 / month",
    trialNote: "7 days free, then",
    badge: "VIP",
    tagline: "The tools, the trackers, the head start.",
    features: FOUNDER_FEATURES,
    gem: "ruby",
    cardBg: ["#fff5f5", "#ffeaea", "#fff5f5"] as const,
    accentColor: "#991b1b",
    goldColor: "#8a6914",
    borderColor: "rgba(153,27,27,0.2)",
    packageId: "nourish_founder_annual",
  },
];

const MONTHLY_TIERS: TierMeta[] = [
  {
    id: "essentials",
    name: "Essentials",
    fallbackPrice: "$9.99",
    priceSub: "/ month",
    perMonthNote: null,
    trialNote: null,
    badge: null,
    tagline: "Everything you need to start healing.",
    features: ESSENTIALS_FEATURES,
    gem: "emerald",
    cardBg: ["#f4fbf7", "#eaf6ef", "#f4fbf7"] as const,
    accentColor: "#1a6b3c",
    goldColor: "#8a6914",
    borderColor: "rgba(26,107,60,0.2)",
    packageId: "$rc_monthly",
  },
  {
    id: "pro",
    name: "Pro",
    fallbackPrice: "$19.99",
    priceSub: "/ month",
    perMonthNote: null,
    trialNote: null,
    badge: "Most Popular",
    tagline: "Templates, tools & momentum.",
    features: PRO_FEATURES,
    gem: "sapphire",
    cardBg: ["#f3f6ff", "#eaf0ff", "#f3f6ff"] as const,
    accentColor: "#1a3fa8",
    goldColor: "#8a6914",
    borderColor: "rgba(26,63,168,0.2)",
    packageId: "nourish_pro",
  },
  {
    id: "founder",
    name: "Founder Circle",
    fallbackPrice: "$34.99",
    priceSub: "/ month",
    perMonthNote: null,
    trialNote: null,
    badge: "VIP",
    tagline: "The tools, the trackers, the head start.",
    features: FOUNDER_FEATURES,
    gem: "ruby",
    cardBg: ["#fff5f5", "#ffeaea", "#fff5f5"] as const,
    accentColor: "#991b1b",
    goldColor: "#8a6914",
    borderColor: "rgba(153,27,27,0.2)",
    packageId: "nourish_founder",
  },
];

// ─── Black Diamond configuration ────────────────────────────────────────────

const BLACK_DIAMOND = {
  packageId: "nourish_legacy_annual",
  tier: "legacy" as PurchaseTier,
  fallbackPrice: "$499.99",
  features: [
    "Everything in Founder Circle",
    "Full access to the Legacy Vault",
    "The Legacy Reserve (audio library)",
    "Custom supplement stack guide",
    "Weekly premium content drops",
    "Priority line: 24-hour response",
    "Monthly Wellness Blueprint (email)",
    "Web app access included",
  ],
};

const BD_GOLD = "#c9a227";
const BD_GOLD_DEEP = "#a07818";

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const {
    packages,
    tier,
    isPurchased,
    purchasePackage,
    restorePurchases,
    refreshPackages,
    isLoading,
    packagesError,
  } = usePurchase();

  const [period, setPeriod] = useState<BillingPeriod>("annual");
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [waitlistVisible, setWaitlistVisible] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");

  const tiers = period === "annual" ? ANNUAL_TIERS : MONTHLY_TIERS;

  const handlePurchase = async (pkg: PurchasesPackage | undefined, packageId: string) => {
    if (Platform.OS === "web") {
      Alert.alert("Purchase on Device", "Please open the Nourish app on your iPhone or iPad to purchase a plan.");
      return;
    }
    if (!pkg) {
      Alert.alert(
        "Plans Loading",
        "Subscription plans are still loading. Please wait a moment and try again.",
        [{ text: "OK" }]
      );
      return;
    }
    setPurchasing(packageId);
    try {
      await purchasePackage(pkg);
      Alert.alert(
        "Welcome to Nourish!",
        "Your purchase was successful. Enjoy full access.",
        [{ text: "Let's go!", onPress: () => router.replace("/(tabs)" as never) }]
      );
    } catch (e) {
      const err = e as PurchasesError;
      if (err.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return;
      Alert.alert("Purchase Failed", err.message || "Something went wrong. Please try again.");
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Restore on Device", "Please open the Nourish app on your iPhone or iPad to restore purchases.");
      return;
    }
    setRestoring(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert("Access Restored!", "Welcome back to Nourish.", [
          { text: "Let's go!", onPress: () => router.replace("/(tabs)" as never) },
        ]);
      } else {
        Alert.alert("No Purchases Found", "We couldn't find any active purchases. If you think this is wrong, contact support.");
      }
    } catch {
      Alert.alert("Restore Failed", "Please try again or contact support.");
    } finally {
      setRestoring(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    await refreshPackages();
    setRetrying(false);
  };

  const handleWaitlist = () => setWaitlistVisible(true);

  const submitWaitlist = () => {
    if (!waitlistEmail.trim()) return;
    Linking.openURL(
      `mailto:Support@ristudio.app?subject=Black Diamond Waitlist Request&body=Please add me to the Black Diamond waitlist.%0A%0AEmail: ${encodeURIComponent(waitlistEmail.trim())}`
    );
    setWaitlistVisible(false);
    setWaitlistEmail("");
    Alert.alert("You're on the list!", "Joseph will reach out when a seat opens up.");
  };

  const bdPkg = packages.find((p) => p.identifier === BLACK_DIAMOND.packageId);

  return (
    <>
    <ScrollView
      style={{ flex: 1, backgroundColor: "#080c0a" }}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 + bottomPad }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <LinearGradient
        colors={["#0d2218", "#163628", "#0d2218"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.7)" />
        </Pressable>
        <View style={styles.headerBadge}>
          <Ionicons name="leaf-outline" size={12} color="rgba(255,255,255,0.5)" />
          <Text style={styles.headerBadgeText}>Nourish Premium</Text>
        </View>
        <Text style={styles.headerTitle}>Try Nourish{"\n"}Free for 7 Days</Text>
        <Text style={styles.headerSub}>Every annual plan starts with a 7-day free trial · Cancel anytime</Text>
      </LinearGradient>

      {/* ── Already purchased banner ── */}
      {isPurchased && (
        <View style={styles.purchasedBanner}>
          <Ionicons name="checkmark-circle" size={20} color="#3db870" />
          <Text style={styles.purchasedTitle}>
            Active:{" "}
            {tier === "legacy" ? "Black Diamond" : tier === "founder" ? "Founder Circle" : tier === "pro" ? "Pro" : "Essentials"}
          </Text>
        </View>
      )}

      {/* ── Error / retry banner ── */}
      {packagesError && !isLoading && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color="#e8a020" />
          <Text style={styles.errorText}>
            Plans couldn't load. Check your connection.
          </Text>
          <Pressable style={styles.retryBtn} onPress={handleRetry} disabled={retrying}>
            {retrying
              ? <ActivityIndicator color="#e8a020" size="small" />
              : <Text style={styles.retryBtnText}>Retry</Text>
            }
          </Pressable>
        </View>
      )}

      {/* ── Loading skeleton ── */}
      {isLoading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#3db870" size="large" />
          <Text style={styles.loadingText}>Loading plans…</Text>
        </View>
      )}

      {/* ── Billing period toggle ── */}
      <View style={styles.toggleWrap}>
        <View style={styles.toggleTrack}>
          <Pressable
            style={[styles.toggleBtn, period === "annual" && styles.toggleBtnActive]}
            onPress={() => setPeriod("annual")}
          >
            <Text style={[styles.toggleText, period === "annual" && styles.toggleTextActive]}>
              Annual
            </Text>
            <View style={styles.toggleSavePill}>
              <Text style={styles.toggleSaveText}>7 DAYS FREE</Text>
            </View>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, period === "monthly" && styles.toggleBtnActive]}
            onPress={() => setPeriod("monthly")}
          >
            <Text style={[styles.toggleText, period === "monthly" && styles.toggleTextActive]}>
              Monthly
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── Tier cards ── */}
      <View style={[styles.tiersSection, isIPad && styles.tiersSectionIPad]}>
        {tiers.map((meta) => {
          const pkg = packages.find((p) => p.identifier === meta.packageId);
          return (
            <TierCard
              key={meta.packageId}
              meta={meta}
              pkg={pkg}
              isBuying={purchasing === meta.packageId}
              isCurrentPlan={isPurchased && tier === meta.id}
              isLoading={isLoading}
              onPress={() => handlePurchase(pkg, meta.packageId)}
            />
          );
        })}

        {/* ── Black Diamond showpiece ── */}
        <BlackDiamondCard
          pkg={bdPkg}
          isBuying={purchasing === BLACK_DIAMOND.packageId}
          isCurrentPlan={isPurchased && tier === "legacy"}
          isFull={BD_IS_FULL}
          isLoading={isLoading}
          onPress={() => handlePurchase(bdPkg, BLACK_DIAMOND.packageId)}
          onWaitlist={handleWaitlist}
        />
      </View>

      {/* ── Subscription disclosure (required by Apple 3.1.2c) ── */}
      <View style={styles.disclosureBox}>
        <Text style={styles.disclosureText}>
          Annual Essentials, Pro, and Founder Circle plans include a 7-day free trial; payment is charged to your Apple Account when the trial ends unless canceled at least 24 hours before. All other purchases are charged upon confirmation. Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period. Manage or cancel anytime in your Apple Account Settings.
        </Text>
      </View>

      {/* ── Trust row ── */}
      <View style={styles.trustRow}>
        {[
          { icon: "shield-checkmark-outline" as const, label: "Apple IAP Secured" },
          { icon: "lock-closed-outline" as const, label: "SSL Encrypted" },
          { icon: "infinite-outline" as const, label: "Cancel Anytime" },
        ].map((item) => (
          <View key={item.label} style={styles.trustItem}>
            <Ionicons name={item.icon} size={18} color="rgba(255,255,255,0.4)" />
            <Text style={styles.trustText}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Restore purchase ── */}
      <Pressable
        style={({ pressed }) => [styles.restoreBtn, pressed && { opacity: 0.75 }]}
        onPress={handleRestore}
        disabled={restoring}
      >
        {restoring
          ? <ActivityIndicator color="#3db870" size="small" />
          : <Ionicons name="refresh-circle-outline" size={18} color="#3db870" />
        }
        <Text style={styles.restoreBtnText}>
          {restoring ? "Restoring…" : "Already purchased? Restore Access"}
        </Text>
      </Pressable>

      {/* ── Redeem Code ── */}
      <Pressable
        style={({ pressed }) => [styles.redeemBtn, pressed && { opacity: 0.7 }]}
        onPress={() => Purchases.presentCodeRedemptionSheet()}
      >
        <Ionicons name="gift-outline" size={16} color="#c9a227" />
        <Text style={styles.redeemBtnText}>Redeem a Code</Text>
      </Pressable>

      {/* ── Legal links (required by Apple 3.1.2c) ── */}
      <View style={styles.legalRow}>
        <Pressable
          style={({ pressed }) => [styles.legalLink, pressed && { opacity: 0.6 }]}
          onPress={() => router.push("/privacy" as never)}
        >
          <Ionicons name="shield-outline" size={13} color="rgba(255,255,255,0.4)" />
          <Text style={styles.legalLinkText}>Privacy Policy</Text>
        </Pressable>
        <Text style={styles.legalDot}>·</Text>
        <Pressable
          style={({ pressed }) => [styles.legalLink, pressed && { opacity: 0.6 }]}
          onPress={() => Linking.openURL("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")}
        >
          <Ionicons name="document-text-outline" size={13} color="rgba(255,255,255,0.4)" />
          <Text style={styles.legalLinkText}>Terms of Use</Text>
        </Pressable>
        <Text style={styles.legalDot}>·</Text>
        <Pressable
          style={({ pressed }) => [styles.legalLink, pressed && { opacity: 0.6 }]}
          onPress={() => Linking.openURL("https://apps.apple.com/account/subscriptions")}
        >
          <Ionicons name="settings-outline" size={13} color="rgba(255,255,255,0.4)" />
          <Text style={styles.legalLinkText}>Manage</Text>
        </Pressable>
      </View>

      {/* ── Support note ── */}
      <View style={styles.supportNote}>
        <Ionicons name="mail-outline" size={14} color="rgba(255,255,255,0.3)" />
        <Text style={styles.supportText}>
          Questions?{" "}
          <Text
            style={styles.supportLink}
            onPress={() => Linking.openURL("mailto:Support@ristudio.app")}
          >
            Support@ristudio.app
          </Text>
          {" "}· We respond within 24–48 hours.
        </Text>
      </View>
    </ScrollView>

    {/* ── Waitlist Modal ── */}
    <Modal visible={waitlistVisible} transparent animationType="fade">
      <View style={wStyles.overlay}>
        <View style={wStyles.card}>
          <View style={wStyles.iconRow}>
            <Ionicons name="mail-outline" size={32} color="#c9a227" />
          </View>
          <Text style={wStyles.title}>Join the Black Diamond Waitlist</Text>
          <Text style={wStyles.body}>
            Black Diamond founding seats are currently full. Leave your email and Joseph will reach out personally when a seat opens.
          </Text>
          <TextInput
            style={wStyles.input}
            placeholder="your@email.com"
            placeholderTextColor="rgba(0,0,0,0.35)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={waitlistEmail}
            onChangeText={setWaitlistEmail}
          />
          <Pressable
            style={[wStyles.submitBtn, !waitlistEmail.trim() && { opacity: 0.4 }]}
            onPress={submitWaitlist}
            disabled={!waitlistEmail.trim()}
          >
            <Text style={wStyles.submitText}>Send Waitlist Request</Text>
          </Pressable>
          <Pressable
            onPress={() => { setWaitlistVisible(false); setWaitlistEmail(""); }}
            style={wStyles.cancel}
          >
            <Text style={wStyles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
    </>
  );
}

// ─── Tier Card Component ───────────────────────────────────────────────────

type TierCardProps = {
  meta: TierMeta;
  pkg: PurchasesPackage | undefined;
  isBuying: boolean;
  isCurrentPlan: boolean;
  isLoading: boolean;
  onPress: () => void;
};

function TierCard({ meta, pkg, isBuying, isCurrentPlan, isLoading, onPress }: TierCardProps) {
  const displayPrice = pkg?.product.priceString ?? meta.fallbackPrice;
  const goldColor = meta.goldColor;

  return (
    <View style={[styles.tierCard, { borderColor: meta.borderColor }]}>
      <LinearGradient
        colors={meta.cardBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tierGrad}
      >
        {/* ── Gem stone banner ── */}
        <View style={styles.gemBanner}>
          <View style={[styles.gemBannerLine, { backgroundColor: goldColor + "40" }]} />
          <Image
            source={GEM_IMAGES[meta.gem]}
            style={styles.gemImage}
            resizeMode="contain"
          />
          <View style={[styles.gemBannerLine, { backgroundColor: goldColor + "40" }]} />
        </View>

        {/* ── Gold ornament divider ── */}
        <View style={styles.ornamentRow}>
          <View style={[styles.ornamentLine, { backgroundColor: goldColor + "30" }]} />
          <Text style={[styles.ornamentDiamond, { color: goldColor }]}>◆</Text>
          <View style={[styles.ornamentLine, { backgroundColor: goldColor + "30" }]} />
        </View>

        {/* ── Card header ── */}
        <View style={styles.tierHeader}>
          <View style={styles.tierHeaderLeft}>
            {meta.badge && (
              <View style={[styles.tierBadge, { borderColor: goldColor + "70", backgroundColor: goldColor + "15" }]}>
                <Text style={[styles.tierBadgeText, { color: goldColor }]}>{meta.badge}</Text>
              </View>
            )}
            <Text style={[styles.tierName, { color: goldColor }]}>{meta.name}</Text>
            <Text style={[styles.tierTagline, { color: meta.accentColor }]}>{meta.tagline}</Text>
          </View>
        </View>

        {/* ── Trial ribbon ── */}
        {meta.trialNote && (
          <View style={[styles.trialPill, { borderColor: goldColor + "50", backgroundColor: goldColor + "12" }]}>
            <Ionicons name="sparkles" size={12} color={goldColor} />
            <Text style={[styles.trialPillText, { color: goldColor }]}>7-DAY FREE TRIAL INCLUDED</Text>
          </View>
        )}

        {/* ── Price ── */}
        <View style={[styles.priceRow, { borderTopColor: goldColor + "25", borderBottomColor: goldColor + "25" }]}>
          <Text style={[styles.priceAmount, { color: goldColor }]}>
            {displayPrice}
          </Text>
          <View>
            <Text style={[styles.pricePer, { color: meta.accentColor + "aa" }]}>{meta.priceSub}</Text>
            <Text style={[styles.priceNote, { color: meta.accentColor + "66" }]}>
              {meta.perMonthNote ?? "cancel anytime"}
            </Text>
          </View>
        </View>

        {/* ── Features ── */}
        <View style={styles.featureList}>
          {meta.features.map((f) => (
            <View key={f} style={styles.featureRow}>
              <View style={[styles.featureCheck, { backgroundColor: goldColor + "18", borderColor: goldColor + "45" }]}>
                <Ionicons name="checkmark" size={11} color={goldColor} />
              </View>
              <Text style={[styles.featureText, { color: meta.accentColor }]}>{f}</Text>
            </View>
          ))}
        </View>

        {/* ── CTA button ── */}
        <Pressable
          style={({ pressed }) => [
            styles.tierBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
          onPress={onPress}
          disabled={isBuying || isCurrentPlan}
        >
          <LinearGradient
            colors={isCurrentPlan
              ? [meta.accentColor + "22", meta.accentColor + "18"]
              : ["#c9a227", "#a07818"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tierBtnGrad}
          >
            {isBuying ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : isLoading && !pkg ? (
              <>
                <ActivityIndicator color="rgba(255,255,255,0.7)" size="small" />
                <Text style={[styles.tierBtnText, { color: "rgba(255,255,255,0.7)" }]}>Loading plans…</Text>
              </>
            ) : isCurrentPlan ? (
              <>
                <Ionicons name="checkmark-circle" size={18} color={meta.accentColor} />
                <Text style={[styles.tierBtnText, { color: meta.accentColor }]}>Current Plan</Text>
              </>
            ) : (
              <>
                <Text style={[styles.tierBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                  {meta.trialNote ? "Start 7 Days Free" : `Get ${meta.name}`}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </>
            )}
          </LinearGradient>
        </Pressable>

        {meta.trialNote && (
          <Text style={[styles.tierSubNote, { color: meta.accentColor + "88" }]}>
            Free for 7 days, then {displayPrice}{meta.priceSub} · Cancel anytime
          </Text>
        )}
      </LinearGradient>
    </View>
  );
}

// ─── Black Diamond Showpiece Card ───────────────────────────────────────────

type BlackDiamondCardProps = {
  pkg: PurchasesPackage | undefined;
  isBuying: boolean;
  isCurrentPlan: boolean;
  isFull: boolean;
  isLoading: boolean;
  onPress: () => void;
  onWaitlist: () => void;
};

function BlackDiamondCard({ pkg, isBuying, isCurrentPlan, isFull, isLoading, onPress, onWaitlist }: BlackDiamondCardProps) {
  const displayPrice = pkg?.product.priceString ?? BLACK_DIAMOND.fallbackPrice;

  return (
    <View style={bd.card}>
      {/* Eggshell / cream outer shell */}
      <LinearGradient
        colors={["#faf7ef", "#f4efe2", "#faf7ef"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={bd.shell}
      >
        {/* Top badge */}
        <View style={bd.crownRow}>
          <View style={bd.crownLine} />
          <View style={bd.crownBadge}>
            <Text style={bd.crownBadgeText}>BLACK DIAMOND</Text>
          </View>
          <View style={bd.crownLine} />
        </View>
        <Text style={bd.crownSub}>THE FOUNDING TWENTY-FIVE</Text>

        {/* Soft-black jewelry panel with the diamond */}
        <LinearGradient
          colors={["#1a1814", "#0e0d0b", "#1a1814"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={bd.jewelPanel}
        >
          <View style={bd.jewelGlow} />
          <Image
            source={GEM_IMAGES.diamond}
            style={bd.diamondImage}
            resizeMode="contain"
          />
          <View style={bd.jewelOrnament}>
            <View style={bd.jewelOrnamentLine} />
            <Text style={bd.jewelOrnamentDiamond}>◆</Text>
            <View style={bd.jewelOrnamentLine} />
          </View>
          <Text style={bd.jewelTagline}>YOUR LEGACY. YOUR WELLNESS.</Text>
        </LinearGradient>

        {/* Price block */}
        <View style={bd.priceBlock}>
          <View style={bd.priceMainRow}>
            <Text style={bd.priceAmount}>{displayPrice}</Text>
            <Text style={bd.pricePer}>/ year</Text>
          </View>
          <Text style={bd.priceEquiv}>about $42 a month — billed once a year</Text>
          <View style={bd.noTrialPill}>
            <Ionicons name="flash" size={11} color={BD_GOLD} />
            <Text style={bd.noTrialText}>DIRECT ACCESS · NO TRIAL · FOUNDING RATE</Text>
          </View>
        </View>

        {/* Founding note */}
        <Text style={bd.foundingNote}>
          ✦ Founding member rate — honored for as long as your membership stays active ✦
        </Text>

        {/* Seats */}
        {!isFull && (
          <View style={bd.seatsRow}>
            <Ionicons name="people-outline" size={13} color={BD_GOLD_DEEP} />
            <Text style={bd.seatsText}>Limited to {BLACK_DIAMOND_SEAT_LIMIT} founding seats</Text>
          </View>
        )}

        {/* Features */}
        <View style={bd.featureList}>
          {BLACK_DIAMOND.features.map((f) => (
            <View key={f} style={bd.featureRow}>
              <View style={bd.featureCheck}>
                <Ionicons name="diamond-outline" size={10} color={BD_GOLD_DEEP} />
              </View>
              <Text style={bd.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Vault panel */}
        <View style={bd.vaultPanel}>
          <View style={bd.vaultPanelHeader}>
            <Ionicons name="diamond" size={14} color={BD_GOLD_DEEP} />
            <Text style={bd.vaultPanelTitle}>LEGACY VAULT INCLUDED</Text>
          </View>
          <Text style={bd.vaultPanelSub}>
            Unlock exclusive member content, resources, and tools curated just for you.
          </Text>
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [bd.btn, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
          onPress={isFull ? onWaitlist : onPress}
          disabled={isBuying || isCurrentPlan}
        >
          <LinearGradient
            colors={isCurrentPlan ? ["#e8e2d2", "#ddd5c0"] : ["#23201a", "#0d0c0a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={bd.btnGrad}
          >
            {isBuying ? (
              <ActivityIndicator color={BD_GOLD} size="small" />
            ) : isLoading && !pkg ? (
              <>
                <ActivityIndicator color={BD_GOLD} size="small" />
                <Text style={[bd.btnText, { opacity: 0.7 }]}>Loading…</Text>
              </>
            ) : isCurrentPlan ? (
              <>
                <Ionicons name="checkmark-circle" size={18} color={BD_GOLD_DEEP} />
                <Text style={[bd.btnText, { color: BD_GOLD_DEEP }]}>Current Plan</Text>
              </>
            ) : isFull ? (
              <>
                <Ionicons name="mail-outline" size={16} color={BD_GOLD} />
                <Text style={bd.btnText}>Join the Waitlist</Text>
              </>
            ) : (
              <>
                <Ionicons name="diamond" size={15} color={BD_GOLD} />
                <Text style={bd.btnText}>Claim Your Founding Seat</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        <Text style={bd.subNote}>✦ Billed annually · Cancel anytime ✦</Text>
      </LinearGradient>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backBtn: {
    paddingVertical: 12,
    alignSelf: "flex-start",
    marginLeft: -4,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  headerBadgeText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 42,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    lineHeight: 48,
    marginBottom: 10,
  },
  headerSub: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  purchasedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 16,
    marginBottom: 4,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(61,184,112,0.1)",
    borderWidth: 1,
    borderColor: "rgba(61,184,112,0.3)",
  },
  purchasedTitle: {
    color: "#3db870",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 16,
    marginBottom: 4,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(232,160,32,0.1)",
    borderWidth: 1,
    borderColor: "rgba(232,160,32,0.3)",
  },
  errorText: {
    flex: 1,
    color: "#e8a020",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(232,160,32,0.2)",
  },
  retryBtnText: {
    color: "#e8a020",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  loadingWrap: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },

  // ── Billing toggle ────────────────
  toggleWrap: {
    paddingHorizontal: 16,
    paddingTop: 20,
    alignItems: "center",
  },
  toggleTrack: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 100,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.25)",
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  toggleBtnActive: {
    backgroundColor: "#c9a227",
  },
  toggleText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  toggleTextActive: {
    color: "#141210",
  },
  toggleSavePill: {
    backgroundColor: "rgba(20,18,16,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  toggleSaveText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },

  tiersSection: {
    padding: 16,
    gap: 16,
  },
  tiersSectionIPad: {
    maxWidth: 680,
    alignSelf: "center",
    width: "100%",
  },

  // ── Card ──────────────────────────
  tierCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1.5,
    shadowColor: "#c9a227",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  tierGrad: {
    padding: 22,
    overflow: "hidden",
    gap: 14,
  },

  // ── Gem banner ──────────────────
  gemBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 8,
  },
  gemBannerLine: {
    flex: 1,
    height: 1,
  },
  gemImage: {
    width: isIPad ? 120 : 100,
    height: isIPad ? 120 : 100,
  },

  // ── Ornament divider ──────────────
  ornamentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: -4,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
  },
  ornamentDiamond: {
    fontSize: 10,
  },

  // ── Header row ──────────────────
  tierHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  tierHeaderLeft: {
    flex: 1,
    gap: 6,
  },
  tierBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  tierBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  tierName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  tierTagline: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
    lineHeight: 18,
  },

  // ── Trial pill ───────────────────
  trialPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  trialPillText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
  },

  // ── Price row ───────────────────
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  priceAmount: {
    fontSize: 44,
    fontFamily: "Inter_700Bold",
    lineHeight: 48,
    letterSpacing: -1,
  },
  pricePer: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  priceNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },

  // ── Feature list ────────────────
  featureList: {
    gap: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  featureCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  featureText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    flex: 1,
  },

  // ── CTA button ──────────────────
  tierBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
  },
  tierBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  tierBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  tierSubNote: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.3,
    marginTop: -6,
  },

  // ── Disclosure & footer ─────────
  disclosureBox: {
    marginHorizontal: 16,
    marginTop: 4,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  disclosureText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
    textAlign: "center",
  },
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    padding: 20,
  },
  trustItem: {
    alignItems: "center",
    gap: 5,
  },
  trustText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  redeemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.35)",
    backgroundColor: "rgba(201,162,39,0.08)",
  },
  redeemBtnText: {
    color: "#c9a227",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  restoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(61,184,112,0.25)",
    backgroundColor: "rgba(61,184,112,0.06)",
  },
  restoreBtnText: {
    color: "#3db870",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  legalLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legalLinkText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "underline",
  },
  legalDot: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 12,
  },
  supportNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  supportText: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  supportLink: {
    color: "rgba(255,255,255,0.4)",
    textDecorationLine: "underline",
  },
});

// ─── Black Diamond styles ────────────────────────────────────────────────────

const bd = StyleSheet.create({
  card: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(201,162,39,0.55)",
    shadowColor: "#c9a227",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  shell: {
    padding: 22,
    gap: 14,
  },
  crownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  crownLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(160,120,24,0.4)",
  },
  crownBadge: {
    borderWidth: 1,
    borderColor: "rgba(160,120,24,0.6)",
    backgroundColor: "rgba(20,18,16,0.92)",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 100,
  },
  crownBadgeText: {
    color: BD_GOLD,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
  },
  crownSub: {
    textAlign: "center",
    color: BD_GOLD_DEEP,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2.5,
    marginTop: -6,
  },
  jewelPanel: {
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.35)",
    overflow: "hidden",
  },
  jewelGlow: {
    position: "absolute",
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(201,162,39,0.09)",
  },
  diamondImage: {
    width: isIPad ? 150 : 130,
    height: isIPad ? 150 : 130,
  },
  jewelOrnament: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
    marginTop: 8,
  },
  jewelOrnamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201,162,39,0.3)",
  },
  jewelOrnamentDiamond: {
    color: BD_GOLD,
    fontSize: 10,
  },
  jewelTagline: {
    color: BD_GOLD,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.4,
    marginTop: 10,
    textAlign: "center",
  },
  priceBlock: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "rgba(160,120,24,0.25)",
    borderBottomColor: "rgba(160,120,24,0.25)",
  },
  priceMainRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  priceAmount: {
    color: "#1c1a15",
    fontSize: 46,
    fontFamily: "Inter_700Bold",
    lineHeight: 50,
    letterSpacing: -1,
  },
  pricePer: {
    color: "rgba(28,26,21,0.55)",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
  },
  priceEquiv: {
    color: BD_GOLD_DEEP,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  noTrialPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(160,120,24,0.4)",
    backgroundColor: "rgba(20,18,16,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginTop: 2,
  },
  noTrialText: {
    color: BD_GOLD,
    fontSize: 9.5,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.4,
  },
  foundingNote: {
    color: BD_GOLD_DEEP,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
    textAlign: "center",
  },
  seatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(160,120,24,0.35)",
    backgroundColor: "rgba(160,120,24,0.06)",
  },
  seatsText: {
    color: BD_GOLD_DEEP,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  featureList: {
    gap: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  featureCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(160,120,24,0.45)",
    backgroundColor: "rgba(160,120,24,0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  featureText: {
    color: "#3a3428",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    flex: 1,
  },
  vaultPanel: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(160,120,24,0.4)",
    backgroundColor: "rgba(160,120,24,0.07)",
    padding: 14,
    gap: 6,
  },
  vaultPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vaultPanelTitle: {
    color: BD_GOLD_DEEP,
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  vaultPanelSub: {
    color: "rgba(58,52,40,0.75)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  btn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.5)",
  },
  btnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 17,
  },
  btnText: {
    color: BD_GOLD,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.4,
  },
  subNote: {
    color: "rgba(160,120,24,0.75)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.5,
    marginTop: -6,
  },
});

// ─── Waitlist modal styles ──────────────────────────────────────────────────
const wStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "center", alignItems: "center", padding: 24 },
  card: { backgroundColor: "#ffffff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 400 },
  iconRow: { alignItems: "center", marginBottom: 14 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1e3a2f", textAlign: "center", marginBottom: 10 },
  body: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#555", lineHeight: 20, textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontFamily: "Inter_400Regular", color: "#222",
    marginBottom: 14,
  },
  submitBtn: { backgroundColor: "#c9a227", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginBottom: 10 },
  submitText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  cancel: { alignItems: "center", paddingVertical: 8 },
  cancelText: { color: "#888", fontSize: 14, fontFamily: "Inter_400Regular" },
});
