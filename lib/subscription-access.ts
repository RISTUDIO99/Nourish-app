import type { CustomerInfo } from 'react-native-purchases';

export type SubscriptionAccess = {
  isPremium: boolean;
  isFounderDiamond: boolean;
  hasLegacyRoomAccess: boolean;
};

/**
 * RevenueCat's active entitlements, not product IDs or subscription status,
 * are the source of truth. Keep historical IDs for existing/restored members.
 */
export function getSubscriptionAccess(customerInfo?: CustomerInfo): SubscriptionAccess {
  const active = new Set(
    Object.keys(customerInfo?.entitlements.active ?? {}).map((identifier) => identifier.toLowerCase()),
  );
  const isFounderDiamond =
    active.has('founder') ||
    active.has('founder_diamond') ||
    active.has('lifetime') ||
    active.has('legacy') ||
    active.has('legacy_room_access');
  const isPremium =
    isFounderDiamond ||
    active.has('premium') ||
    active.has('essentials') ||
    active.has('pro');

  return {
    isPremium,
    isFounderDiamond,
    // A historical Legacy Room entitlement retains its Founder access.
    hasLegacyRoomAccess: isFounderDiamond,
  };
}