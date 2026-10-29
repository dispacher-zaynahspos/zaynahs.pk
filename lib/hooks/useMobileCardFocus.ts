'use client';

import { useEffect, useRef } from 'react';

/**
 * Mobile Card Focus Coordinator (Shopify / Headless E-Commerce Compatible)
 * 
 * Performance Architecture:
 * 1. Zero Layout Thrashing:
 *    - Desktop (pointer:fine / hover:hover / width > 768px) is completely bypassed.
 *      Desktop uses pure CSS :hover with zero scroll/rAF listeners.
 *    - On touch devices, evaluation is coalesced via rAF and throttled during active scrolling.
 * 2. Zero React Re-Renders:
 *    - Focus classes (.is-in-focus, .active-card) are toggled directly on the DOM element's
 *      classList. React does not re-render cards during scroll, keeping scroll at a locked 60/120fps.
 * 3. Hysteresis & Sticky Tap:
 *    - Center-proximity sweet spot algorithm with 18% lock hysteresis.
 *    - Tap immediately locks focus for 750ms.
 */

export class MobileCardFocusManager {
  private static instance: MobileCardFocusManager | null = null;
  private observer: IntersectionObserver | null = null;
  private registeredCards = new Set<HTMLElement>();
  private intersectingEntries = new Map<HTMLElement, IntersectionObserverEntry>();
  private currentFocusedEl: HTMLElement | null = null;
  private lastTouchX: number = typeof window !== 'undefined' ? window.innerWidth * 0.5 : 200;
  private manualLockUntil = 0;
  private rafId: number | null = null;
  private scrollDebounceId: ReturnType<typeof setTimeout> | null = null;
  private isListening = false;
  private mode: 'scroll' | 'touch' | 'off' = 'scroll';

  public static getInstance(): MobileCardFocusManager {
    if (!MobileCardFocusManager.instance) {
      MobileCardFocusManager.instance = new MobileCardFocusManager();
    }
    return MobileCardFocusManager.instance;
  }

  public setMode(mode: 'scroll' | 'touch' | 'off') {
    this.mode = mode;
  }

  private isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: none), (pointer: coarse), (max-width: 768px)').matches;
  }

  private initObserver() {
    if (this.observer || typeof window === 'undefined') return;

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
        if (this.isTouchDevice()) {
          this.scheduleEvaluation();
        }
      },
      {
        root: null,
        rootMargin: '-5% 0px -5% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      }
    );

    this.attachListeners();
  }

  private attachListeners() {
    if (this.isListening || typeof window === 'undefined') return;

    // Window resize is always needed to adapt between mobile/desktop modes
    window.addEventListener('resize', this.onResize, { passive: true });

    // Touch and scroll listeners ONLY attach if touch device is active
    if (this.isTouchDevice()) {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('touchstart', this.onTouchStart, { passive: true });
      window.addEventListener('touchmove', this.onTouchMove, { passive: true });
      window.addEventListener('pointerdown', this.onPointerDown, { passive: true });
    }
    this.isListening = true;
  }

  private detachScrollListeners() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('pointerdown', this.onPointerDown);
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
    // Coalesced rAF evaluation + debounced rest evaluation
    this.scheduleEvaluation();
    if (this.scrollDebounceId) clearTimeout(this.scrollDebounceId);
    this.scrollDebounceId = setTimeout(() => {
      this.evaluateFocusedCard();
    }, 80);
  };

  private onResize = () => {
    const isTouch = this.isTouchDevice();
    if (isTouch) {
      this.attachListeners();
      this.scheduleEvaluation();
    } else {
      this.detachScrollListeners();
      if (this.currentFocusedEl) {
        this.setElementFocus(this.currentFocusedEl, false);
        this.currentFocusedEl = null;
      }
    }
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

    if (this.mode === 'touch' || this.mode === 'off') return;

    const now = Date.now();
    if (now < this.manualLockUntil && this.currentFocusedEl && this.currentFocusedEl.isConnected) {
      const rect = this.currentFocusedEl.getBoundingClientRect();
      const inViewport = rect.bottom > 60 && rect.top < window.innerHeight - 60;
      if (inViewport) return;
    }

    if (this.intersectingEntries.size === 0) {
      if (this.currentFocusedEl) {
        this.setElementFocus(this.currentFocusedEl, false);
        this.currentFocusedEl = null;
      }
      return;
    }

    const targetY = window.innerHeight * 0.45;
    const targetX = this.lastTouchX;

    let bestEl: HTMLElement | null = null;
    let minEffectiveDistance = Infinity;

    this.intersectingEntries.forEach((_, el) => {
      if (!el.isConnected) {
        this.intersectingEntries.delete(el);
        this.registeredCards.delete(el);
        return;
      }

      const rect = el.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      const dx = cardCenterX - targetX;
      const dy = cardCenterY - targetY;
      const euclideanDistance = Math.sqrt(dx * dx + (dy * 1.4) * (dy * 1.4));

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
  }

  public register(el: HTMLElement) {
    this.registeredCards.add(el);
    this.initObserver();
    if (this.observer) {
      this.observer.observe(el);
    }
    if (this.isTouchDevice()) {
      this.scheduleEvaluation();
    }
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
      if (this.isTouchDevice()) {
        this.scheduleEvaluation();
      }
    }
    if (this.registeredCards.size === 0) {
      this.destroy();
    }
  }

  public setManualFocus(el: HTMLElement) {
    if (!this.isTouchDevice()) return;
    const rect = el.getBoundingClientRect();
    this.lastTouchX = rect.left + rect.width / 2;
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
    const cards = document.querySelectorAll<HTMLElement>('.z-card-container, .pc');
    cards.forEach((card) => {
      if (!this.registeredCards.has(card)) {
        this.register(card);
      }
    });
    if (this.isTouchDevice()) {
      this.scheduleEvaluation();
    }
  }

  private destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.isListening && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize);
      this.detachScrollListeners();
      this.isListening = false;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.scrollDebounceId !== null) {
      clearTimeout(this.scrollDebounceId);
      this.scrollDebounceId = null;
    }
    this.currentFocusedEl = null;
    this.intersectingEntries.clear();
  }
}

export function useMobileCardFocus<T extends HTMLElement = HTMLDivElement>(mode: 'scroll' | 'touch' | 'off' = 'scroll') {
  const cardRef = useRef<T | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof window === 'undefined') return;
    if (mode === 'off') return;

    const manager = MobileCardFocusManager.getInstance();
    manager.setMode(mode);
    manager.register(el);

    return () => {
      manager.unregister(el);
    };
  }, [mode]);

  const setManualFocus = () => {
    if (mode === 'off') return;
    if (cardRef.current) {
      MobileCardFocusManager.getInstance().setManualFocus(cardRef.current);
    }
  };

  return { cardRef, isFocused: false, setManualFocus };
}
