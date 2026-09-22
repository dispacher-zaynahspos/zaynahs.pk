'use client';

import React from 'react';

interface DesktopPlacementSettingsProps {
  headerDesktopLogoAlign: 'left' | 'center' | 'right';
  setHeaderDesktopLogoAlign: (val: 'left' | 'center' | 'right') => void;
  headerDesktopSearchAlign: 'left' | 'right' | 'hidden';
  setHeaderDesktopSearchAlign: (val: 'left' | 'right' | 'hidden') => void;
  headerDesktopWishlistAlign: 'left' | 'right' | 'hidden';
  setHeaderDesktopWishlistAlign: (val: 'left' | 'right' | 'hidden') => void;
  headerDesktopCartAlign: 'left' | 'right' | 'hidden';
  setHeaderDesktopCartAlign: (val: 'left' | 'right' | 'hidden') => void;
  headerDesktopThemeAlign: 'left' | 'right' | 'hidden';
  setHeaderDesktopThemeAlign: (val: 'left' | 'right' | 'hidden') => void;
}

export default function DesktopPlacementSettings({
  headerDesktopLogoAlign,
  setHeaderDesktopLogoAlign,
  headerDesktopSearchAlign,
  setHeaderDesktopSearchAlign,
  headerDesktopWishlistAlign,
  setHeaderDesktopWishlistAlign,
  headerDesktopCartAlign,
  setHeaderDesktopCartAlign,
  headerDesktopThemeAlign,
  setHeaderDesktopThemeAlign,
}: DesktopPlacementSettingsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Desktop Header Element Placement</h4>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Logo</label>
          <select
            value={headerDesktopLogoAlign}
            onChange={(e) => setHeaderDesktopLogoAlign(e.target.value as any)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-950 dark:text-white"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Search Icon</label>
          <select
            value={headerDesktopSearchAlign}
            onChange={(e) => setHeaderDesktopSearchAlign(e.target.value as any)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Wishlist Icon</label>
          <select
            value={headerDesktopWishlistAlign}
            onChange={(e) => setHeaderDesktopWishlistAlign(e.target.value as any)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Cart Icon</label>
          <select
            value={headerDesktopCartAlign}
            onChange={(e) => setHeaderDesktopCartAlign(e.target.value as any)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Theme Toggle</label>
          <select
            value={headerDesktopThemeAlign}
            onChange={(e) => setHeaderDesktopThemeAlign(e.target.value as any)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>
    </div>
  );
}
