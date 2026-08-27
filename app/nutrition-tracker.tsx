import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchase } from "@/contexts/PurchaseContext";
import { api as API_ENDPOINTS } from "@/constants/api";

const CREAM = "#fdf8f0";
const GOLD = "#c9a227";
const DARK = "#1e1400";
const MUTED = "rgba(30,20,0,0.5)";
const BORDER = "rgba(201,162,39,0.25)";
const CARD = "#fffef8";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";
const MEAL_TYPES: { key: MealType; label: string; icon: string }[] = [
  { key: "breakfast", label: "Breakfast", icon: "sunny-outline" },
  { key: "lunch", label: "Lunch", icon: "partly-sunny-outline" },
  { key: "dinner", label: "Dinner", icon: "moon-outline" },
  { key: "snack", label: "Snack", icon: "nutrition-outline" },
];

type LogEntry = {
  id: number;
  date: string;
  mealType: MealType;
  foodName: string;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  notes: string | null;
};

type Totals = { calories: number; proteinG: number; carbsG: number; fatG: number };

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function displayDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));
  if (iso === today) return "Today";
  if (iso === yesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NutritionTrackerScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { token } = useAuth();
  const { tier, goToCheckout } = usePurchase();

  const hasTracker = tier === "pro" || tier === "founder" || tier === "legacy";

  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [totals, setTotals] = useState<Totals>({ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add entry modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealType>("breakfast");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [entryNotes, setEntryNotes] = useState("");
  const [addingSaving, setAddingSaving] = useState(false);

  const fetchLog = useCallback(async () => {
    if (!token || !hasTracker) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_ENDPOINTS.nutritionLog}?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEntries(data.entries ?? []);
      setTotals(data.totals ?? { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, hasTracker, selectedDate]);

  useEffect(() => { setLoading(true); fetchLog(); }, [selectedDate, fetchLog]);

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    const next = formatDate(d);
    if (next <= formatDate(new Date())) setSelectedDate(next);
  };

  const openAddModal = (meal: MealType) => {
    setSelectedMeal(meal);
    setFoodName(""); setCalories(""); setProtein(""); setCarbs(""); setFat(""); setEntryNotes("");
    setModalVisible(true);
  };

  const saveEntry = async () => {
    if (!foodName.trim()) { Alert.alert("Required", "Please enter a food name."); return; }
    if (!token) return;
    setAddingSaving(true);
    try {
      const res = await fetch(API_ENDPOINTS.nutritionLog, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          mealType: selectedMeal,
          foodName: foodName.trim(),
          calories: calories ? parseInt(calories) : undefined,
          proteinG: protein ? parseFloat(protein) : undefined,
          carbsG: carbs ? parseFloat(carbs) : undefined,
          fatG: fat ? parseFloat(fat) : undefined,
          notes: entryNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.entry) {
        setEntries(prev => [...prev, data.entry]);
        setTotals(prev => ({
          calories: prev.calories + (data.entry.calories ?? 0),
          proteinG: prev.proteinG + (data.entry.proteinG ?? 0),
          carbsG: prev.carbsG + (data.entry.carbsG ?? 0),
          fatG: prev.fatG + (data.entry.fatG ?? 0),
        }));
      }
      setModalVisible(false);
    } catch {
      Alert.alert("Error", "Could not save entry.");
    } finally {
      setAddingSaving(false);
    }
  };

  const deleteEntry = (id: number, name: string) => {
    Alert.alert("Remove Entry", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive", onPress: async () => {
          const entry = entries.find(e => e.id === id);
          await fetch(`${API_ENDPOINTS.nutritionLog}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          setEntries(prev => prev.filter(e => e.id !== id));
          if (entry) {
            setTotals(prev => ({
              calories: prev.calories - (entry.calories ?? 0),
              proteinG: prev.proteinG - (entry.proteinG ?? 0),
              carbsG: prev.carbsG - (entry.carbsG ?? 0),
              fatG: prev.fatG - (entry.fatG ?? 0),
            }));
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={MUTED} />
        </Pressable>
        <Text style={styles.headerTitle}>Nutrition Tracker</Text>
      </View>
      <View style={styles.divider} />

      {!hasTracker ? (
        <View style={styles.gate}>
          <Ionicons name="bar-chart-outline" size={48} color={GOLD} />
          <Text style={styles.gateTitle}>Founder Feature</Text>
          <Text style={styles.gateSub}>Upgrade to Founder Circle or Legacy to track your daily nutrition.</Text>
          <Pressable style={styles.gateBtn} onPress={goToCheckout}>
            <Text style={styles.gateBtnText}>Upgrade Now</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLog(); }} tintColor={GOLD} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Date Nav */}
          <View style={styles.dateNav}>
            <Pressable onPress={() => shiftDate(-1)} style={styles.dateArrow}>
              <Ionicons name="chevron-back" size={20} color={GOLD} />
            </Pressable>
            <Text style={styles.dateLabel}>{displayDate(selectedDate)}</Text>
            <Pressable
              onPress={() => shiftDate(1)}
              style={[styles.dateArrow, selectedDate >= formatDate(new Date()) && { opacity: 0.3 }]}
              disabled={selectedDate >= formatDate(new Date())}
            >
              <Ionicons name="chevron-forward" size={20} color={GOLD} />
            </Pressable>
          </View>

          {/* Daily Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Daily Summary</Text>
            <View style={styles.macroRow}>
              {[
                { label: "Calories", value: Math.round(totals.calories), unit: "kcal", color: "#e05252" },
                { label: "Protein", value: Math.round(totals.proteinG), unit: "g", color: "#4caf82" },
                { label: "Carbs", value: Math.round(totals.carbsG), unit: "g", color: GOLD },
                { label: "Fat", value: Math.round(totals.fatG), unit: "g", color: "#6b9fd4" },
              ].map(m => (
                <View key={m.label} style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: m.color }]}>{m.value}</Text>
                  <Text style={styles.macroUnit}>{m.unit}</Text>
                  <Text style={styles.macroLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Meal Sections */}
          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator color={GOLD} />
            </View>
          ) : (
            <View style={{ paddingHorizontal: 16, gap: 12 }}>
              {MEAL_TYPES.map(meal => {
                const mealEntries = entries.filter(e => e.mealType === meal.key);
                return (
                  <View key={meal.key} style={styles.mealSection}>
                    <View style={styles.mealHeader}>
                      <View style={styles.mealIconWrap}>
                        <Ionicons name={meal.icon as any} size={15} color={GOLD} />
                      </View>
                      <Text style={styles.mealTitle}>{meal.label}</Text>
                      <Pressable style={styles.mealAddBtn} onPress={() => openAddModal(meal.key)}>
                        <Ionicons name="add" size={16} color={GOLD} />
                      </Pressable>
                    </View>
                    {mealEntries.length === 0 ? (
                      <Pressable style={styles.mealEmpty} onPress={() => openAddModal(meal.key)}>
                        <Text style={styles.mealEmptyText}>+ Log {meal.label.toLowerCase()}</Text>
                      </Pressable>
                    ) : (
                      mealEntries.map(entry => (
                        <View key={entry.id} style={styles.entryRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.entryName}>{entry.foodName}</Text>
                            <Text style={styles.entryMacros}>
                              {[
                                entry.calories != null ? `${entry.calories} kcal` : null,
                                entry.proteinG != null ? `${entry.proteinG}g protein` : null,
                                entry.carbsG != null ? `${entry.carbsG}g carbs` : null,
                                entry.fatG != null ? `${entry.fatG}g fat` : null,
                              ].filter(Boolean).join(" · ") || "No macros logged"}
                            </Text>
                            {entry.notes ? <Text style={styles.entryNotes}>{entry.notes}</Text> : null}
                          </View>
                          <Pressable onPress={() => deleteEntry(entry.id, entry.foodName)} hitSlop={8}>
                            <Ionicons name="trash-outline" size={15} color="rgba(30,20,0,0.25)" />
                          </Pressable>
                        </View>
                      ))
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Add Entry Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Log {MEAL_TYPES.find(m => m.key === selectedMeal)?.label}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={MUTED} />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Meal</Text>
            <View style={styles.mealPicker}>
              {MEAL_TYPES.map(m => (
                <Pressable
                  key={m.key}
                  style={[styles.mealPickerBtn, selectedMeal === m.key && styles.mealPickerBtnActive]}
                  onPress={() => setSelectedMeal(m.key)}
                >
                  <Text style={[styles.mealPickerText, selectedMeal === m.key && styles.mealPickerTextActive]}>
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalLabel}>Food Name *</Text>
            <TextInput
              style={styles.modalInput}
              value={foodName}
              onChangeText={setFoodName}
              placeholder="e.g. Grilled Salmon"
              placeholderTextColor="rgba(30,20,0,0.3)"
            />

            <Text style={styles.modalLabel}>Macros (optional)</Text>
            <View style={styles.macroInputRow}>
              {[
                { label: "Cal", value: calories, set: setCalories },
                { label: "Protein (g)", value: protein, set: setProtein },
                { label: "Carbs (g)", value: carbs, set: setCarbs },
                { label: "Fat (g)", value: fat, set: setFat },
              ].map(m => (
                <View key={m.label} style={{ flex: 1 }}>
                  <Text style={styles.macroInputLabel}>{m.label}</Text>
                  <TextInput
                    style={styles.macroInput}
                    value={m.value}
                    onChangeText={m.set}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor="rgba(30,20,0,0.25)"
                  />
                </View>
              ))}
            </View>

            <Text style={styles.modalLabel}>Notes</Text>
            <TextInput
              style={styles.modalInput}
              value={entryNotes}
              onChangeText={setEntryNotes}
              placeholder="Optional notes..."
              placeholderTextColor="rgba(30,20,0,0.3)"
            />

            <Pressable
              style={[styles.modalSaveBtn, addingSaving && { opacity: 0.6 }]}
              onPress={saveEntry}
              disabled={addingSaving}
            >
              {addingSaving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.modalSaveBtnText}>Log Entry</Text>
              }
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 10 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: DARK },
  divider: { height: 1, backgroundColor: BORDER, marginHorizontal: 16, marginBottom: 12 },
  gate: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  gateTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: DARK, textAlign: "center" },
  gateSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: MUTED, textAlign: "center", lineHeight: 22 },
  gateBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12, backgroundColor: GOLD },
  gateBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  dateNav: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, paddingVertical: 10, paddingHorizontal: 16 },
  dateArrow: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: GOLD + "12", borderWidth: 1, borderColor: BORDER },
  dateLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: DARK, minWidth: 100, textAlign: "center" },
  summaryCard: { marginHorizontal: 16, marginBottom: 16, padding: 16, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER },
  summaryTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: DARK, marginBottom: 12, letterSpacing: 0.5 },
  macroRow: { flexDirection: "row", justifyContent: "space-between" },
  macroItem: { alignItems: "center", flex: 1 },
  macroValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  macroUnit: { fontSize: 11, fontFamily: "Inter_400Regular", color: MUTED, marginTop: -2 },
  macroLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: MUTED, marginTop: 2 },
  mealSection: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  mealHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11, gap: 8, borderBottomWidth: 1, borderBottomColor: BORDER },
  mealIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: GOLD + "15", alignItems: "center", justifyContent: "center" },
  mealTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: DARK },
  mealAddBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: GOLD + "15", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  mealEmpty: { paddingHorizontal: 14, paddingVertical: 14 },
  mealEmptyText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(30,20,0,0.35)" },
  entryRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11, borderTopWidth: 1, borderTopColor: BORDER, gap: 10 },
  entryName: { fontSize: 14, fontFamily: "Inter_500Medium", color: DARK, marginBottom: 2 },
  entryMacros: { fontSize: 12, fontFamily: "Inter_400Regular", color: MUTED },
  entryNotes: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(30,20,0,0.35)", marginTop: 2 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, gap: 0 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: DARK },
  modalLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: DARK, marginBottom: 6, marginTop: 12, letterSpacing: 0.4 },
  modalInput: { backgroundColor: CREAM, borderRadius: 10, borderWidth: 1, borderColor: BORDER, padding: 12, fontSize: 15, fontFamily: "Inter_400Regular", color: DARK },
  mealPicker: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  mealPickerBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: CREAM, borderWidth: 1, borderColor: BORDER },
  mealPickerBtnActive: { backgroundColor: GOLD, borderColor: GOLD },
  mealPickerText: { fontSize: 13, fontFamily: "Inter_500Medium", color: MUTED },
  mealPickerTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },
  macroInputRow: { flexDirection: "row", gap: 8 },
  macroInputLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: MUTED, marginBottom: 4 },
  macroInput: { backgroundColor: CREAM, borderRadius: 8, borderWidth: 1, borderColor: BORDER, padding: 10, fontSize: 14, fontFamily: "Inter_400Regular", color: DARK, textAlign: "center" },
  modalSaveBtn: { marginTop: 20, backgroundColor: GOLD, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  modalSaveBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
