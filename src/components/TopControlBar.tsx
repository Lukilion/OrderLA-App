import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  RotateCcw, 
  RotateCw, 
  Save, 
  Trash2, 
  FileDown, 
  Printer, 
  FileSpreadsheet, 
  Share2, 
  ChevronDown, 
  Sliders, 
  PieChart, 
  Languages, 
  Check, 
  MessageSquare
} from 'lucide-react';
import { Language } from '../types';

interface TopControlBarProps {
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onOpenAddItem: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSaveManual: () => void;
  onPromptRevoke: () => void;
  onExportExcel: () => void;
  onCopyWhatsApp: () => void;
  onExecutePdfPrint: (options: { showDashboard: boolean; visibleCols: Record<string, boolean> }) => void;
}

export const TopControlBar: React.FC<TopControlBarProps> = ({
  language,
  onToggleLanguage,
  onOpenAddItem,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSaveManual,
  onPromptRevoke,
  onExportExcel,
  onCopyWhatsApp,
  onExecutePdfPrint
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  // PDF Customization state
  const [pdfShowDashboard, setPdfShowDashboard] = useState(true);
  const [pdfCols, setPdfCols] = useState<Record<string, boolean>>({
    'col-id': true,
    'col-name': true,
    'col-cat': true,
    'col-rate': true,
    'col-stock': true,
    'col-demand': true,
    'col-cost': true,
    'col-status': true
  });

  const editRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editRef.current && !editRef.current.contains(e.target as Node)) {
        setIsEditOpen(false);
      }
      if (pdfRef.current && !pdfRef.current.contains(e.target as Node)) {
        setIsPdfOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrintClick = () => {
    setIsPdfOpen(false);
    onExecutePdfPrint({
      showDashboard: pdfShowDashboard,
      visibleCols: pdfCols
    });
  };

  const isUrdu = language === 'ur';

  return (
    <header className="neu-raised-lg rounded-3xl p-4 sm:p-6 transition-all no-print">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5">
        {/* Left / Urdu Title Section */}
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full neu-inset-sm text-xs font-semibold text-[#0A84FF] mb-2">
            <span className="w-2 h-2 rounded-full bg-[#0A84FF] animate-pulse"></span>
            <span>
              {isUrdu ? 'مانیٹرنگ، آڈٹ و ریٹ مینیجمنٹ' : 'Realtime Wholesale Audit & Demand'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#2C2E42] urdu-title leading-relaxed">
            {isUrdu ? 'ڈیمانڈ شیٹ (Demand Sheet)' : 'Wholesale Demand Sheet'}
          </h1>

          <p className="text-xs md:text-sm text-[#72768F] mt-0.5 font-medium max-w-2xl">
            {isUrdu
              ? 'اپنے مطلوبہ مال کا اندراج کریں، اسٹاک اور ڈیمانڈ کی بنیاد پر آرڈر کی منصوبہ بندی کریں، اور متوقع خریداری بجٹ کا حساب لگائیں۔'
              : 'Record inventory demands, manage wholesale rates, plan stock replenishment, and compute projected procurement budget.'}
          </p>
        </div>

        {/* Action Controls Ribbon */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full xl:w-auto">
          {/* Add Item Button */}
          <button
            onClick={onOpenAddItem}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl neu-btn-accent text-xs font-bold tracking-wide select-none cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isUrdu ? '+ نیا آئٹم' : '+ New Item'}</span>
          </button>

          {/* Edit (ترمیم) Dropdown */}
          <div className="relative inline-block text-right flex-1 sm:flex-none" ref={editRef}>
            <button
              onClick={() => {
                setIsEditOpen(!isEditOpen);
                setIsPdfOpen(false);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl neu-btn text-xs font-bold text-[#33364D] hover:text-[#0A84FF] select-none cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#0A84FF]" />
              <span>{isUrdu ? 'ترمیم (Edit)' : 'Edit'}</span>
              <ChevronDown className="w-3 h-3 text-[#72768F]" />
            </button>

            {isEditOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-60 rounded-2xl neu-raised-lg p-2 z-40 space-y-1 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onUndo();
                    setIsEditOpen(false);
                  }}
                  disabled={!canUndo}
                  className={`w-full text-right px-3 py-2 rounded-xl neu-btn text-[#33364D] flex items-center justify-between ${
                    !canUndo ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-[#0A84FF]" />
                    <span>{isUrdu ? 'پچھلا عمل واپس لائیں (Undo)' : 'Undo Action'}</span>
                  </span>
                  <span className="text-[10px] text-[#72768F]">Ctrl+Z</span>
                </button>

                <button
                  onClick={() => {
                    onRedo();
                    setIsEditOpen(false);
                  }}
                  disabled={!canRedo}
                  className={`w-full text-right px-3 py-2 rounded-xl neu-btn text-[#33364D] flex items-center justify-between ${
                    !canRedo ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <RotateCw className="w-3.5 h-3.5 text-[#0A84FF]" />
                    <span>{isUrdu ? 'دوبارہ کریں (Redo)' : 'Redo Action'}</span>
                  </span>
                  <span className="text-[10px] text-[#72768F]">Ctrl+Y</span>
                </button>

                <div className="h-px bg-[#D9D6EA] my-1"></div>

                <button
                  onClick={() => {
                    onSaveManual();
                    setIsEditOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl neu-btn text-emerald-700 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Save className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isUrdu ? 'تبدیلیاں محفوظ کریں (Save)' : 'Save Changes'}</span>
                  </span>
                  <Check className="w-3 h-3 text-emerald-600" />
                </button>

                <button
                  onClick={() => {
                    onPromptRevoke();
                    setIsEditOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 rounded-xl neu-btn text-rose-600 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>{isUrdu ? 'اصل لسٹ پر بحال کریں (Revoke)' : 'Revoke to Default'}</span>
                  </span>
                  <span className="text-[10px] text-rose-500">87 items</span>
                </button>
              </div>
            )}
          </div>

          {/* PDF / Print Settings Dropdown */}
          <div className="relative inline-block text-right flex-1 sm:flex-none" ref={pdfRef}>
            <button
              onClick={() => {
                setIsPdfOpen(!isPdfOpen);
                setIsEditOpen(false);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl neu-btn text-xs font-bold text-[#33364D] hover:text-indigo-600 select-none cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isUrdu ? 'پرنٹ / PDF سیٹنگز' : 'Print / PDF'}</span>
              <ChevronDown className="w-3 h-3 text-[#72768F]" />
            </button>

            {isPdfOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 rounded-2xl neu-raised-lg p-3.5 z-40 space-y-3 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 border-b border-[#D8D5EA]">
                  <span className="font-bold text-[#2C2E42] text-[13px] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#0A84FF]" />
                    <span>{isUrdu ? 'پی ڈی ایف کسٹمائزیشن' : 'PDF Settings'}</span>
                  </span>
                  <span className="text-[10px] neu-inset-sm px-2 py-0.5 rounded-full text-[#72768F]">
                    {isUrdu ? 'ترتیب' : 'Options'}
                  </span>
                </div>

                {/* Toggle Dashboard summary */}
                <div className="p-2 rounded-xl neu-inset-sm flex items-center justify-between">
                  <label 
                    htmlFor="pdfToggleDashboard" 
                    className="cursor-pointer font-bold text-[#33364D] flex items-center gap-2 select-none"
                  >
                    <PieChart className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px]">
                      {isUrdu ? 'ڈیش بورڈ خلاصہ کارڈز دکھائیں' : 'Show Dashboard KPI Cards'}
                    </span>
                  </label>
                  <input
                    type="checkbox"
                    id="pdfToggleDashboard"
                    checked={pdfShowDashboard}
                    onChange={(e) => setPdfShowDashboard(e.target.checked)}
                    className="neu-checkbox"
                  />
                </div>

                {/* Columns Selection */}
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-bold text-[#72768F]">
                    {isUrdu ? 'کالمز کا انتخاب (کون سے فیلڈز پرنٹ ہوں):' : 'Select Columns to Print:'}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto p-1">
                    {[
                      { key: 'col-id', urdu: 'نمبر شمار', en: 'ID' },
                      { key: 'col-name', urdu: 'نام آئٹم', en: 'Item Name' },
                      { key: 'col-cat', urdu: 'کیٹیگری', en: 'Category' },
                      { key: 'col-rate', urdu: 'بنیادی ریٹ', en: 'Rate' },
                      { key: 'col-stock', urdu: 'موجودہ اسٹاک', en: 'Stock' },
                      { key: 'col-demand', urdu: 'ڈیمانڈ (*)', en: 'Demand (*)' },
                      { key: 'col-cost', urdu: 'متوقع رقم', en: 'Projected Cost' },
                      { key: 'col-status', urdu: 'اسٹیٹس / کیفیت', en: 'Status' }
                    ].map((col) => (
                      <label key={col.key} className="flex items-center gap-2 p-1.5 rounded-lg neu-inset-sm cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={pdfCols[col.key]}
                          onChange={(e) => setPdfCols({ ...pdfCols, [col.key]: e.target.checked })}
                          className="neu-checkbox"
                        />
                        <span className="text-[11px]">{isUrdu ? col.urdu : col.en}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Execute Print */}
                <button
                  onClick={handlePrintClick}
                  className="w-full py-2 rounded-xl neu-btn-accent text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'PDF تیار / پرنٹ کریں' : 'Generate PDF / Print'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Excel Export Button */}
          <button
            onClick={onExportExcel}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl neu-btn text-xs font-semibold text-[#2C2E42] hover:text-emerald-600 select-none cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isUrdu ? 'ایکسل (.xlsx)' : 'Excel (.xlsx)'}</span>
          </button>

          {/* WhatsApp Copy Button */}
          <button
            onClick={onCopyWhatsApp}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl neu-btn text-xs font-semibold text-[#2C2E42] hover:text-emerald-600 select-none cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isUrdu ? 'واٹس ایپ لسٹ' : 'WhatsApp'}</span>
          </button>

          {/* Language Switcher Pill */}
          <div className="flex items-center p-1 rounded-2xl neu-inset-sm">
            <button
              onClick={() => onToggleLanguage('ur')}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition ${
                language === 'ur'
                  ? 'neu-btn-accent text-white'
                  : 'text-[#72768F] hover:text-[#33364D]'
              }`}
            >
              اردو
            </button>
            <button
              onClick={() => onToggleLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition ${
                language === 'en'
                  ? 'neu-btn-accent text-white'
                  : 'text-[#72768F] hover:text-[#33364D]'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
