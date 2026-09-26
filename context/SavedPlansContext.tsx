import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Meal, MealIngredient } from '@/constants/meals';
import { useContentFeed } from '@/context/ContentFeedContext';

const STORAGE_KEY = '@nourish/saved-plans';

function createPlanId(mealId: string, existingPlans: SavedPlan[]) {
  const baseId = `${mealId}-${Date.now()}`;
  let id = baseId;
  let suffix = 1;

  while (existingPlans.some((plan) => plan.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return id;
}

export type SavedPlan = {
  id: string;
  name: string;
  mealId: string;
  mealTitle: string;
  image: string;
  savedAt: string;
  ingredients: MealIngredient[];
  snapshot?: Meal;
};

function isMealIngredient(value: unknown): value is MealIngredient {
  if (!value || typeof value !== 'object') return false;
  const ingredient = value as Record<string, unknown>;
  return (
    typeof ingredient.id === 'string' &&
    typeof ingredient.name === 'string' &&
    typeof ingredient.amount === 'number' &&
    Number.isFinite(ingredient.amount) &&
    typeof ingredient.unit === 'string' &&
    typeof ingredient.calories === 'number' &&
    typeof ingredient.protein === 'number' &&
    typeof ingredient.fiber === 'number'
  );
}

function isMealSnapshot(value: unknown): value is Meal {
  if (!value || typeof value !== 'object') return false;
  const meal = value as Record<string, unknown>;
  const nutrition = meal.nutrition;
  return (
    typeof meal.id === 'string' &&
    (meal.category === 'plan' || meal.category === 'smoothie' || meal.category === 'drink') &&
    typeof meal.title === 'string' &&
    typeof meal.description === 'string' &&
    typeof meal.image === 'string' &&
    typeof meal.prepTime === 'string' &&
    typeof meal.servings === 'number' &&
    Number.isInteger(meal.servings) &&
    meal.servings >= 1 &&
    !!nutrition &&
    typeof nutrition === 'object' &&
    ['calories', 'protein', 'fiber', 'carbs'].every((key) => {
      const amount = (nutrition as Record<string, unknown>)[key];
      return typeof amount === 'number' && Number.isFinite(amount) && amount >= 0;
    }) &&
    Array.isArray(meal.ingredients) &&
    meal.ingredients.length > 0 &&
    meal.ingredients.every(isMealIngredient) &&
    Array.isArray(meal.instructions) &&
    meal.instructions.length > 0 &&
    meal.instructions.every((instruction) => typeof instruction === 'string' && instruction.trim().length > 0)
  );
}

function isSavedPlan(value: unknown): value is SavedPlan {
  if (!value || typeof value !== 'object') return false;
  const plan = value as Record<string, unknown>;
  return (
    typeof plan.id === 'string' &&
    typeof plan.name === 'string' &&
    typeof plan.mealId === 'string' &&
    typeof plan.mealTitle === 'string' &&
    typeof plan.image === 'string' &&
    typeof plan.savedAt === 'string' &&
    Array.isArray(plan.ingredients) &&
    plan.ingredients.every(isMealIngredient) &&
    (plan.snapshot === undefined || isMealSnapshot(plan.snapshot))
  );
}

type SavedPlansContextValue = {
  plans: SavedPlan[];
  isLoaded: boolean;
  savePlan: (plan: Omit<SavedPlan, 'id' | 'savedAt'>) => Promise<void>;
  updatePlan: (id: string, plan: Omit<SavedPlan, 'id' | 'savedAt'>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
};

const SavedPlansContext = createContext<SavedPlansContextValue | null>(null);

export function SavedPlansProvider({ children }: { children: React.ReactNode }) {
  const { meals } = useContentFeed();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const plansRef = useRef<SavedPlan[]>([]);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          const storedPlans = Array.isArray(parsed) ? parsed.filter(isSavedPlan) : [];
          plansRef.current = storedPlans;
          setPlans(storedPlans);
        }
      })
      .catch((error) => console.warn('Unable to load saved Nourish plans.', error))
      .finally(() => setIsLoaded(true));
  }, []);

  const persist = useCallback(async (nextPlans: SavedPlan[]) => {
    const previousPlans = plansRef.current;
    plansRef.current = nextPlans;
    setPlans(nextPlans);
    writeQueueRef.current = writeQueueRef.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextPlans)));
    try {
      await writeQueueRef.current;
    } catch (error) {
      if (plansRef.current === nextPlans) {
        plansRef.current = previousPlans;
        setPlans(previousPlans);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const mealById = new Map(meals.map((meal) => [meal.id, meal]));
    const migratedPlans = plansRef.current.map((plan) => {
      if (plan.snapshot) return plan;
      const originalMeal = mealById.get(plan.mealId);
      return originalMeal ? { ...plan, snapshot: originalMeal } : plan;
    });
    if (migratedPlans.some((plan, index) => plan !== plansRef.current[index])) {
      void persist(migratedPlans).catch((error) => console.warn('Unable to migrate saved Nourish plan details.', error));
    }
  }, [isLoaded, meals, persist]);

  const savePlan = useCallback(
    async (plan: Omit<SavedPlan, 'id' | 'savedAt'>) => {
      if (!isLoaded) {
        throw new Error('Saved plans are still loading.');
      }
      const savedPlan: SavedPlan = {
        ...plan,
        id: createPlanId(plan.mealId, plansRef.current),
        savedAt: new Date().toISOString(),
      };
      await persist([savedPlan, ...plansRef.current]);
    },
    [isLoaded, persist],
  );

  const updatePlan = useCallback(
    async (id: string, plan: Omit<SavedPlan, 'id' | 'savedAt'>) => {
      if (!isLoaded) {
        throw new Error('Saved plans are still loading.');
      }
      const existingPlan = plansRef.current.find((savedPlan) => savedPlan.id === id);
      if (!existingPlan) {
        throw new Error('Saved plan could not be found.');
      }
      const updatedPlan: SavedPlan = {
        ...existingPlan,
        ...plan,
        id: existingPlan.id,
        savedAt: new Date().toISOString(),
      };
      await persist(plansRef.current.map((savedPlan) => (savedPlan.id === id ? updatedPlan : savedPlan)));
    },
    [isLoaded, persist],
  );

  const deletePlan = useCallback(
    async (id: string) => {
      if (!isLoaded) {
        throw new Error('Saved plans are still loading.');
      }
      await persist(plansRef.current.filter((plan) => plan.id !== id));
    },
    [isLoaded, persist],
  );

  const value = useMemo(
    () => ({ plans, isLoaded, savePlan, updatePlan, deletePlan }),
    [plans, isLoaded, savePlan, updatePlan, deletePlan],
  );

  return <SavedPlansContext.Provider value={value}>{children}</SavedPlansContext.Provider>;
}

export function useSavedPlans() {
  const context = useContext(SavedPlansContext);
  if (!context) {
    throw new Error('useSavedPlans must be used inside SavedPlansProvider');
  }
  return context;
}
