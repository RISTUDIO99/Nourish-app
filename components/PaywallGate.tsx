import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePurchase } from "@/contexts/PurchaseContext";
import { useColors } from "@/hooks/useColors";

type Props = {
  children: React.ReactNode;
  featureName?: string;
};

export function PaywallGate({ children, featureName = "this content" }: Props) {
  const { isPurchased, goToCheckout } = usePurchase();
  const colors = useColors();

  if (isPurchased) return <>{children}</>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "18" }]}>
          <Ionicons name="lock-closed" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Purchase Required
        </Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          Access to {featureName} is included with your Nourish plan. Get full access starting at $9/mo.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
          ]}
          onPress={goToCheckout}
        >
          <Text style={styles.btnText}>Get Full Access</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </Pressable>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Already purchased? Tap "Restore" on the checkout screen.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    justifyContent: "center",
    marginBottom: 14,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  hint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
