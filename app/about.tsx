import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
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
import { usePurchase } from "@/contexts/PurchaseContext";
import { useOnboarding } from "@/app/_layout";

const JOSEPH_PHOTO = require("../assets/images/joseph-young.png");

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { goToCheckout, restorePurchases, devMode, toggleDevMode } = usePurchase();
  const { resetOnboarding } = useOnboarding();

  // Hidden 7-tap dev unlock on the NOURISH eyebrow text
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEyebrowTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 3000);
    if (tapCount.current >= 7) {
      tapCount.current = 0;
      if (tapTimer.current) clearTimeout(tapTimer.current);
      toggleDevMode().then(() => {
        Alert.alert(
          devMode ? "Dev Mode Off" : "Dev Mode On",
          devMode
            ? "Access restored to normal. Content gates are active."
            : "All content unlocked for review. Tap NOURISH 7× again to disable.",
          [{ text: "Got it" }]
        );
      });
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={["#050e08", "#0d1f12", "#071a0e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        {/* Decorative circles */}
        <View style={styles.decoBlobTR} />
        <View style={styles.decoBlobBL} />
        <View style={styles.decoBlobCenter} />

        {/* Back button */}
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.8)" />
        </Pressable>

        {/* NOURISH — large tap target for dev unlock */}
        <Pressable onPress={handleEyebrowTap} style={styles.nourrishTapArea}>
          <View style={styles.nourishRow}>
            <View style={styles.nourishAccentLine} />
            <Text style={styles.nourishWord}>NOURISH</Text>
            <View style={styles.nourishAccentLine} />
          </View>
          {devMode && (
            <View style={styles.devBadge}>
              <View style={styles.devDot} />
              <Text style={styles.devBadgeText}>DEV MODE ACTIVE</Text>
            </View>
          )}
          {devMode && (
            <Pressable
              style={({ pressed }) => [styles.devResetBtn, pressed && { opacity: 0.7 }]}
              onPress={() => {
                Alert.alert(
                  "Reset Onboarding",
                  'This will clear the "Before You Begin" acceptance and show the gate again. Continue?',
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Reset",
                      style: "destructive",
                      onPress: resetOnboarding,
                    },
                  ]
                );
              }}
            >
              <Ionicons name="refresh-outline" size={14} color="#fff" />
              <Text style={styles.devResetText}>Reset onboarding gate</Text>
            </Pressable>
          )}
        </Pressable>

        <Text style={styles.headerTitle}>About the Founder</Text>

        {/* Gold divider */}
        <View style={styles.headerDivider} />
      </LinearGradient>

      {/* Founder Card */}
      <View style={[styles.founderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>

        {/* Photo */}
        <View style={styles.photoWrap}>
          <Image
            source={JOSEPH_PHOTO}
            style={styles.photo}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(30,58,47,0.7)"]}
            style={styles.photoGradient}
          />
        </View>

        {/* Name & Title */}
        <View style={styles.nameSection}>
          <Text style={[styles.founderName, { color: colors.foreground }]}>Joseph Young</Text>
          <View style={[styles.titlePill, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
            <Ionicons name="leaf-outline" size={13} color={colors.primary} />
            <Text style={[styles.titlePillText, { color: colors.primary }]}>Founder & Creator of Nourish</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={[styles.bioSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.bioParagraph, { color: colors.foreground }]}>
            Joseph Young created Nourish to make meal planning feel more personal, supportive, and sustainable. Nourish brings together practical food planning, wellness resources, and thoughtful tools designed to help people build routines that fit their real lives.
          </Text>
          <Text style={[styles.bioParagraph, { color: colors.mutedForeground }]}>
            The app reflects Joseph's broader belief that technology should feel human, useful, and encouraging. Nourish is designed not simply as a collection of meal plans, but as an evolving wellness experience that can grow alongside its members.
          </Text>
          <Text style={[styles.bioClosing, { color: colors.primary }]}>
            Thank you for making Nourish part of your journey.
          </Text>
        </View>
      </View>

      {/* App Links */}
      <View style={[styles.linksCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.linksTitle, { color: colors.foreground }]}>App Information</Text>

        {[
          {
            icon: "shield-outline" as const,
            label: "Privacy Policy",
            onPress: () => router.push("/privacy" as never),
          },
          {
            icon: "document-text-outline" as const,
            label: "Terms of Use",
            onPress: () => Linking.openURL("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"),
          },
          {
            icon: "medical-outline" as const,
            label: "Medical Disclaimer",
            onPress: () => router.push("/disclaimer" as never),
          },
          {
            icon: "refresh-circle-outline" as const,
            label: "Restore Purchases",
            onPress: () => restorePurchases(),
          },
          {
            icon: "settings-outline" as const,
            label: "Manage Subscription",
            onPress: () => Linking.openURL("https://apps.apple.com/account/subscriptions"),
          },
          {
            icon: "mail-outline" as const,
            label: "Contact Support",
            onPress: () => Linking.openURL("mailto:Support@ristudio.app"),
          },
        ].map((item, index, arr) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [
              styles.linkRow,
              { borderBottomColor: colors.border },
              index < arr.length - 1 && styles.linkRowBorder,
              pressed && { opacity: 0.6 },
            ]}
            onPress={item.onPress}
          >
            <Ionicons name={item.icon} size={18} color={colors.primary} />
            <Text style={[styles.linkLabel, { color: colors.foreground }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      {/* Version */}
      <View style={styles.versionRow}>
        <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
          Nourish · Version 1.0 · © {new Date().getFullYear()} RI Studio LLC
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    overflow: "hidden",
  },
  decoBlobTR: {
    position: "absolute", top: -60, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: "#2d6a44", opacity: 0.18,
  },
  decoBlobBL: {
    position: "absolute", bottom: -40, left: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "#1a5c38", opacity: 0.22,
  },
  decoBlobCenter: {
    position: "absolute", top: 60, right: 40,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#a3c96e", opacity: 0.07,
  },
  backBtn: {
    paddingVertical: 12,
    paddingRight: 16,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  nourrishTapArea: {
    alignItems: "center",
    paddingVertical: 18,
    marginBottom: 4,
  },
  nourishRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  nourishAccentLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(163,201,110,0.35)",
  },
  nourishWord: {
    color: "#ffffff",
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    letterSpacing: 12,
    textTransform: "uppercase",
  },
  devBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: "rgba(163,201,110,0.15)",
    borderWidth: 1,
    borderColor: "rgba(163,201,110,0.35)",
  },
  devDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#a3c96e",
  },
  devBadgeText: {
    color: "#a3c96e",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  devResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: "rgba(220,80,80,0.25)",
    borderWidth: 1,
    borderColor: "rgba(220,80,80,0.5)",
  },
  devResetText: {
    color: "#ff9999",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  headerTitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
    textAlign: "center",
    marginBottom: 20,
  },
  headerDivider: {
    height: 1,
    backgroundColor: "rgba(163,201,110,0.25)",
    marginTop: 4,
  },
  founderCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  photoWrap: {
    width: "100%",
    height: 260,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  nameSection: {
    padding: 20,
    paddingBottom: 16,
    gap: 10,
  },
  founderName: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  titlePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  titlePillText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  bioSection: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 14,
  },
  bioParagraph: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  bioClosing: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    fontStyle: "italic",
    marginTop: 4,
  },
  linksCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  linksTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
    padding: 16,
    paddingBottom: 8,
    opacity: 0.5,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    paddingVertical: 14,
  },
  linkRowBorder: {
    borderBottomWidth: 1,
  },
  linkLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  versionRow: {
    alignItems: "center",
    padding: 24,
  },
  versionText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
