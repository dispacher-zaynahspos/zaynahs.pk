'use client';

import React from 'react';
import { StoreSettings, Product } from '@/lib/types';

interface ProductSaleSubTabProps {
  settings: StoreSettings;
  currentProduct?: Product | null;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
}

export default function ProductSaleSubTab({
  settings,
  currentProduct,
  onUpdateProduct,
}: ProductSaleSubTabProps) {
  if (settings.flash_sale_enabled === false) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-white/2 py-10">
        <span className="text-2xl">🔒</span>
        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          Flash Sale Locked
        </h4>
        <p className="text-[11px] text-gray-500 leading-normal max-w-[200px]">
          This feature is disabled in your store settings. Please enable &quot;Flash Sale Timers&quot;
          in Settings &gt; Premium Tab first.
        </p>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="p-4 text-center text-xs text-gray-500 font-semibold">
        Please navigate to a product details page to set its sale.
      </div>
    );
  }

  const isSaleEnabled = currentProduct.flashSaleEnabled ?? false;
  const discountType = currentProduct.flashSaleDiscountType || 'fixed';
  const discountValue = currentProduct.flashSaleDiscountValue || 0;
  const startTime = currentProduct.flashSaleStartDate
    ? new Date(
        new Date(currentProduct.flashSaleStartDate).getTime() -
          new Date(currentProduct.flashSaleStartDate).getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16)
    : '';
  const endTime = currentProduct.flashSaleEndDate
    ? new Date(
        new Date(currentProduct.flashSaleEndDate).getTime() -
          new Date(currentProduct.flashSaleEndDate).getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16)
    : '';

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
            Enable Sale for this Product
          </span>
          <span className="text-[10px] text-[#e94560] font-bold uppercase tracking-wider">
            {currentProduct.name}
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isSaleEnabled}
            onChange={(e) => onUpdateProduct(currentProduct.id, { flashSaleEnabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      {isSaleEnabled && (
        <div className="border border-gray-200 dark:border-gray-800 p-3.5 rounded-2xl bg-[#e94560]/5 space-y-4">
          <div className="space-y-2.5">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) =>
                  onUpdateProduct(currentProduct.id, {
                    flashSaleDiscountType: e.target.value as any,
                  })
                }
                className="w-full px-2.5 py-2 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rs.)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                Discount Value
              </label>
              <input
                type="number"
                value={discountValue || ''}
                onChange={(e) =>
                  onUpdateProduct(currentProduct.id, {
                    flashSaleDiscountValue: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder={discountType === 'percentage' ? 'e.g. 15' : 'e.g. 200'}
                className="w-full px-2.5 py-2 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) =>
                  onUpdateProduct(currentProduct.id, {
                    flashSaleStartDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
                className="w-full px-2.5 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                End Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) =>
                  onUpdateProduct(currentProduct.id, {
                    flashSaleEndDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : undefined,
                  })
                }
                className="w-full px-2.5 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <p className="text-[10px] text-gray-400 leading-normal italic">
            Note: Start/End Time na select karne pe ye sale infinite active rahegi.
          </p>
        </div>
      )}
    </div>
  );
}
