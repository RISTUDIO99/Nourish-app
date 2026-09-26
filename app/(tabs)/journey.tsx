import { useEffect, useState, useCallback, useRef } from 'react';
import { ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightImpact, successFeedback } from '@/lib/feedback';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';

type EnergyLevel = 'low' | 'steady' | 'bright';
type JourneyState = Record<number, { completed: boolean; energy?: EnergyLevel }>;

const JOURNEY_DAYS = [
  { day: 1, title: 'Finding your baseline', prompt: 'Notice how you feel today without judgment. What does your body need most right now?' },
  { day: 2, title: 'Gentle hydration', prompt: 'Water supports every cell. Have you had a glass of water or a soothing tea recently?' },
  { day: 3, title: 'Honoring fatigue', prompt: 'Rest is not a luxury, it is a requirement. Where can you find 10 minutes of quiet today?' },
  { day: 4, title: 'Nourishing choices', prompt: 'Food is information for your body. What is one small, supportive choice you made today?' },
  { day: 5, title: 'Soft movement', prompt: 'Movement can be gentle. A simple stretch or walking to the next room counts.' },
  { day: 6, title: 'Mindful breathing', prompt: 'Take three slow breaths. Notice the air moving in and out. That is enough.' },
  { day: 7, title: 'Looking forward', prompt: 'You have completed a week of gentle attention. How will you carry this forward?' },
];

const DAILY_QUOTES = [
  'Small acts of nourishment still count.',
  'You do not have to rush to care for yourself well.',
  'Gentle progress is still meaningful progress.',
  'Your body deserves patience, especially on difficult days.',
  'Rest can be part of moving forward.',
  'Today’s supportive choice can be beautifully simple.',
  'Listen with curiosity rather than judgment.',
  'A nourishing moment does not have to be perfect.',
  'You are allowed to begin again with kindness.',
  'Consistency can be quiet, flexible, and gentle.',
  'Caring for yourself is never time wasted.',
  'Honor what your body is asking for today.',
  'A slower day can still be a successful day.',
  'Choose what supports you, one moment at a time.',
];

const DAILY_HERO_IMAGES = [
  require('../../assets/images/nourish-wellness-1.jpg'),
  require('../../assets/images/nourish-wellness-2.jpg'),
  require('../../assets/images/nourish-wellness-3.jpg'),
  require('../../assets/images/nourish-wellness-4.jpg'),
  require('../../assets/images/nourish-wellness-5.jpg'),
  require('../../assets/images/nourish-wellness-6.jpg'),
  require('../../assets/images/nourish-wellness-7.jpg'),
];
const DAILY_QUOTE_IMAGE = require('../../assets/images/nourish-daily-quote-stones.jpg');

const STORAGE_KEY = 'nourish_journey_state';

function getLocalCalendarDay() {
  const today = new Date();
  return Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86_400_000);
}

function getDailyQuote() {
  return DAILY_QUOTES[Math.abs(getLocalCalendarDay()) % DAILY_QUOTES.length];
}

function getDailyHeroImage() {
  return DAILY_HERO_IMAGES[Math.abs(getLocalCalendarDay()) % DAILY_HERO_IMAGES.length];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

function getLocalMondayKey() {
  const today = new Date();
  const dayFromMonday = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - dayFromMonday);
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const day = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function giveFeedback() {
  lightImpact();
}

export default function JourneyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isLoaded: userLoaded, user } = useUser();
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const storageKey = user?.id ? `${STORAGE_KEY}:${user.id}:${getLocalMondayKey()}` : null;

  const [journeyState, setJourneyState] = useState<JourneyState>({});
  const [expandedDay, setExpandedDay] = useState<number>(1);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const stateRef = useRef<JourneyState>({});
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    setLoaded(false);
    setSaveError(null);
    setJourneyState({});
    stateRef.current = {};
    writeQueueRef.current = Promise.resolve();
    if (!storageKey) {
      if (userLoaded) setLoaded(true);
      return () => { active = false; };
    }

    void AsyncStorage.getItem(storageKey)
      .then((data) => {
        if (!active) return;
        if (data) {
          const parsed = JSON.parse(data) as JourneyState;
          stateRef.current = parsed;
          setJourneyState(parsed);

          const firstIncomplete = JOURNEY_DAYS.find(d => !parsed[d.day]?.completed);
          if (firstIncomplete) {
            setExpandedDay(firstIncomplete.day);
          } else {
            setExpandedDay(7);
          }
        }
      })
      .catch((error) => {
        console.error('Failed to load wellness journey', error);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => { active = false; };
  }, [storageKey, userLoaded]);

  const saveState = useCallback(async (newState: JourneyState) => {
    if (!storageKey) return;
    stateRef.current = newState;
    setJourneyState(newState);
    setSaveError(null);
    try {
      writeQueueRef.current = writeQueueRef.current
        .catch(() => undefined)
        .then(() => AsyncStorage.setItem(storageKey, JSON.stringify(newState)));
      await writeQueueRef.current;
    } catch (error) {
      console.error('Failed to save wellness journey', error);
      setSaveError('Could not save your journey on this device. Please try again.');
    }
  }, [storageKey]);

  const toggleDay = useCallback((day: number) => {
    setExpandedDay(prev => prev === day ? 0 : day);
    giveFeedback();
  }, []);

  const setEnergy = useCallback(async (day: number, energy: EnergyLevel) => {
    const current = stateRef.current[day] || { completed: false };
    const newState = { ...stateRef.current, [day]: { ...current, energy } };
    await saveState(newState);
    giveFeedback();
  }, [saveState]);

  const toggleComplete = useCallback(async (day: number) => {
    const current = stateRef.current[day] || {};
    const isNowComplete = !current.completed;
    const newState = { ...stateRef.current, [day]: { ...current, completed: isNowComplete } };
    await saveState(newState);
    successFeedback();

    if (isNowComplete && expandedDay === day) {
      if (day < 7) {
        setTimeout(() => {
          setExpandedDay(day + 1);
        }, 600);
      }
    }
  }, [saveState, expandedDay]);

  if (!loaded) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
        <Feather name="loader" size={24} color={colors.primary} />
      </View>
    );
  }

  const completedCount = Object.values(journeyState).filter(s => s.completed).length;
  const dailyQuote = getDailyQuote();
  const dailyHeroImage = getDailyHeroImage();
  const greeting = getGreeting();

  return (
    <View style={[styles.screen, { backgroundColor: colors.card }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { backgroundColor: colors.card }]}>
          <View style={[styles.heroTextArea, { paddingTop: topInset + 18 }]}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroCopy}>
                <Text style={[styles.heroKicker, { color: colors.primary }]}>WELLNESS JOURNEY</Text>
                <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting}</Text>
                <Text style={[styles.heroTitle, { color: colors.foreground }]}>You’ve got this ♡</Text>
                <Text style={[styles.heroDescription, { color: colors.mutedForeground }]}>
                  A calmer, kinder you is always a work in progress.
                </Text>
              </View>
              <View style={styles.heroAside}>
                <View style={[styles.heroMark, { backgroundColor: colors.muted }]}>
                  <Feather name="feather" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.heroAsideText, { color: colors.mutedForeground }]}>
                  Small steps{'\n'}Brighter days{'\n'}Healthier you
                </Text>
              </View>
            </View>
          </View>
          <ImageBackground
            source={dailyHeroImage}
            resizeMode="cover"
            style={styles.heroLandscape}
          >
            <LinearGradient
              colors={[`${colors.card}15`, `${colors.card}00`, `${colors.foreground}28`]}
              locations={[0, 0.55, 1]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={[styles.landscapeNote, { color: colors.primaryForeground }]}>
              A more peaceful{'\n'}you is possible
            </Text>
          </ImageBackground>
        </View>

        <View style={[styles.journeyBody, { backgroundColor: colors.card }]}>
          <View style={styles.pathIntro}>
            {saveError ? <Text accessibilityRole="alert" style={{ color: colors.destructive, marginBottom: 12 }}>{saveError}</Text> : null}
            <View style={styles.pathTitleRow}>
              <Text style={[styles.pathTitle, { color: colors.foreground }]}>Wellness Journey</Text>
              <View style={[styles.progressBadge, { borderColor: colors.border }]}>
                <Text style={[styles.progressText, { color: colors.primary }]}>{completedCount}/7</Text>
              </View>
            </View>
            <Text style={[styles.pathKicker, { color: colors.mutedForeground }]}>Daily moments. A brighter, calmer you.</Text>
            <Text style={[styles.pathDescription, { color: colors.mutedForeground }]}>
              {completedCount === 7
                ? "You’ve completed your journey. A fresh path begins Monday."
                : "Take one step at a time. No rushing, no judgment. Your journey renews every Monday."}
            </Text>
          </View>

          <ImageBackground
            source={DAILY_QUOTE_IMAGE}
            resizeMode="cover"
            accessibilityLabel={`Daily quote: ${dailyQuote}`}
            imageStyle={styles.quoteImage}
            style={[styles.quoteCard, { borderColor: colors.border }]}
          >
            <View style={styles.quoteCopy}>
              <Text style={[styles.quoteLabel, { color: colors.mutedForeground }]}>SOFTER · STRONGER · BRIGHTER</Text>
              <Text style={[styles.quoteText, { color: colors.foreground }]}>“{dailyQuote}”</Text>
              <Text style={[styles.quoteAttribution, { color: colors.mutedForeground }]}>— NOURISH</Text>
            </View>
          </ImageBackground>

          <View style={[styles.dailyQuoteBar, { backgroundColor: colors.primary }]}>
            <Feather name="sunrise" size={20} color={colors.primaryForeground} />
            <View style={[styles.quoteBarDivider, { backgroundColor: `${colors.primaryForeground}45` }]} />
            <Text style={[styles.dailyQuoteBarText, { color: colors.primaryForeground }]}>Daily Quote</Text>
          </View>

          <View style={styles.kindDivider}>
            <View style={[styles.kindLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.kindText, { color: colors.mutedForeground }]}>A KINDER YOU TODAY</Text>
            <View style={[styles.kindLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.daysList}>
            {JOURNEY_DAYS.map((item) => {
              const state = journeyState[item.day] || { completed: false };
              const isExpanded = expandedDay === item.day;
              const isCompleted = state.completed;

              return (
                <View
                  key={item.day}
                  style={[
                    styles.dayCard,
                    { backgroundColor: `${colors.background}EE`, borderColor: isExpanded ? colors.primary : colors.border },
                    isCompleted && !isExpanded && { opacity: 0.8 }
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => toggleDay(item.day)}
                    style={styles.dayHeader}
                  >
                    <View style={styles.dayTitleRow}>
                      <View style={[styles.dayBadge, { backgroundColor: isCompleted ? colors.primary : colors.secondary }]}>
                        {isCompleted ? (
                          <Feather name="check" size={14} color={colors.primaryForeground} />
                        ) : (
                          <Text style={[styles.dayBadgeText, { color: colors.primary }]}>{item.day}</Text>
                        )}
                      </View>
                      <Text style={[styles.dayTitle, { color: isCompleted && !isExpanded ? colors.mutedForeground : colors.cardForeground }]}>
                        {item.title}
                      </Text>
                    </View>
                    <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.mutedForeground} />
                  </Pressable>

                  {isExpanded ? (
                    <View style={styles.dayContent}>
                      <Text style={[styles.dayPrompt, { color: colors.foreground }]}>{item.prompt}</Text>

                      <View style={styles.energySection}>
                        <Text style={[styles.energyLabel, { color: colors.mutedForeground }]}>How is your energy right now?</Text>
                        <View style={styles.energyOptions}>
                          {(['low', 'steady', 'bright'] as EnergyLevel[]).map(level => {
                            const isSelected = state.energy === level;
                            return (
                              <Pressable
                                key={level}
                                accessibilityRole="button"
                                onPress={() => setEnergy(item.day, level)}
                                style={[
                                  styles.energyButton,
                                  { borderColor: isSelected ? colors.primary : colors.border },
                                  isSelected && { backgroundColor: `${colors.primary}10` }
                                ]}
                              >
                                <Text style={[
                                  styles.energyButtonText,
                                  { color: isSelected ? colors.primary : colors.mutedForeground, fontWeight: isSelected ? '600' : '400' }
                                ]}>
                                  {level.charAt(0).toUpperCase() + level.slice(1)}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>

                      <Pressable
                        accessibilityRole="button"
                        onPress={() => toggleComplete(item.day)}
                        style={({ pressed }) => [
                          styles.completeButton,
                          { backgroundColor: isCompleted ? colors.secondary : colors.primary },
                          pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                        ]}
                      >
                        <Text style={[
                          styles.completeButtonText,
                          { color: isCompleted ? colors.primary : colors.primaryForeground }
                        ]}>
                          {isCompleted ? 'Completed' : 'Mark as complete'}
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  hero: { overflow: 'hidden' },
  heroTextArea: { paddingHorizontal: 22, paddingBottom: 22 },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 },
  heroCopy: { flex: 1, paddingTop: 4 },
  heroKicker: { marginBottom: 16, fontSize: 10, fontWeight: '700', letterSpacing: 1.55 },
  greeting: { fontSize: 17, lineHeight: 22, fontWeight: '500' },
  heroTitle: { marginTop: 2, fontSize: 34, lineHeight: 40, fontWeight: '600', letterSpacing: -0.9 },
  heroDescription: { marginTop: 8, maxWidth: 245, fontSize: 13.5, lineHeight: 20 },
  heroAside: { width: 90, alignItems: 'center', gap: 8 },
  heroMark: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  heroAsideText: { fontSize: 10, lineHeight: 14, fontWeight: '500', textAlign: 'center' },
  heroLandscape: { height: 205, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 20 },
  landscapeNote: { fontSize: 13, lineHeight: 18, fontWeight: '600', fontStyle: 'italic', textAlign: 'right', textShadowColor: 'rgba(0,0,0,0.18)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  journeyBody: { paddingBottom: 4 },
  pathIntro: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 18, gap: 5 },
  pathTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  pathKicker: { fontSize: 13.5, lineHeight: 19, fontWeight: '400' },
  pathTitle: { fontSize: 28, lineHeight: 34, fontWeight: '600', letterSpacing: -0.6 },
  pathDescription: { maxWidth: 330, marginTop: 5, fontSize: 12.5, lineHeight: 18 },
  progressBadge: { minHeight: 34, borderWidth: 1, borderRadius: 17, paddingHorizontal: 11, alignItems: 'center', justifyContent: 'center' },
  progressText: { fontSize: 12, fontWeight: '700' },
  quoteCard: { height: 178, marginHorizontal: 22, borderWidth: 1, borderRadius: 22, overflow: 'hidden', justifyContent: 'center' },
  quoteImage: { borderRadius: 22 },
  quoteCopy: { marginLeft: '44%', flex: 1, justifyContent: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 16 },
  quoteLabel: { fontSize: 8, lineHeight: 12, fontWeight: '700', letterSpacing: 0.7 },
  quoteText: { fontSize: 18, lineHeight: 24, fontWeight: '600', letterSpacing: -0.3 },
  quoteAttribution: { fontSize: 8.5, fontWeight: '700', letterSpacing: 1.5 },
  dailyQuoteBar: { minHeight: 62, marginHorizontal: 22, marginTop: 18, borderRadius: 31, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 },
  quoteBarDivider: { width: 1, height: 29 },
  dailyQuoteBarText: { fontSize: 20, lineHeight: 26, fontWeight: '500', letterSpacing: -0.25 },
  kindDivider: { marginHorizontal: 22, marginTop: 21, marginBottom: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  kindLine: { flex: 1, height: 1 },
  kindText: { fontSize: 8.5, fontWeight: '700', letterSpacing: 1.6 },
  daysList: { paddingHorizontal: 22, gap: 12 },
  dayCard: { borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  dayTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayBadgeText: { fontSize: 12, fontWeight: '700' },
  dayTitle: { fontSize: 16, fontWeight: '600' },
  dayContent: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 4 },
  dayPrompt: { fontSize: 15, lineHeight: 22, marginBottom: 20 },
  energySection: { marginBottom: 24 },
  energyLabel: { fontSize: 13, marginBottom: 10, fontWeight: '500' },
  energyOptions: { flexDirection: 'row', gap: 8 },
  energyButton: { flex: 1, paddingVertical: 10, borderWidth: 1, borderRadius: 12, alignItems: 'center' },
  energyButtonText: { fontSize: 13 },
  completeButton: { minHeight: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  completeButtonText: { fontSize: 14, fontWeight: '700' },
});
