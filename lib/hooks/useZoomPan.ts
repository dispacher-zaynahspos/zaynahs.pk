'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useZoomPan — the single shared image zoom/pan engine (RULE SSOT1).
 *
 * Extracted from the storefront product lightbox so the exact same interaction
 * (wheel zoom, drag pan, pinch-to-zoom, double-click/double-tap toggle, +/-/reset)
 * is reused everywhere: product gallery lightbox, review image zoom, and the admin
 * Media Preview. CSS-transform based (translate + scale) — no zoom library.
 *
 * The consumer spreads `bind` onto the transform container and renders the child
 * (image) inside it. The container's `style` must apply `transform` from
 * `{ scale, pos }`. Filters/rotation applied to the inner <img> compose cleanly
 * because zoom lives on the parent transform.
 */
export interface UseZoomPanOptions {
  min?: number;
  max?: number;
  doubleTapScale?: number;
  /** When any of these deps change, zoom/pan resets (e.g. image index, open flag, tab). */
  resetDeps?: unknown[];
  /** Fires a horizontal swipe direction only while NOT zoomed (scale === 1). */
  onSwipe?: (direction: 'next' | 'prev') => void;
  /** Enable wheel-to-zoom on hover-capable devices (default true). */
  wheel?: boolean;
}

export interface UseZoomPanResult {
  scale: number;
  pos: { x: number; y: number };
  isDragging: boolean;
  isZoomed: boolean;
  reset: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  bind: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onWheel: (e: React.WheelEvent) => void;
    onClick: () => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

const SWIPE_THRESHOLD = 50;
const DOUBLE_PRESS_DELAY = 300;

export function useZoomPan(options: UseZoomPanOptions = {}): UseZoomPanResult {
  const {
    min = 1,
    max = 4,
    doubleTapScale = 2.5,
    resetDeps = [],
    onSwipe,
    wheel = true,
  } = options;

  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const wasDragging = useRef(false);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const lastTap = useRef<number | null>(null);
  const initialPinchDistance = useRef<number | null>(null);
  const initialPinchScale = useRef<number>(1);
  const swipeStartX = useRef(0);
  const swipeEndX = useRef(0);

  const reset = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
    setIsDragging(false);
    wasDragging.current = false;
  }, []);

  // Reset when the tracked deps change (image change / open / close / tab switch).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reset(); }, resetDeps);

  const clamp = useCallback((v: number) => Math.max(min, Math.min(max, v)), [min, max]);

  const zoomIn = useCallback(() => {
    setScale((s) => clamp(s + 0.5));
  }, [clamp]);

  const zoomOut = useCallback(() => {
    setScale((s) => {
      const next = clamp(s - 0.5);
      if (next <= min) setPos({ x: 0, y: 0 });
      return next;
    });
  }, [clamp, min]);

  // ── Mouse drag pan (only when zoomed) ──
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    wasDragging.current = false;
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [scale, pos.x, pos.y]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    wasDragging.current = true;
    setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }, [isDragging, scale]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);
  const onMouseLeave = useCallback(() => setIsDragging(false), []);

  // ── Wheel zoom (centered) ──
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!wheel) return;
    setScale((s) => {
      const next = clamp(s + (e.deltaY < 0 ? 0.2 : -0.2));
      if (next <= min) setPos({ x: 0, y: 0 });
      return next;
    });
  }, [wheel, clamp, min]);

  // ── Double-click / double-tap toggle ──
  const onClick = useCallback(() => {
    if (wasDragging.current) {
      wasDragging.current = false;
      return;
    }
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      if (scale > 1) {
        reset();
      } else {
        setScale(doubleTapScale);
      }
      lastTap.current = null;
    } else {
      lastTap.current = now;
    }
  }, [scale, reset, doubleTapScale]);

  // ── Touch: pinch zoom + one-finger pan (zoomed) / swipe (not zoomed) ──
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.targetTouches.length === 2) {
      const dx = e.targetTouches[0].clientX - e.targetTouches[1].clientX;
      const dy = e.targetTouches[0].clientY - e.targetTouches[1].clientY;
      initialPinchDistance.current = Math.sqrt(dx * dx + dy * dy);
      initialPinchScale.current = scale;
      setIsDragging(false);
    } else if (e.targetTouches.length === 1) {
      if (scale > 1) {
        setIsDragging(true);
        wasDragging.current = false;
        dragStart.current = { x: e.targetTouches[0].clientX - pos.x, y: e.targetTouches[0].clientY - pos.y };
        touchStartPos.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
      } else {
        swipeStartX.current = e.targetTouches[0].clientX;
        swipeEndX.current = 0;
      }
    }
  }, [scale, pos.x, pos.y]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.targetTouches.length === 2 && initialPinchDistance.current !== null) {
      const dx = e.targetTouches[0].clientX - e.targetTouches[1].clientX;
      const dy = e.targetTouches[0].clientY - e.targetTouches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const factor = currentDist / initialPinchDistance.current;
      const next = clamp(initialPinchScale.current * factor);
      setScale(next);
      if (next <= min) setPos({ x: 0, y: 0 });
    } else if (e.targetTouches.length === 1) {
      if (scale > 1) {
        if (!isDragging) return;
        const nx = Math.abs(e.targetTouches[0].clientX - touchStartPos.current.x);
        const ny = Math.abs(e.targetTouches[0].clientY - touchStartPos.current.y);
        if (nx > 5 || ny > 5) wasDragging.current = true;
        setPos({ x: e.targetTouches[0].clientX - dragStart.current.x, y: e.targetTouches[0].clientY - dragStart.current.y });
      } else {
        swipeEndX.current = e.targetTouches[0].clientX;
      }
    }
  }, [scale, isDragging, clamp, min]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.targetTouches.length < 2) initialPinchDistance.current = null;

    if (scale > 1) {
      setIsDragging(false);
      return;
    }
    // Not zoomed → swipe detection
    if (!onSwipe || swipeEndX.current === 0) {
      swipeStartX.current = 0;
      swipeEndX.current = 0;
      return;
    }
    const diff = swipeStartX.current - swipeEndX.current;
    if (diff > SWIPE_THRESHOLD) onSwipe('next');
    else if (diff < -SWIPE_THRESHOLD) onSwipe('prev');
    swipeStartX.current = 0;
    swipeEndX.current = 0;
  }, [scale, onSwipe]);

  return {
    scale,
    pos,
    isDragging,
    isZoomed: scale > 1,
    reset,
    zoomIn,
    zoomOut,
    bind: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
      onWheel,
      onClick,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
