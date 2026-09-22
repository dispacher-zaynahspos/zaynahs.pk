'use client';

import React from 'react';

interface MobilePlacementSettingsProps {
  headerMobileMenuAlign: 'left' | 'right' | 'hidden';
  setHeaderMobileMenuAlign: (val: 'left' | 'right' | 'hidden') => void;
  headerMobileLogoAlign: 'left' | 'center' | 'right';
  setHeaderMobileLogoAlign: (val: 'left' | 'center' | 'right') => void;
  headerMobileSearchAlign: 'left' | 'right' | 'hidden';
  setHeaderMobileSearchAlign: (val: 'left' | 'right' | 'hidden') => void;
  headerMobileCartAlign: 'left' | 'right' | 'hidden';
  setHeaderMobileCartAlign: (val: 'left' | 'right' | 'hidden') => void;
  headerMobileWishlistAlign: 'left' | 'right' | 'hidden';
  setHeaderMobileWishlistAlign: (val: 'left' | 'right' | 'hidden') => void;
}

export default function MobilePlacementSettings({
  headerMobileMenuAlign,
  setHeaderMobileMenuAlign,
  headerMobileLogoAlign,
  setHeaderMobileLogoAlign,
  headerMobileSearchAlign,
  setHeaderMobileSearchAlign,
  headerMobileCartAlign,
  setHeaderMobileCartAlign,
  headerMobileWishlistAlign,
  setHeaderMobileWishlistAlign,
}: MobilePlacementSettingsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Mobile Header Element Placement</h4>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Menu Button</label>
          <select
            value={headerMobileMenuAlign}
            onChange={(e) => setHeaderMobileMenuAlign(e.target.value as any)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Logo</label>
          <select
            value={headerMobileLogoAlign}
            onChange={(e) => setHeaderMobileLogoAlign(e.target.value as any)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs focus:outline-none focus:border-[#e94560] text-gray-955 dark:text-white"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Search Icon</label>
          <select
            value={headerMobileSearchAlign}
            onChange={(e) => setHeaderMobileSearchAlign(e.target.value as any)}
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
            value={headerMobileCartAlign}
            onChange={(e) => setHeaderMobileCartAlign(e.target.value as any)}
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
            value={headerMobileWishlistAlign}
            onChange={(e) => setHeaderMobileWishlistAlign(e.target.value as any)}
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
