import React, { useState } from 'react';
import { 
  AuditHistoryEntry, 
  Language 
} from '../types';
import { 
  getAuditHistory, 
  clearAuditHistory 
} from '../utils/historyManager';
import { 
  History, 
  Clock, 
  Search, 
  Trash2, 
  Filter, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  FileSpreadsheet, 
  MessageSquare, 
  RefreshCw 
} from 'lucide-react';

interface HistoryViewProps {
  language: Language;
  onToast: (msg: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  language,
  onToast
}) => {
  const [historyList, setHistoryList] = useState<AuditHistoryEntry[]>(() => getAuditHistory());
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isUrdu = language === 'ur';

  const filteredHistory = historyList.filter((entry) => {
    if (filterType !== 'all' && entry.actionType !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc =
        entry.descriptionEn.toLowerCase().includes(q) ||
        entry.descriptionUrdu.toLowerCase().includes(q);
      const matchItem = entry.affectedItem?.toLowerCase().includes(q);
      const matchUser = entry.userName.toLowerCase().includes(q);
      return matchDesc || matchItem || matchUser;
    }
    return true;
  });

  const handleClearHistory = () => {
    if (
      window.confirm(
        isUrdu
          ? 'کیا آپ واقعی مکمل ہسٹری لاگ صاف کرنا چاہتے ہیں؟'
          : 'Are you sure you want to clear all audit history records?'
      )
    ) {
      clearAuditHistory();
      setHistoryList([]);
      onToast(isUrdu ? 'ہسٹری صاف کر دی گئی ہے' : 'Audit history cleared');
    }
  };

  const getActionBadge = (actionType: AuditHistoryEntry['actionType']) => {
    switch (actionType) {
      case 'demand_change':
        return {
          icon: <TrendingUp className="w-3.5 h-3.5 text-blue-500" />,
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
          label: isUrdu ? 'طلب میں تبدیلی' : 'Demand Update'
        };
      case 'rate_change':
        return {
          icon: <DollarSign className="w-3.5 h-3.5 text-emerald-500" />,
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
          label: isUrdu ? 'ریٹ تبدیلی' : 'Rate Edit'
        };
      case 'whatsapp_share':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-green-500" />,
          color: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
          label: isUrdu ? 'واٹس ایپ ترسیل' : 'WhatsApp Share'
        };
      case 'export_excel':
        return {
          icon: <FileSpreadsheet className="w-3.5 h-3.5 text-teal-500" />,
          color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
          label: isUrdu ? 'ایکسل ایکسپورٹ' : 'Excel Export'
        };
      case 'reset':
      case 'revoke':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-amber-500" />,
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
          label: isUrdu ? 'ری سیٹ / تنسیخ' : 'Sheet Reset'
        };
      default:
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />,
          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
          label: isUrdu ? 'سسٹم ایکشن' : 'System Event'
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neu-raised-lg rounded-3xl p-5 sm:p-6 bg-[var(--bg-canvas)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl neu-inset-sm flex items-center justify-center text-[var(--accent-blue)]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-main)] urdu-title">
              {isUrdu ? 'آپریشنز و تبدیلیوں کی تاریخچہ (Audit History)' : 'Operations & Audit History'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {isUrdu
                ? 'ڈیمانڈ، ریٹس، برآمدات اور آرڈرز کی تمام تبدیلیوں کا مکمل ٹائم لائن لاگ'
                : 'Complete chronological audit log of demand adjustments, wholesale rates, and dispatches'}
            </p>
          </div>
        </div>

        {historyList.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl neu-btn text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'ہسٹری لاگ صاف کریں' : 'Clear History'}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="neu-raised rounded-2xl p-4 bg-[var(--bg-canvas)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'آئٹم کا نام یا صارف تلاش کریں...' : 'Search by item or user...'}
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 rounded-xl neu-inset-sm text-xs bg-transparent outline-none text-[var(--text-main)]"
          />
        </div>

        {/* Action Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', labelEn: 'All Events', labelUrdu: 'تمام سرگرمیاں' },
            { id: 'demand_change', labelEn: 'Demands', labelUrdu: 'ڈیمانڈز' },
            { id: 'rate_change', labelEn: 'Rates', labelUrdu: 'ریٹس' },
            { id: 'whatsapp_share', labelEn: 'Dispatches', labelUrdu: 'ترسیلات' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                filterType === item.id
                  ? 'neu-btn-accent text-white shadow-xs'
                  : 'neu-btn text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              {isUrdu ? item.labelUrdu : item.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="neu-raised-lg rounded-3xl p-10 text-center space-y-2 bg-[var(--bg-canvas)]">
            <Clock className="w-10 h-10 mx-auto text-[var(--text-secondary)]" />
            <h3 className="text-sm font-bold text-[var(--text-main)]">
              {isUrdu ? 'کوئی لاگ ریکارڈ نہیں ملا' : 'No Audit Records Found'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isUrdu
                ? 'جب آپ شیٹ میں ترمیم یا ڈیمانڈ تبدیل کریں گے تو یہاں ریکارڈ محفوظ ہوگا۔'
                : 'Actions performed across the OS will automatically appear in this timeline.'}
            </p>
          </div>
        ) : (
          filteredHistory.map((entry) => {
            const badge = getActionBadge(entry.actionType);

            return (
              <div
                key={entry.id}
                className="neu-raised rounded-2xl p-4 sm:p-5 bg-[var(--bg-canvas)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl neu-inset-sm shrink-0">
                    {badge.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-bold text-[var(--text-main)]">
                        {isUrdu ? entry.descriptionUrdu : entry.descriptionEn}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-secondary)] font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {entry.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-[var(--accent-blue)]">
                        {entry.userName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Values change / Detail pill */}
                {(entry.oldValue !== undefined || entry.newValue !== undefined) && (
                  <div className="self-end sm:self-center neu-inset-sm px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-2">
                    {entry.oldValue !== undefined && (
                      <span className="line-through text-[var(--text-secondary)] text-[11px]">
                        {entry.oldValue}
                      </span>
                    )}
                    {entry.oldValue !== undefined && entry.newValue !== undefined && (
                      <span className="text-[var(--text-secondary)]">→</span>
                    )}
                    {entry.newValue !== undefined && (
                      <span className="font-bold text-[var(--accent-blue)]">
                        {entry.newValue}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
