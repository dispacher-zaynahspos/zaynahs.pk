import React from 'react';
import { Loader2 } from '@/components/common/Icons';

export default function GlobalLoading() {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
      <Loader2 className="h-10 w-10 animate-spin text-[#e94560]" />
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  );
}
