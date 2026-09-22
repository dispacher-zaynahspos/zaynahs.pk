'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';

interface ProductCardVisibilitySectionProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
  showStars: boolean;
  showWishlist: boolean;
  showQuickview: boolean;
  showQuickcart: boolean;
}

export function ProductCardVisibilitySection({
  settings,
  onUpdateSettings,
  showStars,
  showWishlist,
  showQuickview,
  showQuickcart,
}: ProductCardVisibilitySectionProps) {
  return (
    <div className="space-y-3 border-t border-gray-150 dark:border-gray-800 pt-5">
      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
        Card Features Visibility
      </label>
      <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-3.5">
        <label className="flex items-center justify-between cursor-pointer select-none text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">Show Rating Stars</span>
          <input
            type="checkbox"
            checked={showStars}
            onChange={e => onUpdateSettings({ card_show_stars: e.target.checked })}
            className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer select-none text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">Show Wishlist Button</span>
          <input
            type="checkbox"
            checked={showWishlist}
            onChange={e => onUpdateSettings({ card_show_wishlist: e.target.checked })}
            className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer select-none text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">Show Quick View Button</span>
          <input
            type="checkbox"
            checked={showQuickview}
            onChange={e => onUpdateSettings({ card_show_quickview: e.target.checked })}
            className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer select-none text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">Show Quick Cart Button</span>
          <input
            type="checkbox"
            checked={showQuickcart}
            onChange={e => onUpdateSettings({ card_show_quickcart: e.target.checked })}
            className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer select-none text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">Show Short Description</span>
          <input
            type="checkbox"
            checked={settings.card_show_description !== false}
            onChange={e => onUpdateSettings({ card_show_description: e.target.checked })}
            className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer select-none text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">Show Variation 1 Swatches</span>
          <input
            type="checkbox"
            checked={settings.card_show_swatches !== false}
            onChange={e => onUpdateSettings({ card_show_swatches: e.target.checked })}
            className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer select-none text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">Show Variation 2 Swatches</span>
          <input
            type="checkbox"
            checked={settings.card_show_sizes !== false}
            onChange={e => onUpdateSettings({ card_show_sizes: e.target.checked })}
            className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer select-none text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">Show Variation 3 Swatches</span>
          <input
            type="checkbox"
            checked={settings.card_show_materials !== false}
            onChange={e => onUpdateSettings({ card_show_materials: e.target.checked })}
            className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer select-none text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">Show Variation 4 Swatches</span>
          <input
            type="checkbox"
            checked={settings.card_show_custom !== false}
            onChange={e => onUpdateSettings({ card_show_custom: e.target.checked })}
            className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer select-none text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">Show Variation 5 Swatches</span>
          <input
            type="checkbox"
            checked={settings.card_show_custom_2 !== false}
            onChange={e => onUpdateSettings({ card_show_custom_2: e.target.checked })}
            className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </label>

        <div className="border-t border-gray-150 dark:border-gray-800 pt-3 mt-3 space-y-3.5">
          <label className="flex items-center justify-between cursor-pointer select-none text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300">Enable Color Swatches</span>
            <input
              type="checkbox"
              checked={settings.card_show_type_color !== false}
              onChange={e => onUpdateSettings({ card_show_type_color: e.target.checked })}
              className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer select-none text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300">Enable Size Swatches</span>
            <input
              type="checkbox"
              checked={settings.card_show_type_size !== false}
              onChange={e => onUpdateSettings({ card_show_type_size: e.target.checked })}
              className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer select-none text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300">Enable Material Swatches</span>
            <input
              type="checkbox"
              checked={settings.card_show_type_material !== false}
              onChange={e => onUpdateSettings({ card_show_type_material: e.target.checked })}
              className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer select-none text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300">Enable Custom Swatches</span>
            <input
              type="checkbox"
              checked={settings.card_show_type_custom !== false}
              onChange={e => onUpdateSettings({ card_show_type_custom: e.target.checked })}
              className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
