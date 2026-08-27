import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { plans } from "@/data/plans";
import { getCookingSteps } from "@/data/cookingInstructions";
import { libraryItems, type LibraryAssignment } from "@/data/library";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEALS = ["breakfast", "lunch", "dinner", "snack"] as const;
const MEAL_ICONS: Record<string, string> = {
  breakfast: "sunny-outline",
  lunch: "restaurant-outline",
  dinner: "moon-outline",
  snack: "cafe-outline",
};
const PLAN_COLORS: Record<string, string> = {
  meat: "#4a7c59",
  chicken: "#b5813a",
  fish: "#2e6b8a",
  ra: "#7a4a8a",
};

const SHOPPING_CUSTOM_KEY = "nourish:shopping:custom";

type CustomMeal = { id: string; label: string; text: string };
type ShoppingCustomItem = { id: string; category: string; item: string; why: string };

function parseAssignment(raw: string): LibraryAssignment | null {
  try {
    const parsed = JSON.parse(raw) as LibraryAssignment;
    if (parsed.version === 1 && parsed.recipeId) return parsed;
  } catch {
    const legacyItem = libraryItems.find((item) => item.id === raw);
    if (legacyItem) {
      return {
        version: 1,
        recipeId: raw,
        servings: legacyItem.servings,
        assignedAt: "",
      };
    }
  }
  return null;
}

function parseAmount(amount: string): number | null {
  const normalized = amount.trim();
  const mixedNumber = normalized.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedNumber) return Number(mixedNumber[1]) + Number(mixedNumber[2]) / Number(mixedNumber[3]);
  const fraction = normalized.match(/^(\d+)\/(\d+)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function scaleAmount(amount: string, ratio: number): string {
  const parsed = parseAmount(amount);
  if (parsed === null || ratio === 1) return amount;
  const scaled = parsed * ratio;
  return Number.isInteger(scaled) ? String(scaled) : String(Math.round(scaled * 100) / 100);
}

export default function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const plan = plans.find((p) => p.id === id);
  const [activeDay, setActiveDay] = useState(0);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [fishSwap, setFishSwap] = useState(false);
  const [customMeals, setCustomMeals] = useState<Record<string, CustomMeal[]>>({});
  const [editedMeals, setEditedMeals] = useState<Record<string, string>>({});
  const [libraryAssignments, setLibraryAssignments] = useState<Record<string, LibraryAssignment>>({});

  // Add custom meal modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editCustom, setEditCustom] = useState<CustomMeal | null>(null);
  const [customLabel, setCustomLabel] = useState("Extra Meal");
  const [customText, setCustomText] = useState("");

  // Edit built-in meal modal
  const [editBuiltinVisible, setEditBuiltinVisible] = useState(false);
  const [editBuiltinMeal, setEditBuiltinMeal] = useState<typeof MEALS[number]>("breakfast");
  const [editBuiltinText, setEditBuiltinText] = useState("");

  // Cooking instructions modal
  const [recipeVisible, setRecipeVisible] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState("");
  const [recipeSteps, setRecipeSteps] = useState<string[]>([]);

  const planColor = plan ? (PLAN_COLORS[plan.id] ?? colors.primary) : colors.primary;

  const checkedKey = useCallback((day: string, meal: string) => `nourish:${id}:${day}:${meal}`, [id]);
  const customKey = useCallback((day: string) => `nourish:custom:${id}:${day}`, [id]);
  const editedKey = useCallback((day: string, meal: string) => `nourish:edited:${id}:${day}:${meal}`, [id]);
  const assignmentKey = useCallback(
    (day: string, meal: string) => `nourish:library:assignment:${id}:${day}:${meal}`,
    [id]
  );

  useFocusEffect(
    useCallback(() => {
      if (!plan) return;
      const load = async () => {
      const checkedEntries: Record<string, boolean> = {};
      const customEntries: Record<string, CustomMeal[]> = {};
      const editedEntries: Record<string, string> = {};
      const assignmentEntries: Record<string, LibraryAssignment> = {};
      for (const day of DAYS) {
        for (const m of MEALS) {
          const v = await AsyncStorage.getItem(checkedKey(day, m));
          if (v === "true") checkedEntries[checkedKey(day, m)] = true;
          const ev = await AsyncStorage.getItem(editedKey(day, m));
          if (ev) editedEntries[editedKey(day, m)] = ev;
          const assignmentRaw = await AsyncStorage.getItem(assignmentKey(day, m));
          const assignment = assignmentRaw ? parseAssignment(assignmentRaw) : null;
          if (assignment) assignmentEntries[assignmentKey(day, m)] = assignment;
        }
        const cv = await AsyncStorage.getItem(customKey(day));
        if (cv) customEntries[day] = JSON.parse(cv);
      }
      setChecked(checkedEntries);
      setCustomMeals(customEntries);
      setEditedMeals(editedEntries);
      setLibraryAssignments(assignmentEntries);
      };
      load();
    }, [plan, assignmentKey, checkedKey, customKey, editedKey])
  );

  const toggleCheck = async (day: string, meal: string) => {
    const key = checkedKey(day, meal);
    const next = !checked[key];
    setChecked((p) => ({ ...p, [key]: next }));
    await AsyncStorage.setItem(key, String(next));
  };

  const toggleCustomCheck = async (day: string, customId: string) => {
    const key = `nourish:custom:check:${id}:${day}:${customId}`;
    const next = !checked[key];
    setChecked((p) => ({ ...p, [key]: next }));
    await AsyncStorage.setItem(key, String(next));
  };

  const openAddModal = () => {
    setEditCustom(null);
    setCustomLabel("Extra Meal");
    setCustomText("");
    setAddModalVisible(true);
  };

  const openEditCustom = (meal: CustomMeal) => {
    setEditCustom(meal);
    setCustomLabel(meal.label);
    setCustomText(meal.text);
    setAddModalVisible(true);
  };

  const saveCustomMeal = async () => {
    if (!customText.trim()) return;
    const day = DAYS[activeDay];
    const existing = customMeals[day] ?? [];
    let next: CustomMeal[];
    if (editCustom) {
      next = existing.map((m) => m.id === editCustom.id ? { ...m, label: customLabel, text: customText.trim() } : m);
    } else {
      next = [...existing, { id: `cm-${Date.now()}`, label: customLabel, text: customText.trim() }];
    }
    const updated = { ...customMeals, [day]: next };
    setCustomMeals(updated);
    await AsyncStorage.setItem(customKey(day), JSON.stringify(next));
    setAddModalVisible(false);
  };

  const deleteCustomMeal = (day: string, mealId: string) => {
    Alert.alert("Delete", "Remove this custom meal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          const existing = customMeals[day] ?? [];
          const next = existing.filter((m) => m.id !== mealId);
          const updated = { ...customMeals, [day]: next };
          setCustomMeals(updated);
          await AsyncStorage.setItem(customKey(day), JSON.stringify(next));
        }
      },
    ]);
  };

  // Edit built-in meal
  const openEditBuiltin = (meal: typeof MEALS[number]) => {
    setEditBuiltinMeal(meal);
    setEditBuiltinText(getDisplayMealText(meal));
    setEditBuiltinVisible(true);
  };

  const saveEditBuiltin = async () => {
    if (!editBuiltinText.trim()) return;
    const day = DAYS[activeDay];
    const key = editedKey(day, editBuiltinMeal);
    const updated = { ...editedMeals, [key]: editBuiltinText.trim() };
    const libraryKey = assignmentKey(day, editBuiltinMeal);
    const updatedAssignments = { ...libraryAssignments };
    delete updatedAssignments[libraryKey];
    setEditedMeals(updated);
    setLibraryAssignments(updatedAssignments);
    await AsyncStorage.multiSet([[key, editBuiltinText.trim()]]);
    await AsyncStorage.removeItem(libraryKey);
    setEditBuiltinVisible(false);
  };

  const resetBuiltinMeal = async (meal: typeof MEALS[number]) => {
    const day = DAYS[activeDay];
    const key = editedKey(day, meal);
    const updated = { ...editedMeals };
    const libraryKey = assignmentKey(day, meal);
    const updatedAssignments = { ...libraryAssignments };
    delete updated[key];
    delete updatedAssignments[libraryKey];
    setEditedMeals(updated);
    setLibraryAssignments(updatedAssignments);
    await AsyncStorage.multiRemove([key, libraryKey]);
  };

  // Cooking instructions
  const openRecipe = (meal: typeof MEALS[number]) => {
    const steps = getCookingSteps(id ?? "", activeDay, meal);
    if (!steps) {
      Alert.alert("No instructions yet", "Cooking instructions for this meal aren't available yet.");
      return;
    }
    const mealLabel = meal.charAt(0).toUpperCase() + meal.slice(1);
    setRecipeTitle(`${mealLabel} — How to Cook`);
    setRecipeSteps(steps);
    setRecipeVisible(true);
  };

  // Add day to shopping list
  const addDayToShoppingList = async () => {
    const day = DAYS[activeDay];
    const raw = await AsyncStorage.getItem(SHOPPING_CUSTOM_KEY);
    const existing: ShoppingCustomItem[] = raw ? JSON.parse(raw) : [];
    const newItems: ShoppingCustomItem[] = [];
    MEALS.forEach((meal, mealIndex) => {
      const assignment = libraryAssignments[assignmentKey(day, meal)];
      const assignedItem = libraryItems.find((libraryItem) => libraryItem.id === assignment?.recipeId);
      if (assignedItem) {
        const servingRatio = assignment.servings / assignedItem.servings;
        assignedItem.ingredients.forEach((ingredient, ingredientIndex) => {
          const amount = scaleAmount(ingredient.amount, servingRatio);
          newItems.push({
            id: `plan-${id}-${day}-${meal}-${Date.now() + mealIndex + ingredientIndex}`,
            category: ingredient.category || "Pantry Staples",
            item: `${amount} ${ingredient.unit} ${ingredient.name}`,
            why: `${assignedItem.title} · ${plan?.title ?? "Meal Plan"} · ${day}`,
          });
        });
        return;
      }
      const text = getDisplayMealText(meal);
      if (text) {
        newItems.push({
          id: `plan-${id}-${day}-${meal}-${Date.now() + mealIndex}`,
          category: "From Meal Plan",
          item: `${meal.charAt(0).toUpperCase() + meal.slice(1)}: ${text}`,
          why: `${plan?.title ?? "Meal Plan"} · ${day}`,
        });
      }
    });
    const existingNames = new Set(existing.map((item) => item.item.toLowerCase()));
    const uniqueNewItems = newItems.filter((item) => !existingNames.has(item.item.toLowerCase()));

    await AsyncStorage.setItem(SHOPPING_CUSTOM_KEY, JSON.stringify([...existing, ...uniqueNewItems]));
    Alert.alert(
      "Shopping List Updated",
      uniqueNewItems.length > 0
        ? `${uniqueNewItems.length} items from ${day}'s meals were added to your Guide shopping list.`
        : `${day}'s ingredients are already on your shopping list.`,
      [{ text: "OK" }]
    );
  };

  if (!plan) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Plan not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const totalMeals = DAYS.length * MEALS.length;
  const completedMeals = Object.values(checked).filter(Boolean).length;
  const progress = Math.min(completedMeals / totalMeals, 1);

  const dayMeal = plan.meals[activeDay];
  const dayCustom = customMeals[DAYS[activeDay]] ?? [];

  const getBaseMealText = (meal: typeof MEALS[number]) => {
    if (fishSwap && plan.hasFishSwap) {
      if (meal === "dinner" && dayMeal.fishSwapDinner) return dayMeal.fishSwapDinner;
      if (meal === "lunch" && dayMeal.fishSwapLunch) return dayMeal.fishSwapLunch;
    }
    return dayMeal[meal];
  };

  const getDisplayMealText = (meal: typeof MEALS[number]) => {
    const key = editedKey(DAYS[activeDay], meal);
    return editedMeals[key] ?? getBaseMealText(meal);
  };

  const isEdited = (meal: typeof MEALS[number]) => {
    const key = editedKey(DAYS[activeDay], meal);
    return !!editedMeals[key];
  };

  const hasRecipe = (meal: typeof MEALS[number]) => {
    const steps = getCookingSteps(id ?? "", activeDay, meal);
    return steps !== null;
  };

  const LABEL_OPTIONS = ["Extra Meal", "Snack", "Supplement", "Note", "Reminder", "Drink"];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.headerWrap, { paddingTop: topPad, backgroundColor: planColor }]}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerSmall} numberOfLines={1}>{plan.title}</Text>
          {plan.hasFishSwap && (
            <View style={styles.swapRow}>
              <Text style={styles.swapLabel}>No-fish</Text>
              <Switch value={fishSwap} onValueChange={setFishSwap} trackColor={{ false: "rgba(255,255,255,0.3)", true: "#ffffff" }} thumbColor={fishSwap ? planColor : "#f0f0f0"} style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }} />
            </View>
          )}
        </View>
        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: "#ffffff" }]} />
          </View>
          <Text style={styles.progressText}>{completedMeals}/{totalMeals} meals completed</Text>
        </View>
      </View>

      {/* Day selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.dayScroll, { backgroundColor: colors.card, borderBottomColor: colors.border }]} contentContainerStyle={styles.dayScrollContent}>
        {DAYS.map((day, i) => {
          const dayDone = MEALS.every((m) => checked[checkedKey(day, m)]);
          return (
            <Pressable key={day} style={[styles.dayBtn, activeDay === i && { backgroundColor: planColor }]} onPress={() => setActiveDay(i)}>
              {dayDone && <View style={[styles.dayDot, { backgroundColor: activeDay === i ? "#fff" : planColor }]} />}
              <Text style={[styles.dayText, { color: activeDay === i ? "#fff" : colors.mutedForeground }]}>{SHORT_DAYS[i]}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Meals */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 80 + bottomPad }}>
        <View style={styles.dayHeadingRow}>
          <Text style={[styles.dayHeading, { color: colors.foreground }]}>{DAYS[activeDay]}</Text>
          <Pressable
            style={({ pressed }) => [styles.shoppingBtn, { backgroundColor: planColor + "15", borderColor: planColor + "50" }, pressed && { opacity: 0.7 }]}
            onPress={addDayToShoppingList}
          >
            <Ionicons name="cart-outline" size={15} color={planColor} />
            <Text style={[styles.shoppingBtnText, { color: planColor }]}>Add to Shopping List</Text>
          </Pressable>
        </View>

        {MEALS.map((meal) => {
          const key = checkedKey(DAYS[activeDay], meal);
          const isDone = !!checked[key];
          const mealText = getDisplayMealText(meal);
          const edited = isEdited(meal);
          const hasSteps = hasRecipe(meal);
           const assignment = libraryAssignments[assignmentKey(DAYS[activeDay], meal)];
           const assignedItem = libraryItems.find((libraryItem) => libraryItem.id === assignment?.recipeId);
          return (
            <View key={meal} style={[styles.mealCard, { backgroundColor: colors.card, borderColor: isDone ? planColor : colors.border }, isDone && { backgroundColor: planColor + "0c" }]}>
               {assignedItem && (
                 <Pressable
                   style={({ pressed }) => [styles.assignedPreview, pressed && { opacity: 0.88 }]}
                   onPress={() => router.push(`/library/${assignedItem.id}` as never)}
                   accessibilityRole="button"
                   accessibilityLabel={`Open ${assignedItem.title} recipe details`}
                 >
                   <Image source={assignedItem.image} style={styles.assignedImage} resizeMode="cover" />
                   <View style={styles.assignedOverlay}>
                     <View style={styles.assignedBadge}>
                       <Ionicons name="book-outline" size={12} color="#fff" />
                       <Text style={styles.assignedBadgeText}>From Explore</Text>
                     </View>
                     <Text style={styles.assignedMeta}>
                       {assignment.servings} servings · Est. {Math.round(assignedItem.estimatedNutrition.calories * assignment.servings / assignedItem.servings)} kcal · {assignedItem.prepMinutes + assignedItem.cookMinutes} min
                     </Text>
                     {assignment.note ? (
                       <Text style={styles.assignedNote} numberOfLines={2}>{assignment.note}</Text>
                     ) : null}
                   </View>
                 </Pressable>
               )}
              <View style={styles.mealMain}>
                <Pressable
                  style={({ pressed }) => [styles.mealCheckArea, pressed && { opacity: 0.8 }]}
                  onPress={() => toggleCheck(DAYS[activeDay], meal)}
                >
                  <View style={[styles.mealIcon, { backgroundColor: isDone ? planColor + "20" : colors.muted }]}>
                    <Ionicons name={MEAL_ICONS[meal] as any} size={18} color={isDone ? planColor : colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.mealTypeRow}>
                      <Text style={[styles.mealType, { color: isDone ? planColor : colors.mutedForeground }]}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                      {edited && (
                        <View style={[styles.editedBadge, { backgroundColor: planColor + "20" }]}>
                          <Text style={[styles.editedBadgeText, { color: planColor }]}>edited</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.mealText, { color: colors.foreground }, isDone && { textDecorationLine: "line-through", color: colors.mutedForeground }]}>{mealText}</Text>
                  </View>
                  <View style={[styles.checkCircle, { borderColor: isDone ? planColor : colors.border, backgroundColor: isDone ? planColor : "transparent" }]}>
                    {isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                </Pressable>

                {/* Action row */}
                <View style={[styles.mealActions, { borderTopColor: colors.border + "60" }]}>
                   {assignedItem && (
                     <Pressable
                       style={({ pressed }) => [styles.mealActionBtn, pressed && { opacity: 0.6 }]}
                       onPress={() => router.push(`/library/${assignedItem.id}` as never)}
                     >
                       <Ionicons name="book-outline" size={13} color={planColor} />
                       <Text style={[styles.mealActionText, { color: planColor }]}>View Recipe</Text>
                     </Pressable>
                   )}
                  {hasSteps && (
                    <Pressable style={({ pressed }) => [styles.mealActionBtn, pressed && { opacity: 0.6 }]} onPress={() => openRecipe(meal)}>
                      <Ionicons name="flame-outline" size={13} color={planColor} />
                      <Text style={[styles.mealActionText, { color: planColor }]}>How to Cook</Text>
                    </Pressable>
                  )}
                  <Pressable style={({ pressed }) => [styles.mealActionBtn, pressed && { opacity: 0.6 }]} onPress={() => openEditBuiltin(meal)}>
                    <Ionicons name="pencil-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.mealActionText, { color: colors.mutedForeground }]}>Edit</Text>
                  </Pressable>
                  {edited && (
                    <Pressable style={({ pressed }) => [styles.mealActionBtn, pressed && { opacity: 0.6 }]} onPress={() => resetBuiltinMeal(meal)}>
                      <Ionicons name="refresh-outline" size={13} color={colors.mutedForeground} />
                      <Text style={[styles.mealActionText, { color: colors.mutedForeground }]}>Reset</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* Custom meals */}
        {dayCustom.map((cm) => {
          const key = `nourish:custom:check:${id}:${DAYS[activeDay]}:${cm.id}`;
          const isDone = !!checked[key];
          return (
            <Pressable
              key={cm.id}
              style={({ pressed }) => [styles.mealCard, styles.customMealCard, { backgroundColor: colors.card, borderColor: isDone ? planColor : colors.border + "80" }, isDone && { backgroundColor: planColor + "0c" }, pressed && { opacity: 0.88 }]}
              onPress={() => toggleCustomCheck(DAYS[activeDay], cm.id)}
            >
              <View style={styles.mealMain}>
                <View style={styles.mealCheckArea}>
                  <View style={[styles.mealIcon, { backgroundColor: isDone ? planColor + "20" : colors.muted }]}>
                    <Ionicons name="create-outline" size={18} color={isDone ? planColor : colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.mealType, { color: isDone ? planColor : colors.mutedForeground }]}>{cm.label}</Text>
                    <Text style={[styles.mealText, { color: colors.foreground }, isDone && { textDecorationLine: "line-through", color: colors.mutedForeground }]}>{cm.text}</Text>
                  </View>
                  <View style={styles.customActions}>
                    <Pressable onPress={() => openEditCustom(cm)} hitSlop={8}>
                      <Ionicons name="pencil-outline" size={15} color={colors.mutedForeground} />
                    </Pressable>
                    <Pressable onPress={() => deleteCustomMeal(DAYS[activeDay], cm.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={15} color="#c0392b" />
                    </Pressable>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}

        {/* Add custom meal button */}
        <Pressable
          style={({ pressed }) => [styles.addMealBtn, { borderColor: planColor + "60", backgroundColor: planColor + "0c" }, pressed && { opacity: 0.75 }]}
          onPress={openAddModal}
        >
          <Ionicons name="add-circle-outline" size={20} color={planColor} />
          <Text style={[styles.addMealBtnText, { color: planColor }]}>Add to {DAYS[activeDay]}</Text>
        </Pressable>

        {plan.note && (
          <View style={[styles.noteCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.noteText, { color: colors.mutedForeground }]}>{plan.note}</Text>
          </View>
        )}

        <View style={[styles.avoidCard, { backgroundColor: "#c0392b0d", borderColor: "#c0392b30" }]}>
          <Text style={[styles.avoidTitle, { color: "#c0392b" }]}>Foods to Avoid</Text>
          <Text style={[styles.avoidText, { color: colors.mutedForeground }]}>{plan.avoid}</Text>
        </View>
      </ScrollView>

      {/* ── Add / Edit Custom Meal Modal ── */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {editCustom ? "Edit Item" : `Add to ${DAYS[activeDay]}`}
            </Text>
            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.labelPicker}>
                {LABEL_OPTIONS.map((lbl) => (
                  <Pressable
                    key={lbl}
                    style={[styles.labelChip, { backgroundColor: customLabel === lbl ? planColor : colors.muted, borderColor: customLabel === lbl ? planColor : colors.border }]}
                    onPress={() => setCustomLabel(lbl)}
                  >
                    <Text style={[styles.labelChipText, { color: customLabel === lbl ? "#fff" : colors.foreground }]}>{lbl}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Description</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
              placeholder="e.g. Magnesium glycinate 400mg before bed"
              placeholderTextColor={colors.mutedForeground}
              value={customText}
              onChangeText={setCustomText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalCancel, { borderColor: colors.border }]} onPress={() => setAddModalVisible(false)}>
                <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalConfirm, { backgroundColor: planColor }]} onPress={saveCustomMeal}>
                <Text style={styles.modalConfirmText}>{editCustom ? "Save" : "Add"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Edit Built-in Meal Modal ── */}
      <Modal visible={editBuiltinVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Edit {editBuiltinMeal.charAt(0).toUpperCase() + editBuiltinMeal.slice(1)}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.mutedForeground }]}>
              {DAYS[activeDay]} · You can restore the original any time
            </Text>
            <TextInput
              style={[styles.modalInput, { borderColor: planColor, color: colors.foreground, backgroundColor: colors.background, marginTop: 16 }]}
              placeholder="Enter your meal..."
              placeholderTextColor={colors.mutedForeground}
              value={editBuiltinText}
              onChangeText={setEditBuiltinText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalCancel, { borderColor: colors.border }]} onPress={() => setEditBuiltinVisible(false)}>
                <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalConfirm, { backgroundColor: planColor }]} onPress={saveEditBuiltin}>
                <Text style={styles.modalConfirmText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Cooking Instructions Modal ── */}
      <Modal visible={recipeVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.recipeCard, { backgroundColor: colors.card }]}>
            <View style={styles.recipeHeader}>
              <Ionicons name="flame" size={20} color={planColor} />
              <Text style={[styles.recipeTitle, { color: colors.foreground }]}>{recipeTitle}</Text>
              <Pressable onPress={() => setRecipeVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {recipeSteps.map((step, i) => (
                <View key={i} style={styles.recipeStep}>
                  <View style={[styles.recipeStepNum, { backgroundColor: planColor }]}>
                    <Text style={styles.recipeStepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.recipeStepText, { color: colors.foreground }]}>{step}</Text>
                </View>
              ))}
              <View style={{ height: 12 }} />
            </ScrollView>
            <Pressable
              style={[styles.recipeDoneBtn, { backgroundColor: planColor }]}
              onPress={() => setRecipeVisible(false)}
            >
              <Text style={styles.recipeDoneBtnText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  headerWrap: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerSmall: { flex: 1, color: "rgba(255,255,255,0.9)", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  swapRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  swapLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_500Medium" },
  progressWrap: { gap: 6 },
  progressBar: { height: 5, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Inter_400Regular" },
  dayScroll: { borderBottomWidth: 1, maxHeight: 60 },
  dayScrollContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 6, alignItems: "center" },
  dayBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, alignItems: "center", flexDirection: "row", gap: 4 },
  dayDot: { width: 5, height: 5, borderRadius: 3 },
  dayText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  dayHeadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  dayHeading: { fontSize: 22, fontFamily: "Inter_700Bold" },
  shoppingBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  shoppingBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  mealCard: { borderRadius: 12, borderWidth: 1.5, marginBottom: 10, overflow: "hidden" },
  assignedPreview: { height: 138, position: "relative" },
  assignedImage: { width: "100%", height: "100%" },
  assignedOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    gap: 5,
    backgroundColor: "rgba(18,30,24,0.62)",
  },
  assignedBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  assignedBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  assignedMeta: { color: "rgba(255,255,255,0.88)", fontSize: 11, fontFamily: "Inter_400Regular" },
  assignedNote: { color: "#fff", fontSize: 11, lineHeight: 16, fontFamily: "Inter_500Medium" },
  customMealCard: { borderStyle: "dashed" },
  mealMain: { flex: 1 },
  mealCheckArea: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  mealIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  mealTypeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  mealType: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, textTransform: "uppercase" },
  editedBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  editedBadgeText: { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  mealText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 2 },
  mealActions: { flexDirection: "row", gap: 4, paddingHorizontal: 14, paddingBottom: 10, paddingTop: 6, borderTopWidth: 1 },
  mealActionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  mealActionText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  customActions: { flexDirection: "column", gap: 10, paddingLeft: 4, alignItems: "center" },
  addMealBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 13, borderRadius: 10, borderWidth: 1.5, borderStyle: "dashed", marginBottom: 14 },
  addMealBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  noteCard: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  noteText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  avoidCard: { padding: 14, borderRadius: 10, borderWidth: 1 },
  avoidTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  avoidText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40 },
  modalTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4 },
  modalSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  modalLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 },
  labelPicker: { flexDirection: "row", gap: 8 },
  labelChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  labelChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  modalInput: { borderWidth: 1.5, borderRadius: 10, padding: 13, fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 16, minHeight: 80 },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalCancel: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 14, alignItems: "center" },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  modalConfirm: { flex: 1, borderRadius: 10, padding: 14, alignItems: "center" },
  modalConfirmText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  recipeCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  recipeHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  recipeTitle: { flex: 1, fontSize: 17, fontFamily: "Inter_700Bold" },
  recipeStep: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  recipeStepNum: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  recipeStepNumText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  recipeStepText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  recipeDoneBtn: { borderRadius: 12, padding: 15, alignItems: "center", marginTop: 8 },
  recipeDoneBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
