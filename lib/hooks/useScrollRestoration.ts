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

    if (!options?.force && !isSameStorePath(data.path, currentPath)) {
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
    const maxTries = 300; // ~5 seconds

    const cleanup = (removeFromStorage = true) => {
      isFinished = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
      window.removeEventListener('wheel', onUserInterrupt);
      window.removeEventListener('touchmove', onUserInterrupt);
      if (removeFromStorage) {
        try {
          sessionStorage.removeItem(SCROLL_KEY);
        } catch {}
      }
    };

    const onUserInterrupt = () => {
      cleanup(true);
    };

    window.addEventListener('wheel', onUserInterrupt, { passive: true });
    window.addEventListener('touchmove', onUserInterrupt, { passive: true });

    const applyCardFocus = (card: HTMLElement) => {
      // Center the card in the viewport
      card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
      card.focus?.({ preventScroll: true });
      card.classList.add('scroll-restore-highlight');
      setTimeout(() => card.classList.remove('scroll-restore-highlight'), 1600);

      // Settle check: within next 500ms, as deferred images/content load, keep card centered
      let settleFrames = 0;
      const keepCentered = () => {
        settleFrames++;
        if (settleFrames <= 30) {
          const rect = card.getBoundingClientRect();
          const idealTop = (window.innerHeight - rect.height) / 2;
          if (Math.abs(rect.top - idealTop) > 80) {
            card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
          }
          requestAnimationFrame(keepCentered);
        }
      };
      requestAnimationFrame(keepCentered);

      cleanup(true);
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

      // 2. If card is still not found after 45 frames (~750ms), fallback to scrollY if document is tall enough
      if (tries > 45 && data.scrollY > 0) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll >= data.scrollY - 20) {
          window.scrollTo({ top: data.scrollY, behavior: 'instant' });
          cleanup(true);
          return;
        }
      }

      // 3. Keep waiting up to maxTries
      if (tries < maxTries) {
        rafId = requestAnimationFrame(tick);
      } else {
        // Final fallback on timeout
        if (data.scrollY > 0) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: Math.min(data.scrollY, Math.max(0, maxScroll)), behavior: 'instant' });
        }
        cleanup(true);
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
