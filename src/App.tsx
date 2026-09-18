import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { WholesaleItem, UserRole, Language, Theme, FilterType, SortKey, SortDirection, UserAccount, PrimaryNavTab } from './types';
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
import { MobileBottomNav } from './components/MobileBottomNav';
import { SavedOrdersView } from './components/SavedOrdersView';
import { HistoryView } from './components/HistoryView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { Toast } from './components/Toast';
import { AuthGatewayScreen } from './components/AuthGatewayScreen';
import { exportWholesaleExcel } from './utils/exportHelpers';
import { getCurrentUser, hasExportPermission, getStoredUsers, saveStoredUsers, setCurrentUser as persistCurrentUser, logoutUser, getPendingCount } from './utils/authManager';
import { subscribeToCloudUsers, subscribeToCloudCatalog, fetchCloudCatalog, saveCatalogItemToCloud, deleteCatalogItemFromCloud } from './lib/firebase';
import { addAuditHistoryEntry } from './utils/historyManager';
import { generateLiveNotifications } from './utils/notificationsManager';
import { ChevronDown, RefreshCw } from 'lucide-react';

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

  // Cloud Firestore Real-Time Subscriptions for Multi-Device and Multi-User Sync
  useEffect(() => {
    // 1. Listen for user registrations, role grants, and approvals from cloud
    const unsubUsers = subscribeToCloudUsers((cloudUsers) => {
      saveStoredUsers(cloudUsers);
      setNotificationsTick((prev) => prev + 1);

      // If current user is logged in, refresh permissions in case Super Admin granted access
      const current = getCurrentUser();
      if (current) {
        const fresh = cloudUsers.find((u) => u.id === current.id);
        if (fresh && fresh.status === 'active') {
          if (
            fresh.role !== current.role ||
            fresh.canExportExcel !== current.canExportExcel ||
            fresh.canExportPdf !== current.canExportPdf ||
            fresh.canSendWhatsApp !== current.canSendWhatsApp
          ) {
            persistCurrentUser(fresh);
            setCurrentUserState(fresh);
            setUserRole(fresh.role);
          }
        }
      }
    });

    // 2. Listen for catalog items and rates from Cloud Firestore
    const unsubCatalog = subscribeToCloudCatalog((cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setItems((currentLocalItems) => {
          const demandMap = new Map<string, { stock: string; demand: number; status: string }>();
          currentLocalItems.forEach((it) => {
            if (it.name) {
              demandMap.set(it.name.trim(), {
                stock: it.stock || '',
                demand: it.demand || 0,
                status: it.status || 'اسٹاک دستیاب ہے'
              });
            }
          });

          const merged = cloudItems.map((cItem) => {
            const local = demandMap.get(cItem.name.trim());
            return {
              ...cItem,
              stock: local ? local.stock : (cItem.stock || ''),
              demand: local ? local.demand : (cItem.demand || 0),
              status: local ? local.status : (cItem.status || 'اسٹاک دستیاب ہے')
            };
          });

          try {
            localStorage.setItem('wholesale_demand_sheet_items_v3', JSON.stringify(merged));
          } catch {
            /* ignore */
          }
          return merged;
        });
      }
    });

    return () => {
      unsubUsers();
      unsubCatalog();
    };
  }, []);

  // Navigation State
  const [activeRoute, setActiveRoute] = useState<string>('demand-sheet');
  const [primaryTab, setPrimaryTab] = useState<PrimaryNavTab>('home');
  const [notificationsTick, setNotificationsTick] = useState<number>(0);
  // Language State (Defaults to 'en' as requested, with persistence for user selection)
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('orderla_app_language');
      if (stored === 'en' || stored === 'ur') {
        return stored;
      }
    } catch {
      /* ignore */
    }
    return 'en';
  });

  // Sync language selection to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('orderla_app_language', language);
    } catch {
      /* ignore */
    }
  }, [language]);
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

  // Master Items State (persisted with clean default empty stock/demand and automatic synchronization)
  const [items, setItems] = useState<WholesaleItem[]>(() => {
    try {
      const stored = localStorage.getItem('wholesale_demand_sheet_items_v3');
      if (stored) {
        const parsed: WholesaleItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored items is missing items (e.g. 64 instead of all 95), merge with DEFAULT_MASTER_ITEMS
          const hasAllItems = parsed.length >= DEFAULT_MASTER_ITEMS.length;

          if (!hasAllItems) {
            // Merge defaults with existing user demands & stocks
            const demandMap = new Map<string, { stock: string; demand: number; status: string }>();
            parsed.forEach((p) => {
              if (p.name) {
                demandMap.set(p.name.trim(), { stock: p.stock || '', demand: p.demand || 0, status: p.status || 'اسٹاک دستیاب ہے' });
              }
            });

            const merged: WholesaleItem[] = DEFAULT_MASTER_ITEMS.map((def) => {
              const saved = demandMap.get(def.name.trim());
              if (saved) {
                return { ...def, stock: saved.stock, demand: saved.demand, status: saved.status };
              }
              return { ...def };
            });

            // Preserve any custom user-added items not in default list
            const defaultNames = new Set(DEFAULT_MASTER_ITEMS.map((d) => d.name.trim()));
            const customItems = parsed.filter((p) => p.name && !defaultNames.has(p.name.trim()));
            const combined = [...merged, ...customItems];

            localStorage.setItem('wholesale_demand_sheet_items_v3', JSON.stringify(combined));
            return combined;
          }

          return parsed;
        }
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
  const [isRefreshingList, setIsRefreshingList] = useState<boolean>(false);

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

  // Live Notifications Feed & Badge Count
  const liveNotifications = useMemo(() => {
    return generateLiveNotifications(items, pendingApprovalsCount);
  }, [items, pendingApprovalsCount, notificationsTick]);

  const unreadNotificationsCount = useMemo(() => {
    return liveNotifications.filter((n) => !n.isRead).length;
  }, [liveNotifications]);

  // Show Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Refresh list and rates directly from Cloud Firestore database
  const handleRefreshListFromDatabase = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isRefreshingList) return;

    setIsRefreshingList(true);
    try {
      const cloudItems = await fetchCloudCatalog();
      if (cloudItems && cloudItems.length > 0) {
        setItems((currentLocalItems) => {
          const demandMap = new Map<string, { stock: string; demand: number; status: string }>();
          currentLocalItems.forEach((it) => {
            if (it.name) {
              demandMap.set(it.name.trim(), {
                stock: it.stock || '',
                demand: it.demand || 0,
                status: it.status || 'اسٹاک دستیاب ہے'
              });
            }
          });

          const merged = cloudItems.map((cItem) => {
            const local = demandMap.get(cItem.name.trim());
            return {
              ...cItem,
              stock: local ? local.stock : (cItem.stock || ''),
              demand: local ? local.demand : (cItem.demand || 0),
              status: local ? local.status : (cItem.status || 'اسٹاک دستیاب ہے')
            };
          });

          try {
            localStorage.setItem('wholesale_demand_sheet_items_v3', JSON.stringify(merged));
          } catch {
            /* ignore */
          }
          return merged;
        });

        showToast(
          language === 'ur'
            ? `🔄 کلاؤڈ ڈیٹا بیس سے لائیو فہرست ریفریش ہو گئی (${cloudItems.length} اشیاء اور تازہ ریٹس)`
            : `🔄 List refreshed from cloud database (${cloudItems.length} items & latest rates)`
        );
      }
    } catch (err) {
      console.error('[Database Refresh] Error fetching cloud catalog:', err);
      showToast(
        language === 'ur'
          ? '⚠️ کلاؤڈ ڈیٹا بیس سے رابطہ نہیں ہو سکا، لوکل ڈیٹا فعال ہے'
          : '⚠️ Cloud database unreachable, local cached data retained'
      );
    } finally {
      setTimeout(() => {
        setIsRefreshingList(false);
      }, 500);
    }
  }, [isRefreshingList, language, showToast]);

  // Save to localStorage & push history state
  const commitItemsChange = useCallback(
    (newItems: WholesaleItem[], recordHistory: boolean = true) => {
      setItems(newItems);
      try {
        localStorage.setItem('wholesale_demand_sheet_items_v3', JSON.stringify(newItems));
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
      // Restrict wholesale rate editing to Admin or Super Admin only
      if (field === 'rate' && userRole !== 'admin' && userRole !== 'superadmin') {
        showToast(
          language === 'ur'
            ? '⛔ ریٹ تبدیل کرنے کی اجازت صرف ایڈمن یا سپر ایڈمن کو ہے!'
            : '⛔ Only Admin or Super Admin can edit wholesale rates!'
        );
        return;
      }

      const currentItem = items.find((i) => i.id === id);
      let updatedItemObj: WholesaleItem | null = null;
      const updated = items.map((item) => {
        if (item.id === id) {
          updatedItemObj = { ...item, [field]: value };
          return updatedItemObj;
        }
        return item;
      });
      commitItemsChange(updated);

      // Persist rate or item modifications to Cloud Firestore
      if (updatedItemObj) {
        saveCatalogItemToCloud(updatedItemObj).catch((err) =>
          console.warn('[Firebase Firestore] Failed to persist item cell update:', err)
        );
      }

      if (field === 'demand' && currentItem && String(currentItem.demand) !== String(value)) {
        addAuditHistoryEntry({
          actionType: 'demand_change',
          userName: currentUser?.name || 'User',
          userRole: userRole,
          descriptionEn: `Updated demand for "${currentItem.name}" to ${value}`,
          descriptionUrdu: `"${currentItem.name}" کی طلب ${value} درج کی گئی`,
          affectedItem: currentItem.name,
          oldValue: String(currentItem.demand || 0),
          newValue: String(value)
        });
      } else if (field === 'rate' && currentItem && String(currentItem.rate) !== String(value)) {
        addAuditHistoryEntry({
          actionType: 'rate_change',
          userName: currentUser?.name || 'User',
          userRole: userRole,
          descriptionEn: `Updated wholesale rate for "${currentItem.name}" to Rs. ${value}`,
          descriptionUrdu: `"${currentItem.name}" کا ہول سیل ریٹ Rs. ${value} کیا گیا`,
          affectedItem: currentItem.name,
          oldValue: String(currentItem.rate || 0),
          newValue: String(value)
        });
      }
    },
    [items, commitItemsChange, userRole, showToast, language, currentUser]
  );

  // Add Item handler
  const handleAddItem = (newItemData: Omit<WholesaleItem, 'id'>) => {
    // Restrict Add Item to Admin or Super Admin only
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      showToast(
        language === 'ur'
          ? '⛔ نیا آئٹم شامل کرنے کی اجازت صرف ایڈمن یا سپر ایڈمن کو ہے!'
          : '⛔ Only Admin or Super Admin can add new items!'
      );
      return;
    }
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem: WholesaleItem = {
      id: nextId,
      ...newItemData
    };
    const updated = [newItem, ...items];
    commitItemsChange(updated);

    // Persist newly added item directly to Cloud Firestore
    saveCatalogItemToCloud(newItem).then((success) => {
      if (success) {
        console.log(`[Firebase Firestore] Added item "${newItem.name}" saved to cloud.`);
      }
    }).catch((err) => {
      console.warn('[Firebase Firestore] Cloud add error:', err);
    });

    addAuditHistoryEntry({
      actionType: 'rate_change',
      userName: currentUser?.name || 'Super Admin',
      userRole: userRole,
      descriptionEn: `Added new wholesale item "${newItem.name}" with rate Rs. ${newItem.rate}`,
      descriptionUrdu: `نیا ہول سیل آئٹم "${newItem.name}" بنیادی ریٹ Rs. ${newItem.rate} کے ساتھ شامل کیا گیا`,
      affectedItem: newItem.name,
      newValue: String(newItem.rate)
    });

    showToast(language === 'ur' ? 'نیا آئٹم کلاؤڈ ڈیٹا بیس میں محفوظ کر دیا گیا!' : 'New item saved to database successfully!');
  };

  // Delete item handler
  const handleDeleteItem = useCallback(
    (id: number) => {
      const itemToDelete = items.find((i) => i.id === id);
      const updated = items.filter((i) => i.id !== id);
      commitItemsChange(updated);

      // Remove from Cloud Firestore
      deleteCatalogItemFromCloud(id).catch((err) => {
        console.warn('[Firebase Firestore] Cloud delete error:', err);
      });

      if (itemToDelete) {
        addAuditHistoryEntry({
          actionType: 'rate_change',
          userName: currentUser?.name || 'Super Admin',
          userRole: userRole,
          descriptionEn: `Deleted wholesale item "${itemToDelete.name}" from catalog`,
          descriptionUrdu: `ہول سیل آئٹم "${itemToDelete.name}" فہرست سے حذف کیا گیا`,
          affectedItem: itemToDelete.name
        });
      }

      showToast(language === 'ur' ? 'آئٹم ڈیٹا بیس سے ڈیلیٹ کر دیا گیا' : 'Item removed from database');
    },
    [items, commitItemsChange, showToast, language, currentUser, userRole]
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

  // Load saved order into active sheet
  const handleLoadOrderToSheet = (orderItems: WholesaleItem[], orderTitle: string) => {
    commitItemsChange(orderItems);
    setIsListVisible(true);
    setPrimaryTab('home');
    addAuditHistoryEntry({
      actionType: 'demand_change',
      userName: currentUser?.name || 'User',
      userRole: userRole,
      descriptionEn: `Loaded saved order "${orderTitle}" into active sheet (${orderItems.length} items)`,
      descriptionUrdu: `محفوظ شدہ آرڈر "${orderTitle}" ایکٹو شیٹ میں لوڈ کیا گیا (${orderItems.length} اشیاء)`
    });
    showToast(
      language === 'ur'
        ? `آرڈر "${orderTitle}" کامیابی سے شیٹ میں لوڈ ہو گیا!`
        : `Order "${orderTitle}" loaded into active sheet!`
    );
  };

  // Save manual snapshot
  const handleManualSave = () => {
    try {
      localStorage.setItem('wholesale_demand_sheet_items_v3', JSON.stringify(items));
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
    if (['demand-sheet', 'priority-orders', 'low-stock', 'shalmi-market', 'kashif-wholesale'].includes(routeId)) {
      setPrimaryTab('home');
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
    <div className="w-full min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] transition-colors duration-200 pt-2 sm:pt-4 pb-24 md:pb-6 px-2 sm:px-4 lg:px-6 xl:px-8 selection:bg-[var(--accent-blue)] selection:text-white relative">
      
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
          {/* Tier 2: Top Utility & Control Bar with Theme Switcher, Quick Swiper, Export & Print, and Center Desktop Navigation */}
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
            onOpenMobileMenu={() => {
              if (window.innerWidth < 1024) {
                setIsMobileSidebarOpen(true);
              } else {
                setIsSidebarCollapsed((prev) => !prev);
              }
            }}
            canAddItem={userRole === 'admin' || userRole === 'superadmin'}
            userRole={userRole}
            activeTab={primaryTab}
            onSelectTab={setPrimaryTab}
            unreadNotificationsCount={unreadNotificationsCount}
          />

          {/* 1. HOME TAB: Wholesale Demand Dashboard */}
          {primaryTab === 'home' && (
            <>
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
                  onClick={() => {
                    if (!isListVisible) {
                      setIsListVisible(true);
                      handleRefreshListFromDatabase();
                    } else {
                      setIsListVisible(false);
                    }
                  }}
                  className={`group inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm cursor-pointer transition-all duration-200 shadow-md active:scale-95 ${
                    isListVisible
                      ? 'neu-raised-flat text-[var(--accent-blue)] hover:neu-inset-sunken'
                      : 'neu-btn-accent text-white hover:scale-[1.02]'
                  }`}
                  title={isListVisible ? (language === 'ur' ? 'فہرست چھپائیں' : 'Hide the complete items list') : (language === 'ur' ? 'ڈیٹا بیس سے لائیو فہرست کھولیں' : 'Open live list from database')}
                >
                  <div className={`p-1 rounded-xl transition-transform duration-300 ${
                    isListVisible ? 'rotate-180 text-[var(--accent-blue)] neu-inset-small' : 'bg-white/20 text-white'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>

                  <span className="tracking-wide">
                    {isRefreshingList
                      ? (language === 'ur' ? 'ڈیٹا بیس سے ریفریش ہو رہا ہے...' : 'Refreshing from Database...')
                      : isListVisible
                      ? (language === 'ur' ? 'فہرست بند کریں / Hide List' : 'Hide the List / فہرست بند کریں')
                      : (language === 'ur' ? 'فہرست کھولیں / Open the List' : 'Open the List / فہرست کھولیں')}
                  </span>

                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                    isListVisible ? 'neu-inset-sm text-[var(--accent-blue)]' : 'bg-white/25 text-white'
                  }`}>
                    {filteredAndSortedItems.length} {language === 'ur' ? 'آئٹمز' : 'Items'}
                  </span>

                  {/* List Refreshing Arrow Icon Inside Button */}
                  <div
                    id="refreshListArrowBtn"
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isListVisible) setIsListVisible(true);
                      handleRefreshListFromDatabase(e);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        e.preventDefault();
                        if (!isListVisible) setIsListVisible(true);
                        handleRefreshListFromDatabase();
                      }
                    }}
                    className={`p-1.5 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer ${
                      isListVisible
                        ? 'neu-inset-small text-[var(--accent-blue)] hover:bg-blue-100/60 active:scale-90'
                        : 'bg-white/20 hover:bg-white/30 text-white active:scale-90'
                    }`}
                    title={language === 'ur' ? 'ڈیٹا بیس سے لائیو فہرست ریفریش کریں / Refresh List from Database' : 'Refresh list from cloud database'}
                  >
                    <RefreshCw
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isRefreshingList ? 'animate-spin' : 'group-hover:rotate-90'
                      }`}
                    />
                  </div>
                </button>
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
                  canEditRates={userRole === 'admin' || userRole === 'superadmin'}
                />

                {/* 2. Mobile Responsive View: Accordion Cards */}
                <MobileCardView
                  items={filteredAndSortedItems}
                  onUpdateCell={handleUpdateCell}
                  onDeleteItem={handleDeleteItem}
                  totalUnits={metrics.totalUnits}
                  totalBudget={metrics.totalBudget}
                  language={language}
                  canEditRates={userRole === 'admin' || userRole === 'superadmin'}
                />
              </div>
            </>
          )}

          {/* 2. SAVED ORDERS TAB */}
          {primaryTab === 'saved-orders' && (
            <SavedOrdersView
              currentItems={items}
              language={language}
              onLoadOrderToSheet={handleLoadOrderToSheet}
              onRequestWhatsApp={(orderItems) => handleOpenWhatsAppRecipient(orderItems)}
              onToast={showToast}
              onNavigateHome={() => setPrimaryTab('home')}
            />
          )}

          {/* 3. HISTORY TAB */}
          {primaryTab === 'history' && (
            <HistoryView
              language={language}
              onToast={showToast}
            />
          )}

          {/* 4. NOTIFICATIONS TAB */}
          {primaryTab === 'notifications' && (
            <NotificationsView
              notifications={liveNotifications}
              language={language}
              onNavigateTab={(tab) => setPrimaryTab(tab)}
              onToast={showToast}
              onRefreshNotifications={() => setNotificationsTick((t) => t + 1)}
            />
          )}

          {/* 5. PROFILE TAB */}
          {primaryTab === 'profile' && currentUser && (
            <ProfileView
              currentUser={currentUser}
              userRole={userRole}
              language={language}
              theme={theme}
              onToggleTheme={setTheme}
              onToggleLanguage={setLanguage}
              onRequestRoleSwitch={handleRequestRoleSwitch}
              onOpenSuperAdminConsole={() => setIsSuperAdminConsoleOpen(true)}
              onOpenApprovals={() => setIsPendingApprovalsOpen(true)}
              pendingApprovalsCount={pendingApprovalsCount}
              onLogout={handleLogout}
              onToast={showToast}
            />
          )}
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

      {/* Mobile Bottom Navigation Bar: full width, 5 options, center home, subtle curve under active tab */}
      <MobileBottomNav
        activeTab={primaryTab}
        onSelectTab={(tab) => setPrimaryTab(tab)}
        language={language}
        unreadCount={unreadNotificationsCount}
      />

      {/* Toast Notification Container */}
      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
