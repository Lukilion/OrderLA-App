import { UserAccount, UserRole, UserApprovalStatus, WhatsAppRecipient } from '../types';
import { saveSessionState, loadSessionState, setCookie, getCookie } from './sessionCache';
import { DEFAULT_USERS, PREDEFINED_WHATSAPP_RECIPIENTS, SUPER_ADMIN_NOTIFICATION_EMAIL } from '../data/defaultUsers';
import { saveUserToCloud, updateUserStatusInCloud } from '../lib/firebase';

export { DEFAULT_USERS, PREDEFINED_WHATSAPP_RECIPIENTS, SUPER_ADMIN_NOTIFICATION_EMAIL };

const USERS_STORAGE_KEY = 'orderla_users_accounts_v1';
const CURRENT_USER_STORAGE_KEY = 'orderla_current_user_v1';

/**
 * Retrieves all users from localStorage / Cache, initializing with default accounts if empty
 */
export function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY) || getCookie(USERS_STORAGE_KEY);
    if (raw) {
      const parsed: UserAccount[] = JSON.parse(raw);
      let modified = false;

      // Ensure Lukilion always exists
      const hasLukilion = parsed.some(
        (u) => u.username.toLowerCase() === 'lukilion'
      );
      if (!hasLukilion) {
        parsed.unshift(DEFAULT_USERS[0]);
        modified = true;
      }

      // Ensure Ali (Buyer ali_007) exists
      const hasAli = parsed.some(
        (u) => u.username.toLowerCase() === 'ali_007'
      );
      if (!hasAli) {
        const aliDefault = DEFAULT_USERS.find((u) => u.username.toLowerCase() === 'ali_007');
        if (aliDefault) {
          parsed.push(aliDefault);
          modified = true;
        }
      }

      if (modified) {
        saveStoredUsers(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load users from storage', err);
  }

  // Initialize with defaults
  saveStoredUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

/**
 * Persists all users to localStorage and cookies
 */
export function saveStoredUsers(users: UserAccount[]): void {
  saveSessionState(USERS_STORAGE_KEY, users);
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('orderla_users_updated', { detail: users }));
    }
  } catch {
    /* ignore */
  }
}

export const AUTH_SESSION_FLAG = 'orderla_session_authenticated_v1';

export function isSessionAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(AUTH_SESSION_FLAG) === 'true';
  } catch {
    return false;
  }
}

export function setSessionAuthenticated(authenticated: boolean): void {
  try {
    if (authenticated) {
      sessionStorage.setItem(AUTH_SESSION_FLAG, 'true');
    } else {
      sessionStorage.removeItem(AUTH_SESSION_FLAG);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Gets currently logged in user (null if no active authenticated session)
 */
export function getCurrentUser(): UserAccount | null {
  try {
    // If not authenticated in the current browser session, force login/register screen
    if (!isSessionAuthenticated()) {
      return null;
    }
    const user = loadSessionState<UserAccount | null>(CURRENT_USER_STORAGE_KEY, null);
    if (user) {
      // Verify against fresh stored users list
      const users = getStoredUsers();
      const matched = users.find((u) => u.id === user.id);
      if (matched) {
        // Prevent access if user is still pending or was rejected
        if (matched.status === 'pending' || matched.status === 'rejected') {
          return null;
        }
        return matched;
      }
    }
  } catch {
    /* fallback */
  }

  // Do not auto-login: user must log in or register at the very first stage
  return null;
}

/**
 * Sets currently logged in user with cache and cookie synchronization
 */
export function setCurrentUser(user: UserAccount | null): void {
  if (user) {
    setSessionAuthenticated(true);
    saveSessionState(CURRENT_USER_STORAGE_KEY, user);
  } else {
    logoutUser();
  }
}

/**
 * Clears current user session and removes tokens from localStorage and cookies
 */
export function logoutUser(): void {
  setSessionAuthenticated(false);
  saveSessionState(CURRENT_USER_STORAGE_KEY, null);
  try {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    setCookie(CURRENT_USER_STORAGE_KEY, '', -1);
  } catch {
    /* ignore */
  }
}

/**
 * Get all pending registration requests awaiting Administrator approval
 */
export function getPendingRegistrations(): UserAccount[] {
  const users = getStoredUsers();
  return users.filter((u) => u.status === 'pending');
}

/**
 * Get count of pending registration requests
 */
export function getPendingCount(): number {
  return getPendingRegistrations().length;
}

/**
 * Construct email body and mailto link to notify hassantareen001@gmail.com
 * with different levels of access granting options for administrator approval
 */
export function generateAdminApprovalEmail(newUser: UserAccount): {
  to: string;
  subject: string;
  body: string;
  mailtoUrl: string;
} {
  const to = SUPER_ADMIN_NOTIFICATION_EMAIL;
  const subject = `[OrderLa Registration] New Access Approval Request: ${newUser.name} (@${newUser.username})`;

  const requestedRoleLabel =
    newUser.requestedRole === 'admin'
      ? 'Level 3: Operational Admin (مکمل ایڈمن اختیارات)'
      : newUser.requestedRole === 'auditor'
      ? 'Level 2: Financial Auditor (آڈیٹر و رپورٹنگ)'
      : 'Level 1: Wholesale Buyer (خریدار - بنیادی رسائی)';

  const body = `Dear OrderLa Administrator (${SUPER_ADMIN_NOTIFICATION_EMAIL}),

A new user has submitted a registration request for the OrderLa Wholesale Business Operating System (BOS).

==================================================
APPLICANT DETAILS:
==================================================
• Full Name: ${newUser.name}
• Desired Username: @${newUser.username}
• Contact Phone / WhatsApp: ${newUser.phone || 'Not provided'}
• Email: ${newUser.email || 'Not provided'}
• Registration Date: ${newUser.createdAt}
• Requested Access Level: ${requestedRoleLabel}
• Applicant Notes / Branch: ${newUser.notes || 'N/A'}

==================================================
ACCESS LEVEL GRANTING OPTIONS AVAILABLE:
==================================================
Please review and select the appropriate authority tier for this applicant:

OPTION 1: LEVEL 1 - WHOLESALE BUYER (خریدار)
  - Permissions: View demand sheets & send WhatsApp orders.
  - Restricted: Cannot export Excel, cannot download PDF, cannot edit catalog rates.

OPTION 2: LEVEL 2 - FINANCIAL AUDITOR (آڈیٹر)
  - Permissions: View demand sheets, perform stock audit, export Excel spreadsheets & PDF documents.
  - Restricted: Read-only for master pricing; cannot modify base rates or delete inventory items.

OPTION 3: LEVEL 3 - OPERATIONAL ADMIN (ایڈمن مینیجر)
  - Permissions: Full catalog editing, add/edit/delete wholesale items, edit base rates, full export (Excel/PDF/WhatsApp).

OPTION 4: LEVEL 4 - SUPER ADMIN AUTHORITY (سپر ایڈمن)
  - Permissions: Complete system authority, user management, backup/restore, permission overrides.

==================================================
HOW TO APPROVE OR REJECT:
==================================================
1. Log into OrderLa Wholesale BOS as Super Admin (@Lukilion).
2. Open the "Super Admin Console" (Crown 👑 icon in Top Navigation).
3. Under "Pending Registrations (رجسٹریشن کی درخواستیں)", click "Approve" with the desired access level, or "Reject".
Alternatively, reply to this email directly with your approved access level instruction.

--------------------------------------------------
OrderLa Wholesale BOS Automated Notification System
Security & Access Control Protocol`;

  const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { to, subject, body, mailtoUrl };
}

/**
 * Register a new user account with pending approval status and generate admin notification
 */
export function registerUserAccount(data: {
  name: string;
  username: string;
  password: string;
  email?: string;
  phone?: string;
  requestedRole?: UserRole;
  notes?: string;
}): {
  success: boolean;
  user?: UserAccount;
  mailtoUrl?: string;
  error?: string;
} {
  const users = getStoredUsers();

  const trimmedUsername = data.username.trim();
  if (!trimmedUsername) {
    return { success: false, error: 'براہِ کرم یوزر نیم درج کریں (Username is required)' };
  }

  // Check existing
  const exists = users.some(
    (u) => u.username.trim().toLowerCase() === trimmedUsername.toLowerCase()
  );
  if (exists) {
    return { success: false, error: 'یہ صارف نام پہلے سے زیر استعمال ہے (Username already exists)' };
  }

  const requestedRole = data.requestedRole || 'buyer';

  // Create new user in pending state
  const newUser: UserAccount = {
    id: `user-reg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    username: trimmedUsername,
    password: data.password || '',
    name: data.name.trim() || trimmedUsername,
    email: data.email?.trim() || '',
    phone: data.phone?.trim() || '',
    role: requestedRole === 'buyer' ? 'buyer' : 'buyer', // provisional role is buyer until approved
    requestedRole,
    status: 'pending',
    canExportExcel: false,
    canExportPdf: false,
    canSendWhatsApp: true,
    createdAt: new Date().toISOString().split('T')[0],
    notes: data.notes?.trim() || ''
  };

  const updatedList = [...users, newUser];
  saveStoredUsers(updatedList);

  // Sync new user registration directly to Firebase Cloud Firestore
  saveUserToCloud(newUser).catch((err) => {
    console.warn('[Firebase Auth] Failed to sync new registration to cloud:', err);
  });

  const emailInfo = generateAdminApprovalEmail(newUser);

  return {
    success: true,
    user: newUser,
    mailtoUrl: emailInfo.mailtoUrl
  };
}

/**
 * Approve a pending registration with specific access level and permissions
 */
export function approveUserRegistration(
  userId: string,
  grantedRole: UserRole,
  permissions?: {
    canExportExcel?: boolean;
    canExportPdf?: boolean;
    canSendWhatsApp?: boolean;
  }
): { success: boolean; error?: string } {
  const users = getStoredUsers();
  const targetIndex = users.findIndex((u) => u.id === userId);

  if (targetIndex === -1) {
    return { success: false, error: 'صارف نہیں ملا (User not found)' };
  }

  // Set defaults based on role if permissions not specified
  const isAuditorOrAbove = grantedRole === 'auditor' || grantedRole === 'admin' || grantedRole === 'superadmin';
  const isAdminOrAbove = grantedRole === 'admin' || grantedRole === 'superadmin';

  users[targetIndex] = {
    ...users[targetIndex],
    role: grantedRole,
    status: 'active',
    canExportExcel: permissions?.canExportExcel ?? isAuditorOrAbove,
    canExportPdf: permissions?.canExportPdf ?? isAuditorOrAbove,
    canSendWhatsApp: permissions?.canSendWhatsApp ?? true
  };

  saveStoredUsers(users);

  // Sync approved status and authority tier to Firebase Cloud Firestore
  updateUserStatusInCloud(userId, {
    role: grantedRole,
    status: 'active',
    canExportExcel: permissions?.canExportExcel ?? isAuditorOrAbove,
    canExportPdf: permissions?.canExportPdf ?? isAuditorOrAbove,
    canSendWhatsApp: permissions?.canSendWhatsApp ?? true
  }).catch((err) => {
    console.warn('[Firebase Auth] Failed to sync approval to cloud:', err);
  });

  // If current user is this user, refresh session
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(users[targetIndex]);
  }

  return { success: true };
}

/**
 * Reject a pending registration
 */
export function rejectUserRegistration(
  userId: string,
  reason?: string
): { success: boolean; error?: string } {
  const users = getStoredUsers();
  const targetIndex = users.findIndex((u) => u.id === userId);

  if (targetIndex === -1) {
    return { success: false, error: 'صارف نہیں ملا (User not found)' };
  }

  users[targetIndex] = {
    ...users[targetIndex],
    status: 'rejected',
    notes: reason ? `Rejected: ${reason}` : 'Registration request declined by administrator'
  };

  saveStoredUsers(users);

  // Sync rejection to Firebase Cloud Firestore
  updateUserStatusInCloud(userId, {
    status: 'rejected'
  }).catch((err) => {
    console.warn('[Firebase Auth] Failed to sync rejection to cloud:', err);
  });

  return { success: true };
}

/**
 * Authenticate by username and password
 */
export function authenticateUser(
  username: string,
  pass: string
): { 
  success: boolean; 
  user?: UserAccount; 
  error?: string;
  isPending?: boolean;
  isRejected?: boolean;
} {
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

  // Security Check: Pending approval accounts cannot enter the app
  if (matched.status === 'pending') {
    return {
      success: false,
      isPending: true,
      user: matched,
      error: 'آپ کی درخواست ایڈمنسٹریٹر کی حتمی منظوری کے انتظار میں ہے۔ براہِ کرم انتظار فرمائیں۔ (Your registration is pending approval by Super Admin or Admin. Please wait until access is granted.)'
    };
  }

  // Rejected accounts
  if (matched.status === 'rejected') {
    return {
      success: false,
      isRejected: true,
      user: matched,
      error: 'آپ کی رجسٹریشن درخواست ایڈمنسٹریٹر نے مسترد کر دی ہے۔ (Your registration was declined by administrator.)'
    };
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

  // Sync new user account directly to Firebase Cloud Firestore
  saveUserToCloud(userAccount).catch((err) => {
    console.warn('[Firebase Auth] Failed to sync new user to cloud:', err);
  });

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

  // Sync updated permissions to Firebase Cloud Firestore
  updateUserStatusInCloud(userId, permissions).catch((err) => {
    console.warn('[Firebase Auth] Failed to sync updated permissions to cloud:', err);
  });

  // If updating current user, refresh current user state too
  const current = getCurrentUser();
  if (current && current.id === userId) {
    const fresh = updated.find((u) => u.id === userId);
    if (fresh) setCurrentUser(fresh);
  }
}

/**
 * Super Admin or Admin update any user details (username, password, name, role, permissions, status)
 * Supports promoting to any role or demoting.
 */
export function updateUserDetails(
  userId: string,
  updates: {
    name?: string;
    username?: string;
    password?: string;
    role?: UserRole;
    status?: UserApprovalStatus;
    canExportExcel?: boolean;
    canExportPdf?: boolean;
    canSendWhatsApp?: boolean;
    email?: string;
    phone?: string;
  }
): { success: boolean; error?: string; user?: UserAccount } {
  const users = getStoredUsers();
  const targetIndex = users.findIndex((u) => u.id === userId);

  if (targetIndex === -1) {
    return { success: false, error: 'User not found / صارف نہیں ملا' };
  }

  const target = users[targetIndex];
  const isLukilion = target.username.toLowerCase() === 'lukilion';

  // Prevent changing Lukilion's role away from superadmin or deactivating
  if (isLukilion) {
    if (updates.role && updates.role !== 'superadmin') {
      return { success: false, error: 'سپر ایڈمن (Lukilion) کا بنیادی رول تبدیل نہیں کیا جا سکتا' };
    }
    if (updates.status && updates.status !== 'active') {
      return { success: false, error: 'سپر ایڈمن کو معطل یا غیر فعال نہیں کیا جا سکتا' };
    }
  }

  // Validate username uniqueness if changed
  if (updates.username && updates.username.trim().toLowerCase() !== target.username.toLowerCase()) {
    const trimmedNewUsername = updates.username.trim();
    if (!trimmedNewUsername) {
      return { success: false, error: 'صارف نام خالی نہیں ہو سکتا / Username cannot be blank' };
    }
    const duplicate = users.some(
      (u) => u.id !== userId && u.username.trim().toLowerCase() === trimmedNewUsername.toLowerCase()
    );
    if (duplicate) {
      return { success: false, error: 'یہ صارف نام پہلے سے زیر استعمال ہے / Username already exists' };
    }
  }

  // Build clean updated user object
  const updatedUser: UserAccount = {
    ...target,
    name: updates.name !== undefined ? updates.name.trim() : target.name,
    username: updates.username !== undefined ? updates.username.trim() : target.username,
    password: updates.password !== undefined ? updates.password : target.password,
    role: updates.role !== undefined ? updates.role : target.role,
    status: updates.status !== undefined ? updates.status : target.status,
    canExportExcel: updates.canExportExcel !== undefined ? updates.canExportExcel : target.canExportExcel,
    canExportPdf: updates.canExportPdf !== undefined ? updates.canExportPdf : target.canExportPdf,
    canSendWhatsApp: updates.canSendWhatsApp !== undefined ? updates.canSendWhatsApp : target.canSendWhatsApp,
    email: updates.email !== undefined ? updates.email.trim() : target.email,
    phone: updates.phone !== undefined ? updates.phone.trim() : target.phone
  };

  users[targetIndex] = updatedUser;
  saveStoredUsers(users);

  // Sync to Firebase Cloud Firestore
  updateUserStatusInCloud(userId, updatedUser).catch((err) => {
    console.warn('[Firebase Auth] Failed to sync user details update to cloud:', err);
  });

  // If current logged-in user is updated, update active session
  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(updatedUser);
  }

  return { success: true, user: updatedUser };
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
  if (current && current.id === userId) {
    setCurrentUser(filtered[0] || null);
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
