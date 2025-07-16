#!/bin/bash

echo "🚀 Quick APK Build for AI Stock Predictor"
echo "========================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js not found. Install from: https://nodejs.org/"
    exit 1
fi

if ! command_exists java; then
    echo "❌ Java not found. Install JDK 11 or higher"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent

# Build web app
echo "🏗️  Building web application..."
npm run build > /dev/null 2>&1
npm run export > /dev/null 2>&1

if [ ! -d "out" ]; then
    echo "❌ Build failed - 'out' directory not found"
    exit 1
fi

echo "✅ Web app built successfully"

# Setup Capacitor
echo "📱 Setting up Capacitor..."
npx cap init "AI Stock Predictor" "com.aistockpredictor.app" --web-dir=out > /dev/null 2>&1
npx cap add android > /dev/null 2>&1
npx cap sync > /dev/null 2>&1

echo "✅ Capacitor setup complete"

# Check if Android SDK is available
if command_exists adb && [ -d "android" ]; then
    echo "🤖 Building APK..."
    cd android
    chmod +x ./gradlew
    ./gradlew assembleDebug > /dev/null 2>&1
    
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
        echo "🎉 APK built successfully!"
        echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
        
        # Copy APK to root directory
        cp app/build/outputs/apk/debug/app-debug.apk ../ai-stock-predictor.apk
        echo "📱 APK copied to: ai-stock-predictor.apk"
        
        # Get APK info
        APK_SIZE=$(du -h ../ai-stock-predictor.apk | cut -f1)
        echo "📊 APK Size: $APK_SIZE"
        
    else
        echo "❌ APK build failed"
        exit 1
    fi
else
    echo "⚠️  Android SDK not found. Please:"
    echo "1. Install Android Studio"
    echo "2. Run: npx cap open android"
    echo "3. Build APK in Android Studio"
fi

echo ""
echo "🚀 Build complete! Next steps:"
echo "1. Install APK: adb install ai-stock-predictor.apk"
echo "2. Or transfer APK to Android device and install manually"
echo "3. Enable 'Unknown Sources' if installing manually"
