'use client';

import React from 'react';
import GridLimitControl from './GridLimitControl';

export interface CatalogLimitControlProps {
  /** 'auto' = columns × rows, 'manual' = exact number. */
  mode?: 'auto' | 'manual';
  onChangeMode: (mode: 'auto' | 'manual') => void;
  /** auto rows per device (1–6) */
  rows?: number;
  onChangeRows: (rows: number) => void;
  /** manual exact count */
  manual?: number;
  onChangeManual: (value: number) => void;
  /** approximate columns, used only to preview "cols × rows = N" in auto mode */
  previewColumns?: number;
  label?: string;
  manualMin?: number;
  manualMax?: number;
  manualStep?: number;
}

/**
 * Shared SSOT limit control (RULE DS24 — per-layout auto/manual limit).
 * Auto mode: limit = columns × rows (changing columns auto-updates the limit).
 * Manual mode: exact number (still rounded up to full rows when Fill rows is ON).
 * Same control in every catalog layout; pairs with resolveLimit() on the storefront.
 */
export default function CatalogLimitControl({
  mode = 'manual',
  onChangeMode,
  rows = 2,
  onChangeRows,
  manual = 8,
  onChangeManual,
  previewColumns = 4,
  label = 'Product Limit',
  manualMin = 2,
  manualMax = 48,
  manualStep = 1,
}: CatalogLimitControlProps) {
  const isAuto = mode === 'auto';
  return (
    <div className="space-y-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
        {label}
      </label>

      {/* Auto / Manual toggle */}
      <div className="grid grid-cols-2 gap-1.5">
        {([
          { key: 'auto', label: 'Auto', desc: 'Columns × rows' },
          { key: 'manual', label: 'Manual', desc: 'Exact number' },
        ] as const).map((m) => {
          const active = (mode || 'manual') === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onChangeMode(m.key)}
              className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                active
                  ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560]'
                  : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="block text-[11px] font-bold">{m.label}</span>
              <span className="block text-[9px] text-gray-400 leading-tight">{m.desc}</span>
            </button>
          );
        })}
      </div>

      {isAuto ? (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
            <span>Rows to show</span>
            <span className="text-[#e94560] font-bold">
              {previewColumns} × {rows} = {previewColumns * rows}
            </span>
          </div>
          <select
            value={rows || 2}
            onChange={(e) => onChangeRows(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            {[1, 2, 3, 4, 5, 6].map((r) => (
              <option key={r} value={r}>
                {r} {r === 1 ? 'Row' : 'Rows'}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gray-400 leading-normal">
            Auto keeps the grid full: the count follows the chosen columns, so rows are always complete.
          </p>
        </div>
      ) : (
        <GridLimitControl
          label="Products to show"
          value={manual || 8}
          onChange={onChangeManual}
          min={manualMin}
          max={manualMax}
          step={manualStep}
        />
      )}
    </div>
  );
}
