import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSignUp } from '@clerk/expo';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

function getClerkErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') return null;

  const clerkError = error as {
    message?: string;
    errors?: Array<{ longMessage?: string; message?: string }>;
  };

  return clerkError.errors?.[0]?.longMessage
    ?? clerkError.errors?.[0]?.message
    ?? clerkError.message
    ?? null;
}

export default function SignUpScreen() {
  const colors = useColors();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<'error' | 'success'>('error');
  const busy = submitting || fetchStatus === 'fetching';
  const verify = signUp.status === 'missing_requirements' && signUp.unverifiedFields.includes('email_address') && signUp.missingFields.length === 0;

  async function submit() {
    if (busy) return;
    setSubmitting(true);
    setLocalMessage(null);

    try {
      const { error } = await signUp.password({ emailAddress, password });
      if (error) {
        setMessageKind('error');
        setLocalMessage(getClerkErrorMessage(error) ?? 'We couldn’t create your account. Please check your details and try again.');
        return;
      }

      const { error: verificationError } = await signUp.verifications.sendEmailCode();
      if (verificationError) {
        setMessageKind('error');
        setLocalMessage(getClerkErrorMessage(verificationError) ?? 'We couldn’t send your verification code. Please try again in a moment.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function confirm() {
    if (busy || !code.trim()) return;
    setSubmitting(true);
    setLocalMessage(null);

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
      if (error) {
        const message = getClerkErrorMessage(error);
        setMessageKind('error');
        setLocalMessage(
          message?.toLowerCase().includes('too many')
            ? 'Too many verification attempts. Please wait a few minutes, request a new code, and try once.'
            : message ?? 'That code could not be verified. Please request a new code and try again.',
        );
        return;
      }

      if (signUp.status !== 'complete') {
        setMessageKind('error');
        setLocalMessage('Your email was verified, but the account is not ready yet. Please request a new code and try again.');
        return;
      }

      const { error: finalizeError } = await signUp.finalize({
        navigate: () => router.replace('/(tabs)'),
      });
      if (finalizeError) {
        setMessageKind('error');
        setLocalMessage(getClerkErrorMessage(finalizeError) ?? 'Your email was verified, but we couldn’t open Nourish. Please sign in with your new account.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function resendCode() {
    if (busy) return;
    setSubmitting(true);
    setLocalMessage(null);

    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setMessageKind('error');
        setLocalMessage(getClerkErrorMessage(error) ?? 'We couldn’t send a new code. Please wait a moment and try again.');
        return;
      }

      setCode('');
      setMessageKind('success');
      setLocalMessage('A new verification code is on its way. Use only the newest code.');
    } finally {
      setSubmitting(false);
    }
  }

  const errorText = errors.fields.emailAddress?.message ?? errors.fields.password?.message ?? errors.fields.code?.message;

  return <View style={[styles.screen, { backgroundColor: colors.background }]}>
    <Text style={[styles.kicker, { color: colors.accent }]}>{verify ? 'VERIFY YOUR EMAIL' : 'CREATE YOUR ACCOUNT'}</Text>
    <Text style={[styles.title, { color: colors.foreground }]}>{verify ? 'One last gentle step.' : 'Your full-access trial is waiting.'}</Text>
    <Text style={[styles.copy, { color: colors.mutedForeground }]}>{verify ? 'Enter the code we sent to your inbox.' : 'No card required. Your 14 days start once your email is verified.'}</Text>
    {verify ? <TextInput value={code} onChangeText={setCode} keyboardType="number-pad" autoComplete="one-time-code" placeholder="Verification code" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} /> : <>
      <TextInput value={emailAddress} onChangeText={setEmailAddress} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="Email address" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" placeholder="Create password" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
    </>}
    {localMessage || errorText ? <Text accessibilityRole="alert" style={[styles.error, { color: messageKind === 'success' && localMessage ? colors.primary : colors.destructive }]}>{localMessage ?? errorText}</Text> : null}
    <Pressable disabled={busy || (verify ? !code.trim() : !emailAddress || !password)} onPress={() => void (verify ? confirm() : submit())} style={[styles.button, { backgroundColor: colors.primary }, busy && styles.dim]}><Text style={[styles.buttonText, { color: colors.primaryForeground }]}>{busy ? 'Just a moment…' : verify ? 'Verify email' : 'Continue'}</Text></Pressable>
    {verify ? <Pressable disabled={busy} onPress={() => void resendCode()}><Text style={[styles.link, { color: colors.primary }]}>Send a new code</Text></Pressable> : <Pressable onPress={() => router.replace('/(auth)/sign-in')}><Text style={[styles.link, { color: colors.primary }]}>Already have an account? Sign in</Text></Pressable>}
    <View nativeID="clerk-captcha" />
  </View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, padding: 25, paddingTop: 108, gap: 14 }, kicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6 }, title: { fontSize: 32, lineHeight: 38, fontWeight: '600' }, copy: { fontSize: 14, lineHeight: 21, marginBottom: 12 }, input: { borderWidth: 1, borderRadius: 15, minHeight: 53, paddingHorizontal: 15, fontSize: 15 }, button: { minHeight: 53, borderRadius: 27, justifyContent: 'center', alignItems: 'center', marginTop: 7 }, buttonText: { fontSize: 14, fontWeight: '700' }, link: { textAlign: 'center', fontSize: 13, fontWeight: '600', marginTop: 8 }, error: { fontSize: 12 }, dim: { opacity: 0.6 } });