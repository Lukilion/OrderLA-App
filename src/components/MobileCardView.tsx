import React, { useState } from 'react';
import { ChevronDown, Trash2, Star } from 'lucide-react';
import { WholesaleItem, Language, STATUS_PRESETS } from '../types';

interface MobileCardViewProps {
  items: WholesaleItem[];
  onUpdateCell: (id: number, field: keyof WholesaleItem, value: any) => void;
  onDeleteItem: (id: number) => void;
  totalUnits: number;
  totalBudget: number;
  language: Language;
}

export const MobileCardView: React.FC<MobileCardViewProps> = ({
  items,
  onUpdateCell,
  onDeleteItem,
  totalUnits,
  totalBudget,
  language
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const isUrdu = language === 'ur';

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const parseStockValue = (stockStr: string | number): number => {
    if (typeof stockStr === 'number') return stockStr;
    const match = String(stockStr).match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  };

  return (
    <div id="mobileCardsContainer" className="block md:hidden space-y-3 no-print">
      <div id="mobileCardsList" className="space-y-3">
        {items.length === 0 ? (
          <div className="neu-inset rounded-2xl p-6 text-center text-xs text-[var(--text-secondary)] font-semibold">
            {isUrdu ? 'کوئی آئٹم نہیں ملا (فلٹر یا تلاش تبدیل کریں)' : 'No items match your filter'}
          </div>
        ) : (
          items.map((item) => {
            const itemDemand = Number(item.demand) || 0;
            const itemRate = Number(item.rate) || 0;
            const lineTotal = itemDemand * itemRate;
            const isDemanded = itemDemand > 0;
            const isExpanded = expandedItems.has(item.id);
            const parsedStock = parseStockValue(item.stock);
            const isCriticalStock = item.stock !== '' && item.stock !== '0' && parsedStock <= 5;

            const availableStatuses = Array.from(
              new Set(item.status ? [item.status, ...STATUS_PRESETS] : STATUS_PRESETS)
            );

            return (
              <div
                key={item.id}
                className={`neu-raised rounded-2xl p-3.5 transition-all ${
                  isDemanded ? 'border-r-4 border-[var(--accent-blue)]' : ''
                }`}
              >
                {/* Header Strip */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[var(--text-secondary)] neu-inset-sm w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {item.id}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5 truncate max-w-[160px]">
                      {isDemanded && (
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                      <span className="truncate">{item.name}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isDemanded ? (
                      <span className="text-[11px] font-extrabold text-[var(--accent-blue)] neu-inset-sm px-2 py-0.5 rounded-full">
                        *{itemDemand} {isUrdu ? 'پیس' : 'pcs'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {isUrdu ? 'اسٹاک:' : 'Stock:'} {item.stock || '0'}
                      </span>
                    )}

                    <span className="text-xs font-mono font-bold text-emerald-500">
                      {lineTotal > 0 ? `Rs ${Math.round(lineTotal)}` : `Rs ${itemRate}`}
                    </span>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-[var(--accent-blue)]' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 space-y-2.5 text-xs animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-2">
                      {/* 1. نام (Editable) */}
                      <div>
                        <label className="block text-[10px] text-[var(--text-secondary)] font-bold mb-1">
                          {isUrdu ? 'نام آئٹم (ایڈٹ)' : 'Item Name'}
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => onUpdateCell(item.id, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl neu-input font-bold text-[var(--text-main)]"
                        />
                      </div>

                      {/* کیٹیگری */}
                      <div>
                        <label className="block text-[10px] text-[var(--text-secondary)] font-bold mb-1">
                          {isUrdu ? 'کیٹیگری' : 'Category'}
                        </label>
                        <select
                          value={item.cat}
                          onChange={(e) => onUpdateCell(item.id, 'cat', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xl neu-input bg-[var(--bg-canvas)] text-[var(--text-main)]"
                        >
                          <option value="شالمی">شالمی</option>
                          <option value="کاشف صاحب">کاشف صاحب</option>
                          <option value="دیگر">دیگر</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* 2. بنیادی ریٹ (Editable) */}
                      <div>
                        <label className="block text-[10px] text-[var(--text-secondary)] font-bold mb-1">
                          {isUrdu ? 'بنیادی ریٹ' : 'Rate'}
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.rate === 0 ? '' : item.rate}
                          placeholder="0"
                          onChange={(e) =>
                            onUpdateCell(
                              item.id,
                              'rate',
                              e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1.5 rounded-xl neu-input font-mono font-bold text-center"
                        />
                      </div>

                      {/* اسٹاک (Empty by default with "0" placeholder) */}
                      <div>
                        <label className="block text-[10px] text-[var(--text-secondary)] font-bold mb-1">
                          {isUrdu ? 'اسٹاک' : 'Stock'}
                        </label>
                        <input
                          type="text"
                          value={item.stock === '0' || !item.stock ? '' : item.stock}
                          placeholder="0"
                          onChange={(e) => onUpdateCell(item.id, 'stock', e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-xl neu-input font-mono text-center ${
                            isCriticalStock ? 'text-rose-500 font-bold' : ''
                          }`}
                        />
                      </div>

                      {/* 3. ڈیمانڈ (Editable, empty by default with "0" placeholder) */}
                      <div>
                        <label className="block text-[10px] text-[var(--accent-blue)] font-bold mb-1">
                          {isUrdu ? 'ڈیمانڈ (*)' : 'Demand (*)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={item.demand === 0 || !item.demand ? '' : item.demand}
                          placeholder="0"
                          onChange={(e) =>
                            onUpdateCell(
                              item.id,
                              'demand',
                              e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-full px-2 py-1.5 rounded-xl neu-input font-mono font-extrabold text-center text-[var(--accent-blue)]"
                        />
                      </div>
                    </div>

                    {/* 4. کیفیت (Dropdown Cell) */}
                    <div>
                      <label className="block text-[10px] text-[var(--text-secondary)] font-bold mb-1">
                        {isUrdu ? 'کیفیت (ڈراپ ڈاؤن منتخب کریں)' : 'Status / Remarks (Dropdown)'}
                      </label>
                      <select
                        value={item.status || 'اسٹاک دستیاب ہے'}
                        onChange={(e) => onUpdateCell(item.id, 'status', e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl neu-input text-[var(--text-main)] bg-[var(--bg-canvas)]"
                      >
                        {availableStatuses.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="font-bold text-[var(--text-secondary)]">
                        {isUrdu ? 'متوقع لاگت:' : 'Cost:'}{' '}
                        <strong className="text-emerald-500 font-mono">
                          {Math.round(lineTotal)} PKR
                        </strong>
                      </span>

                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="px-2.5 py-1 rounded-xl neu-btn text-rose-500 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{isUrdu ? 'حذف' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Mobile Sticky Total Banner */}
      <div className="neu-raised rounded-2xl p-4 flex items-center justify-between text-xs font-bold">
        <div>
          <span className="text-[var(--text-secondary)] block text-[10px]">
            {isUrdu ? 'کل مطلوبہ مقدار' : 'Total Units Required'}
          </span>
          <span id="mobileTotalUnits" className="text-base text-[var(--accent-blue)] font-extrabold">
            {totalUnits} {isUrdu ? 'پیس' : 'pcs'}
          </span>
        </div>

        <div className="text-left">
          <span className="text-[var(--text-secondary)] block text-[10px]">
            {isUrdu ? 'متوقع بجٹ' : 'Projected Budget'}
          </span>
          <span id="mobileTotalBudget" className="text-base text-emerald-500 font-extrabold">
            Rs {Math.round(totalBudget).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
