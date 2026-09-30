# MAYRA AI - Android APK & Mobile Deployment Guide

Welcome to the **MAYRA AI Android Assistant** package. This guide is specifically designed for users who want to run or compile the Android APK.

---

### 🚀 Option 1: Instant 1-Tap Mobile Installation (PWA APK Standalone)
You can install MAYRA AI right from your Android browser in 5 seconds without compiling anything:
1. Open this application in **Chrome** on your Android smartphone.
2. Tap the **📱 APK & Install** button in the app top bar, or tap the Chrome browser menu (three dots `⋮` in the top right).
3. Tap **"Install app"** or **"Add to Home screen"**.
4. Tap **Install**.
5. MAYRA AI will appear on your Android launcher drawer and open in full-screen standalone mode with hardware microphone and camera permissions!

---

### 📦 Option 2: 100% Free Automated Cloud APK Compiler (GitHub Actions)
If you want a compiled `.apk` installer package file (`app-debug.apk`):
1. Tap **"Export Source"** inside MAYRA AI's APK Hub, or download `mayra-ai-android-project.zip`.
2. Open [github.com](https://github.com) on your phone browser and create a new repository (e.g., `mayra-assistant`).
3. Upload the project files or push to main branch.
4. Go to the **Actions** tab on your GitHub repository.
5. Tap the **"Build MAYRA AI Android APK"** workflow -> **"Run workflow"**.
6. In ~2 minutes, the cloud runner completes the Android build and produces `app-debug.apk` under **Artifacts / Releases**.
7. Tap `app-debug.apk` to download and install on your phone!

---

### ⚡ Option 3: Compile APK Directly on Android with Termux (No PC)
If you have the free **Termux** app installed from F-Droid:
```bash
# 1. Update and install packages
pkg update -y && pkg install -y openjdk-17 nodejs-lts git unzip

# 2. Extract MAYRA project
unzip mayra-ai-android-project.zip -d mayra-ai
cd mayra-ai

# 3. Build Web Bundle
npm install
npm run build

# 4. Sync Capacitor
npx cap sync android

# 5. Compile Debug APK
cd android
chmod +x gradlew
./gradlew assembleDebug

# 6. Copy APK to phone Downloads
cp app/build/outputs/apk/debug/app-debug.apk /sdcard/Download/MAYRA-AI.apk
```

---

### 🛡️ Android Permissions Configured
- `RECORD_AUDIO` – Real-time Gemini 3.1 live voice calls
- `CAMERA` – Multimodal vision scanner & QR reader
- `POST_NOTIFICATIONS` – Android system alerts and reminders
- `VIBRATE` & `WAKE_LOCK` – Dynamic haptic pulses and screen wake
- `INTERNET` & `ACCESS_NETWORK_STATE` – Real-time cloud connectivity
- `CALL_PHONE` & `SEND_SMS` – Native phone action shortcuts

---

### 💡 Android Install Troubleshooting
- If Android shows *"Blocked by Play Protect / Unknown Apps"*, tap **"Details"** -> **"Install anyway"**.
- Grant Microphone and Camera permissions when prompted.
