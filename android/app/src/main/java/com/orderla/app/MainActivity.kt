package com.orderla.app

import android.content.Intent
import androidx.lifecycle.lifecycleScope
import com.getcapacitor.BridgeActivity
import com.orderla.app.update.UpdateManager
import kotlinx.coroutines.launch
import java.io.File

class MainActivity : BridgeActivity() {

    private var downloadedApk: File? = null

    fun startUpdateProcess(apkUrl: String) {
        lifecycleScope.launch {
            // Step 1: Download the update
            val result = UpdateManager.downloadApk(this@MainActivity, apkUrl) { percent ->
                // Update your ProgressBar or notification UI here
                println("Download progress: $percent%")
            }

            result.onSuccess { file ->
                downloadedApk = file
                attemptInstallation(file)
            }.onFailure { error ->
                println("Download failed: ${error.localizedMessage}")
            }
        }
    }

    fun attemptInstallation(file: File) {
        // Step 2: Verify install permission before starting the package manager
        if (UpdateManager.canInstallApks(this)) {
            UpdateManager.triggerInstall(this, file)
        } else {
            UpdateManager.requestInstallPermission(this, requestCode = 2001)
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        // Step 3: Resume installation after the user enables "Allow from this source"
        if (requestCode == 2001) {
            if (UpdateManager.canInstallApks(this)) {
                downloadedApk?.let { UpdateManager.triggerInstall(this, it) }
            }
        }
    }
}
