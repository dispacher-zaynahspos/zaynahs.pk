'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { restoreProductCardOrScroll, SCROLL_KEY } from '@/lib/hooks/useScrollRestoration';

/**
 * Storefront scroll restoration (single source of truth).
 * - Back/forward (popstate): restore the exact saved product card focus & scroll position,
 *   waiting for lazy grids/content height to be ready (rAF + MutationObserver) so a shorter
 *   first paint NEVER clamps the page to the footer or upper banner.
 * - Fresh navigation (push): scroll to top (or to #hash target if present) per RULE N3.
 * Takes over from the browser via history.scrollRestoration = 'manual'.
 */
export default function ScrollRestorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Effect trigger key (reacts to route/query changes)
  const key = `scroll:${pathname}?${searchParams?.toString() ?? ''}`;

  // Live key read from the actual URL
  const liveKey = () =>
    typeof window !== 'undefined'
      ? `scroll:${window.location.pathname}?${window.location.search.replace(/^\?/, '')}`
      : key;

  const lastPopTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const cancelRestoreRef = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);

  // Take manual control of scroll restoration
  useEffect(() => {
    if (typeof history === 'undefined' || !('scrollRestoration' in history)) return;
    const prev = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => {
      history.scrollRestoration = prev;
    };
  }, []);

  // Detect back/forward navigations and record timestamp
  useEffect(() => {
    const onPop = () => {
      lastPopTimeRef.current = Date.now();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Proactively detect non-card link clicks (navbar, footer, logo, category menu)
  // to clear any pending card restoration and ensure fresh navigations start at top
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest('a');
      if (link && !link.closest('[id^="product-card-"]')) {
        lastPopTimeRef.current = 0;
        try {
          sessionStorage.removeItem(SCROLL_KEY);
        } catch {}
      }
    };
    document.addEventListener('click', onDocClick, { capture: true });
    return () => document.removeEventListener('click', onDocClick, { capture: true });
  }, []);

  // Continuously save current scroll for the current URL
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const save = () => {
      try {
        sessionStorage.setItem(liveKey(), String(Math.round(window.scrollY)));
      } catch {
        /* quota */
      }
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

  // On URL change: restore (back/forward) or reset to top (fresh navigation)
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (observerRef.current) observerRef.current.disconnect();
    cancelRestoreRef.current = false;

    // Anchor link: let the browser/app jump to the element
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }

    // Is this a back/forward navigation?
    const isPop =
      Date.now() - lastPopTimeRef.current < 2500 ||
      (typeof performance !== 'undefined' &&
        (performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming)?.type ===
          'back_forward');

    if (isPop) {
      // 1. First priority: restore specific product card and position
      const restored = restoreProductCardOrScroll();
      if (restored) {
        return;
      }

      // 2. Fallback: restore saved page-level scroll position
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

            // CRITICAL: NEVER clamp to small maxScroll before content loads (avoids jumping to footer)
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

    // Fresh navigation (push) or un-scrolled page: reset to top (RULE N3)
    try {
      sessionStorage.removeItem(SCROLL_KEY);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [key]);

  return null;
}