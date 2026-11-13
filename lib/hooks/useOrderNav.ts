'use client';

/**
 * useOrderNav — Admin Orders Navigation & State Memory System
 * Single Source of Truth (RULE SSOT1 & RULE N1/N5).
 *
 * How it works:
 * 1. Orders Log (`/admin/orders`) saves its active filters (timeRange, tab, search, pagination),
 *    scroll position of `#admin-main-content`, and the clicked order ID before navigating to detail.
 * 2. Detail views (or return buttons) preserve or restore this context.
 * 3. On return to `/admin/orders`:
 *    - Filters, active tab, and page are restored synchronously on mount (zero flash/reset to 'today').
 *    - The exact scroll position is restored on `#admin-main-content`.
 *    - The last-viewed order row is highlighted with a smooth fading accent.
 */

const ORDER_NAV_KEY = 'admin_order_nav_context';
export const ORDERS_FILTER_STORAGE_KEY = 'admin_orders_filter_state';

export interface OrderNavContext {
  ids: string[];
  lastOpenedId?: string;
  timeRange?: string;
  startDate?: string;
  endDate?: string;
  activeTab?: 'all' | 'unfulfilled' | 'unpaid' | 'open' | 'archived';
  currentPage?: number;
  rowsPerPage?: number;
  searchQuery?: string;
  scrollPosition?: number;
  sourceUrl?: string;
  timestamp?: number;
}

/** Save orders navigation context before opening detail or navigating away */
export function saveOrderNavContext(ctx: OrderNavContext): void {
  try {
    const payload = { ...ctx, timestamp: Date.now() };
    sessionStorage.setItem(ORDER_NAV_KEY, JSON.stringify(payload));
    sessionStorage.setItem('admin_orders_return_url', ctx.sourceUrl || '/admin/orders');
    
    // Also sync with the existing filter storage key for backward compatibility
    sessionStorage.setItem(ORDERS_FILTER_STORAGE_KEY, JSON.stringify({
      dateFilter: ctx.timeRange,
      customStartDate: ctx.startDate,
      customEndDate: ctx.endDate,
      activeTab: ctx.activeTab,
      searchQuery: ctx.searchQuery,
      currentPage: ctx.currentPage,
      rowsPerPage: ctx.rowsPerPage,
      lastOpenedId: ctx.lastOpenedId,
      scrollPosition: ctx.scrollPosition,
    }));
  } catch {
    // sessionStorage unavailable
  }
}

/** Read the stored order navigation context */
export function getOrderNavContext(): OrderNavContext | null {
  try {
    const raw = sessionStorage.getItem(ORDER_NAV_KEY);
    if (raw) return JSON.parse(raw);
    
    // Fallback to filter storage key
    const filterRaw = sessionStorage.getItem(ORDERS_FILTER_STORAGE_KEY);
    if (filterRaw) {
      const f = JSON.parse(filterRaw);
      return {
        ids: [],
        lastOpenedId: f.lastOpenedId,
        timeRange: f.dateFilter,
        startDate: f.customStartDate,
        endDate: f.customEndDate,
        activeTab: f.activeTab,
        currentPage: f.currentPage,
        rowsPerPage: f.rowsPerPage,
        searchQuery: f.searchQuery,
        scrollPosition: f.scrollPosition,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Clear context if needed */
export function clearOrderNavContext(): void {
  try {
    sessionStorage.removeItem(ORDER_NAV_KEY);
  } catch {}
}

/** Helper to restore scroll position and briefly pulse/highlight the target order row */
export function restoreOrderScrollAndHighlight(lastOpenedId?: string, scrollPosition?: number): void {
  if (typeof window === 'undefined') return;

  requestAnimationFrame(() => {
    // 1. Restore scroll position on main admin container or window
    const container = document.getElementById('admin-main-content');
    if (scrollPosition !== undefined && scrollPosition > 0) {
      if (container) {
        container.scrollTop = scrollPosition;
      } else {
        window.scrollTo({ top: scrollPosition, behavior: 'auto' });
      }
    }

    // 2. Highlight target row if provided
    if (lastOpenedId) {
      const row = document.getElementById(`order-row-${lastOpenedId}`);
      if (row) {
        // If row is outside visible viewport and no saved scroll position, scroll row into view
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
