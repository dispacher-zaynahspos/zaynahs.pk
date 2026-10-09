'use client';

import { useEffect } from 'react';

export default function ChunkErrorListener() {
  useEffect(() => {
    const handleChunkError = (message?: string) => {
      if (!message) return;
      const lower = message.toLowerCase();
      if (
        lower.includes('chunkloaderror') ||
        lower.includes('loading chunk') ||
        lower.includes('failed to load chunk') ||
        lower.includes('failed to fetch dynamically imported module') ||
        lower.includes('load chunk') ||
        lower.includes('_next/static/chunks')
      ) {
        console.warn('[ChunkErrorListener] Chunk load error detected! Reloading page to fetch latest build...');
        
        // Use session storage to prevent infinite reloading loop
        const reloadKey = 'last_chunk_error_reload';
        const now = Date.now();
        const lastReload = sessionStorage.getItem(reloadKey);
        
        // Only allow reload if the last one was more than 10 seconds ago
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem(reloadKey, now.toString());
          // Force a cache-busting reload to bypass stale browser cache
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('_r', now.toString());
          window.location.href = currentUrl.toString();
        }
      }
    };

    const onError = (event: ErrorEvent | Event) => {
      // 1. Check for resource load failure on <script> tags (capture phase)
      if ('target' in event && event.target instanceof HTMLScriptElement) {
        const src = event.target.src || '';
        if (src.includes('_next/static/chunks') || src.includes('/_next/static/')) {
          handleChunkError(`_next/static/chunks load failed: ${src}`);
          return;
        }
      }
      // 2. Check for ErrorEvent message or error
      if ('message' in event) {
        handleChunkError((event as ErrorEvent).message || (event as any).error?.message || (event as any).error?.toString?.());
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason?.message || reason?.toString?.();
      handleChunkError(message);
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
