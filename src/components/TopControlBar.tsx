import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  RotateCcw, 
  RotateCw, 
  Save, 
  Trash2, 
  Printer, 
  FileSpreadsheet, 
  ChevronDown, 
  Sliders, 
  PieChart, 
  Check, 
  MessageSquare,
  Sun,
  Moon,
  Eraser,
  Sparkles,
  RefreshCw,
  Menu,
  MoreVertical,
  FileText,
  History,
  Home,
  Bell,
  User
} from 'lucide-react';
import { Language, Theme, PrimaryNavTab, UserRole } from '../types';
import { DEFAULT_MASTER_ITEMS } from '../data/masterItems';

interface TopControlBarProps {
  theme: Theme;
  onToggleTheme: (theme: Theme) => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onOpenAddItem: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSaveManual: () => void;
  onPromptRevoke: () => void;
  onResetToZeroPlaceholders: () => void;
  onOpenSwiper?: () => void;
  onExportExcel: () => void;
  onCopyWhatsApp: () => void;
  onExecutePdfPrint: (options: { showDashboard: boolean; visibleCols: Record<string, boolean> }) => void;
  onOpenBackupUpdate?: () => void;
  onOpenMobileMenu?: () => void;
  canAddItem?: boolean;
  userRole?: UserRole;
  activeTab?: PrimaryNavTab;
  onSelectTab?: (tab: PrimaryNavTab) => void;
  unreadNotificationsCount?: number;
}

export const TopControlBar: React.FC<TopControlBarProps> = ({
  theme,
  onToggleTheme,
  language,
  onToggleLanguage,
  onOpenAddItem,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSaveManual,
  onPromptRevoke,
  onResetToZeroPlaceholders,
  onOpenSwiper,
  onExportExcel,
  onCopyWhatsApp,
  onExecutePdfPrint,
  onOpenBackupUpdate,
  onOpenMobileMenu,
  canAddItem = true,
  userRole = 'buyer',
  activeTab = 'home',
  onSelectTab,
  unreadNotificationsCount = 0
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isEditSubOpen, setIsEditSubOpen] = useState(false);
  const [isPdfSubOpen, setIsPdfSubOpen] = useState(false);

  // Determine authorized capabilities based on role
  const isAdminOrSuperAdmin = userRole === 'admin' || userRole === 'superadmin';
  const showAddItem = canAddItem && isAdminOrSuperAdmin;
  const showBackupUpdate = isAdminOrSuperAdmin && !!onOpenBackupUpdate;
  const showDestructiveEdits = isAdminOrSuperAdmin;

  // Calculate dynamic operations count for current user role
  let opsCount = 3; // Edit, PDF, Excel, WhatsApp
  if (showAddItem) opsCount += 1;
  if (showBackupUpdate) opsCount += 1;
  // plus WhatsApp makes 4 base + optional = total operations
  const totalOperations = (showAddItem ? 1 : 0) + 1 + (showBackupUpdate ? 1 : 0) + 3; // Edit + PDF + Excel + WA

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

  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrintClick = () => {
    setIsActionsOpen(false);
    onExecutePdfPrint({
      showDashboard: pdfShowDashboard,
      visibleCols: pdfCols
    });
  };

  const isUrdu = language === 'ur';

  return (
    <header className="neu-raised-lg rounded-3xl p-4 sm:p-6 transition-all no-print">
      {/* Top Utility Strip - In Urdu view (RTL), Navigation Triple Dot is on the Right */}
      <div 
        className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-black/5 dark:border-white/10" 
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        {/* Navigation Triple Dot Menu Button + Sun/Moon Theme Switcher */}
        <div className="flex items-center gap-2">
          {onOpenMobileMenu && (
            <button
              id="topNavTripleDotBtn"
              type="button"
              onClick={onOpenMobileMenu}
              className="p-2 rounded-2xl neu-raised-flat text-[var(--text-main)] hover:text-[var(--accent-blue)] active:neu-inset-sunken transition cursor-pointer flex items-center justify-center"
              title={isUrdu ? 'نیویگیشن مینو' : 'Open Navigation Menu'}
              aria-label={isUrdu ? 'نیویگیشن مینو' : 'Open Navigation Menu'}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}

          {/* Theme Switcher Toggle Button - Sun and Moon icons ONLY (no text labels) */}
          <div className="p-1 rounded-2xl flex items-center gap-1 neu-inset-sm">
            <button
              onClick={() => onToggleTheme('light')}
              className={`p-2 rounded-xl flex items-center justify-center transition cursor-pointer ${
                theme === 'light'
                  ? 'neu-btn active text-[var(--accent-blue)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
              title="Light Theme"
              aria-label="Light Theme"
            >
              <Sun className="w-4 h-4 text-amber-500" />
            </button>

            <button
              onClick={() => onToggleTheme('dark')}
              className={`p-2 rounded-xl flex items-center justify-center transition cursor-pointer ${
                theme === 'dark'
                  ? 'neu-btn active text-[var(--accent-blue)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
              title="Dark Theme"
              aria-label="Dark Theme"
            >
              <Moon className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* CENTER: Desktop Navigation Bar (Icons Only matching Mobile View) */}
        {onSelectTab && (
          <nav 
            className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl neu-inset-sm select-none"
            aria-label="Desktop Top Navigation"
          >
            {[
              { id: 'saved-orders', labelEn: 'Saved Order', labelUrdu: 'محفوظ آرڈر', icon: FileText },
              { id: 'history', labelEn: 'History', labelUrdu: 'تاریخچہ', icon: History },
              { id: 'home', labelEn: 'Home', labelUrdu: 'ہوم', icon: Home, isCenter: true },
              { id: 'notifications', labelEn: 'Notifications', labelUrdu: 'اطلاعات', icon: Bell },
              { id: 'profile', labelEn: 'Profile', labelUrdu: 'پروفائل', icon: User }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              const title = isUrdu ? tab.labelUrdu : tab.labelEn;

              if (tab.isCenter) {
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id as PrimaryNavTab)}
                    title={title}
                    aria-label={title}
                    className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer border-2 select-none ${
                      isActive
                        ? 'border-[var(--accent-blue)] bg-[var(--bg-canvas)] text-[var(--accent-blue)] shadow-[0_2px_10px_rgba(10,132,255,0.25)] scale-105 neu-raised'
                        : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--accent-blue)]/40 hover:text-[var(--accent-blue)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id as PrimaryNavTab)}
                  title={title}
                  aria-label={title}
                  className={`relative p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center select-none ${
                    isActive
                      ? 'neu-raised bg-[var(--bg-canvas)] text-[var(--accent-blue)] font-black scale-105'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={isActive ? 2.3 : 2} />
                  {tab.id === 'notifications' && unreadNotificationsCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center shadow-xs"
                    >
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Top Right: Language Switcher Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-2xl neu-inset-sm">
            <button
              onClick={() => onToggleLanguage('ur')}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                language === 'ur'
                  ? 'neu-btn-accent text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              اردو
            </button>
            <button
              onClick={() => onToggleLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition cursor-pointer ${
                language === 'en'
                  ? 'neu-btn-accent text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar Contents */}
      <div className="flex flex-col gap-4">
        {/* Title Section */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text-main)] urdu-title leading-relaxed">
            {isUrdu ? 'ڈیمانڈ شیٹ (Demand Sheet)' : 'Wholesale Demand Sheet'}
          </h1>

          {/* ACTIONS BUTTON UNDER DEMAND SHEET WITH DYNAMIC ROLE-BASED OPERATIONS */}
          <div className="pt-1.5 relative inline-block text-right rtl:text-right" ref={actionsRef}>
            <button
              id="demandSheetActionsBtn"
              type="button"
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl neu-raised-flat text-xs font-extrabold text-[var(--text-main)] hover:text-[var(--accent-blue)] active:neu-inset-sunken cursor-pointer transition-all duration-200 shadow-sm group"
              title={isUrdu ? 'ڈیمانڈ شیٹ کے اقدامات کھولیں' : 'Open Demand Sheet Actions'}
            >
              <div className="p-1 rounded-lg neu-inset-small text-[var(--accent-blue)] group-hover:scale-110 transition-transform">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs tracking-wide">
                {isUrdu ? 'اقدامات (Actions)' : 'Actions (اقدامات)'}
              </span>
              <span className="text-[10px] neu-inset-small px-2 py-0.5 rounded-full text-[var(--accent-blue)] font-mono font-bold">
                {totalOperations}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200 ${isActionsOpen ? 'rotate-180 text-[var(--accent-blue)]' : ''}`} />
            </button>

            {/* Actions Popover containing the role-permitted actions */}
            {isActionsOpen && (
              <div className="absolute left-0 rtl:right-0 rtl:left-auto mt-2 w-80 sm:w-96 rounded-3xl neu-raised-lg p-3 sm:p-4 z-40 space-y-2.5 text-xs font-medium animate-in fade-in zoom-in-95 duration-150 max-h-[75vh] overflow-y-auto scrollbar-thin shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-blue)] animate-pulse" />
                    <span className="font-black text-[13px] text-[var(--text-main)]">
                      {isUrdu ? 'ڈیمانڈ شیٹ کے اقدامات' : 'Demand Sheet Actions'}
                    </span>
                  </div>
                  <span className="text-[10px] neu-inset-sm px-2 py-0.5 rounded-full text-[var(--accent-blue)] font-bold">
                    {isUrdu ? `${totalOperations} مجاز اقدامات` : `${totalOperations} Operations`}
                  </span>
                </div>

                {/* 1. نیا آئٹم (Only visible for Admin & Super Admin; disappears for Buyer) */}
                {showAddItem && (
                  <button
                    onClick={() => {
                      onOpenAddItem();
                      setIsActionsOpen(false);
                    }}
                    className="w-full text-right rtl:text-right px-3.5 py-2.5 rounded-2xl neu-btn flex items-center justify-between transition-all cursor-pointer text-[var(--text-main)] hover:text-emerald-500 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl neu-inset-sm flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-left rtl:text-right">
                        <span className="font-extrabold text-xs text-[var(--text-main)] group-hover:text-emerald-500">
                          {isUrdu ? 'نیا آئٹم شامل کریں' : 'New Item (نیا آئٹم)'}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          {isUrdu ? 'نئی پروڈکٹ کیٹلاگ میں شامل کریں' : 'Add new wholesale item to catalog'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] neu-inset-sm px-2 py-0.5 rounded-md font-bold text-emerald-500">
                      + Add
                    </span>
                  </button>
                )}

                {/* 2. ترمیم (Edit Operations) */}
                <div className="rounded-2xl neu-inset-sm p-2 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditSubOpen(!isEditSubOpen)}
                    className="w-full text-right rtl:text-right px-2 py-1.5 rounded-xl flex items-center justify-between cursor-pointer text-[var(--text-main)] hover:text-[var(--accent-blue)]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl neu-raised-flat flex items-center justify-center text-[var(--accent-blue)]">
                        <Edit3 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col text-left rtl:text-right">
                        <span className="font-extrabold text-xs">
                          {isUrdu ? 'ترمیم و تدوین' : 'Edit (ترمیم)'}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          {isUrdu ? 'واپس، محفوظ، یا دوبارہ کریں' : 'Undo, redo, save changes'}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isEditSubOpen ? 'rotate-180 text-[var(--accent-blue)]' : ''}`} />
                  </button>

                  {isEditSubOpen && (
                    <div className="pt-1.5 pl-1 pr-1 space-y-1.5 animate-in fade-in duration-150 border-t border-black/5 dark:border-white/10">
                      <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className={`w-full text-right rtl:text-right px-3 py-1.5 rounded-xl neu-btn text-[var(--text-main)] flex items-center justify-between ${
                          !canUndo ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <RotateCcw className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                          <span>{isUrdu ? 'پچھلا عمل واپس لائیں (Undo)' : 'Undo Action'}</span>
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-mono">Ctrl+Z</span>
                      </button>

                      <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className={`w-full text-right rtl:text-right px-3 py-1.5 rounded-xl neu-btn text-[var(--text-main)] flex items-center justify-between ${
                          !canRedo ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <RotateCw className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                          <span>{isUrdu ? 'دوبارہ کریں (Redo)' : 'Redo Action'}</span>
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-mono">Ctrl+Y</span>
                      </button>

                      <button
                        onClick={onSaveManual}
                        className="w-full text-right rtl:text-right px-3 py-1.5 rounded-xl neu-btn text-emerald-500 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Save className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{isUrdu ? 'تبدیلیاں محفوظ کریں (Save)' : 'Save Changes'}</span>
                        </span>
                        <Check className="w-3 h-3 text-emerald-500" />
                      </button>

                      {/* Destructive actions: Disappear for Buyers, appear automatically for Admin/Superadmin */}
                      {showDestructiveEdits && (
                        <>
                          <button
                            onClick={() => {
                              onResetToZeroPlaceholders();
                              setIsActionsOpen(false);
                            }}
                            className="w-full text-right rtl:text-right px-3 py-1.5 rounded-xl neu-btn text-amber-600 dark:text-amber-400 flex items-center justify-between cursor-pointer hover:text-amber-500"
                          >
                            <span className="flex items-center gap-2">
                              <Eraser className="w-3.5 h-3.5 text-amber-500" />
                              <span>{isUrdu ? 'اسٹاک، ڈیمانڈ و کیفیت صفر کریں' : 'Reset Stock, Demand & Status (0)'}</span>
                            </span>
                            <span className="text-[10px] neu-inset-sm px-1.5 py-0.5 rounded-full text-amber-500 font-mono font-bold">0</span>
                          </button>

                          <button
                            onClick={() => {
                              onPromptRevoke();
                              setIsActionsOpen(false);
                            }}
                            className="w-full text-right rtl:text-right px-3 py-1.5 rounded-xl neu-btn text-rose-500 flex items-center justify-between cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>{isUrdu ? 'اصل لسٹ پر بحال کریں (Revoke)' : 'Revoke to Default'}</span>
                            </span>
                            <span className="text-[10px] text-rose-500">{DEFAULT_MASTER_ITEMS.length} items</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. اپ ڈیٹ و بیک اپ (Only visible for Admin/Superadmin, disappears for Buyer) */}
                {showBackupUpdate && (
                  <button
                    onClick={() => {
                      if (onOpenBackupUpdate) {
                        onOpenBackupUpdate();
                        setIsActionsOpen(false);
                      }
                    }}
                    className="w-full text-right rtl:text-right px-3.5 py-2.5 rounded-2xl neu-btn text-[var(--text-main)] hover:text-[var(--accent-blue)] flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl neu-inset-sm flex items-center justify-center text-[var(--accent-blue)] group-hover:scale-110 transition-transform">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-left rtl:text-right">
                        <span className="font-extrabold text-xs text-[var(--text-main)] group-hover:text-[var(--accent-blue)]">
                          {isUrdu ? 'اپ ڈیٹ و بیک اپ' : 'Backup & Update (بیک اپ)'}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          {isUrdu ? 'JSON فائل بیک اپ، امپورٹ و ڈیٹا بحالی' : 'Export JSON, import database & sync'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] neu-inset-sm px-2 py-0.5 rounded-md text-[var(--accent-blue)] font-mono font-bold">JSON</span>
                  </button>
                )}

                {/* PDF & Print */}
                <div className="rounded-2xl neu-inset-sm p-2 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPdfSubOpen(!isPdfSubOpen)}
                    className="w-full text-right rtl:text-right px-2 py-1.5 rounded-xl flex items-center justify-between cursor-pointer text-[var(--text-main)] hover:text-indigo-500"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl neu-raised-flat flex items-center justify-center text-indigo-500">
                        <Printer className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col text-left rtl:text-right">
                        <span className="font-extrabold text-xs">
                          {isUrdu ? 'پی ڈی ایف و پرنٹ' : 'PDF & Print (پی ڈی ایف)'}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          {isUrdu ? 'پرنٹ ترتیبات، کالموں کا انتخاب' : 'Print & column customization'}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isPdfSubOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                  </button>

                  {isPdfSubOpen && (
                    <div className="pt-2 pl-1 pr-1 space-y-2 animate-in fade-in duration-150 border-t border-black/5 dark:border-white/10">
                      {/* Toggle Dashboard summary */}
                      <div className="p-2 rounded-xl neu-raised-flat flex items-center justify-between">
                        <label 
                          htmlFor="pdfToggleDashboardActions" 
                          className="cursor-pointer font-bold text-[var(--text-main)] flex items-center gap-2 select-none"
                        >
                          <PieChart className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[11px]">
                            {isUrdu ? 'ڈیش بورڈ کارڈز شامل کریں' : 'Include Dashboard KPI Cards'}
                          </span>
                        </label>
                        <input
                          type="checkbox"
                          id="pdfToggleDashboardActions"
                          checked={pdfShowDashboard}
                          onChange={(e) => setPdfShowDashboard(e.target.checked)}
                          className="neu-checkbox"
                        />
                      </div>

                      {/* Columns Selection */}
                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold text-[var(--text-secondary)]">
                          {isUrdu ? 'پرنٹ کالمز:' : 'Select Print Columns:'}
                        </span>
                        <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto p-1">
                          {[
                            { key: 'col-id', urdu: 'نمبر شمار', en: 'ID' },
                            { key: 'col-name', urdu: 'نام آئٹم', en: 'Item Name' },
                            { key: 'col-cat', urdu: 'کیٹیگری', en: 'Category' },
                            { key: 'col-rate', urdu: 'بنیادی ریٹ', en: 'Rate' },
                            { key: 'col-stock', urdu: 'اسٹاک', en: 'Stock' },
                            { key: 'col-demand', urdu: 'ڈیمانڈ (*)', en: 'Demand (*)' },
                            { key: 'col-cost', urdu: 'رقم', en: 'Cost' },
                            { key: 'col-status', urdu: 'کیفیت', en: 'Status' }
                          ].map((col) => (
                            <label key={col.key} className="flex items-center gap-1.5 p-1 rounded-lg neu-raised-flat cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={pdfCols[col.key]}
                                onChange={(e) => setPdfCols({ ...pdfCols, [col.key]: e.target.checked })}
                                className="neu-checkbox"
                              />
                              <span className="text-[10px]">{isUrdu ? col.urdu : col.en}</span>
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

                {/* Excel Export */}
                <button
                  onClick={() => {
                    onExportExcel();
                    setIsActionsOpen(false);
                  }}
                  className="w-full text-right rtl:text-right px-3.5 py-2.5 rounded-2xl neu-btn text-[var(--text-main)] hover:text-emerald-600 flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl neu-inset-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left rtl:text-right">
                      <span className="font-extrabold text-xs text-[var(--text-main)] group-hover:text-emerald-600">
                        {isUrdu ? 'ایکسل فائل برآمد' : 'Excel Export (ایکسل)'}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {isUrdu ? 'ایکسل (.xlsx) فائل ڈاؤنلوڈ کریں' : 'Download spreadsheet file'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] neu-inset-sm px-2 py-0.5 rounded-md text-emerald-600 font-mono font-bold">.XLSX</span>
                </button>

                {/* WhatsApp Dispatch */}
                <button
                  onClick={() => {
                    onCopyWhatsApp();
                    setIsActionsOpen(false);
                  }}
                  className="w-full text-right rtl:text-right px-3.5 py-2.5 rounded-2xl neu-btn text-[var(--text-main)] hover:text-emerald-500 flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl neu-inset-sm flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left rtl:text-right">
                      <span className="font-extrabold text-xs text-[var(--text-main)] group-hover:text-emerald-500">
                        {isUrdu ? 'واٹس ایپ ڈسپیچ' : 'WhatsApp Order (واٹس ایپ)'}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {isUrdu ? 'مطلوبہ مال کا آرڈر ٹیکسٹ کاپی کریں' : 'Copy formatted demand order message'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] neu-inset-sm px-2 py-0.5 rounded-md text-emerald-500 font-bold">WA</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
