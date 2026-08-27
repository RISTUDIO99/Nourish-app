import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useRef } from "react";
import { WELCOME_SEEN_KEY } from "@/constants/keys";
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  require("../assets/images/slide-5.jpg"), // plated salmon, candlelight
  require("../assets/images/slide-9.jpg"), // herb salmon, turmeric rice
  require("../assets/images/slide-6.jpg"), // salmon asparagus black slate
  require("../assets/images/slide-2.jpg"), // anti-inflammatory bowl
  require("../assets/images/slide-3.jpg"), // avocado pomegranate dark slate
  require("../assets/images/slide-8.jpg"), // gratitude journal avocado toast
  require("../assets/images/slide-7.jpg"), // daily intentions smoothie bowl
  require("../assets/images/slide-4.jpg"), // meal plan journal golden latte
  require("../assets/images/slide-1.jpg"), // anti-inflammatory ingredients
];

const SLIDE_DURATION = 4000;
const FADE_DURATION = 800;

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setNextIndex((prev) => (prev + 1) % SLIDES.length);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
        fadeAnim.setValue(0);
      });
    }, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const enter = async () => {
    await AsyncStorage.setItem(WELCOME_SEEN_KEY, "true");
    router.replace("/(tabs)" as never);
  };


  return (
    <View style={styles.container}>
      {/* Base image (current) */}
      <Image
        source={SLIDES[currentIndex]}
        style={styles.photo}
        resizeMode="cover"
      />

      {/* Next image fading in */}
      <Animated.Image
        source={SLIDES[nextIndex]}
        style={[styles.photo, { opacity: fadeAnim }]}
        resizeMode="cover"
      />

      {/* Gradient overlay — dark at top and heavy at bottom */}
      <LinearGradient
        colors={[
          "rgba(8,18,12,0.35)",
          "rgba(8,18,12,0.1)",
          "rgba(8,18,12,0.6)",
          "rgba(8,18,12,0.97)",
        ]}
        locations={[0, 0.25, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Slide dots */}
      <View style={[styles.dotsRow, { top: insets.top + 16 }]}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <View style={[styles.content, { paddingBottom: insets.bottom + 36 }]}>
        {/* Brand mark */}
        <View style={styles.brandMark}>
          <View style={styles.brandDot} />
          <Text style={styles.brandEyebrow}>RI Studio presents</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Nourish</Text>
        <Text style={styles.tagline}>
          A more thoughtful way to plan meals, support your wellness, and build routines that fit your life.
        </Text>

        {/* Creator line */}
        <View style={styles.creatorRow}>
          <View style={styles.creatorLine} />
          <Text style={styles.creatorText}>Created by Joseph Young</Text>
          <View style={styles.creatorLine} />
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.enterBtn,
            pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
          ]}
          onPress={enter}
        >
          <LinearGradient
            colors={["#3d7a56", "#2d5c40"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.enterBtnGrad}
          >
            <Text style={styles.enterBtnText}>Enter Nourish</Text>
            <Text style={styles.enterBtnArrow}>→</Text>
          </LinearGradient>
        </Pressable>

        {/* Sign In button for existing members */}
        <Pressable
          style={({ pressed }) => [styles.signInBtn, pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] }]}
          onPress={() => router.push("/signin" as never)}
        >
          <Text style={styles.signInBtnText}>Sign In</Text>
        </Pressable>

        <Text style={styles.signInHint}>Already a member? Tap Sign In to access your account.</Text>

        {/* Legal */}
        <View style={styles.legalNoteRow}>
          <Text style={styles.legalNote}>By continuing you agree to our </Text>
          <Pressable onPress={() => Linking.openURL("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")}>
            <Text style={styles.legalLink}>Terms of Use</Text>
          </Pressable>
          <Text style={styles.legalNote}> and </Text>
          <Pressable onPress={() => router.push("/privacy" as never)}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080c0a",
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
  dotsRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    height: 3,
    borderRadius: 2,
  },
  dotActive: {
    width: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  dotInactive: {
    width: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
  },
  brandMark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#5cb87a",
  },
  brandEyebrow: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1.5,
  },
  title: {
    color: "#ffffff",
    fontSize: 64,
    fontFamily: "Inter_700Bold",
    letterSpacing: -2,
    lineHeight: 68,
    marginBottom: 16,
  },
  tagline: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
    marginBottom: 28,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  creatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  creatorText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  enterBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#3d7a56",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  enterBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
  },
  enterBtnText: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  enterBtnArrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 20,
    fontFamily: "Inter_400Regular",
  },
  signInBtn: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  signInBtnText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  signInHint: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 17,
  },
  legalNoteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  legalNote: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  legalLink: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
    textDecorationLine: "underline",
  },
});
