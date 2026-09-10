import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Language } from '../types';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  language: Language;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  language
}) => {
  if (!isOpen) return null;

  const isUrdu = language === 'ur';

  return (
    <div className="fixed inset-0 bg-[#33364D]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="neu-raised-lg rounded-3xl max-w-sm w-full p-6 text-right space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-full neu-inset mx-auto flex items-center justify-center text-rose-500 text-lg">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h4 className="text-base font-bold text-[#2C2E42]">
            {isUrdu ? 'شیٹ کو اصل حالت پر بحال کریں؟' : 'Reset sheet to master baseline?'}
          </h4>
          <p className="text-xs text-[#72768F]">
            {isUrdu
              ? 'آپ کی کی گئی تمام ترامیم مٹ جائیں گی اور اصل مصدقہ 87 اشیاء کی ماسٹر لسٹ دوبارہ لوڈ ہو جائے گی۔'
              : 'All custom modifications will be discarded and the verified 87-item master catalog will be restored.'}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-2xl bg-rose-600 text-white font-bold neu-btn text-xs hover:bg-rose-700 cursor-pointer"
          >
            {isUrdu ? 'ہاں، بحال کریں' : 'Yes, Reset'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl neu-btn text-[#72768F] font-bold text-xs cursor-pointer"
          >
            {isUrdu ? 'منسوخ' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
