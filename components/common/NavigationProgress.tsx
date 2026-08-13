'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
// @ts-ignore — nprogress doesn't ship types, already bundled by nextjs-toploader
import NProgress from 'nprogress';

/**
 * NavigationProgress — Global click listener that starts the NProgress bar
 * for ALL internal <Link> / <a> navigations (categories, shop, etc.).
 *
 * nextjs-toploader only intercepts router.push/replace, NOT <Link> clicks
 * in Next.js App Router. This component fills that gap by:
 *   1. Listening for click events on <a> tags with internal hrefs
 *   2. Calling NProgress.start() immediately on click
 *   3. Calling NProgress.done() when pathname/searchParams actually change
 */
function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // When route changes (pathname or searchParams), finish the progress bar
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // Global click listener to START progress on internal link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip external links, hash links, mailto, tel, javascript
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.startsWith('#')
      ) return;

      // Skip if modifier keys are pressed (new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Skip if target is _blank
      if (anchor.target === '_blank') return;

      // Skip if it's the same exact page
      const currentPath = window.location.pathname + window.location.search;
      if (href === currentPath) return;

      // Start the progress bar!
      NProgress.start();
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);

  return null;
}

export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
