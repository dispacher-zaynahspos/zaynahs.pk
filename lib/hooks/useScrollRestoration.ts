'use client';

import { useEffect } from 'react';

const SCROLL_KEY = 'store_scroll_restore';

export interface ScrollRestoreData {
  scrollY: number;
  productId: string;
  path: string;
}

/** Call before navigating to product detail — saves current scroll + product id */
export const saveScrollPosition = (productId: string) => {
  if (typeof window === 'undefined') return;
  const data: ScrollRestoreData = {
    scrollY: window.scrollY,
    productId,
    path: window.location.pathname + window.location.search,
  };
  sessionStorage.setItem(SCROLL_KEY, JSON.stringify(data));
};

/** Used in listing pages — restores scroll & focuses product card on back navigation */
export const useScrollRestoration = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = sessionStorage.getItem(SCROLL_KEY);
    if (!raw) return;

    try {
      const data: ScrollRestoreData = JSON.parse(raw);
      const currentPath = window.location.pathname + window.location.search;

      // Only restore if we came back to the same page
      if (data.path !== currentPath) return;

      sessionStorage.removeItem(SCROLL_KEY);

      // Wait for DOM/images to settle
      const restore = () => {
        const card = document.getElementById(`product-card-${data.productId}`);
        if (card) {
          card.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
          card.focus({ preventScroll: true });
          card.classList.add('scroll-restore-highlight');
          setTimeout(() => card.classList.remove('scroll-restore-highlight'), 1200);
        } else {
          window.scrollTo({ top: data.scrollY, behavior: 'instant' });
        }
      };

      // Double RAF + timeout check ensures layout and image dimensions settle cleanly
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          restore();
          setTimeout(restore, 100);
        });
      });
    } catch {
      sessionStorage.removeItem(SCROLL_KEY);
    }
  }, []);
};
