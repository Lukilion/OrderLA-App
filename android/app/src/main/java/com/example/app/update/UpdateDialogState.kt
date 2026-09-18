package com.example.app.update

import java.io.File

sealed interface UpdateDialogState {
    data object Hidden : UpdateDialogState

    data class Available(
        val versionName: String,
        val releaseNotes: String,
        val apkUrl: String,
        val isForceUpdate: Boolean = false
    ) : UpdateDialogState

    data class Downloading(
        val progressPercent: Int,
        val isForceUpdate: Boolean = false
    ) : UpdateDialogState

    data class ReadyToInstall(
        val apkFile: File,
        val isForceUpdate: Boolean = false
    ) : UpdateDialogState

    data class PermissionRequired(
        val apkFile: File,
        val isForceUpdate: Boolean = false
    ) : UpdateDialogState

    data class Error(
        val message: String,
        val retryUrl: String,
        val isForceUpdate: Boolean = false
    ) : UpdateDialogState
}
