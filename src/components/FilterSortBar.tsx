import React, { useState, useRef, useEffect } from 'react';
import { 
  Filter, 
  ArrowDownWideNarrow, 
  RotateCcw, 
  Search, 
  Star, 
  AlertTriangle, 
  ChevronDown, 
  Info, 
  ArrowUpDown, 
  ListOrdered 
} from 'lucide-react';
import { FilterType, SortKey, SortDirection, Language } from '../types';

interface FilterSortBarProps {
  filter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSelectSort: (key: SortKey, dir: SortDirection) => void;
  onReset: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  language: Language;
  counts: {
    all: number;
    demand: number;
    lowStock: number;
    shalmi: number;
    kashif: number;
  };
}

export const FilterSortBar: React.FC<FilterSortBarProps> = ({
  filter,
  onSelectFilter,
  sortKey,
  sortDirection,
  onSelectSort,
  onReset,
  searchQuery,
  onSearchChange,
  language,
  counts
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isUrdu = language === 'ur';

  const filterLabels: Record<FilterType, { ur: string; en: string }> = {
    all: { ur: 'سبھی آئٹمز', en: 'All Items' },
    demand: { ur: 'صرف ڈیمانڈ والے (*)', en: 'Demanded Only (*)' },
    lowstock: { ur: 'کم اسٹاک (≤ 5 پیس)', en: 'Low Stock (≤ 5 pcs)' },
    shalmi: { ur: 'شالمی ہول سیل', en: 'Shalmi Market' },
    kashif: { ur: 'کاشف صاحب ہول سیل', en: 'Kashif Wholesale' }
  };

  const getSortLabel = (): string => {
    if (sortKey === 'id') return isUrdu ? 'اصل نمبر شمار' : 'Original ID';
    if (sortKey === 'demand') return isUrdu ? 'ڈیمانڈ (زیادہ مانگ)' : 'Demand (High)';
    if (sortKey === 'stock') return isUrdu ? 'اسٹاک (کم ترین)' : 'Stock (Lowest)';
    if (sortKey === 'cost') return isUrdu ? 'بجٹ لاگت (زیادہ)' : 'Cost (Highest)';
    if (sortKey === 'rate') return isUrdu ? 'ریٹ (مہنگے سے سستا)' : 'Rate (High-Low)';
    if (sortKey === 'name') return isUrdu ? 'نام آئٹم (الف تا ے)' : 'Name (A-Z)';
    return isUrdu ? 'ترتیب' : 'Sort';
  };

  return (
    <div className="neu-raised rounded-3xl p-4 sm:p-5 no-print space-y-3.5">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        {/* Dropdowns Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Filter Dropdown */}
          <div className="relative inline-block text-right flex-1 sm:flex-none" ref={filterRef}>
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
              }}
              className="w-full inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-2xl neu-btn text-xs font-bold text-[var(--text-main)] select-none cursor-pointer"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Filter className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                <span>{isUrdu ? 'فلٹر:' : 'Filter:'}</span>
                <span className="text-[var(--accent-blue)] font-semibold truncate">
                  {isUrdu ? filterLabels[filter].ur : filterLabels[filter].en}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl neu-raised-lg p-2 z-30 space-y-1 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onSelectFilter('all');
                    setIsFilterOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl neu-btn text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                >
                  <span>{isUrdu ? 'سبھی آئٹمز (تمام اشیاء)' : 'All Items'}</span>
                  <span className="text-[10px] neu-inset-sm px-2 py-0.5 rounded-full text-[var(--accent-blue)]">
                    {counts.all}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onSelectFilter('demand');
                    setIsFilterOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl neu-btn text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{isUrdu ? 'صرف ڈیمانڈ والے (*)' : 'Demanded Only (*)'}</span>
                  </span>
                  <span className="text-[10px] neu-inset-sm px-2 py-0.5 rounded-full text-amber-500 font-bold">
                    {counts.demand}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onSelectFilter('lowstock');
                    setIsFilterOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl neu-btn text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{isUrdu ? 'کم اسٹاک (≤ 5 پیس)' : 'Low Stock (≤ 5 pcs)'}</span>
                  </span>
                  <span className="text-[10px] neu-inset-sm px-2 py-0.5 rounded-full text-rose-500 font-bold">
                    {counts.lowStock}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onSelectFilter('shalmi');
                    setIsFilterOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl neu-btn text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                >
                  <span>{isUrdu ? 'شالمی ہول سیل مارکیٹ' : 'Shalmi Wholesale'}</span>
                  <span className="text-[10px] neu-inset-sm px-2 py-0.5 rounded-full text-[var(--text-secondary)]">
                    {counts.shalmi}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onSelectFilter('kashif');
                    setIsFilterOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl neu-btn text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                >
                  <span>{isUrdu ? 'کاشف صاحب ہول سیل' : 'Kashif Wholesale'}</span>
                  <span className="text-[10px] neu-inset-sm px-2 py-0.5 rounded-full text-[var(--text-secondary)]">
                    {counts.kashif}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Sorting Dropdown */}
          <div className="relative inline-block text-right flex-1 sm:flex-none" ref={sortRef}>
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsFilterOpen(false);
              }}
              className="w-full inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-2xl neu-btn text-xs font-bold text-[var(--text-main)] select-none cursor-pointer"
            >
              <div className="flex items-center gap-1.5 truncate">
                <ArrowDownWideNarrow className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                <span>{isUrdu ? 'ترتیب:' : 'Sort:'}</span>
                <span className="text-[var(--accent-blue)] font-semibold truncate max-w-[120px] sm:max-w-[160px]">
                  {getSortLabel()}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl neu-raised-lg p-2 z-30 space-y-1 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onSelectSort('id', 'asc');
                    setIsSortOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl neu-btn text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                >
                  <span>{isUrdu ? 'اصل نمبر شمار (1 تا 87)' : 'Original ID (1-87)'}</span>
                  <ListOrdered className="w-3 h-3 text-[var(--text-secondary)]" />
                </button>

                <button
                  onClick={() => {
                    onSelectSort('demand', 'desc');
                    setIsSortOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl neu-btn text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                >
                  <span>{isUrdu ? 'ڈیمانڈ (زیادہ مانگ پہلے)' : 'Demand (Highest First)'}</span>
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                </button>

                <button
                  onClick={() => {
                    onSelectSort('stock', 'asc');
                    setIsSortOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl neu-btn text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                >
                  <span>{isUrdu ? 'اسٹاک (ختم ہونے والا پہلے)' : 'Stock (Lowest First)'}</span>
                  <AlertTriangle className="w-3 h-3 text-rose-500" />
                </button>

                <button
                  onClick={() => {
                    onSelectSort('cost', 'desc');
                    setIsSortOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl neu-btn text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                >
                  <span>{isUrdu ? 'بجٹ رقم (زیادہ لاگت پہلے)' : 'Projected Cost (Highest)'}</span>
                  <span className="text-[10px] text-emerald-500 font-bold">PKR</span>
                </button>

                <button
                  onClick={() => {
                    onSelectSort('rate', 'desc');
                    setIsSortOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl neu-btn text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                >
                  <span>{isUrdu ? 'بنیادی ریٹ (مہنگے سے سستا)' : 'Rate (High to Low)'}</span>
                  <ArrowUpDown className="w-3 h-3 text-[var(--text-secondary)]" />
                </button>

                <button
                  onClick={() => {
                    onSelectSort('name', 'asc');
                    setIsSortOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl neu-btn text-[var(--text-main)] flex items-center justify-between cursor-pointer"
                >
                  <span>{isUrdu ? 'نام آئٹم (حروفِ تہجی الف تا ے)' : 'Item Name (A to Z)'}</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">A-Z</span>
                </button>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="p-2.5 rounded-2xl neu-btn text-[var(--text-secondary)] hover:text-[var(--accent-blue)] select-none cursor-pointer"
            title={isUrdu ? 'ترتیب و فلٹر ری سیٹ کریں' : 'Reset Filters & Sorting'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-3.5 h-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isUrdu ? 'آئٹم کا نام، کیٹیگری یا اسٹیٹس تلاش کریں...' : 'Search item name, category or status...'}
            className="w-full pr-10 pl-4 py-2.5 text-xs rounded-2xl neu-input text-right"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Quick Info Strip */}
      <div className="flex items-center justify-between pt-1.5 text-[11px] text-[var(--text-secondary)] font-medium border-t border-black/5 dark:border-white/10">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
          <span>
            {isUrdu 
              ? 'نام، ریٹ اور ڈیمانڈ براہِ راست ایڈٹ کریں۔ کیفیت کے لیے ڈراپ ڈاؤن سے انتخاب کریں۔' 
              : 'Directly edit Name, Rate and Demand. Select Status from presets dropdown.'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>{isUrdu ? 'ڈیمانڈ مع (*)' : 'Demand with (*)'}</span>
        </div>
      </div>
    </div>
  );
};
