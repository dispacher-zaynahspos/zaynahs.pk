import React from 'react';

export default function CartLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a]">
            <div className="h-20 w-20 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-1/4 bg-gray-150 dark:bg-gray-800/60 rounded" />
            </div>
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        ))}
      </div>
      <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}
