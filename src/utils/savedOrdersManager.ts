import { SavedOrder, WholesaleItem } from '../types';
import { saveOrderToCloud, deleteOrderFromCloud } from '../lib/firebase';

const STORAGE_KEY = 'wholesale_saved_orders_v2';

const INITIAL_SAVED_ORDERS: SavedOrder[] = [];

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
