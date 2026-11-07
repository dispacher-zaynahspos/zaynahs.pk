'use client';

import { useEffect } from 'react';

export default function ChunkErrorListener() {
  useEffect(() => {
    // 0. Cleanly strip any legacy _r cache buster parameter from address bar
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('_r')) {
          url.searchParams.delete('_r');
          const cleanUrl = url.pathname + (url.search ? url.search : '') + url.hash;
          window.history.replaceState({}, '', cleanUrl);
        }
      } catch {}
    }

    const isRealChunkError = (errObj?: { name?: string; message?: string }, rawMessage?: string): boolean => {
      if (errObj?.name === 'ChunkLoadError') return true;
      const msg = (errObj?.message || rawMessage || '').toLowerCase();
      if (!msg) return false;
      return (
        msg.includes('chunkloaderror') ||
        (msg.includes('loading chunk') && msg.includes('failed')) ||
        msg.includes('failed to load chunk') ||
        msg.includes('failed to fetch dynamically imported module')
      );
    };

    const handleChunkError = (errObj?: { name?: string; message?: string }, rawMessage?: string) => {
      if (!isRealChunkError(errObj, rawMessage)) return;

      console.warn('[ChunkErrorListener] Genuine ChunkLoadError detected. Attempting single recovery reload...');

      // STRICT PROTECTION: Reload AT MOST ONCE per browser session.
      // If a reload already occurred, NEVER reload again to prevent infinite loops.
      const sessionKey = 'chunk_error_recovered_session';
      try {
        const alreadyReloaded = sessionStorage.getItem(sessionKey);
        if (alreadyReloaded) {
          console.warn('[ChunkErrorListener] Already reloaded once in this session. Suppressing further reloads.');
          return;
        }
        sessionStorage.setItem(sessionKey, '1');
      } catch {}

      // Clean reload without polluting the address bar
      window.location.reload();
    };

    const onError = (event: ErrorEvent | Event) => {
      if ('message' in event) {
        const errorEvent = event as ErrorEvent;
        const errObj = errorEvent.error as { name?: string; message?: string } | undefined;
        handleChunkError(errObj, errorEvent.message);
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason && typeof reason === 'object') {
        handleChunkError(reason as { name?: string; message?: string }, reason.message);
      } else if (typeof reason === 'string') {
        handleChunkError(undefined, reason);
      }
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    // Unregister legacy/stale service workers to prevent stale cache & WebView bugs
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
