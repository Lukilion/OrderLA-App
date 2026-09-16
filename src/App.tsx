import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { WholesaleItem, UserRole, Language, Theme, FilterType, SortKey, SortDirection, UserAccount } from './types';
import { DEFAULT_MASTER_ITEMS, NAV_ROUTES } from './data/masterItems';
import { OrderLaTopNav } from './components/OrderLaTopNav';
import { NeumorphicSidebar } from './components/NeumorphicSidebar';
import { OrderLaLogo } from './components/OrderLaLogo';
import { TopControlBar } from './components/TopControlBar';
import { DashboardKpi } from './components/DashboardKpi';
import { FilterSortBar } from './components/FilterSortBar';
import { DesktopTableView } from './components/DesktopTableView';
import { MobileCardView } from './components/MobileCardView';
import { AddItemModal } from './components/AddItemModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { DemandSwiperModal } from './components/DemandSwiperModal';
import { RoleLoginModal } from './components/RoleLoginModal';
import { SuperAdminConsoleModal } from './components/SuperAdminConsoleModal';
import { BackupUpdateModal } from './components/BackupUpdateModal';
import { WhatsAppRecipientModal } from './components/WhatsAppRecipientModal';
import { AccessDeniedModal } from './components/AccessDeniedModal';
import { PendingApprovalsModal } from './components/PendingApprovalsModal';
import { FloatingSwiperButton } from './components/FloatingSwiperButton';
import { Toast } from './components/Toast';
import { AuthGatewayScreen } from './components/AuthGatewayScreen';
import { exportWholesaleExcel } from './utils/exportHelpers';
import { getCurrentUser, hasExportPermission, getStoredUsers, setCurrentUser as persistCurrentUser, logoutUser, getPendingCount } from './utils/authManager';
import { ChevronDown } from 'lucide-react';

export function App() {
  // Visual Theme State (Light / Dark)
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('orderla_theme');
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      /* ignore */
    }
    return 'light';
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('orderla_theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  // Authenticated User & Role State (Defaults to null to force Login/Register at the very first stage)
  const [currentUser, setCurrentUserState] = useState<UserAccount | null>(() => getCurrentUser());
  const [userRole, setUserRole] = useState<UserRole>(() => (currentUser ? currentUser.role : 'buyer'));

  // Sync role with currentUser
  useEffect(() => {
    if (currentUser) {
      setUserRole(currentUser.role);
    }
  }, [currentUser]);

  // Navigation State
  const [activeRoute, setActiveRoute] = useState<string>('demand-sheet');
  const [language, setLanguage] = useState<Language>('ur');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('orderla_sidebar_collapsed');
      return stored === 'true';
    } catch {
      return false;
    }
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Sync sidebar collapsed state
  useEffect(() => {
    try {
      localStorage.setItem('orderla_sidebar_collapsed', String(isSidebarCollapsed));
    } catch {
      /* ignore */
    }
  }, [isSidebarCollapsed]);

  // Master Items State (persisted with clean default empty stock/demand)
  const [items, setItems] = useState<WholesaleItem[]>(() => {
    try {
      const stored = localStorage.getItem('wholesale_demand_sheet_items_v2');
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
  const [isSwiperOpen, setIsSwiperOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Visibility of the complete items list (hidden by default to keep dashboard cool & empty)
  const [isListVisible, setIsListVisible] = useState<boolean>(false);

  // Role Authentication & Security Modals
  const [isRoleLoginOpen, setIsRoleLoginOpen] = useState<boolean>(false);
  const [targetRoleForLogin, setTargetRoleForLogin] = useState<UserRole>('admin');
  const [isSuperAdminConsoleOpen, setIsSuperAdminConsoleOpen] = useState<boolean>(false);
  const [isBackupUpdateOpen, setIsBackupUpdateOpen] = useState<boolean>(false);
  const [isWhatsAppRecipientOpen, setIsWhatsAppRecipientOpen] = useState<boolean>(false);
  const [whatsAppItemsTarget, setWhatsAppItemsTarget] = useState<WholesaleItem[]>(items);
  const [isAccessDeniedOpen, setIsAccessDeniedOpen] = useState<boolean>(false);
  const [deniedPermissionType, setDeniedPermissionType] = useState<'excel' | 'pdf' | 'whatsapp'>('excel');
  const [isPendingApprovalsOpen, setIsPendingApprovalsOpen] = useState<boolean>(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(() => getPendingCount());

  // Listen for storage changes across tabs or windows to update pending count
  useEffect(() => {
    const handleStorage = () => {
      setPendingApprovalsCount(getPendingCount());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleStorage);
    };
  }, []);

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
        localStorage.setItem('wholesale_demand_sheet_items_v2', JSON.stringify(newItems));
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
      showToast(language === 'ur' ? 'دوبارہ لاگو کیا گیا (Redo)!' : 'Action redone!');
    }
  }, [historyIndex, historyStack, commitItemsChange, showToast, language]);

  // Global Keyboard Shortcuts for Undo (Ctrl+Z) & Redo (Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Direct cell editing handler
  const handleUpdateCell = useCallback(
    (id: number, field: keyof WholesaleItem, value: any) => {
      const updated = items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });
      commitItemsChange(updated);
    },
    [items, commitItemsChange]
  );

  // Add Item handler
  const handleAddItem = (newItemData: Omit<WholesaleItem, 'id'>) => {
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem: WholesaleItem = {
      id: nextId,
      ...newItemData
    };
    const updated = [newItem, ...items];
    commitItemsChange(updated);
    showToast(language === 'ur' ? 'نیا آئٹم کامیابی سے شامل کر دیا گیا!' : 'New item added successfully!');
  };

  // Delete item handler
  const handleDeleteItem = useCallback(
    (id: number) => {
      const updated = items.filter((i) => i.id !== id);
      commitItemsChange(updated);
      showToast(language === 'ur' ? 'آئٹم ڈیلیٹ کر دیا گیا' : 'Item removed');
    },
    [items, commitItemsChange, showToast, language]
  );

  // Reset to initial master items
  const handleConfirmReset = () => {
    commitItemsChange(JSON.parse(JSON.stringify(DEFAULT_MASTER_ITEMS)));
    showToast(
      language === 'ur'
        ? 'تمام ریکارڈز ابتدائی حالت پر بحال کر دیے گئے ہیں!'
        : 'Database reset to default wholesale master data!'
    );
  };

  // Reset stock, demand, status to zero placeholders
  const handleResetToZeroPlaceholders = () => {
    const cleared = items.map((item) => ({
      ...item,
      stock: '',
      demand: 0,
      status: ''
    }));
    commitItemsChange(cleared);
    showToast(
      language === 'ur'
        ? 'اسٹاک، ڈیمانڈ اور کیفیت کامیابی سے صفر (0) کر دی گئیں!'
        : 'Stock, demand & status cleared to zero placeholders!'
    );
  };

  // Apply Demands from Swiper Mode
  const handleApplySwiperDemands = (updatedSwiperItems: WholesaleItem[]) => {
    commitItemsChange(updatedSwiperItems);
    showToast(
      language === 'ur'
        ? 'سوائپر سے منتخب کردہ ڈیمانڈ ماسٹر شیٹ میں لاگو ہو گئی!'
        : 'Demands from Swiper mode applied to main sheet!'
    );
  };

  // Save manual snapshot
  const handleManualSave = () => {
    try {
      localStorage.setItem('wholesale_demand_sheet_items_v2', JSON.stringify(items));
      showToast(
        language === 'ur'
          ? 'تمام ریکارڈز محفوظ ہو گئے ہیں (Saved)!'
          : 'All sheet records saved to local storage!'
      );
    } catch {
      showToast('Error saving data');
    }
  };

  // Export to Excel handler (Protected by Super Admin permissions)
  const handleExportExcel = (targetItems?: WholesaleItem[]) => {
    if (!hasExportPermission(currentUser, 'excel')) {
      setDeniedPermissionType('excel');
      setIsAccessDeniedOpen(true);
      return;
    }

    exportWholesaleExcel(targetItems || items, language);
    showToast(
      language === 'ur'
        ? 'ایکسل فائل برآمد ہو گئی ہے!'
        : 'Excel file generated and exported!'
    );
  };

  // WhatsApp Send Handler: Opens recipient selection dialog (Protected by Super Admin permissions)
  const handleOpenWhatsAppRecipient = (targetItems?: WholesaleItem[]) => {
    if (!hasExportPermission(currentUser, 'whatsapp')) {
      setDeniedPermissionType('whatsapp');
      setIsAccessDeniedOpen(true);
      return;
    }

    setWhatsAppItemsTarget(targetItems || items);
    setIsWhatsAppRecipientOpen(true);
  };

  // Print / PDF execution with custom column toggles (Protected by Super Admin permissions)
  const handleExecutePdfPrint = ({
    showDashboard,
    visibleCols
  }: {
    showDashboard: boolean;
    visibleCols: Record<string, boolean>;
  }) => {
    if (!hasExportPermission(currentUser, 'pdf')) {
      setDeniedPermissionType('pdf');
      setIsAccessDeniedOpen(true);
      return;
    }

    const body = document.body;

    // Toggle dashboard
    if (!showDashboard) {
      body.classList.add('pdf-hide-dashboard');
    } else {
      body.classList.remove('pdf-hide-dashboard');
    }

    // Toggle columns
    Object.keys(visibleCols).forEach((colClass) => {
      const shouldHide = !visibleCols[colClass];
      const hideClass = `pdf-hide-${colClass}`;
      if (shouldHide) {
        body.classList.add(hideClass);
      } else {
        body.classList.remove(hideClass);
      }
    });

    // Invoke print
    window.print();

    // Clean up classes after print dialog opens
    setTimeout(() => {
      body.classList.remove('pdf-hide-dashboard');
      [
        'col-id',
        'col-name',
        'col-cat',
        'col-rate',
        'col-stock',
        'col-demand',
        'col-cost',
        'col-status'
      ].forEach((col) => {
        body.classList.remove(`pdf-hide-${col}`);
      });
    }, 1500);
  };

  // Role Request Switch Handler: Admin & Auditor & SuperAdmin are password protected
  const handleRequestRoleSwitch = (requestedRole: UserRole) => {
    // If switching to buyer, switch directly without password prompt
    if (requestedRole === 'buyer') {
      const users = getStoredUsers();
      const buyerAcc = users.find((u) => u.role === 'buyer') || {
        id: 'buyer-default',
        username: 'buyer',
        password: '',
        name: 'Wholesale Buyer (خریدار)',
        role: 'buyer' as UserRole,
        canExportExcel: false,
        canExportPdf: false,
        canSendWhatsApp: true,
        createdAt: '2026-09-10'
      };
      persistCurrentUser(buyerAcc);
      setCurrentUserState(buyerAcc);
      setUserRole('buyer');
      showToast(
        language === 'ur'
          ? 'خریدار (Buyer) موڈ منتخب کیا گیا ہے'
          : 'Switched to Buyer mode'
      );
      return;
    }

    // Admin, Auditor, and SuperAdmin require password authentication!
    setTargetRoleForLogin(requestedRole);
    setIsRoleLoginOpen(true);
  };

  const handleLoginSuccess = (authenticatedUser: UserAccount) => {
    persistCurrentUser(authenticatedUser);
    setCurrentUserState(authenticatedUser);
    setUserRole(authenticatedUser.role);
    showToast(
      language === 'ur'
        ? `خوش آمدید ${authenticatedUser.name}! لاگ ان کامیاب۔`
        : `Welcome ${authenticatedUser.name}! Authentication successful.`
    );
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUserState(null);
    showToast(
      language === 'ur'
        ? 'آپ کامیابی سے لاگ آؤٹ ہو چکے ہیں۔'
        : 'You have been logged out successfully.'
    );
  };

  // Filter routes based on role
  const filteredRoutes = useMemo(() => {
    return NAV_ROUTES.filter((r) => r.roles.includes(userRole));
  }, [userRole]);

  // Unified Route Handler (Supports specialized actions like Swiper modal, Backup modal, Admin console)
  const handleSelectRoute = useCallback((routeId: string) => {
    if (routeId === 'demand-swiper') {
      setIsSwiperOpen(true);
      return;
    }
    if (routeId === 'system-backup') {
      setIsBackupUpdateOpen(true);
      return;
    }
    if (routeId === 'admin-console') {
      setIsSuperAdminConsoleOpen(true);
      return;
    }
    if (['priority-orders', 'low-stock', 'shalmi-market', 'kashif-wholesale'].includes(routeId)) {
      setIsListVisible(true);
    }
    setActiveRoute(routeId);
  }, []);

  // Calculate Real-time Counts and KPI Metrics
  const metrics = useMemo(() => {
    let demandedCount = 0;
    let totalUnits = 0;
    let totalBudget = 0;
    let lowStockCount = 0;
    let shalmiCount = 0;
    let kashifCount = 0;

    items.forEach((item) => {
      const demandNum = Number(item.demand) || 0;
      const rateNum = Number(item.rate) || 0;
      const stockNum = Number(item.stock);

      if (demandNum > 0) {
        demandedCount += 1;
        totalUnits += demandNum;
        totalBudget += demandNum * rateNum;
      }

      if (
        !isNaN(stockNum) &&
        stockNum <= 5 &&
        item.stock !== '' &&
        item.stock !== null
      ) {
        lowStockCount += 1;
      } else if (
        item.status &&
        (item.status.includes('ختم') ||
          item.status.includes('درکار') ||
          item.status.includes('مطلوب'))
      ) {
        lowStockCount += 1;
      }

      if (item.cat.includes('شالمی')) {
        shalmiCount += 1;
      } else if (item.cat.includes('کاشف')) {
        kashifCount += 1;
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

  // Filter & Sort Items for Display
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // 1. Apply Navigation Route / Filter Type
    if (activeRoute === 'priority-orders' || filter === 'demand') {
      result = result.filter((i) => Number(i.demand) > 0);
    } else if (activeRoute === 'low-stock' || filter === 'lowstock') {
      result = result.filter((i) => {
        const s = Number(i.stock);
        const lowByNum = !isNaN(s) && s <= 5 && i.stock !== '' && i.stock !== null;
        const lowByStatus =
          i.status &&
          (i.status.includes('ختم') ||
            i.status.includes('درکار') ||
            i.status.includes('مطلوب'));
        return lowByNum || lowByStatus;
      });
    } else if (activeRoute === 'shalmi-market' || filter === 'shalmi') {
      result = result.filter((i) => i.cat.includes('شالمی'));
    } else if (activeRoute === 'kashif-wholesale' || filter === 'kashif') {
      result = result.filter((i) => i.cat.includes('کاشف'));
    }

    // 2. Apply Text Search Query (Item Name, Category, Status, or ID)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.cat.toLowerCase().includes(q) ||
          i.status.toLowerCase().includes(q) ||
          i.id.toString() === q
      );
    }

    // 3. Apply Column Sorting
    result.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortKey === 'cost') {
        valA = (Number(a.demand) || 0) * (Number(a.rate) || 0);
        valB = (Number(b.demand) || 0) * (Number(b.rate) || 0);
      } else if (sortKey === 'stock') {
        valA = Number(a.stock) || 0;
        valB = Number(b.stock) || 0;
      } else {
        valA = a[sortKey];
        valB = b[sortKey];
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [items, activeRoute, filter, searchQuery, sortKey, sortDirection]);

  // Handle Sort Toggle
  const handleSortToggle = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Reset Filters & Sort
  const handleResetFiltersAndSort = () => {
    setFilter('all');
    setSortKey('id');
    setSortDirection('asc');
    setSearchQuery('');
    setActiveRoute('demand-sheet');
  };

  // Mandatory First Stage Authentication Check:
  // If no user is authenticated, render the Auth Gateway Interface as the default opening first page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] antialiased transition-colors duration-200 flex flex-col justify-between">
        <AuthGatewayScreen
          theme={theme}
          onToggleTheme={setTheme}
          language={language}
          onToggleLanguage={setLanguage}
          onLoginSuccess={handleLoginSuccess}
        />
        <Toast message={toastMessage} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] transition-colors duration-200 py-2 sm:py-4 px-2 sm:px-4 lg:px-6 xl:px-8 selection:bg-[var(--accent-blue)] selection:text-white relative">
      
      {/* Movable Floating Circular Swiper Button: positioned in front of Demand sheet, fixed so it remains in exact place on screen even while scrolling */}
      <FloatingSwiperButton
        onOpenSwiper={() => setIsSwiperOpen(true)}
        language={language}
      />

      {/* Tactile Dual-Tier Layout Wrapper: Left Collapsible Sidebar + Right Main Operations Tier */}
      <div className="flex gap-4 xl:gap-6 items-start w-full max-w-[1720px] mx-auto">
        {/* Dual-Tier Tier 1: Tactile Collapsible Neumorphic Left Sidebar */}
        <NeumorphicSidebar
          routes={filteredRoutes}
          activeRoute={activeRoute}
          onSelectRoute={handleSelectRoute}
          userRole={userRole}
          currentUser={currentUser}
          language={language}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onRequestRoleSwitch={handleRequestRoleSwitch}
          onOpenSuperAdminConsole={() => setIsSuperAdminConsoleOpen(true)}
          onOpenApprovals={() => setIsPendingApprovalsOpen(true)}
          pendingApprovalsCount={pendingApprovalsCount}
          onLogout={handleLogout}
          itemsCount={metrics.counts}
        />

        {/* Dual-Tier Tier 2: Main Operations Workspace */}
        <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
          {/* Tier 2: Top Utility & Control Bar with Theme Switcher, Quick Swiper, Export & Print */}
          <TopControlBar
            theme={theme}
            onToggleTheme={setTheme}
            language={language}
            onToggleLanguage={setLanguage}
            onOpenAddItem={() => setIsAddItemOpen(true)}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < historyStack.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSaveManual={handleManualSave}
            onPromptRevoke={() => setIsResetConfirmOpen(true)}
            onResetToZeroPlaceholders={handleResetToZeroPlaceholders}
            onOpenSwiper={() => setIsSwiperOpen(true)}
            onExportExcel={() => handleExportExcel()}
            onCopyWhatsApp={() => handleOpenWhatsAppRecipient()}
            onExecutePdfPrint={handleExecutePdfPrint}
            onOpenBackupUpdate={() => setIsBackupUpdateOpen(true)}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          />

          {/* Real-time KPI Dashboard Cards */}
          <DashboardKpi
            totalItems={metrics.totalItems}
            demandedItemsCount={metrics.demandedCount}
            totalUnits={metrics.totalUnits}
            totalBudget={metrics.totalBudget}
            language={language}
          />

          {/* "Open the List / فہرست کھولیں" Toggle Section Below Dashboard */}
          <div className="flex flex-col items-center justify-center pt-1 pb-2 no-print">
            <button
              id="toggleItemsListBtn"
              type="button"
              onClick={() => setIsListVisible((prev) => !prev)}
              className={`group inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm cursor-pointer transition-all duration-200 shadow-md active:scale-95 ${
                isListVisible
                  ? 'neu-raised-flat text-[var(--accent-blue)] hover:neu-inset-sunken'
                  : 'neu-btn-accent text-white hover:scale-[1.02]'
              }`}
              title={isListVisible ? (language === 'ur' ? 'فہرست چھپائیں' : 'Hide the complete items list') : (language === 'ur' ? 'مکمل فہرست کھولیں' : 'Open the complete items list')}
            >
              <div className={`p-1 rounded-xl transition-transform duration-300 ${
                isListVisible ? 'rotate-180 text-[var(--accent-blue)] neu-inset-small' : 'bg-white/20 text-white'
              }`}>
                <ChevronDown className="w-4 h-4" />
              </div>

              <span className="tracking-wide">
                {isListVisible
                  ? (language === 'ur' ? 'فہرست بند کریں / Hide List' : 'Hide the List / فہرست بند کریں')
                  : (language === 'ur' ? 'فہرست کھولیں / Open the List' : 'Open the List / فہرست کھولیں')}
              </span>

              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                isListVisible ? 'neu-inset-sm text-[var(--accent-blue)]' : 'bg-white/25 text-white'
              }`}>
                {filteredAndSortedItems.length} {language === 'ur' ? 'آئٹمز' : 'Items'}
              </span>
            </button>

            {!isListVisible && (
              <p className="text-[11px] text-[var(--text-secondary)] mt-2 font-medium text-center">
                {language === 'ur'
                  ? '✨ ڈیش بورڈ پرسکون و خالی موڈ میں ہے۔ مکمل اشیاء کی فہرست دیکھنے و اندراج کیلئے بٹن دبائیں۔'
                  : '✨ Dashboard is in clean, minimal mode. Click above to expand and view the complete items list.'}
              </p>
            )}
          </div>

          {/* Collapsible Complete Items List (Filter bar, Table and Mobile Cards) */}
          <div className={isListVisible ? 'space-y-4 sm:space-y-6 animate-in fade-in duration-200' : 'hidden print:block print:space-y-4'}>
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

            {/* Official Printable Header with OrderLa Logo (renders only when printing/saving to PDF) */}
            <div className="only-print pb-4 mb-4 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <OrderLaLogo variant="badge" size="lg" />
                  <div>
                    <h1 className="text-xl font-black text-black">OrderLa Wholesale Business OS</h1>
                    <p className="text-xs text-gray-700">
                      {language === 'ur' ? 'ماسٹر ڈیمانڈ و خریداری ریٹ لسٹ' : 'Master Wholesale Procurement & Demand Sheet'}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-700 space-y-0.5">
                  <div><strong>{language === 'ur' ? 'تاریخ:' : 'Date:'}</strong> {new Date().toLocaleDateString('en-PK')}</div>
                  <div><strong>{language === 'ur' ? 'کل اشیاء:' : 'Total Items:'}</strong> {items.length}</div>
                </div>
              </div>
            </div>

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
        </div>
      </div>

      {/* Modals & Notifications */}
      {/* 1. Rapid Demand Swiper Modal */}
      <DemandSwiperModal
        isOpen={isSwiperOpen}
        onClose={() => setIsSwiperOpen(false)}
        items={items}
        onApplyDemands={handleApplySwiperDemands}
        language={language}
        onExportExcel={(sessionItems) => handleExportExcel(sessionItems)}
        onRequestWhatsApp={(sessionItems) => handleOpenWhatsAppRecipient(sessionItems)}
        onPrint={() => {
          if (!hasExportPermission(currentUser, 'pdf')) {
            setDeniedPermissionType('pdf');
            setIsAccessDeniedOpen(true);
          } else {
            window.print();
          }
        }}
      />

      {/* 2. WhatsApp Recipient Selector Dialog (Super Admin / Admin / Custom) */}
      <WhatsAppRecipientModal
        isOpen={isWhatsAppRecipientOpen}
        onClose={() => setIsWhatsAppRecipientOpen(false)}
        items={whatsAppItemsTarget}
        language={language}
        onToast={showToast}
      />

      {/* 3. Role Protected Security Login Modal */}
      <RoleLoginModal
        isOpen={isRoleLoginOpen}
        onClose={() => setIsRoleLoginOpen(false)}
        targetRole={targetRoleForLogin}
        onSuccess={handleLoginSuccess}
        language={language}
      />

      {/* 4. Super Admin Management Authority Console */}
      <SuperAdminConsoleModal
        isOpen={isSuperAdminConsoleOpen}
        onClose={() => setIsSuperAdminConsoleOpen(false)}
        language={language}
        currentUser={currentUser}
        onUsersUpdated={() => {
          // Refresh current user permissions and pending count if updated
          const updated = getCurrentUser();
          if (updated) {
            setCurrentUserState(updated);
          }
          setPendingApprovalsCount(getPendingCount());
        }}
      />

      {/* 4b. Incoming Registration Approvals Modal for Super Admin & Admin */}
      <PendingApprovalsModal
        isOpen={isPendingApprovalsOpen}
        onClose={() => {
          setIsPendingApprovalsOpen(false);
          setPendingApprovalsCount(getPendingCount());
        }}
        language={language}
        currentUser={currentUser}
        onApprovalsChanged={() => {
          setPendingApprovalsCount(getPendingCount());
          showToast(language === 'ur' ? 'صارف کی رسائی کامیابی سے تفویض کر دی گئی!' : 'User access granted successfully!');
        }}
        onOpenFullConsole={() => {
          setIsPendingApprovalsOpen(false);
          setIsSuperAdminConsoleOpen(true);
        }}
      />

      {/* 5. Access Denied Modal when export permission not granted */}
      <AccessDeniedModal
        isOpen={isAccessDeniedOpen}
        onClose={() => setIsAccessDeniedOpen(false)}
        requiredPermission={deniedPermissionType}
        onLoginAsSuperAdmin={() => {
          setTargetRoleForLogin('superadmin');
          setIsRoleLoginOpen(true);
        }}
        language={language}
      />

      {/* 6. Add Item Modal */}
      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onAddItem={handleAddItem}
        language={language}
      />

      {/* 7. Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        language={language}
      />

      {/* 8. Data Backup, Restore & App Update Modal */}
      <BackupUpdateModal
        isOpen={isBackupUpdateOpen}
        onClose={() => setIsBackupUpdateOpen(false)}
        language={language}
        items={items}
        onRestoreItems={(restoredItems) => {
          commitItemsChange(restoredItems);
          showToast(language === 'ur' ? 'ڈیٹا کامیابی سے بحال (Restore) کر دیا گیا ہے!' : 'Data restored successfully!');
        }}
        onMergeItems={(mergedItems) => {
          commitItemsChange(mergedItems);
          showToast(language === 'ur' ? 'نیا ڈیٹا کامیابی سے ضم (Merge) کر دیا گیا ہے!' : 'New items merged successfully!');
        }}
        onToast={showToast}
      />

      {/* Toast Notification Container */}
      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
