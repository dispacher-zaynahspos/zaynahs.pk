'use client';

import React from 'react';
import { getResponsiveGridClasses } from '@/lib/utils/responsiveGrid';

interface ProductGridSkeletonProps {
  count?: number;
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  aspectRatioClass?: string;
}

export default function ProductGridSkeleton({
  count = 8,
  columnsDesktop = 4,
  columnsTablet = 3,
  columnsMobile = 2,
  aspectRatioClass = 'aspect-[3/4]',
}: ProductGridSkeletonProps) {
  const gridClasses = getResponsiveGridClasses({
    desktop: columnsDesktop,
    tablet: columnsTablet,
    mobile: columnsMobile,
  });

  return (
    <div className={`grid gap-3 sm:gap-4 lg:gap-5 ${gridClasses}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] p-2.5 sm:p-3 overflow-hidden shadow-xs animate-pulse"
        >
          {/* Image skeleton with shimmer */}
          <div className={`w-full ${aspectRatioClass} rounded-xl bg-gray-200 dark:bg-gray-800/60 relative overflow-hidden mb-3`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-2 px-1">
            <div className="h-3.5 bg-gray-200 dark:bg-gray-800/60 rounded-md w-3/4" />
            <div className="h-3 bg-gray-150 dark:bg-gray-800/40 rounded-md w-1/2" />

            {/* Price & action skeleton */}
            <div className="pt-2 flex items-center justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-800/60 rounded-md w-1/3" />
              <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-800/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
