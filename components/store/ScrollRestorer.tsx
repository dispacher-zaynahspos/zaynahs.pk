'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  restoreProductCardOrScroll,
  isSameStorePath,
  SCROLL_KEY,
  ScrollRestoreData
} from '@/lib/hooks/useScrollRestoration';

/**
 * Storefront scroll restoration (single source of truth).
 * - Back/forward: restore the exact saved product card focus & scroll position.
 *   Waits for lazy grids/content height to be ready (rAF + MutationObserver)
 *   so a shorter first paint NEVER clamps to the footer or upper banner.
 * - Fresh navigation: scroll to top (RULE N3).
 * Takes over from the browser via history.scrollRestoration = 'manual'.
 */
export default function ScrollRestorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const key = `scroll:${pathname}?${searchParams?.toString() ?? ''}`;
  const liveKey = () =>
    typeof window !== 'undefined'
      ? `scroll:${window.location.pathname}?${window.location.search.replace(/^\?/, '')}`
      : key;

  const isPopRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const cancelRestoreRef = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);

  // Take manual control of browser scroll restoration
  useEffect(() => {
    if (typeof history === 'undefined' || !('scrollRestoration' in history)) return;
    const prev = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => {
      history.scrollRestoration = prev;
    };
  }, []);

  // Track popstate (browser back/forward or history.back())
  useEffect(() => {
    const onPop = () => {
      isPopRef.current = true;
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Continuously save current scroll for the current URL
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const save = () => {
      try {
        sessionStorage.setItem(liveKey(), String(Math.round(window.scrollY)));
      } catch {}
    };
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(save, 120);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', save);
    return () => {
      save();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', save);
      clearTimeout(t);
    };
  }, [key]);

  // Main route/URL change handler
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (observerRef.current) observerRef.current.disconnect();
    cancelRestoreRef.current = false;

    // 1. Hash anchor links jump to target
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) {
        el.scrollIntoView();
        isPopRef.current = false;
        return;
      }
    }

    const currentPath = window.location.pathname + window.location.search;

    // 2. CHECK PRODUCT CARD RESTORATION FIRST (Absolute Highest Priority)
    // If a saved product card click matches this current URL, this is guaranteed
    // to be a return to this listing page! Restore it immediately!
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (raw) {
      try {
        const data: ScrollRestoreData = JSON.parse(raw);
        if (isSameStorePath(data.path, currentPath)) {
          // DO NOT reset to top! DO NOT remove from storage yet!
          const restored = restoreProductCardOrScroll();
          if (restored) {
            isPopRef.current = false;
            return;
          }
        }
      } catch {}
    }

    // 3. Page-level popstate restore (fallback when no specific card was clicked)
    if (isPopRef.current) {
      isPopRef.current = false;
      const saved = sessionStorage.getItem(liveKey());
      if (saved != null) {
        const target = parseInt(saved, 10);
        if (Number.isFinite(target) && target > 0) {
          let tries = 0;
          const maxTries = 240;

          const onUserScroll = () => {
            cancelRestoreRef.current = true;
          };
          window.addEventListener('wheel', onUserScroll, { passive: true, once: true });
          window.addEventListener('touchmove', onUserScroll, { passive: true, once: true });

          const attemptScroll = () => {
            if (cancelRestoreRef.current) return;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

            if (maxScroll >= target - 10) {
              window.scrollTo({ top: target, behavior: 'instant' });
              return;
            }

            tries++;
            if (tries < maxTries) {
              rafRef.current = requestAnimationFrame(attemptScroll);
            } else {
              window.scrollTo({ top: Math.min(target, Math.max(0, maxScroll)), behavior: 'instant' });
            }
          };

          const observer = new MutationObserver(() => {
            if (cancelRestoreRef.current) return;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll >= target - 10) {
              attemptScroll();
            }
          });
          observer.observe(document.documentElement, { childList: true, subtree: true });
          observerRef.current = observer;

          rafRef.current = requestAnimationFrame(attemptScroll);
          return;
        }
      }
    }

    // 4. Fresh navigation to a new page (e.g. entering product page or clicking a menu link)
    // Reset scroll to top (RULE N3).
    // CRITICAL: DO NOT DELETE SCROLL_KEY HERE!
    // (If the user navigated to a product page, SCROLL_KEY holds the return destination!)
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [key]);

  return null;
}