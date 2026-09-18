package com.orderla.app.update

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

@Composable
fun MainScreen() {
    var updateState by remember {
        mutableStateOf<UpdateDialogState>(
            // Example initial check: populate this when your version API returns a newer build
            UpdateDialogState.Available(
                versionName = "1.2.0",
                releaseNotes = "• Enhanced profile sync\n• Performance optimizations\n• Bug fixes",
                apkUrl = "https://your-server.com/releases/app-release-v1.2.0.apk",
                isForceUpdate = false
            )
        )
    }

    Scaffold { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            Button(onClick = {
                // Trigger check manually or re-open dialog
                updateState = UpdateDialogState.Available(
                    versionName = "1.2.0",
                    releaseNotes = "• Fast sync engine\n• UI upgrades",
                    apkUrl = "https://your-server.com/releases/app-release-v1.2.0.apk"
                )
            }) {
                Text("Check for Updates")
            }

            // Dialog overlay
            UpdateDialog(
                state = updateState,
                onStateChange = { newState -> updateState = newState },
                onDismissRequest = { updateState = UpdateDialogState.Hidden }
            )
        }
    }
}
