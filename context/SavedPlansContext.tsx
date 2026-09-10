import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { MealIngredient } from '@/constants/meals';

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
};

type SavedPlansContextValue = {
  plans: SavedPlan[];
  isLoaded: boolean;
  savePlan: (plan: Omit<SavedPlan, 'id' | 'savedAt'>) => Promise<void>;
  updatePlan: (id: string, plan: Omit<SavedPlan, 'id' | 'savedAt'>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
};

const SavedPlansContext = createContext<SavedPlansContextValue | null>(null);

export function SavedPlansProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const plansRef = useRef<SavedPlan[]>([]);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const storedPlans = JSON.parse(stored) as SavedPlan[];
          plansRef.current = storedPlans;
          setPlans(storedPlans);
        }
      })
      .catch((error) => console.warn('Unable to load saved Nourish plans.', error))
      .finally(() => setIsLoaded(true));
  }, []);

  const persist = useCallback(async (nextPlans: SavedPlan[]) => {
    plansRef.current = nextPlans;
    setPlans(nextPlans);
    writeQueueRef.current = writeQueueRef.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextPlans)));
    await writeQueueRef.current;
  }, []);

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
