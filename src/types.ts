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

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  canExportExcel: boolean;
  canExportPdf: boolean;
  canSendWhatsApp: boolean;
  createdAt: string;
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

export interface NavRoute {
  id: string;
  labelUrdu: string;
  labelEnglish: string;
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
