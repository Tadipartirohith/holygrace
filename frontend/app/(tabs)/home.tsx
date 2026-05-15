import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppConfig } from "@/src/config/appConfig";

const C = AppConfig.theme;

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200",
          }}
          style={styles.hero}
          imageStyle={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
        >
          <LinearGradient
            colors={["rgba(42,31,18,0.2)", "rgba(42,31,18,0.85)"]}
            style={styles.heroOverlay}
          >
            <Text style={styles.heroBadge} testID="home-church-tagline">
              {AppConfig.church.tagline}
            </Text>
            <Text style={styles.heroTitle} testID="home-church-name">
              {AppConfig.church.name}
            </Text>
            <Text style={styles.heroSubtitle}>
              {AppConfig.church.welcomeMessage}
            </Text>
          </LinearGradient>
        </ImageBackground>

        {/* Daily Verse */}
        <View style={styles.verseCard} testID="home-daily-verse">
          <View style={styles.verseHeader}>
            <Ionicons name="book" size={18} color={C.primary} />
            <Text style={styles.verseHeaderText}>Verse of the Day</Text>
          </View>
          <Text style={styles.verseText}>"{AppConfig.dailyVerse.text}"</Text>
          <Text style={styles.verseRef}>— {AppConfig.dailyVerse.reference}</Text>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <QuickCard
            icon="play-circle"
            label="Watch Live"
            color={C.primary}
            onPress={() => router.push("/(tabs)/watch")}
            testID="quick-watch"
          />
          <QuickCard
            icon="heart"
            label="Give Tithe"
            color={C.primaryDark}
            onPress={() => router.push("/(tabs)/give")}
            testID="quick-give"
          />
          <QuickCard
            icon="rose"
            label="Prayer Request"
            color={C.accent}
            onPress={() => router.push("/(tabs)/prayer")}
            testID="quick-prayer"
          />
          <QuickCard
            icon="calendar"
            label="Service Times"
            color={C.primaryLight}
            onPress={() => router.push("/(tabs)/home")}
            testID="quick-services"
          />
        </View>

        {/* Service Times */}
        <Text style={styles.sectionTitle}>Service Schedule</Text>
        <View style={styles.scheduleCard}>
          {AppConfig.church.serviceTimings.map((s, idx) => (
            <View
              key={s.day}
              style={[
                styles.scheduleRow,
                idx !== AppConfig.church.serviceTimings.length - 1 &&
                  styles.scheduleRowBorder,
              ]}
            >
              <View style={styles.scheduleDayDot}>
                <Text style={styles.scheduleDayInitial}>{s.day[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.scheduleDay}>{s.day}</Text>
                <Text style={styles.scheduleTime}>{s.time}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
            </View>
          ))}
        </View>

        {/* Contact */}
        <Text style={styles.sectionTitle}>Visit Us</Text>
        <View style={styles.contactCard}>
          <ContactRow icon="location" text={AppConfig.church.address} />
          <ContactRow icon="call" text={AppConfig.church.phone} />
          <ContactRow icon="mail" text={AppConfig.church.email} />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickCard({
  icon,
  label,
  color,
  onPress,
  testID,
}: {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <TouchableOpacity
      style={styles.quickCard}
      onPress={onPress}
      activeOpacity={0.8}
      testID={testID}
    >
      <View style={[styles.quickIconWrap, { backgroundColor: color + "1F" }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ContactRow({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.contactRow}>
      <Ionicons name={icon} size={18} color={C.primary} />
      <Text style={styles.contactText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  container: { flex: 1, backgroundColor: C.background },
  hero: { height: 280, justifyContent: "flex-end" },
  heroOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroBadge: {
    color: C.primaryLight,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroSubtitle: { color: "#F5EFE0", fontSize: 14, lineHeight: 20 },
  verseCard: {
    margin: 16,
    padding: 18,
    backgroundColor: C.surfaceAlt,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
  },
  verseHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  verseHeaderText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "700",
    color: C.primary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  verseText: {
    fontSize: 15,
    lineHeight: 22,
    color: C.text,
    fontStyle: "italic",
  },
  verseRef: {
    marginTop: 10,
    fontSize: 13,
    color: C.textMuted,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 12,
  },
  quickCard: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  quickIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickLabel: { fontSize: 13, fontWeight: "700", color: C.text },
  scheduleCard: {
    backgroundColor: C.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  scheduleRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  scheduleDayDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.primary + "1F",
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleDayInitial: { fontSize: 16, fontWeight: "800", color: C.primary },
  scheduleDay: { fontSize: 15, fontWeight: "700", color: C.text },
  scheduleTime: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  contactCard: {
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  contactText: { fontSize: 14, color: C.text, flex: 1 },
});
