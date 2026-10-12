'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Portal } from '@/components/common/Portal';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { X } from '@/components/common/Icons';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalVariant =
  | 'center'       // centered dialog on all screens
  | 'sheet'        // bottom sheet on mobile, centered dialog on sm+
  | 'drawer-left'  // full-height slide-in from the left
  | 'drawer-right' // full-height slide-in from the right
  | 'lightbox';    // edge-to-edge media viewer (dark, no panel chrome)

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** header title (optional). If omitted, pass your own header inside children. */
  title?: React.ReactNode;
  /** sticky footer content (always visible, safe-area padded on mobile). */
  footer?: React.ReactNode;
  variant?: ModalVariant;
  size?: ModalSize;
  /** show the default close (X) button in the header. Default true. */
  showClose?: boolean;
  /** close when the backdrop is clicked. Default true. */
  closeOnOverlay?: boolean;
  /** close when ESC is pressed. Default true. */
  closeOnEsc?: boolean;
  /** extra classes for the panel. */
  className?: string;
  /** aria-label when there's no visible title. */
  ariaLabel?: string;
  /** z-index layer; defaults to the shared --z-modal. */
  zIndexClassName?: string;
  /**
   * When true, the modal gives its content a FIXED height that fits the viewport
   * (so the child can lay itself out to fit with no body scroll), and the default
   * inner scroll wrapper is removed — the child owns its own scrolling regions.
   * Used by Quick View so the gallery never scrolls. Default false.
   */
  fitHeight?: boolean;
}

const SIZE_MAX: Record<ModalSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-2xl',
  lg: 'sm:max-w-4xl lg:max-w-5xl',
  // Quick View / big dialogs: scale up on large screens per the responsive spec.
  xl: 'sm:max-w-3xl lg:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[1320px]',
  full: 'sm:max-w-[96vw]',
};

/**
 * Enter/exit motion timing (SSOT — change here, every popup follows). Values are
 * tuned to feel instant-but-smooth: a quick ease-out open, a slightly faster
 * ease-in close so the panel "ghaib" (disappears) back where it came from with
 * no perceived lag. GPU-only (transform + opacity) so there is zero layout cost.
 */
const ENTER_MS = 200;
const EXIT_MS = 160;

/**
 * Shared Modal / Dialog / Bottom-sheet (RULE MODAL1 — ONE overlay system).
 *
 * - Portal to <body>, so it escapes any clipping/stacking context.
 * - Focus trap + restore focus to the opener on close; `role="dialog"` + aria-modal.
 * - ESC + overlay-click close (both toggleable), scroll-lock via the shared
 *   `useBodyScrollLock` (iOS-safe, ref-counted, restores scroll position).
 * - Inner scroll only: panel = `flex flex-col max-h-[92dvh]`, body =
 *   `flex-1 min-h-0 overflow-y-auto overscroll-contain` (UI_RULES §9). Page behind
 *   never scrolls.
 * - Responsive: `sheet` = bottom sheet on mobile (drag handle, rounded top),
 *   centered dialog on sm+. `drawer-*` = full-height side panel. `lightbox` =
 *   dark edge-to-edge media viewer. Sizes scale up on big screens.
 * - Sticky footer always visible with safe-area padding.
 *
 * Every storefront popup uses this — no per-popup overlay/scroll logic.
 */
export function Modal({
  open,
  onClose,
  children,
  title,
  footer,
  variant = 'center',
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  closeOnEsc = true,
  className = '',
  ariaLabel,
  zIndexClassName = 'z-[1000]',
  fitHeight = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Keep the modal mounted through its exit animation. `mounted` controls whether
  // anything renders; `visible` drives the enter/exit transform+opacity classes.
  // This lets the panel animate OUT (back to where it came from) instead of
  // vanishing instantly — the "smooth ghaib" feel, with no load/jank.
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Next frame: flip to visible so the browser transitions from the
      // initial (hidden) state. Double rAF guarantees the first paint happened.
      let r2 = 0;
      const r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(r1);
        cancelAnimationFrame(r2);
      };
    }
    // Closing: play the exit, then unmount after EXIT_MS.
    setVisible(false);
    const t = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open]);

  useBodyScrollLock(mounted);

  // ESC to close.
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeOnEsc, onClose]);

  // Focus management: focus the panel on open, restore on close.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = (document.activeElement as HTMLElement) || null;
    const t = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelector<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      );
      (focusable || panel).focus();
    }, 20);
    return () => {
      clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // Simple focus trap (Tab cycling within the panel).
  const onKeyDownTrap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const nodes = panel.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
    );
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!mounted) return null;

  const isLightbox = variant === 'lightbox';
  const isDrawerLeft = variant === 'drawer-left';
  const isDrawerRight = variant === 'drawer-right';
  const isDrawer = isDrawerLeft || isDrawerRight;
  const isSheet = variant === 'sheet';

  // Overlay alignment.
  const overlayAlign = isDrawerLeft
    ? 'justify-start'
    : isDrawerRight
    ? 'justify-end'
    : isSheet
    ? 'items-end sm:items-center justify-center'
    : 'items-center justify-center';

  // Enter/exit motion (GPU-only: transform + opacity, no layout). The panel
  // animates back to where it came from on close for the "smooth ghaib" feel.
  // Respect the OS "reduce motion" setting: fall back to a plain opacity fade
  // with no transform so motion-sensitive users get an instant, calm transition.
  const reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionDuration = reduceMotion ? 120 : visible ? ENTER_MS : EXIT_MS;
  const motionEase = visible ? 'cubic-bezier(0.16,1,0.3,1)' : 'cubic-bezier(0.4,0,1,1)';
  let hiddenTransform: string;
  if (isDrawerLeft) hiddenTransform = 'translateX(-100%)';
  else if (isDrawerRight) hiddenTransform = 'translateX(100%)';
  else if (isSheet)
    // Bottom sheet slides up from the bottom on mobile; on sm+ it behaves like a
    // centered dialog (handled by the overlay alignment), so a small scale reads well.
    hiddenTransform = 'translateY(100%)';
  else hiddenTransform = 'scale(0.96)'; // center + lightbox: subtle zoom
  const panelMotionStyle: React.CSSProperties = {
    transform: visible || reduceMotion ? 'none' : hiddenTransform,
    opacity: visible ? 1 : isLightbox ? 1 : 0,
    transition: `transform ${motionDuration}ms ${motionEase}, opacity ${motionDuration}ms ${motionEase}`,
    willChange: 'transform, opacity',
  };

  // Panel chrome.
  let panelBase: string;
  if (isLightbox) {
    panelBase = 'relative w-full h-full flex items-center justify-center';
  } else if (isDrawer) {
    panelBase =
      'relative bg-white dark:bg-[#16162a] w-[88%] max-w-sm h-[100dvh] shadow-2xl flex flex-col overflow-hidden';
  } else {
    panelBase = [
      'relative bg-white dark:bg-[#16162a] shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden w-full',
      'max-h-[92dvh] sm:max-h-[90dvh]',
      SIZE_MAX[size],
      isSheet ? 'rounded-t-3xl sm:rounded-2xl' : 'rounded-2xl',
    ].join(' ');
  }

  return (
    <Portal>
      <div
        className={`fixed inset-0 ${zIndexClassName} flex ${overlayAlign} ${
          isLightbox ? '!bg-black bg-black p-0' : isSheet ? 'bg-black/70 p-0 sm:p-4' : isDrawer ? 'bg-black/70 p-0' : 'bg-black/70 p-0 sm:p-4'
        }`}
        style={
          isLightbox
            ? {
                backgroundColor: '#000000',
                opacity: visible ? 1 : 0,
                transition: `opacity ${motionDuration}ms ${motionEase}`,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100dvh',
                zIndex: 99999,
              }
            : {
                opacity: visible ? 1 : 0,
                transition: `opacity ${motionDuration}ms ${motionEase}`,
              }
        }
        onClick={closeOnOverlay ? onClose : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : ariaLabel}
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={onKeyDownTrap}
          style={panelMotionStyle}
          className={`${panelBase} ${className} outline-none`}
        >
          {/* Mobile drag handle for bottom sheet */}
          {isSheet && (
            <div className="sm:hidden flex justify-center pt-2 pb-1 shrink-0">
              <span className="h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>
          )}

          {/* Header */}
          {(title || showClose) && !isLightbox && (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="min-w-0 font-black text-gray-900 dark:text-white text-sm sm:text-base truncate">
                {title}
              </div>
              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer min-h-11 min-w-11 flex items-center justify-center -mr-2"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Lightbox close (floating) */}
          {isLightbox && showClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-50 text-white hover:text-white bg-white/20 hover:bg-white/30 rounded-full min-h-11 min-w-11 flex items-center justify-center cursor-pointer pointer-events-auto border border-white/20 shadow-lg"
            >
              <X className="h-6 w-6" />
            </button>
          )}

          {/* Scroll body (SSOT scroll pattern). When fitHeight is on, the child
              owns its own layout/scroll so it can fit the viewport with no body
              scroll (e.g. Quick View gallery). */}
          {isLightbox ? (
            children
          ) : fitHeight ? (
            <div className="flex-1 min-h-0 flex flex-col">{children}</div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">{children}</div>
          )}

          {/* Sticky footer */}
          {footer && !isLightbox && (
            <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#16162a] px-4 sm:px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

export default Modal;
