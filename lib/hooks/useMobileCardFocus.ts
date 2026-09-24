'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Mobile Card Focus Coordinator
 * 
 * In mobile 1-column or 2-column product catalog grids:
 * 1. Coordinates focus so the active row currently in the viewport's central zone
 *    (both left and right cards in the row) receives `.is-in-focus`.
 * 2. Action icons (Wishlist, Quick View, Cart) animate smoothly in on the focused card(s).
 * 3. Admin-configured hover effects (secondary image swap, zoom) activate smoothly.
 * 4. Cards outside the active focus zone smoothly transition their icons out.
 * 5. Manual touch/tap immediately focuses the touched card.
 * 6. Desktop (:hover) is completely untouched and continues to use native CSS hover.
 */

class MobileCardFocusManager {
  private static instance: MobileCardFocusManager | null = null;
  private observer: IntersectionObserver | null = null;
  private registeredCards = new Map<HTMLElement, (focused: boolean) => void>();
  private intersectingEntries = new Map<HTMLElement, IntersectionObserverEntry>();
  private currentFocusedEls = new Set<HTMLElement>();
  private rafId: number | null = null;
  private isScrollListening = false;

  public static getInstance(): MobileCardFocusManager {
    if (!MobileCardFocusManager.instance) {
      MobileCardFocusManager.instance = new MobileCardFocusManager();
    }
    return MobileCardFocusManager.instance;
  }

  private isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: none), (pointer: coarse), (max-width: 768px)').matches;
  }

  private initObserver() {
    if (this.observer || typeof window === 'undefined') return;

    // Define central active focus zone: top 20% and bottom 20% excluded
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
            this.intersectingEntries.set(el, entry);
          } else {
            this.intersectingEntries.delete(el);
          }
        });
        this.scheduleEvaluation();
      },
      {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
      }
    );

    if (!this.isScrollListening) {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
      this.isScrollListening = true;
    }
  }

  private onScroll = () => {
    this.scheduleEvaluation();
  };

  private onResize = () => {
    this.scheduleEvaluation();
  };

  private scheduleEvaluation() {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.evaluateFocusedCards();
    });
  }

  private evaluateFocusedCards() {
    if (!this.isTouchDevice()) {
      if (this.currentFocusedEls.size > 0) {
        this.currentFocusedEls.forEach((el) => this.setElementFocus(el, false));
        this.currentFocusedEls.clear();
      }
      return;
    }

    if (this.intersectingEntries.size === 0) {
      if (this.currentFocusedEls.size > 0) {
        this.currentFocusedEls.forEach((el) => this.setElementFocus(el, false));
        this.currentFocusedEls.clear();
      }
      return;
    }

    // Natural eye/thumb focus on mobile viewport (around 42% from top)
    const targetY = window.innerHeight * 0.42;
    let minDistance = Infinity;
    const candidates: Array<{ el: HTMLElement; dist: number }> = [];

    this.intersectingEntries.forEach((_, el) => {
      if (!el.isConnected) {
        this.intersectingEntries.delete(el);
        return;
      }
      const rect = el.getBoundingClientRect();
      const cardCenterY = rect.top + rect.height / 2;
      let dist = Math.abs(cardCenterY - targetY);

      // Hysteresis: give currently focused cards a 35px advantage so micro-scrolls don't jitter
      if (this.currentFocusedEls.has(el)) {
        dist -= 35;
      }

      candidates.push({ el, dist });
      if (dist < minDistance) {
        minDistance = dist;
      }
    });

    // In a 2-column mobile grid, both left and right cards in the active row have virtually identical
    // vertical distance to targetY (within 35px). We focus all cards in the active row so neither column is neglected!
    const nextFocusedEls = new Set<HTMLElement>();
    candidates.forEach(({ el, dist }) => {
      if (Math.abs(dist - minDistance) <= 35) {
        nextFocusedEls.add(el);
      }
    });

    // Remove focus from cards no longer in the active row
    this.currentFocusedEls.forEach((el) => {
      if (!nextFocusedEls.has(el)) {
        this.setElementFocus(el, false);
      }
    });

    // Add focus to new cards in the active row
    nextFocusedEls.forEach((el) => {
      if (!this.currentFocusedEls.has(el)) {
        this.setElementFocus(el, true);
      }
    });

    this.currentFocusedEls = nextFocusedEls;
  }

  private setElementFocus(el: HTMLElement, focused: boolean) {
    if (focused) {
      el.classList.add('is-in-focus', 'active-card');
    } else {
      el.classList.remove('is-in-focus', 'active-card');
    }
    const cb = this.registeredCards.get(el);
    if (cb) cb(focused);
  }

  public register(el: HTMLElement, onFocusChange: (focused: boolean) => void) {
    this.registeredCards.set(el, onFocusChange);
    this.initObserver();
    if (this.observer) {
      this.observer.observe(el);
    }
    this.scheduleEvaluation();
  }

  public unregister(el: HTMLElement) {
    this.registeredCards.delete(el);
    this.intersectingEntries.delete(el);
    if (this.observer) {
      this.observer.unobserve(el);
    }
    if (this.currentFocusedEls.has(el)) {
      this.setElementFocus(el, false);
      this.currentFocusedEls.delete(el);
      this.scheduleEvaluation();
    }
    if (this.registeredCards.size === 0) {
      this.destroy();
    }
  }

  public setManualFocus(el: HTMLElement) {
    if (!this.isTouchDevice()) return;
    this.currentFocusedEls.forEach((otherEl) => {
      if (otherEl !== el) {
        this.setElementFocus(otherEl, false);
      }
    });
    this.currentFocusedEls.clear();
    this.currentFocusedEls.add(el);
    this.setElementFocus(el, true);
  }

  private destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.isScrollListening && typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onResize);
      this.isScrollListening = false;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.currentFocusedEls.clear();
    this.intersectingEntries.clear();
  }
}

export function useMobileCardFocus() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof window === 'undefined') return;

    const manager = MobileCardFocusManager.getInstance();
    manager.register(el, (focused) => {
      setIsFocused(focused);
    });

    return () => {
      manager.unregister(el);
    };
  }, []);

  const setManualFocus = () => {
    if (cardRef.current) {
      MobileCardFocusManager.getInstance().setManualFocus(cardRef.current);
    }
  };

  return { cardRef, isFocused, setManualFocus };
}
