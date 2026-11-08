'use client';

import { useEffect } from 'react';

export default function ChunkErrorListener() {
  useEffect(() => {
    const handleChunkError = (message?: string) => {
      if (!message) return;
      const lower = message.toLowerCase();
      // Strictly match actual chunk loading errors, never generic stack traces or scripts
      const isChunkError =
        lower.includes('chunkloaderror') ||
        lower.includes('loading chunk') ||
        lower.includes('failed to load chunk') ||
        lower.includes('failed to fetch dynamically imported module');

      if (!isChunkError) return;

      console.warn('[ChunkErrorListener] Genuine chunk load error detected! Checking reload guard...');
      
      const reloadKey = 'chunk_last_reload_time';
      const lastReload = Number(sessionStorage.getItem(reloadKey) || 0);
      const now = Date.now();
      
      // If already reloaded in the last 15 seconds, suppress rapid infinite reload loop
      if (now - lastReload < 15000) {
        console.warn('[ChunkErrorListener] Reload already attempted within last 15s. Suppressing rapid loop.');
        return;
      }
      
      sessionStorage.setItem(reloadKey, String(now));
      // Force reload to fetch fresh HTML document referencing latest chunk hashes
      window.location.reload();
    };

    const onError = (event: ErrorEvent | Event) => {
      // 1. Script tag load failure (e.g. 404 on hashed chunk)
      if ('target' in event && event.target instanceof HTMLScriptElement) {
        const src = event.target.src || '';
        if (src.includes('/_next/static/chunks/') && event.type === 'error') {
          handleChunkError(`ChunkLoadError: Failed to load script chunk ${src}`);
          return;
        }
      }
      // 2. ErrorEvent check
      if ('message' in event) {
        const errorEvent = event as ErrorEvent;
        const errObj = errorEvent.error as { name?: string; message?: string } | undefined;
        if (errObj?.name === 'ChunkLoadError' || errorEvent.message?.includes('ChunkLoadError')) {
          handleChunkError(errorEvent.message || errObj?.message);
        }
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const name = reason?.name;
      const message = reason?.message || reason?.toString?.();
      if (name === 'ChunkLoadError' || message?.includes('ChunkLoadError')) {
        handleChunkError(message);
      }
    };

    // Note: useCapture=true is required because script element errors DO NOT BUBBLE.
    window.addEventListener('error', onError, true);
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
      window.removeEventListener('error', onError, true);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
