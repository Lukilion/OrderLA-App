import React from 'react';
import { Trash2 } from 'lucide-react';
import { WholesaleItem, SortKey, SortDirection, Language, STATUS_PRESETS } from '../types';

interface DesktopTableViewProps {
  items: WholesaleItem[];
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSortToggle: (key: SortKey) => void;
  onUpdateCell: (id: number, field: keyof WholesaleItem, value: any) => void;
  onDeleteItem: (id: number) => void;
  totalUnits: number;
  totalBudget: number;
  demandedCount: number;
  language: Language;
  canEditRates?: boolean;
}

export const DesktopTableView: React.FC<DesktopTableViewProps> = ({
  items,
  sortKey,
  sortDirection,
  onSortToggle,
  onUpdateCell,
  onDeleteItem,
  totalUnits,
  totalBudget,
  demandedCount,
  language,
  canEditRates = true
}) => {
  const isUrdu = language === 'ur';

  const parseStockValue = (stockStr: string | number): number => {
    if (typeof stockStr === 'number') return stockStr;
    const match = String(stockStr).match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  };

  const renderSortIndicator = (key: SortKey) => {
    if (sortKey !== key) {
      return <span className="text-[10px] text-[var(--text-secondary)]">↕</span>;
    }
    return (
      <span className="text-[11px] font-bold text-[var(--accent-blue)]">
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div id="desktopTableContainer" className="hidden md:block neu-raised-lg rounded-3xl overflow-hidden p-2 transition-all">
      <div className="overflow-x-auto rounded-2xl">
        <table id="demandTable" className="w-full text-right text-xs md:text-sm border-collapse">
          <thead>
            <tr className="bg-black/5 dark:bg-white/5 text-[var(--text-main)] text-xs font-bold select-none border-b border-black/10 dark:border-white/10">
              <th
                onClick={() => onSortToggle('id')}
                className="col-id py-3.5 px-3 w-12 text-center cursor-pointer hover:text-[var(--accent-blue)] transition"
                title={isUrdu ? 'نمبر شمار' : 'Number'}
              >
                <span className="inline-flex items-center gap-1">
                  <span>{isUrdu ? 'نمبر' : '#' }</span>
                  {renderSortIndicator('id')}
                </span>
              </th>

              <th
                onClick={() => onSortToggle('name')}
                className="col-name py-3.5 px-3 min-w-[160px] cursor-pointer hover:text-[var(--accent-blue)] transition"
                title={isUrdu ? 'نام آئٹم' : 'Item Name'}
              >
                <span className="inline-flex items-center gap-1">
                  <span>{isUrdu ? 'نام آئٹم (ایڈٹ کریں)' : 'Item Name (Editable)'}</span>
                  {renderSortIndicator('name')}
                </span>
              </th>

              <th
                onClick={() => onSortToggle('cat')}
                className="col-cat py-3.5 px-3 w-28 text-center cursor-pointer hover:text-[var(--accent-blue)] transition"
                title={isUrdu ? 'کیٹیگری' : 'Category'}
              >
                <span className="inline-flex items-center gap-1">
                  <span>{isUrdu ? 'کیٹیگری' : 'Category'}</span>
                  {renderSortIndicator('cat')}
                </span>
              </th>

              <th
                onClick={() => onSortToggle('rate')}
                className="col-rate py-3.5 px-3 w-24 text-center cursor-pointer hover:text-[var(--accent-blue)] transition"
                title={isUrdu ? 'بنیادی ریٹ' : 'Base Rate'}
              >
                <span className="inline-flex items-center gap-1">
                  <span>{isUrdu ? 'بنیادی ریٹ (ایڈٹ)' : 'Base Rate'}</span>
                  {renderSortIndicator('rate')}
                </span>
              </th>

              <th
                onClick={() => onSortToggle('stock')}
                className="col-stock py-3.5 px-3 w-24 text-center cursor-pointer hover:text-[var(--accent-blue)] transition"
                title={isUrdu ? 'موجودہ اسٹاک' : 'Current Stock'}
              >
                <span className="inline-flex items-center gap-1">
                  <span>{isUrdu ? 'موجودہ اسٹاک' : 'Stock'}</span>
                  {renderSortIndicator('stock')}
                </span>
              </th>

              <th
                onClick={() => onSortToggle('demand')}
                className="col-demand py-3.5 px-3 w-28 text-center bg-blue-500/10 text-[var(--accent-blue)] cursor-pointer hover:bg-blue-500/15 transition"
                title={isUrdu ? 'ڈیمانڈ مع (*)' : 'Demand with (*)'}
              >
                <span className="inline-flex items-center gap-1 font-bold">
                  <span>{isUrdu ? 'ڈیمانڈ (ایڈٹ)' : 'Demand (*)'}</span>
                  {renderSortIndicator('demand')}
                </span>
              </th>

              <th
                onClick={() => onSortToggle('cost')}
                className="col-cost py-3.5 px-3 w-28 text-center cursor-pointer hover:text-[var(--accent-blue)] transition"
                title={isUrdu ? 'متوقع رقم' : 'Projected Cost'}
              >
                <span className="inline-flex items-center gap-1">
                  <span>{isUrdu ? 'متوقع رقم (PKR)' : 'Projected Cost'}</span>
                  {renderSortIndicator('cost')}
                </span>
              </th>

              <th className="col-status py-3.5 px-3 min-w-[170px] text-center">
                {isUrdu ? 'کیفیت (ڈراپ ڈاؤن)' : 'Status (Dropdown)'}
              </th>

              <th className="py-3.5 px-2 w-14 text-center no-print">
                {isUrdu ? 'حذف' : 'Action'}
              </th>
            </tr>
          </thead>

          <tbody id="tableBody" className="divide-y divide-black/5 dark:divide-white/5">
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-[var(--text-secondary)] font-semibold text-sm">
                  {isUrdu ? 'کوئی آئٹم نہیں ملا' : 'No items match your filter'}
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const itemDemand = Number(item.demand) || 0;
                const itemRate = Number(item.rate) || 0;
                const lineTotal = itemDemand * itemRate;
                const isDemanded = itemDemand > 0;
                const parsedStock = parseStockValue(item.stock);
                const isCriticalStock = item.stock !== '' && item.stock !== '0' && parsedStock <= 5;

                // Ensure current status is available in dropdown options
                const availableStatuses = Array.from(
                  new Set(item.status ? [item.status, ...STATUS_PRESETS] : STATUS_PRESETS)
                );

                return (
                  <tr
                    key={item.id}
                    className={`neu-table-row ${isDemanded ? 'demanded' : ''}`}
                  >
                    <td className="col-id py-2.5 px-3 text-center text-[var(--text-secondary)] font-mono text-xs">
                      {item.id}
                    </td>

                    {/* 1. نام (Editable Field) */}
                    <td className="col-name py-2 px-3">
                      <div className="flex items-center gap-2">
                        {isDemanded ? (
                          <span className="text-amber-500 font-bold text-sm leading-none" title="ترجیحی آرڈر">
                            ★
                          </span>
                        ) : (
                          <span className="text-transparent text-sm leading-none">★</span>
                        )}
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => onUpdateCell(item.id, 'name', e.target.value)}
                          className="w-full bg-transparent hover:neu-inset focus:neu-inset px-2 py-1 rounded-xl transition text-xs md:text-sm font-semibold text-[var(--text-main)]"
                        />
                      </div>
                    </td>

                    {/* کیٹیگری */}
                    <td className="col-cat py-2 px-2 text-center">
                      <select
                        value={item.cat}
                        onChange={(e) => onUpdateCell(item.id, 'cat', e.target.value)}
                        className="text-[11px] px-2.5 py-1 rounded-full neu-inset text-[var(--text-main)] cursor-pointer font-medium border-none outline-hidden bg-[var(--bg-canvas)]"
                      >
                        <option value="شالمی">شالمی</option>
                        <option value="کاشف صاحب">کاشف صاحب</option>
                        <option value="دیگر">دیگر</option>
                      </select>
                    </td>

                    {/* 2. بنیادی ریٹ (Editable Field for Admin / Super Admin) */}
                    <td className="col-rate py-2 px-2 text-center">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={item.rate === 0 ? '' : item.rate}
                        placeholder="0"
                        disabled={!canEditRates}
                        readOnly={!canEditRates}
                        title={
                          !canEditRates
                            ? isUrdu
                              ? 'ریٹ تبدیل کرنے کی اجازت صرف ایڈمن یا سپر ایڈمن کو ہے'
                              : 'Rates can only be edited by Admin or Super Admin'
                            : undefined
                        }
                        onChange={(e) =>
                          onUpdateCell(
                            item.id,
                            'rate',
                            e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                          )
                        }
                        className={`w-20 text-center font-mono font-bold px-1.5 py-1 rounded-xl transition text-xs ${
                          !canEditRates
                            ? 'cursor-not-allowed opacity-75 bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] select-none'
                            : 'bg-transparent hover:neu-inset focus:neu-inset text-[var(--text-main)]'
                        }`}
                      />
                    </td>

                    {/* اسٹاک (Empty by default with "0" placeholder) */}
                    <td className="col-stock py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.stock === '0' || !item.stock ? '' : item.stock}
                        placeholder="0"
                        onChange={(e) => onUpdateCell(item.id, 'stock', e.target.value)}
                        className={`w-20 text-center font-mono ${
                          isCriticalStock ? 'text-rose-500 font-extrabold neu-inset' : 'text-[var(--text-main)]'
                        } hover:neu-inset focus:neu-inset px-1.5 py-1 rounded-xl transition text-xs bg-transparent`}
                      />
                    </td>

                    {/* 3. ڈیمانڈ (Editable, empty by default with "0" placeholder) */}
                    <td className="col-demand py-2 px-2 text-center bg-blue-500/5">
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
                        className={`w-20 text-center font-mono font-extrabold ${
                          isDemanded ? 'neu-inset text-[var(--accent-blue)]' : 'bg-transparent text-[var(--text-secondary)]'
                        } hover:neu-inset focus:neu-inset px-1.5 py-1 rounded-xl transition text-xs`}
                      />
                    </td>

                    {/* متوقع رقم */}
                    <td className={`col-cost py-2.5 px-3 text-center font-mono ${
                      isDemanded ? 'font-bold text-emerald-500' : 'text-[var(--text-secondary)]'
                    }`}>
                      {lineTotal > 0 ? Math.round(lineTotal).toLocaleString() : '0'}
                    </td>

                    {/* 4. کیفیت (Dropdown Cell showing preset values to choose from) */}
                    <td className="col-status py-2 px-3 text-center">
                      <select
                        value={item.status || 'اسٹاک دستیاب ہے'}
                        onChange={(e) => onUpdateCell(item.id, 'status', e.target.value)}
                        className="w-full text-[11px] px-2.5 py-1.5 rounded-xl neu-inset text-[var(--text-main)] cursor-pointer font-medium border-none outline-hidden bg-[var(--bg-canvas)] truncate"
                      >
                        {availableStatuses.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Delete action */}
                    <td className="py-2.5 px-2 text-center no-print">
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        title={isUrdu ? 'آئٹم حذف کریں' : 'Delete item'}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-xl neu-btn text-[var(--text-secondary)] hover:text-rose-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          <tfoot>
            <tr className="neu-inset font-bold text-sm text-[var(--text-main)]">
              <td colSpan={5} className="py-3.5 px-4 text-left font-semibold">
                {isUrdu ? 'مجموعی میزانیہ (Grand Total):' : 'Grand Total:'}
              </td>
              <td id="footerTotalUnits" className="col-demand py-3.5 px-3 text-center text-[var(--accent-blue)] font-extrabold">
                {totalUnits} {isUrdu ? 'پیس' : 'pcs'}
              </td>
              <td id="footerTotalCost" className="col-cost py-3.5 px-3 text-center text-emerald-500 font-extrabold">
                Rs {Math.round(totalBudget).toLocaleString()}
              </td>
              <td id="footerTotalSummary" className="col-status py-3.5 px-4 text-xs text-[var(--text-secondary)]" colSpan={2}>
                {demandedCount} {isUrdu ? 'ترجیحی آئٹمز' : 'Priority items'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
