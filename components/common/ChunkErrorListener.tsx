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
      
      const reloadKey = 'chunk_reload_lock_active';
      // If already reloaded in this session for a chunk error, do NOT loop again
      if (sessionStorage.getItem(reloadKey)) {
        console.warn('[ChunkErrorListener] Reload already attempted this session. Suppressing infinite reload loop.');
        return;
      }
      
      sessionStorage.setItem(reloadKey, 'true');
      // Clean reload without injecting ?_r= query params into the address bar
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
