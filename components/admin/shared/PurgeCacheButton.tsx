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
    if (settings?.last_vercel_purge) setVercelTime(settings.last_vercel_purge);
    if (settings?.last_cloudflare_purge) setCfTime(settings.last_cloudflare_purge);
  }, [settings?.last_vercel_purge, settings?.last_cloudflare_purge]);

  const handlePurge = async () => {
    try {
      setIsPurging(true);
      const result = await purgeAllCache();
      if (!result.success) {
        toast.error(result.error || 'Failed to purge cache');
        console.error('[PurgeCacheButton] Failed:', result.error);
      } else {
        const vTime = result.data?.vercelTime;
        const cTime = result.data?.cfTime;
        if (vTime) setVercelTime(vTime);
        if (cTime) setCfTime(cTime);
        toast.success(
          `Cache purged across Edge & CDN (A: ${formatTime(vTime || vercelTime)} • B: ${formatTime(cTime || cfTime)})`
        );
        console.log('[PurgeCacheButton] Success:', result);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while purging cache');
      console.error('[PurgeCacheButton] Error:', err);
    } finally {
      setIsPurging(false);
    }
  };

  const baseStyles = "flex items-center justify-center gap-1.5 px-3 h-9 text-xs font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shrink-0 active:scale-95 cursor-pointer";
  const outlineStyles = "bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white shadow-2xs hover:shadow-xs";
  const ghostStyles = "bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] border border-gray-200/80 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:text-gray-950 dark:hover:text-white shadow-2xs hover:shadow-xs";

  const appliedStyles = variant === 'ghost' ? ghostStyles : outlineStyles;
  const tooltipText = `Purge Edge & CDN Cache\nLast purged: A (Vercel): ${formatTime(vercelTime)} | B (Cloudflare): ${formatTime(cfTime)}`;

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 shrink-0 ${className || ''}`}>
      <button
        type="button"
        onClick={handlePurge}
        disabled={isPurging}
        title={tooltipText}
        aria-label="Purge Edge & CDN Cache"
        className={`${baseStyles} ${appliedStyles}`}
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isPurging ? 'animate-spin text-[#e94560]' : 'text-gray-500 dark:text-gray-400'}`} />
        <span className="hidden sm:inline">{isPurging ? 'Purging...' : label}</span>
        <span className="sm:hidden">{isPurging ? 'Purging...' : 'Purge'}</span>
      </button>
      
      {showTimestamps && (
        <div 
          className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-100/70 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 text-[10px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap select-none shrink-0"
          title={`Last cache purge timestamps\nVercel (A): ${formatTime(vercelTime)}\nCloudflare (B): ${formatTime(cfTime)}`}
        >
          <span className="flex items-center gap-1">
            <span className="text-[#e94560] font-black">A:</span> {formatTime(vercelTime)}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
          <span className="flex items-center gap-1">
            <span className="text-blue-500 font-black">B:</span> {formatTime(cfTime)}
          </span>
        </div>
      )}
    </div>
  );
}
