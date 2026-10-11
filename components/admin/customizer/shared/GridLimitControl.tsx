'use client';

import React from 'react';

export interface GridLimitControlProps {
  value?: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Shared SSOT product-limit slider for all catalog/product grids
 * (RULE SSOT-SHARED-FAMILIES Family A). Exact limit — the storefront slices to
 * precisely this count, never rounding up to a full row.
 */
export default function GridLimitControl({
  value = 8,
  onChange,
  label = 'Product Limit',
  min = 2,
  max = 24,
  step = 2,
}: GridLimitControlProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{label}</label>
        <span className="text-xs font-bold text-[#e94560]">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-[#e94560]"
      />
    </div>
  );
}
