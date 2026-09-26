import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getGetContentFeedQueryKey,
  useGetContentFeed,
  type ContentCollection,
  type ContentFeed,
} from '@/lib/api-client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { meals as evergreenMeals, type Meal } from '@/constants/meals';
import { useTrial } from '@/lib/trial';

const STORAGE_KEY = '@nourish/content-feed-v1';
const CACHE_VERSION = 1;
const FEED_STALE_TIME = 5 * 60 * 1000;

type ContentContextValue = {
  feed: ContentFeed | null;
  meals: Meal[];
  featuredMeals: Meal[];
  isUsingCachedFeed: boolean;
  refresh: () => Promise<void>;
};

const ContentContext = createContext<ContentContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isUri(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\/\S+$/.test(value);
}

function isMeal(value: unknown): value is Meal {
  if (!isRecord(value)) return false;
  const nutrition = value.nutrition;
  return (
    isNonEmptyString(value.id) &&
    (value.category === 'plan' || value.category === 'smoothie' || value.category === 'drink') &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description) &&
    isUri(value.image) &&
    isNonEmptyString(value.prepTime) &&
    typeof value.servings === 'number' &&
    Number.isInteger(value.servings) &&
    value.servings >= 1 &&
    isRecord(nutrition) &&
    isNonNegativeNumber(nutrition.calories) &&
    isNonNegativeNumber(nutrition.protein) &&
    isNonNegativeNumber(nutrition.fiber) &&
    isNonNegativeNumber(nutrition.carbs) &&
    Array.isArray(value.ingredients) &&
    value.ingredients.length > 0 &&
    value.ingredients.every(
      (ingredient) =>
        isRecord(ingredient) &&
        isNonEmptyString(ingredient.id) &&
        isNonEmptyString(ingredient.name) &&
        isNonNegativeNumber(ingredient.amount) &&
        isNonEmptyString(ingredient.unit) &&
        isNonNegativeNumber(ingredient.calories) &&
        isNonNegativeNumber(ingredient.protein) &&
        isNonNegativeNumber(ingredient.fiber),
    ) &&
    Array.isArray(value.instructions) &&
    value.instructions.length > 0 &&
    value.instructions.every(isNonEmptyString)
  );
}

function isDateTime(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isCollection(value: unknown): value is ContentCollection {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    value.status === 'approved' &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description) &&
    isDateTime(value.startsAt) &&
    isDateTime(value.endsAt) &&
    Date.parse(value.startsAt as string) < Date.parse(value.endsAt as string) &&
    Array.isArray(value.meals) &&
    value.meals.length > 0 &&
    value.meals.every(isMeal)
  );
}

function validateFeed(value: unknown): ContentFeed | null {
  if (!isRecord(value) || !isDateTime(value.serverNow)) return null;
  if (value.featured !== null && !isCollection(value.featured)) return null;
  if (!Array.isArray(value.archive) || !value.archive.every(isCollection)) return null;

  const now = Date.parse(value.serverNow);
  const featured =
    value.featured && Date.parse(value.featured.startsAt) <= now && Date.parse(value.featured.endsAt) > now
      ? value.featured
      : null;
  const archive = value.archive.filter((collection) => Date.parse(collection.endsAt) <= now);

  return {
    serverNow: value.serverNow,
    featured,
    archive,
  };
}

function contentVisibleAt(feed: ContentFeed, now: number): ContentFeed {
  const cachedFeaturedExpired =
    feed.featured && Date.parse(feed.featured.endsAt) <= now ? [feed.featured] : [];
  const featured =
    feed.featured &&
    Date.parse(feed.featured.startsAt) <= now &&
    Date.parse(feed.featured.endsAt) > now
      ? feed.featured
      : null;
  const archive = [...feed.archive, ...cachedFeaturedExpired].filter(
    (collection, index, all) =>
      Date.parse(collection.endsAt) <= now &&
      all.findIndex((item) => item.id === collection.id) === index,
  );
  return { ...feed, featured, archive };
}

function getMealList(feed: ContentFeed | null) {
  const publishedMeals = [
    ...(feed?.featured?.meals ?? []),
    ...(feed?.archive.flatMap((collection) => collection.meals) ?? []),
  ];
  const byId = new Map<string, Meal>();
  evergreenMeals.forEach((meal) => byId.set(meal.id, meal));
  publishedMeals.forEach((meal) => {
    if (!byId.has(meal.id)) byId.set(meal.id, meal);
  });
  return Array.from(byId.values());
}

export function ContentFeedProvider({ children }: { children: React.ReactNode }) {
  const { authReady } = useTrial();
  const [cachedFeed, setCachedFeed] = useState<ContentFeed | null>(null);
  const [acceptedNetworkFeed, setAcceptedNetworkFeed] = useState<ContentFeed | null>(null);
  const [isUsingCachedFeed, setIsUsingCachedFeed] = useState(false);
  const [clock, setClock] = useState(() => Date.now());
  const handledDataAt = useRef(0);
  const lastAppFocusRefreshAt = useRef(Date.now());
  const query = useGetContentFeed({
    query: {
      queryKey: getGetContentFeedQueryKey(),
      enabled: authReady,
      staleTime: FEED_STALE_TIME,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  });

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored || !active) return;
        const parsed: unknown = JSON.parse(stored);
        if (!isRecord(parsed) || parsed.version !== CACHE_VERSION) return;
        const validated = validateFeed(parsed.feed);
        if (validated && active) setCachedFeed(contentVisibleAt(validated, Date.now()));
      })
      .catch((error) => console.warn('Unable to load cached Nourish content.', error));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!query.data || query.dataUpdatedAt === handledDataAt.current) return;
    handledDataAt.current = query.dataUpdatedAt;
    const validated = validateFeed(query.data);
    if (!validated) {
      setAcceptedNetworkFeed(null);
      setIsUsingCachedFeed(true);
      return;
    }

    const visibleFeed = contentVisibleAt(validated, Date.now());
    setAcceptedNetworkFeed(visibleFeed);
    setCachedFeed(visibleFeed);
    setIsUsingCachedFeed(false);
    // One AsyncStorage value replacement makes each accepted feed a single cache transaction.
    void AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: CACHE_VERSION, feed: visibleFeed }),
    ).catch((error) => console.warn('Unable to cache Nourish content.', error));
  }, [query.data, query.dataUpdatedAt]);

  useEffect(() => {
    if (query.isError) {
      setAcceptedNetworkFeed(null);
      setIsUsingCachedFeed(true);
    }
  }, [query.isError]);

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query.refetch]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      const now = Date.now();
      if (state === 'active') setClock(now);
      if (state === 'active' && now - lastAppFocusRefreshAt.current >= FEED_STALE_TIME) {
        lastAppFocusRefreshAt.current = now;
        void refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (AppState.currentState !== 'active') return;
      const now = Date.now();
      setClock(now);
      if (now - lastAppFocusRefreshAt.current >= FEED_STALE_TIME) {
        lastAppFocusRefreshAt.current = now;
        void refresh();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    const source = acceptedNetworkFeed ?? cachedFeed;
    if (!source?.featured) return;
    const remaining = Date.parse(source.featured.endsAt) - Date.now();
    if (remaining <= 0) return;
    const timeout = setTimeout(() => setClock(Date.now()), Math.min(remaining, 2_147_483_647));
    return () => clearTimeout(timeout);
  }, [acceptedNetworkFeed, cachedFeed, clock]);

  const feed = useMemo(() => {
    const source = acceptedNetworkFeed ?? cachedFeed;
    if (!source) return null;
    return contentVisibleAt(source, clock);
  }, [acceptedNetworkFeed, cachedFeed, clock]);
  const meals = useMemo(() => getMealList(feed), [feed]);
  const featuredMeals = feed?.featured?.meals ?? [];
  const value = useMemo(
    () => ({ feed, meals, featuredMeals, isUsingCachedFeed: isUsingCachedFeed || !acceptedNetworkFeed, refresh }),
    [feed, meals, featuredMeals, isUsingCachedFeed, acceptedNetworkFeed, refresh],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContentFeed() {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContentFeed must be used within ContentFeedProvider.');
  return context;
}