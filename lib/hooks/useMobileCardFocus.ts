'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Mobile Card Focus Coordinator
 * 
 * In mobile product catalog grids:
 * 1. Guarantees that EXACTLY ONE product card is flagged with `.is-in-focus` / `.active-card` at any time.
 * 2. Uses thumb/touch position (`lastTouchX`) and central viewport zone (`targetY`)
 *    so whether the user scrolls on the left or right side, the corresponding card focuses naturally.
 * 3. Tapping either card directly immediately transfers focus to that single card.
 * 4. Action icons (Wishlist, Quick View, Cart) animate smoothly in on the single focused card.
 * 5. Admin-configured hover effects (secondary image swap, zoom) activate smoothly on that single card.
 * 6. As soon as the card leaves focus, icons and effects smoothly transition out.
 * 7. Desktop (:hover) is completely untouched and continues to use native CSS hover.
 */

class MobileCardFocusManager {
  private static instance: MobileCardFocusManager | null = null;
  private observer: IntersectionObserver | null = null;
  private registeredCards = new Map<HTMLElement, (focused: boolean) => void>();
  private intersectingEntries = new Map<HTMLElement, IntersectionObserverEntry>();
  private currentFocusedEl: HTMLElement | null = null;
  private lastTouchX: number = typeof window !== 'undefined' ? window.innerWidth * 0.5 : 200;
  private rafId: number | null = null;
  private isListening = false;

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

    if (!this.isListening) {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
      window.addEventListener('touchstart', this.onTouchStart, { passive: true });
      window.addEventListener('pointerdown', this.onPointerDown, { passive: true });
      this.isListening = true;
    }
  }

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches && e.touches[0]) {
      this.lastTouchX = e.touches[0].clientX;
      this.scheduleEvaluation();
    }
  };

  private onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      this.lastTouchX = e.clientX;
      this.scheduleEvaluation();
    }
  };

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
      this.evaluateFocusedCard();
    });
  }

  private evaluateFocusedCard() {
    if (!this.isTouchDevice()) {
      if (this.currentFocusedEl) {
        this.setElementFocus(this.currentFocusedEl, false);
        this.currentFocusedEl = null;
      }
      return;
    }

    if (this.intersectingEntries.size === 0) {
      if (this.currentFocusedEl) {
        this.setElementFocus(this.currentFocusedEl, false);
        this.currentFocusedEl = null;
      }
      return;
    }

    // Natural eye/thumb focus on mobile viewport (around 42% from top)
    const targetY = window.innerHeight * 0.42;
    const targetX = this.lastTouchX;

    let bestEl: HTMLElement | null = null;
    let minDistance = Infinity;

    this.intersectingEntries.forEach((_, el) => {
      if (!el.isConnected) {
        this.intersectingEntries.delete(el);
        return;
      }
      const rect = el.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      // Weight vertical distance strongly to choose the centered row,
      // and horizontal distance to targetX (thumb/touch column) to choose between left vs right card
      const dy = Math.abs(cardCenterY - targetY);
      const dx = Math.abs(cardCenterX - targetX);
      let dist = dy * 2.2 + dx * 0.8;

      // Hysteresis: give currently focused card an advantage so micro-movements don't flicker
      if (el === this.currentFocusedEl) {
        dist -= 45;
      }

      if (dist < minDistance) {
        minDistance = dist;
        bestEl = el;
      }
    });

    if (bestEl !== this.currentFocusedEl) {
      if (this.currentFocusedEl) {
        this.setElementFocus(this.currentFocusedEl, false);
      }
      this.currentFocusedEl = bestEl;
      if (this.currentFocusedEl) {
        this.setElementFocus(this.currentFocusedEl, true);
      }
    }
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
    if (this.currentFocusedEl === el) {
      this.setElementFocus(el, false);
      this.currentFocusedEl = null;
      this.scheduleEvaluation();
    }
    if (this.registeredCards.size === 0) {
      this.destroy();
    }
  }

  public setManualFocus(el: HTMLElement) {
    if (!this.isTouchDevice()) return;
    const rect = el.getBoundingClientRect();
    this.lastTouchX = rect.left + rect.width / 2;
    if (this.currentFocusedEl !== el) {
      if (this.currentFocusedEl) {
        this.setElementFocus(this.currentFocusedEl, false);
      }
      this.currentFocusedEl = el;
      this.setElementFocus(el, true);
    }
  }

  private destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.isListening && typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('touchstart', this.onTouchStart);
      window.removeEventListener('pointerdown', this.onPointerDown);
      this.isListening = false;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.currentFocusedEl = null;
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
