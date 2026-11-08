'use client';

/**
 * Universal Navigation Memory & State Restoration System
 * Single Source of Truth (RULE SSOT1 & RULE N1/N4).
 * 
 * Guarantees that browser "Back" and "Forward" always land the customer exactly where they left off:
 *  - Restores exact scroll position
 *  - Restores and centers the clicked product card with visible highlight ring
 *  - Restores active tab (categories, homepage tabs, shop collections)
 *  - Restores all loaded items / load-more batches before first paint (no shrinking/footer flash)
 *  - Restores product page variant selections (size, color, chosen image) on back from related products
 *  - Forward navigation always opens the TOP of the new page
 */

export const SCROLL_KEY = 'store_scroll_restore';
export const NAV_SNAPSHOTS_KEY = 'nav_memory_snapshots';
export const MAX_SNAPSHOTS = 25;
export const SNAPSHOT_MAX_AGE_MS = 30 * 60 * 1000; // 30 mins

export interface ProductSelectionsState {
  productId?: string;
  variantId?: string;
  color?: string;
  size?: string;
  material?: string;
  customValue?: string;
  activeImageIndex?: number;
  activeImageUrl?: string;
  quantity?: number;
}

export interface NavigationSnapshot {
  path: string;
  timestamp: number;
  scrollY: number;
  clickedCardId?: string;
  loadMoreLimits?: Record<string, number>;
  activeTab?: string;
  activeCategoryId?: string;
  page?: number;
  filters?: {
    search?: string;
    sort?: string;
    category?: string;
    collection?: string;
    availability?: string[];
    priceMin?: number;
    priceMax?: number;
    colors?: string[];
    sizes?: string[];
    materials?: string[];
  };
  productState?: ProductSelectionsState;
}

export interface ScrollRestoreData {
  scrollY: number;
  productId?: string;
  path: string;
  timestamp: number;
  loadMoreLimits?: Record<string, number>;
}

// In-memory popstate flag active during history navigation
let isPopNavigationActive = false;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    isPopNavigationActive = true;
    try {
      sessionStorage.setItem('nav_is_pop_active', '1');
    } catch {}
  });
}

export function isPopNavigation(): boolean {
  if (isPopNavigationActive) return true;
  if (typeof window !== 'undefined') {
    try {
      if (sessionStorage.getItem('nav_is_pop_active') === '1') {
        return true;
      }
    } catch {}
  }
  return false;
}

export function clearPopNavigation(): void {
  isPopNavigationActive = false;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('nav_is_pop_active');
    } catch {}
  }
}

/**
 * Compare two storefront paths ignoring trailing slashes and query param ordering.
 */
export function isSameStorePath(savedPath: string, currentPath: string): boolean {
  if (!savedPath || !currentPath) return false;
  try {
    const cleanSaved = decodeURIComponent(savedPath).trim();
    const cleanCurrent = decodeURIComponent(currentPath).trim();

    if (cleanSaved === cleanCurrent) return true;

    const [savedBase, savedQuery = ''] = cleanSaved.split('?');
    const [currentBase, currentQuery = ''] = cleanCurrent.split('?');

    const normBase = (b: string) => b.replace(/\/+$/, '') || '/';
    if (normBase(savedBase) !== normBase(currentBase)) {
      return false;
    }

    if (!savedQuery && !currentQuery) {
      return true;
    }

    const sp1 = new URLSearchParams(savedQuery);
    const sp2 = new URLSearchParams(currentQuery);

    const keys = new Set([...sp1.keys(), ...sp2.keys()]);
    for (const key of keys) {
      if (sp1.get(key) !== sp2.get(key)) {
        return false;
      }
    }
    return true;
  } catch {
    return savedPath === currentPath;
  }
}

function getAllSnapshots(): Record<string, NavigationSnapshot> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(NAV_SNAPSHOTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveAllSnapshots(snapshots: Record<string, NavigationSnapshot>): void {
  if (typeof window === 'undefined') return;
  try {
    // Prune entries older than 30 mins or cap to MAX_SNAPSHOTS
    const entries = Object.entries(snapshots);
    const now = Date.now();
    const valid = entries.filter(([, s]) => s.timestamp && now - s.timestamp < SNAPSHOT_MAX_AGE_MS);
    
    // Sort newest first
    valid.sort(([, a], [, b]) => (b.timestamp || 0) - (a.timestamp || 0));
    const capped = valid.slice(0, MAX_SNAPSHOTS);
    
    const out: Record<string, NavigationSnapshot> = {};
    for (const [k, v] of capped) {
      out[k] = v;
    }
    sessionStorage.setItem(NAV_SNAPSHOTS_KEY, JSON.stringify(out));
  } catch {
    /* quota error fallback */
  }
}

/**
 * Normalizes a path string to use as a consistent snapshot key.
 */
export function getSnapshotKey(path?: string): string {
  if (!path && typeof window !== 'undefined') {
    path = window.location.pathname + (window.location.search || '');
  }
  if (!path) return '/';
  const [base, query = ''] = path.split('?');
  const normBase = base.replace(/\/+$/, '') || '/';
  if (!query) return normBase;
  const sp = new URLSearchParams(query);
  const sortedPairs = Array.from(sp.entries()).sort(([a], [b]) => a.localeCompare(b));
  const normQuery = new URLSearchParams(sortedPairs).toString();
  return normQuery ? `${normBase}?${normQuery}` : normBase;
}

/**
 * Save a navigation snapshot for the current page before navigating away.
 * Used when clicking a product card, tab, or navigating to a new URL.
 */
export function saveNavigationSnapshot(data: Partial<NavigationSnapshot> = {}): void {
  if (typeof window === 'undefined') return;
  try {
    const currentPath = window.location.pathname + (window.location.search || '');
    const key = getSnapshotKey(currentPath);
    const scrollY = typeof data.scrollY === 'number' ? data.scrollY : Math.round(window.scrollY);

    // Merge existing loadMoreLimits from sessionStorage if not explicitly provided
    let loadMoreLimits = data.loadMoreLimits;
    if (!loadMoreLimits) {
      try {
        const rawLimits = sessionStorage.getItem('storefront_load_more_limits');
        if (rawLimits) {
          const parsed = JSON.parse(rawLimits);
          if (parsed && typeof parsed === 'object') loadMoreLimits = parsed;
        }
      } catch {}
    }

    const snapshots = getAllSnapshots();
    const existing = snapshots[key];

    const snapshot: NavigationSnapshot = {
      path: currentPath,
      timestamp: Date.now(),
      scrollY,
      clickedCardId: data.clickedCardId ?? existing?.clickedCardId,
      loadMoreLimits: loadMoreLimits ?? existing?.loadMoreLimits,
      activeTab: data.activeTab ?? existing?.activeTab,
      activeCategoryId: data.activeCategoryId ?? existing?.activeCategoryId,
      page: data.page ?? existing?.page,
      filters: data.filters ?? existing?.filters,
      productState: data.productState ?? existing?.productState,
    };

    snapshots[key] = snapshot;
    saveAllSnapshots(snapshots);

    // Synchronize legacy SCROLL_KEY and liveKey for backward compatibility
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(snapshot));
    const liveKey = `scroll:${window.location.pathname}?${(window.location.search || '').replace(/^\?/, '')}`;
    sessionStorage.setItem(liveKey, String(scrollY));
  } catch {
    /* storage quota fallback */
  }
}

/**
 * Read the saved snapshot for the given path or current path.
 */
export function getNavigationSnapshot(path?: string): NavigationSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const currentPath = path || (window.location.pathname + (window.location.search || ''));
    const key = getSnapshotKey(currentPath);
    const snapshots = getAllSnapshots();
    const snap = snapshots[key];

    if (snap && snap.timestamp && Date.now() - snap.timestamp < SNAPSHOT_MAX_AGE_MS) {
      return snap;
    }

    // Fallback: check legacy SCROLL_KEY if path matches
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (raw) {
      const parsed: NavigationSnapshot = JSON.parse(raw);
      if (parsed && isSameStorePath(parsed.path, currentPath)) {
        if (parsed.timestamp && Date.now() - parsed.timestamp < SNAPSHOT_MAX_AGE_MS) {
          return parsed;
        }
      }
    }
  } catch {}
  return null;
}

/**
 * Clear the snapshot for the given path (e.g. on fresh intentional arrival).
 */
export function clearNavigationSnapshot(path?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const currentPath = path || (window.location.pathname + (window.location.search || ''));
    const key = getSnapshotKey(currentPath);
    const snapshots = getAllSnapshots();
    delete snapshots[key];
    saveAllSnapshots(snapshots);
    sessionStorage.removeItem(SCROLL_KEY);
  } catch {}
}

/**
 * Save product page selections (size, color, image, scroll) before navigating to related products.
 */
export function saveProductDetailSnapshot(productId: string, state: ProductSelectionsState): void {
  if (typeof window === 'undefined' || !productId) return;
  try {
    const currentPath = window.location.pathname + (window.location.search || '');
    saveNavigationSnapshot({
      productState: {
        productId,
        ...state,
      },
      scrollY: Math.round(window.scrollY),
    });
    sessionStorage.setItem(`pdp_restore_${productId}`, JSON.stringify({
      ...state,
      scrollY: Math.round(window.scrollY),
      timestamp: Date.now(),
    }));
  } catch {}
}

/**
 * Retrieve saved product page selections for a product on back/forward return.
 */
export function getProductDetailSnapshot(productId: string): (ProductSelectionsState & { scrollY?: number }) | null {
  if (typeof window === 'undefined' || !productId) return null;
  try {
    const raw = sessionStorage.getItem(`pdp_restore_${productId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < SNAPSHOT_MAX_AGE_MS) {
        return parsed;
      }
    }
    const snap = getNavigationSnapshot();
    if (snap?.productState?.productId === productId) {
      return {
        ...snap.productState,
        scrollY: snap.scrollY,
      };
    }
  } catch {}
  return null;
}

/**
 * Synchronous helper for product card links to save clicked card ID + scroll.
 * Must be attached to EVERY clickable card element (overlay link, title link, media link).
 */
export const saveScrollPosition = (productId: string) => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('last_clicked_card_id', productId);
      sessionStorage.setItem('last_clicked_card_path', window.location.pathname + (window.location.search || ''));
      sessionStorage.setItem('last_clicked_card_time', String(Date.now()));
      clearPopNavigation();
    } catch {}
  }
  saveNavigationSnapshot({ clickedCardId: productId });
};

/**
 * Backward compatibility hook export.
 */
export const useScrollRestoration = () => {
  // Centralized in ScrollRestorer.tsx
};
