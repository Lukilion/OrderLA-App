import React, { useState, useRef, useEffect } from 'react';
import { 
  TableProperties, 
  Star, 
  AlertTriangle, 
  Store, 
  Warehouse, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronDown,
  Activity,
  Crown,
  Lock,
  User,
  ShoppingBag,
  FileSpreadsheet
} from 'lucide-react';
import { NavRoute, UserRole, Language, UserAccount } from '../types';

interface OrderLaTopNavProps {
  routes: NavRoute[];
  activeRoute: string;
  onSelectRoute: (routeId: string) => void;
  userRole: UserRole;
  currentUser: UserAccount;
  onRequestRoleSwitch: (role: UserRole) => void;
  onOpenSuperAdminConsole?: () => void;
  language: Language;
  itemsCount: {
    total: number;
    demand: number;
    lowStock: number;
    shalmi: number;
    kashif: number;
  };
}

export const OrderLaTopNav: React.FC<OrderLaTopNavProps> = ({
  routes,
  activeRoute,
  onSelectRoute,
  userRole,
  currentUser,
  onRequestRoleSwitch,
  onOpenSuperAdminConsole,
  language,
  itemsCount
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isUrdu = language === 'ur';

  // Close mobile menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const renderIcon = (iconName: string, active: boolean) => {
    const cls = `w-4 h-4 shrink-0 transition-colors ${
      active ? 'text-[var(--accent-blue)]' : 'text-[var(--text-secondary)]'
    }`;

    switch (iconName) {
      case 'fa-table-list':
        return <TableProperties className={cls} />;
      case 'fa-star':
        return <Star className={cls} />;
      case 'fa-triangle-exclamation':
        return <AlertTriangle className={cls} />;
      case 'fa-shop':
        return <Store className={cls} />;
      case 'fa-warehouse':
        return <Warehouse className={cls} />;
      case 'fa-chart-pie':
        return <FileSpreadsheet className={cls} />;
      default:
        return <Activity className={cls} />;
    }
  };

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

  // Find active route object for mobile title display
  const activeRouteObj = routes.find((r) => r.id === activeRoute) || routes[0];
  const isSuperAdmin = currentUser.role === 'superadmin' || currentUser.username.toLowerCase() === 'lukilion';

  return (
    <nav className="w-full neu-raised rounded-3xl p-2.5 sm:p-3 transition-all no-print">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        
        {/* Brand / OS Logo Left */}
        <div className="flex items-center gap-2.5 pl-1 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl neu-inset-sm flex items-center justify-center text-[var(--accent-blue)] font-black text-sm sm:text-base select-none">
            <span className="tracking-tighter">O</span>
            <span className="text-amber-500">L</span>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-[var(--text-main)] tracking-tight">
                OrderLa
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]">
                BOS
              </span>
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] font-medium -mt-0.5">
              {isUrdu ? 'ہول سیل بزنس آپریٹنگ سسٹم' : 'Wholesale Business OS'}
            </div>
          </div>
        </div>

        {/* Desktop Horizontal Navigation Links (hidden on screens < lg) */}
        <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 flex-1 justify-center max-w-4xl">
          {routes.map((route) => {
            const active = activeRoute === route.id;
            const badge = getDynamicBadge(route.id);
            const label = isUrdu ? route.labelUrdu : route.labelEnglish;

            return (
              <button
                key={route.id}
                onClick={() => onSelectRoute(route.id)}
                className={`relative px-3 py-2 xl:px-3.5 xl:py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 flex items-center gap-2 select-none cursor-pointer whitespace-nowrap ${
                  active
                    ? 'neu-btn active text-[var(--accent-blue)] shadow-inner'
                    : 'neu-btn text-[var(--text-main)] hover:text-[var(--accent-blue)]'
                }`}
                title={label}
              >
                {renderIcon(route.icon, active)}
                <span className="truncate">{label}</span>

                {badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                      active
                        ? 'bg-[var(--accent-blue)] text-white shadow-xs'
                        : 'neu-inset-sm text-[var(--text-secondary)]'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Role Selector & User Profile Strip */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Super Admin Console Trigger Button (Visible when logged in as Lukilion / SuperAdmin) */}
          {isSuperAdmin && onOpenSuperAdminConsole && (
            <button
              onClick={onOpenSuperAdminConsole}
              className="px-3 py-1.5 rounded-2xl neu-raised text-xs font-black text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer shadow-xs"
              title={isUrdu ? 'سپر ایڈمن کنٹرول کنسول کھولیں' : 'Open Super Admin Authority Console'}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>{isUrdu ? 'سپر ایڈمن کنسول' : 'Admin Console'}</span>
            </button>
          )}

          {/* Role Selector with Password Protection Lock Indicator */}
          <div className="p-1 px-2.5 rounded-2xl neu-inset-sm flex items-center gap-2">
            {currentUser.role === 'superadmin' ? (
              <Crown className="w-4 h-4 text-amber-500" />
            ) : currentUser.role === 'admin' ? (
              <ShieldCheck className="w-4 h-4 text-[var(--accent-blue)]" />
            ) : currentUser.role === 'auditor' ? (
              <FileSpreadsheet className="w-4 h-4 text-purple-500" />
            ) : (
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
            )}

            <div className="flex flex-col text-right">
              <span className="text-[10px] text-[var(--text-secondary)] font-bold leading-none">
                {currentUser.name}
              </span>
              <select
                value={userRole}
                onChange={(e) => onRequestRoleSwitch(e.target.value as UserRole)}
                className="bg-transparent text-xs font-extrabold text-[var(--text-main)] outline-hidden cursor-pointer"
              >
                <option value="admin" className="bg-[var(--bg-canvas)] text-[var(--text-main)]">
                  {isUrdu ? '🔒 ایڈمن (Admin)' : '🔒 Admin'}
                </option>
                <option value="buyer" className="bg-[var(--bg-canvas)] text-[var(--text-main)]">
                  {isUrdu ? '🛍️ خریدار (Buyer)' : '🛍️ Buyer'}
                </option>
                <option value="auditor" className="bg-[var(--bg-canvas)] text-[var(--text-main)]">
                  {isUrdu ? '🔒 آڈیٹر (Auditor)' : '🔒 Auditor'}
                </option>
                <option value="superadmin" className="bg-[var(--bg-canvas)] text-[var(--text-main)]">
                  {isUrdu ? '👑 سپر ایڈمن (Lukilion)' : '👑 Super Admin'}
                </option>
              </select>
            </div>

            {/* Quick Switch / Lock Icon Button */}
            <button
              type="button"
              onClick={() => onRequestRoleSwitch(userRole)}
              className="p-1 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-blue)] cursor-pointer"
              title={isUrdu ? 'پاس ورڈ یا صارف تبدیل کریں' : 'Switch or authenticate user'}
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Button (visible on screens < lg) */}
        <div className="lg:hidden flex items-center gap-2" ref={mobileMenuRef}>
          {isSuperAdmin && onOpenSuperAdminConsole && (
            <button
              onClick={onOpenSuperAdminConsole}
              className="p-2 rounded-2xl neu-raised text-amber-500 border border-amber-500/30 flex items-center justify-center cursor-pointer"
              title="Super Admin Console"
            >
              <Crown className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="px-3.5 py-2 rounded-2xl neu-btn text-xs font-bold text-[var(--text-main)] flex items-center gap-2 select-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <div className="flex items-center gap-1.5 truncate max-w-[130px] sm:max-w-[180px]">
              {renderIcon(activeRouteObj.icon, true)}
              <span className="text-[var(--accent-blue)] font-extrabold truncate">
                {isUrdu ? activeRouteObj.labelUrdu : activeRouteObj.labelEnglish}
              </span>
            </div>
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-[var(--accent-blue)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
            )}
          </button>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-3xl neu-raised-lg p-3 sm:p-4 z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] font-bold text-[var(--text-secondary)] px-2 pb-1 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                <span>{isUrdu ? 'نیویگیشن مینو' : 'Navigation Menu'}</span>
                <span className="text-[10px] neu-inset-sm px-2 py-0.5 rounded-full text-[var(--accent-blue)]">
                  {itemsCount.total} {isUrdu ? 'آئٹمز' : 'Items'}
                </span>
              </div>

              {/* Mobile Routes List */}
              <div className="space-y-1">
                {routes.map((route) => {
                  const active = activeRoute === route.id;
                  const badge = getDynamicBadge(route.id);
                  const label = isUrdu ? route.labelUrdu : route.labelEnglish;

                  return (
                    <button
                      key={route.id}
                      onClick={() => {
                        onSelectRoute(route.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between select-none cursor-pointer ${
                        active
                          ? 'neu-btn active text-[var(--accent-blue)]'
                          : 'neu-btn text-[var(--text-main)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {renderIcon(route.icon, active)}
                        <span>{label}</span>
                      </div>

                      {badge !== undefined && (
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            active
                              ? 'bg-[var(--accent-blue)] text-white'
                              : 'neu-inset-sm text-[var(--text-secondary)]'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Role Switcher */}
              <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-bold">
                  {currentUser.role === 'superadmin' ? (
                    <Crown className="w-4 h-4 text-amber-500" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                  )}
                  <span>{currentUser.name}</span>
                </div>

                <select
                  value={userRole}
                  onChange={(e) => {
                    setIsMobileMenuOpen(false);
                    onRequestRoleSwitch(e.target.value as UserRole);
                  }}
                  className="neu-inset-sm px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--text-main)] bg-[var(--bg-canvas)] cursor-pointer"
                >
                  <option value="admin">{isUrdu ? '🔒 ایڈمن (Admin)' : '🔒 Admin'}</option>
                  <option value="buyer">{isUrdu ? '🛍️ خریدار (Buyer)' : '🛍️ Buyer'}</option>
                  <option value="auditor">{isUrdu ? '🔒 آڈیٹر (Auditor)' : '🔒 Auditor'}</option>
                  <option value="superadmin">{isUrdu ? '👑 سپر ایڈمن' : '👑 Super Admin'}</option>
                </select>
              </div>

              {isSuperAdmin && onOpenSuperAdminConsole && (
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenSuperAdminConsole();
                    }}
                    className="w-full py-2 px-3 rounded-2xl neu-raised text-xs font-black text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>{isUrdu ? 'سپر ایڈمن کنٹرول کنسول' : 'Super Admin Console'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
