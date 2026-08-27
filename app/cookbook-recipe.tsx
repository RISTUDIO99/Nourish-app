import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { api as API_ENDPOINTS } from "@/constants/api";

const CREAM = "#fdf8f0";
const GOLD = "#c9a227";
const DARK = "#1e1400";
const MUTED = "rgba(30,20,0,0.5)";
const BORDER = "rgba(201,162,39,0.25)";
const CARD = "#fffef8";

export default function CookbookRecipeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { token } = useAuth();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!params.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const loadRecipe = useCallback(async () => {
    if (!params.id || !token) return;
    try {
      const res = await fetch(API_ENDPOINTS.cookbookRecipes, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const recipe = (data.recipes ?? []).find((r: any) => String(r.id) === params.id);
      if (recipe) {
        setTitle(recipe.title);
        setDescription(recipe.description ?? "");
        setIngredients(recipe.ingredients.length ? recipe.ingredients : [""]);
        setInstructions(recipe.instructions ?? "");
        setNotes(recipe.notes ?? "");
        setExistingPhotoUrl(recipe.photoUrl);
      }
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => { if (isEdit) loadRecipe(); }, [isEdit, loadRecipe]);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to add a recipe photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const addIngredient = () => setIngredients(prev => [...prev, ""]);
  const updateIngredient = (idx: number, val: string) =>
    setIngredients(prev => prev.map((item, i) => (i === idx ? val : item)));
  const removeIngredient = (idx: number) =>
    setIngredients(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : [""]);

  const uploadPhoto = async (recipeId: number): Promise<void> => {
    if (!photoUri || !token) return;
    try {
      const filename = `photo-${Date.now()}.jpg`;
      const urlRes = await fetch(`${API_ENDPOINTS.cookbookRecipes}/${recipeId}/photo-url`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ filename, contentType: "image/jpeg" }),
      });
      const { uploadUrl } = await urlRes.json();
      const blob = await (await fetch(photoUri)).blob();
      await fetch(uploadUrl, { method: "PUT", body: blob, headers: { "Content-Type": "image/jpeg" } });
    } catch (e) {
      console.warn("Photo upload failed", e);
    }
  };

  const save = async () => {
    if (!title.trim()) { Alert.alert("Required", "Please enter a recipe name."); return; }
    if (!token) return;
    setSaving(true);
    try {
      const cleanIngredients = ingredients.filter(i => i.trim());
      const body = {
        title: title.trim(),
        description: description.trim() || undefined,
        ingredients: cleanIngredients,
        instructions: instructions.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      let recipeId: number;

      if (isEdit && params.id) {
        await fetch(`${API_ENDPOINTS.cookbookRecipes}/${params.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        recipeId = parseInt(params.id, 10);
      } else {
        const res = await fetch(API_ENDPOINTS.cookbookRecipes, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        recipeId = data.recipe.id;
      }

      if (photoUri) await uploadPhoto(recipeId);
      router.back();
    } catch {
      Alert.alert("Error", "Could not save recipe. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: topPad, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={GOLD} />
      </View>
    );
  }

  const displayPhoto = photoUri ?? existingPhotoUrl;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: topPad }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={MUTED} />
          </Pressable>
          <Text style={styles.headerTitle}>{isEdit ? "Edit Recipe" : "New Recipe"}</Text>
          <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color={GOLD} /> : <Text style={styles.saveBtnText}>Save</Text>}
          </Pressable>
        </View>
        <View style={styles.divider} />

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* Photo */}
          <Pressable style={styles.photoArea} onPress={pickPhoto}>
            {displayPhoto ? (
              <Image source={{ uri: displayPhoto }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoEmpty}>
                <Ionicons name="camera-outline" size={32} color={GOLD + "90"} />
                <Text style={styles.photoEmptyText}>Add Photo</Text>
              </View>
            )}
            <View style={styles.photoEditBadge}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </View>
          </Pressable>

          {/* Title */}
          <Text style={styles.label}>Recipe Name *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Turmeric Salmon Bowl"
            placeholderTextColor="rgba(30,20,0,0.3)"
          />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="A short description of this dish..."
            placeholderTextColor="rgba(30,20,0,0.3)"
            multiline
            numberOfLines={2}
          />

          {/* Ingredients */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Ingredients</Text>
            <Pressable onPress={addIngredient} style={styles.addRowBtn}>
              <Ionicons name="add-circle-outline" size={16} color={GOLD} />
              <Text style={styles.addRowBtnText}>Add</Text>
            </Pressable>
          </View>
          <View style={styles.ingredientsCard}>
            {ingredients.map((item, idx) => (
              <View key={idx} style={[styles.ingredientRow, idx > 0 && styles.ingredientRowBorder]}>
                <View style={styles.ingredientBullet}>
                  <Text style={styles.ingredientBulletText}>{idx + 1}</Text>
                </View>
                <TextInput
                  style={styles.ingredientInput}
                  value={item}
                  onChangeText={val => updateIngredient(idx, val)}
                  placeholder={`Ingredient ${idx + 1}`}
                  placeholderTextColor="rgba(30,20,0,0.3)"
                  returnKeyType="next"
                  onSubmitEditing={addIngredient}
                />
                <Pressable onPress={() => removeIngredient(idx)} hitSlop={8}>
                  <Ionicons name="close-circle-outline" size={18} color="rgba(30,20,0,0.3)" />
                </Pressable>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <Text style={styles.label}>Instructions</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Step-by-step preparation..."
            placeholderTextColor="rgba(30,20,0,0.3)"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          {/* Notes */}
          <Text style={styles.label}>Personal Notes</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Substitutions, variations, what worked well..."
            placeholderTextColor="rgba(30,20,0,0.3)"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 10 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: DARK },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: GOLD + "18", borderWidth: 1, borderColor: GOLD + "50" },
  saveBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: GOLD },
  divider: { height: 1, backgroundColor: BORDER, marginHorizontal: 16, marginBottom: 16 },
  photoArea: { alignSelf: "center", marginBottom: 24, position: "relative" },
  photoPreview: { width: 180, height: 135, borderRadius: 14, backgroundColor: GOLD + "12" },
  photoEmpty: { width: 180, height: 135, borderRadius: 14, backgroundColor: GOLD + "10", borderWidth: 1.5, borderColor: BORDER, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 6 },
  photoEmptyText: { fontSize: 13, fontFamily: "Inter_500Medium", color: GOLD + "90" },
  photoEditBadge: { position: "absolute", bottom: 8, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: DARK, marginBottom: 6, letterSpacing: 0.3 },
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  addRowBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addRowBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: GOLD },
  input: { backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 13, fontSize: 15, fontFamily: "Inter_400Regular", color: DARK, marginBottom: 18 },
  multiline: { minHeight: 90, paddingTop: 13 },
  ingredientsCard: { backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, marginBottom: 18, overflow: "hidden" },
  ingredientRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  ingredientRowBorder: { borderTopWidth: 1, borderTopColor: BORDER },
  ingredientBullet: { width: 22, height: 22, borderRadius: 11, backgroundColor: GOLD + "18", alignItems: "center", justifyContent: "center" },
  ingredientBulletText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: GOLD },
  ingredientInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: DARK, paddingVertical: 0 },
});
