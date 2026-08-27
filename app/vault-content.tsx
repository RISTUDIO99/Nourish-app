import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Content drops ──────────────────────────────────────────────────────────
// Dates are relative to July 22, 2026 launch. Newest first.

type ContentDrop = {
  id: string;
  type: "weekly" | "monthly";
  date: string;
  label: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  icon: "newspaper-outline" | "flask-outline" | "restaurant-outline" | "leaf-outline" | "pulse-outline";
  accentColor: string;
};

const DROPS: ContentDrop[] = [
  {
    id: "week4",
    type: "weekly",
    date: "July 22, 2026",
    label: "WEEK 4",
    title: "The Omega-3 Threshold: How Much Is Actually Enough?",
    summary: "Most omega-3 supplement labels are misleading. Here's what to look for, and why the dose most people take is too low to move the needle.",
    body: "If you're taking a standard fish oil capsule and wondering why you haven't noticed a difference, the answer is probably the dose.\n\nMost over-the-counter fish oil products contain 300–500 mg of EPA+DHA combined per capsule. That sounds like a lot until you look at the research: the studies showing meaningful benefits in people with inflammatory conditions typically used 2,000–3,000 mg of EPA+DHA per day — 4–6x what most capsules contain.\n\nThe label will say \"1,000 mg fish oil\" in large print. In small print, you'll find \"EPA 180 mg · DHA 120 mg.\" That's 300 mg of the active compounds. You'd need 6–10 capsules to reach therapeutic range.\n\nWhat to look for:\n→ Triglyceride form (better absorbed than ethyl ester)\n→ Combined EPA+DHA listed clearly, not obscured by total fish oil weight\n→ Third-party tested for heavy metals\n→ At least 500 mg EPA+DHA per capsule to keep the pill count manageable\n\nI take 2,000 mg EPA+DHA daily, split between breakfast and dinner. If your fish oil doesn't show EPA and DHA amounts clearly on the label, that's a red flag.\n\nAs always: confirm the right dose for you with your doctor, especially if you're on blood thinners.",
    tags: ["Supplements", "Omega-3", "Research"],
    icon: "flask-outline",
    accentColor: "#3a8fcf",
  },
  {
    id: "week3",
    type: "weekly",
    date: "July 15, 2026",
    label: "WEEK 3",
    title: "Summer Produce Window: The 4 Anti-Inflammatory Picks to Prioritize Now",
    summary: "Certain summer fruits and vegetables hit their nutritional peak in July. Here's what's worth buying fresh this week and how to use it.",
    body: "Seasonal eating is one of the most underrated tools in an anti-inflammatory diet. When produce is harvested at peak ripeness rather than picked early for long-distance shipping, the phytonutrient content is meaningfully higher.\n\nHere are the four summer picks I'm prioritizing right now:\n\n1. Wild blueberries (not cultivated)\nHigher anthocyanin content than standard blueberries. I keep a bag of frozen wild blueberries in my freezer year-round, but fresh ones are available at farmers markets now. Add to smoothies, oatmeal, or just eat them straight.\n\n2. Tart cherries\nOne of the most researched anti-inflammatory fruits. Tart cherry juice has shown benefits in reducing markers of inflammation and improving sleep. Fresh tart cherries have a very short window — grab them now.\n\n3. Summer squash / zucchini\nHigh in antioxidants, low in lectins when young and eaten with skin on. I slice thin and sauté in avocado oil with garlic. Simple, fast, consistent.\n\n4. Fresh ginger root\nFar more potent than dried. I grate it into dressings, teas, and stir-fries. The gingerol content degrades significantly during drying. If you've been using ground ginger as your primary source, try the fresh root for a week.\n\nShopping note: for the most nutrient-dense produce, farmers markets beat most grocery stores in July.",
    tags: ["Nutrition", "Seasonal Eating", "Anti-Inflammatory"],
    icon: "leaf-outline",
    accentColor: "#4caf82",
  },
  {
    id: "week2",
    type: "weekly",
    date: "July 8, 2026",
    label: "WEEK 2",
    title: "The Sunday Batch Method: One Hour That Changes Your Entire Week",
    summary: "The most common reason people fall off an anti-inflammatory diet isn't discipline — it's friction. Here's the system I use to eliminate it.",
    body: "When a flare hits on a Tuesday at 6pm and dinner isn't prepped, you're not going to cook a full anti-inflammatory meal. You're going to order something. The Sunday batch method removes that decision from Tuesday entirely.\n\nHere's what I prep every Sunday in roughly 60 minutes:\n\nGrains (1 big batch)\nBrown rice or quinoa cooked in bone broth. Covers me for 4–5 meals. Goes into everything: bowls, stir-fries, sides.\n\nProtein (2 types)\nSalmon filets or sardines + a plant-based option (lentils or chickpeas). I don't eat the same protein two meals in a row — variety reduces the chance of sensitization.\n\nVegetables (3–4 kinds, pre-roasted)\nRoasted in avocado oil at 400°F. Sweet potatoes, broccoli, beets, zucchini. Pre-roasting takes 25–30 minutes in the oven. Having them ready means a meal is 5 minutes away.\n\nBase sauce\nA batch of tahini-lemon or ginger-tamari sauce. Keeps in the fridge all week. Makes everything taste intentional instead of like leftovers.\n\nTotal active time: ~20 minutes. The oven does the rest.\n\nWhen you have these four elements ready, you're not cooking meals — you're assembling them. That's the difference between the plan working and not.",
    tags: ["Meal Prep", "Systems", "Anti-Inflammatory"],
    icon: "restaurant-outline",
    accentColor: "#c9a227",
  },
  {
    id: "week1",
    type: "weekly",
    date: "July 1, 2026",
    label: "WEEK 1",
    title: "Reading Your Body: The Inflammation Signals Most People Miss",
    summary: "Beyond joint pain, there are subtler signs that inflammation is elevated. Learning to read them changes how you respond — before a flare gets worse.",
    body: "When most people think about RA inflammation, they think about swollen joints and pain. Those are real. But there are earlier, softer signals that I've learned to read as leading indicators — things that happen before a flare gets bad.\n\nThe signals I track:\n\nMorning stiffness duration\nJoint pain is a lagging indicator. Morning stiffness duration is leading. When it takes me more than 30 minutes to get moving comfortably, I know something is elevated — even if pain isn't bad yet.\n\nSleep quality\nInflammation and sleep have a bidirectional relationship. Poor sleep increases inflammatory markers; elevated inflammation disrupts sleep. When I start waking up multiple times or feel unrestored after a full night, it's often an inflammation signal, not a sleep problem.\n\nGut function\nThis one surprised me when I first started paying attention. Changes in gut motility, bloating, or unusual fatigue after eating often precede joint symptoms by 24–48 hours in my case. The gut-inflammation connection is real and underappreciated.\n\nEnergy curve\nA consistent post-lunch energy crash (not just tiredness — a drop) is something I track. It often correlates with what I ate for breakfast and whether I'm managing blood sugar well enough.\n\nNone of these replace clinical markers. They're personal signals that help me course-correct quickly instead of waiting until a full flare forces me to slow down.\n\nThis is what the tracker is for — building your own map over time.",
    tags: ["Inflammation", "Symptoms", "Tracking"],
    icon: "pulse-outline",
    accentColor: "#e07a40",
  },
];

const MONTHLY_PROTOCOL: ContentDrop = {
  id: "monthly-july",
  type: "monthly",
  date: "July 1, 2026",
  label: "JULY PROTOCOL",
  title: "July Anti-Inflammatory Protocol Update",
  summary: "My current stack, routine, and what I'm testing this month.",
  body: "Every month I publish a snapshot of exactly what I'm doing — what's in my stack, what I've changed, and what I'm evaluating. This isn't advice. It's transparency.\n\nCurrent daily stack (July 2026):\n→ Omega-3: 2,000 mg EPA+DHA (Sports Research, split AM/PM)\n→ Cooking oil: Avocado oil exclusively\n→ Morning: 16 oz warm water + lemon before coffee\n→ Coffee: 1 cup, before 10am, always with food\n→ Evening: tart cherry juice concentrate, 1 oz diluted in water\n\nRecent changes:\n→ Removed turmeric capsules — switched to fresh turmeric root in cooking (better bioavailability with black pepper and fat)\n→ Cut back nightshades for 30 days as an elimination experiment (still in progress)\n\nWhat I'm evaluating this month:\n→ Cold exposure (cold shower ending to morning routine) — testing whether this moves my morning stiffness duration\n→ Time-restricted eating window (8-hour window) — early results look promising for my energy curve\n\nWhat I've dropped:\n→ Proprietary \"joint support\" blends — the individual doses were too low to matter, and I couldn't evaluate what was working\n\nI'll report results in August. If you're trying anything from this list, document your baseline first so you can actually measure it.",
  tags: ["Protocol", "Monthly Update", "Stack"],
  icon: "newspaper-outline",
  accentColor: "#b06ee8",
};

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function VaultContentScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={["#fdf8f0", "#faf3e4", "#fdf8f0"]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#c9a227" />
        </Pressable>
        <View style={styles.badge}>
          <Ionicons name="newspaper" size={12} color="#c9a227" />
          <Text style={styles.badgeText}>WEEKLY PREMIUM CONTENT</Text>
        </View>
        <Text style={styles.title}>Member Content Library</Text>
        <Text style={styles.sub}>
          Research summaries, seasonal guides, meal prep systems, and Joseph's monthly protocol. New content every week.
        </Text>
      </LinearGradient>

      {/* Monthly protocol (pinned at top) */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>PINNED</Text>
        <DropCard
          drop={MONTHLY_PROTOCOL}
          expanded={expandedId === MONTHLY_PROTOCOL.id}
          onToggle={() => toggle(MONTHLY_PROTOCOL.id)}
        />
      </View>

      {/* Weekly drops */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>WEEKLY DROPS</Text>
        {DROPS.map((drop) => (
          <DropCard
            key={drop.id}
            drop={drop}
            expanded={expandedId === drop.id}
            onToggle={() => toggle(drop.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

// ─── DropCard component ─────────────────────────────────────────────────────
function DropCard({
  drop,
  expanded,
  onToggle,
}: {
  drop: ContentDrop;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle} style={({ pressed }) => [styles.dropCard, pressed && { opacity: 0.92 }]}>
      <LinearGradient
        colors={["#fffef8", "#fdf8ee"]}
        style={[styles.dropGrad, { borderColor: drop.accentColor + "25" }]}
      >
        {/* Top row */}
        <View style={styles.dropTop}>
          <View style={[styles.dropIconWrap, { backgroundColor: drop.accentColor + "15", borderColor: drop.accentColor + "30" }]}>
            <Ionicons name={drop.icon} size={18} color={drop.accentColor} />
          </View>
          <View style={styles.dropMeta}>
            <View style={styles.dropLabelRow}>
              <Text style={[styles.dropLabel, { color: drop.accentColor }]}>{drop.label}</Text>
              <Text style={styles.dropDate}>{drop.date}</Text>
            </View>
            <Text style={styles.dropTitle}>{drop.title}</Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="rgba(30,20,0,0.3)"
          />
        </View>

        {/* Summary (always visible) */}
        {!expanded && (
          <Text style={styles.dropSummary} numberOfLines={2}>{drop.summary}</Text>
        )}

        {/* Tags */}
        <View style={styles.tagRow}>
          {drop.tags.map((tag) => (
            <View key={tag} style={[styles.tag, { borderColor: drop.accentColor + "35", backgroundColor: drop.accentColor + "0a" }]}>
              <Text style={[styles.tagText, { color: drop.accentColor }]}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Expanded body */}
        {expanded && (
          <>
            <View style={[styles.bodyDivider, { backgroundColor: drop.accentColor + "20" }]} />
            <Text style={styles.dropBody}>{drop.body}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf8f0" },
  header: { paddingHorizontal: 24, paddingBottom: 28 },
  backBtn: { marginBottom: 20, alignSelf: "flex-start" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  badgeText: { color: "#c9a227", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  title: { color: "#1e1400", fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 10 },
  sub: { color: "rgba(30,20,0,0.55)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  section: { paddingHorizontal: 16, marginTop: 24, gap: 10 },
  sectionLabel: { color: "rgba(30,20,0,0.3)", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 2, marginBottom: 2 },
  dropCard: { borderRadius: 16, overflow: "hidden" },
  dropGrad: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 10 },
  dropTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  dropIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1, marginTop: 2 },
  dropMeta: { flex: 1, gap: 4 },
  dropLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dropLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  dropDate: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(30,20,0,0.3)" },
  dropTitle: { color: "#1e1400", fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  dropSummary: { color: "rgba(30,20,0,0.5)", fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  tagText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  bodyDivider: { height: 1, marginVertical: 2 },
  dropBody: { color: "rgba(30,20,0,0.65)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 22 },
});
