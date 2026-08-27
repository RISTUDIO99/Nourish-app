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

export default function DisclaimerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.primary }]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Medical Disclaimer</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 + bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.alertBadge, { backgroundColor: "#b5813a15", borderColor: "#b5813a40" }]}>
          <Ionicons name="information-circle" size={20} color="#b5813a" />
          <Text style={[styles.alertText, { color: "#b5813a" }]}>
            Please read this disclaimer carefully before using Nourish.
          </Text>
        </View>

        <Section
          title="Not Medical Advice"
          colors={colors}
          body={"The content provided within the Nourish application, including meal plans, food guides, wellness recommendations, shopping lists, and nutritional information, is intended solely for general informational and educational purposes. Nothing contained in this application constitutes, or is intended to constitute, medical advice, medical diagnosis, medical treatment, or a substitute for professional medical consultation, diagnosis, or treatment.\n\nThis includes all communications with Joseph Young or RI Studio LLC, whether through email support or any other channel. These communications reflect personal experience and are provided for educational and peer-support purposes only."}
        />

        <Section
          title="Consult Your Healthcare Provider"
          colors={colors}
          body="Always seek the advice of your physician, licensed nutritionist, registered dietitian, or other qualified healthcare professional before making any changes to your diet, nutritional intake, supplementation, or wellness routine. Never disregard professional medical advice or delay seeking it because of information you have read or accessed within this application."
        />

        <Section
          title="Not a Treatment for Disease"
          colors={colors}
          body="Nourish is not designed, intended, or approved to diagnose, treat, cure, prevent, or mitigate any disease, medical condition, or health disorder, including rheumatoid arthritis, lupus, inflammatory bowel disease, cardiovascular disease, diabetes, or any other chronic or acute illness. The anti-inflammatory meal plans and wellness content in this application are based on publicly available nutritional research and are presented for lifestyle and wellness support only."
        />

        <Section
          title="Individual Results May Vary"
          colors={colors}
          body="Nutritional needs differ significantly from person to person. Factors including age, sex, body composition, existing medical conditions, medications, allergies, intolerances, and individual metabolism can all affect how dietary changes impact your health. What benefits one individual may not be appropriate or beneficial for another. RI Studio LLC makes no representation that any specific dietary approach described in this application is suitable for your individual circumstances."
        />

        <Section
          title="Medication & Treatment Interactions"
          colors={colors}
          body="Certain foods, supplements, and dietary patterns described in this application may interact with prescription medications, over-the-counter drugs, or existing medical treatments. If you are currently taking any medication or undergoing medical treatment, consult your prescribing physician or pharmacist before making dietary changes based on this application."
        />

        <Section
          title="Emergency Situations"
          colors={colors}
          body="This application is not intended for use in medical emergencies. If you are experiencing a medical emergency, call 911 or your local emergency services immediately. Do not use this application to seek guidance during a health emergency."
        />

        <Section
          title="Limitation of Liability"
          colors={colors}
          body="RI Studio LLC, its founders, officers, employees, affiliates, partners, and content contributors expressly disclaim all liability for any adverse health outcomes, injury, loss, or damage of any kind arising from or in connection with your use of, or reliance upon, any content provided in this application. Your use of this application is entirely at your own risk."
        />

        {/* Copyright Section */}
        <View style={[styles.copyrightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.copyrightHeader}>
            <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
            <Text style={[styles.copyrightTitle, { color: colors.foreground }]}>Intellectual Property & Copyright</Text>
          </View>
          <Text style={[styles.copyrightBody, { color: colors.mutedForeground }]}>
            © {new Date().getFullYear()} RI Studio LLC. All rights reserved.
          </Text>
          <Text style={[styles.copyrightBody, { color: colors.mutedForeground, marginTop: 10 }]}>
            All content within the Nourish application, including meal plans, food guides, nutritional content, wellness recommendations, written copy, design, graphics, and proprietary data, is the exclusive intellectual property of RI Studio LLC and is protected under United States and international copyright law.
          </Text>
          <Text style={[styles.copyrightBody, { color: colors.mutedForeground, marginTop: 10 }]}>
            Unauthorized reproduction, distribution, modification, public display, or commercial use of any content from this application, in whole or in part, without the express prior written consent of RI Studio LLC is strictly prohibited and may result in civil and criminal liability.
          </Text>
          <Text style={[styles.copyrightBody, { color: colors.mutedForeground, marginTop: 10 }]}>
            The "Nourish" name, "RI Studio" name and logo, and all associated trademarks, service marks, and trade dress are the property of RI Studio LLC.
          </Text>
        </View>

        <Text style={[styles.lastUpdated, { color: colors.mutedForeground }]}>
          Last updated: June 2026 · RI Studio LLC
        </Text>
      </ScrollView>
    </View>
  );
}

function Section({ title, body, colors }: { title: string; body: string; colors: any }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.sectionBody, { color: colors.mutedForeground }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 16 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", flex: 1 },
  alertBadge: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
  alertText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 20 },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 8 },
  sectionBody: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 23 },
  copyrightCard: { borderRadius: 14, borderWidth: 1.5, padding: 20, marginTop: 8, marginBottom: 24 },
  copyrightHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  copyrightTitle: { fontSize: 16, fontFamily: "Inter_700Bold", flex: 1 },
  copyrightBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },
  lastUpdated: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", opacity: 0.6 },
});
