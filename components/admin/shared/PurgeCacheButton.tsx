'use client';

import React, { useState } from 'react';
import { RefreshCw } from '@/components/common/Icons';
import { toast } from 'sonner';
import { purgeAllCache } from '@/lib/services/cache';

interface PurgeCacheButtonProps {
  className?: string;
  label?: string;
  variant?: 'outline' | 'ghost';
}

export default function PurgeCacheButton({ className, label = 'Purge Cache', variant = 'outline' }: PurgeCacheButtonProps) {
  const [isPurging, setIsPurging] = useState(false);

  const handlePurge = async () => {
    try {
      setIsPurging(true);
      const result = await purgeAllCache();
      if (!result.success) {
        toast.error(result.error || 'Failed to purge cache');
        console.error('[PurgeCacheButton] Failed:', result.error);
      } else {
        toast.success('Cache purged successfully across Edge & CDN');
        console.log('[PurgeCacheButton] Success:', result);
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while purging cache');
      console.error('[PurgeCacheButton] Error:', err);
    } finally {
      setIsPurging(false);
    }
  };

  const baseStyles = "flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none";
  const outlineStyles = "bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:shadow";
  const ghostStyles = "bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white";

  const appliedStyles = variant === 'ghost' ? ghostStyles : outlineStyles;

  return (
    <button
      type="button"
      onClick={handlePurge}
      disabled={isPurging}
      className={`${baseStyles} ${appliedStyles} ${className || ''}`}
    >
      <RefreshCw className={`h-4 w-4 ${isPurging ? 'animate-spin text-[#e94560]' : ''}`} />
      <span>{isPurging ? 'Purging...' : label}</span>
    </button>
  );
}
