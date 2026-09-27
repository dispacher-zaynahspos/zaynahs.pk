import React from 'react';
import ProductGridSkeleton from '@/components/store/shared/ProductGridSkeleton';

export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-pulse">
      {/* Header Banner & Breadcrumbs Skeleton */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <div className="h-3.5 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="h-4 w-72 bg-gray-150 dark:bg-gray-800/60 rounded" />
      </div>

      {/* Main Grid: Sidebar + List Content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar Skeleton */}
        <aside className="hidden md:block w-64 shrink-0 bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6 self-start">
          <div className="h-5 w-28 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-150 dark:bg-gray-800/60 rounded" />
                <div className="h-4 w-6 bg-gray-150 dark:bg-gray-800/40 rounded-full" />
              </div>
            ))}
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-800" />
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-10 bg-gray-150 dark:bg-gray-800/60 rounded-xl" />
        </aside>

        {/* Right Main Content */}
        <div className="flex-1 space-y-4">
          {/* Quick Category Chips Bar Skeleton */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <div className="h-7 w-24 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="h-7 w-20 rounded-full bg-gray-150 dark:bg-gray-800/60 shrink-0" />
            <div className="h-7 w-28 rounded-full bg-gray-150 dark:bg-gray-800/60 shrink-0" />
            <div className="h-7 w-20 rounded-full bg-gray-150 dark:bg-gray-800/60 shrink-0" />
            <div className="h-7 w-24 rounded-full bg-gray-150 dark:bg-gray-800/60 shrink-0" />
            <div className="h-7 w-16 rounded-full bg-gray-150 dark:bg-gray-800/60 shrink-0" />
          </div>

          {/* Top Controls Bar Skeleton */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800/60">
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="h-8 w-28 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <ProductGridSkeleton count={8} columnsDesktop={4} columnsTablet={3} columnsMobile={2} />
        </div>
      </div>
    </div>
  );
}
