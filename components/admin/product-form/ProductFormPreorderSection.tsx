'use client';

import React from 'react';
import { Calendar, Clock, Package, AlertCircle } from '@/components/common/Icons';

interface ProductFormPreorderSectionProps {
  isPreorder: boolean;
  setIsPreorder: (val: boolean) => void;
  preorderEndDate: string;
  setPreorderEndDate: (val: string) => void;
  preorderDispatchDate: string;
  setPreorderDispatchDate: (val: string) => void;
  preorderLimit: number | '';
  setPreorderLimit: (val: number | '') => void;
}

export const ProductFormPreorderSection: React.FC<ProductFormPreorderSectionProps> = ({
  isPreorder,
  setIsPreorder,
  preorderEndDate,
  setPreorderEndDate,
  preorderDispatchDate,
  setPreorderDispatchDate,
  preorderLimit,
  setPreorderLimit,
}) => {
  return (
    <div className="bg-white dark:bg-[#16162a] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-3.5 text-gray-900 dark:text-white transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            Pre-Booking / Pre-Order System
          </h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isPreorder
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {isPreorder ? 'ACTIVE' : 'OFF'}
        </span>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none p-2 rounded-xl bg-gray-50/70 dark:bg-[#0f0f1b]/40 border border-gray-200/70 dark:border-gray-800/60 hover:bg-gray-100/50 dark:hover:bg-[#0f0f1b]/70 transition-colors">
        <input
          type="checkbox"
          checked={isPreorder}
          onChange={(e) => setIsPreorder(e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 h-4 w-4 cursor-pointer"
        />
        <div className="flex-1">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
            Enable Pre-Booking for this Product
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-normal">
            Bypasses 0-stock lock, displays pre-booking countdown timer, and tags orders as Pre-Book.
          </span>
        </div>
      </label>

      {isPreorder && (
        <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-800/80">
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/20 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
              <Package className="w-3.5 h-3.5" />
              <span>Pre-Booking Rules & Live Timer</span>
            </div>
            <p className="text-[11px] text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
              Customers can place orders even if stock is 0. Product cards will display a <strong>PRE-ORDER</strong> badge, the button will say <strong>Pre-Book Now</strong>, and a reverse countdown will tick down on the product page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Booking End Date & Time (Timer Deadline)
              </label>
              <input
                type="datetime-local"
                value={preorderEndDate}
                onChange={(e) => setPreorderEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 focus:outline-none transition-all"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">When timer hits 00:00:00, booking closes.</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Expected Shipping / Dispatch Timeline
              </label>
              <input
                type="text"
                placeholder="e.g. Ships on 5th Dec or 7-10 working days"
                value={preorderDispatchDate}
                onChange={(e) => setPreorderDispatchDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 focus:outline-none transition-all"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Shown to customer on product page & confirmation.</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              Max Pre-Order Capacity Limit (Optional)
            </label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 50 (Leave blank for unlimited pre-bookings)"
              value={preorderLimit === '' ? '' : preorderLimit}
              onChange={(e) => setPreorderLimit(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="w-full sm:w-1/2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 focus:outline-none transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};
