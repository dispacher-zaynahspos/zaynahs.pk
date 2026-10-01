'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Storefront scroll restoration (single source of truth).
 * - Back/forward (popstate): restore the exact saved scroll position, waiting
 *   for content height to be ready (rAF retries + MutationObserver) so a shorter
 *   first paint never clamps the page to the footer.
 * - Fresh navigation (push): scroll to top (or to #hash target if present).
 * Takes over from the browser via history.scrollRestoration = 'manual'.
 */
export default function ScrollRestorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Effect trigger key (reacts to route/query changes).
  const key = `scroll:${pathname}?${searchParams?.toString() ?? ''}`;
  // Live key read from the actual URL — the shop updates the URL via history.replaceState
  // (for instant filtering) which does NOT refresh useSearchParams, so save/restore must
  // key off window.location to stay in sync and land on the exact saved position.
  const liveKey = () =>
    typeof window !== 'undefined'
      ? `scroll:${window.location.pathname}?${window.location.search.replace(/^\?/, '')}`
      : key;
  const isPopRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const cancelRestoreRef = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);

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
      try { sessionStorage.setItem(liveKey(), String(Math.round(window.scrollY))); } catch { /* quota */ }
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

    const saved = isPopRef.current ? sessionStorage.getItem(liveKey()) : null;
    isPopRef.current = false;

    if (saved == null) {
      window.scrollTo(0, 0);
      return;
    }

    const target = parseInt(saved, 10);
    if (!Number.isFinite(target) || target <= 0) { window.scrollTo(0, 0); return; }

    // User scroll cancels restoration — but only if they scroll significantly away from the target area
    const onUserScroll = () => {
      // Only cancel if user scrolled significantly away from the target (±50px)
      if (Math.abs(window.scrollY - target) > 50) {
        cancelRestoreRef.current = true;
      }
    };
    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });

    let tries = 0;
    const maxTries = 300; // ~5s at 60fps — enough for lazy content to fully load

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

    // Also listen for content growth (lazy images, deferred sections) to re-attempt
    const reattempt = () => {
      if (cancelRestoreRef.current) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll >= target) {
        // Content grew enough — try again immediately
        tries = 0;
        rafRef.current = requestAnimationFrame(attempt);
      }
    };

    // MutationObserver for DOM changes (lazy-loaded images, deferred sections)
    const observer = new MutationObserver(() => reattempt());
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
    observerRef.current = observer;

    // Also listen for window load/resize as backup
    window.addEventListener('load', reattempt, { once: true });
    window.addEventListener('resize', reattempt);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchmove', onUserScroll);
      window.removeEventListener('resize', reattempt);
      observer.disconnect();
    };
  }, [key]);

  return null;
}