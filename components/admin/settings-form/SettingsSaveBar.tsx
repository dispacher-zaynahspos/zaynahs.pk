'use client';

import React from 'react';
import { Save } from '@/components/common/Icons';

interface SettingsSaveBarProps {
  activeTab: string;
  isSubmitting: boolean;
  isPurging: boolean;
  onPurgeCache: () => void;
}

export function SettingsSaveBar({ activeTab, isSubmitting, isPurging, onPurgeCache }: SettingsSaveBarProps) {
  if (activeTab === 'meta_sync') return null;

  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-2xl rounded-t-2xl transition-all">
      <div className="flex items-center justify-between gap-3 max-w-full">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold hidden sm:flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span>Changes apply to: <span className="text-[var(--color-primary,#C2185B)] font-black capitalize">{activeTab}</span> settings</span>
        </span>
        <div className="flex items-center gap-2.5 ml-auto w-full sm:w-auto justify-end">
        {/* Purge All Cache Button */}
        <button
          type="button"
          disabled={isPurging}
          onClick={onPurgeCache}
          className={`relative overflow-hidden flex items-center justify-center gap-1.5 rounded-lg active:scale-95 px-3.5 h-8.5 text-xs font-bold shadow-xs transition-all cursor-pointer border ${
            isPurging
              ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 disabled:cursor-not-allowed'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] text-gray-700 dark:text-gray-300 hover:border-amber-400 dark:hover:border-amber-600 hover:text-amber-600 dark:hover:text-amber-400'
          }`}
        >
          {isPurging ? (
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded-full border-2 border-amber-300 border-t-amber-600 animate-spin" />
              <span>Purging...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              <span className="hidden sm:inline">Purge Cache</span>
            </div>
          )}
        </button>

        {/* Save Settings Button - Dynamic Theme Color */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ backgroundColor: 'var(--color-primary, #C2185B)' }}
          className="relative overflow-hidden flex items-center justify-center gap-2 rounded-lg active:scale-95 text-white px-5 h-8.5 text-xs font-bold shadow-sm hover:brightness-110 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <>
              <Save className="h-3.5 w-3.5 text-white" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
      </div>
    </div>
  );
}
