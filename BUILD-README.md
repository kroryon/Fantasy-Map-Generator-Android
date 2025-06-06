# Fantasy Map Generator - Desktop & Mobile

Azgaar's Fantasy Map Generator converted to desktop and mobile applications.

## 🎯 Quick Start

### Prerequisites
- **Node.js 16+** (Download from: https://nodejs.org/)
- **PowerShell** (for Windows users)
- **For Android**: Android Studio with SDK + Java JDK 8+

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/Fantasy-Map-Generator-Ck3.git
cd Fantasy-Map-Generator-Ck3

# Install dependencies
npm install
```

## 🚀 Building Applications

### 🖥️ Desktop Applications

#### Windows Executable (.exe)
```bash
npm run build-win
```
**Output:** `dist/fantasy-map-generator-win32-x64/fantasy-map-generator.exe`

#### Linux Application
```bash
npm run build-linux
```
**Output:** `dist/fantasy-map-generator-linux-x64/fantasy-map-generator`

#### Build Both Desktop Versions
```bash
npm run build-desktop
```

### 📱 Android APK

#### Complete Android Setup (First Time Only)

##### Step 1: Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio and complete setup wizard
4. Install Android SDK (API 30 or higher recommended)

##### Step 2: Install Java JDK
1. Download Java JDK 8+ from: https://adoptium.net/
2. Install with default settings
3. Note the installation path (e.g., `C:\Program Files\Eclipse Adoptium\jdk-11.0.xx.x-hotspot`)

##### Step 3: Configure Environment Variables (Windows)
```powershell
# Open PowerShell as Administrator and run:
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-11.0.xx.x-hotspot", "User")

# Restart PowerShell after setting variables
```

##### Step 4: Verify Environment Setup
```powershell
# Check ANDROID_HOME
echo $env:ANDROID_HOME
# Should show: C:\Users\YourUsername\AppData\Local\Android\Sdk

# Check Java
java -version
# Should show Java version 8 or higher

# Check Android SDK
ls "$env:ANDROID_HOME\platforms"
# Should list Android platforms like android-30, android-31, etc.
```

#### Build Android APK

##### Debug Version (for testing)
```bash
npm run build-android
```
**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

##### Release Version (for distribution)
```bash
npm run build-android-release
```
**Output:** `android/app/build/outputs/apk/release/app-release.apk`

## 🔧 Development Commands

### Run Desktop Version (Development)
```bash
npm run electron
```

### Open Android Project in Android Studio
```bash
npm run open-android
```

### Test Individual Components
```bash
# Test WWW folder creation and file copying
npm run test-scripts

# Create WWW folder only
npm run copy-www

# Clean all build files
npm run clean

# Clean and rebuild desktop versions
npm run clean-build
```

## 📁 Project Structure
```
Fantasy-Map-Generator-Ck3/
├── 📂 Source Files (committed to git)
│   ├── components/              # UI components
│   ├── modules/                 # Core functionality  
│   ├── styles/                  # CSS styles
│   ├── images/                  # Assets and icons
│   ├── charges/                 # Heraldic symbols
│   ├── heightmaps/              # Terrain data
│   ├── libs/                    # Third-party libraries
│   ├── utils/                   # Utility functions
│   ├── config/                  # Configuration files
│   ├── capacitor.config.ts      # Mobile app configuration
│   ├── electron-main.js         # Desktop app entry point
│   ├── package.json            # Dependencies and scripts
│   ├── .gitignore              # Git ignore rules
│   └── BUILD-README.md         # This file
│
├── 📂 Generated Files (NOT committed to git)
│   ├── android/                 # Generated Android project
│   ├── www/                     # Generated web assets for mobile
│   ├── dist/                    # Generated desktop builds
│   └── node_modules/            # NPM dependencies
```

## 🛠️ Technologies Used
- **Electron** - Desktop applications
- **Capacitor** - Mobile applications
- **Express** - Local server for Electron
- **Gradle** - Android build system
- **electron-packager** - Desktop app packaging

## 📦 Available Scripts

### Build Scripts
```bash
npm run build-win               # Build Windows .exe
npm run build-linux             # Build Linux binary
npm run build-desktop           # Build both desktop versions
npm run build-android           # Build Android debug APK
npm run build-android-release   # Build Android release APK
```

### Development Scripts
```bash
npm run electron                # Run desktop app in development
npm run electron-dev            # Run desktop app with dev flag
npm run open-android            # Open Android project in Android Studio
```

### Utility Scripts
```bash
npm run copy-www                # Copy web files to www/ folder
npm run test-scripts            # Test file copying process
npm run clean                   # Remove all build folders
npm run clean-build             # Clean and rebuild desktop
```

## 🚨 Troubleshooting

### Desktop Build Issues

#### Electron not found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

#### Permission errors (Windows)
```bash
# Run PowerShell as Administrator
# Or give execution permissions:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Build fails
```bash
# Clean and rebuild
npm run clean-build
```

### Android Build Issues

#### SDK location not found
```bash
# Check environment variables
echo $env:ANDROID_HOME
echo $env:JAVA_HOME

# If empty, set them (adjust paths to your installation):
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-11.0.xx.x-hotspot", "User")

# Restart PowerShell and try again
```

#### Gradle wrapper errors
```bash
# Make sure gradlew.bat is executable
cd android
icacls gradlew.bat /grant:r %USERNAME%:F

# Try running build directly
gradlew.bat assembleDebug
```

#### Android platform not added
```bash
# Add Android platform manually
npx cap add android
npx cap sync android
```

#### Java version issues
```bash
# Check Java version
java -version

# Should show version 8 or higher
# If not, download from: https://adoptium.net/
```

#### Build cache issues
```bash
# Clean everything and start fresh
npm run clean
rm -rf android/
npm run build-android
```

#### Capacitor sync issues
```bash
# Force sync
npx cap sync android --force
```

## 📱 Installing APK on Android Device

### Enable Developer Options
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Enable **Install Unknown Apps** for your file manager

### Install APK
1. Copy `app-debug.apk` to your Android device
2. Open the APK file with a file manager
3. Allow installation from unknown sources if prompted
4. Install the app

### Alternative: ADB Install
```bash
# Connect device via USB
adb devices

# Install APK directly
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔄 Complete Build Workflow

### First Time Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd Fantasy-Map-Generator-Ck3

# 2. Install Node.js dependencies
npm install

# 3. For Android: Setup Android Studio and environment variables
# (Follow Android Setup section above)

# 4. Test desktop build
npm run electron

# 5. Test Android build (if Android setup is complete)
npm run build-android
```

### Building for Distribution
```bash
# 1. Clean previous builds
npm run clean

# 2. Build desktop versions
npm run build-desktop

# 3. Build Android APK
npm run build-android

# 4. Outputs will be in:
#    - dist/fantasy-map-generator-win32-x64/fantasy-map-generator.exe
#    - dist/fantasy-map-generator-linux-x64/fantasy-map-generator
#    - android/app/build/outputs/apk/debug/app-debug.apk
```

### Testing Builds
```bash
# Test desktop version
npm run electron

# Test Android in emulator (requires Android Studio)
npm run open-android
# Then use "Run app" button in Android Studio
```

## 📋 System Requirements

### Development Machine
- **OS**: Windows 10/11, macOS 10.14+, or Linux
- **Node.js**: Version 16 or higher
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5GB free space (more for Android SDK)

### For Desktop Builds
- **Windows**: Windows 7 or higher
- **Linux**: Most modern distributions

### For Android Development
- **Android Studio**: Latest version
- **Java JDK**: Version 8 or higher
- **Android SDK**: API level 23 or higher
- **Additional Storage**: 3GB+ for Android SDK

### Target Devices
- **Desktop**: Windows 7+, Linux with glibc 2.17+
- **Android**: API level 23+ (Android 6.0+), 2GB RAM

## 🔐 Security Notes

### APK Signing (for Production)
```bash
# For Play Store distribution, you need to sign the APK
# This requires setting up signing keys in Android Studio
# Debug APKs are automatically signed with debug keys (not for production)
```

### Environment Variables
- Never commit `.env` files or API keys
- Android local.properties file is automatically git-ignored
- Keep ANDROID_HOME and JAVA_HOME paths correct for your system

## 📞 Support & Contributing

### Getting Help
If you encounter issues:
1. Check this troubleshooting section
2. Ensure all prerequisites are installed correctly
3. Try cleaning and rebuilding: `npm run clean-build`
4. Check environment variables are set correctly
5. Open an issue with error details and system info

### Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Make changes (avoid committing dist/, android/, www/ folders)
4. Test builds: `npm run build-desktop` and `npm run build-android`
5. Commit changes: `git commit -m 'Add some AmazingFeature'`
6. Push to branch: `git push origin feature/AmazingFeature`
7. Open a Pull Request

### Important: What NOT to Commit
The `.gitignore` file excludes these generated folders:
- `android/` - Generated by Capacitor
- `www/` - Generated web assets
- `dist/` - Generated desktop builds
- `node_modules/` - NPM dependencies

Only commit source files and configuration!

## 📄 License
This project maintains the same license as the original Azgaar's Fantasy Map Generator.

## 🙏 Credits
- **Original Fantasy Map Generator** by [Azgaar](https://github.com/Azgaar/Fantasy-Map-Generator)
- **Desktop & Mobile conversion** - Community contribution
- **Electron** - Desktop app framework
- **Capacitor** - Mobile app framework
```bash
npm run build-android
```

### Step 4: Install on Android Device
1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging** and **Install Unknown Apps**
3. Transfer APK to device and install

## 📁 Project Structure
```
Fantasy-Map-Generator-Ck3/
├── android/                 # Generated Android project (git ignored)
├── www/                     # Generated web assets for mobile (git ignored)
├── dist/                    # Generated desktop builds (git ignored)
├── components/              # UI components
├── modules/                 # Core functionality  
├── styles/                  # CSS styles
├── images/                  # Assets and icons
├── capacitor.config.ts      # Mobile app configuration
├── electron-main.js         # Desktop app entry point
└── package.json            # Dependencies and scripts
```

## 🛠️ Technologies Used
- **Electron** - Desktop applications
- **Capacitor** - Mobile applications
- **Express** - Local server for Electron
- **Gradle** - Android build system

## 📋 Build Requirements

### For Windows (.exe)
- Windows OS
- Node.js 16+
- PowerShell

### For Linux Application
- Linux OS or WSL
- Node.js 16+

### For Android (.apk)
- Windows/Linux/macOS
- Android Studio with SDK
- Java JDK 8 or higher
- Android SDK Build Tools
- Node.js 16+

## 🚨 Troubleshooting

### Desktop Build Issues
```bash
# If Electron not found
npm install

# If permission errors (Windows)
# Run PowerShell as Administrator

# Clean and rebuild
npm run clean-build
```

### Android Build Issues

#### SDK not found
```bash
# Check if ANDROID_HOME is set
echo $env:ANDROID_HOME

# If empty, set it:
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk", "User")
```

#### Gradle errors
```bash
# Check Java version
java -version

# Should show Java 8 or higher
# If not installed, download from: https://adoptium.net/
```

#### Build fails after changes
```bash
# Clean everything and start fresh
npm run clean
npm run build-android
```

#### Gradlew permission errors
```bash
# In android folder:
cd android
icacls gradlew.bat /grant:r %USERNAME%:F
```

## 📦 Distribution

### Desktop Applications
- **Windows**: Distribute the `.exe` file from `dist/fantasy-map-generator-win32-x64/`
- **Linux**: Distribute the executable from `dist/fantasy-map-generator-linux-x64/`

### Android Application
- **Debug**: Use `app-debug.apk` for testing
- **Release**: Use `app-release.apk` for distribution (requires signing for Play Store)

## 🔄 Development Workflow

### First Time Setup
```bash
git clone <repository>
cd Fantasy-Map-Generator-Ck3
npm install
```

### Building for Distribution
```bash
# Clean previous builds
npm run clean

# Build desktop versions
npm run build-desktop

# Build Android (if needed)
npm run build-android
```

### Testing Builds
```bash
# Test desktop version
npm run electron

# Test Android in emulator
npm run open-android
# Then use Android Studio's emulator
```

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License
This project maintains the same license as the original Azgaar's Fantasy Map Generator.

## 🙏 Credits
- **Original Fantasy Map Generator** by [Azgaar](https://github.com/Azgaar/Fantasy-Map-Generator)
- **Desktop & Mobile conversion** - Community contribution

## 📞 Support
If you encounter issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Try cleaning and rebuilding: `npm run clean-build`
4. Open an issue with error details and your system info
