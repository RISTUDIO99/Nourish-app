import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { MEAL_PREP_STEPS } from "@/data/templates";

const COLOR = "#3d6b52";
const SECTIONS = [...new Set(MEAL_PREP_STEPS.map((s) => s.section))];
const STORAGE_KEY = "nourish:template:mealprep:checked";

export default function MealPrepTemplate() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => { if (v) setChecked(JSON.parse(v)); });
  }, []);

  const toggle = async (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const reset = async () => {
    setChecked({});
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const total = MEAL_PREP_STEPS.length;
  const done = Object.values(checked).filter(Boolean).length;
  const progress = done / total;

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
        <Text style={styles.headerTitle}>Weekly Meal Prep{"\n"}Checklist</Text>
        <Text style={styles.headerSub}>Sunday prep system for a full week of anti-inflammatory meals.</Text>
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{done}/{total} complete</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.tipCard}>
          <Ionicons name="time-outline" size={16} color={COLOR} />
          <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
            <Text style={{ color: COLOR, fontFamily: "Inter_600SemiBold" }}>Total time: ~2.5–3 hours.</Text>
            {" "}Put on a playlist, batch everything at once, and your whole week is handled.
          </Text>
        </View>

        {SECTIONS.map((section) => {
          const steps = MEAL_PREP_STEPS.filter((s) => s.section === section);
          const sectionDone = steps.filter((s) => checked[s.id]).length;
          return (
            <View key={section} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section}</Text>
                <Text style={[styles.sectionCount, { color: COLOR }]}>{sectionDone}/{steps.length}</Text>
              </View>
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {steps.map((step, i) => {
                  const isDone = !!checked[step.id];
                  return (
                    <Pressable
                      key={step.id}
                      style={[
                        styles.stepRow,
                        i < steps.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                        isDone && { backgroundColor: COLOR + "07" },
                      ]}
                      onPress={() => toggle(step.id)}
                    >
                      <View style={[styles.checkCircle, {
                        borderColor: isDone ? COLOR : colors.border,
                        backgroundColor: isDone ? COLOR : "transparent",
                      }]}>
                        {isDone && <Ionicons name="checkmark" size={12} color="#fff" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.stepTask, { color: isDone ? colors.mutedForeground : colors.foreground }, isDone && { textDecorationLine: "line-through" }]}>
                          {step.task}
                        </Text>
                        {step.duration && (
                          <View style={styles.durationRow}>
                            <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
                            <Text style={[styles.durationText, { color: colors.mutedForeground }]}>{step.duration}</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        <Pressable
          style={[styles.resetBtn, { borderColor: colors.border }]}
          onPress={reset}
        >
          <Ionicons name="refresh-outline" size={16} color={colors.mutedForeground} />
          <Text style={[styles.resetText, { color: colors.mutedForeground }]}>Reset All</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: { paddingVertical: 12 },
  headerLabel: { color: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  headerTitle: { color: "#fff", fontSize: 30, fontFamily: "Inter_700Bold", marginBottom: 8, lineHeight: 36 },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 16 },
  progressRow: { gap: 6 },
  progressBar: { height: 5, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#ffffff", borderRadius: 3 },
  progressText: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  content: { padding: 16, gap: 4 },
  tipCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, backgroundColor: "#3d6b5214", marginBottom: 12 },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sectionCount: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
  stepTask: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21, marginBottom: 4 },
  durationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  durationText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  resetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 13, borderRadius: 10, borderWidth: 1, marginTop: 8 },
  resetText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
