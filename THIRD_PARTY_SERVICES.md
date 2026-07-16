# Third-Party Services
**Nourish — RI Studio LLC**

---

## 1. Apple App Store Connect
- **URL:** appstoreconnect.apple.com
- **What it controls:** App distribution, App Store listing, reviews, ratings, app availability worldwide
- **Used for:** Submitting builds for review, managing In-App Purchase products, viewing sales/downloads
- **If disconnected:** The app is removed from the App Store and cannot be downloaded or updated
- **Cost:** Apple Developer Program — $99/year
- **Account:** joyo@hey.com / Team ID: HTQQ73P2N4

---

## 2. Apple Developer Program
- **URL:** developer.apple.com
- **What it controls:** iOS app signing certificates, provisioning profiles, team membership
- **Used for:** Allowing EAS to sign and notarize the app for App Store distribution
- **If disconnected:** App builds will fail, and the existing live app will eventually be removed from the store
- **Cost:** $99/year (same subscription as App Store Connect)

---

## 3. RevenueCat
- **URL:** app.revenuecat.com
- **What it controls:** In-App Purchase verification, subscription tier management, entitlement tracking
- **Used for:** When a user purchases a plan, RevenueCat validates the receipt with Apple and tells the app which tier the user has access to
- **If disconnected:** The app can no longer verify subscriptions. Existing subscribers may lose access. New purchases will fail.
- **Cost:** Free tier available; paid plans based on revenue
- **Products configured:**
  - `nourish_essentials_monthly_plan` — $9.99/mo (Essentials tier)
  - `nourish_pro_monthly` — $24.99/mo (Pro tier)
  - `nourish_founder_monthly` — $149.99/mo (Founder Circle tier)
- **Entitlements configured:** `essentials`, `pro`, `founder`

---

## 4. Expo / EAS (Expo Application Services)
- **URL:** expo.dev
- **What it controls:** Cloud build infrastructure, app compilation, submission pipeline
- **Used for:** Compiling the app into an `.ipa` file without needing a Mac or Xcode locally
- **If disconnected:** Future builds and App Store updates cannot be submitted (the live app continues to work)
- **Cost:** Free tier available for small build volumes; paid plans for more builds
- **Account:** jojo16467 (expo.dev)
- **EAS Project ID:** 8f259da7-0d7c-480b-8f48-7c862d2bb34f

---

## 5. Replit
- **URL:** replit.com
- **What it controls:** The development environment where the source code is edited and the web preview is hosted
- **Used for:** Writing and editing code, running the Expo dev server for browser preview
- **If disconnected:** The live iOS app on the App Store continues to work. Future development would need to move to another editor (VS Code, Cursor, etc.)
- **Cost:** Replit subscription (varies by plan)
- **Notes:** The app does NOT depend on Replit to run for users. It is only the development environment.

---

## 6. The ONE Device / TheraRoad
- **URL:** theonedevice.com/theraroad
- **What it controls:** External affiliate/product link in the Wellness Toolkit tab
- **Used for:** Directing users to purchase a physical wellness device
- **If disconnected:** The link in the Wellness tab will break, but the rest of the app is unaffected
- **Cost:** None (affiliate relationship)

---

## Services NOT Used

| Service | Status |
|---|---|
| Firebase / Supabase / PostgreSQL | Not used — no cloud database |
| Auth0 / Clerk / Supabase Auth | Not used — no user accounts |
| Stripe / PayPal | Not used — payments are Apple IAP only |
| Twilio / SendGrid | Not used — no email or notifications |
| AWS S3 / Cloudinary | Not used — no file uploads |
| Google Analytics / Mixpanel | Not used — no analytics tracking |
| Push notifications | Not used |
| Custom domain / CDN | Not used |

---

## Summary: What Must Stay Active

| Priority | Service | Why |
|---|---|---|
| Critical | Apple Developer Program | Without it, the app is pulled from the Store |
| Critical | RevenueCat | Without it, subscribers lose access |
| Important | Expo/EAS | Without it, you cannot update the app |
| Optional | Replit | Only needed for development |
