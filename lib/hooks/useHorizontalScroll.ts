'use client';

import { useRef, useEffect, useCallback } from 'react';

/**
 * useHorizontalScroll:
 * Enables silky smooth horizontal scrolling across mobile touch and desktop mice.
 * - Supports mouse drag-to-scroll on desktop
 * - Translates vertical wheel to horizontal scroll when hovering over the tab strip
 * - Keeps native WebKit/Android touch momentum without hitching
 * - Provides scrollIntoView helper to center active tabs
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLDivElement>() {
  const scrollRef = useRef<T | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasDragged = false;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT') return;

      isDown = true;
      hasDragged = false;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const onMouseLeave = () => {
      isDown = false;
    };

    const onMouseUp = () => {
      isDown = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.3;
      if (Math.abs(walk) > 4) {
        hasDragged = true;
      }
      el.scrollLeft = scrollLeft - walk;
    };

    const onClickCapture = (e: MouseEvent) => {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
        hasDragged = false;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaX === 0 && Math.abs(e.deltaY) > 0) {
        if (el.scrollWidth > el.clientWidth) {
          el.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    el.addEventListener('click', onClickCapture, true);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('click', onClickCapture, true);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const scrollIntoView = useCallback((childEl?: HTMLElement | null) => {
    if (!childEl || !scrollRef.current) return;
    childEl.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, []);

  return { scrollRef, scrollIntoView };
}
