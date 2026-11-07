'use client';

/**
 * Re-export wrapper for backward compatibility.
 * All logic is centralized in `@/lib/navigation/navigationMemory` (Single Source of Truth).
 */

export {
  SCROLL_KEY,
  isSameStorePath,
  saveScrollPosition,
  useScrollRestoration,
  getNavigationSnapshot,
  saveNavigationSnapshot,
  clearNavigationSnapshot,
  saveProductDetailSnapshot,
  getProductDetailSnapshot,
  isPopNavigation,
  clearPopNavigation,
  type NavigationSnapshot,
  type ProductSelectionsState,
} from '@/lib/navigation/navigationMemory';

export type ScrollRestoreData = {
  scrollY: number;
  productId: string;
  path: string;
  timestamp: number;
  loadMoreLimits?: Record<string, number>;
};
