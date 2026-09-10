import { useCallback, useState } from 'react';
import { Image, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSavedPlans } from '@/context/SavedPlansContext';
import { useSubscription } from '@/lib/revenuecat';
import { useTrial } from '@/lib/trial';

const SUPPORT_EMAIL = 'support@ristudio.app';

export default function SavedPlansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const { plans, isLoaded, deletePlan } = useSavedPlans();
  const { access, isLoading: isSubscriptionLoading } = useSubscription();
  const { isActive: activeTrial, isLoading: isTrialLoading } = useTrial();
  const canUseSavedPlans = access.isPremium || activeTrial;
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const openPlan = useCallback((mealId: string, savedId: string) => {
    router.push({ pathname: '/meal/[id]', params: { id: mealId, savedId } } as never);
  }, []);

  const openFeedback = useCallback(async () => {
    const subject = encodeURIComponent('Nourish Feedback & Suggestions');
    const body = encodeURIComponent(
      'Hi Nourish team,\n\nI would like to share the following feedback or suggestion:\n\n',
    );
    await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: topInset + 18, paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.kicker, { color: colors.accent }]}>YOUR LIBRARY</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Saved plans</Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              Your gentle edits, ready for the next time you need them.
            </Text>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: `${colors.accent}28` }]}>
            <Feather name="bookmark" size={21} color={colors.primary} />
          </View>
        </View>

        {isSubscriptionLoading || isTrialLoading || !isLoaded ? (
          <View style={styles.emptyState}>
            <Feather name="loader" size={24} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Loading your plans…</Text>
          </View>
        ) : !canUseSavedPlans ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="lock" size={23} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your saved plans are safely kept</Text>
            <Text style={[styles.emptyDescription, { color: colors.mutedForeground }]}>
              Restore your purchase or choose Premium to reopen and edit your named versions. Your saved data is never removed when access changes.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View Premium membership options"
              testID="saved-plans-paywall"
              onPress={() => router.push('/paywall')}
              style={[styles.browseButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.browseButtonText, { color: colors.primaryForeground }]}>View membership options</Text>
              <Feather name="arrow-right" size={16} color={colors.primaryForeground} />
            </Pressable>
          </View>
        ) : plans.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="bookmark" size={23} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing saved yet</Text>
            <Text style={[styles.emptyDescription, { color: colors.mutedForeground }]}>
              Open a meal, adjust an ingredient, and save your version here for easy access later.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Browse meal plans"
              testID="browse-meal-plans"
              onPress={() => router.push('/(tabs)' as never)}
              style={[styles.browseButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.browseButtonText, { color: colors.primaryForeground }]}>Browse meal plans</Text>
              <Feather name="arrow-right" size={16} color={colors.primaryForeground} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.planList}>
            {plans.map((plan) => (
              <View
                key={plan.id}
                style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open saved plan ${plan.name}`}
                  accessibilityHint="Open this saved version to edit its name or ingredients"
                  testID={`saved-plan-${plan.id}`}
                  onPress={() => openPlan(plan.mealId, plan.id)}
                  style={({ pressed }) => [styles.planOpenButton, pressed && styles.cardPressed]}
                >
                  <Image source={{ uri: plan.image }} style={styles.planImage} resizeMode="cover" />
                  <View style={styles.planCopy}>
                    <Text style={[styles.planName, { color: colors.cardForeground }]} numberOfLines={2}>{plan.name}</Text>
                    <Text style={[styles.planMeal, { color: colors.mutedForeground }]}>{plan.mealTitle}</Text>
                    <Text style={[styles.planMeta, { color: colors.primary }]}>
                      {plan.ingredients.length} ingredients · saved on this device
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${plan.name}`}
                  testID={`delete-saved-plan-${plan.id}`}
                  onPress={() => setPendingDelete({ id: plan.id, name: plan.name })}
                  style={styles.deleteButton}
                >
                  <Feather name="trash-2" size={16} color={colors.mutedForeground} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.supportCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="heart" size={19} color={colors.primary} />
          <View style={styles.supportCopy}>
            <Text style={[styles.supportTitle, { color: colors.foreground }]}>Make room for real life.</Text>
            <Text style={[styles.supportText, { color: colors.mutedForeground }]}>
              Nourish is here to support your care plan, not add another rulebook.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send Nourish feedback and suggestions"
          onPress={() => void openFeedback()}
          style={({ pressed }) => [
            styles.feedbackCard,
            { backgroundColor: colors.foreground, borderColor: colors.accent },
            pressed && styles.cardPressed,
          ]}
        >
          <View style={[styles.feedbackIcon, { backgroundColor: `${colors.accent}22` }]}>
            <Feather name="message-circle" size={22} color={colors.accent} />
          </View>
          <View style={styles.feedbackCopy}>
            <Text style={[styles.feedbackTitle, { color: colors.primaryForeground }]}>
              Feedback &amp; Suggestions
            </Text>
            <Text style={[styles.feedbackDescription, { color: colors.primaryForeground }]}>
              Have an idea that could make Nourish better? We’d love to hear it.
            </Text>
          </View>
          <Feather name="arrow-up-right" size={19} color={colors.accent} />
        </Pressable>
      </ScrollView>

      <Modal
        visible={pendingDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingDelete(null)}
      >
        <View style={[styles.deleteModalOverlay, { backgroundColor: `${colors.foreground}55` }]}>
          <View
            accessibilityLabel="Delete saved plan confirmation"
            accessibilityViewIsModal
            testID="delete-plan-dialog"
            style={[styles.deleteModalCard, { backgroundColor: colors.card }]}
          >
            <View style={[styles.deleteModalIcon, { backgroundColor: `${colors.destructive}18` }]}>
              <Feather name="trash-2" size={21} color={colors.destructive} />
            </View>
            <Text style={[styles.deleteModalTitle, { color: colors.foreground }]}>Delete saved plan?</Text>
            <Text style={[styles.deleteModalDescription, { color: colors.mutedForeground }]}>
              {pendingDelete ? `“${pendingDelete.name}” will be removed from your saved plans.` : ''}
            </Text>
            <View style={styles.deleteModalActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                testID="cancel-delete-plan"
                onPress={() => setPendingDelete(null)}
                style={[styles.deleteCancelButton, { borderColor: colors.border }]}
              >
                <Text style={[styles.deleteCancelText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete"
                testID="confirm-delete-plan"
                onPress={async () => {
                  if (!pendingDelete) return;
                  const planId = pendingDelete.id;
                  setPendingDelete(null);
                  await deletePlan(planId);
                }}
                style={[styles.deleteConfirmButton, { backgroundColor: colors.destructive }]}
              >
                <Text style={[styles.deleteConfirmText, { color: colors.destructiveForeground }]}>Delete</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 28 },
  headerCopy: { flex: 1, gap: 7 },
  kicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  title: { fontSize: 32, lineHeight: 37, fontWeight: '600', letterSpacing: -0.7 },
  description: { fontSize: 14, lineHeight: 20, maxWidth: 300 },
  headerIcon: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyCard: { borderWidth: 1, borderRadius: 23, padding: 22, alignItems: 'center', gap: 12 },
  emptyIcon: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  emptyTitle: { fontSize: 19, fontWeight: '600', textAlign: 'center' },
  emptyDescription: { fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 290 },
  browseButton: { minHeight: 48, borderRadius: 24, paddingHorizontal: 19, flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 7 },
  browseButtonText: { fontSize: 13, fontWeight: '700' },
  planList: { gap: 12 },
  planCard: { minHeight: 106, borderWidth: 1, borderRadius: 19, position: 'relative', overflow: 'hidden' },
  planOpenButton: { minHeight: 104, padding: 10, paddingRight: 38, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.987 }] },
  planImage: { width: 86, height: 86, borderRadius: 14 },
  planCopy: { flex: 1, gap: 5, paddingRight: 22 },
  planName: { fontSize: 15, lineHeight: 19, fontWeight: '600' },
  planMeal: { fontSize: 11 },
  planMeta: { fontSize: 10, fontWeight: '600' },
  deleteButton: { position: 'absolute', top: 12, right: 11, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  deleteModalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 22 },
  deleteModalCard: { width: '100%', maxWidth: 380, borderRadius: 24, padding: 22, gap: 14 },
  deleteModalIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  deleteModalTitle: { fontSize: 23, lineHeight: 28, fontWeight: '600' },
  deleteModalDescription: { fontSize: 13, lineHeight: 19 },
  deleteModalActions: { flexDirection: 'row', gap: 10, marginTop: 3 },
  deleteCancelButton: { flex: 1, minHeight: 50, borderWidth: 1, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  deleteCancelText: { fontSize: 13, fontWeight: '600' },
  deleteConfirmButton: { flex: 1, minHeight: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  deleteConfirmText: { fontSize: 13, fontWeight: '700' },
  supportCard: { marginTop: 28, borderWidth: 1, borderRadius: 20, padding: 18, flexDirection: 'row', gap: 12 },
  supportCopy: { flex: 1, gap: 4 },
  supportTitle: { fontSize: 14, fontWeight: '600' },
  supportText: { fontSize: 12, lineHeight: 18 },
  feedbackCard: { marginTop: 14, borderWidth: 1, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13 },
  feedbackIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  feedbackCopy: { flex: 1, gap: 4 },
  feedbackTitle: { fontSize: 16, fontWeight: '700' },
  feedbackDescription: { opacity: 0.72, fontSize: 12.5, lineHeight: 18 },
});