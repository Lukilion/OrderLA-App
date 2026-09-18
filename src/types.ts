export interface WholesaleItem {
  id: number;
  name: string;
  cat: string;
  rate: number;
  stock: string;
  demand: number;
  status: string;
}

export type UserRole = 'superadmin' | 'admin' | 'buyer' | 'auditor' | 'purchaser';

export type UserApprovalStatus = 'active' | 'pending' | 'rejected' | 'suspended';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  requestedRole?: UserRole;
  status?: UserApprovalStatus;
  canExportExcel: boolean;
  canExportPdf: boolean;
  canSendWhatsApp: boolean;
  createdAt: string;
  notes?: string;
}

export interface WhatsAppRecipient {
  id: string;
  nameEn: string;
  nameUrdu: string;
  phone: string;
  role: string;
}

export type Language = 'ur' | 'en';

export type Theme = 'light' | 'dark';

export type PrimaryNavTab = 'saved-orders' | 'history' | 'home' | 'notifications' | 'profile';

export interface SavedOrder {
  id: string;
  orderNumber: string;
  title: string;
  date: string;
  timestamp: number;
  totalItems: number;
  totalUnits: number;
  totalBudget: number;
  buyerName?: string;
  status: 'draft' | 'completed' | 'sent';
  notes?: string;
  items: WholesaleItem[];
}

export interface AuditHistoryEntry {
  id: string;
  timestamp: number;
  date: string;
  userRole: UserRole;
  userName: string;
  actionType: 'demand_change' | 'rate_change' | 'item_add' | 'item_delete' | 'order_saved' | 'export_excel' | 'whatsapp_share' | 'reset' | 'revoke';
  descriptionEn: string;
  descriptionUrdu: string;
  affectedItem?: string;
  oldValue?: string | number;
  newValue?: string | number;
}

export interface AppNotification {
  id: string;
  timestamp: number;
  type: 'stock' | 'demand' | 'approval' | 'backup' | 'system';
  severity: 'urgent' | 'warning' | 'info' | 'success';
  titleEn: string;
  titleUrdu: string;
  messageEn: string;
  messageUrdu: string;
  isRead: boolean;
  actionRoute?: PrimaryNavTab;
  actionPayload?: string;
}

export interface NavRoute {
  id: string;
  labelUrdu: string;
  labelEnglish: string;
  sectionUrdu?: string;
  sectionEnglish?: string;
  descriptionUrdu?: string;
  descriptionEnglish?: string;
  icon: string;
  badge?: string;
  roles: UserRole[];
}

export type FilterType = 'all' | 'demand' | 'lowstock' | 'shalmi' | 'kashif';

export type SortKey = 'id' | 'name' | 'cat' | 'rate' | 'stock' | 'demand' | 'cost';

export type SortDirection = 'asc' | 'desc';

export const STATUS_PRESETS: string[] = [
  'اسٹاک دستیاب ہے',
  'فوری طلب (ہائی ڈیمانڈ)',
  'ری اسٹاک مطلوب / درکار',
  'اسٹاک ختم (فوری آرڈر)',
  'مناسب اسٹاک',
  'رننگ اسٹاک',
  'وافر اسٹاک',
  'اسٹاک کافی ہے',
  'اسٹاک موجود ہے',
  'بھاری اسٹاک موجود ہے',
  'تیز فروخت ترین آئٹم',
  'ہفتہ وار ری اسٹاک'
];
