import React, { useState } from 'react';
import { OrderLaLogo } from './OrderLaLogo';
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
  FileSpreadsheet,
  UserPlus,
  Mail,
  Phone,
  Send,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserRole, Language, UserAccount } from '../types';
import { 
  authenticateUser, 
  getStoredUsers, 
  setCurrentUser, 
  registerUserAccount,
  SUPER_ADMIN_NOTIFICATION_EMAIL 
} from '../utils/authManager';

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

  // Mode: Sign In or Register New Account
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login State
  const [username, setUsername] = useState<string>(() => {
    if (targetRole === 'superadmin') return 'Lukilion';
    if (targetRole === 'admin') return 'admin';
    if (targetRole === 'auditor') return 'auditor';
    return 'buyer';
  });
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Register State
  const [regName, setRegName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regRequestedRole, setRegRequestedRole] = useState<UserRole>('buyer');
  const [regNotes, setRegNotes] = useState<string>('');
  
  // Registration Success Screen State
  const [regSuccessData, setRegSuccessData] = useState<{
    user: UserAccount;
    mailtoUrl?: string;
  } | null>(null);

  // When targetRole changes or modal opens, reset fields
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
      setRegSuccessData(null);
    }
  }, [isOpen, targetRole]);

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // If buyer and no password, check user
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

    // Check superadmin authority
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

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regUsername.trim()) {
      setErrorMsg(isUrdu ? 'براہِ کرم یوزر نیم درج کریں' : 'Please enter a username');
      return;
    }

    if (regPassword && regPassword !== regConfirmPassword) {
      setErrorMsg(isUrdu ? 'پاس ورڈ کی تصدیق مماثل نہیں ہے' : 'Passwords do not match');
      return;
    }

    const res = registerUserAccount({
      name: regName.trim() || regUsername.trim(),
      username: regUsername.trim(),
      password: regPassword,
      email: regEmail.trim(),
      phone: regPhone.trim(),
      requestedRole: regRequestedRole,
      notes: regNotes.trim()
    });

    if (!res.success || !res.user) {
      setErrorMsg(res.error || (isUrdu ? 'رجسٹریشن ناکام ہو گئی' : 'Registration failed'));
      return;
    }

    // Set success screen data
    setRegSuccessData({
      user: res.user,
      mailtoUrl: res.mailtoUrl
    });
  };

  const getRoleBadge = () => {
    switch (targetRole) {
      case 'superadmin':
        return {
          titleUrdu: 'سپر ایڈمن سیکیورٹی لاگ ان',
          titleEn: 'Super Admin Security Login',
          descUrdu: 'سپر ایڈمن (Lukilion) کے لیے پاس ورڈ درج کریں',
          descEn: 'Enter password for Super Admin authority (Lukilion)',
          icon: <Crown className="w-5 h-5 text-amber-500 animate-pulse" />,
        };
      case 'admin':
        return {
          titleUrdu: 'ایڈمن سیکیورٹی لاگ ان',
          titleEn: 'Admin Protected Security Login',
          descUrdu: 'ایڈمن پینل کے لیے پاس ورڈ محفوظ لاگ ان درکار ہے',
          descEn: 'Password authentication required to enter Admin mode',
          icon: <ShieldCheck className="w-5 h-5 text-[var(--accent-blue)]" />,
        };
      case 'auditor':
        return {
          titleUrdu: 'آڈیٹر سیکیورٹی لاگ ان',
          titleEn: 'Auditor Protected Security Login',
          descUrdu: 'آڈٹ و مالیاتی رپورٹنگ کے لیے مجاز پاس ورڈ درج کریں',
          descEn: 'Authorized auditor credentials required for audit mode',
          icon: <FileSpreadsheet className="w-5 h-5 text-purple-500" />,
        };
      default:
        return {
          titleUrdu: 'خریدار (Buyer) موڈ',
          titleEn: 'Wholesale Buyer Mode',
          descUrdu: 'خریدار موڈ منتخب کرنے کے لیے کنفرم کریں',
          descEn: 'Confirm switching to Buyer role',
          icon: <ShoppingBag className="w-5 h-5 text-emerald-500" />,
        };
    }
  };

  const info = getRoleBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-lg neu-raised-lg rounded-3xl p-5 sm:p-7 text-right space-y-4 animate-in zoom-in-95 duration-150 relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-500 cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Brand Logo Banner */}
        <div className="flex flex-col items-center justify-center pt-1">
          <OrderLaLogo variant="horizontal" size="md" />
          <div className="text-[11px] font-bold text-[var(--text-secondary)] mt-1.5">
            {isUrdu ? 'آرڈر لا - ہول سیل ایکسیس پورٹل' : 'OrderLa Wholesale Access Portal'}
          </div>
        </div>

        {/* Mode Switcher Tabs: Sign In / Register Account */}
        {!regSuccessData && (
          <div className="flex rounded-2xl neu-inset-sm p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'neu-btn-accent text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'لاگ ان کریں' : 'Sign In'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'neu-btn-accent text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'نیا اکاؤنٹ رجسٹر کریں' : 'Register Account'}</span>
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ======================= REGISTRATION SUCCESS SCREEN ======================= */}
        {regSuccessData ? (
          <div className="space-y-4 text-center py-2 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-[var(--text-main)] urdu-title">
                {isUrdu ? 'رجسٹریشن موصول ہو گئی ہے!' : 'Registration Submitted Successfully!'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium max-w-sm mx-auto">
                {isUrdu 
                  ? `آپ کی رجسٹریشن درخواست ایڈمنسٹریٹر (${SUPER_ADMIN_NOTIFICATION_EMAIL}) کو رسائی کی منظوری کے لیے ارسال کر دی گئی ہے۔`
                  : `Your request has been routed to the Administrator (${SUPER_ADMIN_NOTIFICATION_EMAIL}) for approval.`
                }
              </p>
            </div>

            {/* Applicant Summary Card */}
            <div className="neu-inset-sm rounded-2xl p-3.5 text-xs text-right space-y-1.5 font-medium">
              <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                <span className="text-[var(--text-secondary)]">{isUrdu ? 'درخواست گزار کا نام:' : 'Applicant Name:'}</span>
                <span className="font-bold text-[var(--text-main)]">{regSuccessData.user.name}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                <span className="text-[var(--text-secondary)]">{isUrdu ? 'یوزر نیم:' : 'Username:'}</span>
                <span className="font-mono font-bold text-[var(--accent-blue)]">@{regSuccessData.user.username}</span>
              </div>
              <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                <span className="text-[var(--text-secondary)]">{isUrdu ? 'مطلوبہ رسائی لیول:' : 'Requested Level:'}</span>
                <span className="font-bold text-amber-500">
                  {regSuccessData.user.requestedRole === 'admin' 
                    ? (isUrdu ? 'لیول 3: آپریشنل ایڈمن' : 'Level 3: Operational Admin')
                    : regSuccessData.user.requestedRole === 'auditor'
                    ? (isUrdu ? 'لیول 2: فنانشل آڈیٹر' : 'Level 2: Financial Auditor')
                    : (isUrdu ? 'لیول 1: ہول سیل خریدار' : 'Level 1: Wholesale Buyer')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">{isUrdu ? 'ایڈمنسٹریٹر منظوری ای میل:' : 'Admin Target Email:'}</span>
                <span className="font-mono text-[11px] text-[var(--accent-blue)]">{SUPER_ADMIN_NOTIFICATION_EMAIL}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {regSuccessData.mailtoUrl && (
                <a
                  href={regSuccessData.mailtoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-2xl neu-btn text-xs font-bold text-[var(--accent-blue)] flex items-center justify-center gap-2 hover:bg-[var(--accent-blue)]/10"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isUrdu ? 'ایڈمن کو منظوری کی ای میل بھیجیں / تصدیق کریں' : 'Send Approval Email to Admin'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  setCurrentUser(regSuccessData.user);
                  onSuccess(regSuccessData.user);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-2xl neu-btn-accent text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md text-white"
              >
                <span>{isUrdu ? 'بنیادی خریدار (Buyer) رسائی کے ساتھ جاری رکھیں' : 'Continue with Provisional Buyer Access'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : authMode === 'login' ? (
          /* ======================= SIGN IN FORM ======================= */
          <>
            {/* Header Ribbon for Login */}
            <div className="flex items-center gap-3 pr-1 pt-1 border-t border-black/5 dark:border-white/10">
              <div className="w-10 h-10 rounded-2xl neu-inset-sm flex items-center justify-center shrink-0">
                {info.icon}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[var(--text-main)] urdu-title">
                  {isUrdu ? info.titleUrdu : info.titleEn}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                  {isUrdu ? info.descUrdu : info.descEn}
                </p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 pt-1">
              {/* Username Input */}
              <div className="space-y-1">
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
                    className="w-full py-2.5 px-3.5 pr-10 rounded-2xl neu-input text-xs sm:text-sm font-bold text-[var(--text-main)]"
                  />
                  <User className="w-4 h-4 text-[var(--text-secondary)] absolute top-3.5 right-3 pointer-events-none" />
                </div>
              </div>

              {/* Password Input */}
              {targetRole !== 'buyer' && (
                <div className="space-y-1">
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
                      className="w-full py-2.5 px-3.5 pr-10 pl-10 rounded-2xl neu-input text-xs sm:text-sm font-mono font-bold text-[var(--text-main)]"
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

                  {/* Password Hints */}
                  {targetRole === 'superadmin' && (
                    <p className="text-[10px] text-[var(--accent-blue)] font-semibold pt-0.5">
                      {isUrdu ? 'سپر ایڈمن:' : 'Super Admin:'} <span className="font-mono font-bold">Lukilion</span> | <span className="font-mono font-bold">Lukilion@78612</span>
                    </p>
                  )}
                  {targetRole === 'admin' && (
                    <p className="text-[10px] text-[var(--text-secondary)] font-medium pt-0.5">
                      {isUrdu ? 'ایڈمن پاس ورڈ:' : 'Admin Password:'} <span className="font-mono font-bold">admin123</span>
                    </p>
                  )}
                  {targetRole === 'auditor' && (
                    <p className="text-[10px] text-[var(--text-secondary)] font-medium pt-0.5">
                      {isUrdu ? 'آڈیٹر پاس ورڈ:' : 'Auditor Password:'} <span className="font-mono font-bold">audit123</span>
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-3.5 rounded-2xl neu-btn text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-2xl neu-btn-accent text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md text-white"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isUrdu ? 'لاگ ان کریں اور رسائی حاصل کریں' : 'Authenticate & Enter'}
                  </span>
                </button>
              </div>
            </form>
          </>
        ) : (
          /* ======================= REGISTRATION FORM ======================= */
          <>
            <div className="border-t border-black/5 dark:border-white/10 pt-2 text-right">
              <h3 className="text-sm font-black text-[var(--text-main)] urdu-title flex items-center gap-1.5 justify-end">
                <Sparkles className="w-4 h-4 text-[var(--accent-blue)]" />
                <span>{isUrdu ? 'نئے اکاؤنٹ کی رجسٹریشن و ایڈمنسٹریٹر منظوری' : 'New Account Registration & Approval'}</span>
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">
                {isUrdu 
                  ? `تمام رجسٹریشنز منظوری کے لیے hassantareen001@gmail.com کو بھیجی جاتی ہیں`
                  : `Approvals are notified to superadmin hassantareen001@gmail.com with access level options`}
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)]">
                  {isUrdu ? 'مکمل نام:' : 'Full Name:'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={isUrdu ? 'جیسے: حسن ترین' : 'e.g. Hassan Tareen'}
                    className="w-full py-2 px-3 pr-9 rounded-xl neu-input text-xs font-bold text-[var(--text-main)]"
                  />
                  <User className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute top-3 right-3 pointer-events-none" />
                </div>
              </div>

              {/* Desired Username */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)]">
                  {isUrdu ? 'مطلوبہ یوزر نیم (Username):' : 'Desired Username:'}
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. ahmed_wholesale"
                  className="w-full py-2 px-3 rounded-xl neu-input text-xs font-mono font-bold text-[var(--text-main)]"
                />
              </div>

              {/* Phone and Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)]">
                    {isUrdu ? 'موبائل / واٹس ایپ:' : 'Phone / WhatsApp:'}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full py-2 px-3 pr-8 rounded-xl neu-input text-xs font-mono text-[var(--text-main)]"
                    />
                    <Phone className="w-3 h-3 text-[var(--text-secondary)] absolute top-3 right-2.5 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)]">
                    {isUrdu ? 'ای میل ایڈریس:' : 'Email Address:'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full py-2 px-3 pr-8 rounded-xl neu-input text-xs text-[var(--text-main)]"
                    />
                    <Mail className="w-3 h-3 text-[var(--text-secondary)] absolute top-3 right-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Password and Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)]">
                    {isUrdu ? 'پاس ورڈ:' : 'Password:'}
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-2 px-3 rounded-xl neu-input text-xs font-mono text-[var(--text-main)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)]">
                    {isUrdu ? 'پاس ورڈ تصدیق:' : 'Confirm Password:'}
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-2 px-3 rounded-xl neu-input text-xs font-mono text-[var(--text-main)]"
                  />
                </div>
              </div>

              {/* Requested Access Level */}
              <div className="space-y-1 pt-1">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)]">
                  {isUrdu ? 'مطلوبہ رسائی لیول (Access Level Options):' : 'Requested Access Level:'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => setRegRequestedRole('buyer')}
                    className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      regRequestedRole === 'buyer'
                        ? 'neu-btn-accent text-white shadow-xs'
                        : 'neu-btn text-[var(--text-main)]'
                    }`}
                  >
                    <div className="text-[11px]">{isUrdu ? 'لیول 1' : 'Level 1'}</div>
                    <div className="text-[10px] font-medium opacity-90">{isUrdu ? 'خریدار' : 'Buyer'}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRequestedRole('auditor')}
                    className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      regRequestedRole === 'auditor'
                        ? 'neu-btn-accent text-white shadow-xs'
                        : 'neu-btn text-[var(--text-main)]'
                    }`}
                  >
                    <div className="text-[11px]">{isUrdu ? 'لیول 2' : 'Level 2'}</div>
                    <div className="text-[10px] font-medium opacity-90">{isUrdu ? 'آڈیٹر' : 'Auditor'}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRequestedRole('admin')}
                    className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      regRequestedRole === 'admin'
                        ? 'neu-btn-accent text-white shadow-xs'
                        : 'neu-btn text-[var(--text-main)]'
                    }`}
                  >
                    <div className="text-[11px]">{isUrdu ? 'لیول 3' : 'Level 3'}</div>
                    <div className="text-[10px] font-medium opacity-90">{isUrdu ? 'ایڈمن' : 'Admin'}</div>
                  </button>
                </div>
              </div>

              {/* Branch / Notes */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[var(--text-secondary)]">
                  {isUrdu ? 'برانچ یا ریمارکس (اختیاری):' : 'Branch or Notes (Optional):'}
                </label>
                <input
                  type="text"
                  value={regNotes}
                  onChange={(e) => setRegNotes(e.target.value)}
                  placeholder={isUrdu ? 'جیسے: لاہور شالمی برانچ کے خریدار' : 'e.g. Purchaser for Lahore branch'}
                  className="w-full py-2 px-3 rounded-xl neu-input text-xs text-[var(--text-main)]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="py-2.5 px-3.5 rounded-2xl neu-btn text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer"
                >
                  {isUrdu ? 'واپس' : 'Back'}
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-2xl neu-btn-accent text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md text-white"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isUrdu ? 'درخواست جمع کرائیں اور ایڈمن کو مطلع کریں' : 'Register & Notify Admin'}
                  </span>
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
