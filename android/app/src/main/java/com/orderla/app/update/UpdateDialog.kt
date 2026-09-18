package com.orderla.app.update

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import java.io.File

@Composable
fun UpdateDialog(
    state: UpdateDialogState,
    onStateChange: (UpdateDialogState) -> Unit,
    onDismissRequest: () -> Unit
) {
    if (state is UpdateDialogState.Hidden) return

    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    // Activity result launcher for "Allow from this source" permission
    val installPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) {
        if (state is UpdateDialogState.PermissionRequired) {
            if (UpdateManager.canInstallApks(context)) {
                UpdateManager.triggerInstall(context, state.apkFile)
                onStateChange(UpdateDialogState.ReadyToInstall(state.apkFile, state.isForceUpdate))
            }
        }
    }

    // Determine if the dialog can be dismissed by clicking outside
    val isDismissible = when (state) {
        is UpdateDialogState.Available -> !state.isForceUpdate
        is UpdateDialogState.Downloading -> false
        is UpdateDialogState.ReadyToInstall -> !state.isForceUpdate
        is UpdateDialogState.PermissionRequired -> !state.isForceUpdate
        is UpdateDialogState.Error -> !state.isForceUpdate
        UpdateDialogState.Hidden -> true
    }

    AlertDialog(
        onDismissRequest = {
            if (isDismissible) onDismissRequest()
        },
        title = {
            Text(
                text = when (state) {
                    is UpdateDialogState.Available -> "New Update Available (v${state.versionName})"
                    is UpdateDialogState.Downloading -> "Downloading Update..."
                    is UpdateDialogState.ReadyToInstall -> "Ready to Install"
                    is UpdateDialogState.PermissionRequired -> "Permission Required"
                    is UpdateDialogState.Error -> "Download Failed"
                    UpdateDialogState.Hidden -> ""
                },
                fontWeight = FontWeight.Bold
            )
        },
        icon = {
            when (state) {
                is UpdateDialogState.Error -> Icon(Icons.Default.Warning, contentDescription = "Error", tint = MaterialTheme.colorScheme.error)
                else -> Icon(Icons.Default.Info, contentDescription = "Update", tint = MaterialTheme.colorScheme.primary)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                when (state) {
                    is UpdateDialogState.Available -> {
                        Text(
                            text = "A new version of the app is available. Your personal profile and data will remain safe during this update.",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        if (state.releaseNotes.isNotBlank()) {
                            Text(
                                text = "What's New:",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = state.releaseNotes,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    is UpdateDialogState.Downloading -> {
                        Text(
                            text = "Please keep the app open while the update downloads.",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        LinearProgressIndicator(
                            progress = { state.progressPercent / 100f },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                        )
                        Text(
                            text = "${state.progressPercent}%",
                            style = MaterialTheme.typography.labelMedium,
                            modifier = Modifier.align(Alignment.End)
                        )
                    }

                    is UpdateDialogState.ReadyToInstall -> {
                        Text(
                            text = "The update file has finished downloading. Tap install to finish updating the app.",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }

                    is UpdateDialogState.PermissionRequired -> {
                        Text(
                            text = "Android requires your permission to install APK updates directly from this app. Please enable \"Allow from this source\" in the settings page.",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }

                    is UpdateDialogState.Error -> {
                        Text(
                            text = state.message,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.error
                        )
                    }

                    UpdateDialogState.Hidden -> Unit
                }
            }
        },
        confirmButton = {
            when (state) {
                is UpdateDialogState.Available -> {
                    Button(
                        onClick = {
                            onStateChange(UpdateDialogState.Downloading(0, state.isForceUpdate))
                            coroutineScope.launch {
                                val result = UpdateManager.downloadApk(context, state.apkUrl) { progress ->
                                    onStateChange(UpdateDialogState.Downloading(progress, state.isForceUpdate))
                                }
                                result.onSuccess { apkFile ->
                                    if (UpdateManager.canInstallApks(context)) {
                                        onStateChange(UpdateDialogState.ReadyToInstall(apkFile, state.isForceUpdate))
                                        UpdateManager.triggerInstall(context, apkFile)
                                    } else {
                                        onStateChange(UpdateDialogState.PermissionRequired(apkFile, state.isForceUpdate))
                                    }
                                }.onFailure { error ->
                                    onStateChange(
                                        UpdateDialogState.Error(
                                            message = error.localizedMessage ?: "Unknown network error",
                                            retryUrl = state.apkUrl,
                                            isForceUpdate = state.isForceUpdate
                                        )
                                    )
                                }
                            }
                        }
                    ) {
                        Text("Update Now")
                    }
                }

                is UpdateDialogState.ReadyToInstall -> {
                    Button(
                        onClick = {
                            if (UpdateManager.canInstallApks(context)) {
                                UpdateManager.triggerInstall(context, state.apkFile)
                            } else {
                                onStateChange(UpdateDialogState.PermissionRequired(state.apkFile, state.isForceUpdate))
                            }
                        }
                    ) {
                        Text("Install")
                    }
                }

                is UpdateDialogState.PermissionRequired -> {
                    Button(
                        onClick = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                                    this.data = Uri.parse("package:${context.packageName}")
                                }
                                installPermissionLauncher.launch(intent)
                            }
                        }
                    ) {
                        Text("Open Settings")
                    }
                }

                is UpdateDialogState.Error -> {
                    Button(
                        onClick = {
                            onStateChange(UpdateDialogState.Downloading(0, state.isForceUpdate))
                            coroutineScope.launch {
                                val result = UpdateManager.downloadApk(context, state.retryUrl) { progress ->
                                    onStateChange(UpdateDialogState.Downloading(progress, state.isForceUpdate))
                                }
                                result.onSuccess { apkFile ->
                                    if (UpdateManager.canInstallApks(context)) {
                                        onStateChange(UpdateDialogState.ReadyToInstall(apkFile, state.isForceUpdate))
                                        UpdateManager.triggerInstall(context, apkFile)
                                    } else {
                                        onStateChange(UpdateDialogState.PermissionRequired(apkFile, state.isForceUpdate))
                                    }
                                }.onFailure { error ->
                                    onStateChange(
                                        UpdateDialogState.Error(
                                            message = error.localizedMessage ?: "Retry failed",
                                            retryUrl = state.retryUrl,
                                            isForceUpdate = state.isForceUpdate
                                        )
                                    )
                                }
                            }
                        }
                    ) {
                        Text("Retry")
                    }
                }

                is UpdateDialogState.Downloading -> {
                    // Disable confirm button while downloading
                }

                UpdateDialogState.Hidden -> Unit
            }
        },
        dismissButton = {
            if (isDismissible) {
                TextButton(onClick = onDismissRequest) {
                    Text("Later")
                }
            }
        }
    )
}
