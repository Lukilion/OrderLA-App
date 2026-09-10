import React, { useState } from 'react';
import { OrderLaLogo } from './OrderLaLogo';
import { 
  X, 
  MessageSquare, 
  Crown, 
  ShieldCheck, 
  Phone, 
  Copy, 
  ExternalLink, 
  Send, 
  Check, 
  UserPlus
} from 'lucide-react';
import { Language, WholesaleItem } from '../types';
import { generateWhatsAppOrderText } from '../utils/exportHelpers';

interface WhatsAppRecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WholesaleItem[];
  language: Language;
  onToast: (msg: string) => void;
}

export const WhatsAppRecipientModal: React.FC<WhatsAppRecipientModalProps> = ({
  isOpen,
  onClose,
  items,
  language,
  onToast
}) => {
  const isUrdu = language === 'ur';

  const [customPhone, setCustomPhone] = useState<string>('');
  const [selectedRecipient, setSelectedRecipient] = useState<'superadmin' | 'admin' | 'custom'>('superadmin');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate quick metrics for the dialog
  const demandedItems = items.filter((i) => Number(i.demand) > 0);
  const totalUnits = demandedItems.reduce((acc, i) => acc + (Number(i.demand) || 0), 0);
  const totalBudget = demandedItems.reduce((acc, i) => acc + (Number(i.demand) || 0) * (Number(i.rate) || 0), 0);

  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/[^\d]/g, '');
  };

  const handleSendToWhatsApp = (phoneNumber: string, recipientName: string) => {
    const rawNumber = cleanPhoneNumber(phoneNumber);
    if (!rawNumber) {
      alert(isUrdu ? 'براہِ کرم درست موبائل نمبر درج کریں!' : 'Please enter a valid phone number!');
      return;
    }

    const messageText = generateWhatsAppOrderText(items, language);
    const encoded = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${rawNumber}?text=${encoded}`;

    // Also copy text to clipboard as helpful fallback
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(messageText);
      }
    } catch {
      /* ignore */
    }

    // Open WhatsApp in new tab / window
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    onToast(
      isUrdu
        ? `ڈیمانڈ شیٹ واٹس ایپ پر ${recipientName} کو بھیج دی گئی!`
        : `Demand sheet sent to ${recipientName} via WhatsApp!`
    );

    onClose();
  };

  const handleCopyOnly = async () => {
    const messageText = generateWhatsAppOrderText(items, language);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(messageText);
      } else {
        const ta = document.createElement('textarea');
        ta.value = messageText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setIsCopied(true);
      onToast(isUrdu ? 'آرڈر متن کلپ بورڈ پر کاپی ہو گیا!' : 'Order text copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg neu-raised-lg rounded-3xl p-5 sm:p-7 text-right space-y-5 animate-in zoom-in-95 duration-150 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-500 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Ribbon */}
        <div className="flex items-center gap-3 pr-2">
          <OrderLaLogo variant="icon" size="sm" />
          <div className="w-10 h-10 rounded-2xl neu-inset-sm flex items-center justify-center text-emerald-500 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-main)] urdu-title">
              {isUrdu ? 'واٹس ایپ وصول کنندہ کا انتخاب' : 'Select WhatsApp Recipient'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {isUrdu
                ? 'آپ آرڈر لا ڈیمانڈ شیٹ کس کو بھیجنا چاہتے ہیں؟'
                : 'Send OrderLa demand sheet via WhatsApp'}
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-3.5 rounded-2xl neu-inset-sm flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span>{isUrdu ? 'ڈیمانڈ شدہ اشیاء:' : 'Demanded Items:'}</span>
            <span className="text-[var(--accent-blue)] font-mono font-extrabold text-sm">
              {demandedItems.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>{isUrdu ? 'کل یونٹس:' : 'Units:'}</span>
            <span className="text-amber-500 font-mono font-extrabold text-sm">
              *{totalUnits}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>{isUrdu ? 'بجٹ:' : 'Budget:'}</span>
            <span className="text-emerald-500 font-mono font-extrabold text-sm">
              Rs {Math.round(totalBudget).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Recipient Options */}
        <div className="space-y-3">
          <span className="block text-xs font-extrabold text-[var(--text-main)]">
            {isUrdu ? 'موصول کنندگان کی فہرست:' : 'Designated Recipients:'}
          </span>

          {/* Option 1: Super Admin */}
          <div
            onClick={() => setSelectedRecipient('superadmin')}
            className={`p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
              selectedRecipient === 'superadmin'
                ? 'neu-raised border-2 border-amber-500/50 shadow-md'
                : 'neu-raised hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl neu-inset-sm flex items-center justify-center text-amber-500 shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-[var(--text-main)] urdu-title">
                    {isUrdu ? 'سپر ایڈمن (Super Admin)' : 'Super Admin'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 font-bold">
                    Head Office
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5" dir="ltr">
                  +92 307 6220633
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSendToWhatsApp('+923076220633', 'Super Admin (+923076220633)');
              }}
              className="py-2 px-3.5 rounded-xl neu-btn-accent text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'بھیجیں' : 'Send'}</span>
            </button>
          </div>

          {/* Option 2: Admin */}
          <div
            onClick={() => setSelectedRecipient('admin')}
            className={`p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
              selectedRecipient === 'admin'
                ? 'neu-raised border-2 border-blue-500/50 shadow-md'
                : 'neu-raised hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl neu-inset-sm flex items-center justify-center text-[var(--accent-blue)] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-[var(--text-main)] urdu-title">
                    {isUrdu ? 'ایڈمن (Admin)' : 'Admin'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 font-bold">
                    Warehouse Admin
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-[var(--accent-blue)] mt-0.5" dir="ltr">
                  +92 305 7851808
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSendToWhatsApp('+923057851808', 'Admin (+923057851808)');
              }}
              className="py-2 px-3.5 rounded-xl neu-btn-accent text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'بھیجیں' : 'Send'}</span>
            </button>
          </div>

          {/* Option 3: Custom Number */}
          <div
            onClick={() => setSelectedRecipient('custom')}
            className={`p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer space-y-2.5 ${
              selectedRecipient === 'custom'
                ? 'neu-raised border-2 border-emerald-500/50 shadow-md'
                : 'neu-raised hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl neu-inset-sm flex items-center justify-center text-emerald-500">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-[var(--text-main)]">
                  {isUrdu ? 'کوئی دوسرا واٹس ایپ نمبر' : 'Custom WhatsApp Number'}
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                {isUrdu ? 'نمبر درج کریں' : 'Enter number'}
              </span>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                dir="ltr"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="+923001234567"
                className="flex-1 py-2 px-3 rounded-xl neu-input text-xs font-mono font-bold text-[var(--text-main)]"
              />
              <button
                type="button"
                onClick={() => handleSendToWhatsApp(customPhone, customPhone)}
                className="py-2 px-3.5 rounded-xl neu-btn-accent text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'بھیجیں' : 'Send'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Ribbon */}
        <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleCopyOnly}
            className="py-2.5 px-3.5 rounded-2xl neu-btn text-[var(--text-secondary)] hover:text-emerald-500 font-bold flex items-center gap-2 cursor-pointer"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? (isUrdu ? 'کاپی ہو گیا!' : 'Copied!') : (isUrdu ? 'صرف ٹیکسٹ کاپی کریں' : 'Copy Text Only')}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl neu-btn font-bold text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
