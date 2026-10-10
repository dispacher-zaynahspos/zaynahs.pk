'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/lib/types';
import { Monitor, Tablet, Smartphone } from '@/components/common/Icons';
import {
  SWATCH_SIZE_SCALE,
  SWATCH_SHAPE_SCALE,
  SWATCH_ALIGN_SCALE,
  SwatchSize,
  SwatchShape,
  SwatchAlign,
} from '@/lib/constants/productCardOptions';

export interface ResponsiveArchiveSwatchControlProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
  hideHeaderToggle?: boolean;
}

export function ResponsiveArchiveSwatchControl({
  settings,
  onUpdateSettings,
  viewportMode = 'desktop',
  hideHeaderToggle = false,
}: ResponsiveArchiveSwatchControlProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>(viewportMode);

  useEffect(() => {
    if (viewportMode) {
      setDevice(viewportMode);
    }
  }, [viewportMode]);

  // Read device-specific or inherited values
  const currentLimit =
    device === 'desktop'
      ? (settings.swatch_limit_desktop ?? settings.swatch_limit ?? 8)
      : device === 'tablet'
      ? (settings.swatch_limit_tablet ?? settings.swatch_limit ?? 6)
      : (settings.swatch_limit_mobile ?? settings.swatch_limit ?? 4);

  const currentSize =
    device === 'desktop'
      ? (settings.archive_swatch_size_desktop ?? settings.archive_swatch_size ?? 'md')
      : device === 'tablet'
      ? (settings.archive_swatch_size_tablet ?? settings.archive_swatch_size ?? 'md')
      : (settings.archive_swatch_size_mobile ?? settings.archive_swatch_size ?? 'sm');

  const currentAlign =
    device === 'desktop'
      ? (settings.archive_swatch_align_desktop ?? settings.archive_swatch_align ?? 'left')
      : device === 'tablet'
      ? (settings.archive_swatch_align_tablet ?? settings.archive_swatch_align ?? 'left')
      : (settings.archive_swatch_align_mobile ?? settings.archive_swatch_align ?? 'left');

  const handleUpdateLimit = (val: number) => {
    if (device === 'desktop') onUpdateSettings({ swatch_limit_desktop: val, swatch_limit: val });
    else if (device === 'tablet') onUpdateSettings({ swatch_limit_tablet: val });
    else onUpdateSettings({ swatch_limit_mobile: val });
  };

  const handleUpdateSize = (val: SwatchSize) => {
    if (device === 'desktop') onUpdateSettings({ archive_swatch_size_desktop: val, archive_swatch_size: val });
    else if (device === 'tablet') onUpdateSettings({ archive_swatch_size_tablet: val });
    else onUpdateSettings({ archive_swatch_size_mobile: val });
  };

  const handleUpdateAlign = (val: SwatchAlign) => {
    if (device === 'desktop') onUpdateSettings({ archive_swatch_align_desktop: val, archive_swatch_align: val });
    else if (device === 'tablet') onUpdateSettings({ archive_swatch_align_tablet: val });
    else onUpdateSettings({ archive_swatch_align_mobile: val });
  };

  return (
    <div className="space-y-4">
      {/* Enable toggle */}
      {!hideHeaderToggle && (
        <label className="flex items-center justify-between cursor-pointer select-none text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300">Enable Variant Swatches</span>
          <input
            type="checkbox"
            checked={settings.enable_variant_swatches !== false}
            onChange={(e) => onUpdateSettings({ enable_variant_swatches: e.target.checked })}
            className="rounded border-gray-350 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4 cursor-pointer"
          />
        </label>
      )}

      {(hideHeaderToggle || settings.enable_variant_swatches !== false) && (
        <div className={`space-y-4 ${hideHeaderToggle ? '' : 'border-t border-gray-100 dark:border-gray-800 pt-3'}`}>
          {/* Swatch Shape */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
              Archive Swatch Shape
            </label>
            <div className="flex gap-2">
              {SWATCH_SHAPE_SCALE.map((shape) => {
                const isActive = (settings.swatch_shape || 'circle') === shape;
                return (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => onUpdateSettings({ swatch_shape: shape as SwatchShape })}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560] font-black'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-500 bg-white dark:bg-[#16162a]'
                    }`}
                  >
                    {shape === 'circle' ? 'Circle' : 'Square / Box'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device Tabs Bar */}
          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                Responsive Card Swatches
              </label>
              <div className="flex items-center bg-gray-200/80 dark:bg-gray-800 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setDevice('desktop')}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    device === 'desktop'
                      ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Desktop controls"
                >
                  <Monitor className="h-3 w-3" />
                  <span className="hidden xs:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('tablet')}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    device === 'tablet'
                      ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Tablet controls"
                >
                  <Tablet className="h-3 w-3" />
                  <span className="hidden xs:inline">Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('mobile')}
                  className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    device === 'mobile'
                      ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Mobile controls"
                >
                  <Smartphone className="h-3 w-3" />
                  <span className="hidden xs:inline">Mobile</span>
                </button>
              </div>
            </div>

            {/* Active Device Indicator */}
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400 capitalize bg-white dark:bg-[#16162a] px-2.5 py-1 rounded-lg border border-gray-150 dark:border-gray-800">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e94560]" />
              <span>Editing: <strong className="text-gray-800 dark:text-gray-200">{device} view</strong></span>
            </div>

            {/* Swatch Limit for Active Device */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Swatch Limit ({device})
                </label>
                <span className="text-[10px] font-bold text-[#e94560]">{currentLimit} swatches</span>
              </div>
              <select
                value={currentLimit}
                onChange={(e) => handleUpdateLimit(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                  <option key={num} value={num}>{num} swatches on {device}</option>
                ))}
              </select>
            </div>

            {/* Swatch Size for Active Device */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
                Swatch Size ({device})
              </label>
              <div className="grid grid-cols-7 gap-1">
                {SWATCH_SIZE_SCALE.map((size) => {
                  const isActive = currentSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleUpdateSize(size)}
                      className={`py-1.5 rounded-lg border text-[9px] font-black uppercase transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560] shadow-xs'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-500 bg-white dark:bg-[#16162a]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Swatch Alignment for Active Device */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
                Swatch Alignment ({device})
              </label>
              <div className="flex gap-2">
                {SWATCH_ALIGN_SCALE.map((align) => {
                  const isActive = currentAlign === align;
                  return (
                    <button
                      key={align}
                      type="button"
                      onClick={() => handleUpdateAlign(align)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560] font-black shadow-xs'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-500 bg-white dark:bg-[#16162a]'
                      }`}
                    >
                      {align}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface ResponsiveProductDetailSwatchControlProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
}

export function ResponsiveProductDetailSwatchControl({
  settings,
  onUpdateSettings,
  viewportMode = 'desktop',
}: ResponsiveProductDetailSwatchControlProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>(viewportMode);

  useEffect(() => {
    if (viewportMode) {
      setDevice(viewportMode);
    }
  }, [viewportMode]);

  const currentSize =
    device === 'desktop'
      ? (settings.product_swatch_size_desktop ?? settings.product_swatch_size ?? 'md')
      : device === 'tablet'
      ? (settings.product_swatch_size_tablet ?? settings.product_swatch_size ?? 'md')
      : (settings.product_swatch_size_mobile ?? settings.product_swatch_size ?? 'md');

  const currentAlign =
    device === 'desktop'
      ? (settings.product_swatch_align_desktop ?? settings.product_swatch_align ?? 'left')
      : device === 'tablet'
      ? (settings.product_swatch_align_tablet ?? settings.product_swatch_align ?? 'left')
      : (settings.product_swatch_align_mobile ?? settings.product_swatch_align ?? 'left');

  const currentShape = settings.product_swatch_shape || settings.swatch_shape || 'circle';

  const handleUpdateSize = (val: SwatchSize) => {
    if (device === 'desktop') onUpdateSettings({ product_swatch_size_desktop: val, product_swatch_size: val });
    else if (device === 'tablet') onUpdateSettings({ product_swatch_size_tablet: val });
    else onUpdateSettings({ product_swatch_size_mobile: val });
  };

  const handleUpdateAlign = (val: SwatchAlign) => {
    if (device === 'desktop') onUpdateSettings({ product_swatch_align_desktop: val, product_swatch_align: val });
    else if (device === 'tablet') onUpdateSettings({ product_swatch_align_tablet: val });
    else onUpdateSettings({ product_swatch_align_mobile: val });
  };

  return (
    <div className="space-y-4">
      {/* PDP Swatch Shape */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
          Product Page Swatch Shape
        </label>
        <div className="flex gap-2">
          {SWATCH_SHAPE_SCALE.map((shape) => {
            const isActive = currentShape === shape;
            return (
              <button
                key={shape}
                type="button"
                onClick={() => onUpdateSettings({ product_swatch_shape: shape as SwatchShape })}
                className={`flex-1 py-2 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#e94560] bg-[#e94560]/5 text-[#e94560] font-black'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-500 bg-white dark:bg-[#16162a]'
                }`}
              >
                {shape === 'circle' ? 'Circle' : 'Square / Box'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Device Tabs Bar */}
      <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
            Responsive PDP Swatches
          </label>
          <div className="flex items-center bg-gray-200/80 dark:bg-gray-800 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                device === 'desktop'
                  ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Desktop controls"
            >
              <Monitor className="h-3 w-3" />
              <span className="hidden xs:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                device === 'tablet'
                  ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Tablet controls"
            >
              <Tablet className="h-3 w-3" />
              <span className="hidden xs:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                device === 'mobile'
                  ? 'bg-white dark:bg-[#16162a] text-[#e94560] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Mobile controls"
            >
              <Smartphone className="h-3 w-3" />
              <span className="hidden xs:inline">Mobile</span>
            </button>
          </div>
        </div>

        {/* Active Device Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400 capitalize bg-white dark:bg-[#16162a] px-2.5 py-1 rounded-lg border border-gray-150 dark:border-gray-800">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e94560]" />
          <span>Editing: <strong className="text-gray-800 dark:text-gray-200">{device} view</strong></span>
        </div>

        {/* PDP Swatch Size for Active Device */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
            Product Swatch Size ({device})
          </label>
          <div className="grid grid-cols-7 gap-1">
            {SWATCH_SIZE_SCALE.map((size) => {
              const isActive = currentSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleUpdateSize(size)}
                  className={`py-1.5 rounded-lg border text-[9px] font-black uppercase transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560] shadow-xs'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-500 bg-white dark:bg-[#16162a]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* PDP Swatch Alignment for Active Device */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
            Options & Swatches Alignment ({device})
          </label>
          <div className="flex gap-2">
            {SWATCH_ALIGN_SCALE.map((align) => {
              const isActive = currentAlign === align;
              return (
                <button
                  key={align}
                  type="button"
                  onClick={() => handleUpdateAlign(align)}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560] font-black shadow-xs'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-500 bg-white dark:bg-[#16162a]'
                  }`}
                >
                  {align}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
