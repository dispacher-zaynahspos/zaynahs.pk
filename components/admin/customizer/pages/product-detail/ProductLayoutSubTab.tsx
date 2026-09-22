'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';

interface ProductLayoutSubTabProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
}

export default function ProductLayoutSubTab({
  settings,
  onUpdateSettings,
}: ProductLayoutSubTabProps) {
  const layout = settings.productPageLayout || [
    'details',
    'ticker',
    'reviews',
    'related',
    'recently_viewed',
    'social_feed',
  ];

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === layout.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newLayout = [...layout];
    const temp = newLayout[index];
    newLayout[index] = newLayout[targetIndex];
    newLayout[targetIndex] = temp;

    onUpdateSettings({ productPageLayout: newLayout });
  };

  const blockLabels: Record<string, string> = {
    details: 'Product Details Component',
    ticker: 'Scrolling Announcement Ticker',
    reviews: 'Reviews & FAQ Feed',
    related: 'Related Products Grid',
    recently_viewed: 'Recently Viewed Products',
    social_feed: 'Social Feed Ribbon',
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
        Product Page Layout Order
      </label>
      <div className="space-y-2">
        {layout.map((block, idx) => (
          <div
            key={block}
            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] rounded-xl shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {blockLabels[block] || block}
              </div>
              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                {block}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => handleMoveBlock(idx, 'up')}
                className="p-1 text-gray-400 hover:text-gray-750 dark:hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                disabled={idx === layout.length - 1}
                onClick={() => handleMoveBlock(idx, 'down')}
                className="p-1 text-gray-400 hover:text-gray-750 dark:hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
