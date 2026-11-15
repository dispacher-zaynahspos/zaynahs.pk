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
  const isPastEnd = Boolean(flashSaleEndDate && new Date(flashSaleEndDate).getTime() < Date.now());

  const applyPreset = (days: number) => {
    const start = new Date();
    const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    setFlashSaleStartDate(start.toISOString());
    setFlashSaleEndDate(end.toISOString());
  };

  const clearDates = () => {
    setFlashSaleStartDate('');
    setFlashSaleEndDate('');
  };

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
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure global countdown timer across all products.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const next = !flashSaleEnabled;
            setFlashSaleEnabled(next);
            // If turning ON and end date is expired or missing, auto-preset 7 days
            if (next && (!flashSaleEndDate || isPastEnd)) {
              applyPreset(7);
            }
          }}
          className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 border-2 cursor-pointer ${
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
        {/* Quick Date Presets */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10.5px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-1">Quick End Date:</span>
          {[
            { label: '+24h', days: 1 },
            { label: '+3 Days', days: 3 },
            { label: '+7 Days', days: 7 },
            { label: '+14 Days', days: 14 },
            { label: '+30 Days', days: 30 },
          ].map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.days)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111124] text-gray-700 dark:text-gray-300 hover:border-[#e94560] hover:text-[#e94560] transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={clearDates}
            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            No Expiry (Rolling)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
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
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Global End Date & Time</label>
              {isPastEnd && (
                <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">
                  ⚠️ Date Expired
                </span>
              )}
            </div>
            <input
              type="datetime-local"
              value={flashSaleEndDate ? new Date(new Date(flashSaleEndDate).getTime() - new Date(flashSaleEndDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFlashSaleEndDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
              className={`w-full px-3 py-2 border rounded-xl focus:ring-[#e94560] focus:border-[#e94560] bg-white dark:bg-[#16162a] text-gray-900 dark:text-white text-sm ${
                isPastEnd ? 'border-red-500 dark:border-red-500 bg-red-50/20' : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {isPastEnd && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">
                ⚠️ End date is in the past. Click a preset above (e.g. +7 Days) to activate the sale.
              </p>
            )}
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
              placeholder={globalFlashSaleDiscountType === 'percentage' ? 'e.g. 20 (or blank)' : 'e.g. 500 (or blank)'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#e94560] focus:border-[#e94560] bg-white dark:bg-[#16162a] text-gray-900 dark:text-white text-sm"
            />
            <p className="text-[10px] text-gray-400 mt-0.5">
              💡 Leave blank or 0 to show flash sale timer using each product&apos;s existing compare price.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-1">
        {flashSaleEnabled ? (
          isPastEnd ? (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400">
              ⚠️ Flash sale toggle is ON, but the End Date has expired. Please select a future date above (or click a quick preset like +7 Days).
            </div>
          ) : (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-xl text-xs font-semibold text-green-700 dark:text-green-300">
              ⚡ Flash sale is ACTIVE — applies to ALL products storewide and displays countdown timer to customers. Overrides individual product flash sales.
            </div>
          )
        ) : (
          <p className="text-[10px] text-gray-500">
            ⏸️ Flash sale is OFF — toggle ON to activate storewide discount and countdown timer.
          </p>
        )}
      </div>
    </div>
  );
}
