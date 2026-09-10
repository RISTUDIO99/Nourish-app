import React, { createContext, useContext, useEffect } from 'react';
import { useUser } from '@clerk/expo';
import { Platform } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesOfferings,
  type PurchasesPackage,
} from 'react-native-purchases';

const TEST_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

export const REVENUECAT_OFFERING_IDENTIFIER =
  process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID ?? 'default';

let isConfigured = false;

function getApiKey() {
  if (__DEV__ || Platform.OS === 'web' || Constants.executionEnvironment === 'storeClient') {
    if (!TEST_API_KEY) throw new Error('RevenueCat Test Store API key is not configured.');
    return TEST_API_KEY;
  }

  if (Platform.OS === 'ios') {
    if (!IOS_API_KEY) throw new Error('RevenueCat iOS API key is not configured.');
    return IOS_API_KEY;
  }

  if (Platform.OS === 'android') {
    if (!ANDROID_API_KEY) throw new Error('RevenueCat Android API key is not configured.');
    return ANDROID_API_KEY;
  }

  if (!TEST_API_KEY) throw new Error('RevenueCat Test Store API key is not configured.');
  return TEST_API_KEY;
}

export function initializeRevenueCat() {
  if (isConfigured) return;

  Purchases.setLogLevel(__DEV__ ? Purchases.LOG_LEVEL.DEBUG : Purchases.LOG_LEVEL.WARN);
  Purchases.configure({ apiKey: getApiKey() });
  isConfigured = true;
}

export type SubscriptionAccess = {
  isPremium: boolean;
  isFounderDiamond: boolean;
  hasLegacyRoomAccess: boolean;
};

/**
 * Maps active RevenueCat entitlement identifiers to the approved access model.
 * Old identifiers intentionally remain here only as migration compatibility for
 * existing customers and restored purchases.
 */
export function getSubscriptionAccess(customerInfo?: CustomerInfo): SubscriptionAccess {
  const active = new Set(
    Object.keys(customerInfo?.entitlements.active ?? {}).map((identifier) => identifier.toLowerCase()),
  );
  const isHistoricalFounder =
    active.has('founder') ||
    active.has('founder_diamond') ||
    active.has('lifetime') ||
    active.has('legacy') ||
    active.has('legacy_room_access');
  const isFounderDiamond = isHistoricalFounder;
  const isPremium =
    isFounderDiamond ||
    active.has('premium') ||
    active.has('essentials') ||
    active.has('pro');

  return {
    isPremium,
    isFounderDiamond,
    // Legacy Room is derived from Founder Diamond. legacy_room_access above
    // promotes historical members to Founder Diamond rather than standing alone.
    hasLegacyRoomAccess: isFounderDiamond,
  };
}

function useSubscriptionContext(enabled: boolean) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    if (!user?.id) {
      void Purchases.logOut().finally(() => queryClient.clear());
      return;
    }
    void Purchases.logIn(user.id).then(({ customerInfo }) => {
      queryClient.setQueryData(['revenuecat', 'customer-info'], customerInfo);
      queryClient.invalidateQueries({ queryKey: ['revenuecat', 'app-user-id'] });
    });
  }, [enabled, queryClient, user?.id]);
  const customerInfoQuery = useQuery({
    queryKey: ['revenuecat', 'customer-info'],
    queryFn: () => Purchases.getCustomerInfo(),
    enabled,
    staleTime: 60_000,
  });

  const offeringsQuery = useQuery({
    queryKey: ['revenuecat', 'offerings'],
    queryFn: () => Purchases.getOfferings(),
    enabled,
    staleTime: 300_000,
  });

  const appUserIdQuery = useQuery({
    queryKey: ['revenuecat', 'app-user-id'],
    queryFn: () => Purchases.getAppUserID(),
    enabled,
    staleTime: Infinity,
  });

  const purchaseMutation = useMutation({
    mutationFn: (packageToPurchase: PurchasesPackage) =>
      Purchases.purchasePackage(packageToPurchase),
    onSuccess: ({ customerInfo }) => {
      queryClient.setQueryData(['revenuecat', 'customer-info'], customerInfo);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: () => Purchases.restorePurchases(),
    onSuccess: (customerInfo) => {
      queryClient.setQueryData(['revenuecat', 'customer-info'], customerInfo);
    },
  });

  const offerings: PurchasesOfferings | undefined = offeringsQuery.data;
  const offering: PurchasesOffering | null =
    offerings?.current ?? offerings?.all[REVENUECAT_OFFERING_IDENTIFIER] ?? null;
  const customerInfo = customerInfoQuery.data;
  const activeEntitlementIds = Object.keys(customerInfo?.entitlements.active ?? {});

  return {
    customerInfo,
    offerings,
    offering,
    appUserId: appUserIdQuery.data,
    activeEntitlementIds,
    access: getSubscriptionAccess(customerInfo),
    hasEntitlement: (identifier: string) =>
      activeEntitlementIds.some((activeIdentifier) => activeIdentifier.toLowerCase() === identifier.toLowerCase()),
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    error: customerInfoQuery.error ?? offeringsQuery.error,
    refreshOfferings: offeringsQuery.refetch,
    purchase: purchaseMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
}

type SubscriptionContextValue = ReturnType<typeof useSubscriptionContext>;
const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  const value = useSubscriptionContext(enabled);
  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider.');
  }
  return context;
}