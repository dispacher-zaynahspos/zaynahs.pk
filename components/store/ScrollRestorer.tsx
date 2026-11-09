'use client';

import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  isSameStorePath,
  SCROLL_KEY,
  getNavigationSnapshot,
  isPopNavigation,
  clearPopNavigation,
  type NavigationSnapshot,
} from '@/lib/navigation/navigationMemory';
import { resetBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Storefront scroll & state restoration (Single Source of Truth).
 * 
 * OPENING NEW PAGES (Products, Shop, Categories):
 *   - Instantly resets viewport to top (0px) BEFORE PAINT via useIsomorphicLayoutEffect.
 *   - Guarantees ZERO flashing/jumping to footer when opening any product.
 * 
 * BACK / FORWARD HISTORY DESTINATIONS:
 *   - On listing pages (Home, Shop): Restores exact scroll position + centers & highlights active card.
 *   - On product pages: Restores that product page's scroll position or opens at top.
 *   - Takes over from browser via history.scrollRestoration = 'manual'.
 */
export default function ScrollRestorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentKey = `scroll:${pathname}?${searchParams?.toString() ?? ''}`;

  const isPopRef = useRef(false);
  const prevPathnameRef = useRef<string | null>(null);
  const isInitialMountRef = useRef(true);
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

  // ── Synchronous pre-paint route/URL change handler (RULE N1 & N3) ───────
  useIsomorphicLayoutEffect(() => {
    // Cancel any previous restoration in progress
    cancelActiveRestore();

    // Safety: ensure background body scroll lock is not orphaned on navigation if no modal is open
    if (typeof document !== 'undefined') {
      const activeModal = document.querySelector('[role="dialog"], [aria-modal="true"], .modal-overlay');
      if (!activeModal) {
        resetBodyScrollLock();
      }
    }

    const isNewRoute = prevPathnameRef.current !== null && prevPathnameRef.current !== pathname;
    const isFirstLoad = isInitialMountRef.current;
    isInitialMountRef.current = false;
    prevPathnameRef.current = pathname;

    // 1. Hash anchor links jump to target
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) {
        el.scrollIntoView();
        isPopRef.current = false;
        clearPopNavigation();
        return;
      }
    }

    const currentPath = window.location.pathname + window.location.search;
    const isProductPage = pathname.startsWith('/product/');

    // Genuine history navigation indicator (popstate, nav timing)
    const isNavBackForward =
      typeof window !== 'undefined' &&
      ((performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming)?.type === 'back_forward' ||
       (window.performance?.navigation?.type === 2));

    const wasPop = isPopRef.current || isPopNavigation() || isNavBackForward;
    isPopRef.current = false;
    if (wasPop) {
      setTimeout(clearPopNavigation, 600);
    } else {
      clearPopNavigation();
    }

    // 2. PRODUCT CARD & STATE RESTORATION on any back/forward navigation
    // (Works across Homepage, Shop, Category pages, AND Product Detail Pages with Related/Recent products)
    if (wasPop) {
      const snap = getNavigationSnapshot(currentPath);
      let targetCardId = snap?.clickedCardId;
      let targetScrollY = snap?.scrollY;

      // Fallback: check last_clicked_card_id ONLY if saved path strictly matches current path
      if (!targetCardId && typeof window !== 'undefined') {
        try {
          const lastCard = sessionStorage.getItem('last_clicked_card_id');
          const lastPath = sessionStorage.getItem('last_clicked_card_path');
          const lastTime = Number(sessionStorage.getItem('last_clicked_card_time') || 0);
          if (lastCard && lastPath && isSameStorePath(lastPath, currentPath) && Date.now() - lastTime < 15 * 60 * 1000) {
            targetCardId = lastCard;
          }
        } catch {}
      }

      if (targetCardId) {
        startCardRestore({
          clickedCardId: targetCardId,
          scrollY: targetScrollY ?? 0,
          path: currentPath,
          timestamp: snap?.timestamp ?? Date.now(),
        });
        return;
      }

      if (typeof targetScrollY === 'number' && targetScrollY > 0) {
        startScrollYRestore(targetScrollY);
        return;
      }

      // Check legacy liveKey
      const cleanSearch = window.location.search.replace(/^\?/, '');
      const liveKey = `scroll:${window.location.pathname}?${cleanSearch}`;
      const saved = sessionStorage.getItem(liveKey);
      if (saved != null) {
        const target = parseInt(saved, 10);
        if (Number.isFinite(target) && target > 0) {
          startScrollYRestore(target);
          return;
        }
      }

      // Fallback for product page without saved scroll: open cleanly at top
      if (isProductPage) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (typeof document !== 'undefined') {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
        return;
      }
    }

    // 4. FRESH FORWARD NAVIGATION (Opening a product, clicking nav link, opening shop/category):
    // ALWAYS start at the TOP of the new page instantly BEFORE PAINT (RULE N3).
    // Because this runs in useIsomorphicLayoutEffect, the browser renders frame 0 directly at top 0!
    // ZERO jumping to footer!
    if (!wasPop) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (typeof document !== 'undefined') {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
      requestAnimationFrame(() => {
        if (!isPopRef.current && !isPopNavigation()) {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          if (typeof document !== 'undefined') {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  // ── Product card restoration (find card by ID, scrollIntoView center) ──
  function startCardRestore(data: Partial<NavigationSnapshot>) {
    const state = {
      rafId: null as number | null,
      observer: null as MutationObserver | null,
      cancelled: false,
      timeoutId: null as ReturnType<typeof setTimeout> | null,
    };
    activeRestoreRef.current = state;

    // 1. Instantly anchor the document at saved scroll position before anything paints
    if (typeof data.scrollY === 'number' && data.scrollY > 0) {
      window.scrollTo({ top: data.scrollY, behavior: 'instant' });
    }

    // ── VISUAL CLOAK: subtle cloak prevents banner flash while card settles ──
    const overlay = document.createElement('div');
    overlay.id = 'scroll-restore-cloak';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:var(--bg-body,#fff);pointer-events:none;transition:opacity 120ms ease-out;';
    if (document.documentElement.classList.contains('dark')) {
      overlay.style.background = '#0f0f1b';
    }
    document.body.appendChild(overlay);

    const revealPage = () => {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.remove(); }, 120);
    };

    // User gesture grace period: ignore swipe momentum & trackpad inertia during first 450ms
    let allowUserInterrupt = false;
    const graceTimer = setTimeout(() => {
      allowUserInterrupt = true;
    }, 450);

    const onUserInterrupt = () => {
      if (!allowUserInterrupt) return;
      if (state.cancelled) return;
      state.cancelled = true;
      revealPage();
      cleanup(false);
    };

    window.addEventListener('wheel', onUserInterrupt, { passive: true });
    window.addEventListener('touchmove', onUserInterrupt, { passive: true });
    window.addEventListener('touchstart', onUserInterrupt, { passive: true });
    window.addEventListener('keydown', onUserInterrupt, { passive: true });

    const cleanup = (removeFromStorage: boolean) => {
      clearTimeout(graceTimer);
      state.cancelled = true;
      if (state.rafId) cancelAnimationFrame(state.rafId);
      if (state.observer) state.observer.disconnect();
      if (state.timeoutId) clearTimeout(state.timeoutId);
      window.removeEventListener('wheel', onUserInterrupt);
      window.removeEventListener('touchmove', onUserInterrupt);
      window.removeEventListener('touchstart', onUserInterrupt);
      window.removeEventListener('keydown', onUserInterrupt);
      if (removeFromStorage) {
        try {
          sessionStorage.removeItem(SCROLL_KEY);
          sessionStorage.removeItem('last_clicked_card_id');
          sessionStorage.removeItem('last_clicked_card_path');
        } catch {}
      }
      if (activeRestoreRef.current === state) {
        activeRestoreRef.current = null;
      }
    };

    const applyCardFocus = (card: HTMLElement) => {
      // Instantly center the card
      card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' as ScrollBehavior });
      card.focus?.({ preventScroll: true });

      // Visual highlight with prominent focus ring
      card.classList.add('scroll-restore-highlight');
      setTimeout(() => card.classList.remove('scroll-restore-highlight'), 2400);

      revealPage();

      // Verify alignment across 2 layout frames as fonts/images finish hydration
      let settleFrames = 0;
      const verifySettle = () => {
        settleFrames++;
        if (state.cancelled || settleFrames > 3) {
          try {
            sessionStorage.removeItem('last_clicked_card_id');
            sessionStorage.removeItem('last_clicked_card_path');
          } catch {}
          cleanup(false);
          return;
        }
        if (card.isConnected) {
          const rect = card.getBoundingClientRect();
          const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
          if (!inView) {
            card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' as ScrollBehavior });
          }
        }
        state.rafId = requestAnimationFrame(verifySettle);
      };
      state.rafId = requestAnimationFrame(verifySettle);
    };

    const tryFindCard = (): boolean => {
      if (state.cancelled) return false;
      const cardId = data.clickedCardId;
      if (cardId) {
        const card =
          document.getElementById(`product-card-${cardId}`) ||
          document.querySelector(`[data-product-id="${cardId}"]`) ||
          document.querySelector(`article#product-card-${cardId}`);
        if (card instanceof HTMLElement) {
          applyCardFocus(card);
          return true;
        }
      }
      return false;
    };

    // Try immediately
    if (tryFindCard()) return;

    // Watch DOM for card appearing (e.g. hydrated grids or load-more batch restoration)
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

      if (tries < 120) { // ~2 seconds max
        state.rafId = requestAnimationFrame(tick);
      } else {
        // Fallback: card was not found, reveal page without moving viewport
        revealPage();
        cleanup(false);
      }
    };
    state.rafId = requestAnimationFrame(tick);

    // Hard timeout safety net: reveal and clean up smoothly
    state.timeoutId = setTimeout(() => {
      if (!state.cancelled) {
        tryFindCard();
        revealPage();
        cleanup(false);
      }
    }, 2500);
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

    // Visual cloak
    const overlay = document.createElement('div');
    overlay.id = 'scroll-restore-cloak';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:var(--bg-body,#fff);pointer-events:none;transition:opacity 120ms ease-out;';
    if (document.documentElement.classList.contains('dark')) {
      overlay.style.background = '#0f0f1b';
    }
    document.body.appendChild(overlay);

    const revealPage = () => {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.remove(); }, 150);
    };

    const fullCleanup = () => {
      state.cancelled = true;
      if (state.rafId) cancelAnimationFrame(state.rafId);
      if (state.observer) state.observer.disconnect();
      if (state.timeoutId) clearTimeout(state.timeoutId);
      window.removeEventListener('wheel', onUserInterrupt);
      window.removeEventListener('touchmove', onUserInterrupt);
      window.removeEventListener('touchstart', onUserInterrupt);
      window.removeEventListener('keydown', onUserInterrupt);
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
    window.addEventListener('keydown', onUserInterrupt, { passive: true, once: true });

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