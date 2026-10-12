'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { formatPrice } from '@/lib/utils/whatsapp';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  step?: number;
  currencySymbol?: string;
  /** called (debounced) when either handle settles */
  onChange: (min: number, max: number) => void;
  onReset?: () => void;
}

/**
 * Shared dual-handle price range slider (RULE SSOT1 — one price filter UI).
 * - Two overlapping range inputs with a filled track between the handles.
 * - Synced numeric min/max inputs; never lets min exceed max.
 * - `step` snapping (default 50); values formatted "Rs 1,750".
 * - Debounced onChange (250ms) so the grid doesn't refilter on every pixel.
 * - Reset button restores full bounds.
 */
export default function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  step = 50,
  currencySymbol = 'Rs',
  onChange,
  onReset,
}: PriceRangeSliderProps) {
  const [localMin, setLocalMin] = useState(valueMin);
  const [localMax, setLocalMax] = useState(valueMax);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local state in sync when parent bounds/values change (e.g. category switch).
  useEffect(() => { setLocalMin(valueMin); }, [valueMin]);
  useEffect(() => { setLocalMax(valueMax); }, [valueMax]);

  const emit = useCallback((lo: number, hi: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(lo, hi), 250);
  }, [onChange]);

  const clampLo = (v: number) => Math.min(Math.max(min, v), localMax - step < min ? localMax : localMax);
  const clampHi = (v: number) => Math.max(Math.min(max, v), localMin);

  const handleLo = (raw: number) => {
    const v = Math.min(clampLo(raw), localMax);
    setLocalMin(v);
    emit(v, localMax);
  };
  const handleHi = (raw: number) => {
    const v = Math.max(clampHi(raw), localMin);
    setLocalMax(v);
    emit(localMin, v);
  };

  const range = Math.max(1, max - min);
  const loPct = ((localMin - min) / range) * 100;
  const hiPct = ((localMax - min) / range) * 100;

  const isDirty = localMin > min || localMax < max;

  return (
    <div className="space-y-3">
      {/* Min / Max numeric inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Min Price</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">{currencySymbol}</span>
            <input
              type="number"
              inputMode="numeric"
              min={min}
              max={localMax}
              step={step}
              value={localMin}
              onChange={(e) => handleLo(Number(e.target.value) || min)}
              className="w-full pl-7 pr-2 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900 focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Max Price</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">{currencySymbol}</span>
            <input
              type="number"
              inputMode="numeric"
              min={localMin}
              max={max}
              step={step}
              value={localMax}
              onChange={(e) => handleHi(Number(e.target.value) || max)}
              className="w-full pl-7 pr-2 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900 focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Dual-handle slider */}
      <div className="relative h-6 px-1 select-none">
        {/* track */}
        <div className="absolute top-1/2 -translate-y-1/2 left-1 right-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800" />
        {/* filled range */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full"
          style={{
            left: `calc(${loPct}% )`,
            right: `calc(${100 - hiPct}%)`,
            backgroundColor: 'var(--color-primary, #C2185B)',
          }}
        />
        {/* low handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={(e) => handleLo(Number(e.target.value))}
          aria-label="Minimum price"
          className="price-range-input absolute left-0 right-0 top-0 w-full h-6 appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: localMin > max - range * 0.1 ? 5 : 3 }}
        />
        {/* high handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={(e) => handleHi(Number(e.target.value))}
          aria-label="Maximum price"
          className="price-range-input absolute left-0 right-0 top-0 w-full h-6 appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: 4 }}
        />
        <style>{`
          .price-range-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            pointer-events: auto;
            height: 16px; width: 16px; border-radius: 9999px;
            background: #fff; border: 2px solid var(--color-primary, #C2185B);
            box-shadow: 0 1px 4px rgba(0,0,0,0.25); cursor: pointer;
          }
          .price-range-input::-moz-range-thumb {
            pointer-events: auto;
            height: 16px; width: 16px; border-radius: 9999px;
            background: #fff; border: 2px solid var(--color-primary, #C2185B);
            box-shadow: 0 1px 4px rgba(0,0,0,0.25); cursor: pointer;
          }
          .price-range-input::-webkit-slider-runnable-track { background: transparent; }
          .price-range-input::-moz-range-track { background: transparent; }
        `}</style>
      </div>

      <div className="flex items-center justify-between text-[10px] font-bold uppercase">
        <span className="text-gray-500 dark:text-gray-400">
          {formatPrice(localMin, currencySymbol)} — {formatPrice(localMax, currencySymbol)}
        </span>
        {isDirty && onReset && (
          <button
            type="button"
            onClick={() => { setLocalMin(min); setLocalMax(max); onReset(); }}
            className="text-[#e94560] hover:underline font-black cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
