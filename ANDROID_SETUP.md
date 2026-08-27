# Android Build & Google Play Setup Guide

The Nourish app code is fully Android-ready. Follow these steps once your Google Play Developer account is active.

---

## Step 1 — Create your Google Play Developer account
1. Go to [play.google.com/console](https://play.google.com/console) and sign in with your Google account.
2. Pay the one-time $25 registration fee.
3. Complete the account registration form (developer name, contact details).
4. Wait for account approval (usually same day).

---

## Step 2 — Create the app listing in Play Console
1. In Play Console, click **Create app**.
2. Set:
   - **App name:** Nourish
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free (RevenueCat handles in-app purchases)
3. Click **Create app** to save.
4. Note the **Package name**: `com.ristudio.nourish` (must match `app.json`).

---

## Step 3 — Create a Google Service Account for EAS Submit
EAS needs a service account key to upload builds automatically.

1. In Play Console, go to **Setup → API access**.
2. Link to a Google Cloud project (create one if prompted).
3. Click **Create new service account** → follow the Google Cloud link.
4. In Google Cloud, create a service account:
   - Name: `eas-submit`
   - Role: **Service Account User**
5. Create a JSON key for that service account and download it.
6. Back in Play Console, grant the service account **Release manager** permissions.
7. Save the downloaded JSON file as `artifacts/nourish-app/google-service-account.json`.

> ⚠️ Never commit `google-service-account.json` to git — it is already in `.gitignore`.

---

## Step 4 — Build and submit to internal testing

From the project root, run:

```bash
# Build the Android APK/AAB
eas build --platform android --profile production

# Submit to Google Play internal testing track
eas submit --platform android --profile production
```

EAS will:
- Generate and manage the Android keystore automatically (stored securely in EAS).
- Build a signed AAB (Android App Bundle).
- Upload it to the **internal testing** track as a draft release.

---

## Step 5 — Promote to internal testers
1. In Play Console, go to **Testing → Internal testing**.
2. Promote the draft release.
3. Add tester email addresses under **Testers**.
4. Share the opt-in link with testers.

---

## What's already configured

| Item | Status |
|------|--------|
| Android package name (`com.ristudio.nourish`) | ✅ `app.json` |
| Adaptive icon + brand background color | ✅ `app.json` |
| RevenueCat Android API key | ✅ `PurchaseContext.tsx` |
| EAS Android submit profile (internal track) | ✅ `eas.json` |
| EAS project ID | ✅ `app.json` |
