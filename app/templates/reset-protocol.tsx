import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { RESET_PROTOCOL } from "@/data/templates";

const COLOR = "#2e6b8a";

export default function ResetProtocolTemplate() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const [activeDay, setActiveDay] = useState(0);

  const day = RESET_PROTOCOL[activeDay];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 80 + bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: COLOR }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerLabel}>Premium Template</Text>
        <Text style={styles.headerTitle}>3-Day Inflammation Reset</Text>
        <Text style={styles.headerSub}>A structured protocol to calm inflammation fast — during a flare or after a difficult week.</Text>
      </View>

      {/* Day selector */}
      <View style={styles.dayRow}>
        {RESET_PROTOCOL.map((d, i) => (
          <Pressable
            key={d.day}
            style={[styles.dayBtn, { borderColor: activeDay === i ? COLOR : colors.border, backgroundColor: activeDay === i ? COLOR : colors.card }]}
            onPress={() => setActiveDay(i)}
          >
            <Text style={[styles.dayBtnLabel, { color: activeDay === i ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}>Day</Text>
            <Text style={[styles.dayBtnNum, { color: activeDay === i ? "#fff" : colors.foreground }]}>{d.day}</Text>
            <Text style={[styles.dayBtnTitle, { color: activeDay === i ? "rgba(255,255,255,0.85)" : colors.mutedForeground }]} numberOfLines={1}>{d.title}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.content}>
        {/* Focus */}
        <View style={[styles.focusCard, { backgroundColor: COLOR + "12", borderColor: COLOR + "30" }]}>
          <Text style={[styles.focusLabel, { color: COLOR }]}>TODAY'S FOCUS</Text>
          <Text style={[styles.focusTitle, { color: colors.foreground }]}>{day.title}</Text>
          <Text style={[styles.focusText, { color: colors.mutedForeground }]}>{day.focus}</Text>
        </View>

        {/* Meals */}
        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Meals & Timing</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {day.meals.map((meal, i) => (
            <View
              key={meal.type}
              style={[styles.mealRow, i < day.meals.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <View style={[styles.mealTypeBadge, { backgroundColor: COLOR + "18" }]}>
                <Text style={[styles.mealType, { color: COLOR }]}>{meal.type}</Text>
              </View>
              <Text style={[styles.mealText, { color: colors.foreground }]}>{meal.meal}</Text>
            </View>
          ))}
        </View>

        {/* Supplements */}
        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Supplements</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {day.supplements.map((s, i) => (
            <View
              key={s}
              style={[styles.supRow, i < day.supplements.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <View style={[styles.supDot, { backgroundColor: COLOR }]} />
              <Text style={[styles.supText, { color: colors.foreground }]}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Tips */}
        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Daily Tips</Text>
        <View style={{ gap: 10 }}>
          {day.tips.map((tip) => (
            <View key={tip} style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="checkmark-circle" size={18} color={COLOR} />
              <Text style={[styles.tipText, { color: colors.foreground }]}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: { paddingVertical: 12 },
  headerLabel: { color: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  headerTitle: { color: "#fff", fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 8, lineHeight: 34 },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  dayRow: { flexDirection: "row", gap: 10, padding: 16 },
  dayBtn: { flex: 1, borderRadius: 12, borderWidth: 1.5, padding: 12, alignItems: "center" },
  dayBtnLabel: { fontSize: 10, fontFamily: "Inter_500Medium", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 },
  dayBtnNum: { fontSize: 24, fontFamily: "Inter_700Bold" },
  dayBtnTitle: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center", marginTop: 2 },
  content: { paddingHorizontal: 16, gap: 6 },
  focusCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 10 },
  focusLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 },
  focusTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 8 },
  focusText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  sectionHeading: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 10, marginBottom: 8 },
  card: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 4 },
  mealRow: { padding: 14, gap: 8 },
  mealTypeBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  mealType: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  mealText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  supRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  supDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  supText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  tipCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  tipText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
});
