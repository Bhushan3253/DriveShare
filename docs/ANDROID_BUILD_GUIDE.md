# Android Mobile Application Build Guide

DriveShare includes an Android application built using **Capacitor**, providing cross-platform mobile capabilities with native hardware integration (Camera for KYC and inspections, Geolocation GPS for nearby vehicle discovery, and deep-link UPI payment intents).

---

## Prerequisites

- **Node.js (v18+)** & **npm**
- **Java Development Kit (JDK 17 or 21)**
- **Android Studio (Hedgehog or newer)** with Android SDK (API 34/35)

---

## Step 1: Build the Web Assets
From the `frontend/` directory, build the production web assets:

```bash
cd frontend
npm install
npm run build
```

---

## Step 2: Sync Web Assets to Android Project
Capacitor copies the built web assets into the Android native project:

```bash
npx cap sync android
```

---

## Step 3: Configure API Endpoint
In `frontend/.env` (or during build), specify your production backend URL:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## Option A: Build Debug APK via Command Line

You can build the debug APK directly with Gradle Wrapper without opening Android Studio:

```bash
cd frontend/android
./gradlew assembleDebug
```

On Windows PowerShell:
```powershell
cd frontend/android
.\gradlew.bat assembleDebug
```

The compiled APK will be output to:
`frontend/android/app/build/outputs/apk/debug/app-debug.apk`

---

## Option B: Open in Android Studio & Build Release APK / AAB

1. Open Android Studio.
2. Select **Open an Existing Project** and browse to `frontend/android`.
3. Allow Gradle to sync dependencies.
4. To run on a connected physical device or emulator:
   - Click the green **Run** button (or Shift + F10).
5. To generate a signed release APK or Google Play Android App Bundle (AAB):
   - In Android Studio menu, go to **Build** -> **Generate Signed Bundle / APK**.
   - Select **Android App Bundle** or **APK**.
   - Create or select your release Keystore and key alias.
   - Select build variant **release** and click **Finish**.
