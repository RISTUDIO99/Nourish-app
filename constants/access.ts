import { meals as evergreenMeals } from './meals';

export const FREE_PREVIEW_MEAL_ID = 'golden-salmon-bowl';
const EVERGREEN_MEAL_IDS = new Set(evergreenMeals.map((meal) => meal.id));

export const FOUNDER_EXCLUSIVE_MEAL_IDS = new Set([
  'white-bean-herb-stew',
  'turkey-sweet-potato-skillet',
  'sesame-tofu-vegetable-bowl',
  'walnut-pesto-wholegrain-pasta',
  'peach-oat-smoothie',
  'pineapple-flax-smoothie',
  'cherry-kefir-cooler',
]);

export function isFounderExclusiveMeal(mealId: string) {
  return FOUNDER_EXCLUSIVE_MEAL_IDS.has(mealId);
}

export function canAccessMeal(
  mealId: string,
  access: { isPremium: boolean; isFounderDiamond: boolean; isTrial: boolean },
) {
  if (access.isFounderDiamond) return true;
  if (access.isPremium || access.isTrial) return !isFounderExclusiveMeal(mealId);
  return mealId === FREE_PREVIEW_MEAL_ID;
}

// The content feed only accepts meal IDs that do not collide with evergreen IDs.
// This also identifies saved collection snapshots when a feed is unavailable.
export function isRotatingCollectionMeal(mealId: string): boolean {
  return !EVERGREEN_MEAL_IDS.has(mealId);
}

export function canCustomizeMeal(
  mealId: string,
  access: { isPremium: boolean; isFounderDiamond: boolean; isTrial: boolean },
): boolean {
  if (!canAccessMeal(mealId, access)) return false;
  return isRotatingCollectionMeal(mealId)
    ? access.isFounderDiamond
    : access.isPremium || access.isTrial;
}