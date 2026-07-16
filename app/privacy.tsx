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

export default function PrivacyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 24 : insets.top;

  const sections = [
    {
      title: "Information We Collect",
      body: "Nourish collects only the email address you voluntarily provide when purchasing or restoring access. We do not collect names, phone numbers, location data, health records, or any other personal information.",
    },
    {
      title: "How We Use Your Information",
      body: "Your email is used solely to verify and restore your purchase access. We do not use your email for marketing without your explicit consent, and we do not sell or share your email with third parties.",
    },
    {
      title: "Data Storage",
      body: "Your purchase tier and email are stored locally on your device using AsyncStorage. No personal data is transmitted to or stored on RI Studio servers.",
    },
    {
      title: "Third-Party Services",
      body: "Payments are processed entirely through Apple's in-app purchase system. When you complete a purchase, you are subject to Apple's Media Services Terms and Conditions. Nourish does not receive or store your payment card details.",
    },
    {
      title: "Children's Privacy",
      body: "Nourish is not directed to children under 13. We do not knowingly collect personal information from children.",
    },
    {
      title: "Your Rights",
      body: "You may delete all locally stored data at any time by uninstalling the app. For any privacy-related requests or questions, contact us at Support-josephy@proton.me.",
    },
    {
      title: "Changes to This Policy",
      body: "We may update this Privacy Policy from time to time. Any changes will be reflected in an updated version within the app. Continued use of Nourish after changes constitutes your acceptance of the updated policy.",
    },
    {
      title: "Contact",
      body: "RI Studio's LLC\nSupport-josephy@proton.me",
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.riStudio, { color: colors.mutedForeground }]}>RI Studio</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Privacy Policy</Text>
        <Text style={[styles.updated, { color: colors.mutedForeground }]}>
          Last updated: June 2026
        </Text>
      </View>

      <View style={styles.body}>
        <View style={[styles.intro, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
          <Text style={[styles.introText, { color: colors.mutedForeground }]}>
            Nourish by RI Studio is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights.
          </Text>
        </View>

        {sections.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{s.title}</Text>
            <Text style={[styles.sectionBody, { color: colors.mutedForeground }]}>{s.body}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingBottom: 28 },
  backBtn: { marginBottom: 20, alignSelf: "flex-start" },
  riStudio: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  title: { fontSize: 36, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 6 },
  updated: { fontSize: 13, fontFamily: "Inter_400Regular" },
  body: { paddingHorizontal: 24, gap: 24 },
  intro: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, borderRadius: 14, borderWidth: 1 },
  introText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sectionBody: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 23 },
});
