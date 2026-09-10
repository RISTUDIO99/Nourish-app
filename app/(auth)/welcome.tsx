import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, FontAwesome6 } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useSSO } from '@clerk/expo';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

WebBrowser.maybeCompleteAuthSession();

const goals = [
  'More steady energy',
  'Gentler meal planning',
  'Less inflammation stress',
] as const;

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { startSSOFlow } = useSSO();
  const [goal, setGoal] = useState('More steady energy');
  const [activeSso, setActiveSso] = useState<'google' | 'apple' | null>(null);
  const [ssoError, setSsoError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => void WebBrowser.coolDownAsync();
  }, []);

  const beginSso = useCallback(async (strategy: 'oauth_google' | 'oauth_apple') => {
    const provider = strategy === 'oauth_google' ? 'google' : 'apple';
    setActiveSso(provider);
    setSsoError(null);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: AuthSession.makeRedirectUri({
          scheme: 'nourish-mobile',
          path: 'sso-callback',
        }),
      });

      if (!createdSessionId || !setActive) {
        setSsoError(`We couldn’t complete ${provider === 'apple' ? 'Apple' : 'Google'} sign-in. Please try again.`);
        return;
      }

      await setActive({
        session: createdSessionId,
        navigate: () => router.replace('/(tabs)'),
      });
    } catch (error) {
      console.error(`${provider} sign-in failed`, error);
      setSsoError(`We couldn’t open ${provider === 'apple' ? 'Apple' : 'Google'} sign-in. Please try again or continue with email.`);
    } finally {
      setActiveSso(null);
    }
  }, [startSSOFlow]);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 18) + 16 }}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <ImageBackground
        source={require('../../assets/images/welcome-meal.jpg')}
        resizeMode="cover"
        style={[styles.hero, { paddingTop: insets.top + 36 }]}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroShade} />
        <View style={styles.heroCopy}>
          <Text style={[styles.kicker, { color: colors.accent }]}>WELCOME TO NOURISH</Text>
          <Text style={[styles.title, { color: colors.primaryForeground }]}>A softer way to support your day.</Text>
          <Text style={[styles.body, { color: colors.primaryForeground }]}>Beautiful food, gentle guidance, and a full-access 14-day account trial.</Text>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.foreground }]}>What would feel most supportive?</Text>
        {goals.map((item) => (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityState={{ selected: goal === item }}
            onPress={() => setGoal(item)}
            style={({ pressed }) => [
              styles.option,
              {
                borderColor: goal === item ? colors.primary : colors.border,
                backgroundColor: colors.card,
              },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.optionText, { color: colors.foreground }]}>{item}</Text>
            {goal === item ? <Feather name="check-circle" color={colors.primary} size={19} /> : null}
          </Pressable>
        ))}

        <Text style={[styles.note, { color: colors.mutedForeground }]}>14 days of full Premium access · no card required</Text>

        <Pressable
          accessibilityRole="button"
          testID="continue-with-email"
          onPress={() => router.push('/(auth)/sign-up')}
          style={({ pressed }) => [
            styles.primary,
            { backgroundColor: colors.accent },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.primaryText, { color: colors.accentForeground }]}>Continue with email</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={activeSso !== null}
          testID="continue-google"
          onPress={() => void beginSso('oauth_google')}
          style={({ pressed }) => [
            styles.social,
            { borderColor: colors.border, backgroundColor: colors.card },
            (pressed || activeSso !== null) && styles.pressed,
          ]}
        >
          {activeSso === 'google' ? <ActivityIndicator color={colors.foreground} /> : (
            <>
              <FontAwesome6 name="google" color="#4285F4" size={18} />
              <Text style={[styles.socialText, { color: colors.foreground }]}>Continue with Google</Text>
            </>
          )}
        </Pressable>

        {Platform.OS !== 'android' ? (
          <Pressable
            accessibilityRole="button"
            disabled={activeSso !== null}
            testID="continue-apple"
            onPress={() => void beginSso('oauth_apple')}
            style={({ pressed }) => [
              styles.social,
              { borderColor: colors.border, backgroundColor: colors.card },
              (pressed || activeSso !== null) && styles.pressed,
            ]}
          >
            {activeSso === 'apple' ? <ActivityIndicator color={colors.foreground} /> : (
              <>
                <FontAwesome6 name="apple" color={colors.foreground} size={20} />
                <Text style={[styles.socialText, { color: colors.foreground }]}>Continue with Apple</Text>
              </>
            )}
          </Pressable>
        ) : null}

        {ssoError ? (
          <Text accessibilityRole="alert" style={[styles.error, { color: colors.destructive }]}>
            {ssoError}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(auth)/sign-in')}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={[styles.signIn, { color: colors.primary }]}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  hero: {
    minHeight: 330,
    paddingHorizontal: 26,
    paddingBottom: 30,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  heroImage: { borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 48, 35, 0.58)',
  },
  heroCopy: { maxWidth: 340 },
  kicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '600', marginTop: 12 },
  body: { fontSize: 15, lineHeight: 22, opacity: 0.92, marginTop: 12 },
  content: { paddingHorizontal: 24, paddingTop: 20, gap: 9 },
  label: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
  option: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: { fontSize: 14, fontWeight: '500' },
  note: { textAlign: 'center', fontSize: 12, marginVertical: 6 },
  primary: { minHeight: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 25 },
  primaryText: { fontWeight: '700', fontSize: 14 },
  social: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  socialText: { fontSize: 14, fontWeight: '600' },
  signIn: { textAlign: 'center', fontSize: 13, fontWeight: '600', marginTop: 8, paddingVertical: 6 },
  error: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  pressed: { opacity: 0.62 },
});