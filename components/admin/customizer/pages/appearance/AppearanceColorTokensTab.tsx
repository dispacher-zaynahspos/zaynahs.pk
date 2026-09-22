'use client';

import React from 'react';
import { ThemeConfig } from '@/lib/types';

interface AppearanceColorTokensTabProps {
  colors: ThemeConfig['colors'];
  updateConfigField: <T extends keyof ThemeConfig>(
    section: T,
    field: keyof ThemeConfig[T],
    value: any
  ) => void;
}

export function AppearanceColorTokensTab({ colors, updateConfigField }: AppearanceColorTokensTabProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Theme Color Tokens</h4>
        <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">Customize theme colors. Colors are double bound to text inputs and previewers.</p>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {[
          { key: 'primary', label: 'Primary (Brand Navy)', desc: 'Header/Footer text, core blocks text' },
          { key: 'secondary', label: 'Secondary (Hover/Dark)', desc: 'General buttons hovers, footer headings' },
          { key: 'accent', label: 'Accent Highlight', desc: 'Banners, sales counters, interactive highlights' },
          { key: 'background', label: 'Body Background', desc: 'Default background behind all layouts' },
          { key: 'surface', label: 'Card Surface', desc: 'Background for category and product cards' },
          { key: 'textPrimary', label: 'Text Primary', desc: 'Body text, titles, text descriptions' },
          { key: 'textSecondary', label: 'Text Secondary (Muted)', desc: 'Muted info, tags list, subtitles' },
          { key: 'textHeading', label: 'Heading Font Color', desc: 'Custom color for all h1-h6 and heading blocks' },
          { key: 'textAccent', label: 'Accent Text Color', desc: 'Custom color for highlighted text elements' },
          { key: 'price', label: 'Price Display Color', desc: 'Custom color for product pricing and price ranges' },
          { key: 'border', label: 'Borders/Dividers', desc: 'Layout segment borders and list dividers' }
        ].map(item => {
          let val = colors[item.key as keyof typeof colors] || '';
          if (!val) {
            if (item.key === 'textHeading') {
              val = colors.textPrimary || colors.primary || '#000000';
            } else if (item.key === 'textAccent') {
              val = colors.accent || '#e94560';
            } else if (item.key === 'price') {
              val = colors.accent || '#e94560';
            } else {
              val = '#000000';
            }
          }
          return (
            <div key={item.key} className="space-y-1 p-2.5 bg-gray-50/50 dark:bg-white/2 rounded-xl border border-gray-100 dark:border-gray-800/80">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold text-gray-700 dark:text-gray-300 leading-none">{item.label}</label>
                <input
                  type="color"
                  value={val}
                  onChange={e => updateConfigField('colors', item.key as any, e.target.value)}
                  className="w-5 h-5 rounded border border-gray-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                />
              </div>
              <input
                type="text"
                value={val}
                onChange={e => updateConfigField('colors', item.key as any, e.target.value)}
                className="w-full mt-1.5 px-2 py-1 bg-white dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 rounded-md text-[10px] uppercase font-bold text-center"
              />
              <span className="text-[8px] text-gray-400 dark:text-gray-500 font-semibold block leading-tight mt-1 truncate">{item.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
