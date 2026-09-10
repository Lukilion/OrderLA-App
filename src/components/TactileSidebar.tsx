import React from 'react';
import { 
  Menu, 
  ChevronRight, 
  ChevronLeft, 
  TableProperties, 
  Star, 
  AlertTriangle, 
  Store, 
  Warehouse, 
  PieChart,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { NavRoute, UserRole, Language } from '../types';

interface TactileSidebarProps {
  routes: NavRoute[];
  activeRoute: string;
  onSelectRoute: (routeId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  language: Language;
  itemsCount: {
    total: number;
    demand: number;
    lowStock: number;
    shalmi: number;
    kashif: number;
  };
}

export const TactileSidebar: React.FC<TactileSidebarProps> = ({
  routes,
  activeRoute,
  onSelectRoute,
  isCollapsed,
  onToggleCollapse,
  userRole,
  onChangeRole,
  language,
  itemsCount
}) => {
  const isRtl = language === 'ur';

  // Map icon strings to Lucide components
  const renderIcon = (iconName: string, active: boolean) => {
    const cls = `w-4 h-4 transition-colors ${active ? 'text-[#0A84FF]' : 'text-[#72768F]'}`;
    switch (iconName) {
      case 'fa-table-list':
        return <TableProperties className={cls} />;
      case 'fa-star':
        return <Star className={`${cls} ${active ? 'text-amber-500 fill-amber-500' : ''}`} />;
      case 'fa-triangle-exclamation':
        return <AlertTriangle className={`${cls} ${active ? 'text-rose-500' : ''}`} />;
      case 'fa-shop':
        return <Store className={cls} />;
      case 'fa-warehouse':
        return <Warehouse className={cls} />;
      case 'fa-chart-pie':
        return <PieChart className={cls} />;
      default:
        return <TableProperties className={cls} />;
    }
  };

  const getDynamicBadge = (routeId: string): string | undefined => {
    switch (routeId) {
      case 'demand-sheet':
        return String(itemsCount.total);
      case 'priority-orders':
        return String(itemsCount.demand);
      case 'low-stock':
        return String(itemsCount.lowStock);
      case 'shalmi-market':
        return String(itemsCount.shalmi);
      case 'kashif-wholesale':
        return String(itemsCount.kashif);
      default:
        return undefined;
    }
  };

  return (
    <aside 
      className={`relative h-full transition-all duration-300 z-30 flex flex-col justify-between p-3.5 sm:p-4 neu-raised-lg rounded-3xl ${
        isCollapsed ? 'w-20' : 'w-64 sm:w-72'
      }`}
    >
      {/* Sidebar Header & Brand */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#D8D5EA]">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-2xl neu-inset-sm flex items-center justify-center text-[#0A84FF] font-bold shrink-0">
                <span className="text-sm font-extrabold tracking-tight">O</span>
                <span className="text-[10px] text-[#0A84FF] font-extrabold -ml-0.5">LA</span>
              </div>
              <div className="truncate">
                <h2 className="text-sm font-extrabold text-[#2C2E42] tracking-tight">
                  OrderLA BOS
                </h2>
                <p className="text-[10px] text-[#72768F] font-semibold truncate">
                  {language === 'ur' ? 'ہول سیل بزنس سسٹم' : 'Wholesale Operating OS'}
                </p>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto w-9 h-9 rounded-2xl neu-inset-sm flex items-center justify-center text-[#0A84FF] font-extrabold text-xs">
              OLA
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-[#72768F] hover:text-[#0A84FF] transition"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Role Indicator Banner */}
        {!isCollapsed && (
          <div className="mt-3 p-2.5 rounded-2xl neu-inset-sm flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#33364D] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0A84FF]" />
              <span className="text-[11px]">
                {language === 'ur' ? 'کردار / اجازت:' : 'Role:'}
              </span>
            </div>
            <select
              value={userRole}
              onChange={(e) => onChangeRole(e.target.value as UserRole)}
              className="text-[10px] font-bold bg-[#EDEBF8] text-[#0A84FF] px-2 py-1 rounded-xl neu-inset-sm border-none outline-hidden cursor-pointer"
            >
              <option value="admin">{language === 'ur' ? 'منتظم (Admin)' : 'Admin'}</option>
              <option value="purchaser">{language === 'ur' ? 'خریدار (Buyer)' : 'Purchaser'}</option>
              <option value="auditor">{language === 'ur' ? 'آڈیٹر (Auditor)' : 'Auditor'}</option>
            </select>
          </div>
        )}

        {/* Navigation Item Links */}
        <nav className="mt-4 space-y-2">
          {routes.map((route) => {
            const isPermitted = route.roles.includes(userRole);
            const isActive = activeRoute === route.id;
            const badgeValue = getDynamicBadge(route.id);

            return (
              <button
                key={route.id}
                onClick={() => isPermitted && onSelectRoute(route.id)}
                disabled={!isPermitted}
                title={language === 'ur' ? route.labelUrdu : route.labelEnglish}
                className={`w-full flex items-center transition-all duration-200 select-none rounded-2xl ${
                  isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'neu-inset text-[#0A84FF] font-bold'
                    : 'neu-btn text-[#33364D] font-semibold hover:text-[#0A84FF]'
                } ${!isPermitted ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {renderIcon(route.icon, isActive)}
                  {!isCollapsed && (
                    <span className="text-xs truncate">
                      {language === 'ur' ? route.labelUrdu : route.labelEnglish}
                    </span>
                  )}
                </div>

                {!isCollapsed && badgeValue && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'neu-inset-sm text-[#0A84FF] font-extrabold' : 'neu-inset-sm text-[#72768F]'
                  }`}>
                    {badgeValue}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Pill */}
      <div className="pt-3 border-t border-[#D8D5EA]">
        {!isCollapsed ? (
          <div className="flex items-center justify-between text-[11px] text-[#72768F] font-medium px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{language === 'ur' ? 'آن لائن آڈٹ موڈ' : 'Live Audit Mode'}</span>
            </div>
            <span className="neu-inset-sm px-2 py-0.5 rounded-full text-[10px] font-mono">
              v2.5
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        )}
      </div>
    </aside>
  );
};
