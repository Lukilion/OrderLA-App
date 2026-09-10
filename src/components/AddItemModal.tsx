import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { WholesaleItem, Language, STATUS_PRESETS } from '../types';

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
  const [stock, setStock] = useState('');
  const [demand, setDemand] = useState('');
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
      stock: stock.trim() || '',
      demand: parseInt(demand, 10) || 0,
      status: finalStatus
    });

    // Reset fields
    setName('');
    setRate('');
    setStock('');
    setDemand('');
    setStatusChoice('اسٹاک دستیاب ہے');
    setCustomStatus('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="neu-raised-lg rounded-3xl max-w-md w-full p-5 sm:p-6 text-right space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl neu-inset-sm flex items-center justify-center text-[var(--accent-blue)]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-[var(--text-main)] urdu-title">
              {isUrdu ? 'نیا ہول سیل آئٹم شامل کریں' : 'Add New Wholesale Item'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl neu-btn flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Item Name */}
          <div>
            <label className="block font-bold text-[var(--text-secondary)] mb-1">
              {isUrdu ? 'نام آئٹم (ضروری)*' : 'Item Name (Required)*'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isUrdu ? 'مثلاً: سپر ایل ای ڈی بلب' : 'e.g. Super LED Bulb'}
              className="w-full px-3.5 py-2.5 rounded-2xl neu-input text-right font-medium"
            />
          </div>

          {/* Category & Base Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                {isUrdu ? 'کیٹیگری / مارکیٹ' : 'Market Category'}
              </label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl neu-input text-[var(--text-main)] bg-[var(--bg-canvas)] cursor-pointer"
              >
                <option value="شالمی">شالمی مارکیٹ</option>
                <option value="کاشف صاحب">کاشف صاحب ہول سیل</option>
                <option value="دیگر">دیگر سپلائر</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                {isUrdu ? 'بنیادی ہول سیل ریٹ (PKR)' : 'Base Rate (PKR)'}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={rate}
                placeholder="0"
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl neu-input text-center font-mono font-bold"
              />
            </div>
          </div>

          {/* Current Stock & Demand with "0" placeholder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[var(--text-secondary)] mb-1">
                {isUrdu ? 'موجودہ اسٹاک (تعداد)' : 'Current Stock'}
              </label>
              <input
                type="text"
                value={stock}
                placeholder="0"
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl neu-input text-center font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--accent-blue)] mb-1">
                {isUrdu ? 'ڈیمانڈ مع (*) پیس' : 'Demand (*) Pcs'}
              </label>
              <input
                type="number"
                min="0"
                value={demand}
                placeholder="0"
                onChange={(e) => setDemand(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl neu-input text-center font-mono font-extrabold text-[var(--accent-blue)]"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block font-bold text-[var(--text-secondary)] mb-1">
              {isUrdu ? 'کیفیت (ڈراپ ڈاؤن سے منتخب کریں)' : 'Quality / Status'}
            </label>
            <select
              value={statusChoice}
              onChange={(e) => setStatusChoice(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl neu-input text-[var(--text-main)] bg-[var(--bg-canvas)] cursor-pointer"
            >
              {STATUS_PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
              <option value="__custom__">{isUrdu ? 'کسٹم ریمارکس درج کریں...' : 'Custom Remarks...'}</option>
            </select>
          </div>

          {statusChoice === '__custom__' && (
            <div>
              <input
                type="text"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder={isUrdu ? 'اپنا ریمارکس لکھیں...' : 'Enter custom status note...'}
                className="w-full px-3.5 py-2 rounded-2xl neu-input text-right font-medium"
              />
            </div>
          )}

          {/* Projected calculation preview */}
          <div className="p-3 rounded-2xl neu-inset-sm flex items-center justify-between text-xs font-bold">
            <span className="text-[var(--text-secondary)]">{isUrdu ? 'متوقع خریداری لاگت:' : 'Projected Cost:'}</span>
            <span className="text-emerald-500 font-mono text-sm">
              Rs {Math.round((parseFloat(rate) || 0) * (parseInt(demand, 10) || 0)).toLocaleString()}
            </span>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl neu-btn text-[var(--text-secondary)] font-bold cursor-pointer"
            >
              {isUrdu ? 'منسوخ کریں' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl neu-btn-accent font-bold cursor-pointer"
            >
              {isUrdu ? 'آئٹم شامل کریں' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
