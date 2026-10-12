'use client';

import React from 'react';

interface TileLabelControlsProps {
  settings: Record<string, string | number | boolean | undefined>;
  onChange: (key: string, value: string | number | boolean) => void;
}

/**
 * Shared SSOT tile label / text controls (RULE DS24 / RULE SSOT-CATALOG-LAYOUTS).
 * Used by every tile layout (Collections Grid, Category Grid, and related banner
 * tile layouts) so label on/off, position, colors, font, and the optional
 * "Shop Now" sub-label are configured identically everywhere — no per-section copies.
 */
export default function TileLabelControls({ settings, onChange }: TileLabelControlsProps) {
  const labelPosition = settings.label_position || 'bottom';
  const showLabels = settings.show_card_labels !== false && labelPosition !== 'none';

  const Toggle = ({ label, value, onToggle }: { label: string; value: boolean; onToggle: (v: boolean) => void }) => (
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer select-none">
        <input type="checkbox" checked={value} onChange={(e) => onToggle(e.target.checked)} className="sr-only peer" />
        <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
      </label>
    </div>
  );

  const ColorRow = ({ label, keyName, placeholder }: { label: string; keyName: string; placeholder?: string }) => (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={(typeof settings[keyName] === 'string' && settings[keyName]) || placeholder || '#ffffff'}
          onChange={(e) => onChange(keyName, e.target.value)}
          className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer overflow-hidden p-0 bg-transparent shrink-0"
        />
        <input
          type="text"
          value={typeof settings[keyName] === 'string' ? settings[keyName] : ''}
          onChange={(e) => onChange(keyName, e.target.value)}
          placeholder={placeholder || 'theme default'}
          className="w-full px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono font-semibold"
        />
        {settings[keyName] && (
          <button
            type="button"
            onClick={() => onChange(keyName, '')}
            className="text-[9px] text-gray-400 hover:text-[#e94560] font-bold uppercase cursor-pointer shrink-0"
            title="Reset"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
        Tile Labels &amp; Text
      </label>

      <Toggle
        label="Show Labels"
        value={showLabels}
        onToggle={(v) => onChange('show_card_labels', v)}
      />

      {showLabels && (
        <>
          {/* Label position */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Label Position</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['top', 'center', 'bottom'] as const).map((pos) => {
                const active = labelPosition === pos;
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => onChange('label_position', pos)}
                    className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold capitalize transition-all cursor-pointer ${
                      active
                        ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560]'
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shop Now sub-label */}
          <Toggle
            label='Show "Shop Now"'
            value={settings.show_shop_now === true}
            onToggle={(v) => onChange('show_shop_now', v)}
          />
          {settings.show_shop_now === true && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Shop Now Text</label>
              <input
                type="text"
                value={typeof settings.shop_now_text === 'string' ? settings.shop_now_text : ''}
                onChange={(e) => onChange('shop_now_text', e.target.value)}
                placeholder="Shop Now"
                className="w-full px-3 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560]"
              />
            </div>
          )}

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <ColorRow label="Label Bg" keyName="label_bg_color" placeholder="#ffffff" />
            <ColorRow label="Text Color" keyName="label_text_color" placeholder="#111111" />
          </div>

          {/* Font family */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">Label Font (optional)</label>
            <input
              type="text"
              value={typeof settings.label_font === 'string' ? settings.label_font : ''}
              onChange={(e) => onChange('label_font', e.target.value)}
              placeholder="inherit (theme font)"
              className="w-full px-3 py-1.5 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#e94560]"
            />
          </div>
        </>
      )}
    </div>
  );
}
