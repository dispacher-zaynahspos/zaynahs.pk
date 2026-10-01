'use client';

import { useEffect } from 'react';

export const SCROLL_KEY = 'store_scroll_restore';

export interface ScrollRestoreData {
  scrollY: number;
  productId: string;
  path: string;
  timestamp: number;
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
 * Canonical single source of truth for restoring scroll / focusing product card.
 * Returns true if a restoration was initiated/completed, false otherwise.
 */
export function restoreProductCardOrScroll(options?: { force?: boolean }): boolean {
  if (typeof window === 'undefined') return false;

  const raw = sessionStorage.getItem(SCROLL_KEY);
  if (!raw) return false;

  try {
    const data: ScrollRestoreData = JSON.parse(raw);
    const currentPath = window.location.pathname + window.location.search;

    const norm = (p: string) => p.replace(/\/+(\?|$)/, '$1') || '/';
    if (!options?.force && norm(data.path) !== norm(currentPath)) {
      return false;
    }

    // Ignore stale data (> 30 mins)
    if (data.timestamp && Date.now() - data.timestamp > 30 * 60 * 1000) {
      sessionStorage.removeItem(SCROLL_KEY);
      return false;
    }

    let isFinished = false;
    let rafId: number | null = null;
    let observer: MutationObserver | null = null;
    let tries = 0;
    const maxTries = 240; // ~4 seconds at 60fps

    const cleanup = () => {
      isFinished = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
      window.removeEventListener('wheel', onUserInterrupt);
      window.removeEventListener('touchmove', onUserInterrupt);
      try { sessionStorage.removeItem(SCROLL_KEY); } catch {}
    };

    // User scrolled manually? Cancel so we don't fight their active scrolling
    const onUserInterrupt = () => {
      cleanup();
    };

    window.addEventListener('wheel', onUserInterrupt, { passive: true });
    window.addEventListener('touchmove', onUserInterrupt, { passive: true });

    const applyCardFocus = (card: HTMLElement) => {
      // Instant scroll card to center of viewport
      card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
      card.focus?.({ preventScroll: true });
      card.classList.add('scroll-restore-highlight');
      setTimeout(() => card.classList.remove('scroll-restore-highlight'), 1600);

      // Settle check: within next 300ms, if images cause layout shifts, keep card centered
      let settleFrames = 0;
      const keepCentered = () => {
        if (isFinished && settleFrames > 18) return;
        settleFrames++;
        if (settleFrames <= 18) {
          const rect = card.getBoundingClientRect();
          const idealTop = (window.innerHeight - rect.height) / 2;
          if (Math.abs(rect.top - idealTop) > 100) {
            card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
          }
          requestAnimationFrame(keepCentered);
        }
      };
      requestAnimationFrame(keepCentered);

      cleanup();
    };

    const tick = () => {
      if (isFinished) return;
      tries++;

      // 1. Try finding the specific product card
      if (data.productId) {
        const card = document.getElementById(`product-card-${data.productId}`);
        if (card) {
          applyCardFocus(card);
          return;
        }
      }

      // 2. If card is not in DOM yet:
      // DO NOT clamp to maxScroll (which would jump to footer)!
      // Only scroll to data.scrollY if document height has actually expanded enough:
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll >= data.scrollY - 10) {
        // Document has grown enough to hold the target position.
        const card = data.productId ? document.getElementById(`product-card-${data.productId}`) : null;
        if (card) {
          applyCardFocus(card);
          return;
        }
        window.scrollTo({ top: data.scrollY, behavior: 'instant' });
        cleanup();
        return;
      }

      // 3. Keep waiting if within timeout
      if (tries < maxTries) {
        rafId = requestAnimationFrame(tick);
      } else {
        // Timeout reached (~4s): final attempt
        const card = data.productId ? document.getElementById(`product-card-${data.productId}`) : null;
        if (card) {
          applyCardFocus(card);
        } else if (data.scrollY > 0) {
          window.scrollTo({ top: Math.min(data.scrollY, Math.max(0, maxScroll)), behavior: 'instant' });
        }
        cleanup();
      }
    };

    // Watch DOM mutations for lazy grids/sections appearing
    observer = new MutationObserver(() => {
      if (isFinished) return;
      if (data.productId && document.getElementById(`product-card-${data.productId}`)) {
        tick();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Kick off first frame
    rafId = requestAnimationFrame(tick);

    return true;
  } catch {
    sessionStorage.removeItem(SCROLL_KEY);
    return false;
  }
}

/** Used in listing pages — restores scroll & focuses product card on back navigation */
export const useScrollRestoration = () => {
  useEffect(() => {
    restoreProductCardOrScroll();
  }, []);
};
