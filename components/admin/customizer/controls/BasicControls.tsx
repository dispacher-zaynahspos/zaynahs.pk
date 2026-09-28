'use client';

/**
 * Customizer basic controls (Phase 1 foundation).
 * Presentational, controlled components — value in, onChange out.
 */
import React from 'react';
import { ControlRow } from './ControlPrimitives';
import type { Device } from '@/lib/theme-schema';

interface Base {
  label: string;
  help?: string;
  device?: Device;
  overridden?: boolean;
  onResetOverride?: () => void;
}

// ── Toggle ──────────────────────────────────────────────────────────────────
export function ToggleControl({ label, help, device, overridden, onResetOverride, value, onChange }: Base & {
  value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <ControlRow label={label} help={help} device={device} overridden={overridden} onResetOverride={onResetOverride}>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </ControlRow>
  );
}

// ── Text ────────────────────────────────────────────────────────────────────
export function TextControl({ label, help, device, overridden, onResetOverride, value, onChange, placeholder }: Base & {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <ControlRow label={label} help={help} device={device} overridden={overridden} onResetOverride={onResetOverride} stacked>
      <input
        type="text"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[40px]"
      />
    </ControlRow>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function TextareaControl({ label, help, value, onChange, placeholder, rows = 3 }: Base & {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <ControlRow label={label} help={help} stacked>
      <textarea
        value={value ?? ''}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none resize-y"
      />
    </ControlRow>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function SelectControl({ label, help, device, overridden, onResetOverride, value, onChange, options }: Base & {
  value: string; onChange: (v: string) => void; options: Array<{ label: string; value: string }>;
}) {
  return (
    <ControlRow label={label} help={help} device={device} overridden={overridden} onResetOverride={onResetOverride}>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[40px] max-w-[180px]"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </ControlRow>
  );
}

// ── Segmented ─────────────────────────────────────────────────────────────────
export function SegmentedControl({ label, help, device, overridden, onResetOverride, value, onChange, options }: Base & {
  value: string; onChange: (v: string) => void; options: Array<{ label: string; value: string }>;
}) {
  return (
    <ControlRow label={label} help={help} device={device} overridden={overridden} onResetOverride={onResetOverride} stacked>
      <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 min-w-[52px] py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${value === o.value ? 'bg-white dark:bg-[#16162a] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </ControlRow>
  );
}

// ── Slider (+ number + unit + optional presets) ──────────────────────────────
export function SliderControl({ label, help, device, overridden, onResetOverride, value, onChange, min = 0, max = 100, step = 1, unit, presets }: Base & {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string; presets?: number[];
}) {
  const v = typeof value === 'number' ? value : min;
  return (
    <ControlRow label={label} help={help} device={device} overridden={overridden} onResetOverride={onResetOverride} stacked>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min} max={max} step={step} value={v}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-blue-600 cursor-pointer"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min} max={max} step={step} value={v}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-xs text-center focus:border-blue-500 focus:outline-none"
          />
          {unit && <span className="text-[10px] text-gray-400 font-medium w-6">{unit}</span>}
        </div>
      </div>
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${v === p ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
            >
              {p}{unit}
            </button>
          ))}
        </div>
      )}
    </ControlRow>
  );
}

// ── Link (URL) ────────────────────────────────────────────────────────────────
export function LinkControl({ label, help, value, onChange, placeholder = '/shop or https://…' }: Base & {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <ControlRow label={label} help={help} stacked>
      <div className="relative">
        <input
          type="text"
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-3 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none min-h-[40px]"
        />
      </div>
    </ControlRow>
  );
}
