import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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
import { getSubscriptionAccess } from './subscription-access';
import { purchaseMembership } from './membership-purchase';
export { getSubscriptionAccess } from './subscription-access';
export type { SubscriptionAccess } from './subscription-access';

const TEST_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

export const REVENUECAT_OFFERING_IDENTIFIER =
  process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID ?? 'default';

let isConfigured = false;
const MEMBERSHIP_TIMEOUT_MS = 12_000;

async function withMembershipDeadline<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Membership store did not respond. Please try again.')), MEMBERSHIP_TIMEOUT_MS);
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

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

function useSubscriptionContext(enabled: boolean) {
  const { isLoaded, user } = useUser();
  const queryClient = useQueryClient();
  const identitySyncRef = useRef<Promise<void>>(Promise.resolve());
  const previousUserIdRef = useRef<string | null>(null);
  const [identity, setIdentity] = useState<{
    userId: string | null;
    status: 'syncing' | 'ready' | 'error';
    error: Error | null;
  }>({ userId: null, status: 'syncing', error: null });
  const [retryIdentity, setRetryIdentity] = useState(0);
  const billingActionRef = useRef(false);
  useEffect(() => {
    if (!enabled || !isLoaded) return;
    let active = true;
    const userId = user?.id ?? null;
    if (previousUserIdRef.current && previousUserIdRef.current !== userId) queryClient.clear();
    previousUserIdRef.current = userId;
    setIdentity({ userId, status: 'syncing', error: null });
    const timer = setTimeout(() => {
      if (active) {
        setIdentity({
          userId,
          status: 'error',
          error: new Error('Membership store did not respond. Please try again.'),
        });
      }
    }, MEMBERSHIP_TIMEOUT_MS);
    identitySyncRef.current = identitySyncRef.current
      .catch(() => undefined)
      .then(async () => {
        if (!active) return;
        if (!userId) {
          const currentId = await Purchases.getAppUserID();
          if (!currentId.startsWith('$RCAnonymousID:')) await Purchases.logOut();
        } else {
          const { customerInfo } = await Purchases.logIn(userId);
          if (active) queryClient.setQueryData(['revenuecat', 'customer-info', userId], customerInfo);
        }
        if (active) setIdentity({ userId, status: 'ready', error: null });
      })
      .catch((error) => {
        console.warn('Unable to synchronize membership account.', error);
        if (active) setIdentity({
          userId,
          status: 'error',
          error: error instanceof Error ? error : new Error('Membership account is unavailable.'),
        });
      })
      .finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); };
  }, [enabled, isLoaded, queryClient, retryIdentity, user?.id]);
  const userId = user?.id ?? null;
  const identityReady = enabled && isLoaded && !!userId &&
    identity.userId === userId && identity.status === 'ready';
  const customerInfoQuery = useQuery({
    queryKey: ['revenuecat', 'customer-info', userId],
    queryFn: () => withMembershipDeadline(Purchases.getCustomerInfo()),
    enabled: identityReady,
    retry: 1,
    staleTime: 60_000,
  });

  const offeringsQuery = useQuery({
    queryKey: ['revenuecat', 'offerings', userId],
    queryFn: () => withMembershipDeadline(Purchases.getOfferings()),
    enabled: identityReady,
    retry: 1,
    staleTime: 300_000,
  });

  const appUserIdQuery = useQuery({
    queryKey: ['revenuecat', 'app-user-id', userId],
    queryFn: () => withMembershipDeadline(Purchases.getAppUserID()),
    enabled: identityReady,
    retry: 1,
    staleTime: Infinity,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageToPurchase: PurchasesPackage) => {
      if (!identityReady) throw new Error('Membership account is not ready. Please try again.');
      if (billingActionRef.current) throw new Error('A store request is already in progress.');
      const requestUserId = userId;
      billingActionRef.current = true;
      try {
        const result = await purchaseMembership({
          getFreshInfo: () => withMembershipDeadline((async () => {
            await Purchases.invalidateCustomerInfoCache();
            return Purchases.getCustomerInfo();
          })()),
          buy: (item, change) => Purchases.purchasePackage(item, null, change),
        }, packageToPurchase,
        Platform.OS === 'android' && !__DEV__ && Constants.executionEnvironment !== 'storeClient',
        () => previousUserIdRef.current === requestUserId);
        queryClient.setQueryData(['revenuecat', 'customer-info', requestUserId], result.customerInfo);
        return result;
      } finally {
        billingActionRef.current = false;
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!identityReady) throw new Error('Membership account is not ready. Please try again.');
      if (billingActionRef.current) throw new Error('A store request is already in progress.');
      const requestUserId = userId;
      billingActionRef.current = true;
      try {
        const customerInfo = await Purchases.restorePurchases();
        if (previousUserIdRef.current !== requestUserId) {
          throw new Error('Your membership account changed. Sign in again before restoring.');
        }
        queryClient.setQueryData(['revenuecat', 'customer-info', requestUserId], customerInfo);
        return customerInfo;
      } finally {
        billingActionRef.current = false;
      }
    },
  });

  const offerings: PurchasesOfferings | undefined = identityReady ? offeringsQuery.data : undefined;
  const offering: PurchasesOffering | null =
    offerings?.current ?? offerings?.all[REVENUECAT_OFFERING_IDENTIFIER] ?? null;
  const customerInfo = identityReady ? customerInfoQuery.data : undefined;
  const activeEntitlementIds = Object.keys(customerInfo?.entitlements.active ?? {});

  return {
    customerInfo,
    offerings,
    offering,
    appUserId: identityReady ? appUserIdQuery.data : undefined,
    activeEntitlementIds,
    access: getSubscriptionAccess(customerInfo),
    hasEntitlement: (identifier: string) =>
      activeEntitlementIds.some((activeIdentifier) => activeIdentifier.toLowerCase() === identifier.toLowerCase()),
    isLoading: enabled && isLoaded && !!userId &&
      identity.userId === userId && identity.status === 'syncing'
      || (identityReady && (customerInfoQuery.isLoading || offeringsQuery.isLoading)),
    error: identity.userId === userId ? identity.error ?? customerInfoQuery.error ?? offeringsQuery.error : null,
    refreshOfferings: async () => {
      if (identityReady) {
        await offeringsQuery.refetch();
      } else if (enabled && isLoaded && userId && identity.userId === userId && identity.status === 'error') {
        setRetryIdentity((current) => current + 1);
      }
    },
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