'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from '@/components/common/Icons';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Storefront Error Boundary caught an error:', error);

    // Auto-reload on ChunkLoadError (caused by Vercel/Cloudflare cache mismatch)
    const errString = error.message?.toLowerCase() || error.stack?.toLowerCase() || '';
    if (
      errString.includes('chunkloaderror') || 
      errString.includes('failed to fetch dynamically imported module') ||
      errString.includes('_next/static/chunks')
    ) {
      console.warn('ChunkLoadError detected in Error Boundary. Forcing reload...');
      
      const reloadKey = 'last_chunk_error_reload_boundary';
      const now = Date.now();
      const lastReload = sessionStorage.getItem(reloadKey);
      
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(reloadKey, now.toString());
        // Force a cache-busting reload to bypass max-age=60 browser cache
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('_r', now.toString());
        window.location.href = currentUrl.toString();
      }
    }
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 dark:bg-red-900/20 text-red-500 mb-6 shadow-sm border border-red-100 dark:border-red-900/30">
        <AlertTriangle className="h-10 w-10" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
        This page couldn't load
      </h2>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 font-body leading-relaxed">
        We encountered an unexpected error while loading this page. This usually happens when an update is being rolled out. Reload to try again.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto max-w-xs mx-auto">
        <button
          onClick={() => {
            reset();
            window.location.reload();
          }}
          className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-[#1a1a2e] dark:bg-[#e94560] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" />
          Reload Page
        </button>
        
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold text-sm transition-all active:scale-[0.98]"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 text-left bg-gray-50 dark:bg-gray-900 p-4 rounded-xl max-w-2xl w-full overflow-auto text-xs font-mono text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
          <p className="font-bold mb-2 text-red-500">Developer Error Details:</p>
          <p>{error.message}</p>
          {error.digest && <p className="mt-2 text-gray-400">Digest: {error.digest}</p>}
        </div>
      )}
    </div>
  );
}
