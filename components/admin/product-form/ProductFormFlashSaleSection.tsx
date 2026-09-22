'use client';

import React from 'react';

interface ProductFormFlashSaleSectionProps {
  flashSaleEnabled: boolean;
  setFlashSaleEnabled: (val: boolean) => void;
  flashSaleStartDate: string;
  setFlashSaleStartDate: (val: string) => void;
  flashSaleEndDate: string;
  setFlashSaleEndDate: (val: string) => void;
  flashSaleDiscountType: 'percentage' | 'fixed';
  setFlashSaleDiscountType: (val: 'percentage' | 'fixed') => void;
  flashSaleDiscountValue: number;
  setFlashSaleDiscountValue: (val: number) => void;
}

export const ProductFormFlashSaleSection: React.FC<ProductFormFlashSaleSectionProps> = ({
  flashSaleEnabled,
  setFlashSaleEnabled,
  flashSaleStartDate,
  setFlashSaleStartDate,
  flashSaleEndDate,
  setFlashSaleEndDate,
  flashSaleDiscountType,
  setFlashSaleDiscountType,
  flashSaleDiscountValue,
  setFlashSaleDiscountValue,
}) => {
  return (
    <div className="bg-white dark:bg-[#16162a] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-3 text-gray-900 dark:text-white transition-colors">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Flash Sale Settings</h3>
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={flashSaleEnabled}
            onChange={(e) => setFlashSaleEnabled(e.target.checked)}
            className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-3.5 w-3.5"
          />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Flash Sale for Product</span>
        </label>

        {flashSaleEnabled && (
          <div className="space-y-3">
            {/* Discount Settings */}
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/10 p-3 space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">💰 Discount Against Compare Price</p>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Discount Type</label>
                  <select
                    value={flashSaleDiscountType}
                    onChange={(e) => setFlashSaleDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="fixed">Fixed Amount (Rs.)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                    {flashSaleDiscountType === 'percentage' ? 'Discount (%)' : 'Discount Amount (Rs.)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={flashSaleDiscountType === 'percentage' ? 100 : undefined}
                    step={flashSaleDiscountType === 'percentage' ? 1 : 10}
                    value={flashSaleDiscountValue}
                    onChange={(e) => setFlashSaleDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:outline-none transition-all"
                    placeholder={flashSaleDiscountType === 'percentage' ? 'e.g. 20' : 'e.g. 200'}
                  />
                </div>
              </div>
              <div className="flex items-start gap-1.5 pt-0.5">
                <span className="text-xs shrink-0 mt-0.5">ℹ️</span>
                <p className="text-[10.5px] leading-relaxed text-amber-700 dark:text-amber-300 font-semibold">
                  Sale ends automatically when timer expires — original prices restore everywhere.
                </p>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={flashSaleStartDate}
                  onChange={(e) => setFlashSaleStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  value={flashSaleEndDate}
                  onChange={(e) => setFlashSaleEndDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
