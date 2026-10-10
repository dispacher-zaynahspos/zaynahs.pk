'use client';

import React, { useState } from 'react';
import { StoreSettings } from '@/lib/types';

interface CustomizerPreviewProps {
  mobileTab: 'preview' | 'sections' | 'settings';
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  containerWidth: number;
  containerHeight: number;
  storeSettings: StoreSettings;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export function CustomizerPreview({
  mobileTab,
  previewContainerRef,
  viewportMode,
  containerWidth,
  containerHeight,
  storeSettings,
  iframeRef,
}: CustomizerPreviewProps) {
  const [mobilePreset, setMobilePreset] = useState<'393' | '412' | '375' | '430'>('393');
  const [scaleMode, setScaleMode] = useState<'fit' | 'real'>('fit');
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  // Modern device specifications (2024-2026 standards)
  const mobileScreenWidth =
    mobilePreset === '430' ? 430 : mobilePreset === '412' ? 412 : mobilePreset === '375' ? 375 : 393;
  const mobileScreenHeight =
    mobilePreset === '430' ? 932 : mobilePreset === '412' ? 915 : mobilePreset === '375' ? 667 : 852;
  const tabletScreenWidth = 820;
  const tabletScreenHeight = 1180;
  const desktopScreenWidth = 1280;
  const desktopScreenHeight = 800;

  const handleZoom = (delta: number) => {
    setZoomPercent((prev) => Math.min(150, Math.max(70, prev + delta)));
  };

  const zoomMultiplier = zoomPercent / 100;

  return (
    <main className={`flex-grow bg-gray-100 dark:bg-[#0f0f1b]/40 overflow-hidden flex flex-col h-full ${mobileTab !== 'preview' ? 'hidden' : ''} md:flex`}>
      {/* Device Calibration Toolbar */}
      <div className="h-10 px-3 md:px-4 bg-white/95 dark:bg-[#16162a]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 flex items-center justify-between text-xs shrink-0 select-none z-10 shadow-2xs gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 shrink-0">Device View:</span>
          {viewportMode === 'mobile' && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg text-[10px] font-bold shrink-0">
              <button
                type="button"
                onClick={() => setMobilePreset('393')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  mobilePreset === '393'
                    ? 'bg-white dark:bg-[#0f0f1b] text-[#e94560] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="iPhone 14 / 15 / 16 (393px standard)"
              >
                iPhone (393px)
              </button>
              <button
                type="button"
                onClick={() => setMobilePreset('412')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  mobilePreset === '412'
                    ? 'bg-white dark:bg-[#0f0f1b] text-[#e94560] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Samsung Galaxy / Pixel (412px)"
              >
                Galaxy (412px)
              </button>
              <button
                type="button"
                onClick={() => setMobilePreset('375')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  mobilePreset === '375'
                    ? 'bg-white dark:bg-[#0f0f1b] text-[#e94560] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Compact Screen (375px)"
              >
                Compact (375px)
              </button>
              <button
                type="button"
                onClick={() => setMobilePreset('430')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  mobilePreset === '430'
                    ? 'bg-white dark:bg-[#0f0f1b] text-[#e94560] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="iPhone Pro Max / Plus (430px)"
              >
                Pro Max (430px)
              </button>
            </div>
          )}
          {viewportMode === 'tablet' && (
            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md shrink-0">
              iPad 10.9&quot; / Air (820px)
            </span>
          )}
          {viewportMode === 'desktop' && (
            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md shrink-0">
              Desktop Standard (1280px)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              type="button"
              onClick={() => handleZoom(-10)}
              className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => setZoomPercent(100)}
              className="px-1.5 py-0.5 text-gray-600 dark:text-gray-300 hover:text-[#e94560] cursor-pointer font-mono"
              title="Reset Zoom to 100%"
            >
              {zoomPercent}%
            </button>
            <button
              type="button"
              onClick={() => handleZoom(10)}
              className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setScaleMode('fit')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                scaleMode === 'fit'
                  ? 'bg-white dark:bg-[#0f0f1b] text-[#e94560] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Fit Viewport (Adaptive)"
            >
              Fit Screen
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('real')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                scaleMode === 'real'
                  ? 'bg-white dark:bg-[#0f0f1b] text-[#e94560] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="100% Real Device 1:1 Pixel Scale (Exact live size)"
            >
              100% Real Size
            </button>
          </div>

          <span className="text-[10px] font-mono text-gray-400 bg-gray-100/60 dark:bg-gray-800/60 px-2 py-0.5 rounded">
            {viewportMode === 'mobile'
              ? `${mobileScreenWidth}×${mobileScreenHeight}`
              : viewportMode === 'tablet'
              ? `${tabletScreenWidth}×${tabletScreenHeight}`
              : `${desktopScreenWidth}×${desktopScreenHeight}`}
          </span>
        </div>
      </div>

      <div 
        ref={previewContainerRef}
        className="flex-1 overflow-auto p-2 md:p-3 flex justify-center items-center h-full"
      >
        {viewportMode === 'desktop' ? (
          (() => {
            const rawScale = Math.min(
              1,
              (containerWidth - 32) / desktopScreenWidth,
              (containerHeight - 56) / desktopScreenHeight
            );
            const desktopScale = scaleMode === 'real' ? zoomMultiplier : Math.max(0.4, rawScale * zoomMultiplier);

            return (
              <div
                style={{
                  width: `${desktopScreenWidth * desktopScale}px`,
                  height: `${desktopScreenHeight * desktopScale}px`,
                  transition: 'all 0.2s ease',
                }}
                className="relative mx-auto my-auto"
              >
                <div
                  style={{
                    width: `${desktopScreenWidth}px`,
                    height: `${desktopScreenHeight}px`,
                    transform: `scale(${desktopScale})`,
                    transformOrigin: 'top left',
                  }}
                  className="absolute top-0 left-0 overflow-hidden shadow-2xl bg-white dark:bg-[#0f0f1b] rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col"
                >
                  <div className="h-8 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-1.5 flex-shrink-0 select-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <div className="ml-4 flex-1 max-w-sm bg-white dark:bg-[#0f0f1b] text-[10px] text-gray-400 rounded px-3 py-0.5 border border-gray-200 dark:border-gray-800 truncate text-center">
                      https://{storeSettings.store_name?.toLowerCase().replace(/\s+/g, '') || 'ourstore'}.pk
                    </div>
                  </div>
                  <iframe
                    ref={iframeRef}
                    src="/admin/settings/customizer/preview"
                    className="flex-grow border-none"
                    style={{
                      width: `${desktopScreenWidth}px`,
                      maxWidth: 'none',
                      height: '100%',
                    }}
                  />
                </div>
              </div>
            );
          })()
        ) : viewportMode === 'mobile' ? (
          (() => {
            const mobileMockupWidth = mobileScreenWidth + 24;
            const mobileMockupHeight = mobileScreenHeight + 24;

            // Available space in preview canvas
            const availW = Math.max(containerWidth - 24, 320);
            const availH = Math.max(containerHeight - 36, 460);

            // In Fit Screen mode, frame height adapts to canvas height (max device height)
            // so that the phone width is NOT artificially crushed to 50% by tall aspect ratio!
            const frameHeight = scaleMode === 'real'
              ? mobileMockupHeight
              : Math.min(availH, mobileMockupHeight);

            // Width scaling: only scale down if container width is narrower than phone mockup
            const fitScaleW = Math.min(1.2, availW / mobileMockupWidth);
            const baseScale = scaleMode === 'real'
              ? 1
              : Math.max(0.85, Math.min(fitScaleW, 1));
            const mobileScale = Math.min(1.4, Math.max(0.7, baseScale * zoomMultiplier));

            return (
              <div
                style={{
                  width: `${mobileMockupWidth * mobileScale}px`,
                  height: `${frameHeight * mobileScale}px`,
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="relative mx-auto my-auto"
              >
                <div
                  style={{
                    width: `${mobileMockupWidth}px`,
                    height: `${frameHeight}px`,
                    transform: `scale(${mobileScale})`,
                    transformOrigin: 'top center',
                  }}
                  className="absolute top-0 left-0 overflow-hidden shadow-2xl bg-white dark:bg-[#0f0f1b] rounded-[38px] border-[12px] border-gray-800 dark:border-gray-900 flex flex-col scrollbar-none"
                >
                  <iframe
                    ref={iframeRef}
                    src="/admin/settings/customizer/preview"
                    className="flex-1 border-none"
                    style={{
                      width: `${mobileScreenWidth}px`,
                      maxWidth: 'none',
                      height: '100%',
                    }}
                  />
                </div>
              </div>
            );
          })()
        ) : (
          (() => {
            const tabletMockupWidth = tabletScreenWidth + 24;
            const tabletMockupHeight = tabletScreenHeight + 24;
            const rawScale = Math.min(
              1,
              (containerWidth - 32) / tabletMockupWidth,
              (containerHeight - 56) / tabletMockupHeight
            );
            const tabletScale = scaleMode === 'real' ? zoomMultiplier : Math.max(0.4, rawScale * zoomMultiplier);

            return (
              <div
                style={{
                  width: `${tabletMockupWidth * tabletScale}px`,
                  height: `${tabletMockupHeight * tabletScale}px`,
                  transition: 'all 0.2s ease',
                }}
                className="relative mx-auto my-auto"
              >
                <div
                  style={{
                    width: `${tabletMockupWidth}px`,
                    height: `${tabletMockupHeight}px`,
                    transform: `scale(${tabletScale})`,
                    transformOrigin: 'top left',
                  }}
                  className="absolute top-0 left-0 overflow-hidden shadow-2xl bg-white dark:bg-[#0f0f1b] rounded-[28px] border-[12px] border-gray-800 dark:border-gray-900 flex flex-col"
                >
                  <iframe
                    ref={iframeRef}
                    src="/admin/settings/customizer/preview"
                    className="flex-1 border-none"
                    style={{
                      width: `${tabletScreenWidth}px`,
                      maxWidth: 'none',
                      height: '100%',
                    }}
                  />
                </div>
              </div>
            );
          })()
        )}
      </div>
    </main>
  );
}
