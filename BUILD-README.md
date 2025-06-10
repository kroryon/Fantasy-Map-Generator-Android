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
npm install --legacy-peer-deps
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

###### Step 2: Sync Web Assets with Android
```powershel
# Sync web files to Android project
npx cap sync android
```
- **What this does**: Copies the content of your `www/` folder into the Android project's assets.
- **Always run**: This command should be run before every build if you have made changes to the web assets.
- **Updates**: Ensures the Android app uses the latest web code.

###### Step 3: Build the APK

**🐛 Debug Version (for testing - automatically signed)**
```powershell
# Build debug APK
npm run build-android

#or if this doesnt work you can try...

cd android

./gradlew.bat assembledebug

```
- **Output**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Signed**: ✅ Automatically signed with a debug keystore.
- **Installable**: ✅ Ready to install on any Android device/emulator for testing.

**🚀 Release Version (for distribution - automatically signed with debug key by default)**
```powershell
# Build release APK
npm run build-android-release

#or if this doesnt work you can try...

cd android

./gradlew.bat assemblerelease


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

## 🔧 Development Commands

### Open Android Project in Android Studio
```bash
npm run open-android
```
This command runs `npx cap open android`.


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

