'use client';

import React from 'react';

export type ImageLoadingStyle = 'shimmer' | 'logo_pulse' | 'spinner' | 'pulse_glow' | 'blur_mesh' | 'none';

interface ImageLoadingPlaceholderProps {
  style?: ImageLoadingStyle | string | null;
  logoUrl?: string | null;
  storeName?: string;
  isLoaded: boolean;
  className?: string;
}

/**
 * ImageLoadingPlaceholder — Single Source of Truth for Image Loading Placeholders (RULE SSOT1)
 * 
 * Performance & Visual Standard:
 * 1. ONLY displays while image is downloading/unloaded (`!isLoaded`).
 * 2. As soon as the image loads, smoothly fades out (`opacity-0`) via CSS transition, revealing the image.
 * 3. 100% pure CSS keyframes (transform / opacity on GPU layer). 0% JavaScript loop overhead.
 */
export function ImageLoadingPlaceholder({
  style = 'shimmer',
  logoUrl,
  storeName,
  isLoaded,
  className = '',
}: ImageLoadingPlaceholderProps) {
  const currentStyle = style || 'shimmer';

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 z-[2] overflow-hidden bg-gray-100 dark:bg-[#16162a] transition-opacity duration-300 pointer-events-none select-none flex items-center justify-center ${
        isLoaded ? 'opacity-0' : 'opacity-100'
      } ${className}`}
    >
      {currentStyle === 'shimmer' && (
        <div className="absolute inset-0 w-full h-full img-placeholder-shimmer" />
      )}

      {currentStyle === 'logo_pulse' && (
        <div className="img-placeholder-logo-pulse flex flex-col items-center justify-center max-w-[60%] max-h-[60%] pointer-events-none">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="max-h-10 max-w-full object-contain filter drop-shadow-sm opacity-80"
              loading="eager"
            />
          ) : (
            <span className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {storeName || 'Store'}
            </span>
          )}
        </div>
      )}

      {currentStyle === 'spinner' && (
        <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-700 border-t-[#e94560] img-placeholder-spinner" />
      )}

      {currentStyle === 'pulse_glow' && (
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#e94560]/25 to-purple-500/25 blur-md img-placeholder-pulse-glow" />
      )}

      {currentStyle === 'blur_mesh' && (
        <div className="absolute inset-0 w-full h-full img-placeholder-blur-mesh" />
      )}

      {/* 'none' renders clean static neutral bg with zero animation */}
    </div>
  );
}

export default ImageLoadingPlaceholder;
