import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const COLOR = "#7a4a8a";

type JournalEntry = {
  date: string;
  mood: number;
  energy: number;
  pain: number;
  food: string;
  notes: string;
};

const today = () => new Date().toISOString().split("T")[0];
const formatDate = (d: string) => {
  const date = new Date(d + "T12:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
};

const STORAGE_KEY = "nourish:template:journal";

export default function WellnessJournalTemplate() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});
  const [viewDate, setViewDate] = useState(today());
  const [mode, setMode] = useState<"today" | "history">("today");

  const entry: JournalEntry = entries[viewDate] ?? { date: viewDate, mood: 0, energy: 0, pain: 0, food: "", notes: "" };

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => { if (v) setEntries(JSON.parse(v)); });
  }, []);

  const save = async (updated: JournalEntry) => {
    const next = { ...entries, [updated.date]: updated };
    setEntries(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const update = (field: keyof JournalEntry, value: any) => {
    save({ ...entry, [field]: value });
  };

  const ScaleRow = ({ label, field, color }: { label: string; field: "mood" | "energy" | "pain"; color: string }) => (
    <View style={styles.scaleRow}>
      <Text style={[styles.scaleLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.scaleDots}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            style={[styles.scaleDot, { borderColor: entry[field] >= n ? color : colors.border, backgroundColor: entry[field] >= n ? color : "transparent" }]}
            onPress={() => update(field, n)}
          >
            <Text style={[styles.scaleDotText, { color: entry[field] >= n ? "#fff" : colors.mutedForeground }]}>{n}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const historyDates = Object.keys(entries).sort((a, b) => b.localeCompare(a));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 80 + bottomPad }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: COLOR }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerLabel}>Premium Template</Text>
        <Text style={styles.headerTitle}>Daily Wellness Journal</Text>
        <Text style={styles.headerSub}>Track how you feel — and uncover what food and habits make the difference.</Text>
      </View>

      <View style={[styles.tabRow, { backgroundColor: colors.muted, margin: 16 }]}>
        {(["today", "history"] as const).map((t) => (
          <Pressable key={t} style={[styles.tabBtn, mode === t && { backgroundColor: COLOR }]} onPress={() => setMode(t)}>
            <Text style={[styles.tabText, { color: mode === t ? "#fff" : colors.mutedForeground }]}>
              {t === "today" ? "Today's Entry" : "History"}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === "today" && (
        <View style={styles.content}>
          <Text style={[styles.dateHeading, { color: colors.foreground }]}>{formatDate(today())}</Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>How do you feel today?</Text>
            <ScaleRow label="😊 Mood" field="mood" color={COLOR} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <ScaleRow label="⚡ Energy" field="energy" color="#b5813a" />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <ScaleRow label="🩹 Pain Level" field="pain" color="#c0392b" />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>What I Ate Today</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            placeholder="e.g. Smoothie, salmon salad, bone broth..."
            placeholderTextColor={colors.mutedForeground}
            value={entry.food}
            onChangeText={(v) => update("food", v)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Notes & Observations</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, minHeight: 100 }]}
            placeholder="How did your body respond today? Any symptoms, wins, or patterns?"
            placeholderTextColor={colors.mutedForeground}
            value={entry.notes}
            onChangeText={(v) => update("notes", v)}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <View style={[styles.savedNote, { backgroundColor: COLOR + "12" }]}>
            <Ionicons name="checkmark-circle" size={14} color={COLOR} />
            <Text style={[styles.savedNoteText, { color: COLOR }]}>Saved automatically as you type</Text>
          </View>
        </View>
      )}

      {mode === "history" && (
        <View style={styles.content}>
          {historyDates.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="journal-outline" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No entries yet</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Switch to "Today's Entry" and start tracking.</Text>
            </View>
          ) : (
            historyDates.map((date) => {
              const e = entries[date];
              return (
                <Pressable
                  key={date}
                  style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => { setViewDate(date); setMode("today"); }}
                >
                  <View style={styles.historyTop}>
                    <Text style={[styles.historyDate, { color: colors.foreground }]}>{formatDate(date)}</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                  </View>
                  <View style={styles.historyScores}>
                    {[{ label: "Mood", val: e.mood, color: COLOR }, { label: "Energy", val: e.energy, color: "#b5813a" }, { label: "Pain", val: e.pain, color: "#c0392b" }].map((s) => (
                      <View key={s.label} style={[styles.scoreChip, { backgroundColor: s.color + "18" }]}>
                        <Text style={[styles.scoreLabel, { color: s.color }]}>{s.label}</Text>
                        <Text style={[styles.scoreVal, { color: s.color }]}>{s.val > 0 ? s.val + "/5" : "—"}</Text>
                      </View>
                    ))}
                  </View>
                  {e.notes ? <Text style={[styles.historyNotes, { color: colors.mutedForeground }]} numberOfLines={2}>{e.notes}</Text> : null}
                </Pressable>
              );
            })
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: { paddingVertical: 12 },
  headerLabel: { color: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  headerTitle: { color: "#fff", fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 8, lineHeight: 34 },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  tabRow: { flexDirection: "row", borderRadius: 10, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: "center" },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 16 },
  dateHeading: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 14 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 16 },
  scaleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  scaleLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  scaleDots: { flexDirection: "row", gap: 8 },
  scaleDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  scaleDotText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginVertical: 2 },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8, marginTop: 4 },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, minHeight: 80, marginBottom: 16 },
  savedNote: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 8, marginBottom: 8 },
  savedNoteText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  emptyState: { borderRadius: 16, borderWidth: 1, borderStyle: "dashed", padding: 40, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  historyCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  historyTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  historyDate: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  historyScores: { flexDirection: "row", gap: 8, marginBottom: 8 },
  scoreChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  scoreLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  scoreVal: { fontSize: 13, fontFamily: "Inter_700Bold" },
  historyNotes: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
});
