'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone } from '@/components/common/Icons';

export interface ResponsiveGridColumnsControlProps {
  label?: string;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  desktopCols: number;
  tabletCols: number;
  mobileCols: number;
  onChangeDesktop: (cols: number) => void;
  onChangeTablet: (cols: number) => void;
  onChangeMobile: (cols: number) => void;
}

export default function ResponsiveGridColumnsControl({
  label = 'Grid Columns per Row',
  viewportMode = 'desktop',
  desktopCols,
  tabletCols,
  mobileCols,
  onChangeDesktop,
  onChangeTablet,
  onChangeMobile,
}: ResponsiveGridColumnsControlProps) {
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>(viewportMode);

  // Sync when topbar device switch changes
  useEffect(() => {
    if (viewportMode) {
      setSelectedDevice(viewportMode);
    }
  }, [viewportMode]);

  return (
    <div className="space-y-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
          {label}
        </label>
        <div className="flex items-center bg-gray-200/80 dark:bg-gray-800 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setSelectedDevice('desktop')}
            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              selectedDevice === 'desktop'
                ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Desktop columns (3-8)"
          >
            <Monitor className="h-3 w-3" />
            <span className="hidden xs:inline">Desk</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedDevice('tablet')}
            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              selectedDevice === 'tablet'
                ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Tablet columns (2-4)"
          >
            <Tablet className="h-3 w-3" />
            <span className="hidden xs:inline">Tab</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedDevice('mobile')}
            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              selectedDevice === 'mobile'
                ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Mobile columns (1-3)"
          >
            <Smartphone className="h-3 w-3" />
            <span className="hidden xs:inline">Mob</span>
          </button>
        </div>
      </div>

      {selectedDevice === 'desktop' && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
            <span>Desktop View (3 to 8 columns)</span>
            <span className="text-[#e94560] font-bold">{desktopCols || 4} cols</span>
          </div>
          <select
            value={desktopCols || 4}
            onChange={(e) => onChangeDesktop(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            {[3, 4, 5, 6, 7, 8].map((c) => (
              <option key={c} value={c}>
                {c} Columns {c === 4 ? '(Standard)' : c === 3 ? '(Wide)' : c >= 6 ? '(Compact)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedDevice === 'tablet' && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
            <span>Tablet View (2 to 4 columns)</span>
            <span className="text-[#e94560] font-bold">{tabletCols || 3} cols</span>
          </div>
          <select
            value={tabletCols || 3}
            onChange={(e) => onChangeTablet(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            {[2, 3, 4].map((c) => (
              <option key={c} value={c}>
                {c} Columns {c === 3 ? '(Standard)' : c === 2 ? '(Wide)' : '(Compact)'}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedDevice === 'mobile' && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
            <span>Mobile View (1 to 3 columns)</span>
            <span className="text-[#e94560] font-bold">{mobileCols || 2} cols</span>
          </div>
          <select
            value={mobileCols || 2}
            onChange={(e) => onChangeMobile(Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
          >
            <option value={1}>1 Column (Single Full Width Card)</option>
            <option value={2}>2 Columns (Standard Grid)</option>
            <option value={3}>3 Columns (Compact Grid)</option>
          </select>
        </div>
      )}
    </div>
  );
}
