'use client';

import React from 'react';
import { Zap } from '@/components/common/Icons';

interface PremiumFlashSaleCardProps {
  flashSaleEnabled: boolean;
  setFlashSaleEnabled: (v: boolean) => void;
  flashSaleStartDate: string;
  setFlashSaleStartDate: (v: string) => void;
  flashSaleEndDate: string;
  setFlashSaleEndDate: (v: string) => void;
  globalFlashSaleDiscountType: 'percentage' | 'fixed';
  setGlobalFlashSaleDiscountType: (v: 'percentage' | 'fixed') => void;
  globalFlashSaleDiscountValue: number;
  setGlobalFlashSaleDiscountValue: (v: number) => void;
}

export function PremiumFlashSaleCard({
  flashSaleEnabled,
  setFlashSaleEnabled,
  flashSaleStartDate,
  setFlashSaleStartDate,
  flashSaleEndDate,
  setFlashSaleEndDate,
  globalFlashSaleDiscountType,
  setGlobalFlashSaleDiscountType,
  globalFlashSaleDiscountValue,
  setGlobalFlashSaleDiscountValue,
}: PremiumFlashSaleCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
      {/* Header row with Enable/Disable toggle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#e94560]/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-[#e94560]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Storewide Flash Sale</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure global countdown timer.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFlashSaleEnabled(!flashSaleEnabled)}
          className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 border-2 ${
            flashSaleEnabled
              ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${flashSaleEnabled ? 'bg-white' : 'bg-gray-400'}`} />
          {flashSaleEnabled ? '⚡ SALE ON' : 'SALE OFF'}
        </button>
      </div>

      {/* Fields — dimmed when disabled */}
      <div className={`space-y-4 transition-opacity duration-200 ${flashSaleEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Global Start Date & Time</label>
            <input
              type="datetime-local"
              value={flashSaleStartDate ? new Date(new Date(flashSaleStartDate).getTime() - new Date(flashSaleStartDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFlashSaleStartDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#e94560] focus:border-[#e94560] bg-white dark:bg-[#16162a] text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Global End Date & Time</label>
            <input
              type="datetime-local"
              value={flashSaleEndDate ? new Date(new Date(flashSaleEndDate).getTime() - new Date(flashSaleEndDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFlashSaleEndDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#e94560] focus:border-[#e94560] bg-white dark:bg-[#16162a] text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Global Discount Type</label>
            <select
              value={globalFlashSaleDiscountType}
              onChange={(e) => setGlobalFlashSaleDiscountType(e.target.value as 'percentage' | 'fixed')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#e94560] focus:border-[#e94560] bg-white dark:bg-[#16162a] text-gray-900 dark:text-white text-sm"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (Rs.)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Global Discount Value</label>
            <input
              type="number"
              value={globalFlashSaleDiscountValue || ''}
              onChange={(e) => setGlobalFlashSaleDiscountValue(parseFloat(e.target.value) || 0)}
              placeholder={globalFlashSaleDiscountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#e94560] focus:border-[#e94560] bg-white dark:bg-[#16162a] text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 mt-1">
        {flashSaleEnabled
          ? '✅ Flash sale is ACTIVE — overrides individual product sales and shows countdown timer to customers.'
          : '⏸️ Flash sale is OFF — toggle ON to activate storewide discount and countdown timer.'}
      </p>
    </div>
  );
}
