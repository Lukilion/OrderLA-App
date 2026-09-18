import { UserAccount, WhatsAppRecipient } from '../types';

export const SUPER_ADMIN_NOTIFICATION_EMAIL = 'hassantareen001@gmail.com';

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user-superadmin-lukilion',
    username: 'Lukilion',
    password: 'Lukilion@78612',
    name: 'Lukilion (Super Admin)',
    email: 'hassantareen001@gmail.com',
    role: 'superadmin',
    status: 'active',
    canExportExcel: true,
    canExportPdf: true,
    canSendWhatsApp: true,
    createdAt: '2026-09-10'
  },
  {
    id: 'user-admin-default',
    username: 'admin',
    password: 'admin123',
    name: 'Admin Manager',
    email: 'admin@orderla.pk',
    role: 'admin',
    status: 'active',
    canExportExcel: true,
    canExportPdf: true,
    canSendWhatsApp: true,
    createdAt: '2026-09-10'
  },
  {
    id: 'user-buyer-ali',
    username: 'ali_007',
    password: 'Ali@123789',
    name: 'Ali (Buyer)',
    email: 'ali@orderla.pk',
    role: 'buyer',
    status: 'active',
    canExportExcel: false,
    canExportPdf: false,
    canSendWhatsApp: true,
    createdAt: '2026-09-18'
  },
  {
    id: 'user-buyer-default',
    username: 'buyer',
    password: '',
    name: 'Wholesale Buyer (خریدار)',
    role: 'buyer',
    status: 'active',
    canExportExcel: false,
    canExportPdf: false,
    canSendWhatsApp: true,
    createdAt: '2026-09-10'
  },
  {
    id: 'user-auditor-default',
    username: 'auditor',
    password: 'audit123',
    name: 'Wholesale Auditor (آڈیٹر)',
    role: 'auditor',
    status: 'active',
    canExportExcel: true,
    canExportPdf: true,
    canSendWhatsApp: false,
    createdAt: '2026-09-10'
  }
];

export const PREDEFINED_WHATSAPP_RECIPIENTS: WhatsAppRecipient[] = [
  {
    id: 'recip-super-admin',
    nameEn: 'Super Admin',
    nameUrdu: 'سپر ایڈمن',
    phone: '+923076220633',
    role: 'Super Admin'
  },
  {
    id: 'recip-store-keeper',
    nameEn: 'Shahalam Warehouse',
    nameUrdu: 'شاہ عالم گودام',
    phone: '+923001234567',
    role: 'Warehouse / Store'
  },
  {
    id: 'recip-purchaser-hassan',
    nameEn: 'Purchaser Hassan',
    nameUrdu: 'پرچیزر حسن',
    phone: '+923076220633',
    role: 'Market Purchaser'
  }
];
