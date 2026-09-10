import React from 'react';
import { Boxes, Star, Coins } from 'lucide-react';
import { Language } from '../types';

interface DashboardKpiProps {
  totalItems: number;
  demandedItemsCount: number;
  totalUnits: number;
  totalBudget: number;
  language: Language;
}

export const DashboardKpi: React.FC<DashboardKpiProps> = ({
  totalItems,
  demandedItemsCount,
  totalUnits,
  totalBudget,
  language
}) => {
  const isUrdu = language === 'ur';

  return (
    <section id="dashboardSection" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-5 transition-all">
      {/* Total Items */}
      <div className="neu-raised rounded-3xl p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-[var(--text-secondary)]">
            {isUrdu ? 'کل درج شدہ اشیاء' : 'Total Items'}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full neu-inset-sm flex items-center justify-center text-[var(--accent-blue)] text-xs">
            <Boxes className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text-main)]" id="kpiTotalItems">
            {totalItems}
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-[var(--text-secondary)] neu-inset-sm px-2 py-0.5 rounded-full">
            {isUrdu ? 'مکمل لسٹ' : 'Master List'}
          </span>
        </div>
      </div>

      {/* High Demand Items */}
      <div className="neu-raised rounded-3xl p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-[var(--text-secondary)]">
            {isUrdu ? 'مطلوبہ آرڈر مع (*)' : 'Priority Orders (*)'}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full neu-inset-sm flex items-center justify-center text-amber-500 text-xs">
            <Star className="w-4 h-4 fill-amber-500" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--accent-blue)]" id="kpiDemandedItems">
            {demandedItemsCount}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-500 neu-inset-sm px-2 py-0.5 rounded-full">
            {isUrdu ? 'فوری طلب' : 'High Demand'}
          </span>
        </div>
      </div>

      {/* Total Required Units */}
      <div className="neu-raised rounded-3xl p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-[var(--text-secondary)]">
            {isUrdu ? 'درکار تعداد (پیس)' : 'Required Units (Pcs)'}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full neu-inset-sm flex items-center justify-center text-cyan-500 text-xs font-bold">
            Pcs
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text-main)]" id="kpiTotalUnits">
            {totalUnits}
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-[var(--text-secondary)] neu-inset-sm px-2 py-0.5 rounded-full">
            {isUrdu ? 'ہول سیل اسٹاک' : 'Wholesale Pcs'}
          </span>
        </div>
      </div>

      {/* Projected Purchase Budget */}
      <div className="neu-raised rounded-3xl p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-[var(--text-secondary)]">
            {isUrdu ? 'متوقع خریداری بجٹ' : 'Projected Budget'}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full neu-inset-sm flex items-center justify-center text-emerald-500 text-xs">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-emerald-500" id="kpiTotalBudget">
            Rs {Math.round(totalBudget).toLocaleString()}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-500 neu-inset-sm px-2 py-0.5 rounded-full">
            PKR
          </span>
        </div>
      </div>
    </section>
  );
};
