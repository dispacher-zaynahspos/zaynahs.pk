'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Storefront scroll restoration (single source).
 * - Back/forward (popstate): restore the exact saved scroll position, waiting
 *   for content height to be ready (rAF retries, ~1s cap) so a shorter first
 *   paint never clamps the page to the footer.
 * - Fresh navigation (push): scroll to top (or to #hash target if present).
 * Takes over from the browser via history.scrollRestoration = 'manual'.
 */
export default function ScrollRestorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = `scroll:${pathname}?${searchParams?.toString() ?? ''}`;
  const isPopRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const cancelRestoreRef = useRef(false);

  // Take manual control of scroll restoration
  useEffect(() => {
    if (typeof history === 'undefined' || !('scrollRestoration' in history)) return;
    const prev = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => { history.scrollRestoration = prev; };
  }, []);

  // Detect back/forward navigations
  useEffect(() => {
    const onPop = () => { isPopRef.current = true; };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Continuously save current scroll for the current URL
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const save = () => {
      try { sessionStorage.setItem(key, String(Math.round(window.scrollY))); } catch { /* quota */ }
    };
    const onScroll = () => { clearTimeout(t); t = setTimeout(save, 120); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', save);
    return () => {
      save();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', save);
      clearTimeout(t);
    };
  }, [key]);

  // On URL change: restore (back/forward) or reset (fresh navigation)
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    cancelRestoreRef.current = false;

    // Anchor link: let the browser/app jump to the element
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) { el.scrollIntoView(); isPopRef.current = false; return; }
    }

    const saved = isPopRef.current ? sessionStorage.getItem(key) : null;
    isPopRef.current = false;

    if (saved == null) {
      window.scrollTo(0, 0);
      return;
    }

    const target = parseInt(saved, 10);
    if (!Number.isFinite(target) || target <= 0) { window.scrollTo(0, 0); return; }

    // User scroll cancels restoration
    const onUserScroll = () => { cancelRestoreRef.current = true; };
    window.addEventListener('wheel', onUserScroll, { passive: true, once: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true, once: true });

    let tries = 0;
    const maxTries = 60; // ~1s at 60fps
    const attempt = () => {
      if (cancelRestoreRef.current) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(target, Math.max(0, maxScroll)));
      tries++;
      const reached = Math.abs(window.scrollY - target) <= 2;
      const contentReady = maxScroll >= target;
      if ((!reached || !contentReady) && tries < maxTries) {
        rafRef.current = requestAnimationFrame(attempt);
      }
    };
    rafRef.current = requestAnimationFrame(attempt);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchmove', onUserScroll);
    };
  }, [key]);

  return null;
}
