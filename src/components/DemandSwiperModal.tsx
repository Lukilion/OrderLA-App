import React, { useState, useRef, useEffect, useMemo } from 'react';
import { OrderLaLogo } from './OrderLaLogo';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  RotateCcw, 
  Sparkles, 
  ShoppingCart, 
  FileSpreadsheet, 
  Printer, 
  Copy, 
  Plus, 
  Minus, 
  Layers, 
  DollarSign, 
  Package, 
  ChevronRight,
  ChevronLeft,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { WholesaleItem, Language, STATUS_PRESETS } from '../types';
import { exportWholesaleExcel, generateWhatsAppOrderText } from '../utils/exportHelpers';

interface DemandSwiperModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WholesaleItem[];
  onApplyDemands: (updatedItems: WholesaleItem[]) => void;
  language: Language;
  onExportExcel?: (sessionItems: WholesaleItem[]) => void;
  onRequestWhatsApp?: (sessionItems: WholesaleItem[]) => void;
  onPrint?: () => void;
}

export const DemandSwiperModal: React.FC<DemandSwiperModalProps> = ({
  isOpen,
  onClose,
  items,
  onApplyDemands,
  language,
  onExportExcel,
  onRequestWhatsApp,
  onPrint
}) => {
  const isUrdu = language === 'ur';

  // Working items array in swiper session
  const [sessionItems, setSessionItems] = useState<WholesaleItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Quantity Dialog State
  const [isQuantityOpen, setIsQuantityOpen] = useState<boolean>(false);
  const [customQuantity, setCustomQuantity] = useState<number>(10);
  const [itemStatus, setItemStatus] = useState<string>('اسٹاک دستیاب ہے');

  // Swipe gesture & animation state
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [animatingCard, setAnimatingCard] = useState<'left' | 'right' | null>(null);

  // Copy toast in completion screen
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Initialize session whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSessionItems(JSON.parse(JSON.stringify(items)));
      setCurrentIndex(0);
      setIsCompleted(false);
      setIsQuantityOpen(false);
      setDragOffset(0);
      setAnimatingCard(null);
    }
  }, [isOpen, items]);

  // Metrics computation for session
  const sessionMetrics = useMemo(() => {
    let demandedCount = 0;
    let totalUnits = 0;
    let totalBudget = 0;
    const demandedList: WholesaleItem[] = [];

    sessionItems.forEach((item) => {
      const d = Number(item.demand) || 0;
      const r = Number(item.rate) || 0;
      if (d > 0) {
        demandedCount++;
        totalUnits += d;
        totalBudget += d * r;
        demandedList.push(item);
      }
    });

    return {
      demandedCount,
      totalUnits,
      totalBudget,
      demandedList
    };
  }, [sessionItems]);

  if (!isOpen) return null;

  const currentItem: WholesaleItem | undefined = sessionItems[currentIndex];

  // Advance to next item or complete
  const advanceNext = () => {
    if (currentIndex + 1 >= sessionItems.length) {
      setIsCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Skip item (Swipe Right) - User doesn't need the item
  const handleSkip = () => {
    setAnimatingCard('right');
    setTimeout(() => {
      // Keep demand as 0 or clear it
      setSessionItems((prev) =>
        prev.map((item, idx) => (idx === currentIndex ? { ...item, demand: 0 } : item))
      );
      setAnimatingCard(null);
      setDragOffset(0);
      advanceNext();
    }, 200);
  };

  // User Needs item (Swipe Left) - Opens Quantity Popup
  const handleOpenQuantity = () => {
    if (!currentItem) return;
    const initialQty = Number(currentItem.demand) > 0 ? Number(currentItem.demand) : 10;
    setCustomQuantity(initialQty);
    setItemStatus(currentItem.status || 'اسٹاک دستیاب ہے');
    setIsQuantityOpen(true);
  };

  // Confirm Quantity in Popup
  const handleConfirmQuantity = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const qty = Math.max(1, Number(customQuantity) || 1);

    setAnimatingCard('left');
    setIsQuantityOpen(false);

    setTimeout(() => {
      setSessionItems((prev) =>
        prev.map((item, idx) =>
          idx === currentIndex
            ? { ...item, demand: qty, status: itemStatus }
            : item
        )
      );
      setAnimatingCard(null);
      setDragOffset(0);
      advanceNext();
    }, 200);
  };

  // Adjust Quantity (+5, +10, -5, -10)
  const handleAdjustQuantity = (delta: number) => {
    setCustomQuantity((prev) => Math.max(1, (Number(prev) || 0) + delta));
  };

  // Go to Previous Item
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setDragOffset(0);
      setAnimatingCard(null);
    }
  };

  // Touch / Drag Handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Swipe Threshold: 80px
    if (dragOffset > 80) {
      // Swiped Right -> Skip
      handleSkip();
    } else if (dragOffset < -80) {
      // Swiped Left -> Need (Open Quantity Popup)
      setDragOffset(0);
      handleOpenQuantity();
    } else {
      // Spring back
      setDragOffset(0);
    }
  };

  // Apply to Main Sheet & Close
  const handleApplyAndClose = () => {
    onApplyDemands(sessionItems);
    onClose();
  };

  // Export functions
  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel(sessionItems);
    } else {
      exportWholesaleExcel(sessionItems, language);
    }
  };

  const handleCopyWhatsApp = async () => {
    if (onRequestWhatsApp) {
      onRequestWhatsApp(sessionItems);
      return;
    }
    const text = generateWhatsAppOrderText(sessionItems, language);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {
      /* ignore */
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const progressPercent = sessionItems.length > 0 
    ? Math.round(((currentIndex) / sessionItems.length) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-md">
      <div className="w-full max-w-2xl neu-raised-lg rounded-3xl p-4 sm:p-6 text-right max-h-[95vh] flex flex-col justify-between overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/5 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <OrderLaLogo variant="icon" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[var(--text-main)] urdu-title">
                  {isUrdu ? 'تیز رفتار ڈیمانڈ سوائپر' : 'Rapid Demand Swiper'}
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] font-mono">
                  OrderLa
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                {isUrdu ? 'سوائپ دائیں = چھوڑیں | سوائپ بائیں = مطلوب' : 'Swipe Right = Skip | Swipe Left = Demand'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted && (
              <button
                onClick={() => setIsCompleted(true)}
                className="px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-[var(--accent-blue)] cursor-pointer"
                title="نتائج دیکھیں"
              >
                {isUrdu ? 'مکمل کریں' : 'Finish'}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ===================== VIEW 1: ACTIVE SWIPER CARD ===================== */}
        {!isCompleted && currentItem && (
          <div className="flex-1 py-4 flex flex-col justify-between space-y-4 overflow-hidden select-none">
            {/* Progress Bar & Counter */}
            <div className="space-y-1.5 shrink-0">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <span className="text-[var(--accent-blue)]">
                    {isUrdu ? `آئٹم ${currentIndex + 1} از ${sessionItems.length}` : `Item ${currentIndex + 1} of ${sessionItems.length}`}
                  </span>
                  <span className="text-[10px] neu-inset-sm px-2 py-0.5 rounded-full text-emerald-500 font-bold">
                    {sessionMetrics.demandedCount} {isUrdu ? 'منتخب' : 'added'}
                  </span>
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full neu-inset-sm overflow-hidden p-0.5">
                <div 
                  className="h-full bg-[var(--accent-blue)] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Tactile Swiper Card Stage */}
            <div 
              className="relative flex-1 min-h-[290px] sm:min-h-[320px] flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Dynamic Left / Right Swiping Badges */}
              {dragOffset > 30 && (
                <div className="absolute top-4 right-4 z-30 px-3.5 py-1.5 rounded-2xl bg-rose-500/20 text-rose-500 border border-rose-500/30 font-black text-sm animate-in fade-in">
                  👉 {isUrdu ? 'چھوڑیں (ضرورت نہیں)' : 'SKIP'}
                </div>
              )}
              {dragOffset < -30 && (
                <div className="absolute top-4 left-4 z-30 px-3.5 py-1.5 rounded-2xl bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] border border-[var(--accent-blue)]/30 font-black text-sm animate-in fade-in">
                  👈 {isUrdu ? 'ڈیمانڈ مطلوب ہے' : 'DEMAND'}
                </div>
              )}

              {/* Main Swiping Card */}
              <div 
                className={`w-full max-w-lg neu-raised rounded-3xl p-6 sm:p-7 transition-transform duration-100 flex flex-col justify-between space-y-4 ${
                  animatingCard === 'left' ? '-translate-x-full opacity-0' :
                  animatingCard === 'right' ? 'translate-x-full opacity-0' : ''
                }`}
                style={{
                  transform: animatingCard ? undefined : `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
                  boxShadow: isDragging ? 'var(--shadow-raised-lg)' : undefined
                }}
              >
                {/* Card Header Tags */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl neu-inset-sm text-[var(--accent-blue)]">
                    #{currentItem.id}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-xl neu-btn text-[var(--text-main)]">
                    {currentItem.cat}
                  </span>
                </div>

                {/* Big Item Name */}
                <div className="text-center py-2 space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-[var(--text-main)] urdu-title leading-relaxed">
                    {currentItem.name}
                  </h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neu-inset-sm text-xs font-bold text-[var(--text-secondary)]">
                    <span>{isUrdu ? 'موجودہ اسٹاک:' : 'Current Stock:'}</span>
                    <span className="font-mono text-[var(--text-main)]">
                      {currentItem.stock !== '' ? currentItem.stock : '0'} {isUrdu ? 'پیس' : 'pcs'}
                    </span>
                  </div>
                </div>

                {/* Pricing & Demanded Indicator */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl neu-inset-sm text-center">
                    <span className="text-[11px] font-bold text-[var(--text-secondary)] block">
                      {isUrdu ? 'بنیادی ریٹ' : 'Wholesale Rate'}
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono text-[var(--text-main)]">
                      Rs {currentItem.rate}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl neu-inset-sm text-center">
                    <span className="text-[11px] font-bold text-[var(--text-secondary)] block">
                      {isUrdu ? 'ڈیمانڈ کیفیت' : 'Current Demand'}
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono text-[var(--accent-blue)]">
                      {Number(currentItem.demand) > 0 ? `*${currentItem.demand} pcs` : '0'}
                    </span>
                  </div>
                </div>

                {/* Swiping Instructions Footnote */}
                <div className="pt-2 text-center text-[11px] font-semibold text-[var(--text-secondary)] flex items-center justify-between border-t border-black/5 dark:border-white/10">
                  <span className="text-[var(--accent-blue)] font-bold">
                    👈 {isUrdu ? 'بائیں سوائپ = مطلوب' : 'Swipe Left = Need'}
                  </span>
                  <span className="text-rose-500 font-bold">
                    {isUrdu ? 'دائیں سوائپ = چھوڑیں' : 'Swipe Right = Skip'} 👉
                  </span>
                </div>
              </div>
            </div>

            {/* Tactile Control Buttons (For instant Click or Touch) */}
            <div className="shrink-0 space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-3">
                {/* Left Button: NEED ITEM (Swipe Left) */}
                <button
                  onClick={handleOpenQuantity}
                  className="py-3 px-4 rounded-2xl neu-btn-accent font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isUrdu ? '👈 مطلوب ہے (سوائپ بائیں)' : '👈 Need It (Swipe Left)'}</span>
                </button>

                {/* Right Button: SKIP (Swipe Right) */}
                <button
                  onClick={handleSkip}
                  className="py-3 px-4 rounded-2xl neu-btn font-bold text-xs sm:text-sm text-[var(--text-main)] hover:text-rose-500 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isUrdu ? 'ضرورت نہیں (سوائپ دائیں) 👉' : 'Skip (Swipe Right) 👉'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Auxiliary Bar: Previous Button & Running Stats */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-btn text-[var(--text-secondary)] ${
                    currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:text-[var(--text-main)]'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'پچھلا آئٹم' : 'Previous'}</span>
                </button>

                <div className="text-[11px] font-bold text-[var(--text-secondary)]">
                  {isUrdu ? 'متوقع خریداری رقم:' : 'Projected Budget:'}{' '}
                  <span className="text-emerald-500 font-mono font-black">
                    Rs {Math.round(sessionMetrics.totalBudget).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== VIEW 2: COMPLETION & CALCULATION SUMMARY ===================== */}
        {isCompleted && (
          <div className="flex-1 py-4 space-y-4 overflow-y-auto pr-1">
            {/* Celebration Card */}
            <div className="neu-inset-sm rounded-3xl p-5 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-3">
                <OrderLaLogo variant="badge" size="md" />
                <div className="w-10 h-10 rounded-2xl neu-raised flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[var(--text-main)] urdu-title">
                {isUrdu ? 'آرڈر لا سوائپ جائزہ مکمل ہو گیا!' : 'OrderLa Swiper Review Complete!'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium max-w-md mx-auto">
                {isUrdu
                  ? 'تمام اشیاء کی ڈیمانڈ کا حساب تیار ہے۔ آپ اسے ایکسل، پی ڈی ایف یا واٹس ایپ پر برآمد کر سکتے ہیں اور براہِ راست شیٹ پر لاگو کر سکتے ہیں۔'
                  : 'Demand calculation for all items is prepared. Export via Excel, PDF or WhatsApp, or apply directly to master sheet.'}
              </p>
            </div>

            {/* Calculations KPI Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="p-3.5 rounded-2xl neu-raised text-center">
                <span className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] block">
                  {isUrdu ? 'کل منتخب اشیاء' : 'Demanded Items'}
                </span>
                <span className="text-lg sm:text-xl font-black text-[var(--accent-blue)] font-mono">
                  {sessionMetrics.demandedCount}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl neu-raised text-center">
                <span className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] block">
                  {isUrdu ? 'کل ڈیمانڈ یونٹس' : 'Total Units'}
                </span>
                <span className="text-lg sm:text-xl font-black text-amber-500 font-mono">
                  *{sessionMetrics.totalUnits}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl neu-raised text-center">
                <span className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] block">
                  {isUrdu ? 'متوقع کل بجٹ' : 'Total Budget'}
                </span>
                <span className="text-base sm:text-lg font-black text-emerald-500 font-mono">
                  Rs {Math.round(sessionMetrics.totalBudget).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Demanded Items Quick Review List */}
            <div className="neu-raised rounded-2xl p-3 max-h-48 overflow-y-auto space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)] pb-1 border-b border-black/5 dark:border-white/10">
                <span>{isUrdu ? 'منتخب شدہ اشیاء کا خلاصہ' : 'Demanded Items Summary'}</span>
                <span>{sessionMetrics.demandedList.length} {isUrdu ? 'آئٹمز' : 'items'}</span>
              </div>

              {sessionMetrics.demandedList.length === 0 ? (
                <div className="text-center py-4 text-xs text-[var(--text-secondary)] font-medium">
                  {isUrdu ? 'کوئی ڈیمانڈ منتخب نہیں کی گئی۔' : 'No demand added in this session.'}
                </div>
              ) : (
                sessionMetrics.demandedList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-1.5 px-2 rounded-xl neu-inset-sm">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[var(--accent-blue)] font-bold">#{item.id}</span>
                      <span className="font-bold text-[var(--text-main)] truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 font-mono">
                      <span className="font-extrabold text-[var(--accent-blue)]">*{item.demand} pcs</span>
                      <span className="font-bold text-emerald-500">
                        Rs {((Number(item.demand) || 0) * (Number(item.rate) || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Export Ribbon (Exact same options as main preview) */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-[var(--text-secondary)] block">
                {isUrdu ? 'برآمدی اختیارات (Export Options):' : 'Export Options:'}
              </span>

              <div className="grid grid-cols-3 gap-2">
                {/* Print / PDF */}
                <button
                  onClick={handlePrint}
                  className="py-2.5 px-3 rounded-2xl neu-btn text-xs font-bold text-indigo-500 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PDF / Print</span>
                </button>

                {/* Excel */}
                <button
                  onClick={handleExportExcel}
                  className="py-2.5 px-3 rounded-2xl neu-btn text-xs font-bold text-emerald-500 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel (.xlsx)</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={handleCopyWhatsApp}
                  className="py-2.5 px-3 rounded-2xl neu-btn text-xs font-bold text-emerald-600 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedToast ? 'کاپی ہو گیا!' : 'WhatsApp'}</span>
                </button>
              </div>
            </div>

            {/* Final Actions */}
            <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center gap-3">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setIsCompleted(false);
                }}
                className="py-3 px-4 rounded-2xl neu-btn text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer"
              >
                {isUrdu ? 'دوبارہ شروع کریں' : 'Restart'}
              </button>

              <button
                onClick={handleApplyAndClose}
                className="flex-1 py-3 px-4 rounded-2xl neu-btn-accent text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>{isUrdu ? 'شیٹ پر لاگو کریں اور بند کریں' : 'Apply to Sheet & Close'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================== POPUP: QUANTITY ASKING MODAL ===================== */}
        {isQuantityOpen && currentItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-sm neu-raised-lg rounded-3xl p-5 sm:p-6 text-right space-y-4 animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-black/5 dark:border-white/10">
                <span className="text-xs font-bold text-[var(--accent-blue)]">
                  {isUrdu ? 'ڈیمانڈ تعداد درج کریں' : 'Specify Demand Quantity'}
                </span>
                <button
                  onClick={() => setIsQuantityOpen(false)}
                  className="w-7 h-7 rounded-xl neu-btn flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item Info */}
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm sm:text-base text-[var(--text-main)] urdu-title">
                  {currentItem.name}
                </h4>
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
                  <span>{isUrdu ? 'بنیادی ریٹ:' : 'Rate:'} Rs {currentItem.rate}</span>
                  <span className="font-bold text-emerald-500 font-mono">
                    {isUrdu ? 'لاگت:' : 'Cost:'} Rs {((Number(currentItem.rate) || 0) * (Number(customQuantity) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Custom Number Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[var(--text-secondary)]">
                  {isUrdu ? 'مطلوبہ تعداد (پیس)' : 'Required Quantity (Pcs)'}
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  autoFocus
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(Math.max(1, parseInt(e.target.value, 10) || 0))}
                  className="w-full py-3 px-4 rounded-2xl neu-input text-center text-xl font-mono font-black text-[var(--accent-blue)]"
                  placeholder="10"
                />
              </div>

              {/* Quick Stepper Buttons (-10, -5, +5, +10) */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold text-[var(--text-secondary)]">
                  {isUrdu ? 'فوری بٹن (+ / -)' : 'Quick Adjust Buttons:'}
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustQuantity(-10)}
                    className="py-2 rounded-xl neu-btn text-xs font-mono font-extrabold text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustQuantity(-5)}
                    className="py-2 rounded-xl neu-btn text-xs font-mono font-extrabold text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustQuantity(5)}
                    className="py-2 rounded-xl neu-btn text-xs font-mono font-extrabold text-[var(--accent-blue)] hover:text-blue-600 cursor-pointer"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustQuantity(10)}
                    className="py-2 rounded-xl neu-btn text-xs font-mono font-extrabold text-[var(--accent-blue)] hover:text-blue-600 cursor-pointer"
                  >
                    +10
                  </button>
                </div>
              </div>

              {/* Quality / Status Selector */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)]">
                  {isUrdu ? 'کیفیت (اسٹیٹس)' : 'Status / Remarks'}
                </label>
                <select
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl neu-input text-xs font-medium text-[var(--text-main)] bg-[var(--bg-canvas)] cursor-pointer"
                >
                  {STATUS_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuantityOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl neu-btn text-xs font-bold text-[var(--text-secondary)] cursor-pointer"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmQuantity()}
                  className="flex-1 py-2.5 rounded-2xl neu-btn-accent text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'کنفرم اور اگلا' : 'Confirm & Next'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
