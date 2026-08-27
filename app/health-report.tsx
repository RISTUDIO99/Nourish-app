import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/constants/api";
import { loadProfile } from "./tracking-profile";

const CREAM = "#fdf8f0";
const GOLD = "#c9a227";
const GREEN = "#3d6b52";
const DARK = "#1e1400";
const MUTED = "rgba(30,20,0,0.5)";
const BORDER = "rgba(201,162,39,0.25)";
const CARD = "#fffef8";
const RED = "#d9534f";
const BLUE = "#4a72b8";
const PURPLE = "#7c5cbf";

const TRACKER_KEY = "nourish_inflammation_log";

type Period = { key: string; label: string; days: number };
const PERIODS: Period[] = [
  { key: "daily",   label: "Daily",        days: 1   },
  { key: "weekly",  label: "Weekly",       days: 7   },
  { key: "monthly", label: "Monthly",      days: 30  },
  { key: "semi",    label: "Semi-Annual",  days: 182 },
  { key: "annual",  label: "Annual",       days: 365 },
];

type ExportFormat = "pdf" | "text" | "markdown";

type InflammationLog = {
  date: string;
  pain: number;
  mood: number;
  sleep: number;
  notes: string;
};

type NutritionEntry = {
  date: string;
  mealType: string;
  foodName: string;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
};

function datesBetween(days: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function formatDateDisplay(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Mini bar chart rendered with Views ────────────────────────────────────────
function MiniBarChart({
  data,
  color,
  maxVal = 10,
  height = 60,
}: {
  data: { label: string; value: number }[];
  color: string;
  maxVal?: number;
  height?: number;
}) {
  const show = data.slice(-14); // max 14 bars
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height, gap: 2 }}>
      {show.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
          <View
            style={{
              width: "100%",
              height: `${Math.max(4, (d.value / maxVal) * 100)}%`,
              backgroundColor: color,
              borderRadius: 2,
              opacity: 0.85,
            }}
          />
        </View>
      ))}
    </View>
  );
}

export default function HealthReportScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { token } = useAuth();

  const [period, setPeriod] = useState<Period>(PERIODS[1]); // default: weekly
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const [inflam, setInflam] = useState<InflammationLog[]>([]);
  const [nutrition, setNutrition] = useState<NutritionEntry[]>([]);
  const [profileName, setProfileName] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Profile name
      const prof = await loadProfile();
      setProfileName(prof.name || "");

      // Inflammation from AsyncStorage
      const raw = await AsyncStorage.getItem(TRACKER_KEY);
      const allLogs: any[] = raw ? JSON.parse(raw) : [];
      const cutoff = datesBetween(period.days)[0];
      const filtered = allLogs.filter((l) => l.date >= cutoff).map((l) => ({
        date: l.date,
        pain:  l.pain  ?? 0,
        mood:  l.mood  ?? l.energy ?? 0, // migrate energy → mood
        sleep: l.sleep ?? 0,
        notes: l.notes ?? "",
      }));
      setInflam(filtered);

      // Nutrition from API
      if (token) {
        try {
          const dates = datesBetween(period.days);
          const startDate = dates[0];
          const endDate = dates[dates.length - 1];
          const res = await fetch(
            `${api.nutritionLog}?startDate=${startDate}&endDate=${endDate}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.ok) {
            const data = await res.json();
            setNutrition(data.entries ?? []);
          }
        } catch { /* silent */ }
      }
    } finally {
      setLoading(false);
    }
  }, [period, token]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const avgPain  = avg(inflam.map((l) => l.pain));
  const avgMood  = avg(inflam.map((l) => l.mood));
  const avgSleep = avg(inflam.map((l) => l.sleep));

  const totalCal  = nutrition.reduce((s, e) => s + (e.calories  ?? 0), 0);
  const totalProt = nutrition.reduce((s, e) => s + (e.proteinG  ?? 0), 0);
  const totalCarb = nutrition.reduce((s, e) => s + (e.carbsG    ?? 0), 0);
  const totalFat  = nutrition.reduce((s, e) => s + (e.fatG      ?? 0), 0);
  const days = Math.max(1, period.days === 1 ? 1 : inflam.length || period.days);
  const avgCal  = totalCal  / days;
  const avgProt = totalProt / days;
  const avgCarb = totalCarb / days;
  const avgFat  = totalFat  / days;

  const hasInflam   = inflam.length   > 0;
  const hasNutrition = nutrition.length > 0;

  // ── Chart data ──────────────────────────────────────────────────────────────
  const painData  = inflam.map((l) => ({ label: formatDateDisplay(l.date), value: l.pain  }));
  const moodData  = inflam.map((l) => ({ label: formatDateDisplay(l.date), value: l.mood  }));
  const sleepData = inflam.map((l) => ({ label: formatDateDisplay(l.date), value: Math.min(l.sleep, 10) }));

  // Group nutrition by date for calorie bar chart
  const calByDate = datesBetween(Math.min(period.days, 30)).map((date) => ({
    label: formatDateDisplay(date),
    value: nutrition.filter((e) => e.date === date).reduce((s, e) => s + (e.calories ?? 0), 0),
  }));
  const maxCal = Math.max(...calByDate.map((d) => d.value), 2000);

  // ── Export helpers ──────────────────────────────────────────────────────────
  const reportTitle = `Nourish Health Report — ${period.label}`;
  const reportDate = new Date().toLocaleDateString("en-US", { dateStyle: "long" });
  const nameStr = profileName ? ` — ${profileName}` : "";

  const generatePlainText = (): string => {
    const lines: string[] = [
      `NOURISH HEALTH REPORT${nameStr}`,
      `Period: ${period.label} | Generated: ${reportDate}`,
      "=".repeat(50),
      "",
    ];
    if (hasInflam) {
      lines.push("INFLAMMATION TRACKING", "-".repeat(30));
      lines.push(`Average Pain Level:  ${avgPain.toFixed(1)} / 10`);
      lines.push(`Average Mood:        ${avgMood.toFixed(1)} / 10`);
      lines.push(`Average Sleep:       ${avgSleep.toFixed(1)} hrs`);
      lines.push(`Days Logged:         ${inflam.length}`);
      lines.push("");
      lines.push("Daily Log:");
      inflam.forEach((l) => {
        lines.push(`  ${l.date}  Pain: ${l.pain}/10  Mood: ${l.mood}/10  Sleep: ${l.sleep}h${l.notes ? `  Notes: ${l.notes}` : ""}`);
      });
      lines.push("");
    }
    if (hasNutrition) {
      lines.push("NUTRITION TRACKING", "-".repeat(30));
      lines.push(`Avg Daily Calories:  ${avgCal.toFixed(0)} kcal`);
      lines.push(`Avg Daily Protein:   ${avgProt.toFixed(1)} g`);
      lines.push(`Avg Daily Carbs:     ${avgCarb.toFixed(1)} g`);
      lines.push(`Avg Daily Fat:       ${avgFat.toFixed(1)} g`);
      lines.push("");
    }
    lines.push("=".repeat(50));
    lines.push("Generated by Nourish — Anti-Inflammatory Meal Plan App");
    lines.push("This report is for personal use and wellness tracking only.");
    lines.push("It is not a substitute for professional medical advice.");
    return lines.join("\n");
  };

  const generateMarkdown = (): string => {
    const lines: string[] = [
      `# Nourish Health Report${nameStr}`,
      `**Period:** ${period.label} | **Generated:** ${reportDate}`,
      "",
    ];
    if (hasInflam) {
      lines.push("## 🩺 Inflammation Tracking", "");
      lines.push(`| Metric | Average |`);
      lines.push(`|--------|---------|`);
      lines.push(`| Pain Level | **${avgPain.toFixed(1)}** / 10 |`);
      lines.push(`| Mood | **${avgMood.toFixed(1)}** / 10 |`);
      lines.push(`| Sleep | **${avgSleep.toFixed(1)}** hrs |`);
      lines.push(`| Days Logged | **${inflam.length}** |`);
      lines.push("", "### Daily Log", "");
      lines.push(`| Date | Pain | Mood | Sleep | Notes |`);
      lines.push(`|------|------|------|-------|-------|`);
      inflam.forEach((l) => {
        lines.push(`| ${l.date} | ${l.pain}/10 | ${l.mood}/10 | ${l.sleep}h | ${l.notes || "—"} |`);
      });
      lines.push("");
    }
    if (hasNutrition) {
      lines.push("## 🥗 Nutrition Tracking", "");
      lines.push(`| Metric | Daily Average |`);
      lines.push(`|--------|---------------|`);
      lines.push(`| Calories | **${avgCal.toFixed(0)}** kcal |`);
      lines.push(`| Protein | **${avgProt.toFixed(1)}** g |`);
      lines.push(`| Carbs | **${avgCarb.toFixed(1)}** g |`);
      lines.push(`| Fat | **${avgFat.toFixed(1)}** g |`);
      lines.push("");
    }
    lines.push("---");
    lines.push("*Generated by Nourish — Anti-Inflammatory Meal Plan App*");
    lines.push("*This report is for personal wellness tracking only. Not a substitute for medical advice.*");
    return lines.join("\n");
  };

  const generateHTML = (): string => {
    const painBar  = inflam.map((l) => `<div class="bar" style="height:${Math.max(4, l.pain  / 10 * 80)}px;background:#d9534f"></div>`).join("");
    const moodBar  = inflam.map((l) => `<div class="bar" style="height:${Math.max(4, l.mood  / 10 * 80)}px;background:#4a72b8"></div>`).join("");
    const sleepBar = inflam.map((l) => `<div class="bar" style="height:${Math.max(4, Math.min(l.sleep, 10) / 10 * 80)}px;background:#3d6b52"></div>`).join("");
    const calBar   = calByDate.map((d) => `<div class="bar" style="height:${Math.max(4, d.value / maxCal * 80)}px;background:#c9a227"></div>`).join("");

    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body { font-family: -apple-system, Helvetica, sans-serif; color: #1e1400; background: #fdf8f0; margin: 0; padding: 32px; }
  h1 { font-size: 26px; color: #1e1400; margin-bottom: 4px; }
  .sub { color: #888; font-size: 13px; margin-bottom: 32px; }
  h2 { font-size: 17px; color: #3d6b52; border-bottom: 1px solid rgba(201,162,39,0.3); padding-bottom: 6px; margin-top: 28px; }
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
  .stat { background: #fffef8; border: 1px solid rgba(201,162,39,0.25); border-radius: 10px; padding: 14px; text-align: center; }
  .stat-val { font-size: 26px; font-weight: 700; color: #1e1400; }
  .stat-lbl { font-size: 11px; color: #888; margin-top: 2px; }
  .chart-row { display: flex; align-items: flex-end; gap: 3px; height: 80px; margin: 12px 0; }
  .bar { flex: 1; border-radius: 3px; min-height: 4px; }
  .chart-label { font-size: 11px; color: #888; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
  th { text-align: left; padding: 8px 10px; background: rgba(201,162,39,0.08); color: #888; font-weight: 600; border-bottom: 1px solid rgba(201,162,39,0.2); }
  td { padding: 7px 10px; border-bottom: 1px solid rgba(30,20,0,0.05); }
  .footer { margin-top: 40px; font-size: 11px; color: #aaa; text-align: center; border-top: 1px solid rgba(30,20,0,0.08); padding-top: 16px; }
  .legend { display: flex; gap: 16px; margin-bottom: 8px; }
  .legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #888; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
</style></head><body>
<h1>🌿 Nourish Health Report${nameStr}</h1>
<div class="sub">${period.label} Summary &nbsp;·&nbsp; Generated ${reportDate}</div>

${hasInflam ? `
<h2>🩺 Inflammation Tracking</h2>
<div class="stat-grid">
  <div class="stat"><div class="stat-val" style="color:#d9534f">${avgPain.toFixed(1)}</div><div class="stat-lbl">Avg Pain / 10</div></div>
  <div class="stat"><div class="stat-val" style="color:#4a72b8">${avgMood.toFixed(1)}</div><div class="stat-lbl">Avg Mood / 10</div></div>
  <div class="stat"><div class="stat-val" style="color:#3d6b52">${avgSleep.toFixed(1)}</div><div class="stat-lbl">Avg Sleep (hrs)</div></div>
  <div class="stat"><div class="stat-val">${inflam.length}</div><div class="stat-lbl">Days Logged</div></div>
</div>
<div class="legend">
  <div class="legend-item"><div class="legend-dot" style="background:#d9534f"></div>Pain</div>
  <div class="legend-item"><div class="legend-dot" style="background:#4a72b8"></div>Mood</div>
  <div class="legend-item"><div class="legend-dot" style="background:#3d6b52"></div>Sleep</div>
</div>
<div class="chart-label">Pain trend</div>
<div class="chart-row">${painBar}</div>
<div class="chart-label">Mood trend</div>
<div class="chart-row">${moodBar}</div>
<div class="chart-label">Sleep trend</div>
<div class="chart-row">${sleepBar}</div>
<table>
  <tr><th>Date</th><th>Pain</th><th>Mood</th><th>Sleep</th><th>Notes</th></tr>
  ${inflam.map((l) => `<tr><td>${l.date}</td><td>${l.pain}/10</td><td>${l.mood}/10</td><td>${l.sleep}h</td><td>${l.notes || "—"}</td></tr>`).join("")}
</table>` : ""}

${hasNutrition ? `
<h2>🥗 Nutrition Tracking</h2>
<div class="stat-grid">
  <div class="stat"><div class="stat-val" style="color:#c9a227">${avgCal.toFixed(0)}</div><div class="stat-lbl">Avg Cal / day</div></div>
  <div class="stat"><div class="stat-val" style="color:#d9534f">${avgProt.toFixed(1)}g</div><div class="stat-lbl">Avg Protein</div></div>
  <div class="stat"><div class="stat-val" style="color:#4a72b8">${avgCarb.toFixed(1)}g</div><div class="stat-lbl">Avg Carbs</div></div>
  <div class="stat"><div class="stat-val" style="color:#7c5cbf">${avgFat.toFixed(1)}g</div><div class="stat-lbl">Avg Fat</div></div>
</div>
<div class="chart-label">Daily calorie trend</div>
<div class="chart-row">${calBar}</div>` : ""}

<div class="footer">Generated by Nourish &nbsp;·&nbsp; Anti-Inflammatory Meal Plan App &nbsp;·&nbsp; RI Studio<br>
This report is for personal wellness tracking only. It is not medical advice and does not replace consultation with your healthcare provider.</div>
</body></html>`;
  };

  const handleExport = async (format: ExportFormat) => {
    if (!hasInflam && !hasNutrition) {
      Alert.alert("No Data", "Log some tracking data first to generate a report.");
      return;
    }
    setExporting(format);
    try {
      // Dynamic imports so native modules are only loaded when used —
      // prevents crash on builds where expo-print/sharing/file-system aren't linked yet.
      const [Print, Sharing, FileSystem] = await Promise.all([
        import("expo-print"),
        import("expo-sharing"),
        import("expo-file-system/legacy"),
      ]);

      if (format === "pdf") {
        const { uri } = await Print.printToFileAsync({ html: generateHTML(), base64: false });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
        } else {
          Alert.alert("Saved", `Report saved to: ${uri}`);
        }
      } else {
        const content = format === "markdown" ? generateMarkdown() : generatePlainText();
        const ext = format === "markdown" ? "md" : "txt";
        const filename = `${FileSystem.documentDirectory}nourish-report-${period.key}.${ext}`;
        await (FileSystem as any).writeAsStringAsync(filename, content, { encoding: (FileSystem as any).EncodingType?.UTF8 ?? "utf8" });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filename, { mimeType: "text/plain" });
        } else {
          Alert.alert("Saved", `Report saved to: ${filename}`);
        }
      }
    } catch (e) {
      Alert.alert("Export Failed", "Could not generate report. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: CREAM }}>
      <View style={[s.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={DARK} />
        </Pressable>
        <Text style={s.headerTitle}>Health Report</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Period selector */}
        <Text style={s.sectionLabel}>Report Period</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {PERIODS.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => setPeriod(p)}
                style={[s.periodBtn, period.key === p.key && s.periodBtnActive]}
              >
                <Text style={[s.periodBtnText, period.key === p.key && s.periodBtnTextActive]}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <ActivityIndicator color={GOLD} size="large" />
            <Text style={[s.emptyText, { marginTop: 12 }]}>Loading your data…</Text>
          </View>
        ) : (
          <>
            {/* Inflammation section */}
            {hasInflam ? (
              <View style={s.card}>
                <View style={s.cardHeader}>
                  <Text style={s.cardIcon}>🩺</Text>
                  <Text style={s.cardTitle}>Inflammation Tracking</Text>
                  <Text style={s.cardDays}>{inflam.length} days</Text>
                </View>
                <View style={s.statRow}>
                  <View style={s.stat}><Text style={[s.statVal, { color: RED }]}>{avgPain.toFixed(1)}</Text><Text style={s.statLbl}>Avg Pain</Text></View>
                  <View style={s.statDivider} />
                  <View style={s.stat}><Text style={[s.statVal, { color: BLUE }]}>{avgMood.toFixed(1)}</Text><Text style={s.statLbl}>Avg Mood</Text></View>
                  <View style={s.statDivider} />
                  <View style={s.stat}><Text style={[s.statVal, { color: GREEN }]}>{avgSleep.toFixed(1)}</Text><Text style={s.statLbl}>Avg Sleep (h)</Text></View>
                </View>
                {inflam.length > 1 && (
                  <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}>
                    <View>
                      <Text style={s.chartLabel}>Pain  <Text style={{ color: RED }}>●</Text></Text>
                      <MiniBarChart data={painData} color={RED} />
                    </View>
                    <View>
                      <Text style={s.chartLabel}>Mood  <Text style={{ color: BLUE }}>●</Text></Text>
                      <MiniBarChart data={moodData} color={BLUE} />
                    </View>
                    <View>
                      <Text style={s.chartLabel}>Sleep  <Text style={{ color: GREEN }}>●</Text></Text>
                      <MiniBarChart data={sleepData} color={GREEN} maxVal={10} />
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={s.emptyCard}>
                <Text style={s.emptyIcon}>🩺</Text>
                <Text style={s.emptyTitle}>No inflammation data</Text>
                <Text style={s.emptyText}>Log pain, mood, and sleep in the Inflammation Tracker to see it here.</Text>
              </View>
            )}

            {/* Nutrition section */}
            {hasNutrition ? (
              <View style={[s.card, { marginTop: 16 }]}>
                <View style={s.cardHeader}>
                  <Text style={s.cardIcon}>🥗</Text>
                  <Text style={s.cardTitle}>Nutrition Tracking</Text>
                </View>
                <View style={s.statRow}>
                  <View style={s.stat}><Text style={[s.statVal, { color: GOLD }]}>{avgCal.toFixed(0)}</Text><Text style={s.statLbl}>kcal/day</Text></View>
                  <View style={s.statDivider} />
                  <View style={s.stat}><Text style={[s.statVal, { color: RED }]}>{avgProt.toFixed(0)}g</Text><Text style={s.statLbl}>Protein</Text></View>
                  <View style={s.statDivider} />
                  <View style={s.stat}><Text style={[s.statVal, { color: BLUE }]}>{avgCarb.toFixed(0)}g</Text><Text style={s.statLbl}>Carbs</Text></View>
                  <View style={s.statDivider} />
                  <View style={s.stat}><Text style={[s.statVal, { color: PURPLE }]}>{avgFat.toFixed(0)}g</Text><Text style={s.statLbl}>Fat</Text></View>
                </View>
                {calByDate.filter((d) => d.value > 0).length > 1 && (
                  <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                    <Text style={s.chartLabel}>Daily Calories  <Text style={{ color: GOLD }}>●</Text></Text>
                    <MiniBarChart data={calByDate} color={GOLD} maxVal={maxCal} />
                  </View>
                )}
              </View>
            ) : (
              <View style={[s.emptyCard, { marginTop: 16 }]}>
                <Text style={s.emptyIcon}>🥗</Text>
                <Text style={s.emptyTitle}>No nutrition data</Text>
                <Text style={s.emptyText}>Log meals in the Nutrition Tracker to see them here.</Text>
              </View>
            )}

            {/* Export */}
            <Text style={[s.sectionLabel, { marginTop: 28 }]}>Export Report</Text>
            <Text style={s.exportHint}>Share with your doctor, nutritionist, or trainer.</Text>
            <View style={s.exportRow}>
              {(["pdf", "text", "markdown"] as ExportFormat[]).map((fmt) => {
                const icons: Record<ExportFormat, string> = { pdf: "document-text", text: "document-outline", markdown: "code-slash" };
                const labels: Record<ExportFormat, string> = { pdf: "PDF", text: "Plain Text", markdown: "Markdown" };
                const busy = exporting === fmt;
                return (
                  <Pressable
                    key={fmt}
                    style={[s.exportBtn, busy && { opacity: 0.6 }]}
                    onPress={() => handleExport(fmt)}
                    disabled={exporting !== null}
                  >
                    {busy ? (
                      <ActivityIndicator size="small" color={GREEN} />
                    ) : (
                      <Ionicons name={icons[fmt] as any} size={22} color={GREEN} />
                    )}
                    <Text style={s.exportBtnText}>{labels[fmt]}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Disclaimer */}
            <View style={s.disclaimerCard}>
              <Text style={s.disclaimerText}>
                This report is for personal wellness tracking only. It is not medical advice and does not replace consultation with your healthcare provider, nutritionist, or trainer.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, backgroundColor: CREAM, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold", color: DARK },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: MUTED, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 },
  periodBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  periodBtnActive: { backgroundColor: GREEN, borderColor: GREEN },
  periodBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: MUTED },
  periodBtnTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },
  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BORDER },
  cardIcon: { fontSize: 18 },
  cardTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: DARK },
  cardDays: { fontSize: 12, fontFamily: "Inter_400Regular", color: MUTED },
  statRow: { flexDirection: "row", paddingVertical: 16 },
  stat: { flex: 1, alignItems: "center", gap: 3 },
  statVal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular", color: MUTED },
  statDivider: { width: 1, backgroundColor: BORDER },
  chartLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: MUTED, marginBottom: 6 },
  emptyCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 24, alignItems: "center", gap: 8 },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: DARK },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", color: MUTED, textAlign: "center", lineHeight: 19 },
  exportHint: { fontSize: 13, fontFamily: "Inter_400Regular", color: MUTED, marginBottom: 14, marginTop: -4 },
  exportRow: { flexDirection: "row", gap: 10 },
  exportBtn: { flex: 1, backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingVertical: 14, alignItems: "center", gap: 6 },
  exportBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: GREEN },
  disclaimerCard: { marginTop: 20, padding: 14, backgroundColor: "rgba(30,20,0,0.03)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(30,20,0,0.06)" },
  disclaimerText: { fontSize: 11, fontFamily: "Inter_400Regular", color: MUTED, lineHeight: 17, textAlign: "center" },
});
