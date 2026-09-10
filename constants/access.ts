export const FREE_PREVIEW_MEAL_ID = 'golden-salmon-bowl';

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