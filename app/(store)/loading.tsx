import React from 'react';
import ProductGridSkeleton from '@/components/store/shared/ProductGridSkeleton';

export default function StoreFrontLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="w-full aspect-[21/9] min-h-[180px] sm:min-h-[280px] md:min-h-[380px] rounded-2xl bg-gray-200 dark:bg-gray-800/80 shadow-xs relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
      </div>

      {/* Category Circles / Horizontal Slider Skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-36 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-12 bg-gray-150 dark:bg-gray-800/60 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products Section Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-44 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-4 w-16 bg-gray-150 dark:bg-gray-800/60 rounded" />
        </div>
        <ProductGridSkeleton count={8} columnsDesktop={4} columnsTablet={3} columnsMobile={2} />
      </div>
    </div>
  );
}
