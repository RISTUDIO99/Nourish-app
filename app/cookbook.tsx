import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchase } from "@/contexts/PurchaseContext";
import { api as API_ENDPOINTS } from "@/constants/api";

type Recipe = {
  id: number;
  title: string;
  description: string | null;
  ingredients: string[];
  instructions: string | null;
  notes: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

const CREAM = "#fdf8f0";
const GOLD = "#c9a227";
const DARK = "#1e1400";
const MUTED = "rgba(30,20,0,0.5)";
const BORDER = "rgba(201,162,39,0.25)";

export default function CookbookScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { token } = useAuth();
  const { tier, goToCheckout } = usePurchase();

  const hasCookbook = tier === "pro" || tier === "founder" || tier === "legacy";

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecipes = useCallback(async () => {
    if (!token || !hasCookbook) { setLoading(false); return; }
    try {
      const res = await fetch(API_ENDPOINTS.cookbookRecipes, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRecipes(data.recipes ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, hasCookbook]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const deleteRecipe = async (id: number, title: string) => {
    Alert.alert("Delete Recipe", `Remove "${title}" from your cookbook?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await fetch(`${API_ENDPOINTS.cookbookRecipes}/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            setRecipes(prev => prev.filter(r => r.id !== id));
          } catch {
            Alert.alert("Error", "Could not delete recipe.");
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={MUTED} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Cookbook</Text>
          <Text style={styles.headerSub}>Your personal recipe collection</Text>
        </View>
        {hasCookbook && (
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push({ pathname: "/cookbook-recipe" as never })}
          >
            <Ionicons name="add" size={22} color={GOLD} />
          </Pressable>
        )}
      </View>

      <View style={styles.divider} />

      {/* Gate */}
      {!hasCookbook ? (
        <View style={styles.gate}>
          <Ionicons name="book-outline" size={48} color={GOLD} />
          <Text style={styles.gateTitle}>Pro Feature</Text>
          <Text style={styles.gateSub}>Upgrade to Pro or higher to build your personal cookbook.</Text>
          <Pressable style={styles.gateBtn} onPress={goToCheckout}>
            <Text style={styles.gateBtnText}>Upgrade Now</Text>
          </Pressable>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={GOLD} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRecipes(); }} tintColor={GOLD} />}
          showsVerticalScrollIndicator={false}
        >
          {recipes.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="restaurant-outline" size={52} color={GOLD + "80"} />
              <Text style={styles.emptyTitle}>No recipes yet</Text>
               <Text style={styles.emptySub}>Tap the + button to add your first personal recipe.</Text>
              <Pressable
                style={styles.emptyBtn}
                onPress={() => router.push({ pathname: "/cookbook-recipe" as never })}
              >
                <Ionicons name="add-circle-outline" size={18} color={GOLD} />
                <Text style={styles.emptyBtnText}>Create Recipe</Text>
              </Pressable>
            </View>
          ) : (
            recipes.map(recipe => (
              <Pressable
                key={recipe.id}
                style={styles.card}
                onPress={() => router.push({ pathname: "/cookbook-recipe", params: { id: String(recipe.id) } } as never)}
              >
                {recipe.photoUrl ? (
                  <Image source={{ uri: recipe.photoUrl }} style={styles.cardPhoto} />
                ) : (
                  <View style={styles.cardPhotoPlaceholder}>
                    <Ionicons name="restaurant-outline" size={28} color={GOLD + "80"} />
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{recipe.title}</Text>
                  {recipe.description ? (
                    <Text style={styles.cardDesc} numberOfLines={2}>{recipe.description}</Text>
                  ) : null}
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardMetaText}>
                      {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? "s" : ""}
                    </Text>
                    {recipe.notes ? (
                      <>
                        <Text style={styles.cardMetaDot}>·</Text>
                        <Text style={styles.cardMetaText}>Has notes</Text>
                      </>
                    ) : null}
                  </View>
                </View>
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => deleteRecipe(recipe.id, recipe.title)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={16} color="rgba(30,20,0,0.3)" />
                </Pressable>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: DARK },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: MUTED, marginTop: 2 },
  addBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: GOLD + "18", borderWidth: 1, borderColor: GOLD + "40" },
  divider: { height: 1, backgroundColor: BORDER, marginHorizontal: 16, marginBottom: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  gate: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  gateTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: DARK, textAlign: "center" },
  gateSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: MUTED, textAlign: "center", lineHeight: 22 },
  gateBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12, backgroundColor: GOLD, alignItems: "center" },
  gateBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  empty: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: DARK },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", color: MUTED, textAlign: "center", lineHeight: 21, maxWidth: 280 },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 12, borderWidth: 1, borderColor: GOLD + "50", backgroundColor: GOLD + "12" },
  emptyBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: GOLD },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fffef8", borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 12, overflow: "hidden" },
  cardPhoto: { width: 72, height: 72, backgroundColor: GOLD + "12" },
  cardPhotoPlaceholder: { width: 72, height: 72, backgroundColor: GOLD + "10", alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1, padding: 12 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: DARK, marginBottom: 3 },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: MUTED, lineHeight: 18, marginBottom: 6 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  cardMetaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(30,20,0,0.4)" },
  cardMetaDot: { fontSize: 12, color: "rgba(30,20,0,0.25)" },
  deleteBtn: { padding: 12 },
});
