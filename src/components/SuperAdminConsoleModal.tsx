import React, { useState } from 'react';
import { OrderLaLogo } from './OrderLaLogo';
import { 
  X, 
  Crown, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  FileSpreadsheet, 
  Printer, 
  MessageSquare, 
  Trash2, 
  Check, 
  KeyRound, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Mail,
  Phone,
  Clock,
  UserCheck,
  UserX,
  Sparkles
} from 'lucide-react';
import { UserAccount, UserRole, Language } from '../types';
import { 
  getStoredUsers, 
  addNewUser, 
  updateUserPermissions, 
  deleteUser,
  approveUserRegistration,
  rejectUserRegistration,
  SUPER_ADMIN_NOTIFICATION_EMAIL
} from '../utils/authManager';

interface SuperAdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onUsersUpdated: () => void;
  currentUser?: UserAccount;
}

export const SuperAdminConsoleModal: React.FC<SuperAdminConsoleModalProps> = ({
  isOpen,
  onClose,
  language,
  onUsersUpdated,
  currentUser
}) => {
  const isUrdu = language === 'ur';
  const isSuperAdmin = !currentUser || currentUser.role === 'superadmin' || currentUser.username.toLowerCase() === 'lukilion';

  const [activeTab, setActiveTab] = useState<'users' | 'pending' | 'add-admin' | 'add-auditor' | 'add-buyer'>('users');
  const [users, setUsers] = useState<UserAccount[]>([]);
  
  const pendingUsers = users.filter((u) => u.status === 'pending');

  const handleApproveUser = (userId: string, role: UserRole) => {
    const res = approveUserRegistration(userId, role);
    if (res.success) {
      refreshUsersList();
    } else {
      alert(res.error);
    }
  };

  const handleRejectUser = (userId: string) => {
    if (window.confirm(isUrdu ? 'کیا آپ واقعی اس رجسٹریشن درخواست کو مسترد کرنا چاہتے ہیں؟' : 'Are you sure you want to reject this registration request?')) {
      const res = rejectUserRegistration(userId);
      if (res.success) {
        refreshUsersList();
      } else {
        alert(res.error);
      }
    }
  };
  
  // Add User Form State
  const [formName, setFormName] = useState<string>('');
  const [formUsername, setFormUsername] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formCanExcel, setFormCanExcel] = useState<boolean>(true);
  const [formCanPdf, setFormCanPdf] = useState<boolean>(true);
  const [formCanWhatsApp, setFormCanWhatsApp] = useState<boolean>(true);
  const [formStatusMsg, setFormStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Refresh users on modal open
  React.useEffect(() => {
    if (isOpen) {
      setUsers(getStoredUsers());
      setFormStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const refreshUsersList = () => {
    const fresh = getStoredUsers();
    setUsers(fresh);
    onUsersUpdated();
  };

  // Toggle permission directly
  const handleTogglePermission = (
    userId: string,
    permKey: 'canExportExcel' | 'canExportPdf' | 'canSendWhatsApp',
    currentVal: boolean
  ) => {
    updateUserPermissions(userId, { [permKey]: !currentVal });
    refreshUsersList();
  };

  // Delete user
  const handleDeleteUser = (userId: string, username: string) => {
    if (window.confirm(isUrdu ? `کیا آپ واقعی صارف '${username}' کو ڈیلیٹ کرنا چاہتے ہیں؟` : `Are you sure you want to delete user '${username}'?`)) {
      const res = deleteUser(userId);
      if (res.success) {
        refreshUsersList();
      } else {
        alert(res.error);
      }
    }
  };

  // Handle Add New User Submission
  const handleAddUserSubmit = (role: UserRole) => {
    setFormStatusMsg(null);

    if (!formUsername.trim()) {
      setFormStatusMsg({
        type: 'error',
        text: isUrdu ? 'صارف کا نام درج کرنا ضروری ہے!' : 'Username is required!'
      });
      return;
    }

    if (role !== 'buyer' && !formPassword.trim()) {
      setFormStatusMsg({
        type: 'error',
        text: isUrdu ? 'پاس ورڈ درج کرنا ضروری ہے!' : 'Password is required!'
      });
      return;
    }

    const res = addNewUser({
      name: formName.trim() || formUsername.trim(),
      username: formUsername.trim(),
      password: formPassword.trim(),
      role: role,
      canExportExcel: formCanExcel,
      canExportPdf: formCanPdf,
      canSendWhatsApp: formCanWhatsApp
    });

    if (!res.success) {
      setFormStatusMsg({
        type: 'error',
        text: res.error || 'Failed to add user'
      });
    } else {
      setFormStatusMsg({
        type: 'success',
        text: isUrdu ? 'نیا صارف کامیابی کے ساتھ شامل کر دیا گیا!' : 'New user successfully created!'
      });
      setFormName('');
      setFormUsername('');
      setFormPassword('');
      refreshUsersList();
      setTimeout(() => {
        setActiveTab('users');
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-4xl neu-raised-lg rounded-3xl p-4 sm:p-6 text-right max-h-[92vh] flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-150 relative">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/5 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <OrderLaLogo variant="icon" size="sm" />
            <div className={`w-9 h-9 rounded-2xl neu-inset-sm flex items-center justify-center font-black ${
              isSuperAdmin ? 'text-amber-500' : 'text-[var(--accent-blue)]'
            }`}>
              {isSuperAdmin ? <Crown className="w-5 h-5 text-amber-500" /> : <ShieldCheck className="w-5 h-5 text-[var(--accent-blue)]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[var(--text-main)] urdu-title">
                  {isSuperAdmin 
                    ? (isUrdu ? 'سپر ایڈمن کنٹرول کنسول (Lukilion)' : 'Super Admin Authority Console')
                    : (isUrdu ? 'ایڈمن یوزر مینجمنٹ اور نیا صارف شامل کریں' : 'Admin User Authority & New User')}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  isSuperAdmin 
                    ? 'bg-amber-500/20 text-amber-600 border-amber-500/30' 
                    : 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] border-[var(--accent-blue)]/30'
                }`}>
                  {isSuperAdmin 
                    ? (isUrdu ? 'مکمل اختیارات' : 'Full Authority') 
                    : (isUrdu ? 'ایڈمن اختیارات' : 'Admin Authority')}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                {isSuperAdmin
                  ? (isUrdu
                      ? 'نیا ایڈمن، نیا آڈیٹر شامل کریں اور ایکسل، پی ڈی ایف و واٹس ایپ کی اجازتیں کنٹرول کریں۔'
                      : 'Add new admins, auditors, and grant export permissions (Excel, PDF, WhatsApp).')
                  : (isUrdu
                      ? 'نیا خریدار یا آڈیٹر شامل کریں اور ٹیم کے برآمدی اختیارات کا انتظام کریں۔'
                      : 'Add new buyers or auditors and manage team export permissions.')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs inside Console */}
        <div className="flex items-center gap-2 py-3 border-b border-black/5 dark:border-white/10 shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('users');
              setFormStatusMsg(null);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'users'
                ? 'neu-btn active text-[var(--accent-blue)]'
                : 'neu-btn text-[var(--text-main)]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'صارفین اور اجازتیں' : 'Users & Permissions'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full neu-inset-sm font-mono font-bold">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pending');
              setFormStatusMsg(null);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'pending'
                ? 'neu-btn active text-amber-500'
                : 'neu-btn text-[var(--text-main)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'نئی رجسٹریشنز (منظوری)' : 'Pending Approvals'}</span>
            {pendingUsers.length > 0 ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-mono font-bold animate-pulse">
                {pendingUsers.length}
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full neu-inset-sm font-mono font-bold text-[var(--text-secondary)]">
                0
              </span>
            )}
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => {
                setActiveTab('add-admin');
                setFormStatusMsg(null);
                setFormCanExcel(true);
                setFormCanPdf(true);
                setFormCanWhatsApp(true);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'add-admin'
                  ? 'neu-btn active text-[var(--accent-blue)]'
                  : 'neu-btn text-[var(--text-main)]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isUrdu ? '+ نیا ایڈمن' : '+ New Admin'}</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab('add-auditor');
              setFormStatusMsg(null);
              setFormCanExcel(true);
              setFormCanPdf(true);
              setFormCanWhatsApp(false);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'add-auditor'
                ? 'neu-btn active text-purple-500'
                : 'neu-btn text-[var(--text-main)]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isUrdu ? '+ نیا آڈیٹر' : '+ New Auditor'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('add-buyer');
              setFormStatusMsg(null);
              setFormCanExcel(false);
              setFormCanPdf(false);
              setFormCanWhatsApp(true);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'add-buyer'
                ? 'neu-btn active text-emerald-500'
                : 'neu-btn text-[var(--text-main)]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isUrdu ? '+ نیا خریدار' : '+ New Buyer'}</span>
          </button>
        </div>

        {/* Tab 1: All Users & Permissions Management */}
        {activeTab === 'users' && (
          <div className="flex-1 py-3 overflow-y-auto space-y-3 pr-1">
            <div className="p-2.5 rounded-2xl neu-inset-sm flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
              <span>
                {isUrdu
                  ? 'سپر ایڈمن کسی بھی صارف کے لیے ایکسل، پی ڈی ایف یا واٹس ایپ رسائی کے بٹن پر کلک کر کے اجازت کو آن/آف کر سکتا ہے۔'
                  : 'Click on the permission chips below to instantly grant or revoke Excel, PDF, or WhatsApp access.'}
              </span>
            </div>

            <div className="space-y-2.5">
              {users.map((u) => {
                const isLukilion = u.username.toLowerCase() === 'lukilion';

                return (
                  <div
                    key={u.id}
                    className="p-3.5 sm:p-4 rounded-2xl neu-raised flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    {/* User Identity */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl neu-inset-sm flex items-center justify-center font-black">
                        {u.role === 'superadmin' ? (
                          <Crown className="w-4 h-4 text-amber-500" />
                        ) : u.role === 'admin' ? (
                          <ShieldCheck className="w-4 h-4 text-[var(--accent-blue)]" />
                        ) : u.role === 'auditor' ? (
                          <FileSpreadsheet className="w-4 h-4 text-purple-500" />
                        ) : (
                          <Users className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[var(--text-main)]">
                            {u.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.role === 'superadmin'
                                ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                                : u.role === 'admin'
                                ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                                : u.role === 'auditor'
                                ? 'bg-purple-500/20 text-purple-600 border border-purple-500/30'
                                : 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] font-mono">
                          User: <span className="font-bold text-[var(--text-main)]">{u.username}</span>
                          {u.password && ` | Pass: ${u.password}`}
                        </div>
                      </div>
                    </div>

                    {/* Permissions Controls (Excel, PDF, WhatsApp) */}
                    <div className="flex items-center flex-wrap gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-black/5 dark:border-white/10">
                      {/* Excel Toggle */}
                      <button
                        type="button"
                        disabled={isLukilion}
                        onClick={() => handleTogglePermission(u.id, 'canExportExcel', !!u.canExportExcel)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 select-none ${
                          u.canExportExcel
                            ? 'neu-btn active text-emerald-600 dark:text-emerald-400'
                            : 'neu-btn text-[var(--text-secondary)] opacity-60'
                        } ${isLukilion ? 'cursor-default' : 'cursor-pointer'}`}
                        title="Excel Export Access"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Excel: {u.canExportExcel ? 'مجاز (Yes)' : 'غیر مجاز (No)'}</span>
                      </button>

                      {/* PDF Toggle */}
                      <button
                        type="button"
                        disabled={isLukilion}
                        onClick={() => handleTogglePermission(u.id, 'canExportPdf', !!u.canExportPdf)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 select-none ${
                          u.canExportPdf
                            ? 'neu-btn active text-indigo-600 dark:text-indigo-400'
                            : 'neu-btn text-[var(--text-secondary)] opacity-60'
                        } ${isLukilion ? 'cursor-default' : 'cursor-pointer'}`}
                        title="PDF / Print Access"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>PDF: {u.canExportPdf ? 'مجاز (Yes)' : 'غیر مجاز (No)'}</span>
                      </button>

                      {/* WhatsApp Toggle */}
                      <button
                        type="button"
                        disabled={isLukilion}
                        onClick={() => handleTogglePermission(u.id, 'canSendWhatsApp', !!u.canSendWhatsApp)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 select-none ${
                          u.canSendWhatsApp
                            ? 'neu-btn active text-emerald-600 dark:text-emerald-400'
                            : 'neu-btn text-[var(--text-secondary)] opacity-60'
                        } ${isLukilion ? 'cursor-default' : 'cursor-pointer'}`}
                        title="WhatsApp Send/Redirect Access"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp: {u.canSendWhatsApp ? 'مجاز (Yes)' : 'غیر مجاز (No)'}</span>
                      </button>

                      {/* Delete User Button (Disabled for Lukilion) */}
                      {!isLukilion && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-rose-500 hover:text-rose-600 cursor-pointer"
                          title={isUrdu ? 'صارف کو ڈیلیٹ کریں' : 'Delete user'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Pending Registrations & Access Approval */}
        {activeTab === 'pending' && (
          <div className="flex-1 py-3 overflow-y-auto space-y-3 pr-1">
            {/* SuperAdmin Notification Target Info */}
            <div className="p-3 rounded-2xl neu-inset-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[var(--text-secondary)] font-medium">
                  {isUrdu 
                    ? `تمام رجسٹریشنز کی اطلاعی ای میلز بطور ڈیفالٹ سپر ایڈمن کو بھیجی جاتی ہیں:`
                    : `Notification emails are configured to notify superadmin:`}
                </span>
                <span className="font-mono font-bold text-[var(--accent-blue)]">{SUPER_ADMIN_NOTIFICATION_EMAIL}</span>
              </div>
              <a
                href={`mailto:${SUPER_ADMIN_NOTIFICATION_EMAIL}?subject=OrderLa%20Access%20Review`}
                className="px-3 py-1.5 rounded-xl neu-btn text-[11px] font-bold text-[var(--accent-blue)] inline-flex items-center gap-1 self-end sm:self-auto cursor-pointer"
              >
                <Mail className="w-3 h-3" />
                <span>{isUrdu ? 'ای میل ان باکس کھولیں' : 'Open Mailbox'}</span>
              </a>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full neu-inset-sm flex items-center justify-center mx-auto text-emerald-500">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-[var(--text-main)] urdu-title">
                  {isUrdu ? 'کوئی نئی رجسٹریشن زیرِ التواء نہیں ہے' : 'No Pending Registrations'}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] font-medium max-w-sm mx-auto">
                  {isUrdu 
                    ? 'تمام صارفین تصدیق شدہ ہیں اور متعلقہ لیول پر ایکٹو ہیں۔' 
                    : 'All users are approved and currently active.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((u) => {
                  return (
                    <div
                      key={u.id}
                      className="p-4 rounded-3xl neu-raised space-y-3 border-r-4 border-amber-500 transition-all text-right"
                    >
                      {/* User Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl neu-inset-sm flex items-center justify-center font-black text-amber-500 text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-[var(--text-main)] urdu-title">{u.name}</span>
                              <span className="text-[11px] font-mono text-[var(--accent-blue)]">@{u.username}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
                              <Clock className="w-3 h-3" />
                              <span>{u.createdAt}</span>
                            </div>
                          </div>
                        </div>

                        {/* Requested Tier Badge */}
                        <div className="text-left">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            {isUrdu ? 'مطلوبہ رسائی:' : 'Requested:'}{' '}
                            {u.requestedRole === 'admin'
                              ? isUrdu ? 'لیول 3 (ایڈمن)' : 'Level 3 (Admin)'
                              : u.requestedRole === 'auditor'
                              ? isUrdu ? 'لیول 2 (آڈیٹر)' : 'Level 2 (Auditor)'
                              : isUrdu ? 'لیول 1 (خریدار)' : 'Level 1 (Buyer)'}
                          </span>
                        </div>
                      </div>

                      {/* Contact Info & Notes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                        {u.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="font-bold">{isUrdu ? 'فون / واٹس ایپ:' : 'Phone:'}</span>
                            <span className="font-mono text-[var(--text-main)]" dir="ltr">{u.phone}</span>
                          </div>
                        )}
                        {u.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                            <span className="font-bold">{isUrdu ? 'ای میل:' : 'Email:'}</span>
                            <span className="text-[var(--text-main)]">{u.email}</span>
                          </div>
                        )}
                        {u.notes && (
                          <div className="sm:col-span-2 text-[11px] bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                            <span className="font-bold">{isUrdu ? 'نوٹ / برانچ:' : 'Notes:'} </span>
                            <span>{u.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Approval Actions: 3 Access Level Tiers + Reject */}
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-black/5 dark:border-white/5">
                        <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                          {isUrdu ? 'رسائی لیول تفویض کریں (Grant Level):' : 'Grant Access Level:'}
                        </span>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Level 1: Buyer */}
                          <button
                            type="button"
                            onClick={() => handleApproveUser(u.id, 'buyer')}
                            className="px-2.5 py-1.5 rounded-xl neu-btn text-[11px] font-bold text-emerald-600 hover:bg-emerald-500/10 cursor-pointer flex items-center gap-1"
                            title="Grant Level 1 Buyer Access"
                          >
                            <Check className="w-3 h-3" />
                            <span>{isUrdu ? 'لیول 1: خریدار' : 'Level 1: Buyer'}</span>
                          </button>

                          {/* Level 2: Auditor */}
                          <button
                            type="button"
                            onClick={() => handleApproveUser(u.id, 'auditor')}
                            className="px-2.5 py-1.5 rounded-xl neu-btn text-[11px] font-bold text-purple-600 hover:bg-purple-500/10 cursor-pointer flex items-center gap-1"
                            title="Grant Level 2 Auditor Access"
                          >
                            <Check className="w-3 h-3" />
                            <span>{isUrdu ? 'لیول 2: آڈیٹر' : 'Level 2: Auditor'}</span>
                          </button>

                          {/* Level 3: Admin */}
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleApproveUser(u.id, 'admin')}
                              className="px-2.5 py-1.5 rounded-xl neu-btn text-[11px] font-bold text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/10 cursor-pointer flex items-center gap-1"
                              title="Grant Level 3 Admin Access"
                            >
                              <Check className="w-3 h-3" />
                              <span>{isUrdu ? 'لیول 3: ایڈمن' : 'Level 3: Admin'}</span>
                            </button>
                          )}

                          {/* Reject Request */}
                          <button
                            type="button"
                            onClick={() => handleRejectUser(u.id)}
                            className="px-2.5 py-1.5 rounded-xl neu-btn text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer flex items-center gap-1"
                            title="Reject Registration"
                          >
                            <UserX className="w-3 h-3" />
                            <span>{isUrdu ? 'مسترد' : 'Reject'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2, 3, 4: Add New User Form */}
        {activeTab !== 'users' && activeTab !== 'pending' && (
          <div className="flex-1 py-4 overflow-y-auto space-y-4 max-w-lg mx-auto w-full">
            <div className="neu-inset-sm rounded-2xl p-3 text-center space-y-1">
              <h4 className="font-extrabold text-sm text-[var(--text-main)] urdu-title">
                {activeTab === 'add-admin'
                  ? isUrdu ? 'نیا ایڈمن اکاؤنٹ بنائیں' : 'Create New Admin Account'
                  : activeTab === 'add-auditor'
                  ? isUrdu ? 'نیا آڈیٹر اکاؤنٹ بنائیں' : 'Create New Auditor Account'
                  : isUrdu ? 'نیا خریدار اکاؤنٹ بنائیں' : 'Create New Buyer Account'}
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {isUrdu
                  ? 'صارف نام، پاس ورڈ اور مطلوبہ ایکسپورٹ اجازتیں منتخب کریں۔'
                  : 'Enter credentials and set authorized permissions.'}
              </p>
            </div>

            {formStatusMsg && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                  formStatusMsg.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-500'
                }`}
              >
                {formStatusMsg.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{formStatusMsg.text}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {isUrdu ? 'پورا نام (Full Name):' : 'Full Name:'}
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Aslam Khan (Manager)"
                  className="w-full py-2.5 px-3.5 rounded-2xl neu-input text-xs font-bold text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {isUrdu ? 'لاگ ان یوزر نیم (Username):' : 'Login Username:'}
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="e.g. admin_aslam"
                  className="w-full py-2.5 px-3.5 rounded-2xl neu-input text-xs font-bold text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">
                  {isUrdu ? 'لاگ ان پاس ورڈ (Password):' : 'Login Password:'}
                </label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="e.g. Aslam@123"
                  className="w-full py-2.5 px-3.5 rounded-2xl neu-input text-xs font-mono font-bold text-[var(--text-main)]"
                />
              </div>

              {/* Permissions Checkboxes */}
              <div className="pt-2 space-y-2">
                <span className="block font-extrabold text-[var(--text-main)]">
                  {isUrdu ? 'ایکسپورٹ و ری ڈائریکشن اجازتیں:' : 'Export & Redirection Authorities:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormCanExcel(!formCanExcel)}
                    className={`p-2.5 rounded-xl font-bold transition-all flex items-center justify-between cursor-pointer ${
                      formCanExcel
                        ? 'neu-btn active text-emerald-600'
                        : 'neu-btn text-[var(--text-secondary)]'
                    }`}
                  >
                    <span>Excel Export</span>
                    <span className="text-[10px] font-mono">{formCanExcel ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormCanPdf(!formCanPdf)}
                    className={`p-2.5 rounded-xl font-bold transition-all flex items-center justify-between cursor-pointer ${
                      formCanPdf
                        ? 'neu-btn active text-indigo-600'
                        : 'neu-btn text-[var(--text-secondary)]'
                    }`}
                  >
                    <span>PDF / Print</span>
                    <span className="text-[10px] font-mono">{formCanPdf ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormCanWhatsApp(!formCanWhatsApp)}
                    className={`p-2.5 rounded-xl font-bold transition-all flex items-center justify-between cursor-pointer ${
                      formCanWhatsApp
                        ? 'neu-btn active text-emerald-600'
                        : 'neu-btn text-[var(--text-secondary)]'
                    }`}
                  >
                    <span>WhatsApp</span>
                    <span className="text-[10px] font-mono">{formCanWhatsApp ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() =>
                    handleAddUserSubmit(
                      activeTab === 'add-admin'
                        ? 'admin'
                        : activeTab === 'add-auditor'
                        ? 'auditor'
                        : 'buyer'
                    )
                  }
                  className="w-full py-3 rounded-2xl neu-btn-accent text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {isUrdu ? 'صارف اکاؤنٹ محفوظ کریں' : 'Save New User Account'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Ribbon */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] shrink-0">
          <span>
            {isUrdu ? 'سپر ایڈمن صارف:' : 'Super Admin:'} <strong className="text-amber-500 font-mono">Lukilion</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl neu-btn text-xs font-bold text-[var(--text-main)] cursor-pointer"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
