'use client';

import React from 'react';

interface LiveViewsConfigProps {
  enableFakeViews: boolean;
  setEnableFakeViews: (val: boolean) => void;
  minViews: number;
  setMinViews: (val: number) => void;
  maxViews: number;
  setMaxViews: (val: number) => void;
}

export default function LiveViewsConfig({
  enableFakeViews,
  setEnableFakeViews,
  minViews,
  setMinViews,
  maxViews,
  setMaxViews,
}: LiveViewsConfigProps) {
  return (
    <div className="space-y-4 border-r border-gray-100 dark:border-gray-800/80 pr-0 md:pr-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
          Enable Live Viewer Counter
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={enableFakeViews}
            onChange={(e) => setEnableFakeViews(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      {enableFakeViews && (
        <div className="grid grid-cols-2 gap-4 pt-2 animate-fade-in">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Minimum Viewers
            </label>
            <input
              type="number"
              min="1"
              value={minViews}
              onChange={(e) => setMinViews(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Maximum Viewers
            </label>
            <input
              type="number"
              min="1"
              value={maxViews}
              onChange={(e) => setMaxViews(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
