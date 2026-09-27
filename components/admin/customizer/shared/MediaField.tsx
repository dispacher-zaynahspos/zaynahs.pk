'use client';

import React from 'react';
import { Image as ImageIcon } from '@/components/common/Icons';

interface MediaFieldProps {
  /** field label (string or node) */
  label: React.ReactNode;
  /** current URL value */
  value: string;
  /** called on manual text edit */
  onChange: (value: string) => void;
  /** called when the "Select" button opens the media picker */
  onSelect: () => void;
  placeholder?: string;
  /** optional helper text under the field */
  hint?: React.ReactNode;
  /** override label classes (e.g. uppercase variant) */
  labelClassName?: string;
}

/**
 * SINGLE-SOURCE "URL input + Select-from-library" field for the customizer.
 *
 * Replaces the copy-pasted input+button blocks in HeroActiveSlideForm,
 * GlobalSettings (favicon/logo) and elsewhere. `onSelect` should open the one
 * shared MediaSelectorModal (see docs/UI_RULES.md RULE MEDIA1).
 */
export default function MediaField({
  label,
  value,
  onChange,
  onSelect,
  placeholder = 'Image URL',
  hint,
  labelClassName = 'text-[11px] font-bold text-gray-500 dark:text-gray-400 block',
}: MediaFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className={labelClassName}>{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
        <button
          type="button"
          onClick={onSelect}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 hover:dark:bg-white/15 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer whitespace-nowrap"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Select
        </button>
      </div>
      {hint && <span className="text-[9px] text-gray-400 dark:text-gray-500 block mt-1 leading-normal">{hint}</span>}
    </div>
  );
}
