'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Mobile Card Focus Coordinator (Shopify / Headless E-Commerce Compatible)
 * 
 * Key Features:
 * 1. Dynamic Card Size & Settings Sync:
 *    - No hardcoded pixel heights or offsets.
 *    - Dynamically queries runtime bounding boxes (getBoundingClientRect) for any
 *      aspect ratio (natural, 1:1, 3:4, compact, custom).
 *    - Automatically handles dynamic pagination, infinite scroll ("Load More"),
 *      and DOM unmounts without memory leaks.
 * 2. Accurate Center-Proximity Sweet-Spot Algorithm:
 *    - Natural mobile eye-level anchor (targetY = innerHeight * 0.45, range 0.42 - 0.48).
 *    - Dynamic touch/thumb tracking (targetX = lastTouchX or screen center).
 *    - Weighted Euclidean distance: sqrt(dx^2 + (dy * 1.4)^2).
 *    - 18% Hysteresis / Threshold Lock: Focus stays locked to the active card until
 *      a neighboring card is at least 18% closer. Eliminates left/right jumping and flickers.
 * 3. Touch & Tap Direct Override:
 *    - Direct tap immediately locks focus onto the touched card with a 750ms sticky window.
 * 4. 60 FPS Mobile Performance:
 *    - requestAnimationFrame (rAF) coalesced evaluation + passive event listeners.
 */

export class MobileCardFocusManager {
  private static instance: MobileCardFocusManager | null = null;
  private observer: IntersectionObserver | null = null;
  private registeredCards = new Map<HTMLElement, (focused: boolean) => void>();
  private intersectingEntries = new Map<HTMLElement, IntersectionObserverEntry>();
  private currentFocusedEl: HTMLElement | null = null;
  private lastTouchX: number = typeof window !== 'undefined' ? window.innerWidth * 0.5 : 200;
  private manualLockUntil = 0;
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

    // Viewport rootMargin to track cards entering the active reading band
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            this.intersectingEntries.set(el, entry);
          } else {
            this.intersectingEntries.delete(el);
          }
        });
        this.scheduleEvaluation();
      },
      {
        root: null,
        rootMargin: '-5% 0px -5% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
      }
    );

    if (!this.isListening) {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
      window.addEventListener('touchstart', this.onTouchStart, { passive: true });
      window.addEventListener('touchmove', this.onTouchMove, { passive: true });
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

  private onTouchMove = (e: TouchEvent) => {
    if (e.touches && e.touches[0]) {
      this.lastTouchX = e.touches[0].clientX;
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

    // Touch & Tap Sticky Lock check:
    // If a card was manually tapped recently, keep it locked as long as it's still visible in viewport
    const now = Date.now();
    if (now < this.manualLockUntil && this.currentFocusedEl && this.currentFocusedEl.isConnected) {
      const rect = this.currentFocusedEl.getBoundingClientRect();
      const inViewport = rect.bottom > 60 && rect.top < window.innerHeight - 60;
      if (inViewport) {
        return; // Retain tap lock-focus
      }
    }

    if (this.intersectingEntries.size === 0) {
      if (this.currentFocusedEl) {
        this.setElementFocus(this.currentFocusedEl, false);
        this.currentFocusedEl = null;
      }
      return;
    }

    // Natural mobile eye-level anchor (45% from top)
    const targetY = window.innerHeight * 0.45;
    const targetX = this.lastTouchX;

    let bestEl: HTMLElement | null = null;
    let minEffectiveDistance = Infinity;

    // Prune detached cards from memory
    this.intersectingEntries.forEach((_, el) => {
      if (!el.isConnected) {
        this.intersectingEntries.delete(el);
        this.registeredCards.delete(el);
        return;
      }

      // Dynamic real-time rendered dimensions
      const rect = el.getBoundingClientRect();

      // Must have some visibility in viewport
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
        return;
      }

      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      // Euclidean distance with vertical weight (1.4) for mobile feed scanning
      const dx = cardCenterX - targetX;
      const dy = cardCenterY - targetY;
      const euclideanDistance = Math.sqrt(dx * dx + (dy * 1.4) * (dy * 1.4));

      // 18% Hysteresis / Threshold Lock:
      // The currently focused card receives an 18% advantage (0.82 multiplier).
      // A neighboring card cannot steal focus unless it is > 18% closer.
      const isCurrentlyFocused = el === this.currentFocusedEl;
      const effectiveDistance = isCurrentlyFocused
        ? euclideanDistance * 0.82
        : euclideanDistance;

      if (effectiveDistance < minEffectiveDistance) {
        minEffectiveDistance = effectiveDistance;
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
    // Lock for 750ms so inertia scroll right after tap doesn't immediately dismiss it
    this.manualLockUntil = Date.now() + 750;

    if (this.currentFocusedEl !== el) {
      if (this.currentFocusedEl) {
        this.setElementFocus(this.currentFocusedEl, false);
      }
      this.currentFocusedEl = el;
      this.setElementFocus(el, true);
    }
  }

  public rebindAll() {
    if (typeof document === 'undefined') return;
    const cards = document.querySelectorAll<HTMLElement>('.z-card-container');
    cards.forEach((card) => {
      if (!this.registeredCards.has(card)) {
        this.register(card, () => {});
      }
    });
    this.scheduleEvaluation();
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
      window.removeEventListener('touchmove', this.onTouchMove);
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
