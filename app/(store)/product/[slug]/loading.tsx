import React from 'react';

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-16 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
        <span className="text-gray-300 dark:text-gray-700">/</span>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
        <span className="text-gray-300 dark:text-gray-700">/</span>
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>

      {/* Main Product Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Gallery Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full bg-gray-200 dark:bg-gray-800 rounded-2xl shadow-inner relative overflow-hidden" />
          <div className="flex gap-3 overflow-hidden">
            <div className="h-20 w-20 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="h-20 w-20 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="h-20 w-20 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="h-20 w-20 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
          </div>
        </div>

        {/* Right: Info Skeleton */}
        <div className="flex flex-col gap-5">
          {/* Badge & Rating */}
          <div className="flex items-center gap-3">
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 w-4/5 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 my-2">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>

          <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-1" />

          {/* Variants / Swatches */}
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="flex gap-2">
              <div className="h-9 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              <div className="h-9 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              <div className="h-9 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="h-12 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-12 flex-1 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-12 flex-1 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>

          {/* Trust features */}
          <div className="grid grid-cols-2 gap-3 pt-4 mt-2">
            <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-14 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
