import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PurchasesPackage, PurchasesError, PURCHASES_ERROR_CODE } from "react-native-purchases";
import { usePurchase, PurchaseTier } from "@/contexts/PurchaseContext";
import { useColors } from "@/hooks/useColors";

const TIER_META: Record<
  string,
  {
    id: PurchaseTier;
    name: string;
    price: string;
    priceSub: string;
    badge: string | null;
    tagline: string;
    features: string[];
    color: string;
    packageId: string;
  }
> = {
  $rc_monthly: {
    id: "essentials",
    name: "Essentials",
    price: "$9",
    priceSub: "/ month",
    badge: null,
    tagline: "Everything you need to start healing.",
    features: ["Full app access — all 3 meal plans", "Email support", "Resource library"],
    color: "#3d6b52",
    packageId: "$rc_monthly",
  },
  nourish_pro: {
    id: "pro",
    name: "Pro",
    price: "$25",
    priceSub: "/ month",
    badge: "Most Popular",
    tagline: "Coaching, community & premium tools.",
    features: [
      "Everything in Essentials",
      "Priority support",
      "Monthly group coaching & Q&A with Joseph",
      "Early access to new features",
      "Premium templates",
    ],
    color: "#b5813a",
    packageId: "nourish_pro",
  },
  nourish_founder: {
    id: "founder",
    name: "Founder Circle",
    price: "$149",
    priceSub: "/ month",
    badge: "VIP",
    tagline: "Your time with Joseph. Your results.",
    features: [
      "Everything in Pro",
      "30-min 1-on-1 call with Joseph monthly",
      "Priority everything",
      "Private feedback on your plan",
      "Beta feature access",
    ],
    color: "#7a4a8a",
    packageId: "nourish_founder",
  },
};

const ORDERED_PACKAGE_IDS = ["$rc_monthly", "nourish_pro", "nourish_founder"];

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const { packages, tier, isPurchased, purchasePackage, restorePurchases, isLoading } = usePurchase();

  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const monthlyPackages = ORDERED_PACKAGE_IDS
    .map((id) => packages.find((p) => p.identifier === id))
    .filter(Boolean) as PurchasesPackage[];

  const handlePurchase = async (pkg: PurchasesPackage) => {
    if (Platform.OS === "web") {
      Alert.alert("Purchase on Device", "Please open the Nourish app on your iPhone or iPad to purchase a plan.");
      return;
    }
    setPurchasing(pkg.identifier);
    try {
      await purchasePackage(pkg);
      Alert.alert(
        "Welcome to Nourish!",
        "Your purchase was successful. Enjoy full access.",
        [{ text: "Let's go!", onPress: () => router.replace("/(tabs)" as never) }]
      );
    } catch (e) {
      const err = e as PurchasesError;
      if (err.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return;
      }
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 60 + bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.riStudio}>RI Studio presents</Text>
        <Text style={styles.headerTitle}>Nourish</Text>
        <Text style={styles.headerSub}>Choose the plan that fits your journey.</Text>
        <Text style={styles.headerNote}>Monthly plans starting at $9 · Cancel anytime · Instant access</Text>
      </View>

      {/* Already purchased banner */}
      {isPurchased && (
        <View style={[styles.purchasedBanner, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          <Text style={[styles.purchasedTitle, { color: colors.primary }]}>
            Access Active —{" "}
            {tier === "founder" ? "Founder Circle" : tier === "pro" ? "Pro" : "Essentials"}
          </Text>
        </View>
      )}

      {/* Loading state */}
      {isLoading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading plans…</Text>
        </View>
      )}

      {/* Tier cards */}
      <View style={styles.tiersSection}>
        {(isLoading ? (Object.values(TIER_META)) : monthlyPackages.map((p) => TIER_META[p.identifier]).filter(Boolean))
          .map((meta) => {
            const pkg = packages.find((p) => p.identifier === meta.packageId);
            const isBuying = purchasing === meta.packageId;
            return (
              <View
                key={meta.packageId}
                style={[
                  styles.tierCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: meta.badge ? meta.color : colors.border,
                    borderWidth: meta.badge ? 2 : 1,
                  },
                ]}
              >
                {meta.badge && (
                  <View style={[styles.tierBadge, { backgroundColor: meta.color }]}>
                    <Text style={styles.tierBadgeText}>{meta.badge}</Text>
                  </View>
                )}
                <View style={[styles.tierColorBar, { backgroundColor: meta.color }]} />
                <View style={styles.tierBody}>
                  <Text style={[styles.tierName, { color: colors.foreground }]}>{meta.name}</Text>
                  <Text style={[styles.tierTagline, { color: colors.mutedForeground }]}>{meta.tagline}</Text>
                  <View style={styles.tierPriceRow}>
                    <Text style={[styles.tierPrice, { color: meta.color }]}>
                      {pkg?.product.priceString ?? meta.price}
                    </Text>
                    <View>
                      <Text style={[styles.tierPriceSub, { color: colors.mutedForeground }]}>{meta.priceSub}</Text>
                      <Text style={[styles.tierPriceNote, { color: colors.mutedForeground }]}>cancel anytime</Text>
                    </View>
                  </View>
                  <View style={[styles.featureList, { borderTopColor: colors.border }]}>
                    {meta.features.map((f) => (
                      <View key={f} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={18} color={meta.color} />
                        <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Founder badge preview */}
                  {meta.id === "founder" && (
                    <View style={styles.badgePreviewWrap}>
                      <Text style={[styles.badgePreviewLabel, { color: colors.mutedForeground }]}>Your exclusive home screen badge:</Text>
                      <View style={styles.badgePreviewCard}>
                        <View style={styles.badgePreviewCircle1} />
                        <View style={styles.badgePreviewCircle2} />
                        <View style={styles.badgePreviewRow}>
                          <View style={styles.badgePreviewIcon}>
                            <Ionicons name="ribbon" size={16} color="#e8c97a" />
                          </View>
                          <View style={styles.badgePreviewPill}>
                            <Text style={styles.badgePreviewPillText}>FOUNDING MEMBER</Text>
                          </View>
                        </View>
                        <Text style={styles.badgePreviewTitle}>Founder Circle</Text>
                        <Text style={styles.badgePreviewInner}>Inner Circle</Text>
                        <Text style={styles.badgePreviewSub}>Exclusive. Private. Yours.</Text>
                      </View>
                    </View>
                  )}

                  <Pressable
                    style={({ pressed }) => [
                      styles.tierBtn,
                      { backgroundColor: isBuying ? meta.color + "aa" : meta.color },
                      pressed && { opacity: 0.85 },
                      isPurchased && tier === meta.id && { backgroundColor: colors.muted },
                    ]}
                    onPress={() => pkg && handlePurchase(pkg)}
                    disabled={isBuying || isLoading || !pkg}
                  >
                    {isBuying ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Text style={[styles.tierBtnText, isPurchased && tier === meta.id && { color: colors.mutedForeground }]}>
                          {isPurchased && tier === meta.id ? "Current Plan" : `Get ${meta.name}`}
                        </Text>
                        {!(isPurchased && tier === meta.id) && <Ionicons name="arrow-forward" size={16} color="#fff" />}
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}

      </View>

      {/* Trust row */}
      <View style={styles.trustRow}>
        {[
          { icon: "shield-checkmark-outline" as const, label: "Apple IAP Secured" },
          { icon: "lock-closed-outline" as const, label: "SSL Encrypted" },
          { icon: "infinite-outline" as const, label: "Restore Anytime" },
        ].map((item) => (
          <View key={item.label} style={styles.trustItem}>
            <Ionicons name={item.icon} size={20} color={colors.mutedForeground} />
            <Text style={[styles.trustText, { color: colors.mutedForeground }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Restore purchase */}
      <Pressable
        style={({ pressed }) => [
          styles.restoreBtn,
          { borderColor: colors.border, backgroundColor: colors.card },
          pressed && { opacity: 0.8 },
        ]}
        onPress={handleRestore}
        disabled={restoring}
      >
        {restoring ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Ionicons name="refresh-circle-outline" size={18} color={colors.primary} />
        )}
        <Text style={[styles.restoreBtnText, { color: colors.primary }]}>
          {restoring ? "Restoring…" : "Already purchased? Restore Access"}
        </Text>
      </Pressable>

      {/* Support note */}
      <View style={[styles.supportNote, { backgroundColor: colors.muted }]}>
        <Ionicons name="mail-outline" size={16} color={colors.mutedForeground} />
        <Text style={[styles.supportText, { color: colors.mutedForeground }]}>
          Questions?{" "}
          <Text
            style={{ color: colors.primary, fontFamily: "Inter_500Medium" }}
            onPress={() => Linking.openURL("mailto:Support-josephy@proton.me")}
          >
            Support-josephy@proton.me
          </Text>
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 36 },
  backBtn: { paddingVertical: 12 },
  riStudio: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Inter_400Regular", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  headerTitle: { color: "#ffffff", fontSize: 44, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 10 },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 16, fontFamily: "Inter_400Regular", lineHeight: 24, marginBottom: 8 },
  headerNote: { color: "rgba(255,255,255,0.52)", fontSize: 12, fontFamily: "Inter_400Regular" },
  purchasedBanner: { flexDirection: "row", alignItems: "center", gap: 10, margin: 16, padding: 14, borderRadius: 12, borderWidth: 1 },
  purchasedTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  loadingWrap: { padding: 40, alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  tiersSection: { padding: 16, gap: 16 },
  tierCard: { borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  tierBadge: { paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start", borderBottomRightRadius: 8 },
  tierBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  tierColorBar: { height: 4 },
  tierBody: { padding: 20, gap: 12 },
  tierName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  tierTagline: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  tierPriceRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  tierPrice: { fontSize: 40, fontFamily: "Inter_700Bold", lineHeight: 46 },
  tierPriceSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  tierPriceNote: { fontSize: 12, fontFamily: "Inter_400Regular" },
  featureList: { borderTopWidth: 1, paddingTop: 12, gap: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  tierBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12 },
  tierBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  badgePreviewWrap: { gap: 8 },
  badgePreviewLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  badgePreviewCard: { backgroundColor: "#1a1428", borderRadius: 12, padding: 16, overflow: "hidden" },
  badgePreviewCircle1: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(122,74,138,0.3)", top: -20, right: -20 },
  badgePreviewCircle2: { position: "absolute", width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(232,201,122,0.1)", bottom: -10, left: -10 },
  badgePreviewRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  badgePreviewIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(232,201,122,0.2)", justifyContent: "center", alignItems: "center" },
  badgePreviewPill: { backgroundColor: "rgba(122,74,138,0.6)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgePreviewPillText: { color: "rgba(232,201,122,0.9)", fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  badgePreviewTitle: { color: "#e8c97a", fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 2 },
  badgePreviewInner: { color: "rgba(232,201,122,0.7)", fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 1 },
  badgePreviewSub: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4 },
  trustRow: { flexDirection: "row", justifyContent: "center", gap: 24, padding: 20 },
  trustItem: { alignItems: "center", gap: 4 },
  trustText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  restoreBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  restoreBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  supportNote: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, padding: 14, borderRadius: 12 },
  supportText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40, gap: 12 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  modalSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, textAlign: "center" },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalCancel: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  modalConfirm: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  modalConfirmText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
