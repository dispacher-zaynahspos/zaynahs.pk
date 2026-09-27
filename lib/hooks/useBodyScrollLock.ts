'use client';

import { useEffect } from 'react';

/**
 * useBodyScrollLock — SINGLE SOURCE OF TRUTH for locking background page scroll
 * behind any popup / modal / bottom-sheet / overlay (RULE SSOT1 + UI popup-scroll rule).
 *
 * Why a shared hook (not `document.body.style.overflow = 'hidden'` per-modal):
 *  - `overflow:hidden` alone does NOT reliably stop background scroll on iOS Safari.
 *    We use the `position: fixed` + preserved `scrollY` technique, which works on every
 *    device and restores the exact scroll position on close.
 *  - Ref-counting lets multiple overlays stack (e.g. Quick View → Size Guide) without
 *    one overlay's cleanup prematurely unlocking the page for the other.
 *
 * Usage:
 *   useBodyScrollLock();          // locks while the component is mounted
 *   useBodyScrollLock(isOpen);    // locks only while `active` is true
 */

let lockCount = 0;
let savedScrollY = 0;
let savedBodyStyle: {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
} | null = null;

function applyLock() {
  lockCount += 1;
  if (lockCount > 1 || typeof document === 'undefined') return;

  const body = document.body;
  savedScrollY = window.scrollY;
  savedBodyStyle = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
  };

  // position:fixed pins the page; negative top preserves the visual scroll offset.
  body.style.position = 'fixed';
  body.style.top = `-${savedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.overflow = 'hidden';
}

function releaseLock() {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0 || typeof document === 'undefined') return;

  const body = document.body;
  if (savedBodyStyle) {
    body.style.position = savedBodyStyle.position;
    body.style.top = savedBodyStyle.top;
    body.style.left = savedBodyStyle.left;
    body.style.right = savedBodyStyle.right;
    body.style.width = savedBodyStyle.width;
    body.style.overflow = savedBodyStyle.overflow;
    savedBodyStyle = null;
  }
  // Restore the exact scroll position the user was at before opening the overlay.
  window.scrollTo(0, savedScrollY);
}

export function useBodyScrollLock(active: boolean = true): void {
  useEffect(() => {
    if (!active || typeof window === 'undefined') return;
    applyLock();
    return () => releaseLock();
  }, [active]);
}
