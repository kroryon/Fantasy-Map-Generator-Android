// Android Permissions Handler
class AndroidPermissionsHandler {
    constructor() {
        this.permissionsPlugin = null;
        this.initializePlugin();
    }

    async initializePlugin() {
        if (window.Capacitor && window.Capacitor.Plugins) {
            try {
                this.permissionsPlugin = window.Capacitor.Plugins.PermissionsPlugin;
                console.log('[Permissions] Plugin initialized successfully');
            } catch (error) {
                console.error('[Permissions] Failed to initialize plugin:', error);
            }
        }
    }

    async isAndroid() {
        return window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android';
    }

    async checkAllPermissions() {
        if (!await this.isAndroid() || !this.permissionsPlugin) {
            return { hasAllPermissions: true, permissions: {} };
        }

        try {
            const result = await this.permissionsPlugin.checkPermissions();
            console.log('[Permissions] Current permissions:', result);
            
            // Check if we have the necessary permissions based on Android version
            let hasAllPermissions = false;
            
            if (result.readMediaImages !== undefined) {
                // Android 13+ permissions
                hasAllPermissions = result.readMediaImages && result.readMediaVideo && result.readMediaAudio;
            } else {
                // Legacy permissions
                hasAllPermissions = result.readExternalStorage;
            }

            return {
                hasAllPermissions,
                permissions: result,
                needsManageExternalStorage: result.manageExternalStorage === false
            };
        } catch (error) {
            console.error('[Permissions] Error checking permissions:', error);
            return { hasAllPermissions: false, permissions: {}, error: error.message };
        }
    }

    async requestBasicPermissions() {
        if (!await this.isAndroid() || !this.permissionsPlugin) {
            return { granted: true };
        }

        try {
            console.log('[Permissions] Requesting basic storage permissions...');
            const result = await this.permissionsPlugin.requestPermissions();
            console.log('[Permissions] Basic permissions result:', result);
            return result;
        } catch (error) {
            console.error('[Permissions] Error requesting basic permissions:', error);
            return { granted: false, error: error.message };
        }
    }

    async requestManageExternalStorage() {
        if (!await this.isAndroid() || !this.permissionsPlugin) {
            return { granted: true };
        }

        try {
            console.log('[Permissions] Requesting MANAGE_EXTERNAL_STORAGE permission...');
            const result = await this.permissionsPlugin.requestManageExternalStorage();
            console.log('[Permissions] Manage external storage result:', result);
            return result;
        } catch (error) {
            console.error('[Permissions] Error requesting manage external storage:', error);
            return { granted: false, error: error.message };
        }
    }

    async requestAllPermissions() {
        if (!await this.isAndroid()) {
            return { success: true, message: 'Not on Android, no permissions needed' };
        }

        try {
            // Step 1: Request basic permissions first
            const basicResult = await this.requestBasicPermissions();
            if (!basicResult.granted) {
                return { 
                    success: false, 
                    message: 'Basic storage permissions were denied. The app needs these permissions to save and load files.',
                    step: 'basic'
                };
            }

            // Step 2: Check if we need MANAGE_EXTERNAL_STORAGE
            const permissionCheck = await this.checkAllPermissions();
            if (permissionCheck.needsManageExternalStorage) {
                console.log('[Permissions] Requesting MANAGE_EXTERNAL_STORAGE...');
                
                // Show user explanation before redirecting
                if (window.tip) {
                    window.tip('You will be redirected to Android settings to grant full file access. This is required for saving and loading map files.', false, 'info', 5000);
                }

                const manageResult = await this.requestManageExternalStorage();
                if (!manageResult.granted) {
                    return {
                        success: false,
                        message: 'Full file access permission is required for optimal functionality. You can enable it later in Android Settings > Apps > Fantasy Map Generator > Permissions.',
                        step: 'manage'
                    };
                }
            }

            return { 
                success: true, 
                message: 'All permissions granted successfully!' 
            };

        } catch (error) {
            console.error('[Permissions] Error in requestAllPermissions:', error);
            return { 
                success: false, 
                message: `Error requesting permissions: ${error.message}`,
                error 
            };
        }
    }

    async ensurePermissions() {
        const result = await this.requestAllPermissions();
        
        if (result.success) {
            if (window.tip) {
                window.tip(result.message, false, 'success', 3000);
            }
            return true;
        } else {
            if (window.tip) {
                window.tip(result.message, false, 'warning', 8000);
            }
            console.warn('[Permissions]', result.message);
            return false;
        }
    }
}

// Global instance
window.androidPermissions = new AndroidPermissionsHandler();

// Auto-request permissions when the app loads
document.addEventListener('DOMContentLoaded', async function() {
    if (window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android') {
        console.log('[Permissions] Android device detected, checking permissions...');
        
        // Wait a bit for Capacitor to fully initialize
        setTimeout(async () => {
            try {
                await window.androidPermissions.ensurePermissions();
            } catch (error) {
                console.error('[Permissions] Error during auto-permission check:', error);
            }
        }, 1000);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AndroidPermissionsHandler;
}
