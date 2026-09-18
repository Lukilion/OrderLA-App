import { AuditHistoryEntry, UserRole } from '../types';
import { saveAuditEntryToCloud } from '../lib/firebase';

const STORAGE_KEY = 'wholesale_audit_history_v1';

const INITIAL_HISTORY: AuditHistoryEntry[] = [
  {
    id: 'hist-1',
    timestamp: Date.now() - 3600000 * 2,
    date: 'Today, 04:30 PM',
    userRole: 'superadmin',
    userName: 'Lukilion (Super Admin)',
    actionType: 'demand_change',
    descriptionEn: 'Updated demand of Colgate 150g to 25 units',
    descriptionUrdu: 'کولگیٹ 150 گرام کی ڈیمانڈ 25 یونٹس درج کی گئی',
    affectedItem: 'کولگیٹ ٹوتھ پیسٹ 150 گرام',
    oldValue: 0,
    newValue: 25
  },
  {
    id: 'hist-2',
    timestamp: Date.now() - 3600000 * 5,
    date: 'Today, 01:15 PM',
    userRole: 'admin',
    userName: 'Admin (عمیر احمد)',
    actionType: 'rate_change',
    descriptionEn: 'Adjusted wholesale rate of Sensodyne to Rs. 420',
    descriptionUrdu: 'سنسوڈائن کا ہول سیل ریٹ 420 روپے مقرر کیا گیا',
    affectedItem: 'سنسوڈائن ریپڈ ریلیف',
    oldValue: 400,
    newValue: 420
  },
  {
    id: 'hist-3',
    timestamp: Date.now() - 3600000 * 18,
    date: 'Yesterday, 08:20 PM',
    userRole: 'superadmin',
    userName: 'Lukilion (Super Admin)',
    actionType: 'whatsapp_share',
    descriptionEn: 'Dispatched Demand Summary via WhatsApp to Admin (+92 305 7851808)',
    descriptionUrdu: 'ڈیمانڈ سمری واٹس ایپ کے ذریعے ایڈمن کو بھیجی گئی',
    affectedItem: '18 Demanded Items',
    newValue: 'Rs. 245,300'
  },
  {
    id: 'hist-4',
    timestamp: Date.now() - 86400000 * 2,
    date: '14 Sep 2026',
    userRole: 'superadmin',
    userName: 'Lukilion (Super Admin)',
    actionType: 'order_saved',
    descriptionEn: 'Saved wholesale order ORD-2026-0914 (Shalmi Restock)',
    descriptionUrdu: 'شاہ عالمی ہول سیل آرڈر ORD-2026-0914 محفوظ کیا گیا',
    affectedItem: '8 Items (120 Units)'
  }
];

export function getAuditHistory(): AuditHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HISTORY));
      return INITIAL_HISTORY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_HISTORY;
  } catch (err) {
    console.error('Failed to parse audit history', err);
    return INITIAL_HISTORY;
  }
}

export function logAuditEvent(entry: {
  userRole: UserRole;
  userName: string;
  actionType: AuditHistoryEntry['actionType'];
  descriptionEn: string;
  descriptionUrdu: string;
  affectedItem?: string;
  oldValue?: string | number;
  newValue?: string | number;
}): void {
  const current = getAuditHistory();
  const newEntry: AuditHistoryEntry = {
    id: 'hist-' + Date.now().toString(36),
    timestamp: Date.now(),
    date: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }),
    userRole: entry.userRole,
    userName: entry.userName,
    actionType: entry.actionType,
    descriptionEn: entry.descriptionEn,
    descriptionUrdu: entry.descriptionUrdu,
    affectedItem: entry.affectedItem,
    oldValue: entry.oldValue,
    newValue: entry.newValue
  };

  const updated = [newEntry, ...current].slice(0, 100); // keep last 100 entries
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to write audit history', err);
  }

  // Cloud Firestore synchronization
  saveAuditEntryToCloud(newEntry).catch((err) => {
    console.warn('[Firebase] Audit cloud sync failed:', err);
  });
}

export function clearAuditHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear audit history', err);
  }
}

// Alias for seamless interoperability
export const addAuditHistoryEntry = logAuditEvent;
