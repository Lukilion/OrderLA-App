import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-6 neu-raised rounded-2xl px-5 py-3.5 flex items-center gap-3 transition-all duration-300 z-50 text-xs font-semibold text-[#2C2E42] animate-in fade-in slide-in-from-bottom-3">
      <span className="w-6 h-6 rounded-full neu-inset-sm flex items-center justify-center text-[#0A84FF]">
        <Check className="w-3.5 h-3.5" />
      </span>
      <span>{message}</span>
    </div>
  );
};
