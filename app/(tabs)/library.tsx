import { useCallback } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { categoryLabels, meals, type Meal, type MealCategory } from '@/constants/meals';
import { useSubscription } from '@/lib/revenuecat';
import { useTrial } from '@/lib/trial';
import { canAccessMeal, isFounderExclusiveMeal } from '@/constants/access';
import * as Haptics from 'expo-haptics';

const categories: MealCategory[] = ['plan', 'smoothie', 'drink'];

async function giveFeedback() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function MealCard({ meal, locked, lockLabel }: { meal: Meal; locked: boolean; lockLabel: string }) {
  const colors = useColors();

  const openMeal = useCallback(async () => {
    await giveFeedback();
    if (locked) {
      router.push('/paywall');
      return;
    }
    router.push({ pathname: '/meal/[id]', params: { id: meal.id } } as never);
  }, [locked, meal.id]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${meal.title}`}
      testID={`meal-card-${meal.id}`}
      onPress={openMeal}
      style={({ pressed }) => [styles.mealCard, { backgroundColor: colors.card }, pressed && styles.cardPressed]}
    >
      <View style={styles.mealImageWrap}>
        <Image source={{ uri: meal.image }} style={styles.mealImage} resizeMode="cover" />
        {locked ? (
          <View style={[styles.lockBadge, { backgroundColor: colors.primary }]}>
            <Feather name="lock" size={13} color={colors.primaryForeground} />
            <Text style={[styles.lockBadgeText, { color: colors.primaryForeground }]}>{lockLabel}</Text>
          </View>
        ) : null}
        <View style={[styles.imageBadge, { backgroundColor: colors.card }]}>
          <Text style={[styles.imageBadgeText, { color: colors.primary }]}>{meal.prepTime}</Text>
        </View>
      </View>
      <View style={styles.mealCardBody}>
        <Text style={[styles.mealCardTitle, { color: colors.cardForeground }]}>{meal.title}</Text>
        <Text style={[styles.mealCardDescription, { color: colors.mutedForeground }]} numberOfLines={2}>
          {meal.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.cardCalories, { color: colors.primary }]}>
            {meal.nutrition.calories} kcal · {meal.servings} {meal.servings === 1 ? 'serving' : 'servings'}
          </Text>
          <View style={[styles.cardArrow, { backgroundColor: colors.secondary }]}>
            <Feather name="arrow-up-right" size={15} color={colors.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function SectionHeader({
  category,
  title,
  description,
}: {
  category: MealCategory;
  title: string;
  description: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderTop}>
        <View style={styles.sectionTitleWrap}>
          <Text style={[styles.sectionKicker, { color: colors.accent }]}>{categoryLabels[category]}</Text>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
        </View>
        <Feather
          name={category === 'plan' ? 'book-open' : category === 'smoothie' ? 'sun' : 'droplet'}
          size={22}
          color={colors.primary}
        />
      </View>
      <Text style={[styles.sectionDescription, { color: colors.mutedForeground }]}>{description}</Text>
    </View>
  );
}

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { access } = useSubscription();
  const { isActive: activeTrial } = useTrial();
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInset + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.kicker, { color: colors.accent }]}>YOUR RECIPES</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Nourish Library</Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              Anti-inflammatory meals and healing drinks for every kind of day.
            </Text>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Feather name="book-open" size={24} color={colors.primary} />
          </View>
        </View>

        {categories.map((category) => {
          const categoryMeals = meals.filter((meal) => meal.category === category);
          const title =
            category === 'plan'
              ? 'Complete plans for real life'
              : category === 'smoothie'
                ? 'Blend something bright'
                : 'Small rituals, big comfort';
          const description =
            category === 'plan'
              ? 'Flexible recipes with ingredients, nutrition, and a clear path from prep to plate.'
              : category === 'smoothie'
                ? 'Image-led blends with gentle energy and easy ingredient swaps.'
                : 'Hydrating and warming pours for steadier, softer days.';
          return (
            <View key={category} style={styles.categorySection}>
              <SectionHeader category={category} title={title} description={description} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
                decelerationRate="fast"
                snapToInterval={296}
              >
                {categoryMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    locked={!canAccessMeal(meal.id, {
                      isPremium: access.isPremium,
                      isFounderDiamond: access.isFounderDiamond,
                      isTrial: activeTrial,
                    })}
                    lockLabel={isFounderExclusiveMeal(meal.id) ? 'Founder' : 'Premium'}
                  />
                ))}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 10, paddingHorizontal: 22 },
  headerCopy: { flex: 1, gap: 7 },
  kicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  title: { fontSize: 32, lineHeight: 37, fontWeight: '600', letterSpacing: -0.7 },
  description: { fontSize: 14, lineHeight: 20, maxWidth: 300 },
  headerIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  categorySection: { marginTop: 32 },
  sectionHeader: { paddingHorizontal: 22, gap: 8 },
  sectionHeaderTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  sectionTitleWrap: { gap: 5, flex: 1 },
  sectionKicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 21, lineHeight: 27, fontWeight: '600' },
  sectionDescription: { fontSize: 13, lineHeight: 19, maxWidth: 340 },
  cardsRow: { gap: 14, paddingHorizontal: 22, paddingTop: 15, paddingRight: 8 },
  mealCard: { width: 282, borderRadius: 20, overflow: 'hidden', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  mealImageWrap: { height: 171, position: 'relative' },
  mealImage: { width: '100%', height: '100%' },
  imageBadge: { position: 'absolute', top: 12, right: 12, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  imageBadgeText: { fontSize: 10, fontWeight: '700' },
  lockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  lockBadgeText: { fontSize: 10, fontWeight: '700' },
  mealCardBody: { padding: 15, gap: 7 },
  mealCardTitle: { fontSize: 17, fontWeight: '600' },
  mealCardDescription: { fontSize: 12.5, lineHeight: 18, minHeight: 36 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 },
  cardCalories: { fontSize: 10.5, fontWeight: '600' },
  cardArrow: { width: 29, height: 29, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});