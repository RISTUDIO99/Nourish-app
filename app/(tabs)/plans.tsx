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
import { plans } from "@/data/plans";

const PLAN_COLORS = ["#4a7c59", "#b5813a", "#2e6b8a", "#7a4a8a"];
const FREE_PLAN_ID = "meat";

export default function PlansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const { isPurchased, goToCheckout } = usePurchase();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 110 + bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 20 }]}>
        <Text style={[styles.riStudio, { color: colors.mutedForeground }]}>RI Studio</Text>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Meal Plans</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {isPurchased
            ? "All three 7-day plans — full access."
            : "One plan free. Unlock all three with full access."}
        </Text>
      </View>

      {!isPurchased && (
        <View style={[styles.trialBanner, { backgroundColor: colors.secondary + "18", borderColor: colors.secondary + "40" }]}>
          <Ionicons name="star-outline" size={16} color={colors.secondary} />
          <Text style={[styles.trialText, { color: colors.secondary }]}>
            Free preview: Grass-Fed Meat Plan · Upgrade to unlock all 3 plans
          </Text>
        </View>
      )}

      <View style={styles.planList}>
        {plans.map((plan, i) => {
          const isLocked = !isPurchased && plan.id !== FREE_PLAN_ID;
          return (
            <Pressable
              key={plan.id}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: isLocked ? colors.border : colors.border },
                isLocked && { opacity: 0.7 },
                !isLocked && pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
              ]}
              onPress={() => {
                if (isLocked) {
                  goToCheckout();
                } else {
                  router.push(`/plan/${plan.id}`);
                }
              }}
            >
              <View style={[styles.cardBar, { backgroundColor: PLAN_COLORS[i] }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBadge, { backgroundColor: PLAN_COLORS[i] + "20" }]}>
                    <Ionicons name={plan.icon as any} size={20} color={PLAN_COLORS[i]} />
                  </View>
                  {isLocked ? (
                    <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                      <Ionicons name="lock-closed" size={11} color={colors.mutedForeground} />
                      <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>Locked</Text>
                    </View>
                  ) : plan.id === FREE_PLAN_ID && !isPurchased ? (
                    <View style={[styles.badge, { backgroundColor: colors.secondary + "20" }]}>
                      <Text style={[styles.badgeText, { color: colors.secondary }]}>Free Preview</Text>
                    </View>
                  ) : plan.id === "ra" ? (
                    <View style={[styles.badge, { backgroundColor: PLAN_COLORS[i] + "20" }]}>
                      <Text style={[styles.badgeText, { color: PLAN_COLORS[i] }]}>Specialized</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{plan.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{plan.description}</Text>

                <View style={[styles.principlesBox, { backgroundColor: colors.surface || colors.muted }]}>
                  <Text style={[styles.principlesLabel, { color: colors.mutedForeground }]}>KEY PRINCIPLES</Text>
                  {plan.principles.slice(0, 3).map((p, pi) => (
                    <View key={pi} style={styles.principleRow}>
                      <View style={[styles.dot, { backgroundColor: PLAN_COLORS[i] }]} />
                      <Text style={[styles.principleText, { color: isLocked ? colors.mutedForeground : colors.foreground }]}>{p}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.cardCta,
                    { backgroundColor: isLocked ? colors.muted : PLAN_COLORS[i] },
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={() => isLocked ? goToCheckout() : router.push(`/plan/${plan.id}`)}
                >
                  {isLocked ? (
                    <>
                      <Ionicons name="lock-closed" size={15} color={colors.mutedForeground} />
                      <Text style={[styles.cardCtaText, { color: colors.mutedForeground }]}>Unlock — Get Full Access</Text>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.cardCtaText, { color: "#fff" }]}>View 7-Day Plan</Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </>
                  )}
                </Pressable>
              </View>
            </Pressable>
          );
        })}
      </View>

      {!isPurchased && (
        <Pressable
          style={({ pressed }) => [styles.upgradeBar, { backgroundColor: colors.primary }, pressed && { opacity: 0.88 }]}
          onPress={goToCheckout}
        >
          <View>
            <Text style={styles.upgradeBarTitle}>Unlock All 3 Plans</Text>
            <Text style={styles.upgradeBarSub}>Starting at $9/mo · Cancel anytime</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color="#fff" />
        </Pressable>
      )}

      <View style={styles.disclaimerBar}>
        <Text style={styles.disclaimerText}>
          If you are taking medication or have a medical condition, please consult your doctor or healthcare provider before making changes to your diet.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 8 },
  riStudio: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 4 },
  headerTitle: { fontSize: 32, fontFamily: "Inter_700Bold", marginBottom: 6 },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  trialBanner: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 10, borderWidth: 1 },
  trialText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 18 },
  planList: { padding: 16, gap: 16 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardBar: { height: 4 },
  cardBody: { padding: 20 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  iconBadge: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 8 },
  cardDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21, marginBottom: 16 },
  principlesBox: { borderRadius: 10, padding: 14, marginBottom: 16 },
  principlesLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginBottom: 10 },
  principleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 5 },
  principleText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  cardCta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 10 },
  cardCtaText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  upgradeBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 16, marginTop: 4, padding: 20, borderRadius: 16 },
  upgradeBarTitle: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 2 },
  upgradeBarSub: { color: "rgba(255,255,255,0.72)", fontSize: 13, fontFamily: "Inter_400Regular" },
  disclaimerBar: { marginHorizontal: 16, marginTop: 12, marginBottom: 24, padding: 14, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.04)" },
  disclaimerText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, textAlign: "center", opacity: 0.6 },
});
