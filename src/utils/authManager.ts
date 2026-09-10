import { UserAccount, UserRole, WhatsAppRecipient } from '../types';

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user-superadmin-lukilion',
    username: 'Lukilion',
    password: 'Lukilion@78612',
    name: 'Lukilion (Super Admin)',
    role: 'superadmin',
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
    role: 'admin',
    canExportExcel: true,
    canExportPdf: true,
    canSendWhatsApp: true,
    createdAt: '2026-09-10'
  },
  {
    id: 'user-buyer-default',
    username: 'buyer',
    password: '',
    name: 'Wholesale Buyer (خریدار)',
    role: 'buyer',
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
    id: 'recip-admin',
    nameEn: 'Admin',
    nameUrdu: 'ایڈمن',
    phone: '+923057851808',
    role: 'Admin'
  }
];

const USERS_STORAGE_KEY = 'orderla_users_accounts_v1';
const CURRENT_USER_STORAGE_KEY = 'orderla_current_user_v1';

/**
 * Retrieves all users from localStorage, initializing with default accounts if empty
 */
export function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed: UserAccount[] = JSON.parse(raw);
      // Ensure Lukilion always exists
      const hasLukilion = parsed.some(
        (u) => u.username.toLowerCase() === 'lukilion'
      );
      if (!hasLukilion) {
        parsed.unshift(DEFAULT_USERS[0]);
        saveStoredUsers(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load users from localStorage', err);
  }

  // Initialize with defaults
  saveStoredUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

/**
 * Persists all users to localStorage
 */
export function saveStoredUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users to localStorage', err);
  }
}

/**
 * Gets currently logged in user
 */
export function getCurrentUser(): UserAccount {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (raw) {
      const user: UserAccount = JSON.parse(raw);
      // Verify against fresh stored users list
      const users = getStoredUsers();
      const matched = users.find((u) => u.id === user.id);
      if (matched) return matched;
    }
  } catch {
    /* fallback */
  }

  // Default initial session is Super Admin (Lukilion) or Buyer
  const users = getStoredUsers();
  const superAdmin = users.find((u) => u.username.toLowerCase() === 'lukilion') || users[0];
  setCurrentUser(superAdmin);
  return superAdmin;
}

/**
 * Sets currently logged in user
 */
export function setCurrentUser(user: UserAccount): void {
  try {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to set current user', err);
  }
}

/**
 * Authenticate by username and password
 */
export function authenticateUser(
  username: string,
  pass: string
): { success: boolean; user?: UserAccount; error?: string } {
  const users = getStoredUsers();
  const matched = users.find(
    (u) => u.username.trim().toLowerCase() === username.trim().toLowerCase()
  );

  if (!matched) {
    return { success: false, error: 'صارف کا نام موجود نہیں ہے (User not found)' };
  }

  // If user has a password, verify it exactly
  if (matched.password && matched.password !== pass.trim()) {
    return { success: false, error: 'غلط پاس ورڈ (Incorrect password)' };
  }

  setCurrentUser(matched);
  return { success: true, user: matched };
}

/**
 * Add a new user (Only Super Admin has authority)
 */
export function addNewUser(
  newUser: Omit<UserAccount, 'id' | 'createdAt'>
): { success: boolean; user?: UserAccount; error?: string } {
  const users = getStoredUsers();

  // Check duplicate username
  const exists = users.some(
    (u) => u.username.trim().toLowerCase() === newUser.username.trim().toLowerCase()
  );
  if (exists) {
    return { success: false, error: 'یہ صارف نام پہلے سے موجود ہے (Username already exists)' };
  }

  const userAccount: UserAccount = {
    ...newUser,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString().split('T')[0]
  };

  const updatedList = [...users, userAccount];
  saveStoredUsers(updatedList);
  return { success: true, user: userAccount };
}

/**
 * Update user permissions
 */
export function updateUserPermissions(
  userId: string,
  permissions: {
    canExportExcel?: boolean;
    canExportPdf?: boolean;
    canSendWhatsApp?: boolean;
    role?: UserRole;
    name?: string;
    password?: string;
  }
): void {
  const users = getStoredUsers();
  const updated = users.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        ...permissions
      };
    }
    return u;
  });
  saveStoredUsers(updated);

  // If updating current user, refresh current user state too
  const current = getCurrentUser();
  if (current.id === userId) {
    const fresh = updated.find((u) => u.id === userId);
    if (fresh) setCurrentUser(fresh);
  }
}

/**
 * Delete a user (Cannot delete Super Admin Lukilion)
 */
export function deleteUser(userId: string): { success: boolean; error?: string } {
  const users = getStoredUsers();
  const target = users.find((u) => u.id === userId);

  if (!target) {
    return { success: false, error: 'User not found' };
  }

  if (target.username.toLowerCase() === 'lukilion') {
    return { success: false, error: 'سپر ایڈمن کو ڈیلیٹ نہیں کیا جا سکتا (Cannot delete Super Admin)' };
  }

  const filtered = users.filter((u) => u.id !== userId);
  saveStoredUsers(filtered);

  // If deleted current user, switch to default buyer or superadmin
  const current = getCurrentUser();
  if (current.id === userId) {
    setCurrentUser(filtered[0]);
  }

  return { success: true };
}

/**
 * Check export permission
 */
export function hasExportPermission(
  user: UserAccount | null,
  type: 'excel' | 'pdf' | 'whatsapp'
): boolean {
  if (!user) return false;
  // Super admin always has all permissions
  if (user.role === 'superadmin' || user.username.toLowerCase() === 'lukilion') {
    return true;
  }

  switch (type) {
    case 'excel':
      return !!user.canExportExcel;
    case 'pdf':
      return !!user.canExportPdf;
    case 'whatsapp':
      return !!user.canSendWhatsApp;
    default:
      return false;
  }
}
