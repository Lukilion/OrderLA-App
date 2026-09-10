import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Crown,
  ShoppingBag,
  FileSpreadsheet
} from 'lucide-react';
import { UserRole, Language, UserAccount } from '../types';
import { authenticateUser, getStoredUsers, setCurrentUser } from '../utils/authManager';

interface RoleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: UserRole;
  onSuccess: (user: UserAccount) => void;
  language: Language;
}

export const RoleLoginModal: React.FC<RoleLoginModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  onSuccess,
  language
}) => {
  const isUrdu = language === 'ur';

  const [username, setUsername] = useState<string>(() => {
    if (targetRole === 'superadmin') return 'Lukilion';
    if (targetRole === 'admin') return 'admin';
    if (targetRole === 'auditor') return 'auditor';
    return 'buyer';
  });

  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // When targetRole changes, adjust default username
  React.useEffect(() => {
    if (isOpen) {
      if (targetRole === 'superadmin') {
        setUsername('Lukilion');
      } else if (targetRole === 'admin') {
        setUsername('admin');
      } else if (targetRole === 'auditor') {
        setUsername('auditor');
      } else {
        setUsername('buyer');
      }
      setPassword('');
      setErrorMsg(null);
    }
  }, [isOpen, targetRole]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // If buyer and no password required, check if user exists
    if (targetRole === 'buyer' && !password) {
      const users = getStoredUsers();
      const buyerUser = users.find((u) => u.role === 'buyer') || {
        id: 'buyer-guest',
        username: 'buyer',
        password: '',
        name: 'Wholesale Buyer (خریدار)',
        role: 'buyer' as UserRole,
        canExportExcel: false,
        canExportPdf: false,
        canSendWhatsApp: true,
        createdAt: '2026-09-10'
      };
      setCurrentUser(buyerUser);
      onSuccess(buyerUser);
      onClose();
      return;
    }

    const result = authenticateUser(username, password);
    if (!result.success || !result.user) {
      setErrorMsg(
        result.error ||
          (isUrdu
            ? 'لاگ ان کی تفصیلات درست نہیں ہیں!'
            : 'Invalid username or password!')
      );
      return;
    }

    // Role check if needed
    if (targetRole === 'superadmin' && result.user.role !== 'superadmin') {
      setErrorMsg(
        isUrdu
          ? 'اس اکاؤنٹ کے پاس سپر ایڈمن کے اختیارات نہیں ہیں!'
          : 'This account does not have Super Admin authority!'
      );
      return;
    }

    onSuccess(result.user);
    onClose();
  };

  const getRoleBadge = () => {
    switch (targetRole) {
      case 'superadmin':
        return {
          titleUrdu: 'سپر ایڈمن سیکیورٹی لاگ ان',
          titleEn: 'Super Admin Security Login',
          descUrdu: 'سپر ایڈمن (Lukilion) کے لیے پاس ورڈ درج کریں',
          descEn: 'Enter password for Super Admin authority (Lukilion)',
          icon: <Crown className="w-6 h-6 text-amber-500 animate-pulse" />,
          color: 'text-amber-500'
        };
      case 'admin':
        return {
          titleUrdu: 'ایڈمن سیکیورٹی لاگ ان',
          titleEn: 'Admin Protected Security Login',
          descUrdu: 'ایڈمن پینل کے لیے پاس ورڈ محفوظ لاگ ان درکار ہے',
          descEn: 'Password authentication required to enter Admin mode',
          icon: <ShieldCheck className="w-6 h-6 text-[var(--accent-blue)]" />,
          color: 'text-[var(--accent-blue)]'
        };
      case 'auditor':
        return {
          titleUrdu: 'آڈیٹر سیکیورٹی لاگ ان',
          titleEn: 'Auditor Protected Security Login',
          descUrdu: 'آڈٹ و مالیاتی رپورٹنگ کے لیے مجاز پاس ورڈ درج کریں',
          descEn: 'Authorized auditor credentials required for audit mode',
          icon: <FileSpreadsheet className="w-6 h-6 text-purple-500" />,
          color: 'text-purple-500'
        };
      default:
        return {
          titleUrdu: 'خریدار (Buyer) موڈ',
          titleEn: 'Wholesale Buyer Mode',
          descUrdu: 'خریدار موڈ منتخب کرنے کے لیے کنفرم کریں',
          descEn: 'Confirm switching to Buyer role',
          icon: <ShoppingBag className="w-6 h-6 text-emerald-500" />,
          color: 'text-emerald-500'
        };
    }
  };

  const info = getRoleBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md neu-raised-lg rounded-3xl p-5 sm:p-7 text-right space-y-5 animate-in zoom-in-95 duration-150 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-500 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Ribbon */}
        <div className="flex items-center gap-3.5 pr-2">
          <div className="w-12 h-12 rounded-2xl neu-inset-sm flex items-center justify-center shrink-0">
            {info.icon}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-main)] urdu-title">
              {isUrdu ? info.titleUrdu : info.titleEn}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {isUrdu ? info.descUrdu : info.descEn}
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-secondary)]">
              {isUrdu ? 'صارف کا نام (Username):' : 'Username:'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full py-2.5 px-3.5 pr-10 rounded-2xl neu-input text-sm font-bold text-[var(--text-main)]"
              />
              <User className="w-4 h-4 text-[var(--text-secondary)] absolute top-3.5 right-3 pointer-events-none" />
            </div>
          </div>

          {/* Password Input (Optional for buyer, required for admin/auditor/superadmin) */}
          {targetRole !== 'buyer' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--text-secondary)]">
                {isUrdu ? 'سیکیورٹی پاس ورڈ (Password):' : 'Password:'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-2.5 px-3.5 pr-10 pl-10 rounded-2xl neu-input text-sm font-mono font-bold text-[var(--text-main)]"
                />
                <KeyRound className="w-4 h-4 text-[var(--text-secondary)] absolute top-3.5 right-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2.5 left-2.5 p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Hint for Demo / Default */}
              {targetRole === 'superadmin' && (
                <p className="text-[11px] text-[var(--accent-blue)] font-semibold pt-1">
                  {isUrdu ? 'سپر ایڈمن ڈیفالٹ:' : 'Super Admin Default:'} User: <span className="font-mono font-bold">Lukilion</span> | Pass: <span className="font-mono font-bold">Lukilion@78612</span>
                </p>
              )}
              {targetRole === 'admin' && (
                <p className="text-[11px] text-[var(--text-secondary)] font-medium pt-1">
                  {isUrdu ? 'ایڈمن پاس ورڈ:' : 'Admin Password:'} <span className="font-mono font-bold">admin123</span>
                </p>
              )}
              {targetRole === 'auditor' && (
                <p className="text-[11px] text-[var(--text-secondary)] font-medium pt-1">
                  {isUrdu ? 'آڈیٹر پاس ورڈ:' : 'Auditor Password:'} <span className="font-mono font-bold">audit123</span>
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-2xl neu-btn text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-2xl neu-btn-accent text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isUrdu ? 'لاگ ان کریں اور کردار منتخب کریں' : 'Authenticate & Switch'}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
