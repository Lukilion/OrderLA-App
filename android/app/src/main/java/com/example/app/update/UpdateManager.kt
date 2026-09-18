package com.example.app.update

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import androidx.core.content.FileProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL

object UpdateManager {

    private const val FILE_PROVIDER_SUFFIX = ".fileprovider"
    private const val APK_FILE_NAME = "update.apk"

    /**
     * Checks if the app has permission to install packages (Android 8.0+).
     */
    fun canInstallApks(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.packageManager.canRequestPackageInstalls()
        } else {
            true
        }
    }

    /**
     * Redirects the user to system settings to allow unknown source installations.
     */
    fun requestInstallPermission(activity: Activity, requestCode: Int = 1001) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                data = Uri.parse("package:${activity.packageName}")
            }
            activity.startActivityForResult(intent, requestCode)
        }
    }

    /**
     * Downloads the APK file to app-specific external storage and reports progress.
     */
    suspend fun downloadApk(
        context: Context,
        apkDownloadUrl: String,
        onProgress: (percent: Int) -> Unit
    ): Result<File> = withContext(Dispatchers.IO) {
        var connection: HttpURLConnection? = null
        try {
            val destinationDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                ?: return@withContext Result.failure(IllegalStateException("Storage unavailable"))

            val outputFile = File(destinationDir, APK_FILE_NAME)
            if (outputFile.exists()) {
                outputFile.delete()
            }

            val url = URL(apkDownloadUrl)
            connection = (url.openConnection() as HttpURLConnection).apply {
                connectTimeout = 15000
                readTimeout = 30000
                requestMethod = "GET"
                connect()
            }

            if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                return@withContext Result.failure(
                    Exception("Server returned HTTP ${connection.responseCode} ${connection.responseMessage}")
                )
            }

            val fileLength = connection.contentLength
            connection.inputStream.use { input ->
                FileOutputStream(outputFile).use { output ->
                    val buffer = ByteArray(8192)
                    var bytesRead: Int
                    var totalBytesRead = 0L

                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        output.write(buffer, 0, bytesRead)
                        totalBytesRead += bytesRead
                        if (fileLength > 0) {
                            val progress = ((totalBytesRead * 100) / fileLength).toInt()
                            withContext(Dispatchers.Main) {
                                onProgress(progress)
                            }
                        }
                    }
                    output.flush()
                }
            }

            Result.success(outputFile)
        } catch (e: Exception) {
            Result.failure(e)
        } finally {
            connection?.disconnect()
        }
    }

    /**
     * Fires the system package installer intent using FileProvider.
     */
    fun triggerInstall(context: Context, apkFile: File) {
        if (!apkFile.exists()) return

        val authority = "${context.packageName}$FILE_PROVIDER_SUFFIX"
        val contentUri: Uri = FileProvider.getUriForFile(context, authority, apkFile)

        val installIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(contentUri, "application/vnd.android.package-archive")
            flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK
        }

        try {
            context.startActivity(installIntent)
        } catch (e: ActivityNotFoundException) {
            e.printStackTrace()
        }
    }
}
