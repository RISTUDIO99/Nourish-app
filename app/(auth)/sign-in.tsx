import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSignIn } from '@clerk/expo';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function SignInScreen() {
  const colors = useColors();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const busy = submitting || fetchStatus === 'fetching';
  async function submit() {
    if (busy) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { error } = await signIn.password({ emailAddress, password });
      if (error) {
        setSubmitError(error.message || 'Could not sign in. Please try again.');
        return;
      }
      if (signIn.status === 'complete') {
        const result = await signIn.finalize({ navigate: () => router.replace('/(tabs)') });
        if (result?.error) setSubmitError(result.error.message || 'Sign-in could not finish. Please try again.');
      } else {
        setSubmitError('Sign-in could not finish. Please try again.');
      }
    } catch (error) {
      console.error('Unable to complete sign-in', error);
      setSubmitError('Could not sign in. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }
  const errorText = submitError ?? errors.fields.identifier?.message ?? errors.fields.password?.message;
  return <View style={[styles.screen, { backgroundColor: colors.background }]}>
    <Text style={[styles.kicker, { color: colors.accent }]}>WELCOME BACK</Text>
    <Text style={[styles.title, { color: colors.foreground }]}>Return to your Nourish rhythm.</Text>
    <Text style={[styles.copy, { color: colors.mutedForeground }]}>Sign in to restore your account, trial, and purchases on this device.</Text>
    <TextInput value={emailAddress} onChangeText={setEmailAddress} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="Email address" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
    <TextInput value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" placeholder="Password" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
    {errorText ? <Text style={[styles.error, { color: colors.destructive }]}>{errorText}</Text> : null}
    <Pressable disabled={busy || !emailAddress || !password} onPress={() => void submit()} style={[styles.button, { backgroundColor: colors.primary }, busy && styles.dim]}><Text style={[styles.buttonText, { color: colors.primaryForeground }]}>{busy ? 'Signing in…' : 'Sign in'}</Text></Pressable>
    <Pressable onPress={() => router.replace('/(auth)/sign-up')}><Text style={[styles.link, { color: colors.primary }]}>New here? Create an account</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, padding: 25, paddingTop: 108, gap: 14 }, kicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6 }, title: { fontSize: 32, lineHeight: 38, fontWeight: '600' }, copy: { fontSize: 14, lineHeight: 21, marginBottom: 12 }, input: { borderWidth: 1, borderRadius: 15, minHeight: 53, paddingHorizontal: 15, fontSize: 15 }, button: { minHeight: 53, borderRadius: 27, justifyContent: 'center', alignItems: 'center', marginTop: 7 }, buttonText: { fontSize: 14, fontWeight: '700' }, link: { textAlign: 'center', fontSize: 13, fontWeight: '600', marginTop: 8 }, error: { fontSize: 12 }, dim: { opacity: 0.6 } });