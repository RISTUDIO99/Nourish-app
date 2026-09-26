import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';
import { useColors } from '@/hooks/useColors';
import { useSubscription } from '@/lib/revenuecat';
import { trialCountdownCopy, useTrial } from '@/lib/trial';

type ApprovedTier = 'premium-monthly' | 'premium-annual' | 'founder-diamond';

type TierDefinition = {
  id: ApprovedTier;
  title: string;
  subtitle: string;
  billingPeriod: string;
  features: string[];
  icon: keyof typeof Feather.glyphMap;
};

const TIERS: TierDefinition[] = [
  {
    id: 'premium-monthly',
    title: 'Premium Monthly',
    subtitle: '$6.99/month',
    billingPeriod: '/month',
    icon: 'sliders',
    features: ['6 complete meal plans', '3 smoothies and 2 healthy drinks', 'Wellness, grocery, and saved versions of everyday meals', 'View monthly featured meals; Founder Diamond saves and edits them'],
  },
  {
    id: 'premium-annual',
    title: 'Premium Annual',
    subtitle: '$49.99/year',
    billingPeriod: '/year',
    icon: 'star',
    features: ['Everything in Premium Monthly', 'Best Value', 'View monthly featured meals; Founder Diamond saves and edits them'],
  },
  {
    id: 'founder-diamond',
    title: 'Founder Diamond Circle',
    subtitle: '$119.99/year',
    billingPeriod: '/year',
    icon: 'award',
    features: [
      'Everything in Premium, plus the complete Founder collection',
      'Edit ingredients and save monthly featured meals',
      'Private Legacy nutrition and wellness website access',
      'A new Founder nutrition program every month',
      'Founder-only releases, early access, and recognition',
      'Patron and supporter status',
    ],
  },
];

const PACKAGE_TIERS: Record<string, ApprovedTier> = {
  premium_monthly: 'premium-monthly',
  premium_annual: 'premium-annual',
  founder_diamond_annual: 'founder-diamond',
};

function searchablePackageText(item: PurchasesPackage) {
  return [
    item.identifier,
    item.packageType,
    item.product.identifier,
    item.product.title,
    item.product.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getPackageTier(item: PurchasesPackage): ApprovedTier | null {
  const packageIdentifier = item.identifier.toLowerCase();
  const explicitTier = PACKAGE_TIERS[packageIdentifier];
  if (explicitTier) return explicitTier;

  const text = searchablePackageText(item);
  const isAnnual = text.includes('annual') || text.includes('year');
  const isMonthly = text.includes('month');
  if (text.includes('lifetime') || text.includes('legacy')) return null;
  if ((text.includes('founder_diamond') || text.includes('founder diamond') || text.includes('founder')) && isAnnual) {
    return 'founder-diamond';
  }
  if (isAnnual && (text.includes('premium') || text.includes('pro'))) return 'premium-annual';
  if (isMonthly && (text.includes('premium') || text.includes('essential'))) return 'premium-monthly';
  return null;
}

function packagePreference(item: PurchasesPackage, tier: ApprovedTier) {
  const text = searchablePackageText(item);
  const isAnnual = text.includes('annual') || text.includes('year');
  const isMonthly = text.includes('month');

  if (tier === 'premium-monthly' && text.includes('premium') && isMonthly) return 40;
  if (tier === 'premium-monthly' && text.includes('essential') && isMonthly) return 30;
  if (tier === 'premium-annual' && text.includes('premium') && isAnnual) return 40;
  if (tier === 'premium-annual' && text.includes('pro') && isAnnual) return 30;
  if (tier === 'founder-diamond' && text.includes('founder_diamond') && isAnnual) return 40;
  if (tier === 'founder-diamond' && text.includes('founder') && isAnnual) return 30;
  if (isMonthly || isAnnual) return 10;
  return 0;
}

function getApprovedPackages(packages: PurchasesPackage[]) {
  const selected = new Map<ApprovedTier, PurchasesPackage>();

  packages.forEach((item) => {
    const tier = getPackageTier(item);
    if (!tier) return;
    const current = selected.get(tier);
    if (!current || packagePreference(item, tier) > packagePreference(current, tier)) {
      selected.set(tier, item);
    }
  });

  return selected;
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object') {
    if ('userCancelled' in error && error.userCancelled) return null;
    if ('message' in error && typeof error.message === 'string') return error.message;
  }
  return 'The purchase could not be completed. Please try again.';
}

export default function PaywallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    access,
    offering,
    isLoading,
    error,
    purchase,
    restore,
    refreshOfferings,
    isPurchasing,
    isRestoring,
  } = useSubscription();
  const { isActive: activeTrial, daysRemaining } = useTrial();
  const showTrialExperience = activeTrial && !access.isPremium;
  const [pendingPackage, setPendingPackage] = useState<PurchasesPackage | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const packagesByTier = useMemo(
    () => getApprovedPackages(offering?.availablePackages ?? []),
    [offering],
  );
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const usesTestStore =
    __DEV__ || Platform.OS === 'web' || Constants.executionEnvironment === 'storeClient';

  async function completePurchase(packageToPurchase: PurchasesPackage) {
    setMessage(null);
    setMessageIsError(false);
    try {
      await purchase(packageToPurchase);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMessage('Your Nourish access is ready.');
    } catch (purchaseError) {
      const nextMessage = getErrorMessage(purchaseError);
      if (nextMessage) {
        setMessageIsError(true);
        setMessage(nextMessage);
      }
    }
  }

  function choosePackage(packageToPurchase: PurchasesPackage) {
    if (usesTestStore) {
      setPendingPackage(packageToPurchase);
      return;
    }
    void completePurchase(packageToPurchase);
  }

  async function restoreAccess() {
    setMessage(null);
    setMessageIsError(false);
    try {
      const info = await restore();
      if (Object.keys(info.entitlements.active).length > 0) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setMessage('Your previous Nourish access has been restored.');
      } else {
        setMessage('No previous Apple purchases were found for this account.');
      }
    } catch (restoreError) {
      setMessageIsError(true);
      setMessage(getErrorMessage(restoreError) ?? 'Restore purchases was cancelled.');
    }
  }

  async function redeemCode() {
    setMessage(null);
    setMessageIsError(false);

    if (Platform.OS !== 'ios') {
      setMessage('Offer codes can be redeemed from this page on your iPhone or iPad.');
      return;
    }

    setIsRedeeming(true);
    try {
      await Purchases.presentCodeRedemptionSheet();
      setMessage('After Apple accepts your code, tap Restore purchases to refresh your Nourish access.');
    } catch (redemptionError) {
      setMessageIsError(true);
      setMessage(getErrorMessage(redemptionError) ?? 'The code redemption sheet could not be opened.');
    } finally {
      setIsRedeeming(false);
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 14, paddingBottom: insets.bottom + 30 },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close membership options"
            testID="close-paywall"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: colors.card },
              pressed && styles.pressed,
            ]}
          >
            <Feather name="x" size={20} color={colors.foreground} />
          </Pressable>
          <View style={[styles.memberBadge, { backgroundColor: colors.secondary }]}>
            <Feather name="shield" size={14} color={colors.primary} />
            <Text style={[styles.memberBadgeText, { color: colors.primary }]}>
              {access.isFounderDiamond
                ? 'FOUNDER DIAMOND ACTIVE'
                  : access.isPremium
                  ? 'PREMIUM ACTIVE'
                    : showTrialExperience
                      ? 'FULL-ACCESS TRIAL'
                  : 'NOURISH FREE'}
            </Text>
          </View>
        </View>

        <Text style={[styles.eyebrow, { color: colors.primary }]}>NOURISH MEMBERSHIP</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {showTrialExperience ? 'Your Nourish trial is in full bloom.' : 'Keep your Nourish experience going.'}
        </Text>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          {showTrialExperience
            ? `${trialCountdownCopy(daysRemaining)} Full Premium access is active with no card required. Ready now? You can choose any membership below.`
            : 'Choose the Premium support that feels right. Purchases are securely processed by Apple.'}
        </Text>

        {message ? (
          <View
            style={[
              styles.message,
              {
                backgroundColor: messageIsError ? `${colors.destructive}12` : colors.secondary,
                borderColor: messageIsError ? colors.destructive : colors.border,
              },
            ]}
          >
            <Feather
              name={messageIsError ? 'alert-circle' : 'check-circle'}
              size={18}
              color={messageIsError ? colors.destructive : colors.primary}
            />
            <Text
              style={[
                styles.messageText,
                { color: messageIsError ? colors.destructive : colors.foreground },
              ]}
            >
              {message}
            </Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
              Loading membership options…
            </Text>
          </View>
        ) : null}

        {!isLoading && packagesByTier.size === 0 ? (
          <View style={[styles.unavailableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="wifi-off" size={22} color={colors.primary} />
            <Text style={[styles.unavailableTitle, { color: colors.foreground }]}>
              Membership options are temporarily unavailable
            </Text>
            <Text style={[styles.unavailableBody, { color: colors.mutedForeground }]}>
              {showTrialExperience
                ? 'Your Premium trial remains active. Try loading the store plans again when you are ready to choose.'
                : 'Your Nourish Free experience remains available. Try loading the store plans again.'}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reload membership options"
              testID="reload-offerings"
              onPress={() => void refreshOfferings()}
              style={({ pressed }) => [
                styles.retryButton,
                { borderColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.retryText, { color: colors.primary }]}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.tierList}>
          {TIERS.map((tier) => {
            const packageToPurchase = packagesByTier.get(tier.id);
            const active =
              tier.id === 'founder-diamond'
                ? access.isFounderDiamond
                : tier.id === 'premium-monthly' || tier.id === 'premium-annual'
                  ? access.isPremium && !access.isFounderDiamond
                  : false;
            return (
              <View
                key={tier.id}
                testID={`paywall-tier-${tier.id}`}
                style={[
                  styles.tierCard,
                  {
                    backgroundColor: active ? colors.secondary : colors.card,
                    borderColor: tier.id === 'founder-diamond' ? colors.accent : colors.border,
                  },
                ]}
              >
                <View style={styles.tierHeader}>
                  <View style={[styles.tierIcon, { backgroundColor: colors.secondary }]}>
                    <Feather name={tier.icon} size={19} color={colors.primary} />
                  </View>
                  <View style={styles.tierHeading}>
                    <View style={styles.tierTitleRow}>
                      <Text style={[styles.tierTitle, { color: colors.foreground }]}>{tier.title}</Text>
                      {active ? (
                        <View style={[styles.activePill, { backgroundColor: colors.primary }]}>
                          <Text style={[styles.activePillText, { color: colors.primaryForeground }]}>
                            ACTIVE
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.tierSubtitle, { color: colors.mutedForeground }]}>
                      {packageToPurchase?.product.priceString
                        ? `${packageToPurchase.product.priceString}${tier.billingPeriod}`
                        : tier.subtitle}
                    </Text>
                    <Text style={[styles.valueNote, { color: colors.primary }]}>
                      {tier.id === 'premium-annual'
                        ? 'Best Value · about $4.17/month'
                        : tier.id === 'founder-diamond'
                          ? 'Patron + supporter membership'
                          : 'Complete Premium access'}
                    </Text>
                  </View>
                </View>

                <View style={styles.featureList}>
                  {tier.features.map((feature) => (
                    <View key={feature} style={styles.featureRow}>
                      <Feather name="check" size={15} color={colors.primary} />
                      <Text style={[styles.featureText, { color: colors.foreground }]}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    packageToPurchase
                      ? `Choose ${tier.title} for ${packageToPurchase.product.priceString}`
                      : `${tier.title} is unavailable`
                  }
                  testID={`purchase-${tier.id}`}
                  disabled={!packageToPurchase || isPurchasing || isRestoring || active}
                  onPress={() => packageToPurchase && choosePackage(packageToPurchase)}
                  style={({ pressed }) => [
                    styles.purchaseButton,
                    {
                      backgroundColor:
                        packageToPurchase && !active ? colors.primary : colors.muted,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  {isPurchasing && pendingPackage?.identifier === packageToPurchase?.identifier ? (
                    <ActivityIndicator color={colors.primaryForeground} />
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.purchaseButtonText,
                          {
                            color:
                              packageToPurchase && !active
                                ? colors.primaryForeground
                                : colors.mutedForeground,
                          },
                        ]}
                      >
                        {active
                          ? 'Current access'
                          : packageToPurchase
                            ? `Choose ${tier.title}`
                            : `${tier.subtitle} · unavailable`}
                      </Text>
                      {packageToPurchase && !active ? (
                        <Feather name="arrow-right" size={17} color={colors.primaryForeground} />
                      ) : null}
                    </>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
        {showTrialExperience ? (
          <View style={styles.trialShortcuts}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                router.replace('/(tabs)' as never);
              }}
              style={({ pressed }) => [
                styles.primaryShortcut,
                { backgroundColor: colors.primary },
                pressed && styles.pressed
              ]}
            >
              <Text style={[styles.primaryShortcutText, { color: colors.primaryForeground }]}>Continue to Today</Text>
              <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
            </Pressable>

            <Text style={[styles.shortcutHeader, { color: colors.foreground }]}>
              Or jump straight into your membership:
            </Text>

            <View style={styles.shortcutGrid}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/(tabs)/journey')}
                style={({ pressed }) => [
                  styles.shortcutCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && styles.pressed
                ]}
              >
                <View style={[styles.shortcutIconWrap, { backgroundColor: `${colors.accent}20` }]}>
                  <Feather name="map" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.shortcutText, { color: colors.cardForeground }]}>Journey</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/(tabs)/library')}
                style={({ pressed }) => [
                  styles.shortcutCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && styles.pressed
                ]}
              >
                <View style={[styles.shortcutIconWrap, { backgroundColor: `${colors.primary}15` }]}>
                  <Feather name="book-open" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.shortcutText, { color: colors.cardForeground }]}>Library</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/(tabs)/grocery')}
                style={({ pressed }) => [
                  styles.shortcutCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && styles.pressed
                ]}
              >
                <View style={[styles.shortcutIconWrap, { backgroundColor: `${colors.primary}15` }]}>
                  <Feather name="shopping-bag" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.shortcutText, { color: colors.cardForeground }]}>Grocery</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/(tabs)/saved')}
                style={({ pressed }) => [
                  styles.shortcutCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && styles.pressed
                ]}
              >
                <View style={[styles.shortcutIconWrap, { backgroundColor: `${colors.primary}15` }]}>
                  <Feather name="bookmark" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.shortcutText, { color: colors.cardForeground }]}>Saved</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Restore Apple purchases"
          testID="restore-purchases"
          disabled={isRestoring || isPurchasing}
          onPress={() => void restoreAccess()}
          style={({ pressed }) => [styles.restoreButton, pressed && styles.pressed]}
        >
          {isRestoring ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={[styles.restoreText, { color: colors.primary }]}>Restore purchases</Text>
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Redeem an Apple offer code"
          accessibilityHint="Opens Apple’s code redemption sheet"
          testID="redeem-code"
          disabled={isRedeeming || isRestoring || isPurchasing}
          onPress={() => void redeemCode()}
          style={({ pressed }) => [
            styles.redeemButton,
            { borderColor: colors.border, backgroundColor: colors.card },
            pressed && styles.pressed,
          ]}
        >
          {isRedeeming ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Feather name="gift" size={17} color={colors.primary} />
              <Text style={[styles.redeemText, { color: colors.primary }]}>Redeem code</Text>
            </>
          )}
        </Pressable>
        <Text style={[styles.legal, { color: colors.mutedForeground }]}>
          {showTrialExperience
            ? 'Your 14-day Premium trial remains free and requires no payment method. Choosing a paid membership is optional and starts that membership immediately.'
            : 'Paid memberships renew through your Apple ID unless cancelled at least 24 hours before the end of the current period.'}
        </Text>
        {error ? (
          <Text style={[styles.providerError, { color: colors.destructive }]}>
            Membership plans could not refresh. Your current Nourish access remains available.
          </Text>
        ) : null}
      </ScrollView>

      <Modal
        visible={pendingPackage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingPackage(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={[styles.modalIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="shopping-bag" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Test this purchase?</Text>
            <Text style={[styles.modalBody, { color: colors.mutedForeground }]}>
              RevenueCat Test Store will simulate{' '}
              {pendingPackage?.product.title ?? 'this Nourish membership'} for{' '}
              {pendingPackage?.product.priceString ?? 'the displayed price'}.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel test purchase"
                testID="cancel-test-purchase"
                onPress={() => setPendingPackage(null)}
                style={({ pressed }) => [
                  styles.modalSecondary,
                  { borderColor: colors.border },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.modalSecondaryText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirm test purchase"
                testID="confirm-test-purchase"
                onPress={() => {
                  const selected = pendingPackage;
                  setPendingPackage(null);
                  if (selected) void completePurchase(selected);
                }}
                style={({ pressed }) => [
                  styles.modalPrimary,
                  { backgroundColor: colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.modalPrimaryText, { color: colors.primaryForeground }]}>
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 99,
  },
  memberBadgeText: { fontSize: 9.5, fontWeight: '700', letterSpacing: 1 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '600', letterSpacing: -1, marginTop: 10 },
  intro: { fontSize: 14, lineHeight: 22, marginTop: 13, marginBottom: 24 },
  message: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  messageText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  loading: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28, gap: 10 },
  loadingText: { fontSize: 13 },
  unavailableCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  unavailableTitle: { fontSize: 17, lineHeight: 22, fontWeight: '600', textAlign: 'center', marginTop: 12 },
  unavailableBody: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  retryButton: { borderWidth: 1, borderRadius: 22, paddingHorizontal: 20, paddingVertical: 11, marginTop: 15 },
  retryText: { fontSize: 13, fontWeight: '700' },
  tierList: { gap: 14 },
  tierCard: { borderWidth: 1, borderRadius: 22, padding: 18 },
  tierHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tierIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tierHeading: { flex: 1, minWidth: 0 },
  tierTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tierTitle: { fontSize: 20, fontWeight: '700' },
  tierSubtitle: { fontSize: 12.5, lineHeight: 18, marginTop: 3, flexShrink: 1 },
  valueNote: { fontSize: 11, lineHeight: 16, fontWeight: '700', marginTop: 6 },
  activePill: { borderRadius: 99, paddingHorizontal: 7, paddingVertical: 4 },
  activePillText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  featureList: { gap: 9, marginTop: 17, marginBottom: 17 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  featureText: { fontSize: 13, flex: 1 },
  purchaseButton: {
    minHeight: 49,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  purchaseButtonText: { fontSize: 14, fontWeight: '700' },
  restoreButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  restoreText: { fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
  redeemButton: { minHeight: 48, marginTop: 2, borderWidth: 1, borderRadius: 24, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  redeemText: { fontSize: 14, fontWeight: '700' },
  legal: { fontSize: 10.5, lineHeight: 16, textAlign: 'center', marginHorizontal: 10 },
  providerError: { fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 10 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 24, 17, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: { width: '100%', maxWidth: 390, borderRadius: 24, padding: 22, alignItems: 'center' },
  modalIcon: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 21, fontWeight: '700', marginTop: 15 },
  modalBody: { fontSize: 13.5, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  modalActions: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 21 },
  modalSecondary: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimary: { flex: 1, minHeight: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  modalSecondaryText: { fontSize: 14, fontWeight: '700' },
  modalPrimaryText: { fontSize: 14, fontWeight: '700' },
  trialShortcuts: { gap: 24, marginTop: 8 },
  primaryShortcut: { minHeight: 56, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryShortcutText: { fontSize: 16, fontWeight: '700' },
  shortcutHeader: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  shortcutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  shortcutCard: { width: '48%', flexGrow: 1, borderWidth: 1, borderRadius: 20, padding: 16, alignItems: 'center', gap: 10 },
  shortcutIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  shortcutText: { fontSize: 14, fontWeight: '600' },
});