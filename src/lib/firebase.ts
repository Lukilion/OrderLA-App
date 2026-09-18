import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount, WholesaleItem, UserRole, UserApprovalStatus } from '../types';
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

      // If cloud catalog has fewer items than master list (e.g. 64 instead of 95), merge with master items & seed missing
      if (cloudItems.length < DEFAULT_MASTER_ITEMS.length) {
        const cloudMap = new Map<number, WholesaleItem>();
        cloudItems.forEach((it) => cloudMap.set(it.id, it));

        const mergedCatalog = DEFAULT_MASTER_ITEMS.map((def) => {
          const cloud = cloudMap.get(def.id);
          return cloud ? { ...def, ...cloud } : { ...def };
        });

        // Seed missing items in the background
        seedInitialCatalog();
        mergedCatalog.sort((a, b) => a.id - b.id);
        onCatalogUpdate(mergedCatalog);
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
 * Seed master items list (full 95 items) to Cloud Firestore
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
 * Save single updated item or rate to Cloud Firestore
 */
export async function saveCatalogItemToCloud(item: WholesaleItem): Promise<boolean> {
  try {
    const itemRef = doc(db, 'catalog', String(item.id));
    await setDoc(itemRef, item, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Error saving catalog item:', err);
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

    // If cloud catalog has fewer items than master list (e.g. 64 instead of 95), sync all 95
    if (cloudItems.length < DEFAULT_MASTER_ITEMS.length) {
      const cloudMap = new Map<number, WholesaleItem>();
      cloudItems.forEach((it) => cloudMap.set(it.id, it));

      const mergedCatalog = DEFAULT_MASTER_ITEMS.map((def) => {
        const cloud = cloudMap.get(def.id);
        return cloud ? { ...def, ...cloud } : { ...def };
      });

      seedInitialCatalog().catch((e) => console.warn('[Firebase] Seed background error:', e));
      mergedCatalog.sort((a, b) => a.id - b.id);
      return mergedCatalog;
    }

    cloudItems.sort((a, b) => a.id - b.id);
    return cloudItems;
  } catch (err) {
    console.error('[Firebase Firestore] Error fetching catalog from cloud:', err);
    throw err;
  }
}
