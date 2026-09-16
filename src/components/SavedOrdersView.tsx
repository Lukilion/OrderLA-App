import React, { useState } from 'react';
import { 
  SavedOrder, 
  Language, 
  WholesaleItem 
} from '../types';
import { 
  getSavedOrders, 
  saveNewOrder, 
  deleteSavedOrder, 
  updateSavedOrderStatus 
} from '../utils/savedOrdersManager';
import { 
  FileText, 
  Plus, 
  Trash2, 
  ArrowRight, 
  MessageSquare, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Calendar, 
  User, 
  AlertCircle 
} from 'lucide-react';
import { exportToExcel } from '../utils/exportHelpers';

interface SavedOrdersViewProps {
  currentItems: WholesaleItem[];
  language: Language;
  onLoadOrderToSheet: (orderItems: WholesaleItem[], orderTitle: string) => void;
  onRequestWhatsApp: (items: WholesaleItem[]) => void;
  onToast: (msg: string) => void;
  onNavigateHome: () => void;
}

export const SavedOrdersView: React.FC<SavedOrdersViewProps> = ({
  currentItems,
  language,
  onLoadOrderToSheet,
  onRequestWhatsApp,
  onToast,
  onNavigateHome
}) => {
  const [orders, setOrders] = useState<SavedOrder[]>(() => getSavedOrders());
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [orderTitleInput, setOrderTitleInput] = useState('');
  const [orderNotesInput, setOrderNotesInput] = useState('');
  const [buyerNameInput, setBuyerNameInput] = useState('');

  const isUrdu = language === 'ur';

  // Metrics across all saved orders
  const totalSavedOrdersCount = orders.length;
  const totalBudgetAcrossOrders = orders.reduce((sum, o) => sum + o.totalBudget, 0);
  const totalUnitsAcrossOrders = orders.reduce((sum, o) => sum + o.totalUnits, 0);

  // Active items currently with demand > 0
  const activeDemandedItems = currentItems.filter((i) => Number(i.demand) > 0);

  const handleSaveCurrentSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderTitleInput.trim()) {
      onToast(isUrdu ? 'برائے مہربانی آرڈر کا نام درج کریں' : 'Please enter an order title');
      return;
    }

    const newOrder = saveNewOrder(
      {
        title: orderTitleInput,
        notes: orderNotesInput,
        buyerName: buyerNameInput || 'Wholesale Buyer',
        status: 'draft'
      },
      currentItems
    );

    setOrders(getSavedOrders());
    setIsNewOrderModalOpen(false);
    setOrderTitleInput('');
    setOrderNotesInput('');
    setBuyerNameInput('');

    onToast(
      isUrdu
        ? `آرڈر "${newOrder.title}" کامیابی سے محفوظ کر لیا گیا ہے!`
        : `Order "${newOrder.title}" saved successfully!`
    );
  };

  const handleDelete = (orderId: string, title: string) => {
    if (window.confirm(isUrdu ? `کیا آپ واقعی "${title}" کو حذف کرنا چاہتے ہیں؟` : `Delete order "${title}"?`)) {
      const updated = deleteSavedOrder(orderId);
      setOrders(updated);
      onToast(isUrdu ? 'آرڈر حذف کر دیا گیا' : 'Order deleted');
    }
  };

  const handleStatusChange = (orderId: string, status: 'draft' | 'completed' | 'sent') => {
    const updated = updateSavedOrderStatus(orderId, status);
    setOrders(updated);
    onToast(isUrdu ? 'آرڈر کی حالت اپ ڈیٹ ہو گئی' : 'Order status updated');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neu-raised-lg rounded-3xl p-5 sm:p-6 bg-[var(--bg-canvas)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-inset-sm flex items-center justify-center text-[var(--accent-blue)]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-main)] urdu-title">
                {isUrdu ? 'محفوظ شدہ آرڈرز (Saved Orders)' : 'Saved Wholesale Orders'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {isUrdu
                  ? 'سابقہ ہول سیل ڈیمانڈز، اسنیپ شاٹس اور محفوظ شدہ لسٹوں کا ریکارڈ'
                  : 'Manage, review, reload, or dispatch previously saved wholesale procurement orders'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsNewOrderModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl neu-btn-accent text-xs font-black cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? 'موجودہ شیٹ کو بطور آرڈر محفوظ کریں' : 'Save Current Sheet as Order'}</span>
            {activeDemandedItems.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px]">
                {activeDemandedItems.length} {isUrdu ? 'آئٹمز' : 'items'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="neu-raised rounded-2xl p-4 flex items-center gap-3.5 bg-[var(--bg-canvas)]">
          <div className="w-10 h-10 rounded-xl neu-inset-sm flex items-center justify-center text-[var(--accent-blue)]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[var(--text-secondary)]">
              {isUrdu ? 'کل محفوظ آرڈرز' : 'Total Saved Orders'}
            </div>
            <div className="text-xl font-black text-[var(--text-main)] font-mono">
              {totalSavedOrdersCount}
            </div>
          </div>
        </div>

        <div className="neu-raised rounded-2xl p-4 flex items-center gap-3.5 bg-[var(--bg-canvas)]">
          <div className="w-10 h-10 rounded-xl neu-inset-sm flex items-center justify-center text-amber-500">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[var(--text-secondary)]">
              {isUrdu ? 'کل طلب شدہ یونٹس' : 'Total Demanded Units'}
            </div>
            <div className="text-xl font-black text-[var(--text-main)] font-mono">
              {totalUnitsAcrossOrders.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="neu-raised rounded-2xl p-4 flex items-center gap-3.5 bg-[var(--bg-canvas)]">
          <div className="w-10 h-10 rounded-xl neu-inset-sm flex items-center justify-center text-emerald-500">
            <span className="font-extrabold text-sm">Rs.</span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[var(--text-secondary)]">
              {isUrdu ? 'کل مجموعی بجٹ' : 'Cumulative Value'}
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              Rs. {totalBudgetAcrossOrders.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="neu-raised-lg rounded-3xl p-10 text-center space-y-3 bg-[var(--bg-canvas)]">
            <div className="w-14 h-14 rounded-full neu-inset-sm mx-auto flex items-center justify-center text-[var(--text-secondary)]">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-[var(--text-main)]">
              {isUrdu ? 'کوئی محفوظ شدہ آرڈر موجود نہیں' : 'No Saved Orders Found'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
              {isUrdu
                ? 'ڈیمانڈ شیٹ میں مطلوبہ تعداد درج کریں اور اوپر دیئے گئے بٹن کے ذریعے اسے محفوظ کر لیں۔'
                : 'Enter item demands in the Home sheet and click "Save Current Sheet as Order" to keep snapshots here.'}
            </p>
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl neu-btn-accent text-xs font-bold"
            >
              <span>{isUrdu ? 'ڈیمانڈ شیٹ پر جائیں' : 'Go to Home Demand Sheet'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="neu-raised rounded-3xl p-5 sm:p-6 bg-[var(--bg-canvas)] transition-all hover:shadow-lg space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-black/5 dark:border-white/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-full neu-inset-sm text-xs font-mono font-bold text-[var(--accent-blue)]">
                        {order.orderNumber}
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-[var(--text-main)]">
                        {order.title}
                      </h3>
                      {/* Status Dropdown / Pill */}
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : order.status === 'sent'
                              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {order.status === 'completed'
                            ? (isUrdu ? 'مکمل شدہ' : 'Completed')
                            : order.status === 'sent'
                            ? (isUrdu ? 'ارسال شدہ' : 'Sent via WhatsApp')
                            : (isUrdu ? 'ڈرافٹ' : 'Draft')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {order.date}
                      </span>
                      {order.buyerName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {order.buyerName}
                        </span>
                      )}
                      {order.notes && (
                        <span className="italic text-[11px] truncate max-w-xs">
                          "{order.notes}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary Metric Chips & Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                    <div className="neu-inset-sm px-3 py-1.5 rounded-xl text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] font-bold">
                        {isUrdu ? 'اشیاء' : 'Items'}
                      </div>
                      <div className="font-mono font-bold text-xs text-[var(--text-main)]">
                        {order.totalItems}
                      </div>
                    </div>

                    <div className="neu-inset-sm px-3 py-1.5 rounded-xl text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] font-bold">
                        {isUrdu ? 'تعداد' : 'Units'}
                      </div>
                      <div className="font-mono font-bold text-xs text-[var(--accent-blue)]">
                        {order.totalUnits}
                      </div>
                    </div>

                    <div className="neu-inset-sm px-3 py-1.5 rounded-xl text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] font-bold">
                        {isUrdu ? 'مالیت' : 'Total'}
                      </div>
                      <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        Rs. {order.totalBudget.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* 1. Load into Active Sheet */}
                    <button
                      type="button"
                      onClick={() => onLoadOrderToSheet(order.items, order.title)}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl neu-btn-accent text-xs font-black cursor-pointer shadow-sm hover:scale-[1.02] transition"
                      title={isUrdu ? 'اس آرڈر کو مرکزی شیٹ میں لوڈ کریں' : 'Load this order into active sheet'}
                    >
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      <span>{isUrdu ? 'شیٹ میں لوڈ کریں' : 'Load to Sheet'}</span>
                    </button>

                    {/* 2. Dispatch to WhatsApp */}
                    <button
                      type="button"
                      onClick={() => {
                        onRequestWhatsApp(order.items);
                        handleStatusChange(order.id, 'sent');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-emerald-600 hover:text-emerald-500 cursor-pointer transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
                    </button>

                    {/* 3. Export Excel */}
                    <button
                      type="button"
                      onClick={() => exportToExcel(order.items, language)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-[var(--text-secondary)] hover:text-emerald-600 cursor-pointer transition"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isUrdu ? 'ایکسل' : 'Excel'}</span>
                    </button>

                    {/* 4. Change Status */}
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                      className="neu-inset-sm px-2.5 py-1.5 rounded-xl text-xs font-bold bg-transparent text-[var(--text-secondary)] cursor-pointer outline-none"
                    >
                      <option value="draft">{isUrdu ? 'ڈرافٹ (Draft)' : 'Draft'}</option>
                      <option value="completed">{isUrdu ? 'مکمل (Completed)' : 'Completed'}</option>
                      <option value="sent">{isUrdu ? 'ارسال شدہ (Sent)' : 'Sent'}</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Items View */}
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer"
                    >
                      <span>{isExpanded ? (isUrdu ? 'چھپائیں' : 'Hide') : (isUrdu ? 'تفصیل دیکھیں' : 'View Items')}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete Order */}
                    <button
                      type="button"
                      onClick={() => handleDelete(order.id, order.title)}
                      className="p-2 rounded-xl neu-btn text-rose-500 hover:text-rose-600 cursor-pointer"
                      title={isUrdu ? 'حذف کریں' : 'Delete order'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Item Breakdown Table */}
                {isExpanded && (
                  <div className="pt-3 border-t border-black/5 dark:border-white/10 animate-in fade-in duration-150">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
                        <thead>
                          <tr className="border-b border-black/5 dark:border-white/10 text-[var(--text-secondary)] font-bold">
                            <th className="py-2 px-2">#</th>
                            <th className="py-2 px-3">{isUrdu ? 'پروڈکٹ نام' : 'Item Name'}</th>
                            <th className="py-2 px-3">{isUrdu ? 'کیٹیگری' : 'Category'}</th>
                            <th className="py-2 px-3 text-center">{isUrdu ? 'ریٹ (PKR)' : 'Rate'}</th>
                            <th className="py-2 px-3 text-center">{isUrdu ? 'ڈیمانڈ (طلب)' : 'Demand'}</th>
                            <th className="py-2 px-3 text-center">{isUrdu ? 'رقم (سب ٹوٹل)' : 'Subtotal'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5">
                          {order.items.map((item, idx) => {
                            const demand = Number(item.demand) || 0;
                            const rate = Number(item.rate) || 0;
                            const subtotal = demand * rate;

                            return (
                              <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                                <td className="py-2 px-2 font-mono text-[var(--text-secondary)]">{idx + 1}</td>
                                <td className="py-2 px-3 font-bold text-[var(--text-main)]">{item.name}</td>
                                <td className="py-2 px-3 text-[var(--text-secondary)]">{item.cat}</td>
                                <td className="py-2 px-3 text-center font-mono font-semibold">Rs. {rate}</td>
                                <td className="py-2 px-3 text-center font-mono font-bold text-[var(--accent-blue)]">
                                  {demand}
                                </td>
                                <td className="py-2 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  Rs. {subtotal.toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Save Current Sheet as New Order */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl neu-raised-lg p-6 bg-[var(--bg-canvas)] space-y-4 border border-white/50 dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-[var(--text-main)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--accent-blue)]" />
                <span>{isUrdu ? 'شیٹ بطور نیا آرڈر محفوظ کریں' : 'Save Current Sheet as Order'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-1 rounded-xl neu-btn text-[var(--text-secondary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCurrentSheet} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {isUrdu ? 'آرڈر کا نام یا حوالہ *' : 'Order Title / Reference *'}
                </label>
                <input
                  type="text"
                  required
                  value={orderTitleInput}
                  onChange={(e) => setOrderTitleInput(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً شاہ عالمی سپلائی جمعرات' : 'e.g. Shalmi Weekly Restock'}
                  className="w-full px-3.5 py-2.5 rounded-2xl neu-inset-sm text-xs font-semibold bg-transparent outline-none text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {isUrdu ? 'خریدار / پارٹنر کا نام' : 'Buyer / Purchaser Name'}
                </label>
                <input
                  type="text"
                  value={buyerNameInput}
                  onChange={(e) => setBuyerNameInput(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً طارق حسین' : 'e.g. Tariq Hussain'}
                  className="w-full px-3.5 py-2.5 rounded-2xl neu-inset-sm text-xs font-semibold bg-transparent outline-none text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {isUrdu ? 'نوٹس یا ہدایات' : 'Notes / Remarks'}
                </label>
                <textarea
                  rows={2}
                  value={orderNotesInput}
                  onChange={(e) => setOrderNotesInput(e.target.value)}
                  placeholder={isUrdu ? 'اضافی معلومات یا ڈلیوری ٹائم' : 'Additional dispatch instructions'}
                  className="w-full px-3.5 py-2 rounded-2xl neu-inset-sm text-xs font-semibold bg-transparent outline-none text-[var(--text-main)] resize-none"
                />
              </div>

              {activeDemandedItems.length === 0 && (
                <div className="p-3 rounded-2xl neu-inset-sm flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {isUrdu
                      ? 'نوٹ: فی الحال کسی آئٹم پر ڈیمانڈ درج نہیں ہے۔ تمام موجودہ کیٹلاگ بطور اسنیپ شاٹ محفوظ ہو جائے گی۔'
                      : 'Note: No active demands entered. Full inventory will be stored as baseline.'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-2xl neu-btn text-xs font-bold text-[var(--text-secondary)] cursor-pointer"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl neu-btn-accent text-xs font-black cursor-pointer shadow-md"
                >
                  {isUrdu ? 'محفوظ کریں' : 'Save Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
