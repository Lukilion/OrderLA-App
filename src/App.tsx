import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { WholesaleItem, UserRole, Language, FilterType, SortKey, SortDirection } from './types';
import { DEFAULT_MASTER_ITEMS, NAV_ROUTES } from './data/masterItems';
import { TactileSidebar } from './components/TactileSidebar';
import { TopControlBar } from './components/TopControlBar';
import { DashboardKpi } from './components/DashboardKpi';
import { FilterSortBar } from './components/FilterSortBar';
import { DesktopTableView } from './components/DesktopTableView';
import { MobileCardView } from './components/MobileCardView';
import { AddItemModal } from './components/AddItemModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { Toast } from './components/Toast';
import { exportWholesaleExcel, generateWhatsAppOrderText } from './utils/exportHelpers';

export function App() {
  // Navigation & Role State
  const [activeRoute, setActiveRoute] = useState<string>('demand-sheet');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [language, setLanguage] = useState<Language>('ur');

  // Master Items State (persisted with key used in user template)
  const [items, setItems] = useState<WholesaleItem[]>(() => {
    try {
      const stored = localStorage.getItem('mukhtar_ali_custom_items');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      /* ignore fallback */
    }
    return JSON.parse(JSON.stringify(DEFAULT_MASTER_ITEMS));
  });

  // History State for Undo / Redo
  const [historyStack, setHistoryStack] = useState<string[]>([
    JSON.stringify(items)
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Filter, Sort, and Search State
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Toast State
  const [isAddItemOpen, setIsAddItemOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize HTML document dir & lang attribute
  useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Show Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Save to localStorage & push history state
  const commitItemsChange = useCallback(
    (newItems: WholesaleItem[], recordHistory: boolean = true) => {
      setItems(newItems);
      try {
        localStorage.setItem('mukhtar_ali_custom_items', JSON.stringify(newItems));
      } catch (err) {
        console.error('LocalStorage save error', err);
      }

      if (recordHistory) {
        setHistoryStack((prev) => {
          const sliced = prev.slice(0, historyIndex + 1);
          const next = [...sliced, JSON.stringify(newItems)];
          if (next.length > 30) next.shift();
          return next;
        });
        setHistoryIndex((prev) => Math.min(prev + 1, 29));
      }
    },
    [historyIndex]
  );

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const prevData = JSON.parse(historyStack[prevIdx]);
      setHistoryIndex(prevIdx);
      commitItemsChange(prevData, false);
      showToast(language === 'ur' ? 'پچھلا عمل واپس لیا گیا (Undo)!' : 'Action undone!');
    }
  }, [historyIndex, historyStack, commitItemsChange, showToast, language]);

  const handleRedo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      const nextData = JSON.parse(historyStack[nextIdx]);
      setHistoryIndex(nextIdx);
      commitItemsChange(nextData, false);
      showToast(language === 'ur' ? 'عمل دوبارہ لاگو کیا گیا (Redo)!' : 'Action redone!');
    }
  }, [historyIndex, historyStack, commitItemsChange, showToast, language]);

  // Keyboard Shortcuts (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Update single cell inline
  const handleUpdateCell = (id: number, field: keyof WholesaleItem, value: any) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        if (field === 'rate' || field === 'demand') {
          const num = parseFloat(value);
          return { ...item, [field]: isNaN(num) ? 0 : Math.max(0, num) };
        }
        return { ...item, [field]: value };
      }
      return item;
    });

    commitItemsChange(updated, true);
    const modifiedItem = items.find((i) => i.id === id);
    if (modifiedItem) {
      showToast(
        language === 'ur'
          ? `آئٹم "${modifiedItem.name}" اپڈیٹ ہو گیا!`
          : `Item "${modifiedItem.name}" updated!`
      );
    }
  };

  // Add Item
  const handleAddItem = (newItemData: Omit<WholesaleItem, 'id'>) => {
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem: WholesaleItem = {
      id: nextId,
      ...newItemData
    };

    const updated = [...items, newItem];
    commitItemsChange(updated, true);
    showToast(
      language === 'ur'
        ? `نیا آئٹم "${newItem.name}" شامل کر دیا گیا!`
        : `New item "${newItem.name}" added!`
    );
  };

  // Delete Item
  const handleDeleteItem = (id: number) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    const updated = items.filter((i) => i.id !== id);
    commitItemsChange(updated, true);
    showToast(
      language === 'ur'
        ? `آئٹم "${target.name}" حذف ہو گیا۔`
        : `Item "${target.name}" removed.`
    );
  };

  // Reset to default master catalog
  const handleConfirmReset = () => {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_MASTER_ITEMS));
    commitItemsChange(fresh, true);
    setIsResetConfirmOpen(false);
    setFilter('all');
    setSortKey('id');
    setSortDirection('asc');
    setSearchQuery('');
    showToast(
      language === 'ur'
        ? 'شیٹ مکمل طور پر اصل حالت پر بحال کر دی گئی!'
        : 'Catalog reset to default 87 items!'
    );
  };

  // Manual save trigger
  const handleManualSave = () => {
    try {
      localStorage.setItem('mukhtar_ali_custom_items', JSON.stringify(items));
      showToast(
        language === 'ur'
          ? 'تمام ڈیٹا کامیابی سے محفوظ ہو گیا!'
          : 'All changes saved successfully!'
      );
    } catch {
      showToast('Error saving data');
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    exportWholesaleExcel(items, language);
    showToast(
      language === 'ur'
        ? 'ایکسل فائل کامیابی سے ڈاؤنلوڈ ہو گئی!'
        : 'Excel file downloaded successfully!'
    );
  };

  // Copy WhatsApp list
  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppOrderText(items, language);
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(
        language === 'ur'
          ? 'واٹس ایپ لسٹ کلپ بورڈ پر کاپی ہو گئی!'
          : 'WhatsApp order summary copied to clipboard!'
      );
    } catch {
      showToast('Copy failed');
    }
    document.body.removeChild(textarea);
  };

  // Execute PDF / Print Customizer
  const handleExecutePdfPrint = (options: {
    showDashboard: boolean;
    visibleCols: Record<string, boolean>;
  }) => {
    const body = document.body;
    body.classList.remove(
      'pdf-hide-dashboard',
      'pdf-hide-col-id',
      'pdf-hide-col-name',
      'pdf-hide-col-cat',
      'pdf-hide-col-rate',
      'pdf-hide-col-stock',
      'pdf-hide-col-demand',
      'pdf-hide-col-cost',
      'pdf-hide-col-status'
    );

    if (!options.showDashboard) {
      body.classList.add('pdf-hide-dashboard');
    }

    Object.entries(options.visibleCols).forEach(([colClass, isVisible]) => {
      if (!isVisible) {
        body.classList.add(`pdf-hide-${colClass}`);
      }
    });

    window.print();
  };

  // Sync route selection with filters if appropriate
  const handleSelectRoute = (routeId: string) => {
    setActiveRoute(routeId);
    if (routeId === 'priority-orders') {
      setFilter('demand');
    } else if (routeId === 'low-stock') {
      setFilter('lowstock');
    } else if (routeId === 'shalmi-market') {
      setFilter('shalmi');
    } else if (routeId === 'kashif-wholesale') {
      setFilter('kashif');
    } else if (routeId === 'demand-sheet') {
      setFilter('all');
    }
  };

  // Parse stock value helper
  const parseStockValue = (stockStr: string | number): number => {
    if (typeof stockStr === 'number') return stockStr;
    const match = String(stockStr).match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  };

  // Metrics and Counts computation
  const metrics = useMemo(() => {
    let totalUnits = 0;
    let totalBudget = 0;
    let demandedCount = 0;
    let lowStockCount = 0;
    let shalmiCount = 0;
    let kashifCount = 0;

    items.forEach((item) => {
      const d = Number(item.demand) || 0;
      const r = Number(item.rate) || 0;
      if (d > 0) {
        demandedCount++;
        totalUnits += d;
        totalBudget += d * r;
      }
      if (parseStockValue(item.stock) <= 5) {
        lowStockCount++;
      }
      if (item.cat === 'شالمی') {
        shalmiCount++;
      }
      if (item.cat === 'کاشف صاحب') {
        kashifCount++;
      }
    });

    return {
      totalItems: items.length,
      demandedCount,
      totalUnits,
      totalBudget,
      counts: {
        total: items.length,
        all: items.length,
        demand: demandedCount,
        lowStock: lowStockCount,
        shalmi: shalmiCount,
        kashif: kashifCount
      }
    };
  }, [items]);

  // Filtered & Sorted items computation
  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter((item) => {
      if (filter === 'demand' && (Number(item.demand) || 0) === 0) return false;
      if (filter === 'lowstock' && parseStockValue(item.stock) > 5) return false;
      if (filter === 'shalmi' && item.cat !== 'شالمی') return false;
      if (filter === 'kashif' && item.cat !== 'کاشف صاحب') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.name.toLowerCase().includes(q) ||
          item.cat.toLowerCase().includes(q) ||
          (item.status && item.status.toLowerCase().includes(q)) ||
          String(item.rate).includes(q) ||
          String(item.stock).toLowerCase().includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortKey) {
        case 'name':
          return sortDirection === 'asc'
            ? a.name.localeCompare(b.name, 'ur')
            : b.name.localeCompare(a.name, 'ur');
        case 'cat':
          return sortDirection === 'asc'
            ? a.cat.localeCompare(b.cat, 'ur')
            : b.cat.localeCompare(a.cat, 'ur');
        case 'rate':
          valA = Number(a.rate) || 0;
          valB = Number(b.rate) || 0;
          break;
        case 'stock':
          valA = parseStockValue(a.stock);
          valB = parseStockValue(b.stock);
          break;
        case 'demand':
          valA = Number(a.demand) || 0;
          valB = Number(b.demand) || 0;
          break;
        case 'cost':
          valA = (Number(a.demand) || 0) * (Number(a.rate) || 0);
          valB = (Number(b.demand) || 0) * (Number(b.rate) || 0);
          break;
        case 'id':
        default:
          valA = a.id;
          valB = b.id;
          break;
      }

      if (sortDirection === 'asc') {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });

    return result;
  }, [items, filter, searchQuery, sortKey, sortDirection]);

  // Sort Toggle on Column Header
  const handleSortToggle = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection(key === 'demand' || key === 'cost' || key === 'rate' ? 'desc' : 'asc');
    }
  };

  const handleResetFiltersAndSort = () => {
    setFilter('all');
    setSortKey('id');
    setSortDirection('asc');
    setSearchQuery('');
    showToast(
      language === 'ur'
        ? 'فلٹرز اور ترتیب اصل حالت پر بحال ہو گئی!'
        : 'Filters and sorting reset!'
    );
  };

  return (
    <div className="min-h-screen bg-[#EDEBF8] text-[#33364D] p-2.5 sm:p-4 md:p-6 transition-all flex flex-col lg:flex-row gap-4 md:gap-6">
      {/* Dual-Tier Tier 1: Collapsible Tactile Sidebar */}
      <div className="shrink-0 no-print">
        <TactileSidebar
          routes={NAV_ROUTES}
          activeRoute={activeRoute}
          onSelectRoute={handleSelectRoute}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          userRole={userRole}
          onChangeRole={setUserRole}
          language={language}
          itemsCount={metrics.counts}
        />
      </div>

      {/* Main Operating Stage */}
      <div className="flex-1 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6">
        {/* Dual-Tier Tier 2: Top Utility & Control Bar */}
        <TopControlBar
          language={language}
          onToggleLanguage={setLanguage}
          onOpenAddItem={() => setIsAddItemOpen(true)}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < historyStack.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSaveManual={handleManualSave}
          onPromptRevoke={() => setIsResetConfirmOpen(true)}
          onExportExcel={handleExportExcel}
          onCopyWhatsApp={handleCopyWhatsApp}
          onExecutePdfPrint={handleExecutePdfPrint}
        />

        {/* Real-time KPI Dashboard Cards */}
        <DashboardKpi
          totalItems={metrics.totalItems}
          demandedItemsCount={metrics.demandedCount}
          totalUnits={metrics.totalUnits}
          totalBudget={metrics.totalBudget}
          language={language}
        />

        {/* Filtering, Sorting & Search Bar */}
        <FilterSortBar
          filter={filter}
          onSelectFilter={setFilter}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSelectSort={(k, d) => {
            setSortKey(k);
            setSortDirection(d);
          }}
          onReset={handleResetFiltersAndSort}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          language={language}
          counts={metrics.counts}
        />

        {/* 1. Desktop & Tablet View: Structured Neumorphic Table */}
        <DesktopTableView
          items={filteredAndSortedItems}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortToggle={handleSortToggle}
          onUpdateCell={handleUpdateCell}
          onDeleteItem={handleDeleteItem}
          totalUnits={metrics.totalUnits}
          totalBudget={metrics.totalBudget}
          demandedCount={metrics.demandedCount}
          language={language}
        />

        {/* 2. Mobile Responsive View: Accordion Cards */}
        <MobileCardView
          items={filteredAndSortedItems}
          onUpdateCell={handleUpdateCell}
          onDeleteItem={handleDeleteItem}
          totalUnits={metrics.totalUnits}
          totalBudget={metrics.totalBudget}
          language={language}
        />
      </div>

      {/* Modals & Notifications */}
      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onAddItem={handleAddItem}
        language={language}
      />

      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        language={language}
      />

      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
