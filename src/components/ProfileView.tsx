import React from 'react';
import { 
  UserAccount, 
  UserRole, 
  Language, 
  Theme 
} from '../types';
import { 
  User, 
  ShieldCheck, 
  Crown, 
  Key, 
  FileSpreadsheet, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  Settings, 
  Users, 
  Sun, 
  Moon, 
  Globe 
} from 'lucide-react';
import { OrderLaLogo } from './OrderLaLogo';

interface ProfileViewProps {
  currentUser: UserAccount;
  userRole: UserRole;
  language: Language;
  theme: Theme;
  onToggleTheme: (t: Theme) => void;
  onToggleLanguage: (l: Language) => void;
  onRequestRoleSwitch: (role: UserRole) => void;
  onOpenSuperAdminConsole: () => void;
  onOpenApprovals: () => void;
  pendingApprovalsCount: number;
  onLogout: () => void;
  onToast: (msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  userRole,
  language,
  theme,
  onToggleTheme,
  onToggleLanguage,
  onRequestRoleSwitch,
  onOpenSuperAdminConsole,
  onOpenApprovals,
  pendingApprovalsCount,
  onLogout,
  onToast
}) => {
  const isUrdu = language === 'ur';

  const roleLabels: Record<UserRole, { en: string; ur: string; badge: string }> = {
    superadmin: {
      en: 'Super Administrator (Master Authority)',
      ur: 'سپر ایڈمنسٹریٹر (مکمل کنٹرول)',
      badge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30'
    },
    admin: {
      en: 'Enterprise Admin',
      ur: 'ایڈمن (انتظامیہ)',
      badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30'
    },
    buyer: {
      en: 'Wholesale Buyer (Procurement Officer)',
      ur: 'خریدار (بائر)',
      badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
    },
    auditor: {
      en: 'Stock Auditor (Inspector)',
      ur: 'اسٹاک آڈیٹر (نگران)',
      badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
    },
    purchaser: {
      en: 'Market Purchaser',
      ur: 'مارکیٹ پرچیزر',
      badge: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
    }
  };

  const isSuperAdmin = userRole === 'superadmin' || currentUser.role === 'superadmin';
  const isAdmin = userRole === 'admin' || isSuperAdmin;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Profile Header Card */}
      <div className="neu-raised-lg rounded-3xl p-6 sm:p-8 bg-[var(--bg-canvas)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl neu-inset-sm flex items-center justify-center relative bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] shrink-0">
              <User className="w-10 h-10 sm:w-12 sm:h-12" />
              {isSuperAdmin && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                  <Crown className="w-3.5 h-3.5 fill-slate-950" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)]">
                  {currentUser.name}
                </h2>
                <span className={`text-xs font-mono font-bold px-3 py-0.5 rounded-full ${roleLabels[userRole]?.badge || ''}`}>
                  {isUrdu ? roleLabels[userRole]?.ur : roleLabels[userRole]?.en}
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] font-mono">
                @{currentUser.username} • {currentUser.email || 'wholesale@orderla.pk'}
              </p>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>{isUrdu ? 'اکاؤنٹ فعال و تصدیق شدہ (Active & Authenticated)' : 'Active & Authenticated Session'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => onRequestRoleSwitch(userRole === 'admin' ? 'buyer' : 'admin')}
              className="px-4 py-2 rounded-2xl neu-btn text-xs font-bold text-[var(--accent-blue)] hover:neu-btn-accent hover:text-white transition cursor-pointer flex items-center gap-2"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'صارف اکاؤنٹ تبدیل کریں' : 'Switch Role / Login'}</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 rounded-2xl neu-btn text-xs font-bold text-rose-500 hover:text-rose-600 transition cursor-pointer flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'لاگ آؤٹ' : 'Sign Out'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="neu-raised rounded-3xl p-6 bg-[var(--bg-canvas)] space-y-4">
        <h3 className="text-base font-extrabold text-[var(--text-main)] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[var(--accent-blue)]" />
          <span>{isUrdu ? 'صلاحیات و اجازت نامے (Assigned Capabilities)' : 'Role Permissions & Access Control'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            {
              title: isUrdu ? 'ایکسل رپورٹ برآمد' : 'Excel Export',
              allowed: currentUser.canExportExcel,
              icon: FileSpreadsheet
            },
            {
              title: isUrdu ? 'پی ڈی ایف پرنٹ' : 'PDF Printing',
              allowed: currentUser.canExportPdf,
              icon: FileText
            },
            {
              title: isUrdu ? 'واٹس ایپ ڈسپیچ' : 'WhatsApp Dispatch',
              allowed: currentUser.canSendWhatsApp,
              icon: MessageSquare
            },
            {
              title: isUrdu ? 'ہول سیل ریٹ ترمیم' : 'Wholesale Rate Editing',
              allowed: isAdmin,
              icon: Key
            },
            {
              title: isUrdu ? 'نیا آئٹم شامل کرنا' : 'Add New Inventory Item',
              allowed: isAdmin,
              icon: ShieldCheck
            },
            {
              title: isUrdu ? 'سپر ایڈمنسٹریٹر کنسول' : 'Super Admin Console',
              allowed: isSuperAdmin,
              icon: Crown
            }
          ].map((perm, idx) => {
            const Icon = perm.icon;
            return (
              <div
                key={idx}
                className="neu-inset-sm rounded-2xl p-3.5 flex items-center justify-between gap-3 bg-[var(--bg-canvas)]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl neu-raised text-[var(--text-secondary)]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-main)]">{perm.title}</span>
                </div>
                {perm.allowed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 opacity-60" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Administrative Control Hub (if Admin or Superadmin) */}
      {isAdmin && (
        <div className="neu-raised rounded-3xl p-6 bg-[var(--bg-canvas)] space-y-4">
          <h3 className="text-base font-extrabold text-[var(--text-main)] flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <span>{isUrdu ? 'انتظامی اختیارات (Administration Hub)' : 'Administrative Tools & Console'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={onOpenSuperAdminConsole}
              className="p-4 rounded-2xl neu-raised flex items-center justify-between text-left rtl:text-right hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>{isUrdu ? 'سپر ایڈمن مینجمنٹ کنسول' : 'Super Admin Management'}</span>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {isUrdu ? 'صارفین، پاس ورڈز اور سیکیورٹی کی ترتیبات' : 'Manage system users, passwords, and security rules'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenApprovals}
              className="p-4 rounded-2xl neu-raised flex items-center justify-between text-left rtl:text-right hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--accent-blue)]" />
                  <span className="text-xs font-bold text-[var(--text-main)]">
                    {isUrdu ? 'صارفین کی زیر التواء درخواستیں' : 'Pending User Approvals'}
                  </span>
                  {pendingApprovalsCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {isUrdu ? 'نئے خریدار و آڈیٹر اکاؤنٹس کی توثیق' : 'Approve or reject newly requested accounts'}
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* System Preferences */}
      <div className="neu-raised rounded-3xl p-6 bg-[var(--bg-canvas)] space-y-4">
        <h3 className="text-base font-extrabold text-[var(--text-main)] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[var(--accent-blue)]" />
          <span>{isUrdu ? 'ترجیحات و ترتیبات (Preferences)' : 'General Preferences'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Theme */}
          <div className="neu-inset-sm rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-[var(--text-main)]">
                {isUrdu ? 'تھیم موڈ (Theme Mode)' : 'Appearance Theme'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleTheme('light')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                  theme === 'light' ? 'neu-btn-accent text-white' : 'neu-btn text-[var(--text-secondary)]'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => onToggleTheme('dark')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                  theme === 'dark' ? 'neu-btn-accent text-white' : 'neu-btn text-[var(--text-secondary)]'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="neu-inset-sm rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-[var(--accent-blue)]" />
              <span className="text-xs font-bold text-[var(--text-main)]">
                {isUrdu ? 'زبان (Language)' : 'Display Language'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleLanguage('ur')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                  language === 'ur' ? 'neu-btn-accent text-white' : 'neu-btn text-[var(--text-secondary)]'
                }`}
              >
                اردو
              </button>
              <button
                onClick={() => onToggleLanguage('en')}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                  language === 'en' ? 'neu-btn-accent text-white' : 'neu-btn text-[var(--text-secondary)]'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
