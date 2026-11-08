'use client';

import { useEffect, useRef, useCallback } from 'react';
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

/**
 * Storefront scroll & state restoration (Single Source of Truth).
 * 
 * BACK/FORWARD: Restore the exact saved product card into viewport center.
 *   - Uses MutationObserver + polling to wait for lazy grids/product cards to appear
 *   - Prevents "header flash → footer jump" via visual cloak
 *   - Focuses card with visible focus ring and settles layout for up to 2s
 *   - Aborts at once if user interacts (wheel, touch, key)
 * 
 * FORWARD NAV: Scroll to top instantly (RULE N3).
 * 
 * Takes over from the browser via history.scrollRestoration = 'manual'.
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

  // ── Main route/URL change handler ──────────────────────────────────────
  useEffect(() => {
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
    
    // Check all indicators of a back/pop navigation (popstate, nav timing, referrer, session)
    const isNavBackForward =
      typeof window !== 'undefined' &&
      ((performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming)?.type === 'back_forward' ||
       (window.performance?.navigation?.type === 2));

    const snap = getNavigationSnapshot(currentPath);
    let targetCardId = snap?.clickedCardId;
    let targetScrollY = snap?.scrollY;

    // Fallback: check last_clicked_card_id if path matches and recent (<15 mins)
    if (!targetCardId && typeof window !== 'undefined') {
      try {
        const lastCard = sessionStorage.getItem('last_clicked_card_id');
        const lastPath = sessionStorage.getItem('last_clicked_card_path');
        const lastTime = Number(sessionStorage.getItem('last_clicked_card_time') || 0);
        if (lastCard && (!lastPath || isSameStorePath(lastPath, currentPath)) && Date.now() - lastTime < 15 * 60 * 1000) {
          targetCardId = lastCard;
        }
      } catch {}
    }

    const isFromProductPage = typeof document !== 'undefined' && document.referrer && document.referrer.includes('/product/');
    const wasPop = isPopRef.current || isPopNavigation() || isNavBackForward || (isFromProductPage && !!targetCardId);
    isPopRef.current = false;
    clearPopNavigation();

    // 2. PRODUCT CARD & STATE RESTORATION — ONLY on back/forward navigation
    if (wasPop) {
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
    }

    // 3. Fresh navigation → ALWAYS scroll to top of new page (RULE N3)
    // Strictly guarded by !wasPop so it NEVER fights back/forward navigation!
    if (!wasPop && (isNewRoute || isFirstLoad)) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Double-fire after layout to cover Safari's deferred scroll clamp
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!isPopRef.current && !isPopNavigation()) {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        });
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

    // ── VISUAL CLOAK: overlay div covers screen to prevent banner/footer flash ──
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

    // User interaction aborts restoration & reveals page immediately
    const onUserInterrupt = () => {
      if (state.cancelled) return;
      state.cancelled = true;
      revealPage();
      cleanup(true);
    };
    window.addEventListener('wheel', onUserInterrupt, { passive: true, once: true });
    window.addEventListener('touchmove', onUserInterrupt, { passive: true, once: true });
    window.addEventListener('touchstart', onUserInterrupt, { passive: true, once: true });
    window.addEventListener('keydown', onUserInterrupt, { passive: true, once: true });

    const cleanup = (removeFromStorage: boolean) => {
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
      // Instantly center the card (page is still hidden behind cloak)
      card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' as ScrollBehavior });
      card.focus?.({ preventScroll: true });

      // Now reveal the page — user sees the card centered, never the banner/footer
      revealPage();

      // Visual highlight with prominent focus ring
      card.classList.add('scroll-restore-highlight');
      setTimeout(() => card.classList.remove('scroll-restore-highlight'), 2200);

      // Keep card centered for up to 1.5 seconds while images and fonts settle
      let settleCount = 0;
      const settle = () => {
        if (state.cancelled || settleCount >= 45) {
          cleanup(true);
          return;
        }
        settleCount++;
        if (card.isConnected) {
          const rect = card.getBoundingClientRect();
          const idealTop = (window.innerHeight - rect.height) / 2;
          if (Math.abs(rect.top - idealTop) > 30) {
            card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' as ScrollBehavior });
          }
        }
        state.rafId = requestAnimationFrame(settle);
      };
      state.rafId = requestAnimationFrame(settle);
    };

    const tryFindCard = (): boolean => {
      if (state.cancelled) return false;
      const cardId = data.clickedCardId;
      if (cardId) {
        const card = document.getElementById(`product-card-${cardId}`) ||
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

      if (tries < 180) { // ~3 seconds max
        state.rafId = requestAnimationFrame(tick);
      } else {
        // Fallback: card was not found, scroll to saved Y only if page is actually tall enough
        if (data.scrollY && data.scrollY > 0) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (maxScroll > 150) {
            window.scrollTo({ top: Math.min(data.scrollY, maxScroll), behavior: 'instant' });
          }
        }
        revealPage();
        cleanup(true);
      }
    };
    state.rafId = requestAnimationFrame(tick);

    // Hard timeout safety net: if nothing worked in 4s, reveal and stop
    state.timeoutId = setTimeout(() => {
      if (!state.cancelled) {
        if (tryFindCard()) return;
        if (data.scrollY && data.scrollY > 0) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: Math.min(data.scrollY, Math.max(0, maxScroll)), behavior: 'instant' });
        }
        revealPage();
        cleanup(true);
      }
    }, 4000);
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