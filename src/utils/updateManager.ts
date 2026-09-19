import { AppUpdateRelease, UpdateCheckResult, WholesaleItem, UserAccount } from '../types';
import { getCurrentUser } from './authManager';

export const APP_CLIENT_VERSION = '1.2.0';

/**
 * Platform Detection Helpers
 */
export function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } };
  return Boolean(win.Capacitor?.isNativePlatform && win.Capacitor.isNativePlatform());
}

export function isElectronApp(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  const win = window as unknown as { process?: { type?: string } };
  return userAgent.includes('electron') || win.process?.type === 'renderer';
}

export function getPlatformName(): 'android' | 'desktop' | 'web' {
  if (isCapacitorNative()) return 'android';
  if (isElectronApp()) return 'desktop';
  return 'web';
}

/**
 * Compare two semver strings (e.g. "1.2.0" vs "1.3.0")
 * Returns:
 *   1 if a > b
 *  -1 if a < b
 *   0 if a == b
 */
export function compareSemver(a: string, b: string): number {
  const cleanA = a.replace(/^v/i, '').trim();
  const cleanB = b.replace(/^v/i, '').trim();
  const partsA = cleanA.split('.').map((p) => parseInt(p, 10) || 0);
  const partsB = cleanB.split('.').map((p) => parseInt(p, 10) || 0);

  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}

/**
 * Evaluate if an update is required
 */
export function evaluateUpdateStatus(release: AppUpdateRelease | null): UpdateCheckResult {
  if (!release) {
    return {
      isUpdateAvailable: false,
      isMandatory: false,
      release: {
        version: APP_CLIENT_VERSION,
        minRequiredVersion: APP_CLIENT_VERSION,
        titleUrdu: '',
        titleEn: '',
        notesUrdu: '',
        notesEn: '',
        forceUpdate: false,
        publishedAt: ''
      }
    };
  }

  const isNewer = compareSemver(release.version, APP_CLIENT_VERSION) > 0;
  const isBelowMin = compareSemver(APP_CLIENT_VERSION, release.minRequiredVersion) < 0;
  const isMandatory = release.forceUpdate || isBelowMin;

  return {
    isUpdateAvailable: isNewer || isMandatory,
    isMandatory,
    release
  };
}

/**
 * DATA PRESERVATION SAFETY VAULT
 * Strictly preserves added items, active draft demands, stock status, and saved orders.
 */
export function createPreUpdateSafetySnapshot(): void {
  try {
    const activeUser = getCurrentUser();
    const userKey = activeUser ? `wholesale_demand_sheet_user_${activeUser.id}` : null;
    const itemsRaw = (userKey && localStorage.getItem(userKey)) || localStorage.getItem('wholesale_demand_sheet_items_v3');
    const savedOrdersRaw = localStorage.getItem('orderla_saved_orders');
    const usersRaw = localStorage.getItem('orderla_users');
    const currentUserRaw = localStorage.getItem('orderla_current_user');
    const langRaw = localStorage.getItem('orderla_app_language');
    const themeRaw = localStorage.getItem('orderla_theme');

    const vaultSnapshot = {
      timestamp: Date.now(),
      clientVersion: APP_CLIENT_VERSION,
      userKey,
      items: itemsRaw ? JSON.parse(itemsRaw) : null,
      savedOrders: savedOrdersRaw ? JSON.parse(savedOrdersRaw) : null,
      users: usersRaw ? JSON.parse(usersRaw) : null,
      currentUser: currentUserRaw ? JSON.parse(currentUserRaw) : null,
      language: langRaw,
      theme: themeRaw
    };

    localStorage.setItem('orderla_pre_update_safety_vault', JSON.stringify(vaultSnapshot));
    console.log('[OrderLa Safety Vault] Captured pre-update snapshot. User items and draft state safely secured.');
  } catch (err) {
    console.warn('[OrderLa Safety Vault] Error creating safety snapshot:', err);
  }
}

/**
 * Restores any data from the safety vault if local items or drafts were accidentally emptied
 */
export function restorePreUpdateSafetyVault(): boolean {
  try {
    const vaultRaw = localStorage.getItem('orderla_pre_update_safety_vault');
    if (!vaultRaw) return false;

    const vault = JSON.parse(vaultRaw);
    if (!vault || !vault.items) return false;

    // Check if current items in storage are missing
    const currentItemsRaw = localStorage.getItem('wholesale_demand_sheet_items_v3');
    if (!currentItemsRaw || currentItemsRaw === '[]') {
      localStorage.setItem('wholesale_demand_sheet_items_v3', JSON.stringify(vault.items));
      if (vault.userKey) {
        localStorage.setItem(vault.userKey, JSON.stringify(vault.items));
      }
      console.log('[OrderLa Safety Vault] Successfully restored items from safety vault.');
    }

    if (vault.savedOrders && !localStorage.getItem('orderla_saved_orders')) {
      localStorage.setItem('orderla_saved_orders', JSON.stringify(vault.savedOrders));
    }

    return true;
  } catch (err) {
    console.warn('[OrderLa Safety Vault] Error restoring vault:', err);
    return false;
  }
}

/**
 * Initialize native update listener on startup (notifies Capgo that app launched safely)
 */
export async function initAppUpdateServices(): Promise<void> {
  // Always verify safety vault integrity on launch
  restorePreUpdateSafetyVault();

  if (isCapacitorNative()) {
    try {
      const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
      await CapacitorUpdater.notifyAppReady();
      console.log('[Capacitor Updater] Native app notified ready.');
    } catch (err) {
      console.warn('[Capacitor Updater] Error notifying app ready:', err);
    }
  }
}

export type UpdateProgressCallback = (percent: number, statusText: string) => void;

/**
 * Pull and apply update from online OrderLa instance
 */
export async function pullAndApplyUpdate(
  release: AppUpdateRelease,
  onProgress: UpdateProgressCallback
): Promise<{ success: boolean; message: string; requiresNativeInstall?: boolean }> {
  // Step 1: Securely snapshot all data
  createPreUpdateSafetySnapshot();
  onProgress(15, 'ڈیٹا کا محفوظ بیک اپ لیا جا رہا ہے... (Securing local data...)');

  // Step 2: Handle Platform Specific Update Mechanism
  const platform = getPlatformName();

  if (platform === 'android') {
    // If an OTA zip bundle URL is provided, try Capgo live updater
    if (release.bundleZipUrl && release.bundleZipUrl.trim() !== '') {
      try {
        onProgress(30, 'آن لائن اپ ڈیٹ بنڈل ڈاؤن لوڈ ہو رہا ہے... (Downloading OTA bundle...)');
        const { CapacitorUpdater } = await import('@capgo/capacitor-updater');

        const bundle = await CapacitorUpdater.download({
          url: release.bundleZipUrl.trim(),
          version: release.version
        });

        onProgress(85, 'اپ ڈیٹ بنڈل انسٹال ہو رہا ہے... (Applying update bundle...)');
        await CapacitorUpdater.set({ id: bundle.id });

        onProgress(100, 'اپ ڈیٹ مکمل! ایپ ری لوڈ ہو رہی ہے... (Restarting app...)');
        setTimeout(async () => {
          await CapacitorUpdater.reload();
        }, 1000);

        return { success: true, message: 'OTA Update applied successfully!' };
      } catch (otaErr) {
        console.warn('[Capacitor Updater] OTA bundle download failed, falling back to APK install:', otaErr);
      }
    }

    // Fallback: If no bundle zip or native upgrade needed
    onProgress(70, 'نیا APK ڈاؤن لوڈ پیج کھل رہا ہے... (Opening APK download...)');
    const apkUrl = release.apkDownloadUrl || 'https://github.com/hassantareen001/orderla-app/releases';
    window.open(apkUrl, '_system');
    return {
      success: true,
      requiresNativeInstall: true,
      message: 'APK download opened in browser. Install over existing app to keep all data.'
    };
  }

  if (platform === 'desktop') {
    // For Electron EXE
    onProgress(60, 'ڈیسک ٹاپ اپ ڈیٹ فائل حاصل کی جا رہی ہے... (Fetching desktop update...)');
    const exeUrl = release.exeDownloadUrl || 'https://github.com/hassantareen001/orderla-app/releases';
    window.open(exeUrl, '_blank');
    return {
      success: true,
      requiresNativeInstall: true,
      message: 'Desktop installer opened. Run installer to upgrade.'
    };
  }

  // Web Browser / PWA Flow
  onProgress(50, 'کیشے اور سروس ورکرز کو ریفریش کیا جا رہا ہے... (Refreshing cache...)');
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.update();
      }
    } catch {
      /* ignore */
    }
  }

  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {
      /* ignore */
    }
  }

  onProgress(100, 'اپ ڈیٹ لاگو ہو رہی ہے... (Reloading...)');
  setTimeout(() => {
    window.location.reload();
  }, 1000);

  return { success: true, message: 'Web app reloaded with latest version.' };
}
