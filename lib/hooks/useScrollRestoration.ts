'use client';

/**
 * Re-exporting from SSOT lib/navigation/navigationMemory.ts
 */
export {
  SCROLL_KEY,
  isSameStorePath,
  saveScrollPosition,
  useScrollRestoration,
  saveNavigationSnapshot,
  getNavigationSnapshot,
  clearNavigationSnapshot,
  isPopNavigation,
  clearPopNavigation,
  type NavigationSnapshot,
  type ProductSelectionsState,
} from '@/lib/navigation/navigationMemory';

export interface ScrollRestoreData {
  scrollY: number;
  productId?: string;
  path: string;
  timestamp: number;
  loadMoreLimits?: Record<string, number>;
}
