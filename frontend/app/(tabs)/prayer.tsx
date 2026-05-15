import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppConfig } from "@/src/config/appConfig";

const C = AppConfig.theme;
const API = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Prayer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState(AppConfig.prayer.categories[0]);
  const [request, setRequest] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!anonymous && !name.trim()) {
      Alert.alert("Name Required", "Please enter your name or submit anonymously.");
      return;
    }
    if (!request.trim() || request.trim().length < 3) {
      Alert.alert("Prayer Required", "Please share your prayer request.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/prayers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Anonymous",
          email: email.trim() || null,
          category,
          request: request.trim(),
          is_anonymous: anonymous,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      Alert.alert(
        "Prayer Received 🙏",
        `Thank you. Our team at ${AppConfig.church.name} is praying with you.`,
        [
          {
            text: "Amen",
            onPress: () => {
              setName("");
              setEmail("");
              setRequest("");
              setAnonymous(false);
              setCategory(AppConfig.prayer.categories[0]);
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert("Error", "Could not submit prayer request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <Ionicons name="rose" size={28} color={C.primary} />
            </View>
            <Text style={styles.title}>Prayer Requests</Text>
            <Text style={styles.subtitle}>
              "Cast all your anxiety on him because he cares for you." — 1 Peter
              5:7
            </Text>
          </View>

          {/* Anonymous toggle */}
          <View style={styles.anonRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.anonTitle}>Submit Anonymously</Text>
              <Text style={styles.anonSubtitle}>
                Only the pastor will see this request
              </Text>
            </View>
            <Switch
              value={anonymous}
              onValueChange={setAnonymous}
              trackColor={{ false: C.border, true: C.primary }}
              thumbColor="#fff"
              testID="anonymous-toggle"
            />
          </View>

          {/* Name */}
          <Text style={styles.label}>Your Name {anonymous && "(optional)"}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={anonymous ? "Anonymous" : "John Doe"}
            placeholderTextColor={C.textMuted}
            editable={!anonymous}
            testID="prayer-name-input"
          />

          {/* Email */}
          <Text style={styles.label}>Email (optional)</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={C.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            testID="prayer-email-input"
          />

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.catWrap}>
            {AppConfig.prayer.categories.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.catChip, category === c && styles.catChipActive]}
                onPress={() => setCategory(c)}
                testID={`category-${c}`}
              >
                <Text
                  style={[
                    styles.catText,
                    category === c && styles.catTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Request */}
          <Text style={styles.label}>Your Prayer Request</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={request}
            onChangeText={setRequest}
            placeholder="Share what's on your heart..."
            placeholderTextColor={C.textMuted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            testID="prayer-request-input"
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={submit}
            disabled={submitting}
            testID="submit-prayer-btn"
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={18} color="#fff" />
                <Text style={styles.submitText}>Submit Prayer Request</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.privacy}>
            <Ionicons name="shield-checkmark" size={14} color={C.success} />
            <Text style={styles.privacyText}>
              Your request is private and sent only to{" "}
              {AppConfig.church.shortName} pastors.
            </Text>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { alignItems: "center", paddingTop: 16, paddingBottom: 8 },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.primary + "1F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontSize: 26, fontWeight: "800", color: C.text },
  subtitle: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 6,
    textAlign: "center",
    fontStyle: "italic",
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  anonRow: {
    marginTop: 20,
    backgroundColor: C.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  anonTitle: { fontSize: 14, fontWeight: "700", color: C.text },
  anonSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
  },
  textArea: { minHeight: 120, paddingTop: 12 },
  catWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  catChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  catText: { fontSize: 13, color: C.text, fontWeight: "600" },
  catTextActive: { color: "#fff" },
  submitBtn: {
    marginTop: 22,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  privacy: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
  },
  privacyText: { fontSize: 12, color: C.textMuted, textAlign: "center" },
});
