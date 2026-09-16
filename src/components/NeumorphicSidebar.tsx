import React from 'react';
import { 
  TableProperties, 
  Star, 
  AlertTriangle, 
  Store, 
  Warehouse, 
  PieChart, 
  Database,
  Crown, 
  ShieldCheck, 
  ShoppingBag, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Bell, 
  LogOut, 
  Zap,
  Activity,
  Layers,
  Building2,
  Lock
} from 'lucide-react';
import { NavRoute, UserRole, Language, UserAccount } from '../types';
import { OrderLaLogo } from './OrderLaLogo';

export interface NeumorphicSidebarProps {
  routes: NavRoute[];
  activeRoute: string;
  onSelectRoute: (routeId: string) => void;
  userRole: UserRole;
  currentUser: UserAccount;
  language: Language;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onRequestRoleSwitch: (role: UserRole) => void;
  onOpenSuperAdminConsole?: () => void;
  onOpenApprovals?: () => void;
  pendingApprovalsCount?: number;
  onLogout?: () => void;
  itemsCount: {
    total: number;
    demand: number;
    lowStock: number;
    shalmi: number;
    kashif: number;
  };
}

export const NeumorphicSidebar: React.FC<NeumorphicSidebarProps> = ({
  routes,
  activeRoute,
  onSelectRoute,
  userRole,
  currentUser,
  language,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onRequestRoleSwitch,
  onOpenSuperAdminConsole,
  onOpenApprovals,
  pendingApprovalsCount = 0,
  onLogout,
  itemsCount
}) => {
  const isUrdu = language === 'ur';
  const isSuperAdmin = currentUser.role === 'superadmin' || currentUser.username.toLowerCase() === 'lukilion';
  const isAdmin = currentUser.role === 'admin';
  const canManageUsers = isSuperAdmin || isAdmin;

  // Icon Resolver
  const renderIcon = (iconName: string, active: boolean) => {
    const cls = `w-5 h-5 shrink-0 transition-transform duration-200 ${
      active 
        ? 'text-[var(--accent-blue)] scale-110 drop-shadow-[0_0_8px_rgba(0,123,255,0.4)]' 
        : 'text-[var(--text-secondary)] group-hover:text-[var(--accent-blue)] group-hover:scale-105'
    }`;

    switch (iconName) {
      case 'fa-table-list':
        return <TableProperties className={cls} />;
      case 'fa-star':
        return <Star className={cls} />;
      case 'fa-bolt':
        return <Zap className={cls} />;
      case 'fa-triangle-exclamation':
        return <AlertTriangle className={cls} />;
      case 'fa-shop':
        return <Store className={cls} />;
      case 'fa-warehouse':
        return <Warehouse className={cls} />;
      case 'fa-chart-pie':
        return <PieChart className={cls} />;
      case 'fa-database':
        return <Database className={cls} />;
      case 'fa-crown':
        return <Crown className={cls} />;
      default:
        return <Activity className={cls} />;
    }
  };

  // Dynamic Badge resolver
  const getDynamicBadge = (routeId: string): number | string | undefined => {
    switch (routeId) {
      case 'demand-sheet':
        return itemsCount.total;
      case 'priority-orders':
        return itemsCount.demand;
      case 'low-stock':
        return itemsCount.lowStock;
      case 'shalmi-market':
        return itemsCount.shalmi;
      case 'kashif-wholesale':
        return itemsCount.kashif;
      default:
        return undefined;
    }
  };

  // Group routes by section
  const sections = React.useMemo(() => {
    const map = new Map<string, { titleUrdu: string; titleEnglish: string; items: NavRoute[] }>();

    routes.forEach((route) => {
      const sectionKey = route.sectionEnglish || 'General';
      if (!map.has(sectionKey)) {
        map.set(sectionKey, {
          titleUrdu: route.sectionUrdu || 'عمومی',
          titleEnglish: route.sectionEnglish || 'General',
          items: []
        });
      }
      map.get(sectionKey)!.items.push(route);
    });

    return Array.from(map.values());
  }, [routes]);

  const sidebarContent = (
    <div className="flex flex-col h-full select-none justify-between overflow-hidden">
      {/* 1. Header & Brand Surface */}
      <div className={`pt-4 pb-3 ${isCollapsed ? 'px-2' : 'px-3'} shrink-0`}>
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2.5 justify-center' : 'justify-between gap-2'}`}>
          {/* Brand Logo & Tagline */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} overflow-hidden cursor-pointer`} onClick={() => onSelectRoute('demand-sheet')}>
            <div className="shrink-0 p-1.5 rounded-2xl neu-raised-flat transition-transform hover:scale-105 active:scale-95">
              <OrderLaLogo variant="icon" size="sm" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base tracking-tight text-[var(--text-main)] font-mono">
                    OrderLa
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md neu-inset-small text-[var(--accent-blue)]">
                    BOS
                  </span>
                </div>
                <span className="text-[11px] text-[var(--text-secondary)] font-medium truncate">
                  {isUrdu ? 'ہول سیل بزنس آپریٹنگ سسٹم' : 'Wholesale Business OS'}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl neu-raised-flat text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:neu-subtle-raised active:neu-inset-sunken transition-all cursor-pointer shrink-0"
            title={isCollapsed ? (isUrdu ? 'سائیڈبار پھیلائیں' : 'Expand Sidebar') : (isUrdu ? 'سائیڈبار سکیڑیں' : 'Collapse Sidebar')}
          >
            {isCollapsed ? (
              isUrdu ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              isUrdu ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-xl neu-raised-flat text-[var(--text-secondary)] hover:text-red-500 active:neu-inset-sunken transition-all cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Scrollable Navigation Routes List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-thin">
        {sections.map((section, sIdx) => (
          <div key={section.titleEnglish} className="space-y-1.5">
            {/* Section Heading */}
            {!isCollapsed ? (
              <div className="px-2 pt-1 pb-1 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] opacity-80 urdu-subheading">
                  {isUrdu ? section.titleUrdu : section.titleEnglish}
                </span>
                <span className="w-8 h-[2px] rounded-full neu-inset-small opacity-40"></span>
              </div>
            ) : (
              <div className="flex justify-center py-1">
                <div className="w-5 h-[3px] rounded-full neu-inset-small opacity-50" />
              </div>
            )}

            {/* Section Route Items */}
            <div className="space-y-1.5">
              {section.items.map((route) => {
                const active = activeRoute === route.id;
                const badge = getDynamicBadge(route.id);
                const primaryLabel = isUrdu ? route.labelUrdu : route.labelEnglish;
                const secondaryLabel = isUrdu ? route.labelEnglish : route.labelUrdu;

                return (
                  <button
                    key={route.id}
                    onClick={() => {
                      onSelectRoute(route.id);
                      if (isMobileOpen) onCloseMobile();
                    }}
                    className={`group w-full relative flex items-center rounded-2xl transition-all duration-200 cursor-pointer ${
                      isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5 gap-3'
                    } ${
                      active
                        ? 'neu-inset-sunken text-[var(--accent-blue)] font-bold'
                        : 'text-[var(--text-main)] hover:neu-subtle-raised hover:text-[var(--accent-blue)]'
                    }`}
                    title={`${primaryLabel} - ${secondaryLabel}`}
                  >
                    {/* Active Left Indicator Bar */}
                    {active && (
                      <span
                        className={`absolute top-2 bottom-2 w-1.5 rounded-full bg-[var(--accent-blue)] shadow-[0_0_8px_rgba(0,123,255,0.7)] ${
                          isUrdu ? '-right-1' : '-left-1'
                        }`}
                      />
                    )}

                    {/* Icon Container */}
                    <div className="shrink-0 flex items-center justify-center">
                      {renderIcon(route.icon, active)}
                    </div>

                    {/* Route Labels (when expanded) */}
                    {!isCollapsed && (
                      <div className="flex-1 flex flex-col text-left rtl:text-right overflow-hidden leading-tight">
                        <span className={`text-xs font-bold truncate ${active ? 'text-[var(--accent-blue)]' : 'text-[var(--text-main)]'}`}>
                          {primaryLabel}
                        </span>
                        {route.descriptionUrdu && (
                          <span className="text-[10px] text-[var(--text-secondary)] truncate opacity-75 font-normal">
                            {isUrdu ? route.descriptionUrdu : route.descriptionEnglish}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Badge Counter */}
                    {badge !== undefined && (
                      <span
                        className={`shrink-0 text-[10px] font-mono font-bold rounded-full transition-all ${
                          isCollapsed
                            ? 'absolute -top-1 -right-1 px-1.5 py-0.2 bg-[var(--accent-blue)] text-white shadow-xs'
                            : `px-2 py-0.5 ${
                                active
                                  ? 'bg-[var(--accent-blue)] text-white shadow-xs'
                                  : 'neu-inset-small text-[var(--text-secondary)]'
                              }`
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom User Profile & Authority Status Card */}
      <div className="p-3 shrink-0 space-y-2">
        {/* Pending Approvals Quick Alert (if superadmin/admin and pending > 0) */}
        {canManageUsers && pendingApprovalsCount > 0 && onOpenApprovals && (
          <button
            type="button"
            onClick={onOpenApprovals}
            className={`w-full p-2.5 rounded-2xl neu-raised-flat text-amber-600 dark:text-amber-400 hover:neu-subtle-raised active:neu-inset-sunken transition-all flex items-center gap-2.5 cursor-pointer ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
            title={isUrdu ? `${pendingApprovalsCount} منظوری کی درخواستیں` : `${pendingApprovalsCount} Pending Access Requests`}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-4 h-4 text-amber-500 animate-bounce" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              </div>
              {!isCollapsed && (
                <span className="text-xs font-bold truncate">
                  {isUrdu ? 'نئی درخواستیں' : 'Pending Approvals'}
                </span>
              )}
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-black bg-amber-500 text-white rounded-full shadow-xs">
              {pendingApprovalsCount}
            </span>
          </button>
        )}

        {/* User Card Container */}
        <div className={`p-2.5 rounded-2xl neu-raised-flat flex items-center transition-all ${
          isCollapsed ? 'flex-col gap-2 justify-center' : 'justify-between gap-2.5'
        }`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* Role Icon Avatar */}
            <div 
              className={`w-9 h-9 shrink-0 rounded-xl neu-inset-small flex items-center justify-center ${
                currentUser.role === 'superadmin' 
                  ? 'text-amber-500' 
                  : currentUser.role === 'admin' 
                    ? 'text-[var(--accent-blue)]' 
                    : currentUser.role === 'auditor' 
                      ? 'text-purple-500' 
                      : 'text-emerald-500'
              }`}
              title={currentUser.role.toUpperCase()}
            >
              {currentUser.role === 'superadmin' ? (
                <Crown className="w-5 h-5" />
              ) : currentUser.role === 'admin' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : currentUser.role === 'auditor' ? (
                <FileSpreadsheet className="w-5 h-5" />
              ) : (
                <ShoppingBag className="w-5 h-5" />
              )}
            </div>

            {/* User Details */}
            {!isCollapsed && (
              <div className="flex flex-col text-left rtl:text-right overflow-hidden leading-tight">
                <span className="text-xs font-extrabold text-[var(--text-main)] truncate">
                  {currentUser.name}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                    currentUser.role === 'superadmin' 
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' 
                      : currentUser.role === 'admin' 
                        ? 'bg-blue-500/15 text-[var(--accent-blue)]' 
                        : 'neu-inset-small text-[var(--text-secondary)]'
                  }`}>
                    {currentUser.role}
                  </span>
                  {currentUser.role === 'superadmin' && (
                    <span className="text-[10px] text-amber-500 font-bold">★</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Icons: Console & Logout */}
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-1.5' : 'gap-1'}`}>
            {canManageUsers && onOpenSuperAdminConsole && (
              <button
                type="button"
                onClick={onOpenSuperAdminConsole}
                className="p-1.5 rounded-xl neu-subtle-raised text-[var(--accent-blue)] hover:neu-inset-sunken transition cursor-pointer"
                title={isUrdu ? 'ایڈمن اختیارات کنسول' : 'Admin Authority Console'}
              >
                <Crown className="w-3.5 h-3.5" />
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-xl neu-subtle-raised text-red-500 hover:neu-inset-sunken transition cursor-pointer"
                title={isUrdu ? 'لاگ آؤٹ کریں' : 'Logout Session'}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop & Tablet Sticky Sidebar */}
      <aside
        role="navigation"
        aria-label="Enterprise Wholesale BOS Navigation"
        className={`hidden lg:flex flex-col shrink-0 sticky top-4 h-[calc(100vh-2rem)] rounded-3xl neu-raised-flat transition-all duration-300 z-30 ${
          isCollapsed ? 'w-24 xl:w-[6.5rem]' : 'w-64 xl:w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* 2. Mobile Off-Canvas Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* 3. Mobile Off-Canvas Drawer Container */}
      <aside
        role="navigation"
        aria-label="Mobile Navigation Drawer"
        className={`lg:hidden fixed inset-y-0 ${
          isUrdu ? 'right-0' : 'left-0'
        } w-72 max-w-[85vw] bg-[var(--bg-canvas)] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : isUrdu ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
