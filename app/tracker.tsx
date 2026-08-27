import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppleHealthKit, {
  type HealthInputOptions,
  type HealthKitPermissions,
  type HealthValue,
} from "react-native-health";

const TRACKER_KEY = "nourish_inflammation_log";
const REMINDER_KEY = "nourish_daily_reminder";
const REMINDER_ID = "daily-tracker-reminder";
const HEALTH_SYNC_KEY = "nourish_healthkit_sleep_sync";

// react-native-health has no Android implementation and is unavailable inside
// Expo Go / any build that hasn't linked the native module yet — in those
// cases the library falls back to a plain object with no methods, so this
// check doubles as our "is the real feature usable right now" guard.
const HEALTHKIT_AVAILABLE =
  Platform.OS === "ios" && typeof AppleHealthKit?.initHealthKit === "function";

// react-native-health's .d.ts types every sample's `value` as `number`, but
// sleep analysis samples actually report a category string (INBED / ASLEEP /
// CORE / DEEP / REM) — this local type reflects the real runtime shape.
type SleepSampleValue = { startDate: string; endDate: string; value: string };

// A HealthKit "sleep analysis" query returns overlapping INBED / ASLEEP /
// stage (CORE, DEEP, REM) samples for one or more nights. To estimate last
// night's total sleep we take the most recent block of samples (anything
// ending within ~20h of the newest sample, which safely spans one night)
// and sum the actually-asleep stages, falling back to INBED if the device
// only reports basic sleep/wake state.
function computeLastNightSleepHours(samples: SleepSampleValue[]): number | null {
  if (!samples.length) return null;
  const sorted = [...samples].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  );
  const mostRecentEnd = new Date(sorted[0].endDate).getTime();
  const windowStart = mostRecentEnd - 20 * 60 * 60 * 1000;
  const inWindow = samples.filter((s) => new Date(s.endDate).getTime() > windowStart);

  const asleepValues = new Set(["ASLEEP", "CORE", "DEEP", "REM"]);
  const asleepSamples = inWindow.filter((s) => asleepValues.has(s.value));
  const relevant = asleepSamples.length > 0 ? asleepSamples : inWindow.filter((s) => s.value === "INBED");
  if (!relevant.length) return null;

  const totalMs = relevant.reduce(
    (sum, s) => sum + (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()),
    0,
  );
  const hours = totalMs / (1000 * 60 * 60);
  if (!Number.isFinite(hours) || hours <= 0) return null;
  return Math.min(14, Math.round(hours * 2) / 2); // snap to the same 0.5h steps as the manual +/- control
}

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function scheduleDailyReminder(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Notifications Off",
      "To get a daily check-in reminder, allow notifications for Nourish in your phone's Settings.",
      [{ text: "OK" }],
    );
    return false;
  }
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Daily Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: "Daily check-in",
      body: "Take 30 seconds to log your pain, mood, and sleep.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
      channelId: Platform.OS === "android" ? "reminders" : undefined,
    },
  });
  return true;
}

async function cancelDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
}

const JOINTS = [
  "Hands", "Wrists", "Elbows", "Shoulders",
  "Hips", "Knees", "Ankles", "Feet",
];

type DayLog = {
  date: string;        // YYYY-MM-DD
  pain: number;        // 1–10
  mood: number;        // 1–10 (replaces energy)
  energy?: number;     // legacy field — migrated on load
  sleep: number;       // hours
  joints: string[];
  notes: string;
};

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(key: string): string {
  const [y, m, d] = key.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
}

function ScaleRow({
  label, icon, value, color, onChange,
}: {
  label: string; icon: string; value: number; color: string; onChange: (v: number) => void;
}) {
  return (
    <View style={sc.row}>
      <View style={sc.labelRow}>
        <Ionicons name={icon as any} size={15} color={color} />
        <Text style={sc.label}>{label}</Text>
        <Text style={[sc.value, { color }]}>{value}<Text style={sc.outOf}>/10</Text></Text>
      </View>
      <View style={sc.dots}>
        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
          <Pressable key={n} onPress={() => onChange(n)} style={[sc.dot, { backgroundColor: n <= value ? color : "rgba(255,255,255,0.1)" }]} hitSlop={6} />
        ))}
      </View>
    </View>
  );
}

const sc = StyleSheet.create({
  row: { gap: 10, marginBottom: 4 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { flex: 1, color: "rgba(30,22,0,0.75)", fontSize: 14, fontFamily: "Inter_500Medium" },
  value: { fontSize: 18, fontFamily: "Inter_700Bold" },
  outOf: { fontSize: 12, color: "rgba(30,22,0,0.4)", fontFamily: "Inter_400Regular" },
  dots: { flexDirection: "row", gap: 5 },
  dot: { flex: 1, height: 8, borderRadius: 4 },
});

export default function TrackerScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [log, setLog] = useState<DayLog>({
    date: todayKey(),
    pain: 0,
    mood: 5,
    sleep: 7,
    joints: [],
    notes: "",
  });
  const [history, setHistory] = useState<DayLog[]>([]);
  const [saved, setSaved] = useState(false);
  const [reminderOn, setReminderOn] = useState(false);
  const [healthSyncOn, setHealthSyncOn] = useState(false);
  const [healthSyncing, setHealthSyncing] = useState(false);
  const [lastHealthSync, setLastHealthSync] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(REMINDER_KEY).then((v) => setReminderOn(v === "on"));
  }, []);

  const syncSleepFromHealthKit = useCallback((): Promise<boolean> => {
    if (!HEALTHKIT_AVAILABLE) return Promise.resolve(false);
    setHealthSyncing(true);
    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        ascending: false,
        limit: 60,
      };
      AppleHealthKit.getSleepSamples(options, (err: string, results: HealthValue[]) => {
        setHealthSyncing(false);
        if (err || !results) { resolve(false); return; }
        const hours = computeLastNightSleepHours(results as unknown as SleepSampleValue[]);
        if (hours != null) {
          setLog((p) => ({ ...p, sleep: hours }));
          setSaved(false);
          setLastHealthSync(new Date().toLocaleString([], { hour: "numeric", minute: "2-digit" }));
        }
        resolve(hours != null);
      });
    });
  }, []);

  const toggleHealthSync = useCallback(async (next: boolean) => {
    if (next) {
      if (!HEALTHKIT_AVAILABLE) {
        Alert.alert(
          "Not Available Yet",
          "Apple Health sync requires the Nourish app installed from the App Store or TestFlight with this update — it isn't available in this preview.",
          [{ text: "OK" }],
        );
        return;
      }
      const permissions: HealthKitPermissions = {
        permissions: {
          read: [AppleHealthKit.Constants.Permissions.SleepAnalysis],
          write: [],
        },
      };
      AppleHealthKit.initHealthKit(permissions, async (error: string) => {
        if (error) {
          Alert.alert(
            "Health Access Needed",
            "To sync sleep automatically, allow Health access for Nourish in Settings → Privacy & Security → Health → Nourish.",
            [{ text: "OK" }],
          );
          return;
        }
        setHealthSyncOn(true);
        await AsyncStorage.setItem(HEALTH_SYNC_KEY, "on");
        await syncSleepFromHealthKit();
      });
    } else {
      setHealthSyncOn(false);
      await AsyncStorage.setItem(HEALTH_SYNC_KEY, "off");
    }
  }, [syncSleepFromHealthKit]);

  // Load Health sync preference, and pull the latest sleep data if it's on
  useEffect(() => {
    AsyncStorage.getItem(HEALTH_SYNC_KEY).then((v) => {
      if (v === "on") {
        setHealthSyncOn(true);
        if (HEALTHKIT_AVAILABLE) syncSleepFromHealthKit();
      }
    });
  }, [syncSleepFromHealthKit]);

  const toggleReminder = useCallback(async (next: boolean) => {
    if (Platform.OS === "web") return;
    if (next) {
      const ok = await scheduleDailyReminder();
      if (!ok) return;
      setReminderOn(true);
      await AsyncStorage.setItem(REMINDER_KEY, "on");
    } else {
      await cancelDailyReminder();
      setReminderOn(false);
      await AsyncStorage.setItem(REMINDER_KEY, "off");
    }
  }, []);

  // Load today + history; migrate legacy energy → mood
  useEffect(() => {
    AsyncStorage.getItem(TRACKER_KEY).then((raw) => {
      if (!raw) return;
      const all: DayLog[] = JSON.parse(raw).map((l: any) => ({
        ...l,
        mood: l.mood ?? l.energy ?? 5,
      }));
      const today = all.find((l) => l.date === todayKey());
      if (today) { setLog(today); setSaved(true); }
      setHistory(all.filter((l) => l.date !== todayKey()).slice(-14).reverse());
    });
  }, []);

  const toggleJoint = (j: string) => {
    setLog((prev) => ({
      ...prev,
      joints: prev.joints.includes(j) ? prev.joints.filter((x) => x !== j) : [...prev.joints, j],
    }));
    setSaved(false);
  };

  const save = useCallback(async () => {
    const raw = await AsyncStorage.getItem(TRACKER_KEY);
    const all: DayLog[] = raw ? JSON.parse(raw) : [];
    const filtered = all.filter((l) => l.date !== todayKey());
    const updated = [...filtered, { ...log, date: todayKey() }];
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(updated));
    setSaved(true);
    setHistory(updated.filter((l) => l.date !== todayKey()).slice(-14).reverse());
    Alert.alert("Saved", "Today's log has been saved.", [{ text: "Great" }]);
  }, [log]);

  const painColor = log.pain <= 3 ? "#4caf82" : log.pain <= 6 ? "#e8a63a" : "#e05252";
  const moodColor = log.mood >= 7 ? "#4caf82" : log.mood >= 4 ? "#e8a63a" : "#e05252";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <LinearGradient
        colors={["#fffef5", "#fdf6e3", "#fffef5"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#c9a227" />
        </Pressable>
        <View style={styles.headerBadge}>
          <Ionicons name="pulse" size={12} color="#c9a227" />
          <Text style={styles.headerBadgeText}>MEMBER TOOL</Text>
        </View>
        <Text style={styles.headerTitle}>Inflammation Tracker</Text>
        <Text style={styles.headerSub}>Log daily. Spot patterns. Heal smarter.</Text>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={13} color="rgba(201,162,39,0.6)" />
          <Text style={styles.dateText}>{formatDate(todayKey())}</Text>
          {saved && (
            <View style={styles.savedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#4caf82" />
              <Text style={styles.savedText}>Saved</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Today's log */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TODAY'S CHECK-IN</Text>

        <View style={styles.card}>
          <ScaleRow
            label="Pain Level"
            icon="body-outline"
            value={log.pain}
            color={painColor}
            onChange={(v) => { setLog((p) => ({ ...p, pain: v })); setSaved(false); }}
          />
          <View style={styles.divider} />
          <ScaleRow
            label="Mood"
            icon="happy-outline"
            value={log.mood}
            color={moodColor}
            onChange={(v) => { setLog((p) => ({ ...p, mood: v })); setSaved(false); }}
          />
          <View style={styles.divider} />

          {/* Sleep */}
          <View style={styles.sleepRow}>
            <Ionicons name="moon-outline" size={15} color="#7b9fd4" />
            <Text style={styles.sleepLabel}>Hours Slept</Text>
            <View style={styles.sleepControls}>
              <Pressable onPress={() => { setLog((p) => ({ ...p, sleep: Math.max(0, p.sleep - 0.5) })); setSaved(false); }} hitSlop={10} style={styles.sleepBtn}>
                <Ionicons name="remove" size={18} color="#c9a227" />
              </Pressable>
              <Text style={styles.sleepValue}>{log.sleep}<Text style={styles.sleepUnit}>h</Text></Text>
              <Pressable onPress={() => { setLog((p) => ({ ...p, sleep: Math.min(14, p.sleep + 0.5) })); setSaved(false); }} hitSlop={10} style={styles.sleepBtn}>
                <Ionicons name="add" size={18} color="#c9a227" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Apple Health sleep sync */}
        <View style={styles.healthSyncCard}>
          <View style={styles.healthSyncHeader}>
            <Ionicons name="watch-outline" size={16} color="#7b9fd4" />
            <View style={{ flex: 1 }}>
              <Text style={styles.healthSyncTitle}>Sync Sleep from Apple Health</Text>
              <Text style={styles.healthSyncSub}>
                {Platform.OS === "ios"
                  ? "Auto-fill your nightly sleep hours from your iPhone or Apple Watch."
                  : "Available for iPhone users — syncs automatically from Apple Health."}
              </Text>
            </View>
            {Platform.OS === "ios" && (
              <Switch
                value={healthSyncOn}
                onValueChange={toggleHealthSync}
                disabled={healthSyncing}
                trackColor={{ false: "rgba(30,22,0,0.15)", true: "#7b9fd4" }}
                thumbColor="#fffef5"
              />
            )}
          </View>
          {Platform.OS === "ios" && healthSyncOn && (
            <Pressable
              onPress={() => syncSleepFromHealthKit()}
              disabled={healthSyncing}
              style={({ pressed }) => [styles.healthSyncNowBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="refresh" size={13} color="#4a72b8" />
              <Text style={styles.healthSyncNowText}>
                {healthSyncing ? "Syncing…" : lastHealthSync ? `Last synced ${lastHealthSync}` : "Sync now"}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Daily reminder */}
        {Platform.OS !== "web" && (
          <View style={styles.reminderCard}>
            <Ionicons name="notifications-outline" size={15} color="#c9a227" />
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderTitle}>Daily Reminder</Text>
              <Text style={styles.reminderSub}>A gentle nudge at 9:00 AM to log your check-in</Text>
            </View>
            <Switch
              value={reminderOn}
              onValueChange={toggleReminder}
              trackColor={{ false: "rgba(30,22,0,0.15)", true: "#c9a227" }}
              thumbColor="#fffef5"
            />
          </View>
        )}

        {/* Joint selection */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>FLARING JOINTS</Text>
        <Text style={styles.sectionSub}>Tap any that are bothering you today</Text>
        <View style={styles.jointGrid}>
          {JOINTS.map((j) => {
            const active = log.joints.includes(j);
            return (
              <Pressable
                key={j}
                onPress={() => toggleJoint(j)}
                style={[styles.jointChip, active && styles.jointChipActive]}
              >
                <Text style={[styles.jointText, active && styles.jointTextActive]}>{j}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Notes */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>NOTES</Text>
        <Text style={styles.sectionSub}>What did you eat? Anything different today?</Text>
        <TextInput
          style={styles.notesInput}
          value={log.notes}
          onChangeText={(t) => { setLog((p) => ({ ...p, notes: t })); setSaved(false); }}
          placeholder="e.g. Had salmon for lunch, skipped sugar, slept early…"
          placeholderTextColor="rgba(30,22,0,0.3)"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Save button */}
        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
          onPress={save}
        >
          <LinearGradient colors={["#c9a227", "#a07a10"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtnGrad}>
            <Ionicons name="save-outline" size={18} color="#0d0b00" />
            <Text style={styles.saveBtnText}>Save Today's Log</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Trend Chart */}
      <View style={[styles.section, { paddingTop: 4 }]}>
        <Text style={styles.sectionTitle}>7-DAY TREND</Text>
        <View style={styles.chartCard}>
          {/* Legend */}
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#e05252" }]} />
              <Text style={styles.legendLabel}>Pain</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#7b9fd4" }]} />
              <Text style={styles.legendLabel}>Mood</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#a3c96e" }]} />
              <Text style={styles.legendLabel}>Sleep (÷1.4)</Text>
            </View>
          </View>

          {/* Y-axis labels + bars */}
          <View style={styles.chartBody}>
            <View style={styles.yAxis}>
              {[10, 8, 6, 4, 2].map((n) => (
                <Text key={n} style={styles.yLabel}>{n}</Text>
              ))}
            </View>
            <View style={styles.chartArea}>
              {/* Horizontal grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} style={[styles.gridLine, { bottom: `${i * 25}%` as any }]} />
              ))}
              {/* Bars for last 7 days */}
              {(() => {
                const days: { label: string; pain: number; mood: number; sleep: number }[] = [];
                for (let i = 6; i >= 0; i--) {
                  const d = new Date();
                  d.setDate(d.getDate() - i);
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
                  const label = i === 0 ? "Today" : dayNames[d.getDay()];
                  const entry = [...history, saved ? { ...log, date: todayKey() } : null].find((e) => e && e.date === key);
                  days.push({ label, pain: entry?.pain ?? 0, mood: entry?.mood ?? (entry as any)?.energy ?? 0, sleep: entry ? Math.min(10, Math.round((entry.sleep / 14) * 10)) : 0 });
                }
                return days.map((day, idx) => (
                  <View key={idx} style={styles.barGroup}>
                    <View style={styles.bars}>
                      <View style={styles.barWrap}>
                        <View style={[styles.bar, { height: `${day.pain * 10}%` as any, backgroundColor: day.pain <= 3 ? "#4caf82" : day.pain <= 6 ? "#e8a63a" : "#e05252" }]} />
                      </View>
                      <View style={styles.barWrap}>
                        <View style={[styles.bar, { height: `${day.mood * 10}%` as any, backgroundColor: "#7b9fd4" }]} />
                      </View>
                      <View style={styles.barWrap}>
                        <View style={[styles.bar, { height: `${day.sleep * 10}%` as any, backgroundColor: "#a3c96e" }]} />
                      </View>
                    </View>
                    <Text style={[styles.xLabel, idx === 6 && { color: "#c9a227" }]}>{day.label}</Text>
                  </View>
                ));
              })()}
            </View>
          </View>

          {/* Summary stats */}
          {history.length > 0 && (() => {
            const recent = history.slice(0, 7);
            const avgPain = (recent.reduce((s, e) => s + e.pain, 0) / recent.length).toFixed(1);
            const avgMood = (recent.reduce((s, e) => s + e.mood, 0) / recent.length).toFixed(1);
            const avgSleep = (recent.reduce((s, e) => s + e.sleep, 0) / recent.length).toFixed(1);
            return (
              <View style={styles.statRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statVal, { color: "#e05252" }]}>{avgPain}</Text>
                  <Text style={styles.statLbl}>Avg Pain</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={[styles.statVal, { color: "#7b9fd4" }]}>{avgMood}</Text>
                  <Text style={styles.statLbl}>Avg Mood</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={[styles.statVal, { color: "#a3c96e" }]}>{avgSleep}h</Text>
                  <Text style={styles.statLbl}>Avg Sleep</Text>
                </View>
              </View>
            );
          })()}
        </View>
      </View>

      {/* History log */}
      {history.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT HISTORY</Text>
          {history.map((entry) => {
            const pColor = entry.pain <= 3 ? "#4caf82" : entry.pain <= 6 ? "#e8a63a" : "#e05252";
            return (
              <View key={entry.date} style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                  {entry.joints.length > 0 && (
                    <Text style={styles.historyJoints}>{entry.joints.join(", ")}</Text>
                  )}
                </View>
                <View style={styles.historyRight}>
                  <View style={styles.historyBadge}>
                    <Text style={styles.historyBadgeLabel}>Pain</Text>
                    <Text style={[styles.historyBadgeValue, { color: pColor }]}>{entry.pain}</Text>
                  </View>
                  <View style={styles.historyBadge}>
                    <Text style={styles.historyBadgeLabel}>Mood</Text>
                    <Text style={[styles.historyBadgeValue, { color: "#7b9fd4" }]}>{entry.mood}</Text>
                  </View>
                  <View style={styles.historyBadge}>
                    <Text style={styles.historyBadgeLabel}>Sleep</Text>
                    <Text style={[styles.historyBadgeValue, { color: "#a3c96e" }]}>{entry.sleep}h</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#faf8f2" },
  header: { paddingHorizontal: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: "rgba(138,105,20,0.12)" },
  backBtn: { marginBottom: 20, alignSelf: "flex-start" },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  headerBadgeText: { color: "#8a6914", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  headerTitle: { color: "#1e1400", fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 6 },
  headerSub: { color: "rgba(30,20,0,0.45)", fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 16 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { color: "#8a6914", fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  savedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  savedText: { color: "#2e8a55", fontSize: 12, fontFamily: "Inter_500Medium" },
  section: { padding: 16, gap: 12 },
  sectionTitle: { color: "#8a6914", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  sectionSub: { color: "rgba(30,20,0,0.4)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -6 },
  card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 18, gap: 16, borderWidth: 1, borderColor: "rgba(138,105,20,0.15)", shadowColor: "#c9a227", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  healthSyncCard: { marginHorizontal: 16, marginTop: 10, marginBottom: 4, padding: 12, backgroundColor: "rgba(123,159,212,0.08)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(123,159,212,0.2)", gap: 10 },
  healthSyncHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  healthSyncTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(30,22,0,0.8)" },
  healthSyncSub: { fontSize: 11.5, fontFamily: "Inter_400Regular", color: "rgba(30,22,0,0.55)", marginTop: 1, lineHeight: 16 },
  healthSyncNowBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100, backgroundColor: "rgba(74,114,184,0.1)" },
  healthSyncNowText: { fontSize: 11.5, fontFamily: "Inter_500Medium", color: "#4a72b8" },
  reminderCard: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginTop: 8, marginBottom: 4, padding: 12, backgroundColor: "rgba(201,162,39,0.07)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(201,162,39,0.25)" },
  reminderTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(30,22,0,0.8)" },
  reminderSub: { fontSize: 11.5, fontFamily: "Inter_400Regular", color: "rgba(30,22,0,0.5)", marginTop: 1, lineHeight: 16 },
  divider: { height: 1, backgroundColor: "rgba(30,20,0,0.06)" },
  sleepRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sleepLabel: { flex: 1, color: "rgba(30,22,0,0.75)", fontSize: 14, fontFamily: "Inter_500Medium" },
  sleepControls: { flexDirection: "row", alignItems: "center", gap: 16 },
  sleepBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  sleepValue: { color: "#4a72b8", fontSize: 22, fontFamily: "Inter_700Bold", minWidth: 50, textAlign: "center" },
  sleepUnit: { fontSize: 13, color: "rgba(30,22,0,0.4)", fontFamily: "Inter_400Regular" },
  jointGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  jointChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, backgroundColor: "rgba(30,20,0,0.04)", borderWidth: 1, borderColor: "rgba(30,20,0,0.12)" },
  jointChipActive: { backgroundColor: "rgba(138,105,20,0.12)", borderColor: "#8a6914" },
  jointText: { color: "rgba(30,20,0,0.55)", fontSize: 13, fontFamily: "Inter_500Medium" },
  jointTextActive: { color: "#8a6914" },
  notesInput: { backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "rgba(138,105,20,0.15)", padding: 14, color: "#1e1400", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, minHeight: 100 },
  saveBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  saveBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
  saveBtnText: { color: "#ffffff", fontSize: 16, fontFamily: "Inter_700Bold" },
  historyRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(30,20,0,0.06)", gap: 12 },
  historyLeft: { flex: 1, gap: 3 },
  historyDate: { color: "rgba(30,20,0,0.75)", fontSize: 13, fontFamily: "Inter_500Medium" },
  historyJoints: { color: "rgba(30,20,0,0.4)", fontSize: 11, fontFamily: "Inter_400Regular" },
  historyRight: { flexDirection: "row", gap: 10 },
  historyBadge: { alignItems: "center", gap: 2 },
  historyBadgeLabel: { color: "rgba(30,20,0,0.4)", fontSize: 10, fontFamily: "Inter_400Regular" },
  historyBadgeValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
  // Chart
  chartCard: { backgroundColor: "#ffffff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(138,105,20,0.15)", gap: 14, shadowColor: "#c9a227", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  chartLegend: { flexDirection: "row", gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { color: "rgba(30,20,0,0.5)", fontSize: 11, fontFamily: "Inter_400Regular" },
  chartBody: { flexDirection: "row", height: 140, gap: 6 },
  yAxis: { justifyContent: "space-between", paddingVertical: 4, width: 18 },
  yLabel: { color: "rgba(30,20,0,0.3)", fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "right" },
  chartArea: { flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 4, position: "relative" },
  gridLine: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(30,20,0,0.05)" },
  barGroup: { flex: 1, alignItems: "center", gap: 4 },
  bars: { flex: 1, width: "100%", flexDirection: "row", alignItems: "flex-end", gap: 1 },
  barWrap: { flex: 1, height: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 3, minHeight: 2 },
  xLabel: { color: "rgba(30,20,0,0.4)", fontSize: 9, fontFamily: "Inter_500Medium", textAlign: "center" },
  statRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "rgba(30,20,0,0.06)", paddingTop: 12 },
  stat: { flex: 1, alignItems: "center", gap: 3 },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLbl: { color: "rgba(30,20,0,0.4)", fontSize: 11, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, backgroundColor: "rgba(30,20,0,0.08)" },
});
