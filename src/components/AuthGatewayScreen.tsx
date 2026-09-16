import React, { useState } from 'react';
import { OrderLaLogo } from './OrderLaLogo';
import { 
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
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
  LogIn,
  Check,
  ArrowRight,
  ArrowLeft,
  Building,
  CheckCircle,
  Clock,
  Hourglass,
  RefreshCw
} from 'lucide-react';
import { UserRole, Language, Theme, UserAccount } from '../types';
import { 
  authenticateUser, 
  getStoredUsers, 
  setCurrentUser, 
  registerUserAccount,
  SUPER_ADMIN_NOTIFICATION_EMAIL 
} from '../utils/authManager';

interface AuthGatewayScreenProps {
  theme: Theme;
  onToggleTheme: (theme: Theme) => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthGatewayScreen: React.FC<AuthGatewayScreenProps> = ({
  theme,
  onToggleTheme,
  language,
  onToggleLanguage,
  onLoginSuccess
}) => {
  const isUrdu = language === 'ur';

  // Mode: Sign In vs Register New Account
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form State
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form State
  const [regName, setRegName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regRequestedRole, setRegRequestedRole] = useState<UserRole>('buyer');
  const [regNotes, setRegNotes] = useState<string>('');
  const [regError, setRegError] = useState<string | null>(null);

  // Pending Approval Waiting State for New or Pending Users
  const [pendingWaitUser, setPendingWaitUser] = useState<UserAccount | null>(null);
  const [waitStatusMsg, setWaitStatusMsg] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);

  // Registration Success State
  const [regSuccessData, setRegSuccessData] = useState<{
    user: UserAccount;
    mailtoUrl?: string;
  } | null>(null);

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setLoginError(isUrdu ? 'براہِ کرم یوزر نیم درج کریں' : 'Please enter your username');
      return;
    }

    const result = authenticateUser(trimmedUser, password);
    if (!result.success || !result.user) {
      // If the user's registration is pending admin approval, direct them straight to the Waiting Message Screen
      if (result.isPending && result.user) {
        setPendingWaitUser(result.user);
        setWaitStatusMsg(null);
        return;
      }

      setLoginError(
        result.error ||
          (isUrdu
            ? 'لاگ ان کی تفصیلات درست نہیں ہیں!'
            : 'Invalid login credentials!')
      );
      return;
    }

    setCurrentUser(result.user);
    onLoginSuccess(result.user);
  };

  // Live Check Approval Status for Pending Users
  const handleCheckApprovalStatus = () => {
    if (!pendingWaitUser) return;
    setIsCheckingStatus(true);
    setWaitStatusMsg(null);

    setTimeout(() => {
      setIsCheckingStatus(false);
      const allUsers = getStoredUsers();
      const freshUser = allUsers.find(
        (u) =>
          u.id === pendingWaitUser.id ||
          u.username.trim().toLowerCase() === pendingWaitUser.username.trim().toLowerCase()
      );

      if (!freshUser) {
        setWaitStatusMsg(isUrdu ? 'صارف کا ریکارڈ دستیاب نہیں ہے' : 'User record not found');
        return;
      }

      if (freshUser.status === 'active') {
        setWaitStatusMsg(
          isUrdu
            ? '🎉 مبارک ہو! ایڈمن کی جانب سے آپ کی رسائی منظور کر دی گئی ہے۔ سسٹم میں داخل ہو رہے ہیں...'
            : '🎉 Approved! Your access has been granted by administrator. Entering system...'
        );
        setTimeout(() => {
          setCurrentUser(freshUser);
          onLoginSuccess(freshUser);
        }, 1200);
      } else if (freshUser.status === 'rejected') {
        setWaitStatusMsg(
          isUrdu
            ? '❌ معذرت، ایڈمنسٹریٹر نے آپ کی رجسٹریشن درخواست مسترد کر دی ہے۔'
            : '❌ Your registration request was declined by the administrator.'
        );
      } else {
        setWaitStatusMsg(
          isUrdu
            ? '⏳ آپ کی درخواست ابھی تک ایڈمنسٹریٹر کے جائزے میں ہے۔ براہِ کرم انتظار فرمائیں۔'
            : '⏳ Your request is still pending administrator review. Please hold on and wait.'
        );
      }
    }, 600);
  };

  // Submit Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError(isUrdu ? 'براہِ کرم پورا نام درج کریں' : 'Please enter full name');
      return;
    }
    if (!regUsername.trim()) {
      setRegError(isUrdu ? 'براہِ کرم مطلوبہ یوزر نیم درج کریں' : 'Please enter desired username');
      return;
    }
    if (!regPassword) {
      setRegError(isUrdu ? 'براہِ کرم پاس ورڈ درج کریں' : 'Please enter password');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError(isUrdu ? 'پاس ورڈ کی تصدیق مماثل نہیں ہے!' : 'Passwords do not match!');
      return;
    }

    const regResult = registerUserAccount({
      name: regName.trim(),
      username: regUsername.trim(),
      password: regPassword,
      phone: regPhone.trim(),
      email: regEmail.trim(),
      requestedRole: regRequestedRole,
      notes: regNotes.trim()
    });

    if (!regResult.success || !regResult.user) {
      setRegError(regResult.error || (isUrdu ? 'رجسٹریشن میں خرابی پیش آگئی' : 'Registration failed'));
      return;
    }

    // Set registration success data for review and notification
    setPendingWaitUser(regResult.user);
    setRegSuccessData({
      user: regResult.user,
      mailtoUrl: regResult.mailtoUrl
    });
    setWaitStatusMsg(null);
  };

  return (
    <div className="w-full min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col justify-between p-3 sm:p-6 selection:bg-[var(--accent-blue)] selection:text-white transition-colors duration-200">
      
      {/* Top Controls Bar: Logo, Security Badge, Language Switcher, Theme Switcher */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4 py-2">
        <div className="flex items-center gap-3">
          <OrderLaLogo
            variant="horizontal"
            size="md"
            showSubtitle={true}
            subtitleText={isUrdu ? 'ہول سیل بزنس او ایس' : 'Wholesale Business OS'}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Security Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl neu-inset-sm text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'محفوظ گیٹ وے' : 'Secure BOS Gateway'}</span>
          </div>

          {/* Bilingual Language Pill Switcher */}
          <div className="p-1 rounded-2xl neu-inset-sm flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleLanguage('ur')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'ur'
                  ? 'neu-btn text-[var(--accent-blue)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              اردو
            </button>
            <button
              type="button"
              onClick={() => onToggleLanguage('en')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'neu-btn text-[var(--accent-blue)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              English
            </button>
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={() => onToggleTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 sm:px-3 sm:py-1.5 rounded-2xl neu-btn text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent-blue)] flex items-center gap-1.5 cursor-pointer"
            title={isUrdu ? 'تھیم تبدیل کریں' : 'Toggle Theme'}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline">{isUrdu ? 'ڈارک' : 'Dark'}</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">{isUrdu ? 'لائٹ' : 'Light'}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Authentication Stage Container */}
      <main className="w-full max-w-2xl mx-auto my-auto py-4 sm:py-6">
        <div className="w-full neu-raised rounded-4xl p-5 sm:p-8 space-y-6 transition-all border border-black/5 dark:border-white/5">
          
          {/* Welcome Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neu-inset-sm text-xs font-bold text-[var(--accent-blue)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'پہلا مرحلہ: پورٹل تصدیق و رجسٹریشن' : 'Stage 1: Access & Registration Portal'}</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight urdu-title">
              {isUrdu ? 'آرڈر لا ہول سیل بزنس آپریٹنگ سسٹم' : 'OrderLa Wholesale Business OS'}
            </h1>
            
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-md mx-auto">
              {isUrdu
                ? 'جاری رکھنے کے لیے اپنے رجسٹرڈ اکاؤنٹ میں لاگ ان کریں یا نیا اکاؤنٹ بنائیں۔'
                : 'Please log in with your credentials or register a new account to enter the system.'}
            </p>
          </div>

          {pendingWaitUser ? (
            /* Pending Approval Waiting State View */
            <div className="space-y-4 animate-in zoom-in-95 duration-200 text-center py-2">
              <div className="w-16 h-16 rounded-full neu-inset-sm flex items-center justify-center mx-auto text-amber-500">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-[var(--text-main)] urdu-title">
                  {isUrdu ? 'اکاؤنٹ منظوری کے منتظر ہے' : 'Account Pending Approval'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                  {isUrdu
                    ? `صارف @${pendingWaitUser.username} کا اکاؤنٹ ایڈمنسٹریٹر کے جائزے کے لیے زیرِ التواء ہے۔ براہِ کرم منظوری تک انتظار فرمائیں۔`
                    : `Account @${pendingWaitUser.username} is pending administrator review and approval. Please hold on.`}
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl neu-inset-sm text-right text-xs space-y-1.5 max-w-md mx-auto">
                <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                  <span className="font-bold text-[var(--text-secondary)]">{isUrdu ? 'صارف نام:' : 'Username:'}</span>
                  <span className="font-mono font-bold text-[var(--accent-blue)]">@{pendingWaitUser.username}</span>
                </div>
                <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-1">
                  <span className="font-bold text-[var(--text-secondary)]">{isUrdu ? 'پورا نام:' : 'Name:'}</span>
                  <span className="font-bold text-[var(--text-main)]">{pendingWaitUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[var(--text-secondary)]">{isUrdu ? 'حیثیت:' : 'Status:'}</span>
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    <Hourglass className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'زیرِ جائزہ (Pending)' : 'Pending Review'}</span>
                  </span>
                </div>
              </div>

              {waitStatusMsg && (
                <div className="p-3 rounded-2xl neu-inset-sm text-xs font-bold text-[var(--accent-blue)]">
                  {waitStatusMsg}
                </div>
              )}

              <div className="space-y-2.5 max-w-md mx-auto pt-2">
                {regSuccessData?.mailtoUrl && (
                  <a
                    href={regSuccessData.mailtoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-2xl neu-btn-accent text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{isUrdu ? 'ایڈمنسٹریٹر کو ای میل کے ذریعے مطلع کریں' : 'Notify Administrator via Email'}</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleCheckApprovalStatus}
                  disabled={isCheckingStatus}
                  className="w-full py-3 px-4 rounded-2xl neu-btn text-xs font-black text-[var(--accent-blue)] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>{isUrdu ? 'منظوری کی حیثیت دوبارہ چیک کریں' : 'Check Approval Status'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const savedUsername = pendingWaitUser.username;
                    setPendingWaitUser(null);
                    setWaitStatusMsg(null);
                    setRegSuccessData(null);
                    setAuthMode('login');
                    setUsername(savedUsername);
                  }}
                  className="w-full py-2 text-xs text-[var(--text-secondary)] font-bold hover:text-[var(--accent-blue)] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'لاگ ان اسکرین پر واپس جائیں' : 'Back to Login Screen'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Dual-Tier Neumorphic Mode Switcher Pill */}
              <div className="p-1.5 rounded-3xl neu-inset flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setPendingWaitUser(null);
                setLoginError(null);
              }}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'login' && !pendingWaitUser
                  ? 'neu-btn text-[var(--accent-blue)] shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{isUrdu ? '1. لاگ ان کریں (Sign In)' : '1. Sign In'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setPendingWaitUser(null);
                setRegError(null);
              }}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'register' && !pendingWaitUser
                  ? 'neu-btn text-[var(--accent-blue)] shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isUrdu ? '2. نیا اکاؤنٹ بنائیں (Register)' : '2. Register Account'}</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: LOGIN (لاگ ان کریں - Account Level Option Removed as Requested) */}
          {/* ========================================================================= */}
          {authMode === 'login' && !pendingWaitUser && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Error Message Feedback */}
              {loginError && (
                <div className="p-3 rounded-2xl neu-inset-sm flex items-center gap-2.5 text-rose-500 text-xs font-bold animate-in shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username Field */}
                <div className="space-y-1.5">
                  <label htmlFor="auth-username-field" className="text-xs font-extrabold text-[var(--text-secondary)] flex items-center gap-1.5 px-1">
                    <User className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    <span>{isUrdu ? 'صارف کا نام (Username)' : 'Username'}</span>
                  </label>

                  <div className="relative flex items-center">
                    <div className="absolute right-3.5 text-[var(--text-secondary)] pointer-events-none">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-username-field"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username Here"
                      className="w-full pr-10 pl-4 py-3 rounded-2xl neu-inset text-sm font-extrabold text-[var(--text-main)] placeholder:text-[var(--text-secondary)]/50 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-blue)]/30 transition"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-extrabold text-[var(--text-secondary)] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      <span>{isUrdu ? 'پاس ورڈ (Password)' : 'Password'}</span>
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute right-3.5 text-[var(--text-secondary)] pointer-events-none">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isUrdu ? 'پاس ورڈ درج کریں' : 'Enter password'}
                      className="w-full pr-10 pl-11 py-3 rounded-2xl neu-inset text-sm font-extrabold text-[var(--text-main)] placeholder:text-[var(--text-secondary)]/50 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-blue)]/30 transition font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer"
                      title={showPassword ? 'پاس ورڈ چھپائیں' : 'پاس ورڈ دکھائیں'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Login Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl neu-btn text-sm font-black text-[var(--accent-blue)] hover:text-[var(--accent-blue)] flex items-center justify-center gap-2 cursor-pointer transition shadow-md group mt-2"
                >
                  <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{isUrdu ? 'لاگ ان کریں اور سسٹم میں داخل ہوں' : 'Sign In to System'}</span>
                  {isUrdu ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Switch to Register footer */}
              <div className="text-center pt-2">
                <p className="text-xs text-[var(--text-secondary)]">
                  {isUrdu ? 'کیا آپ کے پاس ابھی اکاؤنٹ نہیں ہے؟' : "Don't have an account yet?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setLoginError(null);
                    }}
                    className="font-extrabold text-[var(--accent-blue)] hover:underline cursor-pointer ml-1"
                  >
                    {isUrdu ? 'یہاں نیا اکاؤنٹ رجسٹر کریں' : 'Register a new account here'}
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: REGISTER NEW ACCOUNT (نیا اکاؤنٹ رجسٹر کریں) */}
          {/* ========================================================================= */}
          {authMode === 'register' && !pendingWaitUser && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Admin Notification target alert banner */}
              <div className="p-3 rounded-2xl neu-inset-sm flex items-start gap-2.5 text-xs">
                <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-extrabold text-[var(--text-main)]">
                    {isUrdu ? 'سپر ایڈمن کو فوری اطلاع:' : 'Super Admin Notification:'}
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    {isUrdu
                      ? `تمام نئی رجسٹریشنز کے نوٹیفیکیشنز خودکار طور پر سپر ایڈمن (${SUPER_ADMIN_NOTIFICATION_EMAIL}) کو بھیجے جاتے ہیں تاکہ مطلوبہ رسائی لیول تفویض کی جا سکے۔`
                      : `All registration submissions trigger direct notifications to super admin (${SUPER_ADMIN_NOTIFICATION_EMAIL}) for access granting.`}
                  </p>
                </div>
              </div>

              {/* Registration Error */}
              {regError && (
                <div className="p-3 rounded-2xl neu-inset-sm flex items-center gap-2.5 text-rose-500 text-xs font-bold animate-in shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[var(--text-secondary)] px-1">
                      {isUrdu ? 'پورا نام (Full Name) *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={isUrdu ? 'مثلاً محمد حسان' : 'e.g. Muhammad Hassan'}
                      className="w-full px-3.5 py-2.5 rounded-2xl neu-inset text-xs font-bold text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-blue)]/30"
                      required
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[var(--text-secondary)] px-1">
                      {isUrdu ? 'صارف کا نام (Desired Username) *' : 'Desired Username *'}
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder={isUrdu ? 'مثلاً hassan_wholesale' : 'e.g. hassan_wholesale'}
                      className="w-full px-3.5 py-2.5 rounded-2xl neu-inset text-xs font-bold text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-blue)]/30 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Phone / WhatsApp */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[var(--text-secondary)] px-1">
                      {isUrdu ? 'فون / واٹس ایپ نمبر' : 'Phone / WhatsApp'}
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full px-3.5 py-2.5 rounded-2xl neu-inset text-xs font-bold text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-blue)]/30 font-mono"
                      dir="ltr"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[var(--text-secondary)] px-1">
                      {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-3.5 py-2.5 rounded-2xl neu-inset text-xs font-bold text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-blue)]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[var(--text-secondary)] px-1">
                      {isUrdu ? 'پاس ورڈ *' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-2xl neu-inset text-xs font-bold text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-blue)]/30 font-mono"
                      required
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[var(--text-secondary)] px-1">
                      {isUrdu ? 'پاس ورڈ کی تصدیق *' : 'Confirm Password *'}
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-2xl neu-inset text-xs font-bold text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-blue)]/30 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Requested Access Level Tier */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-extrabold text-[var(--text-secondary)] px-1">
                    {isUrdu ? 'مطلوبہ رسائی لیول (Requested Access Authority Tier):' : 'Requested Access Authority Tier:'}
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Level 1: Buyer */}
                    <button
                      type="button"
                      onClick={() => setRegRequestedRole('buyer')}
                      className={`p-2.5 rounded-2xl text-right sm:text-center transition-all cursor-pointer ${
                        regRequestedRole === 'buyer'
                          ? 'neu-btn text-emerald-600 dark:text-emerald-400 font-extrabold shadow-inner ring-2 ring-emerald-500/40'
                          : 'neu-raised text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <div className="flex items-center sm:justify-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-black">{isUrdu ? 'لیول 1: خریدار' : 'Level 1: Buyer'}</span>
                      </div>
                      <p className="text-[10px] opacity-80 mt-1">
                        {isUrdu ? 'ڈیمانڈ شیٹ و واٹس ایپ' : 'Orders & WhatsApp'}
                      </p>
                    </button>

                    {/* Level 2: Auditor */}
                    <button
                      type="button"
                      onClick={() => setRegRequestedRole('auditor')}
                      className={`p-2.5 rounded-2xl text-right sm:text-center transition-all cursor-pointer ${
                        regRequestedRole === 'auditor'
                          ? 'neu-btn text-purple-600 dark:text-purple-400 font-extrabold shadow-inner ring-2 ring-purple-500/40'
                          : 'neu-raised text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <div className="flex items-center sm:justify-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-black">{isUrdu ? 'لیول 2: آڈیٹر' : 'Level 2: Auditor'}</span>
                      </div>
                      <p className="text-[10px] opacity-80 mt-1">
                        {isUrdu ? 'اسٹاک آڈٹ، ایکسل و پی ڈی ایف' : 'Audit, Excel & PDF'}
                      </p>
                    </button>

                    {/* Level 3: Admin */}
                    <button
                      type="button"
                      onClick={() => setRegRequestedRole('admin')}
                      className={`p-2.5 rounded-2xl text-right sm:text-center transition-all cursor-pointer ${
                        regRequestedRole === 'admin'
                          ? 'neu-btn text-[var(--accent-blue)] font-extrabold shadow-inner ring-2 ring-[var(--accent-blue)]/40'
                          : 'neu-raised text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <div className="flex items-center sm:justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[var(--accent-blue)]" />
                        <span className="text-xs font-black">{isUrdu ? 'لیول 3: ایڈمن' : 'Level 3: Admin'}</span>
                      </div>
                      <p className="text-[10px] opacity-80 mt-1">
                        {isUrdu ? 'مکمل کیٹلاگ ترمیم و انتظام' : 'Full Catalog & Admin'}
                      </p>
                    </button>
                  </div>
                </div>

                {/* Notes or Branch */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-[var(--text-secondary)] px-1">
                    {isUrdu ? 'دکان / مارکیٹ برانچ یا ریمارکس' : 'Shop / Branch or Notes'}
                  </label>
                  <input
                    type="text"
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                    placeholder={isUrdu ? 'مثلاً شاہ عالم مارکیٹ برانچ، لاہور' : 'e.g. Shah Alam Branch, Lahore'}
                    className="w-full px-3.5 py-2.5 rounded-2xl neu-inset text-xs font-bold text-[var(--text-main)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-blue)]/30"
                  />
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl neu-btn text-sm font-black text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2 cursor-pointer transition shadow-md group mt-2"
                >
                  <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>
                    {isUrdu ? 'اکاؤنٹ رجسٹر کریں اور ایڈمن کو مطلع کریں' : 'Register Account & Notify Super Admin'}
                  </span>
                  {isUrdu ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Back to Login prompt */}
              <div className="text-center pt-2">
                <p className="text-xs text-[var(--text-secondary)]">
                  {isUrdu ? 'پہلے سے اکاؤنٹ موجود ہے؟' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setRegError(null);
                    }}
                    className="font-extrabold text-[var(--accent-blue)] hover:underline cursor-pointer ml-1"
                  >
                    {isUrdu ? 'یہاں لاگ ان کریں' : 'Sign in here'}
                  </button>
                </p>
              </div>
            </div>
          )}
            </>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto py-2 text-center text-[11px] text-[var(--text-secondary)] font-medium">
        <p>
          OrderLa Wholesale Business Operating System (BOS) &copy; {new Date().getFullYear()} &bull;{' '}
          {isUrdu ? 'تمام حقوق محفوظ ہیں' : 'All Rights Reserved'} &bull;{' '}
          <span className="font-mono text-[var(--accent-blue)]">Hassan Tareen</span>
        </p>
      </footer>
    </div>
  );
};
