'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone } from '@/components/common/Icons';

export interface ResponsiveProductsPerPageControlProps {
  label?: string;
  description?: string;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  desktopLimit: number;
  tabletLimit: number;
  mobileLimit: number;
  onChangeDesktop: (val: number) => void;
  onChangeTablet: (val: number) => void;
  onChangeMobile: (val: number) => void;
  desktopPresets?: number[];
  tabletPresets?: number[];
  mobilePresets?: number[];
  desktopMin?: number;
  desktopMax?: number;
  tabletMin?: number;
  tabletMax?: number;
  mobileMin?: number;
  mobileMax?: number;
}

const DEFAULT_DESKTOP_PRESETS = [4, 6, 8, 10, 12, 16, 20, 24];
const DEFAULT_TABLET_PRESETS = [4, 6, 8, 10, 12, 16];
const DEFAULT_MOBILE_PRESETS = [4, 6, 8, 10, 12, 16];

/**
 * Shared SSOT Products per Page Limit Control (RULE SSOT-CATALOG-LAYOUTS / RULE DS24).
 * Provides responsive per-device limits (Desktop, Tablet, Mobile) for initial catalog display
 * and consistent Load More / Infinite Scroll batch increments across all storefront grids.
 */
export default function ResponsiveProductsPerPageControl({
  label = 'Products per Page Limit',
  description = 'Number of products shown initially and loaded on each "Load More" click or infinite scroll batch per device.',
  viewportMode = 'desktop',
  desktopLimit,
  tabletLimit,
  mobileLimit,
  onChangeDesktop,
  onChangeTablet,
  onChangeMobile,
  desktopPresets = DEFAULT_DESKTOP_PRESETS,
  tabletPresets = DEFAULT_TABLET_PRESETS,
  mobilePresets = DEFAULT_MOBILE_PRESETS,
  desktopMin = 2,
  desktopMax = 48,
  tabletMin = 2,
  tabletMax = 36,
  mobileMin = 2,
  mobileMax = 24,
}: ResponsiveProductsPerPageControlProps) {
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>(viewportMode || 'desktop');

  // Sync device view when Customizer topbar device toggle changes
  useEffect(() => {
    if (viewportMode) {
      setSelectedDevice(viewportMode);
    }
  }, [viewportMode]);

  const currentLimit =
    selectedDevice === 'desktop'
      ? desktopLimit || 12
      : selectedDevice === 'tablet'
      ? tabletLimit || 8
      : mobileLimit || 6;

  return (
    <div className="space-y-2.5 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
      {/* Header with Device Switcher */}
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
            title="Desktop limit"
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
            title="Tablet limit"
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
            title="Mobile limit"
          >
            <Smartphone className="h-3 w-3" />
            <span className="hidden xs:inline">Mob</span>
          </button>
        </div>
      </div>

      {/* Desktop Device Panel */}
      {selectedDevice === 'desktop' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold">
            <span>Desktop Batch Limit</span>
            <span className="text-xs font-black text-[#e94560]">{currentLimit} products</span>
          </div>
          <input
            type="range"
            min={desktopMin}
            max={desktopMax}
            step="1"
            value={currentLimit}
            onChange={(e) => onChangeDesktop(parseInt(e.target.value, 10))}
            className="w-full accent-[#e94560] cursor-pointer"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {desktopPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeDesktop(preset)}
                className={`flex-1 min-w-[36px] py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                  currentLimit === preset
                    ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560] font-black'
                    : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#16162a]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tablet Device Panel */}
      {selectedDevice === 'tablet' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold">
            <span>Tablet Batch Limit</span>
            <span className="text-xs font-black text-[#e94560]">{currentLimit} products</span>
          </div>
          <input
            type="range"
            min={tabletMin}
            max={tabletMax}
            step="1"
            value={currentLimit}
            onChange={(e) => onChangeTablet(parseInt(e.target.value, 10))}
            className="w-full accent-[#e94560] cursor-pointer"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tabletPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeTablet(preset)}
                className={`flex-1 min-w-[36px] py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                  currentLimit === preset
                    ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560] font-black'
                    : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#16162a]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Device Panel */}
      {selectedDevice === 'mobile' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold">
            <span>Mobile Batch Limit</span>
            <span className="text-xs font-black text-[#e94560]">{currentLimit} products</span>
          </div>
          <input
            type="range"
            min={mobileMin}
            max={mobileMax}
            step="1"
            value={currentLimit}
            onChange={(e) => onChangeMobile(parseInt(e.target.value, 10))}
            className="w-full accent-[#e94560] cursor-pointer"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {mobilePresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeMobile(preset)}
                className={`flex-1 min-w-[36px] py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                  currentLimit === preset
                    ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560] font-black'
                    : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-[#16162a]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {description && (
        <p className="text-[10px] text-gray-400 leading-normal">
          {description}
        </p>
      )}
    </div>
  );
}
