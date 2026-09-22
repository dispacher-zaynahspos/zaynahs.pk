'use client';

import React from 'react';

export interface HeroSlide {
  id: string;
  image_url: string;
  video_url?: string;
  video_autoplay?: boolean;
  video_muted?: boolean;
  tagline?: string;
  title?: string;
  subtitle?: string;
  button_text?: string;
  button_link?: string;
  button_secondary_text?: string;
  button_secondary_link?: string;
  mobile_tagline?: string;
  mobile_title?: string;
  mobile_subtitle?: string;
  mobile_button_text?: string;
  mobile_button_link?: string;
  mobile_button_secondary_text?: string;
  mobile_button_secondary_link?: string;
  tablet_tagline?: string;
  tablet_title?: string;
  tablet_subtitle?: string;
  tablet_button_text?: string;
  tablet_button_link?: string;
  tablet_button_secondary_text?: string;
  tablet_button_secondary_link?: string;
}

// Reusable Slider + Number Input control with fixed units and standard presets
export interface NumberSliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: 'px' | '%' | 's';
  onChange: (val: number) => void;
  presets?: { label: string; val: number }[];
}

export function NumberSliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  presets
}: NumberSliderControlProps) {
  // Local state to keep track of user's raw typed text in input
  const [inputValue, setInputValue] = React.useState<string>(value.toString());

  // Sync state whenever the external value changes from other controls (presets, sliders, or database updates)
  React.useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const clampedValue = Math.min(Math.max(value, min), max);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setInputValue(val.toString());
    onChange(val);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setInputValue(rawVal);

    const num = Number(rawVal);
    if (!isNaN(num) && rawVal !== '') {
      const bounded = Math.min(num, max);
      onChange(bounded);
    }
  };

  const handleInputBlur = () => {
    let num = Number(inputValue);
    if (isNaN(num) || inputValue.trim() === '') {
      num = min;
    }
    const finalClamped = Math.min(Math.max(num, min), max);
    setInputValue(finalClamped.toString());
    onChange(finalClamped);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={clampedValue}
          onChange={handleSliderChange}
          className="flex-grow accent-[#e94560] h-1 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer"
        />
        <div className="relative flex items-center w-20 flex-shrink-0">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-full pl-3 pr-7 py-1 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          />
          <span className="absolute right-2 text-[10px] font-bold text-gray-400 uppercase select-none">
            {unit}
          </span>
        </div>
      </div>
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {presets.map(p => (
            <button
              key={p.val}
              type="button"
              onClick={() => {
                setInputValue(p.val.toString());
                onChange(p.val);
              }}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                clampedValue === p.val
                  ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560]'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Reusable Segmented Button Group for alignments and text positioning
export interface ButtonGroupControlProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}

export function ButtonGroupControl({
  label,
  value,
  options,
  onChange
}: ButtonGroupControlProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
        {label}
      </label>
      <div className="flex bg-gray-100 dark:bg-white/5 p-0.5 rounded-xl border border-gray-200 dark:border-gray-800">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              value === opt.value
                ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-sm border border-gray-200/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper functions for parsing CSS unit strings cleanly
export const parsePxValue = (val: any, defaultVal: number): number => {
  if (val === undefined || val === null) return defaultVal;
  const num = parseInt(val.toString().replace('px', '').trim(), 10);
  return isNaN(num) ? defaultVal : num;
};

export const parsePercentValue = (val: any, defaultVal: number): number => {
  if (val === undefined || val === null) return defaultVal;
  const num = parseInt(val.toString().replace('%', '').trim(), 10);
  return isNaN(num) ? defaultVal : num;
};
