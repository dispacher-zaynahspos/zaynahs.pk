import React from 'react';
import { AdminTableSkeleton } from '@/components/common/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 min-h-[80vh]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-7 w-44 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-4 w-60 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="flex gap-2 animate-pulse">
        <div className="h-10 flex-1 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-10 w-36 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
      <AdminTableSkeleton rows={8} />
    </div>
  );
}
