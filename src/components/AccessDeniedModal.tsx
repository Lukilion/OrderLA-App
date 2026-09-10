import React from 'react';
import { ShieldAlert, Lock, X, Crown, ArrowRight } from 'lucide-react';
import { Language } from '../types';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPermission: 'excel' | 'pdf' | 'whatsapp';
  onLoginAsSuperAdmin: () => void;
  language: Language;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  isOpen,
  onClose,
  requiredPermission,
  onLoginAsSuperAdmin,
  language
}) => {
  if (!isOpen) return null;

  const isUrdu = language === 'ur';

  const getPermTitle = () => {
    switch (requiredPermission) {
      case 'excel':
        return isUrdu ? 'ایکسل (.xlsx) برآمد کی اجازت' : 'Excel Export Permission';
      case 'pdf':
        return isUrdu ? 'پی ڈی ایف / پرنٹ کی اجازت' : 'PDF / Print Permission';
      case 'whatsapp':
        return isUrdu ? 'واٹس ایپ ری ڈائریکشن کی اجازت' : 'WhatsApp Redirection Permission';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md neu-raised-lg rounded-3xl p-5 sm:p-7 text-right space-y-5 animate-in zoom-in-95 duration-150 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-500 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon & Heading */}
        <div className="flex items-center gap-3.5 pr-2">
          <div className="w-12 h-12 rounded-2xl neu-inset-sm flex items-center justify-center text-rose-500 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-main)] urdu-title">
              {isUrdu ? 'رسائی کی اجازت درکار ہے!' : 'Access Permission Required!'}
            </h3>
            <p className="text-xs text-rose-500 font-bold">
              {getPermTitle()}
            </p>
          </div>
        </div>

        {/* Content explanation */}
        <div className="p-3.5 rounded-2xl neu-inset-sm space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
          <p>
            {isUrdu
              ? 'آپ کے موجودہ صارف اکاؤنٹ کے پاس یہ نتیجہ برآمد کرنے کا اختیار موجود نہیں ہے۔'
              : 'Your current account does not have permission to export these results.'}
          </p>
          <p className="font-bold text-[var(--text-main)]">
            {isUrdu
              ? 'صرف سپر ایڈمن (Lukilion) نئے صارفین کو ایکسل، پی ڈی ایف یا واٹس ایپ ایکسپورٹ کی اجازت دے سکتے ہیں۔'
              : 'Only Super Admin (Lukilion) has the authority to grant Excel, PDF, or WhatsApp export access.'}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLoginAsSuperAdmin();
            }}
            className="w-full py-3 px-4 rounded-2xl neu-btn-accent text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>
              {isUrdu ? 'بطور سپر ایڈمن (Lukilion) لاگ ان کریں' : 'Login as Super Admin (Lukilion)'}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-2xl neu-btn text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer"
          >
            {isUrdu ? 'سمجھ گیا (Cancel)' : 'Dismiss'}
          </button>
        </div>

      </div>
    </div>
  );
};
