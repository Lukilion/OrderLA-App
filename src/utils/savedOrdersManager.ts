import { SavedOrder, WholesaleItem } from '../types';
import { saveOrderToCloud, deleteOrderFromCloud } from '../lib/firebase';

const STORAGE_KEY = 'wholesale_saved_orders_v2';

const INITIAL_SAVED_ORDERS: SavedOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-2026-0914',
    title: 'شاہ عالمی ہول سیل ترسیل (Shalmi Restock)',
    date: '14 Sep 2026',
    timestamp: Date.now() - 172800000,
    totalItems: 8,
    totalUnits: 120,
    totalBudget: 145800,
    buyerName: 'طارق حسین (Tariq)',
    status: 'completed',
    notes: 'شاہ عالمی مارکیٹ سے ڈائریکٹ مال اٹھایا گیا۔ تمام پیکنگز چیک شدہ۔',
    items: [
      { id: 2, name: 'کولگیٹ ٹوتھ پیسٹ 150 گرام (Colgate 150g)', cat: 'ٹوتھ پیسٹ', rate: 260, stock: '5', demand: 25, status: 'فوری طلب (ہائی ڈیمانڈ)' },
      { id: 4, name: 'سنسوڈائن ریپڈ ریلیف (Sensodyne Rapid)', cat: 'ٹوتھ پیسٹ', rate: 420, stock: '2', demand: 15, status: 'اسٹاک ختم (فوری آرڈر)' },
      { id: 11, name: 'سیف گارڈ صابن 135 گرام (Safeguard Soap)', cat: 'صابن', rate: 145, stock: '10', demand: 30, status: 'رننگ اسٹاک' },
      { id: 21, name: 'سن سلک شیمپو 360ml (Sunsilk Shampoo)', cat: 'شیمپو', rate: 580, stock: '3', demand: 20, status: 'ری اسٹاک مطلوب / درکار' },
      { id: 31, name: 'ایریل سرف 1 کلو (Ariel Detergent 1kg)', cat: 'واشنگ و سرف', rate: 590, stock: '4', demand: 15, status: 'فوری طلب (ہائی ڈیمانڈ)' },
      { id: 45, name: 'ٹپر چائے 475 گرام (Tapal Danedar 475g)', cat: 'چائے و دودھ', rate: 720, stock: '1', demand: 15, status: 'اسٹاک ختم (فوری آرڈر)' }
    ]
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-2026-0915',
    title: 'کاشف برادرز سپلائی (Kashif Supply Draft)',
    date: '15 Sep 2026',
    timestamp: Date.now() - 86400000,
    totalItems: 5,
    totalUnits: 65,
    totalBudget: 89400,
    buyerName: 'محمد کاشف (Kashif)',
    status: 'draft',
    notes: 'پیر کے روز تصدیق کر کے ترسیل کروائی جائے گی۔',
    items: [
      { id: 1, name: 'کولگیٹ ٹوتھ پیسٹ 70 گرام (Colgate 70g)', cat: 'ٹوتھ پیسٹ', rate: 140, stock: '8', demand: 20, status: 'مناسب اسٹاک' },
      { id: 12, name: 'لکس صابن 140 گرام (Lux Beauty Soap)', cat: 'صابن', rate: 135, stock: '4', demand: 25, status: 'فوری طلب (ہائی ڈیمانڈ)' },
      { id: 22, name: 'ڈوو شیمپو 340ml (Dove Daily Moisture)', cat: 'شیمپو', rate: 640, stock: '6', demand: 10, status: 'وافر اسٹاک' },
      { id: 50, name: 'حبیب کوکنگ آئل 1 لیٹر (Habib Oil 1L)', cat: 'کھانے پینے کی اشیاء', rate: 540, stock: '2', demand: 10, status: 'ری اسٹاک مطلوب / درکار' }
    ]
  }
];

export function getSavedOrders(): SavedOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAVED_ORDERS));
      return INITIAL_SAVED_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAVED_ORDERS;
  } catch (err) {
    console.error('Failed to parse saved orders', err);
    return INITIAL_SAVED_ORDERS;
  }
}

export function saveNewOrder(
  data: { title: string; notes?: string; buyerName?: string; status?: 'draft' | 'completed' | 'sent' },
  items: WholesaleItem[]
): SavedOrder {
  const currentOrders = getSavedOrders();
  const demandedItems = items.filter((i) => Number(i.demand) > 0);

  const totalUnits = demandedItems.reduce((sum, i) => sum + (Number(i.demand) || 0), 0);
  const totalBudget = demandedItems.reduce(
    (sum, i) => sum + (Number(i.demand) || 0) * (Number(i.rate) || 0),
    0
  );

  const newOrder: SavedOrder = {
    id: 'ord-' + Date.now().toString(36),
    orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: data.title.trim() || `آرڈر بلحاظ تاریخ ${new Date().toLocaleDateString('en-PK')}`,
    date: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }),
    timestamp: Date.now(),
    totalItems: demandedItems.length,
    totalUnits,
    totalBudget,
    buyerName: data.buyerName?.trim() || 'Wholesale Purchaser',
    status: data.status || 'draft',
    notes: data.notes?.trim() || '',
    items: demandedItems.length > 0 ? demandedItems : items.slice(0, 10)
  };

  const updated = [newOrder, ...currentOrders];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save order to localStorage', err);
  }

  // Cloud Firestore synchronization
  saveOrderToCloud(newOrder).catch((err) => {
    console.warn('[Firebase] Order cloud sync failed:', err);
  });

  return newOrder;
}

export function deleteSavedOrder(orderId: string): SavedOrder[] {
  const currentOrders = getSavedOrders();
  const updated = currentOrders.filter((o) => o.id !== orderId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete order from localStorage', err);
  }

  // Cloud Firestore deletion
  deleteOrderFromCloud(orderId).catch((err) => {
    console.warn('[Firebase] Order cloud delete failed:', err);
  });

  return updated;
}

export function updateSavedOrderStatus(
  orderId: string,
  newStatus: 'draft' | 'completed' | 'sent'
): SavedOrder[] {
  const currentOrders = getSavedOrders();
  const target = currentOrders.find((o) => o.id === orderId);
  const updated = currentOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update order status', err);
  }

  if (target) {
    saveOrderToCloud({ ...target, status: newStatus }).catch((err) => {
      console.warn('[Firebase] Order status cloud update failed:', err);
    });
  }

  return updated;
}
