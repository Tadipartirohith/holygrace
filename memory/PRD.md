# Grace Community Church — Mobile App

## Overview
A faith-focused React Native (Expo) mobile app for Grace Community Church with home dashboard, YouTube live streaming, tithes/donations (UPI + Razorpay), and prayer requests.

## Tech Stack
- **Frontend:** Expo SDK 54 + expo-router (file-based routing, 4 tabs)
- **Backend:** FastAPI + MongoDB (motor)
- **Theme:** Warm reverent gold palette

## Central Configuration
**`/app/frontend/src/config/appConfig.ts`** — single source of truth for:
- Church branding (name, tagline, address, service times)
- YouTube channel + live video URL
- UPI ID + payee name
- Razorpay public key
- Admin email for prayer notifications
- Giving preset amounts
- Daily verse
- Theme colors

Backend secrets (Razorpay secret, Resend API key) live in `/app/backend/.env`:
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`, `ADMIN_EMAIL`

## Features

### 🏠 Home
- Hero with church name + tagline
- Verse of the day card
- Quick action grid (Watch, Give, Prayer, Services)
- Service schedule + contact info

### 📺 Watch Live
- Embedded YouTube player (WebView native / iframe web)
- "Open in YouTube" + "Visit Channel" buttons
- Live schedule info

### ❤️ Give
- Preset amounts (₹100, 500, 1000, 2500, 5000, 10000)
- Custom amount input
- Purpose chips (Tithe, Offering, Missions, Building Fund)
- Donor name + email
- Method selector: **UPI** (deep link to GPay/PhonePe/Paytm) or **Razorpay** (mock checkout — replace placeholder keys to enable live)

### 🌹 Prayer Requests
- Name + email + category + request
- Anonymous toggle
- Stored in MongoDB
- Optional email notification to admin (via Resend — no-op if key absent)

## API Endpoints (all prefixed `/api`)
- `GET /` — health
- `POST /prayers` — submit prayer request
- `GET /prayers` — list prayer requests
- `POST /donations/create-order` — create donation order
- `POST /donations/verify-razorpay` — verify Razorpay signature (HMAC-SHA256)
- `POST /donations/confirm-upi` — mark UPI donation initiated
- `GET /donations` — list donations

## Mocked / Placeholder
- **Razorpay order creation** generates a local order_id (real implementation calls Razorpay `/v1/orders`). Replace `rzp_test_REPLACE_WITH_YOUR_KEY` in `appConfig.ts` and add `RAZORPAY_KEY_SECRET` in backend `.env` to enable.
- **Email notifications** are no-op until `RESEND_API_KEY` is set in backend `.env`.
- **UPI ID** is `gracechurch@oksbi` placeholder — edit in `appConfig.ts`.

## Future Enhancements
- JWT auth (offered but skipped — open access for now)
- Donation receipts / tax certificates
- Push notifications for live stream go-live
- Sermon archive / podcast feed
- Events calendar with RSVP
