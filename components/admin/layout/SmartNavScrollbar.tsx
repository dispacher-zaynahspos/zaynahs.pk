'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SmartNavScrollbarProps {
  containerRef: React.RefObject<HTMLElement | null>;
  className?: string;
  pillHeight?: number; // Compact height in pixels (default 34px)
}

/**
 * 🌟 SmartNavScrollbar
 * Replaces the clunky 16px-wide, 250px-long native browser scrollbar with an
 * ultra-compact, sleek, floating glassmorphic navigation indicator line.
 * - Compact pill height (default: 34px)
 * - Auto-fades when idle, lights up on scroll or touch
 * - Interactive: draggable pill & click-to-jump on track
 */
export function SmartNavScrollbar({
  containerRef,
  className = '',
  pillHeight = 34
}: SmartNavScrollbarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartYRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const updateScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const scrollableDistance = el.scrollHeight - el.clientHeight;
    if (scrollableDistance > 6) {
      setCanScroll(true);
      const progress = Math.max(0, Math.min(1, el.scrollTop / scrollableDistance));
      setScrollProgress(progress);
    } else {
      setCanScroll(false);
    }

    setIsScrolling(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1400);
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScroll();

    el.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateScroll);
      resizeObserver.observe(el);
    }

    return () => {
      el.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
      if (resizeObserver) resizeObserver.disconnect();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [containerRef, updateScroll]);

  // Handle dragging the pill
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    if (containerRef.current) {
      dragStartScrollTopRef.current = containerRef.current.scrollTop;
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const el = containerRef.current;
      const track = trackRef.current;
      if (!el || !track) return;

      const deltaY = e.clientY - dragStartYRef.current;
      const trackHeight = track.clientHeight - pillHeight;
      if (trackHeight <= 0) return;

      const scrollableDistance = el.scrollHeight - el.clientHeight;
      const scrollDelta = (deltaY / trackHeight) * scrollableDistance;
      el.scrollTop = dragStartScrollTopRef.current + scrollDelta;
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, containerRef, pillHeight]);

  // Handle clicking on the track to jump scroll
  const handleTrackClick = (e: React.MouseEvent) => {
    const track = trackRef.current;
    const el = containerRef.current;
    if (!track || !el) return;

    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const trackHeight = track.clientHeight - pillHeight;
    if (trackHeight <= 0) return;

    const targetProgress = Math.max(0, Math.min(1, (clickY - pillHeight / 2) / trackHeight));
    const scrollableDistance = el.scrollHeight - el.clientHeight;
    el.scrollTo({
      top: targetProgress * scrollableDistance,
      behavior: 'smooth'
    });
  };

  if (!canScroll) return null;

  return (
    <div
      ref={trackRef}
      onClick={handleTrackClick}
      className={`absolute right-1 top-2 bottom-2 w-2 z-20 flex flex-col justify-start items-center select-none cursor-pointer group ${className}`}
      title="Scroll"
    >
      {/* Subtle track line */}
      <div className="absolute inset-y-0 w-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors" />

      {/* 🌟 Compact & Smart Navigation Line Pill */}
      <div
        onPointerDown={handlePointerDown}
        style={{
          height: `${pillHeight}px`,
          transform: `translateY(${scrollProgress * (trackRef.current ? trackRef.current.clientHeight - pillHeight : 0)}px)`,
        }}
        className={`w-1.5 rounded-full cursor-grab active:cursor-grabbing transition-all duration-75 ease-out shadow-xs ${
          isDragging || isScrolling
            ? 'bg-white/80 w-2 opacity-100 shadow-[0_0_8px_rgba(255,255,255,0.4)]'
            : 'bg-white/45 hover:bg-white/70 opacity-70 group-hover:opacity-100'
        }`}
      />
    </div>
  );
}
