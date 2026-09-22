'use client';

import React from 'react';
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
  return (
    <main className={`flex-grow bg-gray-100 dark:bg-[#0f0f1b]/30 overflow-hidden flex flex-col h-full ${mobileTab !== 'preview' ? 'hidden' : ''} md:flex`}>
      <div 
        ref={previewContainerRef}
        className="flex-1 overflow-auto p-6 flex justify-center items-center h-full"
      >
        {viewportMode === 'desktop' ? (
          (() => {
            const desktopScreenWidth = 1280;
            const desktopScreenHeight = 800;
            const desktopScale = Math.min(
              1,
              (containerWidth - 32) / desktopScreenWidth,
              (containerHeight - 32) / desktopScreenHeight
            );

            return (
              <div
                style={{
                  width: `${desktopScreenWidth * desktopScale}px`,
                  height: `${desktopScreenHeight * desktopScale}px`,
                  transition: 'all 0.3s ease',
                }}
                className="relative mx-auto"
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
                      https://{storeSettings.storeName?.toLowerCase().replace(/\s+/g, '') || 'ourstore'}.pk
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
            const mobileScreenWidth = 375;
            const mobileScreenHeight = 700;
            const mobileMockupWidth = mobileScreenWidth + 24;
            const mobileMockupHeight = mobileScreenHeight + 24;
            const mobileScale = Math.min(
              1,
              (containerWidth - 32) / mobileMockupWidth,
              (containerHeight - 32) / mobileMockupHeight
            );

            return (
              <div
                style={{
                  width: `${mobileMockupWidth * mobileScale}px`,
                  height: `${mobileMockupHeight * mobileScale}px`,
                  transition: 'all 0.3s ease',
                }}
                className="relative mx-auto"
              >
                <div
                  style={{
                    width: `${mobileMockupWidth}px`,
                    height: `${mobileMockupHeight}px`,
                    transform: `scale(${mobileScale})`,
                    transformOrigin: 'top left',
                  }}
                  className="absolute top-0 left-0 overflow-hidden shadow-2xl bg-white dark:bg-[#0f0f1b] rounded-[36px] border-[12px] border-gray-800 dark:border-gray-900 flex flex-col scrollbar-none"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-32 bg-gray-800 dark:bg-gray-900 rounded-b-xl z-50 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 bg-black rounded-full" />
                  </div>
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
            const tabletScreenWidth = 800;
            const tabletScreenHeight = 1024;
            const tabletMockupWidth = tabletScreenWidth + 24;
            const tabletMockupHeight = tabletScreenHeight + 24;
            const tabletScale = Math.min(
              1,
              (containerWidth - 32) / tabletMockupWidth,
              (containerHeight - 32) / tabletMockupHeight
            );

            return (
              <div
                style={{
                  width: `${tabletMockupWidth * tabletScale}px`,
                  height: `${tabletMockupHeight * tabletScale}px`,
                  transition: 'all 0.3s ease',
                }}
                className="relative mx-auto"
              >
                <div
                  style={{
                    width: `${tabletMockupWidth}px`,
                    height: `${tabletMockupHeight}px`,
                    transform: `scale(${tabletScale})`,
                    transformOrigin: 'top left',
                  }}
                  className="absolute top-0 left-0 overflow-hidden shadow-2xl bg-white dark:bg-[#0f0f1b] rounded-[24px] border-[12px] border-gray-800 dark:border-gray-900 flex flex-col"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3 w-16 bg-gray-800 dark:bg-gray-900 rounded-b-lg z-50 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 bg-black rounded-full" />
                  </div>
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
