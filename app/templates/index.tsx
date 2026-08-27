import { Ionicons } from "@expo/vector-icons";
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
import { useColors } from "@/hooks/useColors";
import { usePurchase } from "@/contexts/PurchaseContext";
import { TEMPLATE_ITEMS } from "@/data/templates";

const LOCK_ICON_MAP: Record<string, string> = {
  checklist: "list-outline",
  bundle: "cart-outline",
  protocol: "shield-checkmark-outline",
  journal: "journal-outline",
  planner: "calendar-outline",
};

export default function TemplatesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const { isPurchased, tier, goToCheckout } = usePurchase();
  const hasAccess = tier === "pro" || tier === "founder" || tier === "legacy";
  const hasTrackerAccess = tier === "essentials" || tier === "pro" || tier === "founder" || tier === "legacy";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 110 + bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 20 }]}>
        <Text style={[styles.riStudio, { color: colors.mutedForeground }]}>RI Studio</Text>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Premium Templates</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          Ready-to-use tools for your healing journey.
        </Text>
      </View>

      {!hasAccess && (
        <View style={[styles.upgradeBanner, { backgroundColor: colors.secondary + "15", borderColor: colors.secondary + "40" }]}>
          <Ionicons name="lock-closed" size={18} color={colors.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.upgradeTitle, { color: colors.foreground }]}>Pro & Founder Circle Feature</Text>
            <Text style={[styles.upgradeSub, { color: colors.mutedForeground }]}>
              Upgrade to Pro ($19.99/mo) or Founder Circle ($49.99/mo) to unlock all templates.
            </Text>
          </View>
          <Pressable
            style={[styles.upgradeBtn, { backgroundColor: colors.secondary }]}
            onPress={goToCheckout}
          >
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.grid}>
        {TEMPLATE_ITEMS.map((template) => (
          <Pressable
            key={template.id}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.card, borderColor: hasAccess ? colors.border : colors.border },
              !hasAccess && { opacity: 0.72 },
              hasAccess && pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
            ]}
            onPress={() => {
              if (!hasAccess) {
                goToCheckout();
              } else {
                router.push(`/templates/${template.id}` as never);
              }
            }}
          >
            <View style={[styles.cardBar, { backgroundColor: template.color }]} />
            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: template.color + "20" }]}>
                  <Ionicons name={LOCK_ICON_MAP[template.category] as any} size={20} color={template.color} />
                </View>
                <View style={styles.badges}>
                  {template.badge && (
                    <View style={[styles.badge, { backgroundColor: template.color + "20" }]}>
                      <Text style={[styles.badgeText, { color: template.color }]}>{template.badge}</Text>
                    </View>
                  )}
                  {!hasAccess && (
                    <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                      <Ionicons name="lock-closed" size={10} color={colors.mutedForeground} />
                      <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>Pro</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{template.title}</Text>
              <Text style={[styles.cardSub, { color: template.color }]}>{template.subtitle}</Text>
              <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{template.description}</Text>
              <View style={[styles.cardCta, { backgroundColor: hasAccess ? template.color : colors.muted }]}>
                {hasAccess ? (
                  <>
                    <Text style={[styles.cardCtaText, { color: "#fff" }]}>Open Template</Text>
                    <Ionicons name="arrow-forward" size={14} color="#fff" />
                  </>
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.cardCtaText, { color: colors.mutedForeground }]}>Upgrade to Unlock</Text>
                  </>
                )}
              </View>
            </View>
          </Pressable>
        ))}

        {/* Inflammation Tracker card — all members */}
        <Pressable
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: hasTrackerAccess ? "#1a1200" : colors.card, borderColor: hasTrackerAccess ? "rgba(201,162,39,0.35)" : colors.border },
            !hasTrackerAccess && { opacity: 0.72 },
            hasTrackerAccess && pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
          ]}
          onPress={() => {
            if (hasTrackerAccess) {
              router.push("/tracker" as never);
            } else {
              goToCheckout();
            }
          }}
        >
          <View style={[styles.cardBar, { backgroundColor: "#c9a227" }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardTop}>
              <View style={[styles.iconWrap, { backgroundColor: "rgba(201,162,39,0.15)" }]}>
                <Ionicons name="pulse" size={20} color="#c9a227" />
              </View>
              <View style={styles.badges}>
                <View style={[styles.badge, { backgroundColor: "rgba(201,162,39,0.15)" }]}>
                  <Text style={[styles.badgeText, { color: "#c9a227" }]}>LIVE</Text>
                </View>
                {!hasTrackerAccess && (
                  <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                    <Ionicons name="lock-closed" size={10} color={colors.mutedForeground} />
                    <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>Members</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={[styles.cardTitle, { color: hasTrackerAccess ? "#fff" : colors.foreground }]}>Inflammation Tracker</Text>
            <Text style={[styles.cardSub, { color: "#c9a227" }]}>Daily check-in tool</Text>
            <Text style={[styles.cardDesc, { color: hasTrackerAccess ? "rgba(255,255,255,0.45)" : colors.mutedForeground }]}>
              Log pain, mood, sleep, and flaring joints every day. Spot patterns over time and understand what's driving your inflammation.
            </Text>
            <View style={[styles.cardCta, { backgroundColor: hasTrackerAccess ? "#c9a227" : colors.muted }]}>
              {hasTrackerAccess ? (
                <>
                  <Text style={[styles.cardCtaText, { color: "#0d0b00" }]}>Open Tracker</Text>
                  <Ionicons name="arrow-forward" size={14} color="#0d0b00" />
                </>
              ) : (
                <>
                  <Ionicons name="lock-closed" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.cardCtaText, { color: colors.mutedForeground }]}>Members Only — Upgrade to Unlock</Text>
                </>
              )}
            </View>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 12 },
  riStudio: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 4 },
  headerTitle: { fontSize: 32, fontFamily: "Inter_700Bold", marginBottom: 6 },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  upgradeBanner: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginHorizontal: 16, marginBottom: 8, padding: 16, borderRadius: 14, borderWidth: 1 },
  upgradeTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  upgradeSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  upgradeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  upgradeBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  grid: { padding: 16, gap: 14 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardBar: { height: 4 },
  cardContent: { padding: 18 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  badges: { flexDirection: "row", gap: 6 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 3 },
  cardSub: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 16 },
  cardCta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderRadius: 10 },
  cardCtaText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
