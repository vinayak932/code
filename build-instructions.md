# AI Stock Predictor - Mobile App Build Instructions

## Prerequisites

1. **Install Node.js** (v18 or higher)
   \`\`\`bash
   # Check version
   node --version
   npm --version
   \`\`\`

2. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK (API level 33 or higher)
   - Set up Android Virtual Device (AVD) or connect physical device

3. **Install Java Development Kit (JDK 11)**
   \`\`\`bash
   # Check Java version
   java -version
   \`\`\`

4. **Install Capacitor CLI**
   \`\`\`bash
   npm install -g @capacitor/cli
   \`\`\`

## Build Steps

### Step 1: Install Dependencies
\`\`\`bash
# Install project dependencies
npm install

# Install Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/app @capacitor/haptics @capacitor/keyboard
npm install @capacitor/push-notifications @capacitor/splash-screen @capacitor/status-bar
\`\`\`

### Step 2: Build Web App
\`\`\`bash
# Build and export Next.js app
npm run export
\`\`\`

### Step 3: Initialize Capacitor
\`\`\`bash
# Initialize Capacitor (only first time)
npx cap init "AI Stock Predictor" "com.aistockpredictor.app"

# Add Android platform
npx cap add android
\`\`\`

### Step 4: Sync and Build
\`\`\`bash
# Sync web assets to native project
npx cap sync

# Open Android Studio
npx cap open android
\`\`\`

### Step 5: Build APK in Android Studio

1. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Go to `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - APK will be generated in: `android/app/build/outputs/apk/debug/`

2. **Alternative - Command Line Build:**
   \`\`\`bash
   # Build debug APK
   cd android
   ./gradlew assembleDebug
   
   # Build release APK (requires signing)
   ./gradlew assembleRelease
   \`\`\`

### Step 6: Install APK
\`\`\`bash
# Install on connected device
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or use Capacitor
npx cap run android
\`\`\`

## Alternative Methods

### Method 1: PWA to APK (Simpler)
\`\`\`bash
# Install PWA Builder CLI
npm install -g @pwabuilder/cli

# Generate APK from PWA
pwa-builder https://your-deployed-app.vercel.app --platform android
\`\`\`

### Method 2: Cordova (Legacy)
\`\`\`bash
# Install Cordova
npm install -g cordova

# Create Cordova project
cordova create ai-stock-predictor com.aistockpredictor.app "AI Stock Predictor"
cd ai-stock-predictor

# Add Android platform
cordova platform add android

# Build APK
cordova build android
\`\`\`

### Method 3: Tauri (Rust-based)
\`\`\`bash
# Install Tauri CLI
npm install -g @tauri-apps/cli

# Initialize Tauri
npm run tauri init

# Build APK
npm run tauri android build
\`\`\`

## Deployment Options

### 1. Google Play Store
- Create developer account ($25 one-time fee)
- Generate signed APK
- Upload to Play Console
- Complete store listing

### 2. Direct APK Distribution
- Build signed APK
- Distribute via website/email
- Users need to enable "Unknown Sources"

### 3. Alternative App Stores
- Amazon Appstore
- Samsung Galaxy Store
- F-Droid (for open source)

## Troubleshooting

### Common Issues:
1. **Gradle Build Failed**: Update Android SDK and build tools
2. **CORS Errors**: Configure API endpoints for mobile
3. **Network Issues**: Add network security config
4. **Permission Errors**: Check AndroidManifest.xml

### Debug Commands:
\`\`\`bash
# Check Capacitor doctor
npx cap doctor

# View device logs
adb logcat

# Clear cache
npx cap sync --force
\`\`\`

## Production Checklist

- [ ] Update API endpoints for production
- [ ] Configure app icons and splash screens
- [ ] Set up push notification certificates
- [ ] Test on multiple devices
- [ ] Generate signed APK for release
- [ ] Prepare store listing materials
