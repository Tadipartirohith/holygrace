/**
 * ============================================================
 *  GRACE COMMUNITY CHURCH — CENTRAL APP CONFIGURATION
 * ============================================================
 *  EDIT THIS FILE TO UPDATE ALL CHURCH-WIDE SETTINGS.
 *  No need to touch any screen file (app/index.tsx etc.)
 *
 *  Sections:
 *    1) CHURCH BRANDING      → name, tagline, address, contact
 *    2) YOUTUBE LIVE STREAM  → channel URL + live video ID
 *    3) PAYMENT — UPI        → UPI ID & payee name for tithes
 *    4) PAYMENT — RAZORPAY   → key id (public), currency
 *    5) PRAYER REQUEST       → admin email for notifications
 *    6) GIVING PRESETS       → quick-amount buttons
 *    7) DAILY VERSE          → optional verse on home screen
 *    8) THEME COLORS         → warm reverent gold palette
 * ============================================================
 */

export const AppConfig = {
  // ─── 1) CHURCH BRANDING ─────────────────────────────────
  church: {
    name: "Grace Community Church",
    shortName: "Grace Community",
    tagline: "Faith • Hope • Love",
    welcomeMessage:
      "Welcome home. Wherever you are on your journey, you belong here.",
    address: "123 Faith Avenue, New Delhi, India",
    phone: "+91 98765 43210",
    email: "hello@gracecommunity.org",
    websiteUrl: "https://gracecommunity.org",
    serviceTimings: [
      { day: "Sunday", time: "9:00 AM & 11:00 AM" },
      { day: "Wednesday", time: "7:00 PM (Prayer Meeting)" },
      { day: "Friday", time: "7:00 PM (Bible Study)" },
    ],
  },

  // ─── 2) YOUTUBE LIVE STREAM ─────────────────────────────
  // Paste the FULL YouTube watch URL of the live stream OR a recent video.
  // The app will embed it via WebView. Update before each Sunday service.
  youtube: {
    channelUrl: "https://www.youtube.com/@gracecommunity",
    // Live or recent video URL. Example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    liveVideoUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    // Schedule text shown below the player.
    liveSchedule: "Sundays at 9:00 AM IST",
  },

  // ─── 3) PAYMENT — UPI ───────────────────────────────────
  upi: {
    // Replace with the church's actual UPI ID (e.g. "gracechurch@oksbi")
    upiId: "gracechurch@oksbi",
    payeeName: "Grace Community Church",
    // Optional reference prefix used in transaction notes.
    transactionNotePrefix: "Tithe-GCC",
    currency: "INR",
    currencySymbol: "₹",
  },

  // ─── 4) PAYMENT — RAZORPAY ──────────────────────────────
  // ONLY the public key id goes here. The SECRET stays on the backend.
  razorpay: {
    // Test key. Replace with rzp_live_xxxxx in production.
    keyId: "rzp_test_REPLACE_WITH_YOUR_KEY",
    companyName: "Grace Community Church",
    description: "Tithes & Offerings",
    themeColor: "#B8860B", // matches our gold palette
  },

  // ─── 5) PRAYER REQUEST NOTIFICATIONS ────────────────────
  prayer: {
    // Admin email that receives every prayer request submission.
    adminEmail: "pastor@gracecommunity.org",
    categories: [
      "Healing",
      "Family",
      "Finances",
      "Salvation",
      "Guidance",
      "Thanksgiving",
      "Other",
    ],
  },

  // ─── 6) GIVING PRESET AMOUNTS ───────────────────────────
  givingPresets: [100, 500, 1000, 2500, 5000, 10000],

  // ─── 7) DAILY VERSE (optional) ──────────────────────────
  dailyVerse: {
    text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
    reference: "Jeremiah 29:11",
  },

  // ─── 8) THEME — WARM REVERENT GOLD PALETTE ──────────────
  theme: {
    primary: "#B8860B", // dark goldenrod
    primaryLight: "#D4AF37", // classic gold
    primaryDark: "#8B6914", // deep amber
    accent: "#C9A961", // soft gold
    background: "#FBF8F1", // warm cream
    surface: "#FFFFFF",
    surfaceAlt: "#F5EFE0", // parchment
    text: "#2A1F12", // deep cocoa
    textMuted: "#6B5B45",
    textOnPrimary: "#FFFFFF",
    border: "#E8DCC0",
    success: "#3F7D3F",
    danger: "#A93226",
  },
} as const;

export type AppConfigType = typeof AppConfig;
