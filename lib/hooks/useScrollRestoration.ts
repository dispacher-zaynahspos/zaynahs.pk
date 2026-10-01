'use client';

export const SCROLL_KEY = 'store_scroll_restore';

export interface ScrollRestoreData {
  scrollY: number;
  productId: string;
  path: string;
  timestamp: number;
}

/**
 * Compare two storefront paths (ignoring trailing slashes and parameter order).
 * Ensures /shop?page=10 and /shop?page=10 match cleanly across client-side router transitions.
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

/**
 * Call before navigating to product detail — synchronously saves current scroll + product id.
 * Also synchronizes the live URL key used by ScrollRestorer.
 */
export const saveScrollPosition = (productId: string) => {
  if (typeof window === 'undefined') return;
  const currentY = Math.round(window.scrollY);
  const currentPath = window.location.pathname + (window.location.search ? window.location.search : '');
  const data: ScrollRestoreData = {
    scrollY: currentY,
    productId,
    path: currentPath,
    timestamp: Date.now(),
  };
  try {
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(data));
    const cleanSearch = window.location.search.replace(/^\?/, '');
    const liveKey = `scroll:${window.location.pathname}?${cleanSearch}`;
    sessionStorage.setItem(liveKey, String(currentY));
  } catch {
    /* quota */
  }
};

/**
 * @deprecated — use ScrollRestorer component (single source of truth).
 * Kept as a no-op for backward compat so existing imports don't break.
 */
export const useScrollRestoration = () => {
  // No-op: all restoration logic is now centralized in ScrollRestorer.tsx
  // which is mounted in the (store) layout.
};
