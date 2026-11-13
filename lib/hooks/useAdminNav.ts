'use client';

/**
 * useAdminNav — Universal Admin Navigation & State Memory Engine
 * Single Source of Truth (RULE SSOT1 & RULE N8).
 *
 * Used across ALL Admin Dashboards:
 * - Products: /admin/products
 * - Inventory: /admin/inventory
 * - Orders: /admin/orders
 * - Abandoned Carts: /admin/abandoned-carts
 * - Categories: /admin/categories
 * - Settings: /admin/settings
 *
 * Core Guarantees:
 * 1. Synchronous state restoration on first paint (zero flash, zero reset to page 1 or 'today').
 * 2. Exact scroll position restored on `#admin-main-content` (or window).
 * 3. Last viewed/edited row smoothly highlighted via `.last-opened-order-pulse`.
 */

export interface AdminNavContext {
  ids?: string[];
  source?: string;
  sourceUrl: string;
  lastOpenedId?: string;
  activeTab?: string;
  dateFilter?: string;
  customStartDate?: string;
  customEndDate?: string;
  searchQuery?: string;
  currentPage?: number;
  rowsPerPage?: number;
  scrollPosition?: number;
  timestamp?: number;
}

const GLOBAL_ADMIN_NAV_KEY = 'admin_universal_nav_context';

/** Clean URL to use as isolated storage key per sub-dashboard */
function getStorageKey(sourceUrl: string): string {
  const clean = sourceUrl.split('?')[0].replace(/^\/admin\/?/, '').replace(/\//g, '_') || 'root';
  return `admin_nav_${clean}`;
}

/** Save navigation context before opening detail, canvas, or navigating away */
export function saveAdminNavContext(ctx: AdminNavContext): void {
  if (typeof window === 'undefined') return;
  try {
    const container = document.getElementById('admin-main-content');
    const scrollPos = ctx.scrollPosition !== undefined ? ctx.scrollPosition : (container ? container.scrollTop : window.scrollY);
    const payload: AdminNavContext = {
      ...ctx,
      scrollPosition: scrollPos,
      timestamp: Date.now(),
    };

    const key = getStorageKey(ctx.sourceUrl);
    sessionStorage.setItem(key, JSON.stringify(payload));
    sessionStorage.setItem(GLOBAL_ADMIN_NAV_KEY, JSON.stringify(payload));
    sessionStorage.setItem(`${key}_return_url`, ctx.sourceUrl);
  } catch {
    // sessionStorage unavailable
  }
}

/** Retrieve saved context synchronously for a specific dashboard view */
export function getAdminNavContext(sourceUrl: string): AdminNavContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = getStorageKey(sourceUrl);
    const raw = sessionStorage.getItem(key) || sessionStorage.getItem(GLOBAL_ADMIN_NAV_KEY);
    if (!raw) return null;
    const ctx: AdminNavContext = JSON.parse(raw);
    return ctx;
  } catch {
    return null;
  }
}

/** Synchronous initializer helper for admin state hooks */
export function getInitialAdminFilters<T extends Record<string, unknown>>(
  sourceUrl: string,
  defaults: T
): T {
  if (typeof window === 'undefined') return defaults;
  try {
    const saved = getAdminNavContext(sourceUrl);
    if (!saved) return defaults;

    const params = new URLSearchParams(window.location.search);
    const result = { ...defaults } as Record<string, unknown>;

    // URL params take first priority, followed by saved session storage
    if (params.has('tab')) result.activeTab = params.get('tab');
    else if (saved.activeTab !== undefined) result.activeTab = saved.activeTab;

    if (params.has('timeRange')) result.dateFilter = params.get('timeRange');
    else if (saved.dateFilter !== undefined) result.dateFilter = saved.dateFilter;

    if (params.has('startDate')) result.customStartDate = params.get('startDate');
    else if (saved.customStartDate !== undefined) result.customStartDate = saved.customStartDate;

    if (params.has('endDate')) result.customEndDate = params.get('endDate');
    else if (saved.customEndDate !== undefined) result.customEndDate = saved.customEndDate;

    if (params.has('search')) result.searchQuery = params.get('search');
    else if (saved.searchQuery !== undefined) result.searchQuery = saved.searchQuery;

    if (params.has('page') && !isNaN(Number(params.get('page')))) result.currentPage = Math.max(1, Number(params.get('page')));
    else if (typeof saved.currentPage === 'number' && saved.currentPage > 0) result.currentPage = saved.currentPage;

    if (typeof saved.rowsPerPage === 'number' && saved.rowsPerPage > 0) result.rowsPerPage = saved.rowsPerPage;

    return result as T;
  } catch {
    return defaults;
  }
}

/** Helper to restore scroll position and briefly highlight/pulse the target record row */
export function restoreAdminNavScrollAndHighlight(
  rowIdPrefix: string,
  lastOpenedId?: string,
  scrollPosition?: number
): void {
  if (typeof window === 'undefined') return;

  requestAnimationFrame(() => {
    // 1. Restore scroll position on admin main scrollable container
    const container = document.getElementById('admin-main-content');
    if (scrollPosition !== undefined && scrollPosition > 0) {
      if (container) {
        container.scrollTop = scrollPosition;
      } else {
        window.scrollTo({ top: scrollPosition, behavior: 'auto' });
      }
    }

    // 2. Highlight target row
    if (lastOpenedId) {
      const row = document.getElementById(`${rowIdPrefix}-${lastOpenedId}`);
      if (row) {
        if (scrollPosition === undefined || scrollPosition === 0) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        row.classList.add('last-opened-order-pulse');
        setTimeout(() => {
          row.classList.remove('last-opened-order-pulse');
        }, 3000);
      }
    }
  });
}
