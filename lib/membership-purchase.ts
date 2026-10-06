import type { CustomerInfo, MakePurchaseResult, PurchasesPackage, StoreProductChangeInfo } from 'react-native-purchases';
import { STORE_REPLACEMENT_MODE } from '@revenuecat/purchases-typescript-internal';

const MEMBERSHIP_ENTITLEMENTS = new Set([
  'premium', 'essentials', 'pro', 'founder', 'founder_diamond', 'legacy', 'legacy_room_access',
]);

function productId(product: string, plan?: string | null) {
  return product.includes(':') || !plan ? product : `${product}:${plan}`;
}

export function isActiveStoreProduct(info: CustomerInfo | undefined, target: string): boolean {
  if (!info) return false;
  return info.activeSubscriptions?.includes(target) ||
    Object.values(info.entitlements.active).some(entry =>
      productId(entry.productIdentifier, entry.productPlanIdentifier) === target);
}

export function getAndroidProductChange(
  info: CustomerInfo,
  target: string,
): StoreProductChangeInfo | null {
  const owned = Object.values(info.entitlements.active)
    .filter(entry => entry.store === 'PLAY_STORE' &&
      entry.ownershipType === 'PURCHASED' &&
      MEMBERSHIP_ENTITLEMENTS.has(entry.identifier.toLowerCase()) &&
      (info.activeSubscriptions.includes(productId(entry.productIdentifier, entry.productPlanIdentifier)) ||
        info.activeSubscriptions.includes(entry.productIdentifier)))
    .map(entry => productId(entry.productIdentifier, entry.productPlanIdentifier));
  const unique = [...new Set(owned)];
  if (unique.includes(target)) {
    throw new Error('This Google Play plan is already active. Tap Restore purchases to refresh your access.');
  }
  if (unique.length > 1) {
    throw new Error('More than one Google Play membership is active. Manage your store subscriptions before changing plans.');
  }
  if (!unique.length) return null;
  return {
    oldProductIdentifier: unique[0],
    // Preserve the SDK's default replacement policy; Play shows the billing terms.
    replacementMode: STORE_REPLACEMENT_MODE.WITHOUT_PRORATION,
  };
}

export async function purchaseMembership(
  store: {
    getFreshInfo(): Promise<CustomerInfo>;
    buy(item: PurchasesPackage, change: StoreProductChangeInfo | null): Promise<MakePurchaseResult>;
  },
  item: PurchasesPackage,
  androidRelease: boolean,
  accountIsCurrent: () => boolean,
): Promise<MakePurchaseResult> {
  const info = androidRelease ? await store.getFreshInfo() : null;
  if (!accountIsCurrent()) {
    throw new Error('Your membership account changed. Sign in again before purchasing.');
  }
  const change = info ? getAndroidProductChange(info, item.product.identifier) : null;
  const result = await store.buy(item, change);
  if (!accountIsCurrent()) {
    throw new Error('Your account changed during the store request. Sign in to the original account and tap Restore purchases; do not purchase again.');
  }
  return result;
}

export function getPurchaseErrorMessage(error: unknown): string | null {
  if (error && typeof error === 'object') {
    if ('userCancelled' in error && error.userCancelled) return null;
    const message = 'message' in error && typeof error.message === 'string'
      ? error.message : 'The purchase could not be completed. Please try again.';
    // Retain the store code so an actual device error can be diagnosed.
    const code = 'code' in error && (typeof error.code === 'string' || typeof error.code === 'number')
      ? ` (Store code ${error.code})` : '';
    return `${message}${code}`;
  }
  return 'The purchase could not be completed. Please try again.';
}
