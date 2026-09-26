import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSubscription } from '@/lib/revenuecat';
import { trialCountdownCopy, useTrial } from '@/lib/trial';
import { meals } from '@/constants/meals';
import { canAccessMeal, FREE_PREVIEW_MEAL_ID } from '@/constants/access';
import { useContentFeed } from '@/context/ContentFeedContext';

const TRIAL_DRIP_MILESTONES = new Set([11, 7, 3, 1]);

function getLocalCalendarDay() {
  const today = new Date();
  return Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86_400_000);
}

async function giveFeedback() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default function NourishDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { access } = useSubscription();
  const { isActive: activeTrial, daysRemaining } = useTrial();
  const { featuredMeals } = useContentFeed();
  const [showTrialDrip, setShowTrialDrip] = useState(false);

  const hasPremiumAccess = access.isPremium || activeTrial;
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  const trialDripKey =
    user?.id && TRIAL_DRIP_MILESTONES.has(daysRemaining)
      ? `nourish:trial-drip:${user.id}:${daysRemaining}`
      : null;

  useEffect(() => {
    let active = true;
    setShowTrialDrip(false);

    if (!activeTrial || !trialDripKey) return () => {
      active = false;
    };

    void AsyncStorage.getItem(trialDripKey).then((dismissed) => {
      if (active) setShowTrialDrip(dismissed !== 'dismissed');
    });

    return () => {
      active = false;
    };
  }, [activeTrial, trialDripKey]);

  const openPaywall = useCallback(async () => {
    await giveFeedback();
    router.push('/paywall');
  }, []);

  const dismissTrialDrip = useCallback(() => {
    setShowTrialDrip(false);
    if (trialDripKey) void AsyncStorage.setItem(trialDripKey, 'dismissed');
  }, [trialDripKey]);

  const navigateTo = useCallback(async (path: string) => {
    await giveFeedback();
    router.push(path as never);
  }, []);

  const suggestedMeals = meals.filter(
    (meal) =>
      meal.category === 'plan' &&
      canAccessMeal(meal.id, {
        isPremium: access.isPremium,
        isFounderDiamond: access.isFounderDiamond,
        isTrial: activeTrial,
      }),
  );
  const evergreenSuggestion =
    suggestedMeals[getLocalCalendarDay() % suggestedMeals.length] ??
    meals.find((meal) => meal.id === FREE_PREVIEW_MEAL_ID) ??
    meals[0];
  const featuredMeal =
    featuredMeals.find(
      (meal) =>
        meal.category === 'plan' &&
        canAccessMeal(meal.id, {
          isPremium: access.isPremium,
          isFounderDiamond: access.isFounderDiamond,
          isTrial: activeTrial,
        }),
    ) ?? evergreenSuggestion;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary, colors.foreground]}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: topInset + 16 }]}
        >
          <View style={styles.topBar}>
            <View style={styles.brandLockup}>
              <Image source={require('../../assets/images/icon.png')} style={styles.brandIcon} accessibilityLabel="Nourish" />
              <View>
                <Text style={[styles.brandName, { color: colors.primaryForeground }]}>Nourish</Text>
                <Text style={[styles.brandCaption, { color: colors.primaryForeground }]}>by RI Studio's LLC</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Account and Settings"
              accessibilityHint="Manage your profile, subscription, purchases, and support"
              onPress={() => navigateTo('/account')}
              style={({ pressed }) => [
                styles.accountButton,
                { backgroundColor: `${colors.primaryForeground}14` },
                pressed && styles.buttonPressed,
              ]}
            >
              <View style={[styles.settingsIcon, { backgroundColor: colors.accent }]}>
                <Feather name="settings" size={19} color={colors.accentForeground} />
              </View>
              <View style={styles.accountButtonCopy}>
                <Text style={[styles.accountButtonTitle, { color: colors.primaryForeground }]}>Account &amp; Settings</Text>
                <View style={styles.accountStatusRow}>
                  <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.statusText, { color: colors.primaryForeground }]} numberOfLines={1}>
                    {access.isFounderDiamond
                      ? 'Founder Diamond member'
                      : access.isPremium
                        ? 'Premium member'
                        : activeTrial
                          ? trialCountdownCopy(daysRemaining)
                          : 'A gentler way to eat'}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={colors.primaryForeground} />
            </Pressable>
          </View>

          <View style={styles.heroCopy}>
            <Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>
              Good morning{user?.firstName ? `, ${user.firstName}` : ''}.
            </Text>
            <Text style={[styles.heroBody, { color: colors.primaryForeground }]}>
              How are you feeling today? Take it one step at a time.
            </Text>
            {access.isFounderDiamond ? (
              <View
                accessibilityLabel="Founder Diamond Patron badge"
                style={[
                  styles.founderBadge,
                  {
                    backgroundColor: `${colors.primaryForeground}12`,
                    borderColor: colors.accent,
                  },
                ]}
              >
                <View style={[styles.founderBadgeIcon, { backgroundColor: colors.accent }]}>
                  <Feather name="award" size={23} color={colors.accentForeground} />
                </View>
                <View style={styles.founderBadgeCopy}>
                  <Text style={[styles.founderBadgeEyebrow, { color: colors.accent }]}>
                    FOUNDER DIAMOND
                  </Text>
                  <Text style={[styles.founderBadgeTitle, { color: colors.primaryForeground }]}>
                    Patron &amp; Supporter
                  </Text>
                  <Text style={[styles.founderBadgeBody, { color: colors.primaryForeground }]}>
                    Legacy website access · Founder recognition
                  </Text>
                </View>
                <Feather name="star" size={18} color={colors.accent} />
              </View>
            ) : null}
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Open the Library to see your meal plans"
              onPress={() => navigateTo('/(tabs)/library')}
              style={({ pressed }) => [styles.libraryGuide, pressed && styles.buttonPressed]}
            >
              <Text style={[styles.libraryGuideText, { color: colors.primaryForeground }]}>
                Your meal plans are waiting for you in the Library.
              </Text>
              <Feather name="arrow-right" size={13} color={colors.primaryForeground} />
            </Pressable>

            {showTrialDrip ? (
              <View style={[styles.trialCallout, { borderColor: `${colors.accent}70` }]}>
                <View style={styles.trialCalloutHeader}>
                  <View style={[styles.trialBadge, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.trialBadgeText, { color: colors.accentForeground }]}>A GENTLE REMINDER</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss trial reminder"
                    hitSlop={10}
                    onPress={dismissTrialDrip}
                    style={({ pressed }) => [styles.trialDismiss, pressed && styles.buttonPressed]}
                  >
                    <Feather name="x" size={16} color={colors.primaryForeground} />
                  </Pressable>
                </View>
                <Text style={[styles.trialCalloutText, { color: colors.primaryForeground }]}>
                  {trialCountdownCopy(daysRemaining)} Keep enjoying complete Premium access until then.
                </Text>
              </View>
            ) : !activeTrial && !access.isPremium ? (
              <View style={[styles.trialCallout, { borderColor: `${colors.accent}70` }]}>
                <View style={[styles.trialBadge, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.trialBadgeText, { color: colors.accentForeground }]}>14 DAYS FREE</Text>
                </View>
                <Text style={[styles.trialCalloutText, { color: colors.primaryForeground }]}>
                  6 meal plans, 3 smoothies, 2 healthy drinks, and every Premium member tool.
                </Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your daily path</Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigateTo('/(tabs)/journey')}
            style={({ pressed }) => [styles.navCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.cardPressed]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${colors.accent}20` }]}>
              <Feather name="map" size={24} color={colors.primary} />
            </View>
            <View style={styles.navCardBody}>
              <Text style={[styles.navCardTitle, { color: colors.cardForeground }]}>7-Day Wellness Journey</Text>
              <Text style={[styles.navCardDescription, { color: colors.mutedForeground }]}>Track your daily check-ins and progress.</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigateTo('/(tabs)/library')}
            style={({ pressed }) => [styles.navCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.cardPressed]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}15` }]}>
              <Feather name="book-open" size={24} color={colors.primary} />
            </View>
            <View style={styles.navCardBody}>
              <Text style={[styles.navCardTitle, { color: colors.cardForeground }]}>Recipe Library</Text>
              <Text style={[styles.navCardDescription, { color: colors.mutedForeground }]}>
                {access.isFounderDiamond
                  ? 'Open all 10 meal plans, 5 smoothies, and 3 healthy drinks.'
                  : 'Open 6 meal plans, 3 smoothies, and 2 drinks. Founder recipes are clearly marked.'}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigateTo('/(tabs)/grocery')}
            style={({ pressed }) => [styles.navCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.cardPressed]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}15` }]}>
              <Feather name="shopping-bag" size={24} color={colors.primary} />
            </View>
            <View style={styles.navCardBody}>
              <Text style={[styles.navCardTitle, { color: colors.cardForeground }]}>Grocery Guide</Text>
              <Text style={[styles.navCardDescription, { color: colors.mutedForeground }]}>Your categorized shopping list ready to go.</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>

          <View style={styles.featuredSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Suggested today</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigateTo(`/meal/${featuredMeal.id}`)}
              style={({ pressed }) => [styles.featuredCard, { backgroundColor: colors.card }, pressed && styles.cardPressed]}
            >
              <Image source={{ uri: featuredMeal.image }} style={styles.featuredImage} />
              <View style={styles.featuredOverlay}>
                <View style={[styles.featuredBadge, { backgroundColor: colors.card }]}>
                  <Text style={[styles.featuredBadgeText, { color: colors.primary }]}>{featuredMeal.prepTime}</Text>
                </View>
              </View>
              <View style={styles.featuredBody}>
                <Text style={[styles.featuredTitle, { color: colors.cardForeground }]}>{featuredMeal.title}</Text>
                <Text style={[styles.featuredDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {featuredMeal.description}
                </Text>
              </View>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View Nourish membership options"
            testID="open-paywall"
            onPress={openPaywall}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: colors.primary },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              {access.isPremium
                ? 'Manage membership'
                : activeTrial
                  ? 'Start membership now'
                  : 'Explore membership options'}
            </Text>
            <Feather name="arrow-right" size={17} color={colors.primary} />
          </Pressable>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  hero: {
    paddingHorizontal: 22,
    paddingBottom: 36,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: { gap: 14 },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 42, height: 42, borderRadius: 13 },
  brandName: { fontSize: 19, fontWeight: '600', letterSpacing: 0.2 },
  brandCaption: { opacity: 0.62, fontSize: 10, marginTop: 2, letterSpacing: 0.3 },
  accountButton: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18 },
  accountButtonCopy: { flex: 1, gap: 3 },
  accountButtonTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 0.1 },
  accountStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { flex: 1, opacity: 0.72, fontSize: 10.5, fontWeight: '500' },
  settingsIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  heroCopy: { marginTop: 34 },
  heroTitle: { fontSize: 32, lineHeight: 38, fontWeight: '600', letterSpacing: -0.8 },
  heroBody: { opacity: 0.8, fontSize: 15, lineHeight: 22, marginTop: 12, maxWidth: 320 },
  founderBadge: { minHeight: 82, marginTop: 22, borderWidth: 1.5, borderRadius: 22, paddingHorizontal: 13, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  founderBadgeIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  founderBadgeCopy: { flex: 1, gap: 2 },
  founderBadgeEyebrow: { fontSize: 9, lineHeight: 12, fontWeight: '800', letterSpacing: 1.4 },
  founderBadgeTitle: { fontSize: 16, lineHeight: 21, fontWeight: '700', letterSpacing: -0.2 },
  founderBadgeBody: { opacity: 0.7, fontSize: 10.5, lineHeight: 15, fontWeight: '500' },
  libraryGuide: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  libraryGuideText: { opacity: 0.66, fontSize: 11.5, lineHeight: 17, fontWeight: '500' },
  trialCallout: { borderWidth: 1, borderRadius: 17, padding: 12, marginTop: 24, gap: 8 },
  trialCalloutHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  trialBadge: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5 },
  trialBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  trialDismiss: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  trialCalloutText: { opacity: 0.9, fontSize: 12.5, lineHeight: 18, fontWeight: '600' },
  content: { paddingTop: 28, paddingHorizontal: 22 },
  sectionTitle: { fontSize: 19, fontWeight: '600', marginBottom: 16, letterSpacing: -0.3 },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  iconWrap: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  navCardBody: { flex: 1, paddingHorizontal: 16, gap: 4 },
  navCardTitle: { fontSize: 16, fontWeight: '600' },
  navCardDescription: { fontSize: 13, lineHeight: 18 },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  buttonPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  featuredSection: { marginTop: 24, marginBottom: 20 },
  featuredCard: { borderRadius: 24, overflow: 'hidden', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 },
  featuredImage: { width: '100%', height: 180 },
  featuredOverlay: { position: 'absolute', top: 16, right: 16 },
  featuredBadge: { borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  featuredBadgeText: { fontSize: 11, fontWeight: '700' },
  featuredBody: { padding: 18, gap: 6 },
  featuredTitle: { fontSize: 18, fontWeight: '600' },
  featuredDesc: { fontSize: 14, lineHeight: 20 },
  secondaryButton: { minHeight: 52, borderWidth: 1, borderRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 12 },
  secondaryButtonText: { fontSize: 13.5, fontWeight: '700' },
});
