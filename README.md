# OrderLA - Wholesale Business OS (BOS)

A high-performance Wholesale Demand Sheet, Inventory & Rate Management Business Operating System featuring a tactile dual-tier Neumorphic UI, bilingual support (Urdu & English), and multi-role access control (Super Admin, Admin, Buyer, Auditor).

---

## 🚀 Quick Start in VS Code via GitHub Desktop

1. **Open GitHub Desktop**:
   - Click **File** > **Clone Repository...** or **Add Existing Repository...**.
   - Select this repository or folder.
2. **Open in VS Code**:
   - In GitHub Desktop, click the **"Open in Visual Studio Code"** button (or press `Ctrl+Shift+A` / `Cmd+Shift+A`).
   - Alternatively, open terminal in the project directory and type:
     ```bash
     code .
     ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Launch Development Web Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📱 1. Creating the Android App

This repository includes a pre-configured **Capacitor** Android project inside the `/android` directory.

### Step-by-Step Android Build:
1. Build the production web bundle:
   ```bash
   npm run build
   ```
2. Sync assets with the native Android project:
   ```bash
   npm run cap:sync
   ```
3. Open in **Android Studio**:
   ```bash
   npm run cap:open
   ```
4. In Android Studio:
   - Wait for Gradle to finish indexing.
   - Connect your Android device or start an emulator.
   - Click **Run** (Green Play button) to test directly on your phone!
   - To export an installable `.apk` or production `.aab`:
     - Click **Build** > **Generate Signed Bundle / APK...**
     - Select **APK**, choose your keystore, and click **Finish**.

---

## 💻 2. Creating the Desktop App

You have two easy ways to run OrderLA on Desktop (Windows, macOS, Linux):

### Option A: Direct PWA Desktop App (Zero-Config, Instant)
1. Open the web app in Google Chrome, Microsoft Edge, or Brave.
2. Click the **Install icon** in the address bar (or in the top utility ribbon of the app).
3. The app will install directly onto your desktop with its own window, taskbar icon, and offline support!

### Option B: Native Electron Desktop App
1. Make sure production web files are built:
   ```bash
   npm run build
   ```
2. Test or package the desktop app:
   ```bash
   npx electron electron/main.cjs
   ```
3. To package into a standalone Windows `.exe`, Mac `.dmg`, or Linux `.AppImage`, use `electron-builder` or `electron-forge`:
   ```bash
   npx electron-builder
   ```

---

## 🌐 3. Web App Deployment

To deploy on any modern hosting provider (Vercel, Netlify, Firebase, Cloud Run, GitHub Pages):
```bash
npm run build
```
Upload or link the resulting `dist/` directory.

---

## 🔄 How to Update Afterwards

### Updating Catalog & Wholesale Rates Without Recompilation:
1. Log in as **Admin** or **Super Admin (Lukilion)**.
2. Open **"بیک اپ اور اپ ڈیٹ (Backup & Update)"** from the top bar or Edit menu.
3. Click **"بیک اپ فائل ڈاؤن لوڈ کریں (Download Backup JSON)"** to save your current items and configuration.
4. When you have updated rates or new items, simply drag and drop the updated JSON into the **"Import / Update"** area and choose:
   - **Merge & Update**: Updates existing items with new rates and appends new products.
   - **Full Restore**: Overwrites the local database with the updated file.

### Updating the Software Code via GitHub Desktop:
1. In **VS Code**, make your code changes.
2. In **GitHub Desktop**:
   - Write a summary message (e.g., `Update wholesale layout`).
   - Click **Commit to main**.
   - Click **Push origin**.
3. For Android:
   ```bash
   npm run build && npm run cap:sync
   ```
   Then re-generate the APK in Android Studio.

---

## 👑 Role-Based Access Control

- **Super Admin (`Lukilion` / `superadmin`)**:
  - Full system authority.
  - Access to Super Admin Console (Crown icon).
  - Can add and manage Admins, Auditors, and Buyers.
  - Granular control over Excel, PDF, and WhatsApp permissions.
- **Admin (`admin`)**:
  - Authority to add new Buyers and Auditors (`+ صارف شامل کریں` / `+ Add User`).
  - Full editing and rate management authority.
- **Buyer & Auditor**:
  - The "Add New User" authority is hidden.
  - Restricted to designated demand entry, stock auditing, and permitted exports.
