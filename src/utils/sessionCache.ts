/**
 * OrderLa Wholesale BOS - Session, Cache & Cookies Persistence Utility
 * Automatically synchronizes session progress, active route, filters, swiper progress,
 * and user states to both localStorage (instant client cache) and document.cookie (cookie jar)
 * so users can resume exactly where they left off after window close or page refresh.
 */

const COOKIE_EXPIRY_DAYS = 30;

/**
 * Set a cookie with standard attributes
 */
export function setCookie(name: string, value: string, days = COOKIE_EXPIRY_DAYS): void {
  if (typeof document === 'undefined') return;
  try {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    const encodedValue = encodeURIComponent(value);
    document.cookie = `${name}=${encodedValue};${expires};path=/;SameSite=Lax`;
  } catch (err) {
    console.warn(`[OrderLa Cookie] Failed to set cookie ${name}`, err);
  }
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
  } catch (err) {
    console.warn(`[OrderLa Cookie] Failed to get cookie ${name}`, err);
  }
  return null;
}

/**
 * Delete a cookie
 */
export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
}

/**
 * Universal Cache & Cookie save function
 */
export function saveSessionState<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    // 1. Cache to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, serialized);
    }
    // 2. Mirror to cookies (if size is under 3.5KB safe limit)
    if (serialized.length < 3500) {
      setCookie(key, serialized);
    } else {
      // Set indicator cookie that localStorage holds this session
      setCookie(`${key}_cached`, 'true');
    }
  } catch (err) {
    console.warn(`[OrderLa Cache] Failed to save session state for ${key}`, err);
  }
}

/**
 * Universal Cache & Cookie load function
 */
export function loadSessionState<T>(key: string, defaultValue: T): T {
  try {
    // 1. First check localStorage cache
    if (typeof localStorage !== 'undefined') {
      const localVal = localStorage.getItem(key);
      if (localVal) {
        return JSON.parse(localVal) as T;
      }
    }
    // 2. Fallback to cookie
    const cookieVal = getCookie(key);
    if (cookieVal) {
      return JSON.parse(cookieVal) as T;
    }
  } catch (err) {
    console.warn(`[OrderLa Cache] Failed to load session state for ${key}`, err);
  }
  return defaultValue;
}

/**
 * Swiper Progress Cache Structure
 */
export interface SwiperProgressState {
  currentIndex: number;
  isCompleted: boolean;
  timestamp: number;
  demandedChanges?: Record<number, { demand: number; status: string }>;
}

const SWIPER_PROGRESS_KEY = 'orderla_swiper_progress_session';
const APP_VIEW_STATE_KEY = 'orderla_app_view_state_session';

/**
 * Save rapid swiper current position and decisions
 */
export function saveSwiperProgress(
  currentIndex: number,
  isCompleted: boolean,
  demandedChanges?: Record<number, { demand: number; status: string }>
): void {
  const state: SwiperProgressState = {
    currentIndex,
    isCompleted,
    timestamp: Date.now(),
    demandedChanges
  };
  saveSessionState(SWIPER_PROGRESS_KEY, state);
}

/**
 * Load rapid swiper progress
 */
export function loadSwiperProgress(): SwiperProgressState | null {
  const state = loadSessionState<SwiperProgressState | null>(SWIPER_PROGRESS_KEY, null);
  if (!state) return null;
  // Expire after 7 days if not updated
  if (Date.now() - state.timestamp > 7 * 24 * 60 * 60 * 1000) {
    clearSwiperProgress();
    return null;
  }
  return state;
}

/**
 * Clear rapid swiper session progress to restart fresh
 */
export function clearSwiperProgress(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(SWIPER_PROGRESS_KEY);
  }
  removeCookie(SWIPER_PROGRESS_KEY);
}

/**
 * App View & Navigation State Structure
 */
export interface AppViewState {
  activeRoute: string;
  filter: string;
  searchQuery: string;
  sortKey: string;
  sortDirection: string;
}

/**
 * Save Navigation, Search & Filter progress
 */
export function saveAppViewState(viewState: AppViewState): void {
  saveSessionState(APP_VIEW_STATE_KEY, viewState);
}

/**
 * Load Navigation, Search & Filter progress
 */
export function loadAppViewState(): AppViewState | null {
  return loadSessionState<AppViewState | null>(APP_VIEW_STATE_KEY, null);
}
