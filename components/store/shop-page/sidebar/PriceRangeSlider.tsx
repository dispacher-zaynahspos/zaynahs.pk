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
 * - Full keyboard & mobile typing support with separate string states (no typing lock).
 * - Two overlapping range inputs with a filled track between the handles.
 * - On-blur & Enter auto-clamping so incomplete typing isn't clamped prematurely.
 * - Debounced onChange (300ms) so the grid doesn't refilter on every keystroke.
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
  const [minInput, setMinInput] = useState(String(valueMin));
  const [maxInput, setMaxInput] = useState(String(valueMax));
  const [isFocusedMin, setIsFocusedMin] = useState(false);
  const [isFocusedMax, setIsFocusedMax] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with parent props when bounds/values change externally (e.g. category switch or reset),
  // but NEVER overwrite the input while the user is actively typing in it!
  useEffect(() => {
    setLocalMin(valueMin);
    if (!isFocusedMin) {
      setMinInput(String(valueMin));
    }
  }, [valueMin, isFocusedMin]);

  useEffect(() => {
    setLocalMax(valueMax);
    if (!isFocusedMax) {
      setMaxInput(String(valueMax));
    }
  }, [valueMax, isFocusedMax]);

  const emit = useCallback((lo: number, hi: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(lo, hi), 300);
  }, [onChange]);

  const emitImmediate = useCallback((lo: number, hi: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onChange(lo, hi);
  }, [onChange]);

  // Handle typing in Min Price input
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^0-9]/g, '');
    setMinInput(rawDigits);

    if (rawDigits === '') return; // Allow user to backspace completely

    const num = parseInt(rawDigits, 10);
    if (!isNaN(num) && num >= min && num <= localMax) {
      setLocalMin(num);
      emit(num, localMax);
    }
  };

  const commitMin = () => {
    setIsFocusedMin(false);
    let num = parseInt(minInput, 10);
    if (isNaN(num) || num < min) {
      num = min;
    } else if (num > localMax) {
      num = localMax;
    }
    setLocalMin(num);
    setMinInput(String(num));
    emitImmediate(num, localMax);
  };

  // Handle typing in Max Price input
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^0-9]/g, '');
    setMaxInput(rawDigits);

    if (rawDigits === '') return; // Allow user to backspace completely

    const num = parseInt(rawDigits, 10);
    if (!isNaN(num) && num <= max && num >= localMin) {
      setLocalMax(num);
      emit(localMin, num);
    }
  };

  const commitMax = () => {
    setIsFocusedMax(false);
    let num = parseInt(maxInput, 10);
    if (isNaN(num) || num > max) {
      num = max;
    } else if (num < localMin) {
      num = localMin;
    }
    setLocalMax(num);
    setMaxInput(String(num));
    emitImmediate(localMin, num);
  };

  // Dual-slider handle changes
  const handleSliderLo = (raw: number) => {
    const val = Math.min(Math.max(min, raw), localMax);
    setLocalMin(val);
    setMinInput(String(val));
    emit(val, localMax);
  };

  const handleSliderHi = (raw: number) => {
    const val = Math.max(Math.min(max, raw), localMin);
    setLocalMax(val);
    setMaxInput(String(val));
    emit(localMin, val);
  };

  const range = Math.max(1, max - min);
  const loPct = ((localMin - min) / range) * 100;
  const hiPct = ((localMax - min) / range) * 100;

  const isDirty = localMin > min || localMax < max;

  return (
    <div className="space-y-3">
      {/* Min / Max numeric inputs with full keyboard & mobile editing support */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Min Price</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">{currencySymbol}</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={minInput}
              onChange={handleMinChange}
              onFocus={() => setIsFocusedMin(true)}
              onBlur={commitMin}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              placeholder={String(min)}
              aria-label="Minimum price in currency"
              className="w-full pl-8 pr-2 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900 focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 text-gray-900 dark:text-white transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Max Price</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">{currencySymbol}</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={maxInput}
              onChange={handleMaxChange}
              onFocus={() => setIsFocusedMax(true)}
              onBlur={commitMax}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              placeholder={String(max)}
              aria-label="Maximum price in currency"
              className="w-full pl-8 pr-2 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-900 focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/20 text-gray-900 dark:text-white transition-colors"
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
          onChange={(e) => handleSliderLo(Number(e.target.value))}
          aria-label="Minimum price"
          className="price-range-input absolute left-0 right-0 top-0 w-full h-6 appearance-none bg-transparent pointer-events-none cursor-pointer"
          style={{ zIndex: localMin > max - range * 0.1 ? 5 : 3 }}
        />
        {/* high handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={(e) => handleSliderHi(Number(e.target.value))}
          aria-label="Maximum price"
          className="price-range-input absolute left-0 right-0 top-0 w-full h-6 appearance-none bg-transparent pointer-events-none cursor-pointer"
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
            onClick={() => {
              setLocalMin(min);
              setLocalMax(max);
              setMinInput(String(min));
              setMaxInput(String(max));
              onReset();
            }}
            className="text-[#e94560] hover:underline font-black cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
