import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
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
import { libraryItems, type LibraryAssignment } from "@/data/library";
import { plans } from "@/data/plans";
import { usePurchase } from "@/contexts/PurchaseContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["breakfast", "lunch", "dinner", "snack"];
const FREE_PLAN_ID = "meat";
const MEAL_ICONS: Record<string, string> = {
  breakfast: "sunny-outline",
  lunch: "restaurant-outline",
  dinner: "moon-outline",
  snack: "cafe-outline",
};

function parseAmount(amount: string): number | null {
  const normalized = amount.trim();
  const mixedNumber = normalized.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedNumber) {
    return Number(mixedNumber[1]) + Number(mixedNumber[2]) / Number(mixedNumber[3]);
  }
  const fraction = normalized.match(/^(\d+)\/(\d+)$/);
  if (fraction) {
    return Number(fraction[1]) / Number(fraction[2]);
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function scaleAmount(amount: string, ratio: number): string {
  const parsed = parseAmount(amount);
  if (parsed === null || ratio === 1) return amount;
  const scaled = parsed * ratio;
  return Number.isInteger(scaled) ? String(scaled) : String(Math.round(scaled * 100) / 100);
}

function getAllergens(ingredientNames: string[], explicit: string[] = []): string[] {
  const text = ingredientNames.join(" ").toLowerCase();
  const inferred = [
    /salmon|fish/.test(text) ? "Fish" : null,
    /\begg/.test(text) ? "Egg" : null,
    /walnut|almond|pine nut|cashew/.test(text) ? "Tree nuts" : null,
    /tahini|sesame/.test(text) ? "Sesame" : null,
    /sourdough|cracked wheat|bread/.test(text) ? "Gluten" : null,
    /yogurt|feta|cheese|milk/.test(text) && !/oat milk|almond milk|coconut milk/.test(text) ? "Dairy" : null,
    /tofu|soy/.test(text) ? "Soy" : null,
  ].filter((allergen): allergen is string => Boolean(allergen));
  return Array.from(new Set([...explicit, ...inferred]));
}

export default function LibraryItemScreen() {
  const { id, addToPlan } = useLocalSearchParams<{ id: string; addToPlan?: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isPurchased, goToCheckout } = usePurchase();
  const topPad = Platform.OS === "web" ? 20 : Math.max(insets.top, 20);
  const bottomPad = Platform.OS === "web" ? 34 : Math.max(insets.bottom, 20);
  const hasOpenedPlanModal = useRef(false);

  const item = useMemo(() => libraryItems.find((i) => i.id === id), [id]);

  const [isFavorite, setIsFavorite] = useState(false);
  const [servings, setServings] = useState(item?.servings || 1);
  const [customNote, setCustomNote] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [hideAlcohol, setHideAlcohol] = useState(false);

  // Plan Modal State
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    if (item) setServings(item.servings);
  }, [item]);

  useEffect(() => {
    if (item && addToPlan === "1" && !hasOpenedPlanModal.current) {
      hasOpenedPlanModal.current = true;
      setPlanModalVisible(true);
    }
  }, [addToPlan, item]);

  useEffect(() => {
    const loadState = async () => {
      try {
        const [favsRaw, hideAlcoholRaw] = await Promise.all([
          AsyncStorage.getItem("nourish:library:favorites"),
          AsyncStorage.getItem("nourish:library:hideAlcohol"),
        ]);
        if (favsRaw) {
          const favs = JSON.parse(favsRaw);
          setIsFavorite(favs.includes(id));
        }
        setHideAlcohol(hideAlcoholRaw === "true");

        const noteRaw = await AsyncStorage.getItem(`nourish:library:note:${id}`);
        if (noteRaw) {
          setCustomNote(noteRaw);
        }
      } catch (e) {
        // ignore
      }
    };
    loadState();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const favsRaw = await AsyncStorage.getItem("nourish:library:favorites");
      let favs: string[] = favsRaw ? JSON.parse(favsRaw) : [];
      if (isFavorite) {
        favs = favs.filter((f) => f !== id);
      } else {
        favs.push(id as string);
      }
      await AsyncStorage.setItem("nourish:library:favorites", JSON.stringify(favs));
      setIsFavorite(!isFavorite);
    } catch (e) {}
  };

  const saveNote = async () => {
    try {
      await AsyncStorage.setItem(`nourish:library:note:${id}`, customNote);
      setIsEditingNote(false);
    } catch (e) {}
  };

  const addIngredientsToShopping = async () => {
    if (!item) return;
    try {
      const raw = await AsyncStorage.getItem("nourish:shopping:custom");
      const existing = raw ? JSON.parse(raw) : [];

      const servingRatio = servings / item.servings;
      
      const newItems = item.ingredients.map((ing, i) => {
        const displayAmount = scaleAmount(ing.amount, servingRatio);

        return {
          id: `lib-${id}-${Date.now()}-${i}`,
          category: ing.category || "Pantry Staples",
          item: `${displayAmount} ${ing.unit} ${ing.name}`,
          why: `For ${item.title}`
        };
      });

      const existingNames = new Set(existing.map((entry: { item: string }) => entry.item.toLowerCase()));
      const toAdd = newItems.filter((newItem) => !existingNames.has(newItem.item.toLowerCase()));

      await AsyncStorage.setItem("nourish:shopping:custom", JSON.stringify([...existing, ...toAdd]));
      Alert.alert(
        "Shopping List Updated",
        toAdd.length > 0
          ? `${toAdd.length} ingredients were added to your Guide shopping list.`
          : "Those ingredients are already on your shopping list."
      );
    } catch {
      Alert.alert("Could Not Add Ingredients", "Please try again.");
    }
  };

  const addMealToPlan = async (mealSlot: string) => {
    if (!item || !selectedPlanId || !selectedDay) return;
    try {
      const key = `nourish:edited:${selectedPlanId}:${selectedDay}:${mealSlot}`;
      const assignmentKey = `nourish:library:assignment:${selectedPlanId}:${selectedDay}:${mealSlot}`;
      const assignment: LibraryAssignment = {
        version: 1,
        recipeId: item.id,
        servings,
        note: customNote.trim() || undefined,
        assignedAt: new Date().toISOString(),
      };
      await AsyncStorage.multiSet([
        [key, item.title],
        [assignmentKey, JSON.stringify(assignment)],
      ]);
      setPlanModalVisible(false);
      Alert.alert("Added to Plan", `${item.title} has been added to ${selectedDay} ${mealSlot.charAt(0).toUpperCase() + mealSlot.slice(1)}.`);
    } catch {
      Alert.alert("Could Not Update Plan", "Please try again.");
    }
  };

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.foreground }}>Item not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const servingRatio = servings / item.servings;
  const allergens = getAllergens(item.ingredients.map((ingredient) => ingredient.name), item.allergens);
  const displayImage = hideAlcohol && item.alcoholFlag
    ? item.alcoholHiddenImage ?? item.image
    : item.image;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 + bottomPad }}>
        {/* Hero Image */}
        <ImageBackground source={displayImage} style={styles.heroImage} resizeMode="cover">
          <View style={[styles.heroOverlay, { paddingTop: topPad }]}>
            <View style={styles.heroNav}>
              <Pressable
                style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.7 }]}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.7 }]}
                onPress={toggleFavorite}
              >
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#e74c3c" : "#fff"} />
              </Pressable>
            </View>
          </View>
        </ImageBackground>

        {/* Content */}
        <View style={[styles.contentWrap, { backgroundColor: colors.background }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
          </View>
          <Text style={[styles.summary, { color: colors.mutedForeground }]}>{item.summary}</Text>

          {/* Tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll} contentContainerStyle={{ gap: 8 }}>
            {item.cuisine && (
              <View style={[styles.tagBadge, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{item.cuisine}</Text>
              </View>
            )}
            {item.tags
              .filter((tag) => !(hideAlcohol && item.alcoholFlag && tag === "Mindful Indulgence"))
              .map(t => (
              <View key={t} style={[styles.tagBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Text style={[styles.tagText, { color: colors.foreground }]}>{t}</Text>
              </View>
            ))}
            {allergens.map((allergen) => (
              <View key={allergen} style={[styles.tagBadge, { backgroundColor: "#c0392b10", borderColor: "#c0392b30" }]}>
                <Text style={[styles.tagText, { color: "#a93226" }]}>Contains {allergen}</Text>
              </View>
            ))}
            {item.alcoholFlag && !hideAlcohol && (
              <View style={[styles.tagBadge, { backgroundColor: "#c0392b15", borderColor: "#c0392b30" }]}>
                <Text style={[styles.tagText, { color: "#c0392b" }]}>Contains Alcohol</Text>
              </View>
            )}
          </ScrollView>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.85 }]}
              onPress={() => {
                setSelectedPlanId(null);
                setSelectedDay(null);
                setPlanModalVisible(true);
              }}
                accessibilityRole="button"
                accessibilityLabel={`Add ${item.title} to a meal plan`}
                testID="recipe-add-to-plan"
            >
              <Ionicons name="calendar-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Add to Plan</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionBtnOutline, { borderColor: colors.primary }, pressed && { opacity: 0.85 }]}
              onPress={addIngredientsToShopping}
                accessibilityRole="button"
                accessibilityLabel={`Add ingredients for ${item.title} to the shopping list`}
                testID="recipe-add-to-shopping"
            >
              <Ionicons name="cart-outline" size={20} color={colors.primary} />
            </Pressable>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.foreground }]}>
            {hideAlcohol && item.alcoholFlag
              ? "Herb-crusted salmon with roasted vegetables makes an elegant, complete dinner with bright herbs and a crisp green side."
              : item.description}
          </Text>

          <View style={styles.timeRow}>
            <View style={[styles.timeChip, { backgroundColor: colors.surface }]}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={[styles.timeText, { color: colors.foreground }]}>
                {item.prepMinutes + item.cookMinutes} minutes total
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 8, marginBottom: 4, fontSize: 18 }]}>Estimated Nutrition</Text>
          <Text style={[styles.estimateNote, { color: colors.mutedForeground }]}>
            Per selected serving. Values change when ingredients are customized.
          </Text>
          <View style={[styles.metaBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Calories</Text>
              <Text style={[styles.metaVal, { color: colors.foreground }]}>{Math.round(item.estimatedNutrition.calories * servingRatio)}</Text>
            </View>
            <View style={styles.metaDiv} />
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Protein</Text>
              <Text style={[styles.metaVal, { color: colors.foreground }]}>{Math.round(item.estimatedNutrition.protein * servingRatio)}g</Text>
            </View>
            <View style={styles.metaDiv} />
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Carbs</Text>
              <Text style={[styles.metaVal, { color: colors.foreground }]}>{Math.round(item.estimatedNutrition.carbs * servingRatio)}g</Text>
            </View>
            <View style={styles.metaDiv} />
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Fat</Text>
              <Text style={[styles.metaVal, { color: colors.foreground }]}>{Math.round(item.estimatedNutrition.fat * servingRatio)}g</Text>
            </View>
          </View>

          {/* Servings Adjuster */}
          <View style={[styles.servingsWrap, { backgroundColor: colors.muted }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>Ingredients</Text>
            <View style={styles.servingsControl}>
              <Pressable
                onPress={() => setServings(Math.max(1, servings - 1))}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Decrease servings"
                accessibilityRole="button"
                style={({ pressed }) => [styles.servingBtn, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="remove" size={16} color={colors.foreground} />
              </Pressable>
              <Text style={[styles.servingNum, { color: colors.foreground }]} accessibilityLabel={`${servings} servings`}>
                {servings} {servings === 1 ? "serving" : "servings"}
              </Text>
              <Pressable
                onPress={() => setServings(Math.min(12, servings + 1))}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Increase servings"
                accessibilityRole="button"
                style={({ pressed }) => [styles.servingBtn, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.7 }]}
              >
                <Ionicons name="add" size={16} color={colors.foreground} />
              </Pressable>
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.ingredientsList}>
            {item.ingredients.map((ing, i) => {
              const displayAmount = scaleAmount(ing.amount, servingRatio);
              return (
                <View key={i} style={[styles.ingRow, { borderBottomColor: colors.border + "50" }]}>
                  <Text style={[styles.ingAmount, { color: colors.primary }]}>{displayAmount} {ing.unit}</Text>
                  <Text style={[styles.ingName, { color: colors.foreground }]}>{ing.name}</Text>
                </View>
              );
            })}
          </View>

          {/* Instructions */}
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 32 }]}>Instructions</Text>
          <View style={styles.instructionsList}>
            {item.instructions
              .filter((step) => !(hideAlcohol && item.alcoholFlag && /pairing|wine|pinot|spritzer|alcohol/i.test(step)))
              .map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={[styles.stepNumWrap, { backgroundColor: colors.primary + "15" }]}>
                  <Text style={[styles.stepNum, { color: colors.primary }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Substitutions & Notes */}
          {(item.substitutions.length > 0 || item.wellnessNote || item.alcoholFreeAlternative) && (
            <View style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {item.wellnessNote && !(hideAlcohol && item.alcoholFlag) && (
                <View style={styles.noteSection}>
                  <View style={styles.noteHeaderRow}>
                    <Ionicons name="leaf" size={16} color={colors.primary} />
                    <Text style={[styles.noteTitle, { color: colors.primary }]}>Wellness Note</Text>
                  </View>
                  <Text style={[styles.noteText, { color: colors.foreground }]}>{item.wellnessNote}</Text>
                </View>
              )}
              {item.alcoholFreeAlternative && !hideAlcohol && (
                <View style={styles.noteSection}>
                  <View style={styles.noteHeaderRow}>
                    <Ionicons name="wine" size={16} color={colors.primary} />
                    <Text style={[styles.noteTitle, { color: colors.primary }]}>Alcohol-Free Option</Text>
                  </View>
                  <Text style={[styles.noteText, { color: colors.foreground }]}>{item.alcoholFreeAlternative}</Text>
                </View>
              )}
              {item.alcoholFlag && !hideAlcohol && (
                <View style={styles.noteSection}>
                  <View style={styles.noteHeaderRow}>
                    <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
                    <Text style={[styles.noteTitle, { color: colors.foreground }]}>Optional Pairing</Text>
                  </View>
                  <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
                    Alcohol is optional and is not presented as a wellness recommendation. Follow local guidance and choose the alcohol-free option whenever it better fits your needs.
                  </Text>
                </View>
              )}
              {item.substitutions.filter((sub) => !(hideAlcohol && sub.original.toLowerCase().includes("pinot"))).length > 0 && (
                <View style={styles.noteSection}>
                  <Text style={[styles.noteTitle, { color: colors.foreground }]}>Substitutions</Text>
                  {item.substitutions
                    .filter((sub) => !(hideAlcohol && sub.original.toLowerCase().includes("pinot")))
                    .map((sub, i) => (
                    <Text key={i} style={[styles.noteText, { color: colors.mutedForeground }]}>
                      • Swap <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>{sub.original}</Text> for {sub.replacement}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Customizations Note (User editable) */}
          <View style={[styles.customNoteWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.customNoteHeader}>
              <Ionicons name="create-outline" size={20} color={colors.mutedForeground} />
              <Text style={[styles.customNoteTitle, { color: colors.foreground }]}>My Customizations</Text>
            </View>
            {isEditingNote ? (
              <View>
                <TextInput
                  style={[styles.customNoteInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  multiline
                  placeholder="e.g. Swapped walnuts for pecans, added extra garlic..."
                  placeholderTextColor={colors.mutedForeground}
                  value={customNote}
                  onChangeText={setCustomNote}
                  autoFocus
                />
                <View style={styles.customNoteActions}>
                  <Pressable style={[styles.customNoteBtn, { backgroundColor: colors.primary }]} onPress={saveNote}>
                    <Text style={styles.customNoteBtnText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={[styles.customNoteDisplay, { borderColor: colors.border + "80", borderStyle: "dashed" }]}
                onPress={() => setIsEditingNote(true)}
              >
                {customNote ? (
                  <Text style={[styles.customNoteText, { color: colors.foreground }]}>{customNote}</Text>
                ) : (
                  <Text style={[styles.customNotePlaceholder, { color: colors.mutedForeground }]}>
                    Tap to add private notes or changes you made to this recipe...
                  </Text>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Plan Selection Modal */}
      <Modal visible={planModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, paddingBottom: bottomPad + 24 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add to Plan</Text>
              <Pressable onPress={() => setPlanModalVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {!selectedPlanId ? (
              <View style={styles.modalSection}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Step 1: Select Plan</Text>
                {plans.map((p) => {
                  const isLocked = !isPurchased && p.id !== FREE_PLAN_ID;
                  return (
                    <Pressable
                      key={p.id}
                      style={({ pressed }) => [
                        styles.modalListBtn,
                        { borderColor: colors.border },
                        isLocked && { opacity: 0.55 },
                        pressed && { backgroundColor: colors.muted },
                      ]}
                      onPress={() => {
                        if (isLocked) {
                          setPlanModalVisible(false);
                          goToCheckout();
                          return;
                        }
                        setSelectedPlanId(p.id);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={isLocked ? `Unlock ${p.title}` : `Select ${p.title}`}
                    >
                      <Text style={[styles.modalListText, { color: colors.foreground }]}>{p.title}</Text>
                      <Ionicons name={isLocked ? "lock-closed" : "chevron-forward"} size={18} color={colors.mutedForeground} />
                    </Pressable>
                  );
                })}
              </View>
            ) : !selectedDay ? (
              <View style={styles.modalSection}>
                <Pressable onPress={() => setSelectedPlanId(null)} style={styles.modalBackRow}>
                  <Ionicons name="arrow-back" size={16} color={colors.primary} />
                  <Text style={[styles.modalBackText, { color: colors.primary }]}>Back to Plans</Text>
                </Pressable>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground, marginTop: 12 }]}>Step 2: Select Day</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {DAYS.map((d) => (
                    <Pressable
                      key={d}
                      style={[styles.modalDayBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                      onPress={() => setSelectedDay(d)}
                    >
                      <Text style={[styles.modalDayText, { color: colors.foreground }]}>{d.slice(0, 3)}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.modalSection}>
                <Pressable onPress={() => setSelectedDay(null)} style={styles.modalBackRow}>
                  <Ionicons name="arrow-back" size={16} color={colors.primary} />
                  <Text style={[styles.modalBackText, { color: colors.primary }]}>Back to Days</Text>
                </Pressable>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground, marginTop: 12 }]}>Step 3: Select Meal</Text>
                {MEALS.map((m) => (
                  <Pressable
                    key={m}
                    style={({ pressed }) => [styles.modalListBtn, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
                    onPress={() => addMealToPlan(m)}
                  >
                    <Ionicons name={MEAL_ICONS[m] as any} size={18} color={colors.mutedForeground} style={{ width: 24 }} />
                    <Text style={[styles.modalListText, { color: colors.foreground, flex: 1 }]}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text>
                    <Ionicons name="add-circle" size={22} color={colors.primary} />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width: "100%",
    height: 340,
    justifyContent: "space-between",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  heroNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  contentWrap: {
    padding: 24,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  titleRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  summary: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
    lineHeight: 24,
  },
  tagScroll: {
    marginBottom: 24,
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 12,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  actionBtnOutline: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    marginBottom: 24,
  },
  timeRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  timeChip: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  timeText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  estimateNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginBottom: 12,
  },
  metaBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  metaItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaVal: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  metaDiv: {
    width: 1,
    height: 24,
    backgroundColor: "#d9d3c7",
  },
  servingsWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },
  servingsControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  servingBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  servingNum: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    minWidth: 70,
    textAlign: "center",
  },
  ingredientsList: {
    marginBottom: 16,
  },
  ingRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  ingAmount: {
    width: 85,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  ingName: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  instructionsList: {
    gap: 20,
    marginBottom: 32,
  },
  stepRow: {
    flexDirection: "row",
    gap: 16,
  },
  stepNumWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNum: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  noteCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    marginBottom: 32,
  },
  noteSection: {
    gap: 6,
  },
  noteHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  noteTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  noteText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  customNoteWrap: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  customNoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  customNoteTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  customNoteDisplay: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 80,
  },
  customNoteText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  customNotePlaceholder: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  customNoteInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlignVertical: "top",
    marginBottom: 12,
  },
  customNoteActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  customNoteBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  customNoteBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  modalSection: {},
  modalLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  modalListBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalListText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  modalBackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  modalBackText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  modalDayBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalDayText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
