import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Audio, AVPlaybackStatus } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePurchase } from "@/contexts/PurchaseContext";
import { api } from "@/constants/api";

// ─── Types ──────────────────────────────────────────────────────────────────

type Track = {
  id: number;
  title: string;
  description: string;
  duration: string;
  icon: string;
  tier: "founder" | "legacy";
  isLive: boolean;
  audioUrl: string | null;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatMs(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function VaultAudioScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { tier } = usePurchase();
  const isFounder = tier === "founder";
  const isLegacy = tier === "legacy";
  const hasAudioAccess = isFounder || isLegacy;

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeTrackId, setActiveTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [buffering, setBuffering] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);

  // ── Fetch track list ──────────────────────────────────────────────────────

  const fetchTracks = useCallback(async () => {
    try {
      setError(false);
      const res = await fetch(api.audioTracks);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setTracks(data.tracks ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  // ── Audio session setup ───────────────────────────────────────────────────

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  // ── Playback status callback ──────────────────────────────────────────────

  const onPlaybackStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setPositionMs(status.positionMillis);
    setDurationMs(status.durationMillis ?? 0);
    setBuffering(status.isBuffering);
    if (status.didJustFinish) {
      setIsPlaying(false);
      setPositionMs(0);
    }
  }, []);

  // ── Play / pause a track ──────────────────────────────────────────────────

  const handleTrackPress = useCallback(
    async (track: Track) => {
      if (!track.isLive || !track.audioUrl) return;

      // Same track — toggle play/pause
      if (activeTrackId === track.id && soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          await soundRef.current.playAsync();
        }
        return;
      }

      // New track — unload previous, load new
      try {
        setBuffering(true);
        setActiveTrackId(track.id);
        setPositionMs(0);
        setDurationMs(0);

        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: track.audioUrl },
          { shouldPlay: true },
          onPlaybackStatus
        );
        soundRef.current = sound;
      } catch (e) {
        console.warn("Audio load error", e);
        setBuffering(false);
        setActiveTrackId(null);
      }
    },
    [activeTrackId, isPlaying, onPlaybackStatus]
  );

  // ── Seek ─────────────────────────────────────────────────────────────────

  const handleSeek = useCallback(async (fraction: number) => {
    if (!soundRef.current || !durationMs) return;
    await soundRef.current.setPositionAsync(fraction * durationMs);
  }, [durationMs]);

  // ── Tier-gate a track ─────────────────────────────────────────────────────

  const canPlay = (track: Track) => {
    if (isLegacy) return true;
    if (isFounder) return track.tier === "founder";
    return false;
  };

  // ─────────────────────────────────────────────────────────────────────────

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
          <Ionicons name="headset" size={12} color="#c9a227" />
          <Text style={styles.badgeText}>AUDIO LIBRARY</Text>
        </View>
        <Text style={styles.title}>Exclusive Audio Sessions</Text>
        <Text style={styles.sub}>
          {isFounder
            ? "Your Founder Circle membership includes two audio sessions. Upgrade to Legacy for the full library."
            : "Guided audio by Joseph — crafted specifically for members around anti-inflammatory living."}
        </Text>
      </LinearGradient>

      {/* Founder access note */}
      {isFounder && (
        <View style={styles.founderNote}>
          <Ionicons name="ribbon-outline" size={14} color="#b06ee8" />
          <Text style={styles.founderNoteText}>
            Founder Circle includes Morning Reset and Evening Wind-Down. Gut Healing and Mindset sessions unlock with Legacy.
          </Text>
        </View>
      )}

      {/* Loading / error */}
      {loading && (
        <View style={styles.centerMsg}>
          <ActivityIndicator color="#c9a227" size="large" />
          <Text style={styles.centerMsgText}>Loading audio library…</Text>
        </View>
      )}
      {error && !loading && (
        <View style={styles.centerMsg}>
          <Ionicons name="alert-circle-outline" size={28} color="#c9a227" />
          <Text style={styles.centerMsgText}>Couldn't load tracks.</Text>
          <Pressable style={styles.retryBtn} onPress={fetchTracks}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Track list */}
      {!loading && !error && (
        <View style={styles.list}>
          {tracks.map((track, i) => {
            const accessible = canPlay(track);
            const isActive = activeTrackId === track.id;
            const progress = isActive && durationMs > 0 ? positionMs / durationMs : 0;

            return (
              <View
                key={track.id}
                style={[
                  styles.trackCard,
                  !accessible && styles.trackCardLocked,
                ]}
              >
                <LinearGradient
                  colors={["#fffef8", "#fdf8ee"]}
                  style={styles.trackGrad}
                >
                  {/* Top row */}
                  <View style={styles.trackTop}>
                    <View style={styles.trackNumWrap}>
                      <Text style={styles.trackNum}>{String(i + 1).padStart(2, "0")}</Text>
                    </View>
                    <View style={styles.trackInfo}>
                      <Text style={[styles.trackTitle, !accessible && { color: "rgba(30,20,0,0.35)" }]}>
                        {track.title}
                      </Text>
                      <View style={styles.trackMeta}>
                        <Ionicons name="time-outline" size={12} color="rgba(201,162,39,0.6)" />
                        <Text style={styles.trackDur}>{track.duration}</Text>
                      </View>
                    </View>

                    {/* Status badge */}
                    {!accessible ? (
                      <View style={styles.lockedBadge}>
                        <Ionicons name="lock-closed" size={10} color="rgba(30,20,0,0.45)" />
                        <Text style={styles.lockedText}>Legacy</Text>
                      </View>
                    ) : !track.isLive ? (
                      <View style={styles.productionBadge}>
                        <View style={styles.productionDot} />
                        <Text style={styles.productionText}>In Production</Text>
                      </View>
                    ) : isActive && buffering ? (
                      <ActivityIndicator size="small" color="#c9a227" />
                    ) : isActive && isPlaying ? (
                      <View style={styles.playingBadge}>
                        <Ionicons name="musical-notes" size={12} color="#c9a227" />
                        <Text style={styles.playingText}>Playing</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Description */}
                  <Text style={[styles.trackDesc, !accessible && { color: "rgba(30,20,0,0.3)" }]}>
                    {track.description}
                  </Text>

                  {/* Progress bar (active track only) */}
                  {isActive && durationMs > 0 && (
                    <View style={styles.progressWrap}>
                      <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
                      </View>
                      <View style={styles.progressTimes}>
                        <Text style={styles.progressTime}>{formatMs(positionMs)}</Text>
                        <Text style={styles.progressTime}>{formatMs(durationMs)}</Text>
                      </View>
                    </View>
                  )}

                  {/* Footer / action */}
                  <View style={styles.trackFooter}>
                    <Ionicons
                      name={track.icon as any}
                      size={14}
                      color={!accessible ? "rgba(201,162,39,0.2)" : "rgba(201,162,39,0.4)"}
                    />
                    {!accessible ? (
                      <Pressable
                        style={styles.upgradeBtn}
                        onPress={() => router.push("/checkout" as never)}
                      >
                        <Ionicons name="arrow-up-circle-outline" size={14} color="#c9a227" />
                        <Text style={styles.upgradeBtnText}>Upgrade to Legacy</Text>
                      </Pressable>
                    ) : !track.isLive ? (
                      <View style={[styles.playBtn, styles.playBtnDisabled]}>
                        <Ionicons name="play" size={16} color="rgba(30,20,0,0.25)" />
                        <Text style={styles.playBtnTextDisabled}>In Production</Text>
                      </View>
                    ) : (
                      <Pressable
                        style={({ pressed }) => [
                          styles.playBtn,
                          styles.playBtnActive,
                          pressed && { opacity: 0.8 },
                        ]}
                        onPress={() => handleTrackPress(track)}
                        disabled={isActive && buffering}
                      >
                        {isActive && buffering ? (
                          <ActivityIndicator size="small" color="#c9a227" />
                        ) : (
                          <>
                            <Ionicons
                              name={isActive && isPlaying ? "pause" : "play"}
                              size={16}
                              color="#c9a227"
                            />
                            <Text style={styles.playBtnTextActive}>
                              {isActive && isPlaying ? "Pause" : isActive ? "Resume" : "Play"}
                            </Text>
                          </>
                        )}
                      </Pressable>
                    )}
                  </View>
                </LinearGradient>
              </View>
            );
          })}
        </View>
      )}

      {/* Coming soon notice */}
      {!loading && !error && tracks.some((t) => !t.isLive && canPlay(t)) && (
        <View style={styles.noticeRow}>
          <Ionicons name="mic-outline" size={16} color="#c9a227" />
          <Text style={styles.noticeText}>
            Sessions marked "In Production" are being recorded by Joseph personally. They'll appear here the moment they're ready.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf8f0" },
  header: { paddingHorizontal: 24, paddingBottom: 28 },
  backBtn: { marginBottom: 20, alignSelf: "flex-start" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  badgeText: { color: "#c9a227", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  title: { color: "#1e1400", fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 10 },
  sub: { color: "rgba(30,20,0,0.55)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },

  founderNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    marginHorizontal: 16, marginTop: 16, marginBottom: 4,
    padding: 12, borderRadius: 12,
    backgroundColor: "rgba(176,110,232,0.08)",
    borderWidth: 1, borderColor: "rgba(176,110,232,0.2)",
  },
  founderNoteText: { color: "rgba(176,110,232,0.85)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, flex: 1 },

  centerMsg: { alignItems: "center", paddingTop: 48, gap: 12 },
  centerMsgText: { color: "rgba(30,20,0,0.55)", fontSize: 15, fontFamily: "Inter_400Regular" },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10, backgroundColor: "rgba(201,162,39,0.15)", borderWidth: 1, borderColor: "rgba(201,162,39,0.3)" },
  retryBtnText: { color: "#c9a227", fontSize: 14, fontFamily: "Inter_600SemiBold" },

  list: { padding: 16, gap: 12 },
  trackCard: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(201,162,39,0.25)" },
  trackCardLocked: { borderColor: "rgba(30,20,0,0.08)", opacity: 0.65 },
  trackGrad: { padding: 18, gap: 12 },

  trackTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  trackNumWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(201,162,39,0.12)", alignItems: "center", justifyContent: "center" },
  trackNum: { color: "#c9a227", fontSize: 13, fontFamily: "Inter_700Bold" },
  trackInfo: { flex: 1, gap: 4 },
  trackTitle: { color: "#1e1400", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  trackMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  trackDur: { color: "rgba(201,162,39,0.6)", fontSize: 12, fontFamily: "Inter_400Regular" },

  productionBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100, backgroundColor: "rgba(232,80,80,0.12)", borderWidth: 1, borderColor: "rgba(232,80,80,0.3)" },
  productionDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#e05252" },
  productionText: { color: "#e05252", fontSize: 10, fontFamily: "Inter_600SemiBold" },

  playingBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100, backgroundColor: "rgba(201,162,39,0.12)", borderWidth: 1, borderColor: "rgba(201,162,39,0.3)" },
  playingText: { color: "#c9a227", fontSize: 10, fontFamily: "Inter_600SemiBold" },

  lockedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100, backgroundColor: "rgba(30,20,0,0.06)", borderWidth: 1, borderColor: "rgba(30,20,0,0.12)" },
  lockedText: { color: "rgba(30,20,0,0.35)", fontSize: 10, fontFamily: "Inter_600SemiBold" },

  trackDesc: { color: "rgba(30,20,0,0.55)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },

  progressWrap: { gap: 6 },
  progressBg: { height: 3, backgroundColor: "rgba(30,20,0,0.1)", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#c9a227", borderRadius: 2 },
  progressTimes: { flexDirection: "row", justifyContent: "space-between" },
  progressTime: { color: "rgba(201,162,39,0.6)", fontSize: 11, fontFamily: "Inter_400Regular" },

  trackFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  playBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  playBtnDisabled: { backgroundColor: "rgba(30,20,0,0.06)" },
  playBtnActive: { backgroundColor: "rgba(201,162,39,0.12)", borderWidth: 1, borderColor: "rgba(201,162,39,0.3)" },
  playBtnTextDisabled: { color: "rgba(30,20,0,0.25)", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  playBtnTextActive: { color: "#c9a227", fontSize: 13, fontFamily: "Inter_600SemiBold" },

  upgradeBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: "rgba(201,162,39,0.1)", borderWidth: 1, borderColor: "rgba(201,162,39,0.25)" },
  upgradeBtnText: { color: "#c9a227", fontSize: 13, fontFamily: "Inter_600SemiBold" },

  noticeRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginHorizontal: 16, marginTop: 4, marginBottom: 16, padding: 14, borderRadius: 12, backgroundColor: "rgba(201,162,39,0.08)", borderWidth: 1, borderColor: "rgba(201,162,39,0.2)" },
  noticeText: { color: "rgba(201,162,39,0.8)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, flex: 1 },
});
