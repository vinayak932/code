#!/bin/bash

echo "🚀 AI Stock Predictor - APK Build Script"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Android Studio/SDK is available
if ! command -v adb &> /dev/null; then
    echo "⚠️  Android SDK not found. Make sure Android Studio is installed and ADB is in PATH."
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Installing Capacitor dependencies..."
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/app @capacitor/haptics @capacitor/keyboard
npm install @capacitor/push-notifications @capacitor/splash-screen @capacitor/status-bar @capacitor/toast

echo "🏗️  Building Next.js app..."
npm run build
npm run export

echo "📱 Initializing Capacitor..."
npx cap init "AI Stock Predictor" "com.aistockpredictor.app" --web-dir=out

echo "🤖 Adding Android platform..."
npx cap add android

echo "🔄 Syncing files..."
npx cap sync

echo "✅ Setup complete! Next steps:"
echo "1. Open Android Studio: npx cap open android"
echo "2. Build APK: Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo "3. APK location: android/app/build/outputs/apk/debug/app-debug.apk"

echo ""
echo "🚀 Quick build (if Android SDK is configured):"
echo "cd android && ./gradlew assembleDebug"
