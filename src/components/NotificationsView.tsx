import React, { useState } from 'react';
import { 
  AppNotification, 
  Language, 
  PrimaryNavTab 
} from '../types';
import { 
  markNotificationRead, 
  markAllNotificationsRead 
} from '../utils/notificationsManager';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Package, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  ArrowRight 
} from 'lucide-react';

interface NotificationsViewProps {
  notifications: AppNotification[];
  language: Language;
  onNavigateTab: (tab: PrimaryNavTab) => void;
  onToast: (msg: string) => void;
  onRefreshNotifications: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  language,
  onNavigateTab,
  onToast,
  onRefreshNotifications
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'stock' | 'system'>('all');

  const isUrdu = language === 'ur';

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'stock') return n.type === 'stock';
    if (filter === 'system') return n.type === 'system' || n.type === 'approval';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    onRefreshNotifications();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead(notifications);
    onRefreshNotifications();
    onToast(isUrdu ? 'تمام اطلاعات پڑھ لی گئیں' : 'All notifications marked as read');
  };

  const getIcon = (type: AppNotification['type'], severity: AppNotification['severity']) => {
    if (severity === 'urgent') {
      return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    }
    if (severity === 'warning') {
      return <Package className="w-5 h-5 text-amber-500" />;
    }
    if (type === 'approval') {
      return <ShieldAlert className="w-5 h-5 text-purple-500" />;
    }
    if (severity === 'success') {
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    }
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neu-raised-lg rounded-3xl p-5 sm:p-6 bg-[var(--bg-canvas)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl neu-inset-sm flex items-center justify-center text-[var(--accent-blue)] relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-[var(--bg-canvas)] animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-main)] urdu-title">
                {isUrdu ? 'اطلاعات و الرٹس سنٹر (Notifications)' : 'Notifications & Alerts'}
              </h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold font-mono">
                  {unreadCount} {isUrdu ? 'نئی' : 'new'}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {isUrdu
                ? 'اسٹاک الرٹس، فوری ڈیمانڈ انتباہات اور سسٹم کی تازہ ترین اطلاعات'
                : 'Real-time stock depletion alerts, critical demand warnings, and approval cues'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl neu-btn text-xs font-bold text-[var(--text-main)] hover:text-[var(--accent-blue)] cursor-pointer transition"
          >
            <CheckCheck className="w-4 h-4 text-[var(--accent-blue)]" />
            <span>{isUrdu ? 'سب پڑھ لیا گیا (Mark All Read)' : 'Mark All Read'}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl neu-inset-sm max-w-fit">
        {[
          { id: 'all', labelEn: 'All Alerts', labelUrdu: 'تمام اطلاعات' },
          { id: 'unread', labelEn: `Unread (${unreadCount})`, labelUrdu: `غیر مطالعہ شدہ (${unreadCount})` },
          { id: 'stock', labelEn: 'Stock Alerts', labelUrdu: 'اسٹاک الرٹس' },
          { id: 'system', labelEn: 'System & Security', labelUrdu: 'سسٹم و سیکیورٹی' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filter === tab.id
                ? 'neu-btn-accent text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
            }`}
          >
            {isUrdu ? tab.labelUrdu : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Notification Cards List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="neu-raised-lg rounded-3xl p-10 text-center space-y-2 bg-[var(--bg-canvas)]">
            <Bell className="w-10 h-10 mx-auto text-[var(--text-secondary)]" />
            <h3 className="text-sm font-bold text-[var(--text-main)]">
              {isUrdu ? 'اس وقت کوئی نئی اطلاع موجود نہیں ہے' : 'No notifications in this filter'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isUrdu
                ? 'سسٹم کے تمام الرٹس کلیئر ہیں اور تمام آپریشنز معمول کے مطابق چل رہے ہیں۔'
                : 'Everything is running smoothly. Stock or system alerts will appear here.'}
            </p>
          </div>
        ) : (
          filtered.map((notif) => {
            return (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={`neu-raised rounded-3xl p-4 sm:p-5 bg-[var(--bg-canvas)] transition-all cursor-pointer hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 rtl:border-l-0 rtl:border-r-4 ${
                  notif.severity === 'urgent'
                    ? 'border-l-rose-500 rtl:border-r-rose-500'
                    : notif.severity === 'warning'
                    ? 'border-l-amber-500 rtl:border-r-amber-500'
                    : notif.severity === 'success'
                    ? 'border-l-emerald-500 rtl:border-r-emerald-500'
                    : 'border-l-blue-500 rtl:border-r-blue-500'
                } ${!notif.isRead ? 'ring-1 ring-[var(--accent-blue)]/30' : 'opacity-85'}`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl neu-inset-sm flex items-center justify-center shrink-0">
                    {getIcon(notif.type, notif.severity)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-[var(--text-main)]">
                        {isUrdu ? notif.titleUrdu : notif.titleEn}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-blue)]" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] max-w-xl">
                      {isUrdu ? notif.messageUrdu : notif.messageEn}
                    </p>
                  </div>
                </div>

                {/* Action button to jump to route */}
                {notif.actionRoute && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notif.id);
                      if (notif.actionRoute) onNavigateTab(notif.actionRoute);
                    }}
                    className="self-end sm:self-center inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl neu-btn text-xs font-bold text-[var(--accent-blue)] hover:neu-btn-accent hover:text-white transition cursor-pointer"
                  >
                    <span>{isUrdu ? 'ملاحظہ کریں' : 'Take Action'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
