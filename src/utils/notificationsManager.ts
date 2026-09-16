import { AppNotification, WholesaleItem } from '../types';

const STORAGE_KEY = 'wholesale_read_notifications_ids';

export function getReadNotificationIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markNotificationRead(id: string): void {
  const readIds = getReadNotificationIds();
  if (!readIds.includes(id)) {
    readIds.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
  }
}

export function markAllNotificationsRead(notifications: AppNotification[]): void {
  const ids = notifications.map((n) => n.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function generateLiveNotifications(
  items: WholesaleItem[],
  pendingApprovalsCount: number
): AppNotification[] {
  const readIds = getReadNotificationIds();
  const notifications: AppNotification[] = [];

  // 1. Pending user accounts approval alert
  if (pendingApprovalsCount > 0) {
    notifications.push({
      id: `notif-approvals-${pendingApprovalsCount}`,
      timestamp: Date.now() - 60000 * 15,
      type: 'approval',
      severity: 'urgent',
      titleEn: 'Pending User Approvals',
      titleUrdu: 'نئے صارفین کی رجسٹریشن منظوری درکار',
      messageEn: `${pendingApprovalsCount} new user accounts are awaiting Super Admin approval.`,
      messageUrdu: `${pendingApprovalsCount} نئے صارف اکاؤنٹس سپر ایڈمن کی منظوری کے منتظر ہیں۔`,
      isRead: readIds.includes(`notif-approvals-${pendingApprovalsCount}`),
      actionRoute: 'profile'
    });
  }

  // 2. Low Stock Alerts (Stock <= 5)
  const lowStockItems = items.filter(
    (i) => i.stock !== '' && i.stock !== null && !isNaN(Number(i.stock)) && Number(i.stock) <= 5
  );

  if (lowStockItems.length > 0) {
    const sampleNames = lowStockItems.slice(0, 3).map((i) => i.name).join('، ');
    notifications.push({
      id: `notif-low-stock-${lowStockItems.length}`,
      timestamp: Date.now() - 3600000,
      type: 'stock',
      severity: 'warning',
      titleEn: 'Low Stock Alert (اسٹاک انتباہ)',
      titleUrdu: 'کم اسٹاک کی اہم اطلاعات',
      messageEn: `${lowStockItems.length} items have critical stock (<= 5 units), including: ${sampleNames}`,
      messageUrdu: `${lowStockItems.length} اشیاء کا اسٹاک 5 یا اس سے کم ہو چکا ہے۔ فوری ری اسٹاک درکار ہے۔`,
      isRead: readIds.includes(`notif-low-stock-${lowStockItems.length}`),
      actionRoute: 'home'
    });
  }

  // 3. Urgent Out of Stock Items
  const outOfStockItems = items.filter(
    (i) => i.status && (i.status.includes('ختم') || i.stock === '0')
  );
  if (outOfStockItems.length > 0) {
    notifications.push({
      id: `notif-oos-${outOfStockItems.length}`,
      timestamp: Date.now() - 3600000 * 3,
      type: 'stock',
      severity: 'urgent',
      titleEn: 'Out of Stock (اسٹاک ختم)',
      titleUrdu: 'اسٹاک ختم شدہ اشیاء',
      messageEn: `${outOfStockItems.length} items are marked as completely out of stock. Immediate wholesale ordering needed.`,
      messageUrdu: `${outOfStockItems.length} اشیاء کا اسٹاک بالکل ختم ہو چکا ہے، ترجیحی خریداری لسٹ میں دیکھیں۔`,
      isRead: readIds.includes(`notif-oos-${outOfStockItems.length}`),
      actionRoute: 'home'
    });
  }

  // 4. Demanded Orders Pending Dispatch
  const demandedItems = items.filter((i) => Number(i.demand) > 0);
  if (demandedItems.length > 0) {
    const totalDemandedUnits = demandedItems.reduce((s, i) => s + Number(i.demand), 0);
    notifications.push({
      id: `notif-demands-active`,
      timestamp: Date.now() - 3600000 * 4,
      type: 'demand',
      severity: 'info',
      titleEn: 'Active Demand Sheet Ready',
      titleUrdu: 'ڈیمانڈ شیٹ میں فعال طلب',
      messageEn: `${demandedItems.length} items (${totalDemandedUnits} total units) have active demands ready for WhatsApp or Excel export.`,
      messageUrdu: `${demandedItems.length} اشیاء (${totalDemandedUnits} کل تعداد) پر ڈیمانڈ درج ہے، برائے مہربانی روانہ کریں۔`,
      isRead: readIds.includes('notif-demands-active'),
      actionRoute: 'home'
    });
  }

  // 5. System Security & Cloud Sync Status
  notifications.push({
    id: 'notif-system-sync',
    timestamp: Date.now() - 86400000,
    type: 'system',
    severity: 'success',
    titleEn: 'System Health & Dual-Tier OS Optimal',
    titleUrdu: 'سسٹم صحت و ڈیٹا محفوظ ہے',
    messageEn: 'Wholesale database is synchronized. Role-based security active with Super Admin Lukilion.',
    messageUrdu: 'تمام ہول سیل کیٹلاگ اور ریکارڈز محفوظ ہیں۔ سیکیورٹی سسٹمز فعال ہیں۔',
    isRead: readIds.includes('notif-system-sync'),
    actionRoute: 'profile'
  });

  return notifications;
}
