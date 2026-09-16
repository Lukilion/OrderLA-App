import React from 'react';
import { 
  Home, 
  FileText, 
  History, 
  Bell, 
  User,
  LucideIcon 
} from 'lucide-react';
import { PrimaryNavTab, Language } from '../types';

interface MobileBottomNavProps {
  activeTab: PrimaryNavTab;
  onSelectTab: (tab: PrimaryNavTab) => void;
  language: Language;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  language,
  unreadCount = 0
}) => {
  const isUrdu = language === 'ur';

  // 5 Options with Home in the exact center:
  // 1. Saved Order
  // 2. History
  // 3. Home (in the center of all)
  // 4. Notifications
  // 5. Profile
  const tabs: {
    id: PrimaryNavTab;
    labelEn: string;
    labelUrdu: string;
    icon: LucideIcon;
    isCenter?: boolean;
  }[] = [
    {
      id: 'saved-orders',
      labelEn: 'Saved Order',
      labelUrdu: 'محفوظ آرڈر',
      icon: FileText
    },
    {
      id: 'history',
      labelEn: 'History',
      labelUrdu: 'تاریخچہ',
      icon: History
    },
    {
      id: 'home',
      labelEn: 'Home',
      labelUrdu: 'ہوم',
      icon: Home,
      isCenter: true
    },
    {
      id: 'notifications',
      labelEn: 'Notifications',
      labelUrdu: 'اطلاعات',
      icon: Bell
    },
    {
      id: 'profile',
      labelEn: 'Profile',
      labelUrdu: 'پروفائل',
      icon: User
    }
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-2 pt-1 pointer-events-none no-print select-none"
      aria-label="Mobile Bottom Navigation"
    >
      {/* Full width rounded bar container matching Annotation 2026-09-16 182105k */}
      <div className="w-full max-w-lg mx-auto pointer-events-auto rounded-3xl neu-raised-lg bg-[var(--bg-canvas)] border border-white/60 dark:border-white/10 shadow-2xl relative flex items-center justify-around h-16 sm:h-18 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className="relative flex-1 flex flex-col items-center justify-center h-full cursor-pointer group transition-all"
                title={isUrdu ? tab.labelUrdu : tab.labelEn}
                aria-label={isUrdu ? tab.labelUrdu : tab.labelEn}
              >
                {/* Center Circular Button: Rounded outline only (no filled blue) and elevated upward so it doesn't touch the curve */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 border-2 -translate-y-2.5 sm:-translate-y-3 ${
                    isActive
                      ? 'border-[var(--accent-blue)] bg-[var(--bg-canvas)] text-[var(--accent-blue)] shadow-[0_2px_12px_rgba(10,132,255,0.25)] scale-105 neu-raised'
                      : 'border-[var(--text-secondary)]/30 bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--accent-blue)]/60 hover:text-[var(--accent-blue)] neu-raised'
                  }`}
                >
                  <Icon className="w-5.5 h-5.5 sm:w-6 sm:h-6" strokeWidth={2.2} />
                </div>

                {/* Subtle curve along with active tab under in mobile view (as shown in Annotation 2026-09-16 182105h) */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none">
                    <svg
                      viewBox="0 0 50 14"
                      className="w-11 h-2.5 sm:h-3 text-[var(--accent-blue)]"
                      fill="currentColor"
                    >
                      <path d="M0 14 C12 14 16 0 25 0 C34 0 38 14 50 14 Z" />
                    </svg>
                  </div>
                )}
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center h-full cursor-pointer group transition-all"
              title={isUrdu ? tab.labelUrdu : tab.labelEn}
              aria-label={isUrdu ? tab.labelUrdu : tab.labelEn}
            >
              <div
                className={`p-2 rounded-2xl transition-all duration-200 relative ${
                  isActive
                    ? 'text-[var(--accent-blue)] -translate-y-0.5 scale-110'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:scale-105'
                }`}
              >
                <Icon className="w-6 h-6" />

                {/* Notification Badge on Bell */}
                {tab.id === 'notifications' && unreadCount > 0 && (
                  <span className="absolute 0 top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-[var(--bg-canvas)] animate-pulse" />
                )}
              </div>

              {/* Subtle curve along with active tab under in mobile view (as shown in Annotation 2026-09-16 182105h) */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none">
                  <svg
                    viewBox="0 0 50 14"
                    className="w-11 h-3 text-[var(--accent-blue)]"
                    fill="currentColor"
                  >
                    <path d="M0 14 C12 14 16 0 25 0 C34 0 38 14 50 14 Z" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
