import React, { useState } from 'react';
import { ChevronDown, Trash2, Star } from 'lucide-react';
import { WholesaleItem, Language } from '../types';

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
          <div className="neu-inset rounded-2xl p-6 text-center text-xs text-[#72768F] font-semibold">
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
            const isCriticalStock = parsedStock <= 5;

            return (
              <div
                key={item.id}
                className={`neu-raised rounded-2xl p-3.5 transition-all ${
                  isDemanded ? 'border-r-4 border-[#0A84FF]' : ''
                }`}
              >
                {/* Header Strip - Click to expand */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#72768F] neu-inset-sm w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {item.id}
                    </span>
                    <span className="text-xs font-bold text-[#2C2E42] flex items-center gap-1.5 truncate max-w-[160px]">
                      {isDemanded && (
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                      <span className="truncate">{item.name}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isDemanded ? (
                      <span className="text-[11px] font-extrabold text-[#0A84FF] neu-inset-sm px-2 py-0.5 rounded-full">
                        *{itemDemand} {isUrdu ? 'پیس' : 'pcs'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#72768F]">
                        {isUrdu ? 'اسٹاک:' : 'Stock:'} {item.stock}
                      </span>
                    )}

                    <span className="text-xs font-mono font-bold text-emerald-600">
                      {lineTotal > 0 ? `Rs ${Math.round(lineTotal)}` : `Rs ${itemRate}`}
                    </span>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#72768F] transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-[#0A84FF]' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#D9D6EA] space-y-2.5 text-xs animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-[#72768F] font-bold mb-1">
                          {isUrdu ? 'نام آئٹم' : 'Item Name'}
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => onUpdateCell(item.id, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl neu-input font-bold text-[#2C2E42]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#72768F] font-bold mb-1">
                          {isUrdu ? 'کیٹیگری' : 'Category'}
                        </label>
                        <select
                          value={item.cat}
                          onChange={(e) => onUpdateCell(item.id, 'cat', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl neu-input bg-[#EDEBF8] text-[#33364D]"
                        >
                          <option value="شالمی">شالمی</option>
                          <option value="کاشف صاحب">کاشف صاحب</option>
                          <option value="دیگر">دیگر</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-[#72768F] font-bold mb-1">
                          {isUrdu ? 'بنیادی ریٹ' : 'Rate'}
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.rate}
                          onChange={(e) => onUpdateCell(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded-xl neu-input font-mono font-bold text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#72768F] font-bold mb-1">
                          {isUrdu ? 'اسٹاک' : 'Stock'}
                        </label>
                        <input
                          type="text"
                          value={String(item.stock)}
                          onChange={(e) => onUpdateCell(item.id, 'stock', e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-xl neu-input font-mono text-center ${
                            isCriticalStock ? 'text-rose-600 font-bold' : ''
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[#0A84FF] font-bold mb-1">
                          {isUrdu ? 'ڈیمانڈ (*)' : 'Demand (*)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={item.demand}
                          onChange={(e) => onUpdateCell(item.id, 'demand', parseInt(e.target.value, 10) || 0)}
                          className="w-full px-2 py-1.5 rounded-xl neu-input font-mono font-extrabold text-center text-[#0A84FF]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#72768F] font-bold mb-1">
                        {isUrdu ? 'اسٹیٹس / ریمارکس' : 'Status / Remarks'}
                      </label>
                      <input
                        type="text"
                        value={item.status || ''}
                        onChange={(e) => onUpdateCell(item.id, 'status', e.target.value)}
                        placeholder={isUrdu ? 'اسٹیٹس درج کریں...' : 'Status...'}
                        className="w-full px-2.5 py-1.5 rounded-xl neu-input text-[#72768F]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="font-bold text-[#72768F]">
                        {isUrdu ? 'متوقع لاگت:' : 'Cost:'}{' '}
                        <strong className="text-emerald-600 font-mono">
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
          <span className="text-[#72768F] block text-[10px]">
            {isUrdu ? 'کل مطلوبہ مقدار' : 'Total Units Required'}
          </span>
          <span id="mobileTotalUnits" className="text-base text-[#0A84FF] font-extrabold">
            {totalUnits} {isUrdu ? 'پیس' : 'pcs'}
          </span>
        </div>

        <div className="text-left">
          <span className="text-[#72768F] block text-[10px]">
            {isUrdu ? 'متوقع بجٹ' : 'Projected Budget'}
          </span>
          <span id="mobileTotalBudget" className="text-base text-emerald-600 font-extrabold">
            Rs {Math.round(totalBudget).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
