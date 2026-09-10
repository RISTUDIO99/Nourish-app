import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth, useClerk, useUser } from '@clerk/expo';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSubscription } from '@/lib/revenuecat';
import { trialCountdownCopy, useTrial } from '@/lib/trial';

const LEGACY_ROOM_LOGIN_URL = 'https://nourish-meal-plans.com/legacy-reserve/login';
const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
const SUPPORT_EMAIL = 'support@ristudio.app';

export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { access, customerInfo, restore, isRestoring } = useSubscription();
  const { isActive: activeTrial, daysRemaining } = useTrial();
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [showPasswordEditor, setShowPasswordEditor] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const email = user?.primaryEmailAddress?.emailAddress;
  const hasLegacyRoomAccess = access.hasLegacyRoomAccess;

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace('/(auth)/welcome');
  }, [isLoaded, isSignedIn]);

  const membershipLabel = access.isFounderDiamond
    ? 'Founder Diamond Circle'
    : access.isPremium
      ? 'Premium member'
      : activeTrial
        ? trialCountdownCopy(daysRemaining)
        : 'Nourish Free';

  const openLegacyRoom = useCallback(async () => {
    setMessage('');
    setMessageIsError(false);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Linking.openURL(LEGACY_ROOM_LOGIN_URL);
    } catch (error) {
      console.error('Unable to open the Legacy Room.', error);
      setMessageIsError(true);
      setMessage('We couldn’t open the Legacy Room. Please try again.');
    }
  }, []);

  const openMembershipManagement = useCallback(async () => {
    setMessage('');
    setMessageIsError(false);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Linking.openURL(customerInfo?.managementURL ?? APPLE_SUBSCRIPTIONS_URL);
    } catch (error) {
      console.error('Unable to open Apple subscription management.', error);
      setMessageIsError(true);
      setMessage('We couldn’t open Apple subscriptions. Please contact support for help.');
    }
  }, [customerInfo?.managementURL]);

  const restoreAccess = useCallback(async () => {
    setMessage('');
    setMessageIsError(false);
    try {
      const info = await restore();
      if (Object.keys(info.entitlements.active).length > 0) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setMessage('Your previous Nourish access has been restored.');
      } else {
        setMessage('No previous Apple purchases were found for this account.');
      }
    } catch (error) {
      console.error('Unable to restore purchases.', error);
      setMessageIsError(true);
      setMessage('Purchases could not be restored. Please try again or contact support.');
    }
  }, [restore]);

  const contactSupport = useCallback(async (subject = 'Nourish Support') => {
    setMessage('');
    setMessageIsError(false);
    const body = email ? `\n\nNourish account: ${email}` : '';
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Unable to open email support.', error);
      setMessageIsError(true);
      setMessage(`Please email us directly at ${SUPPORT_EMAIL}.`);
    }
  }, [email]);

  const saveName = useCallback(async () => {
    if (!user || !firstName.trim()) return;
    setIsSavingName(true);
    setMessage('');
    setMessageIsError(false);
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
      });
      setShowNameEditor(false);
      setMessage('Your profile name has been updated.');
    } catch (error) {
      console.error('Unable to update profile name.', error);
      setMessageIsError(true);
      setMessage('Your name could not be updated. Please try again.');
    } finally {
      setIsSavingName(false);
    }
  }, [firstName, lastName, user]);

  const savePassword = useCallback(async () => {
    if (!user || !currentPassword || !newPassword || newPassword !== confirmPassword) return;
    setIsSavingPassword(true);
    setMessage('');
    setMessageIsError(false);
    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: true,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordEditor(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMessage('Your password has been changed securely.');
    } catch (error) {
      console.error('Unable to update password.', error);
      setMessageIsError(true);
      setMessage('Your password could not be changed. Check your current password and try again.');
    } finally {
      setIsSavingPassword(false);
    }
  }, [confirmPassword, currentPassword, newPassword, user]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace('/(auth)/welcome');
  }, [signOut]);

  if (!isLoaded || !isSignedIn) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Feather name="loader" size={28} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Opening your account…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: topInset + 12, paddingBottom: insets.bottom + 36 }]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>YOUR NOURISH ACCOUNT</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Account & Settings</Text>
          </View>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Feather name="user" size={25} color={colors.accentForeground} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={[styles.profileName, { color: colors.primaryForeground }]}>
              {user?.fullName || user?.firstName || 'Nourish member'}
            </Text>
            <Text style={[styles.email, { color: colors.primaryForeground }]}>{email || 'Verified Nourish account'}</Text>
          </View>
          <View style={[styles.membershipPill, { backgroundColor: `${colors.primaryForeground}16` }]}>
            <Text style={[styles.membershipPillText, { color: colors.primaryForeground }]}>{membershipLabel}</Text>
          </View>
        </View>

        <View style={[styles.legacyCard, { backgroundColor: colors.foreground, borderColor: colors.accent }]}>
          <View style={styles.legacyHeader}>
            <View style={[styles.legacyIcon, { backgroundColor: `${colors.accent}22` }]}>
              <Feather name="key" size={21} color={colors.accent} />
            </View>
            <View style={styles.legacyHeaderCopy}>
              <Text style={[styles.legacyEyebrow, { color: colors.accent }]}>PRIVATE MEMBER ACCESS</Text>
              <Text style={[styles.legacyTitle, { color: colors.primaryForeground }]}>The Legacy Room</Text>
            </View>
          </View>
          <Text style={[styles.legacyDescription, { color: colors.primaryForeground }]}>
            {hasLegacyRoomAccess
              ? 'Open your private Legacy nutrition and wellness website with the same registered email used for your Nourish account.'
              : 'Founder Diamond is our Patron and Supporter membership. It includes the private Legacy nutrition and wellness website, a new monthly nutrition program, Founder-only releases, early access, and recognition.'}
          </Text>
          {hasLegacyRoomAccess && email ? (
            <View style={[styles.emailHint, { borderColor: `${colors.accent}55` }]}>
              <Feather name="mail" size={15} color={colors.accent} />
              <Text style={[styles.emailHintText, { color: colors.primaryForeground }]} numberOfLines={1}>
                {email}
              </Text>
            </View>
          ) : null}
          <Pressable
            accessibilityRole={hasLegacyRoomAccess ? 'link' : 'button'}
            accessibilityLabel={hasLegacyRoomAccess ? 'Enter the Legacy Room' : 'View Founder Diamond membership'}
            testID="open-legacy-room"
            onPress={() => hasLegacyRoomAccess ? void openLegacyRoom() : router.push('/paywall')}
            style={({ pressed }) => [
              styles.legacyButton,
              { backgroundColor: colors.accent },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.legacyButtonText, { color: colors.accentForeground }]}>
              {hasLegacyRoomAccess ? 'Enter the Legacy Room' : 'View Founder Diamond'}
            </Text>
            <Feather name={hasLegacyRoomAccess ? 'external-link' : 'lock'} size={17} color={colors.accentForeground} />
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={access.isPremium ? 'Manage or cancel Apple subscription' : 'View Nourish membership options'}
            onPress={() => access.isPremium ? void openMembershipManagement() : router.push('/paywall')}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="credit-card" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={[styles.actionTitle, { color: colors.cardForeground }]}>
                {access.isPremium ? 'Manage or cancel subscription' : 'View membership options'}
              </Text>
              <Text style={[styles.actionDescription, { color: colors.mutedForeground }]}>
                {access.isPremium ? 'Open your store subscriptions to upgrade, downgrade, or cancel your plan.' : 'Compare all three Premium and Founder Diamond plans.'}
              </Text>
            </View>
            <Feather name="chevron-right" size={19} color={colors.mutedForeground} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Restore Apple purchases"
            disabled={isRestoring}
            onPress={() => void restoreAccess()}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              isRestoring && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="refresh-cw" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={[styles.actionTitle, { color: colors.cardForeground }]}>
                {isRestoring ? 'Restoring purchases…' : 'Restore purchases'}
              </Text>
              <Text style={[styles.actionDescription, { color: colors.mutedForeground }]}>
                Restore a Nourish membership previously purchased with Apple.
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile name"
            onPress={() => setShowNameEditor((visible) => !visible)}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="edit-3" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={[styles.actionTitle, { color: colors.cardForeground }]}>Edit profile name</Text>
              <Text style={[styles.actionDescription, { color: colors.mutedForeground }]}>Change the name shown in Nourish.</Text>
            </View>
            <Feather name={showNameEditor ? 'chevron-up' : 'chevron-down'} size={19} color={colors.mutedForeground} />
          </Pressable>

          {showNameEditor ? (
            <View style={[styles.editorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                accessibilityLabel="First name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={colors.mutedForeground}
                autoComplete="given-name"
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <TextInput
                accessibilityLabel="Last name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={colors.mutedForeground}
                autoComplete="family-name"
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              />
              <View style={styles.editorActions}>
                <Pressable onPress={() => setShowNameEditor(false)} style={[styles.editorCancel, { borderColor: colors.border }]}>
                  <Text style={[styles.editorCancelText, { color: colors.foreground }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  disabled={!firstName.trim() || isSavingName}
                  onPress={() => void saveName()}
                  style={[styles.editorSave, { backgroundColor: colors.primary }, (!firstName.trim() || isSavingName) && styles.disabled]}
                >
                  <Text style={[styles.editorSaveText, { color: colors.primaryForeground }]}>
                    {isSavingName ? 'Saving…' : 'Save name'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={user?.passwordEnabled ? 'Change password' : 'Password information'}
            onPress={() => setShowPasswordEditor((visible) => !visible)}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="shield" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={[styles.actionTitle, { color: colors.cardForeground }]}>Change password</Text>
              <Text style={[styles.actionDescription, { color: colors.mutedForeground }]}>
                {user?.passwordEnabled
                  ? 'Update your Nourish password securely in the app.'
                  : 'Apple and Google sign-in passwords are managed by your provider.'}
              </Text>
            </View>
            <Feather name={showPasswordEditor ? 'chevron-up' : 'chevron-down'} size={19} color={colors.mutedForeground} />
          </Pressable>

          {showPasswordEditor ? (
            <View style={[styles.editorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {user?.passwordEnabled ? (
                <>
                  <Text style={[styles.editorHeading, { color: colors.cardForeground }]}>Choose a new password</Text>
                  <TextInput
                    accessibilityLabel="Current password"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Current password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="current-password"
                    editable={!isSavingPassword}
                    style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  />
                  <TextInput
                    accessibilityLabel="New password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="new-password"
                    editable={!isSavingPassword}
                    style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  />
                  <TextInput
                    accessibilityLabel="Confirm new password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="new-password"
                    editable={!isSavingPassword}
                    style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  />
                  {confirmPassword && newPassword !== confirmPassword ? (
                    <Text style={[styles.inlineError, { color: colors.destructive }]}>The new passwords do not match.</Text>
                  ) : null}
                  <Text style={[styles.securityNote, { color: colors.mutedForeground }]}>
                    For your security, changing your password signs you out on your other devices.
                  </Text>
                  <View style={styles.editorActions}>
                    <Pressable onPress={() => setShowPasswordEditor(false)} style={[styles.editorCancel, { borderColor: colors.border }]}>
                      <Text style={[styles.editorCancelText, { color: colors.foreground }]}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || isSavingPassword}
                      onPress={() => void savePassword()}
                      style={[
                        styles.editorSave,
                        { backgroundColor: colors.primary },
                        (!currentPassword || !newPassword || newPassword !== confirmPassword || isSavingPassword) && styles.disabled,
                      ]}
                    >
                      <Text style={[styles.editorSaveText, { color: colors.primaryForeground }]}>
                        {isSavingPassword ? 'Changing…' : 'Change password'}
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.editorHeading, { color: colors.cardForeground }]}>Your password is managed securely</Text>
                  <Text style={[styles.securityNote, { color: colors.mutedForeground }]}>
                    This Nourish account uses Apple or Google sign-in. Change that password with Apple or Google, then continue using the same sign-in button here.
                  </Text>
                  <Pressable onPress={() => setShowPasswordEditor(false)} style={[styles.editorCancel, { borderColor: colors.border }]}>
                    <Text style={[styles.editorCancelText, { color: colors.foreground }]}>Got it</Text>
                  </Pressable>
                </>
              )}
            </View>
          ) : null}

          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Contact Nourish support at ${SUPPORT_EMAIL}`}
            onPress={() => void contactSupport()}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="mail" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={[styles.actionTitle, { color: colors.cardForeground }]}>Contact support</Text>
              <Text style={[styles.actionDescription, { color: colors.mutedForeground }]}>{SUPPORT_EMAIL}</Text>
            </View>
            <Feather name="external-link" size={18} color={colors.mutedForeground} />
          </Pressable>

          {message ? (
            <Text style={[styles.feedbackText, { color: messageIsError ? colors.destructive : colors.primary }]}>
              {message}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={() => void handleSignOut()}
            style={({ pressed }) => [
              styles.signOutButton,
              { borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <Feather name="log-out" size={17} color={colors.primary} />
            <Text style={[styles.signOutText, { color: colors.primary }]}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13 },
  content: { flexGrow: 1, paddingHorizontal: 22, gap: 22 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { gap: 3 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  title: { fontSize: 30, lineHeight: 34, fontWeight: '600' },
  profileCard: { borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  avatar: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  profileCopy: { flex: 1, minWidth: 160, gap: 4 },
  profileName: { fontSize: 17, fontWeight: '700' },
  email: { opacity: 0.7, fontSize: 12 },
  membershipPill: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 99 },
  membershipPillText: { fontSize: 10, fontWeight: '700' },
  legacyCard: { borderWidth: 1, borderRadius: 25, padding: 20, gap: 16 },
  legacyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  legacyIcon: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  legacyHeaderCopy: { flex: 1, gap: 4 },
  legacyEyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  legacyTitle: { fontSize: 23, fontWeight: '600' },
  legacyDescription: { opacity: 0.74, fontSize: 13, lineHeight: 20 },
  emailHint: { minHeight: 42, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  emailHintText: { flex: 1, opacity: 0.82, fontSize: 12 },
  legacyButton: { minHeight: 54, borderRadius: 27, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  legacyButtonText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.2 },
  errorText: { fontSize: 11.5, lineHeight: 17, textAlign: 'center' },
  actions: { gap: 12 },
  actionButton: { minHeight: 76, borderWidth: 1, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  actionIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionCopy: { flex: 1, gap: 4 },
  actionTitle: { fontSize: 14, fontWeight: '700' },
  actionDescription: { fontSize: 11.5, lineHeight: 16 },
  editorCard: { borderWidth: 1, borderRadius: 20, padding: 14, gap: 12 },
  editorHeading: { fontSize: 14, fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 14 },
  inlineError: { fontSize: 11.5, lineHeight: 17 },
  securityNote: { fontSize: 11.5, lineHeight: 17 },
  editorActions: { flexDirection: 'row', gap: 10 },
  editorCancel: { flex: 1, minHeight: 46, borderWidth: 1, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  editorCancelText: { fontSize: 13, fontWeight: '700' },
  editorSave: { flex: 1, minHeight: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  editorSaveText: { fontSize: 13, fontWeight: '700' },
  feedbackText: { fontSize: 12, lineHeight: 18, textAlign: 'center', paddingHorizontal: 12 },
  disabled: { opacity: 0.55 },
  signOutButton: { minHeight: 52, borderWidth: 1, borderRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  signOutText: { fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
});