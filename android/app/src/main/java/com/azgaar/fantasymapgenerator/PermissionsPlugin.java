package com.azgaar.fantasymapgenerator;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "PermissionsPlugin",
    permissions = {
        @Permission(strings = {Manifest.permission.READ_EXTERNAL_STORAGE}, alias = "storage"),
        @Permission(strings = {Manifest.permission.WRITE_EXTERNAL_STORAGE}, alias = "storage"),
        @Permission(strings = {Manifest.permission.READ_MEDIA_IMAGES}, alias = "media"),
        @Permission(strings = {Manifest.permission.READ_MEDIA_VIDEO}, alias = "media"),
        @Permission(strings = {Manifest.permission.READ_MEDIA_AUDIO}, alias = "media")
    }
)
public class PermissionsPlugin extends Plugin {
    
    private static final int MANAGE_EXTERNAL_STORAGE_REQUEST_CODE = 102;

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject result = new JSObject();
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // Android 13+ permissions
            result.put("readMediaImages", checkPermission(Manifest.permission.READ_MEDIA_IMAGES));
            result.put("readMediaVideo", checkPermission(Manifest.permission.READ_MEDIA_VIDEO));
            result.put("readMediaAudio", checkPermission(Manifest.permission.READ_MEDIA_AUDIO));
        } else {
            // Legacy permissions
            result.put("readExternalStorage", checkPermission(Manifest.permission.READ_EXTERNAL_STORAGE));
            if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.Q) {
                result.put("writeExternalStorage", checkPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE));
            }
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            result.put("manageExternalStorage", Environment.isExternalStorageManager());
        }
        
        call.resolve(result);
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // Request Android 13+ permissions
            String[] permissions = {
                Manifest.permission.READ_MEDIA_IMAGES,
                Manifest.permission.READ_MEDIA_VIDEO,
                Manifest.permission.READ_MEDIA_AUDIO
            };
            requestPermissionForAliases(permissions, call, "mediaPermissionsCallback");
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Request legacy permissions
            String[] permissions = {Manifest.permission.READ_EXTERNAL_STORAGE};
            if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.Q) {
                permissions = new String[]{
                    Manifest.permission.READ_EXTERNAL_STORAGE,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE
                };
            }
            requestPermissionForAliases(permissions, call, "storagePermissionsCallback");
        } else {
            // Pre-Android 6.0 - permissions are granted at install time
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
        }
    }

    @PluginMethod
    public void requestManageExternalStorage(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            if (Environment.isExternalStorageManager()) {
                JSObject result = new JSObject();
                result.put("granted", true);
                call.resolve(result);
                return;
            }
            
            try {
                Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                startActivityForResult(call, intent, "manageExternalStorageCallback");
            } catch (Exception e) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
                startActivityForResult(call, intent, "manageExternalStorageCallback");
            }
        } else {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
        }
    }    @PermissionCallback
    private void storagePermissionsCallback(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", checkPermission(Manifest.permission.READ_EXTERNAL_STORAGE));
        call.resolve(result);
    }

    @PermissionCallback
    private void mediaPermissionsCallback(PluginCall call) {
        JSObject result = new JSObject();
        boolean allGranted = checkPermission(Manifest.permission.READ_MEDIA_IMAGES) &&
                           checkPermission(Manifest.permission.READ_MEDIA_VIDEO) &&
                           checkPermission(Manifest.permission.READ_MEDIA_AUDIO);
        result.put("granted", allGranted);
        call.resolve(result);
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        
        PluginCall savedCall = getSavedCall();
        if (savedCall == null) {
            return;
        }
        
        if (requestCode == MANAGE_EXTERNAL_STORAGE_REQUEST_CODE) {
            JSObject result = new JSObject();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                result.put("granted", Environment.isExternalStorageManager());
            } else {
                result.put("granted", true);
            }
            savedCall.resolve(result);
        }
    }    public boolean checkPermission(String permission) {
        return ContextCompat.checkSelfPermission(getContext(), permission) == PackageManager.PERMISSION_GRANTED;
    }
}
