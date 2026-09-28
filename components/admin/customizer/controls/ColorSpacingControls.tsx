'use client';

/**
 * Color / Spacing / Alignment controls (Phase 1 foundation).
 */
import React from 'react';
import { ControlRow } from './ControlPrimitives';
import { AlignLeft, AlignCenter, AlignRight, Link as LinkIcon } from '@/components/common/Icons';
import type { Device } from '@/lib/theme-schema';

interface Base {
  label: string;
  help?: string;
  device?: Device;
  overridden?: boolean;
  onResetOverride?: () => void;
}

// ── Color (custom hex + optional opacity + optional theme tokens) ─────────────
export function ColorControl({ label, help, value, onChange, allowOpacity, tokens }: Base & {
  value: string; onChange: (v: string) => void; allowOpacity?: boolean;
  tokens?: Array<{ label: string; value: string }>;
}) {
  // value may be a hex (#rrggbb or #rrggbbaa) or a token string (var(--x)).
  const isToken = typeof value === 'string' && value.startsWith('var(');
  const hex = isToken ? '#000000' : (value || '#000000');
  const base = hex.length >= 7 ? hex.slice(0, 7) : hex;
  const alpha = hex.length === 9 ? Math.round((parseInt(hex.slice(7, 9), 16) / 255) * 100) : 100;

  const setBase = (b: string) => {
    if (allowOpacity && alpha < 100) {
      const a = Math.round((alpha / 100) * 255).toString(16).padStart(2, '0');
      onChange(`${b}${a}`);
    } else {
      onChange(b);
    }
  };
  const setAlpha = (a: number) => {
    const hh = Math.round((a / 100) * 255).toString(16).padStart(2, '0');
    onChange(`${base}${a >= 100 ? '' : hh}`);
  };

  return (
    <ControlRow label={label} help={help} stacked>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-xs font-mono focus:border-blue-500 focus:outline-none min-h-[36px]"
        />
      </div>
      {allowOpacity && !isToken && (
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-gray-400 font-medium w-12">Opacity</span>
          <input type="range" min={0} max={100} value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} className="flex-1 accent-blue-600 cursor-pointer" />
          <span className="text-[10px] text-gray-500 w-8 text-right">{alpha}%</span>
        </div>
      )}
      {tokens && tokens.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {tokens.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer border ${value === t.value ? 'border-blue-500 text-blue-600' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
              title={t.value}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </ControlRow>
  );
}

// ── Spacing (top/right/bottom/left, optionally linked) ────────────────────────
export type SpacingValue = { top: number; right: number; bottom: number; left: number };

export function SpacingControl({ label, help, device, overridden, onResetOverride, value, onChange, min = 0, max = 120, unit = 'px' }: Base & {
  value: Partial<SpacingValue>; onChange: (v: SpacingValue) => void; min?: number; max?: number; unit?: string;
}) {
  const v: SpacingValue = { top: value?.top ?? 0, right: value?.right ?? 0, bottom: value?.bottom ?? 0, left: value?.left ?? 0 };
  const [linked, setLinked] = React.useState(v.top === v.right && v.right === v.bottom && v.bottom === v.left);

  const setSide = (side: keyof SpacingValue, n: number) => {
    if (linked) onChange({ top: n, right: n, bottom: n, left: n });
    else onChange({ ...v, [side]: n });
  };

  const sides: Array<keyof SpacingValue> = ['top', 'right', 'bottom', 'left'];
  return (
    <ControlRow label={label} help={help} device={device} overridden={overridden} onResetOverride={onResetOverride} stacked>
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-4 gap-1.5 flex-1">
          {sides.map((s) => (
            <div key={s} className="flex flex-col items-center gap-0.5">
              <input
                type="number"
                min={min} max={max} value={v[s]}
                onChange={(e) => setSide(s, Number(e.target.value))}
                className="w-full px-1 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a30] text-gray-900 dark:text-white text-xs text-center focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[9px] text-gray-400 uppercase">{s[0]}</span>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLinked((l) => !l)}
          className={`p-1.5 rounded-lg cursor-pointer ${linked ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
          title={linked ? 'Sides linked' : 'Sides independent'}
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] text-gray-400">{unit}</span>
      </div>
    </ControlRow>
  );
}

// ── Alignment (horizontal) ────────────────────────────────────────────────────
export function AlignmentControl({ label, help, device, overridden, onResetOverride, value, onChange }: Base & {
  value: 'left' | 'center' | 'right'; onChange: (v: 'left' | 'center' | 'right') => void;
}) {
  const opts: Array<{ v: 'left' | 'center' | 'right'; Icon: React.ComponentType<{ className?: string }> }> = [
    { v: 'left', Icon: AlignLeft },
    { v: 'center', Icon: AlignCenter },
    { v: 'right', Icon: AlignRight },
  ];
  return (
    <ControlRow label={label} help={help} device={device} overridden={overridden} onResetOverride={onResetOverride}>
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl">
        {opts.map(({ v, Icon }) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`p-1.5 rounded-lg cursor-pointer ${value === v ? 'bg-white dark:bg-[#16162a] text-blue-600 shadow-sm' : 'text-gray-500'}`}
            aria-label={`Align ${v}`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </ControlRow>
  );
}
