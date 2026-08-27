import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CREAM = "#fdf8f0";
const GOLD = "#c9a227";
const GREEN = "#3d6b52";
const DARK = "#1e1400";
const MUTED = "rgba(30,20,0,0.5)";
const BORDER = "rgba(201,162,39,0.25)";
const CARD = "#fffef8";

export const PROFILE_KEY = "nourish:user:profile:v1";

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  photoUri: string | null;
};

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  email: "",
  phone: "",
  photoUri: null,
};

export async function loadProfile(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export default function TrackingProfileScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProfile().then(setProfile);
  }, []);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to set a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setProfile((p) => ({ ...p, photoUri: result.assets[0].uri }));
      setSaved(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      Alert.alert("Error", "Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    key: keyof UserProfile,
    placeholder: string,
    keyboard: "default" | "email-address" | "phone-pad" = "default"
  ) => (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={s.fieldInput}
        value={profile[key] as string}
        onChangeText={(v) => { setProfile((p) => ({ ...p, [key]: v })); setSaved(false); }}
        placeholder={placeholder}
        placeholderTextColor={MUTED}
        keyboardType={keyboard}
        autoCapitalize={key === "name" ? "words" : "none"}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: CREAM }}>
      {/* Header */}
      <View style={[s.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={DARK} />
        </Pressable>
        <Text style={s.headerTitle}>My Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo */}
        <View style={s.photoSection}>
          <Pressable onPress={pickPhoto} style={s.photoWrap}>
            {profile.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={s.photo} />
            ) : (
              <View style={s.photoPlaceholder}>
                <Ionicons name="person" size={44} color={MUTED} />
              </View>
            )}
            <View style={s.cameraBtn}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </Pressable>
          <Text style={s.photoHint}>Tap to add a photo</Text>
        </View>

        {/* Fields */}
        <View style={[s.card, { marginTop: 24 }]}>
          {field("Full Name", "name", "Your name")}
          {field("Email", "email", "your@email.com", "email-address")}
          {field("Phone", "phone", "(555) 000-0000", "phone-pad")}
        </View>

        {/* Privacy note */}
        <View style={s.privacyCard}>
          <Ionicons name="lock-closed-outline" size={15} color={GREEN} style={{ marginTop: 1 }} />
          <Text style={s.privacyText}>
            Your profile is stored only on this device. It is never uploaded to our servers and is not accessible by Nourish, RI Studio, or Apple.
          </Text>
        </View>

        {/* Save */}
        <Pressable
          style={[s.saveBtn, saving && { opacity: 0.6 }]}
          onPress={save}
          disabled={saving}
        >
          <Text style={s.saveBtnText}>
            {saved ? "✓ Saved" : saving ? "Saving…" : "Save Profile"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, backgroundColor: CREAM, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontFamily: "Inter_600SemiBold", color: DARK },
  photoSection: { alignItems: "center", paddingTop: 8 },
  photoWrap: { position: "relative", marginBottom: 8 },
  photo: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: GOLD },
  photoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#e8e0d0", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: BORDER },
  cameraBtn: { position: "absolute", bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  photoHint: { fontSize: 12, fontFamily: "Inter_400Regular", color: MUTED },
  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: "hidden" },
  fieldGroup: { paddingHorizontal: 16, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: BORDER },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: MUTED, letterSpacing: 0.6, textTransform: "uppercase", marginTop: 12, marginBottom: 4 },
  fieldInput: { fontSize: 16, fontFamily: "Inter_400Regular", color: DARK, paddingBottom: 12 },
  privacyCard: { flexDirection: "row", gap: 10, marginTop: 16, padding: 14, backgroundColor: "rgba(61,107,82,0.06)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(61,107,82,0.15)", alignItems: "flex-start" },
  privacyText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: GREEN, lineHeight: 18 },
  saveBtn: { marginTop: 24, backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
