'use client';

import React from 'react';

interface HeaderPaletteSettingsProps {
  popularSearches: string;
  setPopularSearches: (val: string) => void;
  headerTopBarBg: string;
  setHeaderTopBarBg: (val: string) => void;
  headerTopBarTextColor: string;
  setHeaderTopBarTextColor: (val: string) => void;
  headerBg: string;
  setHeaderBg: (val: string) => void;
  headerTextColor: string;
  setHeaderTextColor: (val: string) => void;
  headerBorderColor: string;
  setHeaderBorderColor: (val: string) => void;
}

export default function HeaderPaletteSettings({
  popularSearches,
  setPopularSearches,
  headerTopBarBg,
  setHeaderTopBarBg,
  headerTopBarTextColor,
  setHeaderTopBarTextColor,
  headerBg,
  setHeaderBg,
  headerTextColor,
  setHeaderTextColor,
  headerBorderColor,
  setHeaderBorderColor,
}: HeaderPaletteSettingsProps) {
  return (
    <>
      {/* Popular Searches Config */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Popular Search Suggestions</h4>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Popular Searches (Comma-separated)
          </label>
          <input
            type="text"
            value={popularSearches}
            onChange={(e) => setPopularSearches(e.target.value)}
            placeholder="e.g. Co-ord Sets, Sonic, Graphic Tee, T-shirt, Kids"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          />
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Enter keywords separated by commas. These will appear in the search popup modal on the storefront under "Popular Searches".
          </p>
        </div>
      </div>

      <hr className="border-gray-100 dark:border-gray-800" />

      {/* Part 4: Header Aesthetics & Styling */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Header Color Palette Customizer</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Color Item */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
              <input
                type="color"
                value={headerTopBarBg}
                onChange={(e) => setHeaderTopBarBg(e.target.value)}
                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Top Bar Background</label>
              <input
                type="text"
                value={headerTopBarBg}
                onChange={(e) => setHeaderTopBarBg(e.target.value)}
                className="mt-0.5 w-full bg-transparent border-0 border-b border-gray-200 dark:border-gray-850 focus:border-[#e94560] focus:ring-0 text-xs font-mono font-semibold text-gray-900 dark:text-white p-0"
              />
            </div>
          </div>

          {/* Color Item */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
              <input
                type="color"
                value={headerTopBarTextColor}
                onChange={(e) => setHeaderTopBarTextColor(e.target.value)}
                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Top Bar Text / Icons</label>
              <input
                type="text"
                value={headerTopBarTextColor}
                onChange={(e) => setHeaderTopBarTextColor(e.target.value)}
                className="mt-0.5 w-full bg-transparent border-0 border-b border-gray-200 dark:border-gray-850 focus:border-[#e94560] focus:ring-0 text-xs font-mono font-semibold text-gray-900 dark:text-white p-0"
              />
            </div>
          </div>

          {/* Color Item */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
              <input
                type="color"
                value={headerBg}
                onChange={(e) => setHeaderBg(e.target.value)}
                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Header Background</label>
              <input
                type="text"
                value={headerBg}
                onChange={(e) => setHeaderBg(e.target.value)}
                className="mt-0.5 w-full bg-transparent border-0 border-b border-gray-200 dark:border-gray-850 focus:border-[#e94560] focus:ring-0 text-xs font-mono font-semibold text-gray-900 dark:text-white p-0"
              />
            </div>
          </div>

          {/* Color Item */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
              <input
                type="color"
                value={headerTextColor}
                onChange={(e) => setHeaderTextColor(e.target.value)}
                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Header Text / Icons</label>
              <input
                type="text"
                value={headerTextColor}
                onChange={(e) => setHeaderTextColor(e.target.value)}
                className="mt-0.5 w-full bg-transparent border-0 border-b border-gray-200 dark:border-gray-850 focus:border-[#e94560] focus:ring-0 text-xs font-mono font-semibold text-gray-900 dark:text-white p-0"
              />
            </div>
          </div>

          {/* Color Item */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
              <input
                type="color"
                value={headerBorderColor}
                onChange={(e) => setHeaderBorderColor(e.target.value)}
                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Header Border Color</label>
              <input
                type="text"
                value={headerBorderColor}
                onChange={(e) => setHeaderBorderColor(e.target.value)}
                className="mt-0.5 w-full bg-transparent border-0 border-b border-gray-200 dark:border-gray-850 focus:border-[#e94560] focus:ring-0 text-xs font-mono font-semibold text-gray-900 dark:text-white p-0"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
