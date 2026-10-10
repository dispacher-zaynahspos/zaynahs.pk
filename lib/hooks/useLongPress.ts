'use client';

/**
 * useLongPress — SINGLE SOURCE OF TRUTH for long-press detection (RULE SSOT1).
 *
 * Used by the shared reorder system to open the "Move" modal on a 500ms press
 * (mobile + desktop). Fixes the historically-broken long-press by addressing:
 *  - movement tolerance: a tiny finger wobble (<10px) does NOT cancel the press.
 *  - iOS Safari callout / selection: callers set `-webkit-touch-callout:none` +
 *    `user-select:none` on the row; we also preventDefault contextmenu.
 *  - stale closures: timer + start coords live in refs, not state.
 *  - DnD sensor conflict: callers give the drag sensor its own activation delay
 *    so a long-press opens the modal instead of starting a drag.
 *
 * Returns handlers to spread on the row element. Pointer Events cover mouse,
 * touch, and pen with one code path.
 */

import { useCallback, useEffect, useRef } from 'react';

export interface UseLongPressOptions {
  onLongPress: () => void;
  /** optional short tap handler (fires only if long-press did NOT trigger) */
  onTap?: () => void;
  delay?: number;
  moveTolerance?: number;
  disabled?: boolean;
}

export interface LongPressHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function useLongPress({
  onLongPress,
  onTap,
  delay = 500,
  moveTolerance = 10,
  disabled = false,
}: UseLongPressOptions): LongPressHandlers {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);
  const cbRef = useRef(onLongPress);
  const tapRef = useRef(onTap);

  cbRef.current = onLongPress;
  tapRef.current = onTap;

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      firedRef.current = false;
      startRef.current = { x: e.clientX, y: e.clientY };
      clear();
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        if (navigator.vibrate) {
          try { navigator.vibrate(15); } catch { /* ignore */ }
        }
        cbRef.current();
      }, delay);
    },
    [disabled, delay, clear]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current || firedRef.current) return;
      const dx = Math.abs(e.clientX - startRef.current.x);
      const dy = Math.abs(e.clientY - startRef.current.y);
      if (dx > moveTolerance || dy > moveTolerance) {
        clear();
        startRef.current = null;
      }
    },
    [moveTolerance, clear]
  );

  const onPointerUp = useCallback(() => {
    clear();
    if (!firedRef.current && startRef.current && tapRef.current) {
      tapRef.current();
    }
    startRef.current = null;
  }, [clear]);

  const onPointerLeave = useCallback(() => {
    clear();
    startRef.current = null;
  }, [clear]);

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    if (!disabled) e.preventDefault();
  }, [disabled]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerLeave, onContextMenu };
}
