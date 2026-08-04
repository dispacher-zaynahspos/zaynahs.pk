import React, { RefObject } from 'react';
import { formatPrice } from '@/lib/utils/whatsapp';

interface PriceRangeFilterProps {
  priceMin: number;
  priceMax: number;
  priceLimits: { min: number; max: number };
  setPriceMin: (val: number) => void;
  setPriceMax: (val: number) => void;
  currencySymbol: string;
  sliderRef: RefObject<HTMLInputElement | null>;
}

export default function PriceRangeFilter({
  priceMin,
  priceMax,
  priceLimits,
  setPriceMin,
  setPriceMax,
  currencySymbol,
  sliderRef
}: PriceRangeFilterProps) {
  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Price Range</span>

      {/* Min/Max Text inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Min Price</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">Rs</span>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPriceMin(val >= 0 ? val : 0);
              }}
              className="w-full pl-7 pr-2 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900 focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Max Price</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">Rs</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPriceMax(val >= 0 ? val : 0);
              }}
              className="w-full pl-7 pr-2 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900 focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Double Range Slider UI */}
      <div className="pt-3 px-1">
        <input
          ref={sliderRef as React.LegacyRef<HTMLInputElement>}
          type="range"
          min={priceLimits.min}
          max={priceLimits.max}
          value={priceMax}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= priceMin) {
              setPriceMax(val);
            }
          }}
          className="w-full accent-[#e94560] h-1 bg-gray-200 dark:bg-gray-800 rounded-lg cursor-pointer appearance-none"
        />
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mt-1.5 uppercase">
          <span>Price: {formatPrice(priceMin, currencySymbol)} — {formatPrice(priceMax, currencySymbol)}</span>
        </div>
      </div>
    </div>
  );
}
