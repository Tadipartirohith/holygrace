import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppConfig } from "@/src/config/appConfig";
import { apiUrl } from "@/src/utils/api";

const C = AppConfig.theme;

type Method = "razorpay" | "upi";

export default function Give() {
  const [amount, setAmount] = useState<string>("500");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("Tithe");
  const [method, setMethod] = useState<Method>("upi");
  const [loading, setLoading] = useState(false);

  const numericAmount = parseInt(amount || "0", 10);

  const validate = () => {
    if (!numericAmount || numericAmount < 1) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return false;
    }
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your name.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Email Required", "Please enter a valid email.");
      return false;
    }
    return true;
  };

  const createOrder = async (m: Method) => {
    const res = await fetch(apiUrl("/api/donations/create-order"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: numericAmount,
        donor_name: name,
        donor_email: email,
        purpose,
        method: m,
      }),
    });
    if (!res.ok) throw new Error("Failed to create order");
    return res.json();
  };

  const handleUpi = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const order = await createOrder("upi");
      const note = `${AppConfig.upi.transactionNotePrefix}-${order.order_id}`;
      const upiUrl = `upi://pay?pa=${encodeURIComponent(
        AppConfig.upi.upiId
      )}&pn=${encodeURIComponent(
        AppConfig.upi.payeeName
      )}&am=${numericAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

      // Confirm initiation in backend
      fetch(apiUrl("/api/donations/confirm-upi"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.order_id, upi_txn_ref: note }),
      }).catch(() => {});

      const can = await Linking.canOpenURL(upiUrl);
      if (can) {
        await Linking.openURL(upiUrl);
      } else {
        Alert.alert(
          "UPI App Not Found",
          Platform.OS === "web"
            ? "UPI deep links open only on mobile. Use GPay/PhonePe/Paytm to send to " +
                AppConfig.upi.upiId
            : "Please install a UPI app (Google Pay, PhonePe, Paytm)."
        );
      }
    } catch (e) {
      Alert.alert("Error", "Could not initiate UPI payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpay = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const order = await createOrder("razorpay");
      Alert.alert(
        "Razorpay (Test Mode)",
        `Order created: ${order.order_id}\nAmount: ${
          AppConfig.upi.currencySymbol
        }${numericAmount}\n\nReplace placeholder Razorpay keys in appConfig.ts and backend .env to enable live checkout.`,
        [{ text: "OK" }]
      );
    } catch (e) {
      Alert.alert("Error", "Could not create Razorpay order.");
    } finally {
      setLoading(false);
    }
  };

  const handleGive = () => {
    if (method === "upi") handleUpi();
    else handleRazorpay();
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
            <Text style={styles.title}>Give a Tithe</Text>
            <Text style={styles.subtitle}>
              "Each of you should give what you have decided in your heart to
              give." — 2 Corinthians 9:7
            </Text>
          </View>

          {/* Preset Amounts */}
          <Text style={styles.label}>Choose an Amount</Text>
          <View style={styles.presetGrid}>
            {AppConfig.givingPresets.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.presetBtn,
                  numericAmount === p && styles.presetBtnActive,
                ]}
                onPress={() => setAmount(String(p))}
                testID={`preset-${p}`}
              >
                <Text
                  style={[
                    styles.presetText,
                    numericAmount === p && styles.presetTextActive,
                  ]}
                >
                  {AppConfig.upi.currencySymbol}
                  {p.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Or Enter Custom Amount</Text>
          <View style={styles.amountWrap}>
            <Text style={styles.currencySymbol}>
              {AppConfig.upi.currencySymbol}
            </Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={C.textMuted}
              testID="custom-amount-input"
            />
          </View>

          {/* Purpose */}
          <Text style={styles.label}>Purpose</Text>
          <View style={styles.purposeRow}>
            {["Tithe", "Offering", "Missions", "Building Fund"].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.purposeChip,
                  purpose === p && styles.purposeChipActive,
                ]}
                onPress={() => setPurpose(p)}
                testID={`purpose-${p}`}
              >
                <Text
                  style={[
                    styles.purposeText,
                    purpose === p && styles.purposeTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Donor Info */}
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor={C.textMuted}
            testID="donor-name-input"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={C.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            testID="donor-email-input"
          />

          {/* Method */}
          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.methodRow}>
            <MethodCard
              active={method === "upi"}
              onPress={() => setMethod("upi")}
              icon="phone-portrait"
              title="UPI"
              subtitle="GPay / PhonePe / Paytm"
              testID="method-upi"
            />
            <MethodCard
              active={method === "razorpay"}
              onPress={() => setMethod("razorpay")}
              icon="card"
              title="Razorpay"
              subtitle="Card / Netbanking"
              testID="method-razorpay"
            />
          </View>

          <TouchableOpacity
            style={styles.giveBtn}
            onPress={handleGive}
            disabled={loading}
            testID="give-now-btn"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="heart" size={20} color="#fff" />
                <Text style={styles.giveBtnText}>
                  Give {AppConfig.upi.currencySymbol}
                  {numericAmount.toLocaleString()} via{" "}
                  {method === "upi" ? "UPI" : "Razorpay"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footnote}>
            🔒 Secure payment • Your gift supports {AppConfig.church.name}
          </Text>
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MethodCard({
  active,
  onPress,
  icon,
  title,
  subtitle,
  testID,
}: {
  active: boolean;
  onPress: () => void;
  icon: any;
  title: string;
  subtitle: string;
  testID: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.methodCard, active && styles.methodCardActive]}
      onPress={onPress}
      testID={testID}
    >
      <Ionicons
        name={icon}
        size={22}
        color={active ? C.primary : C.textMuted}
      />
      <Text
        style={[styles.methodTitle, active && { color: C.primary }]}
      >
        {title}
      </Text>
      <Text style={styles.methodSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: C.text },
  subtitle: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 6,
    fontStyle: "italic",
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: C.text,
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  presetGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  presetBtn: {
    flexBasis: "31%",
    flexGrow: 1,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  presetBtnActive: {
    backgroundColor: C.primary + "15",
    borderColor: C.primary,
  },
  presetText: { fontSize: 15, fontWeight: "700", color: C.text },
  presetTextActive: { color: C.primary },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
  },
  currencySymbol: { fontSize: 22, fontWeight: "700", color: C.primary },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: C.text,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  purposeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  purposeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  purposeChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  purposeText: { fontSize: 13, color: C.text, fontWeight: "600" },
  purposeTextActive: { color: "#fff" },
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
  methodRow: { flexDirection: "row", gap: 10 },
  methodCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "flex-start",
    gap: 4,
  },
  methodCardActive: { borderColor: C.primary, backgroundColor: C.primary + "0D" },
  methodTitle: { fontSize: 15, fontWeight: "700", color: C.text, marginTop: 4 },
  methodSubtitle: { fontSize: 11, color: C.textMuted },
  giveBtn: {
    marginTop: 22,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: C.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  giveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  footnote: {
    textAlign: "center",
    fontSize: 12,
    color: C.textMuted,
    marginTop: 14,
  },
});
