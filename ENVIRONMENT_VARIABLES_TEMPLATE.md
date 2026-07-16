# Environment Variables & Secrets Template
**Nourish — RI Studio LLC**  
**Important:** This file lists required credentials. Never commit actual secret values to GitHub.

---

## Build-Time Secrets (Used in Terminal / CI only)

### EXPO_TOKEN
- **What it is:** Personal access token for authenticating with Expo and EAS CLI
- **Used for:** Running `eas build` and `eas submit` without interactive login
- **Service:** Expo (expo.dev)
- **How to get it:** Log in at [expo.dev](https://expo.dev) → Account Settings → Access Tokens → Create
- **Where it's used:** Set as an environment variable before running EAS commands:
  ```
  EXPO_TOKEN=your_token_here npx eas-cli@latest build ...
  ```

---

## App-Level Keys (Hardcoded in source — safe to commit as public keys)

### RevenueCat iOS Public Key
- **Current value location:** `contexts/PurchaseContext.tsx` line: `RC_API_KEY_IOS`
- **What it is:** The public API key for RevenueCat on iOS
- **Used for:** Initializing RevenueCat SDK to load and process Apple IAP
- **Service:** RevenueCat (app.revenuecat.com)
- **How to get it:** Log in → Your Project → Apps → iOS App → Public SDK Key
- **Notes:** This is a **public** key — safe to include in source code. It cannot be used to make purchases on your behalf.

### RevenueCat Android Public Key
- **Current value location:** `contexts/PurchaseContext.tsx` line: `RC_API_KEY_ANDROID`
- **What it is:** The public API key for RevenueCat on Android
- **Used for:** Android builds (not currently live on Play Store)
- **Service:** RevenueCat (app.revenuecat.com)
- **How to get it:** Log in → Your Project → Apps → Android App → Public SDK Key

---

## Apple App Store Credentials (Stored in eas.json — safe to commit)

These are identifiers, not secrets:

| Field | Value | Where to find |
|---|---|---|
| `appleId` | Your Apple ID email | appleid.apple.com |
| `ascAppId` | App Store Connect App ID | App Store Connect → App → General → Apple ID |
| `appleTeamId` | Apple Developer Team ID | developer.apple.com → Membership |

**Note:** The Apple ID password and 2FA are entered interactively when you run `eas submit` — they are never stored in files.

---

## EAS / Expo Account

| Field | Details |
|---|---|
| Expo account username | `jojo16467` |
| EAS Project ID | `8f259da7-0d7c-480b-8f48-7c862d2bb34f` (in `app.json`) |
| Project owner | Set in `app.json` → `"owner": "jojo16467"` |

To transfer ownership to a different Expo account: expo.dev → Project Settings → Transfer Ownership.

---

## What Has NO Secrets

- No `.env` file is required to run this app
- No database connection strings
- No backend API keys
- No authentication tokens stored in the app
- No Stripe, PayPal, or other payment keys (payments are handled entirely by Apple/RevenueCat)

---

## GitHub Safety Checklist

Before pushing to GitHub, confirm these files do NOT contain real secrets:
- [x] `contexts/PurchaseContext.tsx` — contains only **public** RC keys (safe)
- [x] `eas.json` — contains Apple IDs and team ID (not secret, safe to commit)
- [x] `app.json` — contains EAS project ID (safe to commit)
- [ ] Do NOT commit any file named `.env`, `.env.local`, or similar
- [ ] Do NOT commit your `EXPO_TOKEN` value anywhere
