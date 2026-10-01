'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  isSameStorePath,
  SCROLL_KEY,
  ScrollRestoreData
} from '@/lib/hooks/useScrollRestoration';

/**
 * Storefront scroll restoration (single source of truth).
 * 
 * BACK/FORWARD: Restore the exact saved product card into viewport center.
 *   - Uses MutationObserver to wait for lazy grids/product cards to appear
 *   - Prevents the "header flash → footer jump" by holding scroll position
 *     until the target card is found or a final fallback triggers
 * 
 * FRESH NAV: Scroll to top (RULE N3).
 * 
 * Takes over from the browser via history.scrollRestoration = 'manual'.
 */
export default function ScrollRestorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentKey = `scroll:${pathname}?${searchParams?.toString() ?? ''}`;

  const isPopRef = useRef(false);
  const activeRestoreRef = useRef<{
    rafId: number | null;
    observer: MutationObserver | null;
    cancelled: boolean;
    timeoutId: ReturnType<typeof setTimeout> | null;
  } | null>(null);

  // ── Take manual control of browser scroll restoration ──────────────────
  useEffect(() => {
    if (typeof history === 'undefined' || !('scrollRestoration' in history)) return;
    const prev = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => {
      history.scrollRestoration = prev;
    };
  }, []);

  // ── Track popstate (browser back/forward or history.back()) ────────────
  useEffect(() => {
    const onPop = () => {
      isPopRef.current = true;
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // ── Cancel any active restoration ──────────────────────────────────────
  const cancelActiveRestore = useCallback(() => {
    const active = activeRestoreRef.current;
    if (!active) return;
    active.cancelled = true;
    if (active.rafId) cancelAnimationFrame(active.rafId);
    if (active.observer) active.observer.disconnect();
    if (active.timeoutId) clearTimeout(active.timeoutId);
    activeRestoreRef.current = null;
  }, []);

  // ── Continuously save current scroll for the current URL ───────────────
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const liveKey = () => {
      const cleanSearch = window.location.search.replace(/^\?/, '');
      return `scroll:${window.location.pathname}?${cleanSearch}`;
    };
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
  }, [currentKey]);

  // ── Main route/URL change handler ──────────────────────────────────────
  useEffect(() => {
    // Cancel any previous restoration in progress
    cancelActiveRestore();

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
    const wasPop = isPopRef.current;
    isPopRef.current = false;

    // 2. PRODUCT CARD RESTORATION (highest priority)
    // If SCROLL_KEY has saved card data matching this URL, this is a "return to listing"
    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (raw) {
      try {
        const data: ScrollRestoreData = JSON.parse(raw);
        if (isSameStorePath(data.path, currentPath)) {
          // Ignore stale data (> 30 mins)
          if (!data.timestamp || Date.now() - data.timestamp > 30 * 60 * 1000) {
            sessionStorage.removeItem(SCROLL_KEY);
          } else {
            startCardRestore(data);
            return;
          }
        }
      } catch {}
    }

    // 3. Page-level popstate restore (fallback when no specific card was clicked)
    if (wasPop) {
      const liveKey = `scroll:${window.location.pathname}?${window.location.search.replace(/^\?/, '')}`;
      const saved = sessionStorage.getItem(liveKey);
      if (saved != null) {
        const target = parseInt(saved, 10);
        if (Number.isFinite(target) && target > 0) {
          startScrollYRestore(target);
          return;
        }
      }
    }

    // 4. Fresh navigation → scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  // ── Product card restoration (find card by ID, scrollIntoView center) ──
  function startCardRestore(data: ScrollRestoreData) {
    const state = {
      rafId: null as number | null,
      observer: null as MutationObserver | null,
      cancelled: false,
      timeoutId: null as ReturnType<typeof setTimeout> | null,
    };
    activeRestoreRef.current = state;

    // ── VISUAL CLOAK: hide page while searching to prevent banner/footer flash ──
    const root = document.documentElement;
    root.style.opacity = '0';
    root.style.transition = 'none';

    const revealPage = () => {
      root.style.transition = 'opacity 120ms ease-out';
      root.style.opacity = '1';
      // Clean up inline styles after transition
      setTimeout(() => {
        root.style.removeProperty('opacity');
        root.style.removeProperty('transition');
      }, 150);
    };

    // User interaction aborts restoration & reveals page
    const onUserInterrupt = () => {
      if (state.cancelled) return;
      state.cancelled = true;
      revealPage();
      cleanup(true);
    };
    window.addEventListener('wheel', onUserInterrupt, { passive: true, once: true });
    window.addEventListener('touchmove', onUserInterrupt, { passive: true, once: true });
    window.addEventListener('touchstart', onUserInterrupt, { passive: true, once: true });

    const cleanup = (removeFromStorage: boolean) => {
      state.cancelled = true;
      if (state.rafId) cancelAnimationFrame(state.rafId);
      if (state.observer) state.observer.disconnect();
      if (state.timeoutId) clearTimeout(state.timeoutId);
      window.removeEventListener('wheel', onUserInterrupt);
      window.removeEventListener('touchmove', onUserInterrupt);
      window.removeEventListener('touchstart', onUserInterrupt);
      if (removeFromStorage) {
        try { sessionStorage.removeItem(SCROLL_KEY); } catch {}
      }
      if (activeRestoreRef.current === state) {
        activeRestoreRef.current = null;
      }
    };

    const applyCardFocus = (card: HTMLElement) => {
      // Instantly center the card (page is still hidden)
      card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' as ScrollBehavior });
      card.focus?.({ preventScroll: true });

      // Now reveal the page — user sees the card centered, never the banner/footer
      revealPage();

      // Visual highlight
      card.classList.add('scroll-restore-highlight');
      setTimeout(() => card.classList.remove('scroll-restore-highlight'), 1600);

      // Keep card centered for a few frames while images/layout settles
      let settleCount = 0;
      const settle = () => {
        if (state.cancelled || settleCount >= 15) return;
        settleCount++;
        const rect = card.getBoundingClientRect();
        const idealTop = (window.innerHeight - rect.height) / 2;
        if (Math.abs(rect.top - idealTop) > 60) {
          card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' as ScrollBehavior });
        }
        requestAnimationFrame(settle);
      };
      requestAnimationFrame(settle);

      cleanup(true);
    };

    const tryFindCard = (): boolean => {
      if (state.cancelled) return false;
      if (data.productId) {
        const card = document.getElementById(`product-card-${data.productId}`);
        if (card) {
          applyCardFocus(card);
          return true;
        }
      }
      return false;
    };

    // Try immediately
    if (tryFindCard()) return;

    // Watch DOM for card appearing (lazy grids, SSR hydration, etc.)
    const observer = new MutationObserver(() => {
      if (state.cancelled) return;
      tryFindCard();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    state.observer = observer;

    // Also poll via rAF for cases where mutations don't fire
    let tries = 0;
    const tick = () => {
      if (state.cancelled) return;
      tries++;
      if (tryFindCard()) return;

      // When we have a productId, do NOT fall back to scrollY early!
      // Keep looking for the card — the page stays hidden so no banner/footer flash.
      if (tries < 300) { // ~5 seconds max
        state.rafId = requestAnimationFrame(tick);
      } else {
        // Final fallback: card was never found, scroll to saved Y and reveal
        if (data.scrollY > 0) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: Math.min(data.scrollY, Math.max(0, maxScroll)), behavior: 'instant' });
        }
        revealPage();
        cleanup(true);
      }
    };
    state.rafId = requestAnimationFrame(tick);

    // Hard timeout safety net: if nothing worked in 6s, reveal and stop
    state.timeoutId = setTimeout(() => {
      if (!state.cancelled) {
        // One final attempt to find the card
        if (tryFindCard()) return;
        // If still not found, scroll to saved Y and reveal anyway
        if (data.scrollY > 0) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: Math.min(data.scrollY, Math.max(0, maxScroll)), behavior: 'instant' });
        }
        revealPage();
        cleanup(true);
      }
    }, 6000);
  }

  // ── Generic scrollY restoration (for pages without product card data) ──
  function startScrollYRestore(target: number) {
    const state = {
      rafId: null as number | null,
      observer: null as MutationObserver | null,
      cancelled: false,
      timeoutId: null as ReturnType<typeof setTimeout> | null,
    };
    activeRestoreRef.current = state;

    // ── VISUAL CLOAK: hide page while restoring scroll position ──
    const root = document.documentElement;
    root.style.opacity = '0';
    root.style.transition = 'none';

    const revealPage = () => {
      root.style.transition = 'opacity 120ms ease-out';
      root.style.opacity = '1';
      setTimeout(() => {
        root.style.removeProperty('opacity');
        root.style.removeProperty('transition');
      }, 150);
    };

    const fullCleanup = () => {
      state.cancelled = true;
      if (state.rafId) cancelAnimationFrame(state.rafId);
      if (state.observer) state.observer.disconnect();
      if (state.timeoutId) clearTimeout(state.timeoutId);
      window.removeEventListener('wheel', onUserInterrupt);
      window.removeEventListener('touchmove', onUserInterrupt);
      window.removeEventListener('touchstart', onUserInterrupt);
      if (activeRestoreRef.current === state) activeRestoreRef.current = null;
    };

    const onUserInterrupt = () => {
      if (state.cancelled) return;
      revealPage();
      fullCleanup();
    };
    window.addEventListener('wheel', onUserInterrupt, { passive: true, once: true });
    window.addEventListener('touchmove', onUserInterrupt, { passive: true, once: true });
    window.addEventListener('touchstart', onUserInterrupt, { passive: true, once: true });

    let tries = 0;
    const attemptScroll = () => {
      if (state.cancelled) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll >= target - 10) {
        window.scrollTo({ top: target, behavior: 'instant' });
        revealPage();
        fullCleanup();
        return;
      }

      tries++;
      if (tries < 180) {
        state.rafId = requestAnimationFrame(attemptScroll);
      } else {
        window.scrollTo({ top: Math.min(target, Math.max(0, maxScroll)), behavior: 'instant' });
        revealPage();
        fullCleanup();
      }
    };

    // Watch DOM growth
    const observer = new MutationObserver(() => {
      if (state.cancelled) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll >= target - 10) {
        attemptScroll();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    state.observer = observer;

    state.rafId = requestAnimationFrame(attemptScroll);

    // Hard timeout
    state.timeoutId = setTimeout(() => {
      if (!state.cancelled) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: Math.min(target, Math.max(0, maxScroll)), behavior: 'instant' });
        revealPage();
        fullCleanup();
      }
    }, 4000);
  }

  return null;
}