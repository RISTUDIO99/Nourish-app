import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { GROCERY_BUNDLES } from "@/data/templates";

const COLOR = "#b5813a";
const STORAGE_KEY = "nourish:template:grocery:checked";

export default function GroceryBundlesTemplate() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const [activeBundle, setActiveBundle] = useState("standard");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => { if (v) setChecked(JSON.parse(v)); });
  }, []);

  const toggle = async (key: string) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const bundle = GROCERY_BUNDLES.find((b) => b.id === activeBundle)!;
  const allItems = bundle.items.flatMap((cat) => cat.items.map((item) => `${activeBundle}:${cat.category}:${item}`));
  const doneCount = allItems.filter((k) => checked[k]).length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 80 + bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: COLOR }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerLabel}>Premium Template</Text>
        <Text style={styles.headerTitle}>Grocery Bundles</Text>
        <Text style={styles.headerSub}>Pre-built anti-inflammatory shopping lists. Pick your bundle and shop.</Text>
      </View>

      {/* Bundle Selector */}
      <View style={[styles.bundleSelector, { backgroundColor: colors.muted, margin: 16 }]}>
        {GROCERY_BUNDLES.map((b) => (
          <Pressable
            key={b.id}
            style={[styles.bundleBtn, activeBundle === b.id && { backgroundColor: COLOR }]}
            onPress={() => setActiveBundle(b.id)}
          >
            <Text style={[styles.bundleBtnText, { color: activeBundle === b.id ? "#fff" : colors.mutedForeground }]}>
              {b.name.replace(" Bundle", "")}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.content}>
        <View style={[styles.bundleInfo, { backgroundColor: colors.card, borderColor: COLOR }]}>
          <View style={styles.bundleInfoTop}>
            <View>
              <Text style={[styles.bundleName, { color: colors.foreground }]}>{bundle.name}</Text>
              <Text style={[styles.bundleBudget, { color: COLOR }]}>{bundle.budget}</Text>
            </View>
            <View style={[styles.progressBadge, { backgroundColor: COLOR + "20" }]}>
              <Text style={[styles.progressBadgeText, { color: COLOR }]}>{doneCount}/{allItems.length}</Text>
            </View>
          </View>
          <Text style={[styles.bundleDesc, { color: colors.mutedForeground }]}>{bundle.description}</Text>
        </View>

        {bundle.items.map((cat) => (
          <View key={cat.category} style={styles.catSection}>
            <Text style={[styles.catTitle, { color: colors.foreground }]}>{cat.category}</Text>
            <View style={[styles.catCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {cat.items.map((item, i) => {
                const key = `${activeBundle}:${cat.category}:${item}`;
                const isDone = !!checked[key];
                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.itemRow,
                      i < cat.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                      isDone && { backgroundColor: COLOR + "07" },
                    ]}
                    onPress={() => toggle(key)}
                  >
                    <View style={[styles.checkCircle, {
                      borderColor: isDone ? COLOR : colors.border,
                      backgroundColor: isDone ? COLOR : "transparent",
                    }]}>
                      {isDone && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                    <Text style={[styles.itemText, { color: isDone ? colors.mutedForeground : colors.foreground }, isDone && { textDecorationLine: "line-through" }]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Pressable
          style={[styles.resetBtn, { borderColor: colors.border }]}
          onPress={async () => {
            const next = { ...checked };
            allItems.forEach((k) => delete next[k]);
            setChecked(next);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          }}
        >
          <Ionicons name="refresh-outline" size={16} color={colors.mutedForeground} />
          <Text style={[styles.resetText, { color: colors.mutedForeground }]}>Reset This Bundle</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  backBtn: { paddingVertical: 12 },
  headerLabel: { color: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  headerTitle: { color: "#fff", fontSize: 30, fontFamily: "Inter_700Bold", marginBottom: 8 },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  bundleSelector: { flexDirection: "row", borderRadius: 10, padding: 4 },
  bundleBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: "center" },
  bundleBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 16, gap: 4 },
  bundleInfo: { borderRadius: 14, borderWidth: 2, padding: 16, marginBottom: 16 },
  bundleInfoTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 },
  bundleName: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 2 },
  bundleBudget: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  progressBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  progressBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  bundleDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  catSection: { marginBottom: 16 },
  catTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 8 },
  catCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13 },
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  itemText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  resetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 13, borderRadius: 10, borderWidth: 1, marginTop: 4, marginBottom: 16 },
  resetText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
