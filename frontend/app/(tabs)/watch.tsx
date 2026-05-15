import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppConfig } from "@/src/config/appConfig";

const C = AppConfig.theme;

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/live\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function Watch() {
  const videoId = useMemo(
    () => extractYouTubeId(AppConfig.youtube.liveVideoUrl),
    []
  );

  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`
    : null;

  const openInYouTube = () => {
    Linking.openURL(AppConfig.youtube.liveVideoUrl).catch(() => {});
  };

  const openChannel = () => {
    Linking.openURL(AppConfig.youtube.channelUrl).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Watch Live</Text>
        <Text style={styles.subtitle}>{AppConfig.youtube.liveSchedule}</Text>
      </View>

      <View style={styles.playerWrap} testID="live-player">
        {embedUrl ? (
          Platform.OS === "web" ? (
            // @ts-ignore — iframe only on web
            <iframe
              src={embedUrl}
              style={{ width: "100%", height: "100%", border: 0 }}
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <WebView
              source={{ uri: embedUrl }}
              style={styles.webview}
              allowsFullscreenVideo
              javaScriptEnabled
              domStorageEnabled
            />
          )
        ) : (
          <View style={styles.placeholderPlayer}>
            <Ionicons name="alert-circle" size={36} color={C.primary} />
            <Text style={styles.placeholderText}>
              Invalid YouTube URL. Update `liveVideoUrl` in appConfig.ts.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={openInYouTube}
          testID="open-youtube-btn"
        >
          <Ionicons name="logo-youtube" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Open in YouTube</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={openChannel}
          testID="open-channel-btn"
        >
          <Ionicons name="tv" size={18} color={C.primary} />
          <Text style={styles.secondaryBtnText}>Visit Channel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="radio" size={18} color={C.danger} />
          <Text style={styles.infoText}>
            Live worship every {AppConfig.youtube.liveSchedule}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="people" size={18} color={C.primary} />
          <Text style={styles.infoText}>
            Join {AppConfig.church.name} worldwide community
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="notifications" size={18} color={C.primary} />
          <Text style={styles.infoText}>
            Subscribe on YouTube for live reminders
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: C.text },
  subtitle: { fontSize: 13, color: C.textMuted, marginTop: 4 },
  playerWrap: {
    marginHorizontal: 16,
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
  },
  webview: { flex: 1, backgroundColor: "#000" },
  placeholderPlayer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    padding: 24,
  },
  placeholderText: {
    color: C.text,
    textAlign: "center",
    marginTop: 12,
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  secondaryBtn: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: C.primary,
  },
  secondaryBtnText: { color: C.primary, fontWeight: "700", fontSize: 14 },
  infoCard: {
    backgroundColor: C.surface,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoText: { fontSize: 14, color: C.text, flex: 1 },
});
