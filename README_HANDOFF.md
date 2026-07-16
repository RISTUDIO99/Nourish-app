# Nourish — Developer Handoff Guide
**Owner:** RI Studio LLC  
**Apple Bundle ID:** com.ristudio.nourish  
**App Store Connect App ID:** 6782485225  
**Last updated:** July 2026

---

## What the App Does

Nourish is an iOS mobile app for anti-inflammatory eating and wellness. It provides:
- **4 seven-day meal plans** (Grass-Fed Meat, Chicken, Fish, RA & Chronic Illness)
- **Food Guide** with an anti-inflammatory food reference and shopping list
- **Wellness Toolkit** with vetted recovery devices
- **Templates** (meal planner, meal prep, grocery bundles, wellness journal, reset protocol)
- **In-App Purchases** via Apple IAP for 3 monthly subscription tiers

One meal plan (Grass-Fed Meat) is free. The other 3 unlock with any paid subscription.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Mobile framework | React Native 0.81.5 |
| App platform | Expo ~54.0.27 |
| Navigation | Expo Router ~6.0.17 (file-based routing) |
| In-App Purchases | RevenueCat (react-native-purchases ^10.4.0) |
| Build & submission | EAS (Expo Application Services) |
| Local storage | AsyncStorage (device-only, no cloud database) |
| Backend | None — fully client-side app |
| Authentication | None — no user accounts |
| Hosting | Apple App Store (iOS) |

---

## Project Structure

```
nourish-app/
├── app/                        # All screens (Expo Router file-based)
│   ├── (tabs)/                 # Bottom tab screens
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── index.tsx           # Home screen
│   │   ├── plans.tsx           # Meal plans list
│   │   ├── guide.tsx           # Food Guide
│   │   └── wellness.tsx        # Wellness Toolkit
│   ├── plan/[id].tsx           # Individual meal plan detail
│   ├── checkout.tsx            # Subscription purchase screen
│   ├── templates/              # Template screens (meal planner, etc.)
│   ├── disclaimer.tsx          # Full medical disclaimer
│   ├── privacy.tsx             # Privacy policy
│   ├── _layout.tsx             # Root layout (fonts, providers, disclaimer gate)
│   └── +not-found.tsx          # 404 screen
├── assets/
│   ├── images/                 # App icon, banners, hero images
│   └── images/store/           # App Store screenshots and icons
├── components/                 # Reusable UI components
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   ├── KeyboardAwareScrollViewCompat.tsx
│   └── PaywallGate.tsx
├── constants/
│   └── colors.ts               # Light/dark mode color tokens
├── contexts/
│   └── PurchaseContext.tsx     # RevenueCat integration, tier state
├── data/                       # All app content (hardcoded TypeScript)
│   ├── plans.ts                # 4 meal plans with 7-day menus
│   ├── cookingInstructions.ts  # Cooking steps per meal
│   ├── templates.ts            # Template content
│   └── wellness.ts             # Wellness product data
├── hooks/
│   └── useColors.ts            # Theme-aware color hook
├── app.json                    # Expo app configuration
├── eas.json                    # EAS build/submit configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
├── babel.config.js             # Babel configuration
└── metro.config.js             # Metro bundler configuration
```

---

## How to Install Dependencies

**Requirements:**
- Node.js 18 or later
- pnpm (or npm/yarn)
- macOS (required for iOS builds)
- Xcode (for local iOS builds)

```bash
# From the nourish-app directory
npm install

# Or with pnpm
pnpm install
```

---

## How to Run the App Locally

```bash
# Start the Expo development server
npx expo start

# Then press 'i' to open iOS Simulator
# Or scan the QR code with Expo Go on your iPhone
```

**Note:** RevenueCat IAP features only work on a real physical iPhone. The iOS Simulator cannot process actual purchases.

---

## How to Run the Backend

There is no backend. Nourish is a fully client-side app. All data is:
- Hardcoded in the `data/` folder (meal plans, food guide content)
- Stored locally on the user's device via AsyncStorage (progress, custom meals, checked items)
- Managed by RevenueCat for subscription state

---

## How to Connect to the Database

There is no cloud database. User data lives on the device only. If a user uninstalls the app, their local progress (checked meals, custom entries) is lost. This is by design — no accounts, no sync.

---

## How to Build the iOS Version

Builds are done via EAS (Expo Application Services), not locally.

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo account (owner: jojo16467)
eas login

# Build and auto-submit to App Store Connect
EAS_NO_VCS=1 npx eas-cli@latest build --platform ios --profile production --auto-submit
```

When prompted for Apple 2FA, type `sms` and enter the code texted to your phone.

**What happens:**
1. EAS compiles the app on Expo's cloud servers (no Mac required)
2. The `.ipa` file is automatically uploaded to App Store Connect
3. Apple processes it (5–10 min) then sends an email confirmation
4. You then go to App Store Connect → TestFlight or submit for review

---

## How to Prepare and Submit a Future App Store Update

1. Make your code changes in the `app/` or `data/` directories
2. If it's a content-only change, the version number auto-increments via `"autoIncrement": true` in `eas.json`
3. Run the build command above
4. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → Your App → App Store → + Version (if major) or select the new build in an existing version
5. Submit for review

**Important Apple IAP rule:** Any subscription tier shown in the app must exist as an active In-App Purchase in App Store Connect under your app. The 3 current products are:
- `nourish_essentials_monthly_plan` — $9.99/mo
- `nourish_pro_monthly` — $24.99/mo  
- `nourish_founder_monthly` — $149.99/mo

---

## How the Current Production Deployment Works

1. Source code lives in Replit (and this backup)
2. Builds are compiled on EAS cloud servers (expo.dev)
3. The compiled `.ipa` is submitted to Apple App Store Connect
4. Apple distributes the app to users via the App Store
5. RevenueCat handles purchase verification between the app and Apple's servers

There is no server to keep running. The app is entirely distributed by Apple.

---

## Which Services Must Remain Active

| Service | What happens if disconnected |
|---|---|
| Apple App Store Connect | App becomes unavailable to download |
| RevenueCat | Subscriptions cannot be processed or verified |
| Expo / EAS | Future builds cannot be compiled |
| Apple Developer Program ($99/yr) | App is removed from the App Store |

---

## Known Limitations

- **No account sync:** User progress (checked meals, edits) is local only. If a user gets a new phone, progress does not transfer.
- **Web version is limited:** IAP does not work in browser — it's a mobile-only purchase flow.
- **iOS only:** The app is currently configured for iOS only. Android is not submitted to the Play Store (though the code supports it).
- **Screenshot naming:** `assets/images/store/screenshot-3-lifetime.png` is an old filename from a previous version. It does not affect the app or Apple review — it is only a local asset file name.
