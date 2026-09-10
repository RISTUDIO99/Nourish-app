import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { getMealById, meals, type MealIngredient } from '@/constants/meals';
import { useSavedPlans } from '@/context/SavedPlansContext';
import { canAccessMeal, isFounderExclusiveMeal } from '@/constants/access';
import { useSubscription } from '@/lib/revenuecat';
import { useTrial } from '@/lib/trial';

function formatAmount(amount: number) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(/0$/, '');
}

export default function MealDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const { id, savedId } = useLocalSearchParams<{ id: string; savedId?: string }>();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const selectedMeal = getMealById(id);
  const meal = selectedMeal ?? meals[0];
  const { access, isLoading: isSubscriptionLoading } = useSubscription();
  const { isActive: activeTrial, isLoading: isTrialLoading } = useTrial();
  const hasPremiumAccess = access.isPremium || activeTrial;
  const requiresFounder = isFounderExclusiveMeal(meal.id);
  const canOpenMeal = canAccessMeal(meal.id, {
    isPremium: access.isPremium,
    isFounderDiamond: access.isFounderDiamond,
    isTrial: activeTrial,
  });
  const canCustomize = canOpenMeal && hasPremiumAccess;
  const isContentLocked = !canOpenMeal;
  const { plans, isLoaded, savePlan, updatePlan } = useSavedPlans();
  const savedPlan = savedId ? plans.find((plan) => plan.id === savedId) : undefined;
  const [ingredients, setIngredients] = useState<MealIngredient[]>(savedPlan?.ingredients ?? meal.ingredients);
  const [showPreparation, setShowPreparation] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [planName, setPlanName] = useState(savedPlan?.name ?? `${meal.title} · my way`);
  const [savedPlanHydrated, setSavedPlanHydrated] = useState(!savedId);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientAmount, setNewIngredientAmount] = useState('1');
  const [newIngredientUnit, setNewIngredientUnit] = useState('serving');

  const baseAmounts = useMemo(
    () => new Map(meal.ingredients.map((ingredient) => [ingredient.id, ingredient.amount])),
    [meal.ingredients],
  );

  const nutrition = useMemo(() => {
    return ingredients.reduce(
      (total, ingredient) => {
        const baseAmount = baseAmounts.get(ingredient.id) ?? ingredient.amount;
        const ratio = baseAmount > 0 ? ingredient.amount / baseAmount : 1;
        return {
          calories: total.calories + ingredient.calories * ratio,
          protein: total.protein + ingredient.protein * ratio,
          fiber: total.fiber + ingredient.fiber * ratio,
        };
      },
      { calories: 0, protein: 0, fiber: 0 },
    );
  }, [baseAmounts, ingredients]);

  useEffect(() => {
    if (!savedId || savedPlanHydrated || !isLoaded) return;
    if (savedPlan) {
      setIngredients(savedPlan.ingredients);
      setPlanName(savedPlan.name);
    }
    setSavedPlanHydrated(true);
  }, [isLoaded, savedId, savedPlan, savedPlanHydrated]);

  useEffect(() => {
    if (authLoaded && !isSignedIn) router.replace('/(auth)/welcome');
  }, [authLoaded, isSignedIn]);

  function adjustIngredient(ingredientId: string, change: number) {
    Haptics.selectionAsync();
    setIngredients((current) =>
      current.map((ingredient) => {
        if (ingredient.id !== ingredientId) return ingredient;
        const nextAmount = Math.max(0.25, Math.round((ingredient.amount + change) * 4) / 4);
        return { ...ingredient, amount: nextAmount };
      }),
    );
  }

  function removeIngredient(ingredientId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIngredients((current) => current.filter((ingredient) => ingredient.id !== ingredientId));
  }

  function handleAddIngredient() {
    const name = newIngredientName.trim();
    const amount = Number.parseFloat(newIngredientAmount);
    if (!name || !Number.isFinite(amount) || amount <= 0) return;
    const ingredient: MealIngredient = {
      id: `custom-${Date.now()}`,
      name,
      amount,
      unit: newIngredientUnit.trim() || 'serving',
      calories: 25,
      protein: 1,
      fiber: 1,
    };
    setIngredients((current) => [...current, ingredient]);
    setNewIngredientName('');
    setNewIngredientAmount('1');
    setNewIngredientUnit('serving');
    setShowAddModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleSave() {
    const trimmedName = planName.trim();
    if (!trimmedName) return;
    const plan = {
      name: trimmedName,
      mealId: meal.id,
      mealTitle: meal.title,
      image: meal.image,
      ingredients,
    };
    if (savedPlan) {
      await updatePlan(savedPlan.id, plan);
    } else {
      await savePlan(plan);
    }
    setShowSaveModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/(tabs)/saved' as never);
  }

  if (!authLoaded || !isSignedIn) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="user" size={30} color={colors.primary} />
        <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>Opening your Nourish account…</Text>
      </View>
    );
  }

  if (savedId && !savedPlanHydrated) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="bookmark" size={32} color={colors.primary} />
        <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>Restoring your saved plan…</Text>
        <Text style={[styles.loadingDescription, { color: colors.mutedForeground }]}>
          Your ingredient changes are loading from this device.
        </Text>
      </View>
    );
  }

  if (isSubscriptionLoading || isTrialLoading) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="loader" size={30} color={colors.primary} />
        <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>Checking your Nourish access…</Text>
      </View>
    );
  }

  if (isContentLocked || (savedId && !canCustomize)) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <View style={[styles.lockedIcon, { backgroundColor: colors.secondary }]}>
          <Feather name="lock" size={26} color={colors.primary} />
        </View>
        <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>
          {requiresFounder
            ? 'This recipe is reserved for Founder Diamond.'
            : savedId
              ? 'Premium access opens your saved plans.'
              : 'This recipe is in the Nourish library.'}
        </Text>
        <Text style={[styles.loadingDescription, { color: colors.mutedForeground }]}>
          {requiresFounder
            ? 'Founder Diamond includes the complete 10-plan collection, two additional smoothies, one additional drink, and Legacy Room access.'
            : savedId
            ? 'Your saved plan is still here. Restore your purchase or choose Premium to open and edit it.'
            : 'Restore your purchase or choose a Nourish membership to continue.'}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View Nourish membership options"
          testID="locked-meal-paywall"
          onPress={() => router.push('/paywall')}
          style={[styles.lockedButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.lockedButtonText, { color: colors.primaryForeground }]}>View membership options</Text>
          <Feather name="arrow-right" size={17} color={colors.primaryForeground} />
        </Pressable>
      </View>
    );
  }

  if (!selectedMeal || (savedId && isLoaded && !savedPlan)) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="search" size={34} color={colors.primary} />
        <Text style={[styles.notFoundTitle, { color: colors.foreground }]}>
          We couldn&apos;t find that {savedId ? 'saved plan' : 'recipe'}.
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.backButton, { borderColor: colors.primary }]}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 36 }}
      >
          <View style={styles.heroImageWrap}>
          <Image source={{ uri: meal.image }} style={styles.heroImage} resizeMode="cover" />
            <View style={[styles.imageShade, { backgroundColor: `${colors.primary}88` }]} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            testID="meal-detail-back"
            onPress={() => router.back()}
            style={[styles.floatingButton, { top: topInset + 10, backgroundColor: `${colors.card}E8` }]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          <View style={styles.heroImageCopy}>
            <View style={[styles.categoryPill, { backgroundColor: colors.accent }]}>
              <Text style={[styles.categoryPillText, { color: colors.accentForeground }]}>
                {meal.category === 'plan' ? 'Complete meal plan' : meal.category === 'smoothie' ? 'Smoothie' : 'Healthy drink'}
              </Text>
            </View>
            <Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>{meal.title}</Text>
            <Text style={[styles.heroDescription, { color: colors.primaryForeground }]}>{meal.description}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {savedPlan ? (
            <View style={[styles.savedVersionBanner, { backgroundColor: colors.secondary }]}>
              <Feather name="bookmark" size={15} color={colors.primary} />
              <Text style={[styles.savedVersionText, { color: colors.primary }]}>Saved as “{savedPlan.name}”</Text>
            </View>
          ) : null}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={17} color={colors.primary} />
              <View>
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Prep</Text>
                <Text style={[styles.metaValue, { color: colors.foreground }]}>{meal.prepTime}</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <Feather name="users" size={17} color={colors.primary} />
              <View>
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Makes</Text>
                <Text style={[styles.metaValue, { color: colors.foreground }]}>{meal.servings} {meal.servings === 1 ? 'serving' : 'servings'}</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <Feather name="edit-3" size={17} color={colors.primary} />
              <View>
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Your version</Text>
                <Text style={[styles.metaValue, { color: colors.foreground }]}>Flexible</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View>
                <Text style={[styles.sectionKicker, { color: colors.accent }]}>WHAT YOU&apos;LL NEED</Text>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Make it yours.</Text>
              </View>
              <Text style={[styles.ingredientHint, { color: colors.mutedForeground }]}>
                {canCustomize ? 'Tap − / + to adjust' : 'Premium members can customize'}
              </Text>
            </View>

            <View style={styles.ingredientList}>
              {ingredients.map((ingredient) => (
                <View
                  key={ingredient.id}
                  testID={`ingredient-row-${ingredient.id}`}
                  style={[styles.ingredientRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={[styles.ingredientDot, { backgroundColor: `${colors.accent}30` }]}>
                    <Feather name="check" size={13} color={colors.primary} />
                  </View>
                  <View style={styles.ingredientCopy}>
                    <Text style={[styles.ingredientName, { color: colors.cardForeground }]}>{ingredient.name}</Text>
                    <Text style={[styles.ingredientQuantity, { color: colors.mutedForeground }]}>
                      {formatAmount(ingredient.amount)} {ingredient.unit}
                    </Text>
                  </View>
                  {canCustomize ? <View style={styles.quantityControls}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Decrease ${ingredient.name}`}
                      testID={`decrease-${ingredient.id}`}
                      onPress={() => adjustIngredient(ingredient.id, -0.25)}
                      style={[styles.quantityButton, { borderColor: colors.border }]}
                    >
                      <Feather name="minus" size={14} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Increase ${ingredient.name}`}
                      testID={`increase-${ingredient.id}`}
                      onPress={() => adjustIngredient(ingredient.id, 0.25)}
                      style={[styles.quantityButton, { backgroundColor: colors.secondary }]}
                    >
                      <Feather name="plus" size={14} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${ingredient.name}`}
                      testID={`remove-${ingredient.id}`}
                      onPress={() => removeIngredient(ingredient.id)}
                      style={styles.removeButton}
                    >
                      <Feather name="x" size={15} color={colors.mutedForeground} />
                    </Pressable>
                  </View> : null}
                </View>
              ))}
            </View>

            {canCustomize ? <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add an ingredient"
              testID="add-ingredient"
              onPress={() => setShowAddModal((visible) => !visible)}
              style={[styles.addIngredientButton, { borderColor: colors.primary }]}
            >
              <View style={[styles.addIngredientIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="plus" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.addIngredientText, { color: colors.primary }]}>
                {showAddModal ? 'Close ingredient form' : 'Add an ingredient'}
              </Text>
            </Pressable> : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Unlock Premium recipe customization"
                testID="unlock-premium-customization"
                onPress={() => router.push('/paywall')}
                style={[styles.proUpsell, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              >
                <Feather name="sliders" size={18} color={colors.primary} />
                <View style={styles.proUpsellCopy}>
                  <Text style={[styles.proUpsellTitle, { color: colors.foreground }]}>Make it yours with Premium</Text>
                  <Text style={[styles.proUpsellText, { color: colors.mutedForeground }]}>
                    Adjust amounts, swap ingredients, and save a named version.
                  </Text>
                </View>
                <Feather name="arrow-right" size={17} color={colors.primary} />
              </Pressable>
            )}

            {canCustomize && showAddModal ? (
              <View style={[styles.inlineIngredientEditor, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={[styles.modalKicker, { color: colors.accent }]}>CUSTOM INGREDIENT</Text>
                    <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add to this recipe</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close add ingredient form"
                    testID="close-add-ingredient-modal"
                    onPress={() => setShowAddModal(false)}
                    style={styles.modalClose}
                  >
                    <Feather name="x" size={20} color={colors.mutedForeground} />
                  </Pressable>
                </View>
                <Text style={[styles.modalDescription, { color: colors.mutedForeground }]}>
                  Add a personal swap, topper, or pantry staple to your version.
                </Text>
                <TextInput
                  accessibilityLabel="Ingredient name"
                  testID="ingredient-name-input"
                  value={newIngredientName}
                  onChangeText={setNewIngredientName}
                  placeholder="e.g. Toasted pumpkin seeds"
                  placeholderTextColor={colors.mutedForeground}
                  autoFocus
                  style={[styles.planNameInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                />
                <View style={styles.addIngredientFields}>
                  <TextInput
                    accessibilityLabel="Ingredient amount"
                    testID="ingredient-amount-input"
                    value={newIngredientAmount}
                    onChangeText={setNewIngredientAmount}
                    placeholder="1"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="decimal-pad"
                    style={[styles.smallInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  />
                  <TextInput
                    accessibilityLabel="Ingredient unit"
                    testID="ingredient-unit-input"
                    value={newIngredientUnit}
                    onChangeText={setNewIngredientUnit}
                    placeholder="serving"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.unitInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                    returnKeyType="done"
                    onSubmitEditing={handleAddIngredient}
                  />
                </View>
                <View style={styles.modalActions}>
                  <Pressable onPress={() => setShowAddModal(false)} style={[styles.cancelButton, { borderColor: colors.border }]}>
                    <Text style={[styles.cancelButtonText, { color: colors.foreground }]}>Not now</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    testID="confirm-add-ingredient"
                    onPress={handleAddIngredient}
                    style={[styles.modalSaveButton, { backgroundColor: colors.primary }]}
                  >
                    <Text style={[styles.modalSaveButtonText, { color: colors.primaryForeground }]}>Add ingredient</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {canCustomize ? (
              <Text style={[styles.nutritionNote, { color: colors.mutedForeground }]}>
                Added ingredients use a small nutrition estimate until you fine-tune your version.
              </Text>
            ) : null}
          </View>

          <View style={[styles.nutritionCard, { backgroundColor: colors.primary }]}>
            <View style={styles.nutritionHeader}>
              <View>
                <Text style={[styles.nutritionKicker, { color: colors.accent }]}>WHOLE RECIPE · ADJUSTED</Text>
                <Text style={[styles.nutritionTitle, { color: colors.primaryForeground }]}>Nourishment at a glance</Text>
              </View>
              <Feather name="activity" size={21} color={colors.accent} />
            </View>
            <View style={styles.nutritionStats}>
              <View style={styles.nutritionStat}>
                <Text style={[styles.nutritionValue, { color: colors.primaryForeground }]}>{Math.round(nutrition.calories)}</Text>
                <Text style={[styles.nutritionLabel, { color: colors.primaryForeground }]}>kcal</Text>
              </View>
              <View style={styles.nutritionStat}>
                <Text style={[styles.nutritionValue, { color: colors.primaryForeground }]}>{Math.round(nutrition.protein)}g</Text>
                <Text style={[styles.nutritionLabel, { color: colors.primaryForeground }]}>protein</Text>
              </View>
              <View style={styles.nutritionStat}>
                <Text style={[styles.nutritionValue, { color: colors.primaryForeground }]}>{Math.round(nutrition.fiber)}g</Text>
                <Text style={[styles.nutritionLabel, { color: colors.primaryForeground }]}>fibre</Text>
              </View>
            </View>
            <Text style={[styles.nutritionFootnote, { color: colors.primaryForeground }]}>
              Whole-recipe estimate for the ingredients shown · nutrition is a guide, not medical advice.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPreparation ? 'Hide preparation steps' : 'Show how to prepare'}
            testID="how-to-prepare"
            onPress={() => setShowPreparation((visible) => !visible)}
            style={[styles.prepareButton, { borderColor: colors.primary }]}
          >
            <View style={[styles.prepareIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="book-open" size={18} color={colors.primary} />
            </View>
            <View style={styles.prepareCopy}>
              <Text style={[styles.prepareTitle, { color: colors.foreground }]}>How to prepare</Text>
              <Text style={[styles.prepareSubtitle, { color: colors.mutedForeground }]}>
                {showPreparation ? 'Tap to tuck the steps away' : `${meal.instructions.length} simple steps`}
              </Text>
            </View>
            <Feather name={showPreparation ? 'chevron-up' : 'chevron-down'} size={19} color={colors.primary} />
          </Pressable>

          {showPreparation ? (
            <View style={[styles.instructionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {meal.instructions.map((instruction, index) => (
                <View key={instruction} style={styles.instructionRow}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.stepNumberText, { color: colors.accentForeground }]}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.instructionText, { color: colors.cardForeground }]}>{instruction}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              canCustomize
                ? savedPlan
                  ? 'Update saved plan'
                  : 'Save my version of this plan'
                : 'Unlock Premium to save a named plan'
            }
            accessibilityState={{ disabled: canCustomize && !isLoaded }}
            testID="save-plan"
            disabled={canCustomize && !isLoaded}
            onPress={() => canCustomize ? setShowSaveModal(true) : router.push('/paywall')}
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: colors.accent },
              canCustomize && !isLoaded && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            <Feather name="bookmark" size={18} color={colors.accentForeground} />
            <Text style={[styles.saveButtonText, { color: colors.accentForeground }]}>
              {!canCustomize
                ? 'Unlock Premium to save this plan'
                : isLoaded
                  ? savedPlan
                    ? 'Update saved plan'
                    : 'Save my version'
                  : 'Loading your library…'}
            </Text>
          </Pressable>
          <Text style={[styles.saveHint, { color: colors.mutedForeground }]}>
            {canCustomize
              ? 'Your ingredients and quantities stay on this device.'
              : 'Named saved plans are included with Premium and Founder Diamond access.'}
          </Text>
        </View>
      </ScrollView>

      <Modal visible={showSaveModal} transparent animationType="slide" onRequestClose={() => setShowSaveModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: `${colors.foreground}55` }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHandle, { backgroundColor: `${colors.foreground}30` }]} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalKicker, { color: colors.accent }]}>
                  {savedPlan ? 'UPDATE THIS VERSION' : 'KEEP THIS VERSION'}
                </Text>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  {savedPlan ? 'Update your plan' : 'Name your plan'}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close save plan dialog"
                testID="close-save-modal"
                onPress={() => setShowSaveModal(false)}
                style={styles.modalClose}
              >
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <Text style={[styles.modalDescription, { color: colors.mutedForeground }]}>
              {savedPlan
                ? 'Rename this version if you like. Your ingredient changes will replace the saved plan.'
                : 'Give your adjusted recipe a name so it&apos;s easy to find in Saved.'}
            </Text>
            <TextInput
              accessibilityLabel="Plan name"
              testID="plan-name-input"
              value={planName}
              onChangeText={setPlanName}
              placeholder="e.g. Gentle Tuesday bowl"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              style={[styles.planNameInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setShowSaveModal(false)} style={[styles.cancelButton, { borderColor: colors.border }]}>
                <Text style={[styles.cancelButtonText, { color: colors.foreground }]}>Not now</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                testID="confirm-save-plan"
                onPress={handleSave}
                style={[styles.modalSaveButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.modalSaveButtonText, { color: colors.primaryForeground }]}>
                  {savedPlan ? 'Update plan' : 'Save plan'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  heroImageWrap: { height: 355, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  imageShade: { ...StyleSheet.absoluteFillObject },
  floatingButton: { position: 'absolute', left: 20, width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  heroImageCopy: { position: 'absolute', left: 22, right: 22, bottom: 26, gap: 9 },
  categoryPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99 },
  categoryPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
  heroTitle: { fontSize: 34, lineHeight: 38, fontWeight: '600', letterSpacing: -0.7 },
  heroDescription: { opacity: 0.78, fontSize: 14, lineHeight: 20, maxWidth: 350 },
  content: { padding: 22, gap: 22 },
  savedVersionBanner: { minHeight: 40, borderRadius: 14, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  savedVersionText: { flex: 1, fontSize: 12, fontWeight: '600' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaLabel: { fontSize: 10 },
  metaValue: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  section: { gap: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  sectionKicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  sectionTitle: { fontSize: 25, lineHeight: 30, fontWeight: '600', marginTop: 5 },
  ingredientHint: { fontSize: 10, marginBottom: 3 },
  ingredientList: { gap: 9 },
  ingredientRow: { minHeight: 68, borderWidth: 1, borderRadius: 17, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 },
  ingredientDot: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  ingredientCopy: { flex: 1, gap: 3 },
  ingredientName: { fontSize: 13, fontWeight: '600' },
  ingredientQuantity: { fontSize: 11 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  quantityButton: { width: 27, height: 27, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  removeButton: { width: 25, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 1 },
  nutritionNote: { fontSize: 11, lineHeight: 16, paddingHorizontal: 2 },
  addIngredientButton: { minHeight: 48, borderWidth: 1, borderRadius: 16, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addIngredientIcon: { width: 27, height: 27, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  addIngredientText: { fontSize: 12.5, fontWeight: '700' },
  inlineIngredientEditor: { borderWidth: 1, borderRadius: 18, padding: 18, gap: 15 },
  nutritionCard: { borderRadius: 21, padding: 18, gap: 18 },
  nutritionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nutritionKicker: { fontSize: 9, fontWeight: '700', letterSpacing: 1.3 },
  nutritionTitle: { fontSize: 17, fontWeight: '600', marginTop: 5 },
  nutritionStats: { flexDirection: 'row', gap: 30 },
  nutritionStat: { gap: 2 },
  nutritionValue: { fontSize: 22, fontWeight: '700' },
  nutritionLabel: { opacity: 0.62, fontSize: 10 },
  nutritionFootnote: { opacity: 0.62, fontSize: 10.5, lineHeight: 15 },
  prepareButton: { minHeight: 70, borderWidth: 1, borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 11 },
  prepareIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  prepareCopy: { flex: 1, gap: 3 },
  prepareTitle: { fontSize: 15, fontWeight: '600' },
  prepareSubtitle: { fontSize: 11 },
  instructionsCard: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 15, marginTop: -9 },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNumber: { width: 25, height: 25, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: 11, fontWeight: '700' },
  instructionText: { flex: 1, fontSize: 13, lineHeight: 19, paddingTop: 2 },
  saveButton: { minHeight: 55, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  saveButtonText: { fontSize: 14, fontWeight: '700' },
  saveHint: { textAlign: 'center', fontSize: 10.5, marginTop: -12 },
  buttonPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  buttonDisabled: { opacity: 0.55 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  notFoundTitle: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  loadingDescription: { fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 280 },
  backButton: { minHeight: 46, borderWidth: 1, borderRadius: 23, paddingHorizontal: 20, justifyContent: 'center' },
  backButtonText: { fontSize: 14, fontWeight: '700' },
  lockedIcon: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  lockedButton: {
    minHeight: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  lockedButtonText: { fontSize: 14, fontWeight: '700' },
  proUpsell: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: 17,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  proUpsellCopy: { flex: 1, gap: 3 },
  proUpsellTitle: { fontSize: 13.5, fontWeight: '700' },
  proUpsellText: { fontSize: 11.5, lineHeight: 16 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 30, gap: 14 },
  modalHandle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, marginBottom: 4 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalKicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  modalTitle: { fontSize: 25, fontWeight: '600', marginTop: 5 },
  modalClose: { padding: 4 },
  modalDescription: { fontSize: 13, lineHeight: 19 },
  planNameInput: { minHeight: 52, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, fontSize: 15 },
  addIngredientFields: { flexDirection: 'row', gap: 10 },
  smallInput: { width: 84, minHeight: 52, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, fontSize: 15 },
  unitInput: { flex: 1, minHeight: 52, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 3 },
  cancelButton: { flex: 1, minHeight: 50, borderWidth: 1, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { fontSize: 13, fontWeight: '600' },
  modalSaveButton: { flex: 1.3, minHeight: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  modalSaveButtonText: { fontSize: 13, fontWeight: '700' },
});
