import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount, WholesaleItem, UserRole, UserApprovalStatus, SavedOrder, AuditHistoryEntry } from '../types';
import { DEFAULT_USERS } from '../data/defaultUsers';
import { DEFAULT_MASTER_ITEMS } from '../data/masterItems';

// Initialize Firebase App instance
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Initialize Firestore with designated databaseId
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection test as required by Firebase integration skill
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase Firestore] Cloud database connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase Firestore] Client is offline or database initializing.');
    }
    return false;
  }
}

// Automatically trigger test probe
testFirebaseConnection();

// ============================================================================
// 1. CLOUD USERS SYNCHRONIZATION (Real-time Multi-Device Sign-up & Approval)
// ============================================================================

/**
 * Subscribes to the real-time cloud users collection.
 * Triggers callback whenever any user registers or an admin approves a user.
 */
export function subscribeToCloudUsers(
  onUsersUpdate: (users: UserAccount[]) => void
): Unsubscribe {
  const usersCollectionRef = collection(db, 'users');

  return onSnapshot(
    usersCollectionRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Seed default users if cloud collection is pristine
        seedInitialDefaultUsers();
        return;
      }

      const cloudUsers: UserAccount[] = [];
      snapshot.forEach((docSnap) => {
        cloudUsers.push(docSnap.data() as UserAccount);
      });

      // Ensure Lukilion always exists
      const hasLukilion = cloudUsers.some(
        (u) => u.username?.toLowerCase() === 'lukilion'
      );
      if (!hasLukilion) {
        cloudUsers.unshift(DEFAULT_USERS[0]);
      }

      // Ensure Ali always exists
      const hasAli = cloudUsers.some(
        (u) => u.username?.toLowerCase() === 'ali_007'
      );
      if (!hasAli) {
        const aliUser = DEFAULT_USERS.find((u) => u.username?.toLowerCase() === 'ali_007');
        if (aliUser) {
          cloudUsers.push(aliUser);
          saveUserToCloud(aliUser);
        }
      }

      onUsersUpdate(cloudUsers);
    },
    (err) => {
      console.warn('[Firebase Firestore] Users subscription fallback to cache:', err);
    }
  );
}

/**
 * Seed initial administrative & default accounts into Cloud Firestore
 */
export async function seedInitialDefaultUsers(): Promise<void> {
  try {
    for (const user of DEFAULT_USERS) {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
    }
    console.log('[Firebase Firestore] Default accounts seeded successfully.');
  } catch (err) {
    console.warn('[Firebase Firestore] Failed to seed default users:', err);
  }
}

/**
 * Write or update a user account directly in Cloud Firestore
 */
export async function saveUserToCloud(user: UserAccount): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Error saving user to cloud:', err);
    return false;
  }
}

/**
 * Super Admin approve or update user status or details in Cloud Firestore
 */
export async function updateUserStatusInCloud(
  userId: string,
  updates: Partial<UserAccount>
): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, updates, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Error updating user in cloud:', err);
    return false;
  }
}

// ============================================================================
// 2. CLOUD CATALOG SYNCHRONIZATION (Real-time Master Items & Rates)
// ============================================================================

/**
 * Subscribes to real-time catalog items
 * Smart merge preserves custom added items, does NOT overwrite with hardcoded master items
 */
export function subscribeToCloudCatalog(
  onCatalogUpdate: (items: WholesaleItem[]) => void
): Unsubscribe {
  const catalogColRef = collection(db, 'catalog');

  return onSnapshot(
    catalogColRef,
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialCatalog();
        return;
      }

      const cloudItems: WholesaleItem[] = [];
      snapshot.forEach((docSnap) => {
        cloudItems.push(docSnap.data() as WholesaleItem);
      });

      // Check if any default master items are missing from cloud, and seamlessly add only missing ones
      const cloudIds = new Set<number>(cloudItems.map((it) => it.id));
      const missingDefaults = DEFAULT_MASTER_ITEMS.filter((def) => !cloudIds.has(def.id));

      if (missingDefaults.length > 0) {
        // Upload only missing defaults without clobbering any existing or custom items
        Promise.all(
          missingDefaults.map((defItem) =>
            setDoc(doc(db, 'catalog', String(defItem.id)), defItem, { merge: true })
          )
        ).catch((err) => console.warn('[Firebase Firestore] Error syncing missing defaults:', err));

        const combined = [...cloudItems, ...missingDefaults];
        combined.sort((a, b) => a.id - b.id);
        onCatalogUpdate(combined);
        return;
      }

      cloudItems.sort((a, b) => a.id - b.id);
      onCatalogUpdate(cloudItems);
    },
    (err) => {
      console.warn('[Firebase Firestore] Catalog subscription fallback to cache:', err);
    }
  );
}

/**
 * Seed master items list to Cloud Firestore (non-destructive merge)
 */
export async function seedInitialCatalog(): Promise<void> {
  try {
    for (const item of DEFAULT_MASTER_ITEMS) {
      await setDoc(doc(db, 'catalog', String(item.id)), item, { merge: true });
    }
    console.log(`[Firebase Firestore] Master catalog seeded to cloud (${DEFAULT_MASTER_ITEMS.length} items).`);
  } catch (err) {
    console.warn('[Firebase Firestore] Failed to seed catalog:', err);
  }
}

/**
 * Save single updated item or newly added item to Cloud Firestore
 */
export async function saveCatalogItemToCloud(item: WholesaleItem): Promise<boolean> {
  try {
    const itemRef = doc(db, 'catalog', String(item.id));
    await setDoc(itemRef, item, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Error saving catalog item to cloud:', err);
    return false;
  }
}

/**
 * Delete a catalog item from Cloud Firestore
 */
export async function deleteCatalogItemFromCloud(itemId: number): Promise<boolean> {
  try {
    const itemRef = doc(db, 'catalog', String(itemId));
    await deleteDoc(itemRef);
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Error deleting catalog item from cloud:', err);
    return false;
  }
}

/**
 * Directly queries and fetches the full catalog from Cloud Firestore
 */
export async function fetchCloudCatalog(): Promise<WholesaleItem[]> {
  try {
    const catalogColRef = collection(db, 'catalog');
    const snapshot = await getDocs(catalogColRef);
    if (snapshot.empty) {
      await seedInitialCatalog();
      return DEFAULT_MASTER_ITEMS;
    }

    const cloudItems: WholesaleItem[] = [];
    snapshot.forEach((docSnap) => {
      cloudItems.push(docSnap.data() as WholesaleItem);
    });

    // Check for any missing defaults and merge without overwriting custom items
    const cloudIds = new Set<number>(cloudItems.map((it) => it.id));
    const missingDefaults = DEFAULT_MASTER_ITEMS.filter((def) => !cloudIds.has(def.id));

    if (missingDefaults.length > 0) {
      Promise.all(
        missingDefaults.map((defItem) =>
          setDoc(doc(db, 'catalog', String(defItem.id)), defItem, { merge: true })
        )
      ).catch((err) => console.warn('[Firebase Firestore] Background default sync error:', err));

      const combined = [...cloudItems, ...missingDefaults];
      combined.sort((a, b) => a.id - b.id);
      return combined;
    }

    cloudItems.sort((a, b) => a.id - b.id);
    return cloudItems;
  } catch (err) {
    console.error('[Firebase Firestore] Error fetching catalog from cloud:', err);
    throw err;
  }
}

// ============================================================================
// 3. SAVED ORDERS CLOUD SYNCHRONIZATION
// ============================================================================

/**
 * Subscribes to real-time changes in Saved Orders collection
 */
export function subscribeToCloudSavedOrders(
  onOrdersUpdate: (orders: SavedOrder[]) => void
): Unsubscribe {
  const ordersColRef = collection(db, 'saved_orders');

  return onSnapshot(
    ordersColRef,
    (snapshot) => {
      const orders: SavedOrder[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(docSnap.data() as SavedOrder);
      });
      orders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onOrdersUpdate(orders);
    },
    (err) => {
      console.warn('[Firebase Firestore] Orders subscription fallback:', err);
    }
  );
}

/**
 * Save an order to Cloud Firestore
 */
export async function saveOrderToCloud(order: SavedOrder): Promise<boolean> {
  try {
    const orderRef = doc(db, 'saved_orders', order.id);
    await setDoc(orderRef, order, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Error saving order to cloud:', err);
    return false;
  }
}

/**
 * Delete an order from Cloud Firestore
 */
export async function deleteOrderFromCloud(orderId: string): Promise<boolean> {
  try {
    const orderRef = doc(db, 'saved_orders', orderId);
    await deleteDoc(orderRef);
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Error deleting order from cloud:', err);
    return false;
  }
}

/**
 * Fetch all saved orders from Cloud Firestore
 */
export async function fetchCloudSavedOrders(): Promise<SavedOrder[]> {
  try {
    const ordersColRef = collection(db, 'saved_orders');
    const snapshot = await getDocs(ordersColRef);
    const orders: SavedOrder[] = [];
    snapshot.forEach((docSnap) => {
      orders.push(docSnap.data() as SavedOrder);
    });
    orders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return orders;
  } catch (err) {
    console.error('[Firebase Firestore] Error fetching saved orders from cloud:', err);
    return [];
  }
}

// ============================================================================
// 4. ENTERPRISE AUDIT HISTORY CLOUD SYNCHRONIZATION
// ============================================================================

/**
 * Subscribes to real-time changes in Audit History collection
 */
export function subscribeToCloudAuditHistory(
  onHistoryUpdate: (entries: AuditHistoryEntry[]) => void
): Unsubscribe {
  const auditColRef = collection(db, 'audit_history');

  return onSnapshot(
    auditColRef,
    (snapshot) => {
      const entries: AuditHistoryEntry[] = [];
      snapshot.forEach((docSnap) => {
        entries.push(docSnap.data() as AuditHistoryEntry);
      });
      entries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onHistoryUpdate(entries);
    },
    (err) => {
      console.warn('[Firebase Firestore] Audit subscription fallback:', err);
    }
  );
}

/**
 * Save an audit event to Cloud Firestore
 */
export async function saveAuditEntryToCloud(entry: AuditHistoryEntry): Promise<boolean> {
  try {
    const auditRef = doc(db, 'audit_history', entry.id);
    await setDoc(auditRef, entry, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Error logging audit event to cloud:', err);
    return false;
  }
}

/**
 * Fetch all audit history from Cloud Firestore
 */
export async function fetchCloudAuditHistory(): Promise<AuditHistoryEntry[]> {
  try {
    const auditColRef = collection(db, 'audit_history');
    const snapshot = await getDocs(auditColRef);
    const entries: AuditHistoryEntry[] = [];
    snapshot.forEach((docSnap) => {
      entries.push(docSnap.data() as AuditHistoryEntry);
    });
    entries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return entries;
  } catch (err) {
    console.error('[Firebase Firestore] Error fetching audit history from cloud:', err);
    return [];
  }
}

