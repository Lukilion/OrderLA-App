import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { WholesaleItem, Language } from '../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (newItem: Omit<WholesaleItem, 'id'>) => void;
  language: Language;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  language
}) => {
  const [name, setName] = useState('');
  const [cat, setCat] = useState('شالمی');
  const [rate, setRate] = useState('');
  const [stock, setStock] = useState('0');
  const [demand, setDemand] = useState('0');
  const [statusChoice, setStatusChoice] = useState('اسٹاک دستیاب ہے');
  const [customStatus, setCustomStatus] = useState('');

  if (!isOpen) return null;

  const isUrdu = language === 'ur';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalStatus = statusChoice;
    if (statusChoice === '__custom__') {
      finalStatus = customStatus.trim() || (isUrdu ? 'کسٹم اسٹیٹس' : 'Custom Status');
    }

    onAddItem({
      name: name.trim(),
      cat,
      rate: parseFloat(rate) || 0,
      stock: stock.trim() || '0',
      demand: parseInt(demand, 10) || 0,
      status: finalStatus
    });

    // Reset fields
    setName('');
    setRate('');
    setStock('0');
    setDemand('0');
    setStatusChoice('اسٹاک دستیاب ہے');
    setCustomStatus('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#33364D]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="neu-raised-lg rounded-3xl max-w-md w-full p-5 sm:p-6 text-right space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#D8D5EA]">
          <h3 className="text-sm sm:text-base font-bold text-[#2C2E42] flex items-center gap-2">
            <span className="w-8 h-8 rounded-full neu-inset-sm flex items-center justify-center text-[#0A84FF]">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <span>{isUrdu ? 'نیا آئٹم شامل کریں (Custom Item)' : 'Add New Item'}</span>
          </h3>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-[#72768F] hover:text-rose-500 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#33364D] mb-1">
              {isUrdu ? 'آئٹم کا نام *' : 'Item Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isUrdu ? 'مثلاً: ببل گن، ہیئر کلپ، ٹیپ...' : 'e.g. Bubble Gun, Tape...'}
              className="w-full px-3.5 py-2.5 rounded-2xl neu-input font-medium"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#33364D] mb-1">
                {isUrdu ? 'کیٹیگری / لسٹ' : 'Category'}
              </label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl neu-input font-medium bg-[#EDEBF8]"
              >
                <option value="شالمی">{isUrdu ? 'شالمی ہول سیل' : 'Shalmi Wholesale'}</option>
                <option value="کاشف صاحب">{isUrdu ? 'کاشف صاحب' : 'Kashif Wholesale'}</option>
                <option value="دیگر">{isUrdu ? 'دیگر مارکیٹ' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#33364D] mb-1">
                {isUrdu ? 'بنیادی ریٹ (PKR) *' : 'Base Rate (PKR) *'}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="20"
                className="w-full px-3.5 py-2.5 rounded-2xl neu-input font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#33364D] mb-1">
                {isUrdu ? 'موجودہ اسٹاک' : 'Current Stock'}
              </label>
              <input
                type="text"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder={isUrdu ? 'مثلاً: 12 یا 2 پیکٹ' : 'e.g. 12 or 2 packets'}
                className="w-full px-3.5 py-2.5 rounded-2xl neu-input font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-[#33364D] mb-1">
                {isUrdu ? 'ڈیمانڈ تعداد (پیس)' : 'Demand Pcs'}
              </label>
              <input
                type="number"
                min="0"
                value={demand}
                onChange={(e) => setDemand(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl neu-input font-mono"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block font-bold text-[#33364D] mb-1">
              {isUrdu ? 'اسٹیٹس / کیفیت منتخب کریں *' : 'Status / Remarks *'}
            </label>
            <select
              value={statusChoice}
              onChange={(e) => setStatusChoice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl neu-input font-medium bg-[#EDEBF8]"
            >
              <option value="اسٹاک دستیاب ہے">اسٹاک دستیاب ہے (Stock Available)</option>
              <option value="فوری طلب (ہائی ڈیمانڈ)">فوری طلب (ہائی ڈیمانڈ) (High Demand)</option>
              <option value="ری اسٹاک مطلوب / درکار">ری اسٹاک مطلوب / درکار (Restock Required)</option>
              <option value="اسٹاک ختم (فوری آرڈر)">اسٹاک ختم (فوری آرڈر) (Out of Stock)</option>
              <option value="مناسب اسٹاک">مناسب اسٹاک (Adequate Stock)</option>
              <option value="رننگ اسٹاک">رننگ اسٹاک (Fast Running)</option>
              <option value="وافر اسٹاک">وافر اسٹاک (Surplus Stock)</option>
              <option value="__custom__">
                {isUrdu ? 'دیگر (اپنی مرضی کے ریمارکس درج کریں)...' : 'Custom remarks...'}
              </option>
            </select>

            {statusChoice === '__custom__' && (
              <input
                type="text"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder={isUrdu ? 'اپنا کسٹم اسٹیٹس درج کریں...' : 'Enter custom status...'}
                className="w-full mt-2 px-3.5 py-2.5 rounded-2xl neu-input font-medium"
                autoFocus
              />
            )}
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-[#D8D5EA]">
            <button
              type="submit"
              className="flex-1 py-2.5 neu-btn-accent rounded-2xl font-bold text-xs tracking-wide cursor-pointer"
            >
              {isUrdu ? 'شیٹ میں شامل کریں' : 'Add to Sheet'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 neu-btn rounded-2xl text-[#72768F] font-bold text-xs cursor-pointer"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
