'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_KEY = 'tv_vid';

/**
 * First-party page-view beacon (single source of truth for traffic).
 *
 * Fires ONE lightweight POST to /api/track on every storefront navigation.
 * A random, cookie-less visitor id (localStorage) enables accurate
 * unique-visitor counting without any PII. Admin/api paths are skipped
 * server-side. Fully fire-and-forget — never blocks render.
 */
function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        (crypto?.randomUUID?.() as string) ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

export default function TrafficBeacon() {
  const pathname = usePathname();
  const lastSent = useRef<string>('');

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin')) return;
    // De-dupe rapid re-renders of the same path.
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const payload = JSON.stringify({
      path: pathname,
      visitorId: getVisitorId(),
      referrer: document.referrer || null,
    });

    // Prefer keepalive fetch so it survives navigation/unload.
    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
