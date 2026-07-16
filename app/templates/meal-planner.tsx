import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const COLOR = "#4a6b8a";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const STORAGE_KEY = "nourish:template:planner";

type PlannerData = Record<string, Record<string, string>>;

export default function MealPlannerTemplate() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const [activeDay, setActiveDay] = useState(0);
  const [planner, setPlanner] = useState<PlannerData>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => { if (v) setPlanner(JSON.parse(v)); });
  }, []);

  const update = async (day: string, mealType: string, value: string) => {
    const next: PlannerData = {
      ...planner,
      [day]: { ...(planner[day] ?? {}), [mealType]: value },
    };
    setPlanner(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const clearDay = (day: string) => {
    Alert.alert("Clear Day", `Clear all meals for ${day}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear", style: "destructive", onPress: async () => {
          const next = { ...planner };
          delete next[day];
          setPlanner(next);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      },
    ]);
  };

  const clearAll = () => {
    Alert.alert("Clear Entire Plan", "This will erase your whole week. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All", style: "destructive", onPress: async () => {
          setPlanner({});
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      },
    ]);
  };

  const filledCount = (day: string) =>
    MEAL_TYPES.filter((m) => planner[day]?.[m]?.trim()).length;

  const day = DAYS[activeDay];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 80 + bottomPad }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: COLOR }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerLabel}>Premium Template</Text>
        <Text style={styles.headerTitle}>7-Day Meal Planner</Text>
        <Text style={styles.headerSub}>Design your own anti-inflammatory week. Saved to your device.</Text>
      </View>

      {/* Day selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.dayScroll, { borderBottomColor: colors.border, backgroundColor: colors.card }]} contentContainerStyle={styles.dayScrollContent}>
        {DAYS.map((d, i) => {
          const count = filledCount(d);
          const isActive = activeDay === i;
          return (
            <Pressable
              key={d}
              style={[styles.dayBtn, isActive && { backgroundColor: COLOR }]}
              onPress={() => setActiveDay(i)}
            >
              <Text style={[styles.dayShort, { color: isActive ? "#fff" : colors.mutedForeground }]}>{SHORT_DAYS[i]}</Text>
              {count > 0 && (
                <View style={[styles.dayDot, { backgroundColor: isActive ? "#fff" : COLOR }]} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.content}>
        <View style={styles.dayHeaderRow}>
          <Text style={[styles.dayHeading, { color: colors.foreground }]}>{day}</Text>
          <Pressable onPress={() => clearDay(day)}>
            <Text style={[styles.clearDayText, { color: colors.mutedForeground }]}>Clear day</Text>
          </Pressable>
        </View>

        {MEAL_TYPES.map((mealType) => {
          const fieldKey = `${day}:${mealType}`;
          const isFocused = focusedField === fieldKey;
          const value = planner[day]?.[mealType] ?? "";
          return (
            <View key={mealType} style={styles.mealField}>
              <View style={styles.mealLabelRow}>
                <View style={[styles.mealIcon, { backgroundColor: isFocused ? COLOR + "20" : colors.muted }]}>
                  <Ionicons
                    name={mealType === "Breakfast" ? "sunny-outline" : mealType === "Lunch" ? "restaurant-outline" : mealType === "Dinner" ? "moon-outline" : "cafe-outline"}
                    size={16}
                    color={isFocused ? COLOR : colors.mutedForeground}
                  />
                </View>
                <Text style={[styles.mealLabel, { color: isFocused ? COLOR : colors.mutedForeground }]}>{mealType}</Text>
              </View>
              <TextInput
                style={[
                  styles.mealInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: isFocused ? COLOR : colors.border,
                    color: colors.foreground,
                  },
                  isFocused && { borderWidth: 2 },
                ]}
                placeholder={`What's for ${mealType.toLowerCase()}?`}
                placeholderTextColor={colors.mutedForeground}
                value={value}
                onChangeText={(v) => update(day, mealType, v)}
                onFocus={() => setFocusedField(fieldKey)}
                onBlur={() => setFocusedField(null)}
                multiline
                textAlignVertical="top"
              />
            </View>
          );
        })}

        {/* Week overview */}
        <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.overviewTitle, { color: colors.foreground }]}>Week Overview</Text>
          {DAYS.map((d, i) => {
            const count = filledCount(d);
            return (
              <Pressable
                key={d}
                style={[styles.overviewRow, i < DAYS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                onPress={() => setActiveDay(i)}
              >
                <Text style={[styles.overviewDay, { color: i === activeDay ? COLOR : colors.foreground }]}>{d}</Text>
                <View style={styles.overviewDots}>
                  {MEAL_TYPES.map((m) => (
                    <View
                      key={m}
                      style={[styles.overviewDot, { backgroundColor: planner[d]?.[m]?.trim() ? COLOR : colors.border }]}
                    />
                  ))}
                </View>
                <Text style={[styles.overviewCount, { color: count > 0 ? COLOR : colors.mutedForeground }]}>
                  {count}/4
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={[styles.clearAllBtn, { borderColor: colors.border }]} onPress={clearAll}>
          <Ionicons name="trash-outline" size={15} color={colors.mutedForeground} />
          <Text style={[styles.clearAllText, { color: colors.mutedForeground }]}>Clear Entire Week</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: { paddingVertical: 12 },
  headerLabel: { color: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  headerTitle: { color: "#fff", fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 8 },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  dayScroll: { borderBottomWidth: 1, maxHeight: 58 },
  dayScrollContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 6, alignItems: "center" },
  dayBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, alignItems: "center", gap: 4 },
  dayShort: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  dayDot: { width: 5, height: 5, borderRadius: 3 },
  content: { padding: 16 },
  dayHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  dayHeading: { fontSize: 22, fontFamily: "Inter_700Bold" },
  clearDayText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  mealField: { marginBottom: 14 },
  mealLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  mealIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  mealLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, textTransform: "uppercase" },
  mealInput: { borderWidth: 1.5, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21, minHeight: 64 },
  overviewCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginTop: 8, marginBottom: 12 },
  overviewTitle: { fontSize: 15, fontFamily: "Inter_700Bold", padding: 14, paddingBottom: 10 },
  overviewRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10 },
  overviewDay: { fontSize: 14, fontFamily: "Inter_500Medium", width: 90 },
  overviewDots: { flex: 1, flexDirection: "row", gap: 5 },
  overviewDot: { width: 8, height: 8, borderRadius: 4 },
  overviewCount: { fontSize: 12, fontFamily: "Inter_600SemiBold", width: 28, textAlign: "right" },
  clearAllBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 13, borderRadius: 10, borderWidth: 1 },
  clearAllText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
