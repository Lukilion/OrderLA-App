import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Check, 
  UserX, 
  Clock, 
  ShieldCheck, 
  ShoppingBag, 
  FileSpreadsheet, 
  Crown, 
  Phone, 
  Mail, 
  MessageSquare, 
  ExternalLink,
  Sliders
} from 'lucide-react';
import { UserAccount, UserRole, Language } from '../types';
import { 
  getPendingRegistrations, 
  approveUserRegistration, 
  rejectUserRegistration,
  SUPER_ADMIN_NOTIFICATION_EMAIL
} from '../utils/authManager';

interface PendingApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser: UserAccount;
  onApprovalsChanged: () => void;
  onOpenFullConsole?: () => void;
}

export const PendingApprovalsModal: React.FC<PendingApprovalsModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUser,
  onApprovalsChanged,
  onOpenFullConsole
}) => {
  const isUrdu = language === 'ur';
  const isSuperAdmin = currentUser.role === 'superadmin' || currentUser.username.toLowerCase() === 'lukilion';

  const [pendingList, setPendingList] = useState<UserAccount[]>([]);
  const [selectedRoleMap, setSelectedRoleMap] = useState<{ [userId: string]: UserRole }>({});
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshList = () => {
    const list = getPendingRegistrations();
    setPendingList(list);
    // Initialize selected role to requestedRole or 'buyer'
    const roleMap: { [userId: string]: UserRole } = {};
    list.forEach((u) => {
      roleMap[u.id] = u.requestedRole || 'buyer';
    });
    setSelectedRoleMap(roleMap);
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
      setActionFeedback(null);
      const handleSync = () => refreshList();
      window.addEventListener('orderla_users_updated', handleSync);
      return () => window.removeEventListener('orderla_users_updated', handleSync);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApprove = (userId: string, targetUsername: string) => {
    const roleToGrant = selectedRoleMap[userId] || 'buyer';
    // If not super admin and trying to grant admin, downgrade to buyer
    const safeRole = !isSuperAdmin && roleToGrant === 'admin' ? 'buyer' : roleToGrant;

    const res = approveUserRegistration(userId, safeRole);
    if (res.success) {
      setActionFeedback({
        type: 'success',
        text: isUrdu 
          ? `صارف @${targetUsername} کو بحیثیت '${safeRole.toUpperCase()}' کامیابی کے ساتھ منظور کر لیا گیا ہے` 
          : `User @${targetUsername} has been approved as '${safeRole.toUpperCase()}'`
      });
      refreshList();
      onApprovalsChanged();
    } else {
      setActionFeedback({
        type: 'error',
        text: res.error || (isUrdu ? 'منظوری میں خرابی پیش آئی' : 'Failed to approve user')
      });
    }
  };

  const handleReject = (userId: string, targetUsername: string) => {
    const confirmMsg = isUrdu 
      ? `کیا آپ واقعی صارف @${targetUsername} کی رجسٹریشن درخواست مسترد کرنا چاہتے ہیں؟`
      : `Are you sure you want to reject the registration request for @${targetUsername}?`;

    if (window.confirm(confirmMsg)) {
      const res = rejectUserRegistration(userId);
      if (res.success) {
        setActionFeedback({
          type: 'success',
          text: isUrdu 
            ? `صارف @${targetUsername} کی درخواست مسترد کر دی گئی ہے` 
            : `Registration request for @${targetUsername} was declined`
        });
        refreshList();
        onApprovalsChanged();
      } else {
        setActionFeedback({
          type: 'error',
          text: res.error || (isUrdu ? 'مسترد کرنے میں خرابی' : 'Failed to reject user')
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl neu-raised-lg rounded-3xl p-4 sm:p-6 space-y-4 max-h-[92vh] flex flex-col justify-between overflow-hidden shadow-2xl border border-black/5 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl neu-inset-sm flex items-center justify-center text-amber-500 relative">
              <Bell className="w-5 h-5 animate-bounce" />
              {pendingList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white font-mono text-[9px] font-black rounded-full flex items-center justify-center">
                  {pendingList.length}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[var(--text-main)] urdu-title">
                  {isUrdu ? 'نئی رجسٹریشنز و رسائی منظوری' : 'Incoming Registration Requests'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                  {pendingList.length} {isUrdu ? 'زیرِ جائزہ' : 'Pending'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                {isUrdu 
                  ? 'صرف ایڈمن یا سپر ایڈمن حتمی فیصلہ کر کے ایپ کے استعمال کی منظوری دے سکتے ہیں'
                  : 'Final decision & access approval is strictly authorized by Admin / Super Admin'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-500 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div 
            className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in shrink-0 ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-500'
            }`}
          >
            <span>{actionFeedback.text}</span>
            <button 
              type="button" 
              onClick={() => setActionFeedback(null)}
              className="text-[10px] opacity-75 hover:opacity-100 font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {/* List Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {pendingList.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full neu-inset-sm flex items-center justify-center mx-auto text-emerald-500">
                <Check className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-[var(--text-main)] urdu-title">
                  {isUrdu ? 'کوئی نئی رجسٹریشن زیرِ جائزہ نہیں ہے' : 'No Pending Registration Requests'}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  {isUrdu 
                    ? 'تمام موصولہ رجسٹریشنز منظور یا پروسیس ہو چکی ہیں۔ نئی درخواست آتے ہی نوٹیفیکیشن گھنٹی الرٹ دے گی۔'
                    : 'All submitted requests have been approved or processed. New requests will alert this bell.'}
                </p>
              </div>
            </div>
          ) : (
            pendingList.map((user) => {
              const currentGrantedRole = selectedRoleMap[user.id] || user.requestedRole || 'buyer';

              return (
                <div 
                  key={user.id}
                  className="p-3.5 sm:p-4 rounded-2xl neu-raised space-y-3 border border-black/5 dark:border-white/5 transition hover:shadow-md"
                >
                  {/* Applicant Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl neu-inset-sm flex items-center justify-center font-bold text-xs text-[var(--accent-blue)]">
                        @{user.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[var(--text-main)]">{user.name}</span>
                          <span className="font-mono text-xs font-bold text-[var(--accent-blue)]">@{user.username}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{user.createdAt}</span>
                          {user.notes && (
                            <span className="truncate max-w-[200px] text-amber-600 dark:text-amber-400">
                              &bull; {user.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Requested Role Badge */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-[10px] text-[var(--text-secondary)] font-bold">
                        {isUrdu ? 'درخواست شدہ لیول:' : 'Requested:'}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl neu-inset-sm text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        {user.requestedRole === 'admin' ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                            <span>{isUrdu ? 'لیول 3: ایڈمن' : 'Level 3: Admin'}</span>
                          </>
                        ) : user.requestedRole === 'auditor' ? (
                          <>
                            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" />
                            <span>{isUrdu ? 'لیول 2: آڈیٹر' : 'Level 2: Auditor'}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{isUrdu ? 'لیول 1: خریدار' : 'Level 1: Buyer'}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Contact Chips */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {user.phone && (
                      <a
                        href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-xl neu-btn text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:bg-emerald-500/10 cursor-pointer"
                        title="WhatsApp Contact"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{user.phone}</span>
                      </a>
                    )}
                    {user.email && (
                      <a
                        href={`mailto:${user.email}`}
                        className="px-2.5 py-1 rounded-xl neu-btn text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-main)] flex items-center gap-1 cursor-pointer"
                        title="Email Applicant"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </a>
                    )}
                  </div>

                  {/* Grant Access Authority Selector & Approval Controls */}
                  <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-black/[0.02] dark:bg-white/[0.02] p-2.5 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-[var(--text-secondary)] whitespace-nowrap">
                        {isUrdu ? 'منظور شدہ رول لیول:' : 'Assign Access Level:'}
                      </span>
                      <select
                        value={currentGrantedRole}
                        onChange={(e) => {
                          const newR = e.target.value as UserRole;
                          setSelectedRoleMap((prev) => ({ ...prev, [user.id]: newR }));
                        }}
                        className="bg-[var(--bg-canvas)] text-xs font-bold text-[var(--text-main)] py-1.5 px-2.5 rounded-xl neu-inset-sm border-0 cursor-pointer focus:outline-hidden"
                      >
                        <option value="buyer">🛍️ {isUrdu ? 'لیول 1: خریدار (Buyer)' : 'Level 1: Buyer'}</option>
                        <option value="auditor">📊 {isUrdu ? 'لیول 2: آڈیٹر (Auditor)' : 'Level 2: Auditor'}</option>
                        {isSuperAdmin && (
                          <option value="admin">🛡️ {isUrdu ? 'لیول 3: آپریشنل ایڈمن (Admin)' : 'Level 3: Operational Admin'}</option>
                        )}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      {/* Reject Button */}
                      <button
                        type="button"
                        onClick={() => handleReject(user.id, user.username)}
                        className="px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer flex items-center gap-1 transition"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'مسترد کریں' : 'Reject'}</span>
                      </button>

                      {/* Approve Button */}
                      <button
                        type="button"
                        onClick={() => handleApprove(user.id, user.username)}
                        className="px-4 py-1.5 rounded-xl neu-btn text-xs font-black text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 cursor-pointer transition shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{isUrdu ? 'منظور کریں اور رسائی دیں' : 'Approve & Grant Access'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2 shrink-0">
          {onOpenFullConsole && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullConsole();
              }}
              className="px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-[var(--accent-blue)] flex items-center gap-1.5 cursor-pointer hover:underline"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'مکمل سپر ایڈمن کنسول کھولیں' : 'Open Super Admin Console'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl neu-btn text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer ml-auto"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
