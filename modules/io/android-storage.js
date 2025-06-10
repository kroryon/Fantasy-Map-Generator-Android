// Android Storage Module - Simple and robust
"use strict";

// Enhanced debugging
function debugLog(message, data) {
  console.log(`[AndroidStorage] ${message}`, data || '');
}

// Check if Capacitor is available with detailed logging
function checkCapacitorAvailability() {
  debugLog('Checking Capacitor availability...');
  
  const checks = {
    hasWindow: typeof window !== 'undefined',
    hasCapacitor: !!window.Capacitor,
    hasGetPlatform: false,
    isAndroid: false,
    hasPlugins: false,
    hasFilesystem: false,
    availablePlugins: []
  };

  if (checks.hasCapacitor) {
    debugLog('Capacitor object found');
    checks.hasGetPlatform = typeof window.Capacitor.getPlatform === 'function';
    
    if (checks.hasGetPlatform) {
      try {
        const platform = window.Capacitor.getPlatform();
        debugLog('Platform detected:', platform);
        checks.isAndroid = platform === 'android';
      } catch (error) {
        debugLog('Error getting platform:', error);
      }
    }

    checks.hasPlugins = !!window.Capacitor.Plugins;
    if (checks.hasPlugins) {
      debugLog('Capacitor.Plugins found');
      checks.availablePlugins = Object.keys(window.Capacitor.Plugins);
      debugLog('Available plugins:', checks.availablePlugins);
      checks.hasFilesystem = !!window.Capacitor.Plugins.Filesystem;
      if (checks.hasFilesystem) {
        debugLog('Filesystem plugin found');
      } else {
        debugLog('Filesystem plugin NOT found');
      }
    } else {
      debugLog('Capacitor.Plugins NOT found');
    }
  } else {
    debugLog('Capacitor object NOT found');
  }

  debugLog('Final availability check:', checks);
  return checks.hasCapacitor && checks.isAndroid && checks.hasPlugins && checks.hasFilesystem;
}

// Wait for Capacitor to be available
function waitForCapacitor(maxWait = 5000) {
  return new Promise((resolve) => {
    debugLog('Waiting for Capacitor...');
    
    if (checkCapacitorAvailability()) {
      debugLog('Capacitor is immediately available');
      resolve(true);
      return;
    }

    let elapsed = 0;
    const interval = 100;
    
    const checkInterval = setInterval(() => {
      elapsed += interval;
      
      if (checkCapacitorAvailability()) {
        clearInterval(checkInterval);
        debugLog(`Capacitor became available after ${elapsed}ms`);
        resolve(true);
      } else if (elapsed >= maxWait) {
        clearInterval(checkInterval);
        debugLog(`Capacitor not available after ${maxWait}ms`);
        resolve(false);
      }
    }, interval);
  });
}

// Simple Android Storage implementation
window.androidStorage = {
  isReady: false,
  directories: [],
  
  async initialize() {
    try {
      debugLog('Initializing Android Storage...');
      
      const capacitorAvailable = await waitForCapacitor();
      if (!capacitorAvailable) {
        debugLog('Capacitor not available - Android Storage disabled');
        return false;
      }

      const { Filesystem, Directory } = window.Capacitor.Plugins;
      debugLog('Got Filesystem and Directory from Capacitor.Plugins');

      // Request permissions
      try {
        const permResult = await Filesystem.requestPermissions();
        debugLog('Permission result:', permResult);
      } catch (permError) {
        debugLog('Permission error (continuing anyway):', permError);
      }

      // Test directories
      const testDirs = [
        { name: 'Documents', dir: Directory.Documents },
        { name: 'External Storage', dir: Directory.ExternalStorage },
        { name: 'App Data', dir: Directory.Data }
      ];

      for (const test of testDirs) {
        if (test.dir) {
          try {
            await Filesystem.readdir({ path: '', directory: test.dir });
            this.directories.push(test);
            debugLog(`✓ ${test.name} directory is accessible`);
          } catch (error) {
            debugLog(`✗ ${test.name} directory failed:`, error.message);
          }
        } else {
          debugLog(`${test.name} directory API not available`);
        }
      }

      if (this.directories.length === 0) {
        debugLog('No directories available');
        return false;
      }

      this.isReady = true;
      debugLog('Android Storage initialized successfully');
      return true;

    } catch (error) {
      debugLog('Initialization failed:', error);
      return false;
    }
  },

  isAvailable() {
    return this.isReady && this.directories.length > 0;
  },

  async saveFileWithDirectoryChoice(data, filename) {
    if (!this.isAvailable()) {
      return { success: false, message: 'Android storage not available' };
    }

    try {
      const { Filesystem } = window.Capacitor.Plugins;
      const bestDir = this.directories[0];
      
      await Filesystem.writeFile({
        path: filename,
        data: data,
        directory: bestDir.dir,
        encoding: 'utf8'
      });

      debugLog(`File saved to ${bestDir.name}`);
      return {
        success: true,
        location: bestDir.name,
        message: `File saved to ${bestDir.name}`
      };

    } catch (error) {
      debugLog('Save failed:', error);
      return { success: false, message: error.message };
    }
  },

  async listMapFiles() {
    if (!this.isAvailable()) {
      return [];
    }

    const { Filesystem } = window.Capacitor.Plugins;
    const allFiles = [];

    for (const dir of this.directories) {
      try {
        const result = await Filesystem.readdir({
          path: '',
          directory: dir.dir
        });

        const mapFiles = result.files
          .filter(file => file.name && (
            file.name.endsWith('.map') || 
            file.name.endsWith('.gz') ||
            file.name.endsWith('.fmg')
          ))
          .map(file => ({
            name: file.name,
            path: file.name,
            directory: dir.dir,
            directoryName: dir.name,
            fullPath: file.name,
            mtime: file.mtime || 0
          }));

        allFiles.push(...mapFiles);
        debugLog(`Found ${mapFiles.length} files in ${dir.name}`);

      } catch (error) {
        debugLog(`Error reading ${dir.name}:`, error.message);
      }
    }

    return allFiles.sort((a, b) => b.mtime - a.mtime);
  },

  async loadFile(filename, directory) {
    if (!this.isAvailable()) {
      return { success: false, message: 'Android storage not available' };
    }

    try {
      const { Filesystem } = window.Capacitor.Plugins;
      
      const result = await Filesystem.readFile({
        path: filename,
        directory: directory,
        encoding: 'utf8'
      });

      debugLog(`File loaded: ${filename}`);
      return { success: true, data: result.data };

    } catch (error) {
      debugLog(`Load failed for ${filename}:`, error);
      return { success: false, message: error.message };
    }
  }
};

// Auto-initialize
function initAndroidStorage() {
  debugLog('Starting auto-initialization...');
  
  if (window.androidStorage) {
    window.androidStorage.initialize().then(success => {
      if (success) {
        debugLog('Android Storage is ready');
      } else {
        debugLog('Android Storage failed to initialize');
      }
    }).catch(error => {
      debugLog('Android Storage initialization error:', error);
    });
  }
}

// Initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAndroidStorage);
} else {
  setTimeout(initAndroidStorage, 50);
}

debugLog('Android Storage module loaded');
