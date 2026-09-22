'use client';

import React from 'react';
import { Badge } from '@/lib/types';

interface ProductFormBadgeSectionProps {
  badgeEnabled: boolean;
  setBadgeEnabled: (val: boolean) => void;
  customBadgeId: string;
  setCustomBadgeId: (val: string) => void;
  allBadges: Badge[];
}

export const ProductFormBadgeSection: React.FC<ProductFormBadgeSectionProps> = ({
  badgeEnabled,
  setBadgeEnabled,
  customBadgeId,
  setCustomBadgeId,
  allBadges,
}) => {
  return (
    <div className="bg-white dark:bg-[#16162a] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-3 text-gray-900 dark:text-white transition-colors">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Badge Options</h3>
      <div className="space-y-3">
        <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-[#0f0f1b]/60 hover:bg-gray-100/60 dark:hover:bg-[#0f0f1b] cursor-pointer transition-all">
          <span className="text-xs font-bold text-gray-750 dark:text-gray-200">Enable Badge on Product Card</span>
          <input
            type="checkbox"
            checked={badgeEnabled}
            onChange={(e) => setBadgeEnabled(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </label>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Select Badge</label>
          <select
            value={customBadgeId}
            onChange={(e) => setCustomBadgeId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-[#0f0f1b]/60 px-3 py-1.5 text-xs font-semibold text-gray-800 dark:text-white focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all cursor-pointer"
          >
            <option value="">None (No custom badge)</option>
            {allBadges.map(badge => (
              <option key={badge.id} value={badge.id}>
                {badge.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
