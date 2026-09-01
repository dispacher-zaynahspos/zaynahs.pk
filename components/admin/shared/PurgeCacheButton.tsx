'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw } from '@/components/common/Icons';
import { toast } from 'sonner';
import { purgeAllCache } from '@/lib/services/cache';
import { useSettings } from '@/lib/hooks/useSettings';

interface PurgeCacheButtonProps {
  className?: string;
  label?: string;
  variant?: 'outline' | 'ghost';
  showTimestamps?: boolean;
}

const formatTime = (isoString?: string) => {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function PurgeCacheButton({ className, label = 'Purge Cache', variant = 'outline', showTimestamps = true }: PurgeCacheButtonProps) {
  const [isPurging, setIsPurging] = useState(false);
  const { settings } = useSettings();
  
  const [vercelTime, setVercelTime] = useState<string | undefined>();
  const [cfTime, setCfTime] = useState<string | undefined>();

  useEffect(() => {
    if (settings?.lastVercelPurge) setVercelTime(settings.lastVercelPurge);
    if (settings?.lastCloudflarePurge) setCfTime(settings.lastCloudflarePurge);
  }, [settings?.lastVercelPurge, settings?.lastCloudflarePurge]);

  const handlePurge = async () => {
    try {
      setIsPurging(true);
      const result = await purgeAllCache();
      if (!result.success) {
        toast.error(result.error || 'Failed to purge cache');
        console.error('[PurgeCacheButton] Failed:', result.error);
      } else {
        toast.success('Cache purged successfully across Edge & CDN');
        if (result.data?.vercelTime) setVercelTime(result.data.vercelTime);
        if (result.data?.cfTime) setCfTime(result.data.cfTime);
        console.log('[PurgeCacheButton] Success:', result);
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while purging cache');
      console.error('[PurgeCacheButton] Error:', err);
    } finally {
      setIsPurging(false);
    }
  };

  const baseStyles = "flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
  const outlineStyles = "bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:shadow";
  const ghostStyles = "bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white";

  const appliedStyles = variant === 'ghost' ? ghostStyles : outlineStyles;

  return (
    <div className={`flex flex-col items-center justify-center gap-1 ${className || ''}`}>
      <button
        type="button"
        onClick={handlePurge}
        disabled={isPurging}
        className={`${baseStyles} ${appliedStyles} w-full`}
      >
        <RefreshCw className={`h-4 w-4 ${isPurging ? 'animate-spin text-[#e94560]' : ''}`} />
        <span>{isPurging ? 'Purging...' : label}</span>
      </button>
      
      {showTimestamps && (
        <div className="flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap opacity-80 uppercase tracking-wider">
          <span className="flex items-center gap-1" title="Vercel (A) Last Purge">
            <span className="text-[#e94560] font-bold">A:</span> {formatTime(vercelTime)}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
          <span className="flex items-center gap-1" title="Cloudflare (B) Last Purge">
            <span className="text-blue-500 font-bold">B:</span> {formatTime(cfTime)}
          </span>
        </div>
      )}
    </div>
  );
}
