'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

/**
 * RULE NAV1 — ADMIN TAB STATE PERSISTENCE
 * 
 * Feature name: "URL-Based Tab State Persistence"
 * 
 * How it works:
 * - Active tab is stored in URL as a search param: `?tab=xxx`
 * - On refresh: URL already has the tab → page opens on the same tab
 * - On back button: browser restores previous URL → tab auto-restores
 * - No sessionStorage needed — URL IS the state
 * 
 * Usage:
 *   const [activeTab, setActiveTab] = useAdminTab('tab', 'all');
 * 
 * @param paramName  - URL param name (default: 'tab')
 * @param defaultTab - Default tab value if no param in URL
 */
export function useAdminTab<T extends string>(
  defaultTab: T,
  paramName: string = 'tab'
): [T, (tab: T) => void] {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Seed from URL once, then keep tab in LOCAL state so switching is INSTANT
  // (no router navigation → no RSC refetch on dynamic `revalidate = 0` pages,
  // which was the source of the laggy "stuck" tab switch). URL still updates
  // via history.replaceState so refresh/back-button persistence (RULE NAV1)
  // keeps working.
  const [activeTab, setActiveTab] = useState<T>(
    () => (searchParams.get(paramName) as T) || defaultTab
  );

  // If the URL changes externally (back/forward, deep link), sync local state.
  useEffect(() => {
    const urlTab = (searchParams.get(paramName) as T) || defaultTab;
    setActiveTab((prev) => (prev !== urlTab ? urlTab : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, paramName, defaultTab]);

  const setTab = useCallback(
    (tab: T) => {
      setActiveTab(tab); // instant UI switch
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      if (tab === defaultTab) params.delete(paramName);
      else params.set(paramName, tab);
      const query = params.toString();
      // Update the address bar WITHOUT a Next.js navigation (no server round-trip).
      window.history.replaceState(window.history.state, '', `${pathname}${query ? `?${query}` : ''}`);
    },
    [pathname, paramName, defaultTab]
  );

  return [activeTab, setTab];
}

/**
 * For components that cannot use useSearchParams directly (non-Suspense contexts),
 * use sessionStorage as a fallback for tab persistence.
 * 
 * Usage:
 *   const [activeTab, setActiveTab] = useAdminTabSession('products-tab', 'all');
 */
export function useAdminTabSession<T extends string>(
  storageKey: string,
  defaultTab: T
): [T, (tab: T) => void] {
  const [activeTab, setActiveTabState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultTab;
    return (sessionStorage.getItem(storageKey) as T) || defaultTab;
  });

  const setTab = useCallback((tab: T) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(storageKey, tab);
    }
  }, [storageKey]);

  // Sync on mount (handles tab closing and re-opening same page)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = sessionStorage.getItem(storageKey) as T | null;
    if (saved) setActiveTabState(saved);
  }, [storageKey]);

  return [activeTab, setTab];
}
