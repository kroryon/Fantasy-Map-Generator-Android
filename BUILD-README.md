# Fantasy Map Generator - Android Mobile Edition

Azgaar's Fantasy Map Generator converted to Android mobile application with enhanced mobile compatibility.

## 🎯 Quick Start

### Prerequisites
- **Node.js 16+** (Download from: https://nodejs.org/)
- **PowerShell** (for Windows users)
- **Android Studio with SDK + Java JDK 8+**

### Installation
```bash
# Clone the repository
git clone https://github.com/kroryon/Fantasy-Map-Generator-Android.git
cd Fantasy-Map-Generator-Ck3

# Install dependencies
npm install
```

## 🚀 Android Development Setup

##### Step 1: Install Android Studio
1. **Download** Android Studio from: https://developer.android.com/studio
2. **Install** with default settings (accept all SDK licenses)
3. **Open** Android Studio and complete setup wizard
4. **Install Android SDK**: 
   - Go to `File` → `Settings` → `Appearance & Behavior` → `System Settings` → `Android SDK`
   - Install at least **API level 30** (Android 11) or higher
   - Install **Android SDK Build-Tools** (latest version)
   - Install **Android SDK Platform-Tools**

##### Step 2: Install Java JDK
1. **Download** Java JDK 8+ from: https://adoptium.net/
2. **Install** with default settings
3. **Note the installation path** (e.g., `C:\Program Files\Eclipse Adoptium\jdk-11.0.xx.x-hotspot`)

##### Step 3: Configure Environment Variables (Windows)
```powershell
# Open PowerShell as Administrator and run:
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-11.0.xx.x-hotspot", "User")

# Add Android tools to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$androidPath = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\build-tools"
[Environment]::SetEnvironmentVariable("PATH", "$currentPath;$androidPath", "User")

# ⚠️ IMPORTANT: Restart PowerShell completely after setting variables
```

##### Step 4: Verify Environment Setup
```powershell
# Check ANDROID_HOME
echo $env:ANDROID_HOME
# ✅ Should show: C:\Users\YourUsername\AppData\Local\Android\Sdk

# Check Java
java -version
# ✅ Should show Java version 8 or higher

# Check Android SDK platforms
ls "$env:ANDROID_HOME\platforms"
# ✅ Should list platforms like: android-30, android-31, android-32, etc.

# Check Android build tools
ls "$env:ANDROID_HOME\build-tools"
# ✅ Should list versions like: 30.0.3, 31.0.0, 32.0.0, etc.
```

##### Step 5: Configure local.properties (Critical for Android Builds)

⚠️ **REQUIRED**: Android builds will fail without proper `local.properties` configuration!

This file tells Gradle where to find your Android SDK. It should be created in the `android/` directory after running `npx cap add android`.

###### 📝 Create `android/local.properties` File
Navigate to the `android` folder and create a file named `local.properties` with the following content, replacing `YOUR_USERNAME` with your actual Windows username:

```properties
## This file must *NOT* be checked into Version Control Systems,
# as it contains information specific to your local configuration.
sdk.dir=C:/Users/YOUR_USERNAME/AppData/Local/Android/Sdk
```
To find your username, you can run `echo $env:USERNAME` in PowerShell.

Alternatively, you can create this file automatically by running this command from the project root after `android/` folder exists:
```powershell
# Automatically create local.properties with correct path
echo "sdk.dir=C:/Users/$env:USERNAME/AppData/Local/Android/Sdk" > android/local.properties
```

Common errors if `local.properties` is missing or incorrect include "SDK location not found" or "Could not determine the dependencies of task..."

#### 🔨 Build Android APK - Complete Step-by-Step Process

⚠️ **IMPORTANT**: Follow these steps in exact order to avoid build errors!

##### 📋 Step-by-Step Android Build Process

###### Step 1: Create WWW Directory and Copy Files
```powershell
# Create the www directory that Capacitor needs
npm run copy-www
```
- **What this does**: Creates `www/` folder and copies all web assets (HTML, JS, CSS, images).
- **Critical**: Capacitor requires a `www/` directory with `index.html` to build the Android app.
- **Fixes error**: "Could not find the web assets directory: .\www"

###### Step 2: Add Android Platform (First Time Only)
```powershell
# Add Android platform to the project
npx cap add android
```
- **What this does**: Creates the `android/` folder with the native Android project structure.
- **When to run**: Only the first time you set up the project or if the `android/` folder is deleted.
- **Skip if**: `android/` folder already exists.

###### Step 3: Sync Web Assets with Android
```powershell
# Sync web files to Android project
npx cap sync android
```
- **What this does**: Copies the content of your `www/` folder into the Android project's assets.
- **Always run**: This command should be run before every build if you have made changes to the web assets.
- **Updates**: Ensures the Android app uses the latest web code.

###### Step 4: Build the APK

**🐛 Debug Version (for testing - automatically signed)**
```powershell
# Build debug APK
npm run build-android
```
- **Output**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Signed**: ✅ Automatically signed with a debug keystore.
- **Installable**: ✅ Ready to install on any Android device/emulator for testing.

**🚀 Release Version (for distribution - automatically signed with debug key by default)**
```powershell
# Build release APK  
npm run build-android-release
```
- **Output**: `android/app/build/outputs/apk/release/app-release.apk`
- **Signed**: ✅ Automatically signed (by default, uses the same debug keystore for convenience. For Play Store, you'll need a proper release keystore).
- **Installable**: ✅ Ready to install on any Android device.

##### 🚀 Complete Build Command Sequence (Copy & Paste for first time or after clean)
```powershell
# Complete Android build process (run all commands in sequence)
npm run copy-www
npx cap add android # Skip if android folder exists
# Ensure android/local.properties is created here if it's the first time
# Example: echo "sdk.dir=C:/Users/$env:USERNAME/AppData/Local/Android/Sdk" > android/local.properties
npx cap sync android
npm run build-android
```

##### ⚡ Quick Rebuild (After Making Web Code Changes)
```powershell
# Quick rebuild after making code changes (local.properties and android/ folder already exist)
npm run copy-www
npx cap sync android
npm run build-android
```

#### 🔐 Android APK Auto-Signing Configuration

This project is configured to **auto-sign** both debug and release APKs using the standard Android debug keystore. This simplifies development and testing by ensuring generated APKs are always installable.

The `android/app/build.gradle` file includes: 
```gradle
// ...
signingConfigs {
    debug {
        storeFile file('debug.keystore') // Standard debug keystore
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        // By default, also uses the debug keystore for ease of testing releases.
        // For actual Play Store releases, replace this with your own release keystore.
        storeFile file('debug.keystore') 
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
}
buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }
    release {
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        signingConfig signingConfigs.release  // Auto-firma habilitada para release
    }
}
// ...
```
The `debug.keystore` is automatically generated by Android Studio/Gradle if it doesn't exist in `android/app/debug.keystore`.

**This setup means:**
- ✅ Builds work immediately without manual signing steps.
- ✅ APKs are always signed and ready to install for testing.
- ✅ No "APK not signed" errors during development.

##### 🆚 Differences Debug vs Release (with default signing)

| Aspect | Debug APK | Release APK (default) |
|---------|-----------|-------------|
| **Firmado** | ✅ Automático (debug key) | ✅ Automático (debug key) |
| **Depuración** | ✅ Habilitada | ❌ Deshabilitada |
| **Tamaño** | Más grande | Optimizada (if minifyEnabled true) |
| **Uso** | Testing, desarrollo | Testing release candidate |

##### 🏪 For Google Play Store (Production Release)
For publishing to the Google Play Store, you **MUST** create and use your own private release keystore.

###### Step 1: Generate Your Own Release Keystore
```powershell
# Navigate to the android/app folder
cd android/app

# Generate new keystore (replace placeholders)
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
# You will be prompted for passwords and distinguished name information.
# Remember these passwords and keep the .keystore file safe!
cd ../.. # Return to project root
```

###### Step 2: Configure `build.gradle` for Your Keystore
Modify `android/app/build.gradle` to use your new keystore for release builds. It's best practice to store your keystore passwords in a `gradle.properties` file that is NOT checked into version control.

1.  Create/edit `android/gradle.properties` (this file is usually in `.gitignore` by default in Android projects, if not, add it: `android/gradle.properties` and `*.keystore`):
    ```properties
    MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
    MYAPP_RELEASE_KEY_ALIAS=my-key-alias
    MYAPP_RELEASE_STORE_PASSWORD=your_store_password
    MYAPP_RELEASE_KEY_PASSWORD=your_key_password
    ```
    (Place `my-release-key.keystore` in `android/app/`)

2.  Update the `signingConfigs.release` block in `android/app/build.gradle`:
    ```gradle
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
    ```

###### Step 3: Build Release APK with Your Keystore
```powershell
npm run build-android-release
```
This will now produce an APK signed with your production release key.

### 🚨 Troubleshooting Android Build Issues

#### ❌ "SDK location not found" or "Could not determine the dependencies of task..."
**Problem**: Gradle can't find the Android SDK.
**Solution**:
1.  Ensure `ANDROID_HOME` environment variable is set correctly (see Step 3 & 4 of setup).
2.  Verify `android/local.properties` exists and has the correct `sdk.dir` path (see Step 5 of setup).
    ```powershell
    # Check content
    cat android/local.properties
    # If missing or wrong, recreate (from project root):
    echo "sdk.dir=C:/Users/$env:USERNAME/AppData/Local/Android/Sdk" > android/local.properties
    ```
3.  Clean and rebuild:
    ```powershell
    cd android
    .\gradlew.bat clean
    cd ..
    npm run build-android
    ```

#### ❌ "Could not find the web assets directory: .\www"
**Problem**: Capacitor's `www/` directory is missing.
**Solution**:
```powershell
# Create www directory and copy files
npm run copy-www
# Then try syncing and building again
npx cap sync android
npm run build-android
```

#### ❌ "android platform has not been added"
**Problem**: The native Android project hasn't been created.
**Solution**:
```powershell
# Add Android platform
npx cap add android
# Then try syncing and building again
npx cap sync android
npm run build-android
```

#### 🔐 APK Signing Issues (if auto-signing seems to fail or for verification)

###### ✅ Verify APK Signature
```powershell
# For debug APK:
jarsigner -verify -verbose -certs android/app/build/outputs/apk/debug/app-debug.apk
# For release APK:
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
# Should show: "jar verified."
```

###### 📋 Check Debug Keystore Info
```powershell
# Default location: android/app/debug.keystore
keytool -list -v -keystore android/app/debug.keystore -storepass android
# Alias: androiddebugkey, Password: android
```
If `debug.keystore` is missing, Gradle usually regenerates it. If issues persist, delete `android/app/debug.keystore` and let Gradle recreate it during the next build.

#### ❌ Java version issues
**Problem**: Incorrect Java version being used.
**Solution**:
1.  Run `java -version`. Ensure it's JDK 8 or higher (as required by your Android Gradle Plugin version, typically 8, 11, or 17).
2.  Verify `JAVA_HOME` environment variable is set correctly to your JDK installation path.
3.  Restart PowerShell/IDE after changing environment variables.

#### ❌ Gradle daemon or cache issues
**Solution**:
```powershell
# Stop Gradle daemons
cd android
.\gradlew.bat --stop
cd ..

# Clean Gradle cache (more aggressive)
# For Windows, delete .gradle folder in C:\Users\YOUR_USERNAME\.gradle\
# Then try rebuilding.
```

#### ✅ Quick Environment Check Script
```powershell
# Run this to verify your setup:
Write-Host "=== Android Build Environment Check ===" -ForegroundColor Green
Write-Host "`nJava Version:" -ForegroundColor Yellow; java -version
Write-Host "`nEnvironment Variables:" -ForegroundColor Yellow
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"; Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "`nAndroid SDK Check:" -ForegroundColor Yellow
if (Test-Path "$env:ANDROID_HOME\platforms") { Write-Host "✅ Platforms Found" -ForegroundColor Green } else { Write-Host "❌ Android platforms NOT FOUND!" -ForegroundColor Red }
if (Test-Path "$env:ANDROID_HOME\build-tools") { Write-Host "✅ Build tools Found" -ForegroundColor Green } else { Write-Host "❌ Android build-tools NOT FOUND!" -ForegroundColor Red }
Write-Host "`nProject Status:" -ForegroundColor Yellow
if (Test-Path "android") { Write-Host "✅ Android platform exists" -ForegroundColor Green } else { Write-Host "⚠️ Android platform needs to be added (npx cap add android)" -ForegroundColor Yellow }
if (Test-Path "www") { Write-Host "✅ www folder exists" -ForegroundColor Green } else { Write-Host "⚠️ www folder needs to be created (npm run copy-www)" -ForegroundColor Yellow }
if (Test-Path "android/local.properties") { Write-Host "✅ local.properties exists" -ForegroundColor Green } else { Write-Host "⚠️ local.properties may be missing in android/" -ForegroundColor Yellow }
```

## 📱 Mobile Compatibility Features

This version includes **improved mobile compatibility** specifically designed to work with:
- **BlueStacks** and other Android emulators
- **Real Android devices** 
- **Touch-enabled Windows devices** (when testing in browser)
- **Mobile browsers** (when testing in browser)

### 🔧 Mobile-Specific Files
The following files handle mobile compatibility and are automatically included in builds:
- **`mobile-compatibility-v2.js`** - Custom dialog minimization system
- **`azgaar-touch-enhancements.js`** - Touch event handling improvements
- **`mobile-dialog-scroll-fix.js`** - Scroll fixes for dialogs
- **`universal-scroll-fix.js`** - Comprehensive scroll system for UI elements
- **`mobile-options-fix.css`** - CSS fixes for mobile menu scrolling and sizing

### 🆕 Dialog Minimization & Enhanced Scroll Systems
This version features a custom dialog minimization system and an enhanced scroll system, crucial for usability on smaller screens. These systems bypass jQuery UI limitations on mobile and provide a smoother experience.

### 📋 Mobile Testing
```bash
# Test in local browser (simulating mobile)
# 1. Run your local web server (e.g., npm start if configured, or open index.html directly)
# 2. Open DevTools > Toggle Device Toolbar (Ctrl+Shift+M) in your browser.

# Test Android APK in emulator/device
npm run build-android
# Install APK in BlueStacks, Android Studio Emulator, or a real Android device.
# Verify dialog minimization, scrolling, and general touch interactions.
```

## 🔧 Development Commands

### Open Android Project in Android Studio
```bash
npm run open-android
```
This command runs `npx cap open android`.

### Utility Commands
```bash
npm run copy-www                # 📋 Copy web files to www/ folder (essential before sync/build)
npm run create-www              # 📁 (Usually part of copy-www) Create www/ directory if it doesn't exist
npm run ensure-android          # ✅ (Usually part of build scripts) Add Android platform if missing
npm run prepare-android         # 🔄 Prepare Android build (copy-www + cap sync android)
npm run clean                   # 🧹 Remove www/, android/app/build, and other generated folders
```

## 📁 Project Structure (Simplified for Android Focus)
```
Fantasy-Map-Generator-Ck3/
├── 📂 Source Files (HTML, JS, CSS, images - committed to git)
│   ├── components/              # UI components
│   ├── modules/                 # Core functionality  
│   ├── styles/                  # CSS styles
│   ├── ... (other web asset folders like images/, charges/, etc.)
│   ├── mobile-compatibility-v2.js 
│   ├── azgaar-touch-enhancements.js
│   ├── mobile-dialog-scroll-fix.js
│   ├── universal-scroll-fix.js 
│   ├── mobile-options-fix.css  
│   ├── capacitor.config.ts      # Mobile app configuration
│   ├── package.json             # Dependencies and scripts
│   └── BUILD-README.md          # This file
│
├── 📂 Generated Files (Generally NOT committed to git)
│   ├── android/                 # Generated Android project (contains native code)
│   ├── www/                     # Generated web assets copied for Capacitor
│   └── node_modules/            # NPM dependencies
```

## 🛠️ Technologies Used (Android Focus)
- **Capacitor** - Core technology for building native mobile applications from web code.
- **Gradle** - Android build system.
- **Android SDK/Studio** - Tools and libraries for Android development.

## 📦 Android Command Reference

### 🏗️ Build Commands
```bash
npm run build-android           # 🐛 Build debug APK (for testing)
npm run build-android-release   # 🚀 Build release APK (for distribution, ensure signing is configured)
```

### 🔧 Development Commands
```bash
npm run open-android            # 📱 Open Android project in Android Studio
npm run prepare-android         # 🔄 Shortcut for: npm run copy-www && npx cap sync android
```

### 📊 Output Locations (Android)
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

## 📱 Installing APK on Android Devices

### 🎮 BlueStacks or Android Studio Emulator
1.  **Build the APK**: `npm run build-android`
2.  **Locate your APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
3.  **Install**:
    *   **BlueStacks**: Drag the APK file into the BlueStacks window.
    *   **Android Studio Emulator**: Drag the APK onto the emulator screen, or use ADB.

### 📱 Real Android Device
1.  **Enable Developer Options & USB Debugging** on your device.
2.  **Enable "Install unknown apps"** (or "Unknown sources") in your device settings.
3.  **Transfer APK**: Copy `app-debug.apk` to your device (USB, cloud, etc.).
4.  **Install**: Open the APK file on your device using a file manager and tap `Install`.

#### ADB Install (Alternative)
```bash
# Connect device via USB (with USB Debugging enabled)
adb devices # Ensure device is listed
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 🔍 Troubleshooting Installation
- **"App not installed"**: Uninstall previous versions, free up storage, or check "Install unknown apps" permission.
- **"Parse error"**: APK might be corrupt; re-transfer or rebuild.
- **"Installation blocked"**: Ensure "Unknown sources" or "Install unknown apps" is enabled.

## 🔄 Build & Development Workflow Summary (Android)

### First Time Setup (After Cloning & `npm install`)
1.  **Complete Android Environment Setup** (Android Studio, JDK, Env Vars - see beginning of this README).
2.  **Initial Project Setup for Android**:
    ```powershell
    npm run copy-www
    npx cap add android
    # Create android/local.properties if it wasn't made automatically or by Android Studio
    echo "sdk.dir=C:/Users/$env:USERNAME/AppData/Local/Android/Sdk" > android/local.properties 
    npx cap sync android
    npm run build-android # Test build
    ```

### Regular Development Cycle (After making web code changes)
```powershell
npm run copy-www      # Copy latest web code to www/
npx cap sync android  # Sync www/ to Android project
npm run build-android # Build new APK
# Test on emulator/device
```
Or use the combined command: `npm run prepare-android && npm run build-android`

## 📄 License
This project maintains the same license as the original Azgaar's Fantasy Map Generator.

