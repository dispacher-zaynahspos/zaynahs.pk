'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { StoreSettings } from '@/lib/types';

// ── Device Specs ──────────────────────────────────────────────────────────────
// mockupW/H = image pixel dimensions (from sips)
// screenInset = percentage of mockup image that is bezel (not screen)
// cssW/H = the CSS px the iframe should render at (so breakpoints fire correctly)
const MOBILE_DEVICES = {
  iphone18pm: {
    label: 'iPhone 18 PM',
    tip: 'Apple iPhone 18 Pro Max — 440 CSS px',
    img: '/devices/mockup-apple-iphone-18-pro-max.webp',
    mockupW: 389, mockupH: 800,
    // screen insets as % of mockup image
    insetTop: 0.088, insetBottom: 0.058, insetLeft: 0.048, insetRight: 0.048,
    cssW: 440,
  },
  s26ultra: {
    label: 'S26 Ultra',
    tip: 'Samsung Galaxy S26 Ultra — 412 CSS px',
    img: '/devices/mockup-samsung-galaxy-s26-ultra.webp',
    mockupW: 385, mockupH: 800,
    insetTop: 0.035, insetBottom: 0.030, insetLeft: 0.030, insetRight: 0.030,
    cssW: 412,
  },
  pixel12pro: {
    label: 'Pixel 12 Pro',
    tip: 'Google Pixel 12 Pro XL — 412 CSS px',
    img: '/devices/mockup-samsung-galaxy-s26-ultra.webp', // reuse until dedicated asset
    mockupW: 385, mockupH: 800,
    insetTop: 0.035, insetBottom: 0.030, insetLeft: 0.030, insetRight: 0.030,
    cssW: 412,
  },
} as const;
type MobileKey = keyof typeof MOBILE_DEVICES;

// Tablet: iPad Pro 11 image = 578×800
const TABLET_DEVICE = {
  img: '/devices/mockup-apple-ipad-pro-11.webp',
  mockupW: 578, mockupH: 800,
  insetTop: 0.048, insetBottom: 0.032, insetLeft: 0.040, insetRight: 0.040,
  cssW: 834,
};

// Desktop: MacBook Neo image = 800×488
const DESKTOP_DEVICE = {
  img: '/devices/mockup-apple-macbook-neo-2026-transparent.webp',
  mockupW: 800, mockupH: 488,
  insetTop: 0.058, insetBottom: 0.295, insetLeft: 0.075, insetRight: 0.075,
  cssW: 1440,
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface CustomizerPreviewProps {
  mobileTab: 'preview' | 'sections' | 'settings';
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  containerWidth: number;
  containerHeight: number;
  storeSettings: StoreSettings;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

// ── DeviceMockup ─────────────────────────────────────────────────────────────
interface MockupSpec {
  img: string;
  mockupW: number; mockupH: number;
  insetTop: number; insetBottom: number; insetLeft: number; insetRight: number;
  cssW: number;
}
function DeviceMockup({
  spec, scale, iframeRef, iframeSrc,
}: {
  spec: MockupSpec;
  scale: number;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  iframeSrc: string;
}) {
  const { mockupW, mockupH, insetTop, insetBottom, insetLeft, insetRight, cssW } = spec;

  // At 1× the mockup fills this many CSS px
  const scaledW = mockupW * scale;
  const scaledH = mockupH * scale;

  // Screen area at scaled size (px)
  const sTop    = insetTop    * scaledH;
  const sBottom = insetBottom * scaledH;
  const sLeft   = insetLeft   * scaledW;
  const sRight  = insetRight  * scaledW;
  const screenW  = scaledW - sLeft  - sRight;
  const screenH  = scaledH - sTop   - sBottom;

  // Iframe renders at exact CSS device width; scale it to fit the screen hole
  const iframeScale = screenW / cssW;

  return (
    <div style={{ position: 'relative', width: scaledW, height: scaledH, flexShrink: 0 }}>
      {/* Iframe behind mockup, positioned at screen hole */}
      <div style={{
        position: 'absolute',
        top: sTop, left: sLeft,
        width: screenW, height: screenH,
        overflow: 'hidden',
        borderRadius: 4,
      }}>
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="border-none"
          style={{
            width: cssW,
            height: screenH / iframeScale,
            transform: `scale(${iframeScale})`,
            transformOrigin: 'top left',
            display: 'block',
            maxWidth: 'none',
          }}
          title="Preview"
        />
      </div>

      {/* Device image overlay — sits ON TOP, pointer-events none */}
      <Image
        src={spec.img}
        alt="Device mockup"
        width={mockupW}
        height={mockupH}
        style={{
          position: 'absolute',
          inset: 0,
          width: scaledW,
          height: scaledH,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        priority
        unoptimized
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function CustomizerPreview({
  mobileTab,
  previewContainerRef,
  viewportMode,
  containerWidth,
  containerHeight,
  storeSettings,
  iframeRef,
}: CustomizerPreviewProps) {
  const [mobileKey, setMobileKey] = useState<MobileKey>('iphone18pm');
  const [scaleMode, setScaleMode] = useState<'fit' | 'real'>('fit');
  const [zoom, setZoom]           = useState(100);

  const nudgeZoom = useCallback((d: number) =>
    setZoom(z => Math.min(200, Math.max(50, z + d))), []);
  const handleScaleMode = useCallback((m: 'fit' | 'real') => {
    setScaleMode(m); setZoom(100);
  }, []);

  const PAD = 20;
  const TOOLBAR_H = 40;
  const canvasW = Math.max(containerWidth  - PAD * 2, 280);
  const canvasH = Math.max(containerHeight - TOOLBAR_H - PAD * 2, 400);
  const zm = zoom / 100;

  // autoFit: scale mockup image to fill canvas while keeping aspect ratio, never upscale
  function autoFit(imgW: number, imgH: number) {
    return Math.min(canvasW / imgW, canvasH / imgH, 1);
  }

  const mob  = MOBILE_DEVICES[mobileKey];
  const tab  = TABLET_DEVICE;
  const desk = DESKTOP_DEVICE;

  const mobileScale  = scaleMode === 'real' ? zm : autoFit(mob.mockupW,  mob.mockupH)  * zm;
  const tabletScale  = scaleMode === 'real' ? zm : autoFit(tab.mockupW,  tab.mockupH)  * zm;
  const desktopScale = scaleMode === 'real' ? zm : autoFit(desk.mockupW, desk.mockupH) * zm;

  const currentCssW = viewportMode === 'mobile' ? mob.cssW
    : viewportMode === 'tablet' ? tab.cssW : desk.cssW;
  const dimLabel = viewportMode === 'mobile'
    ? `${mob.cssW}px` : viewportMode === 'tablet' ? `${tab.cssW}px` : `${desk.cssW}px`;

  useEffect(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'VIEWPORT_WIDTH', width: currentCssW, mode: viewportMode }, '*'
      );
    } catch { /* cross-origin */ }
  }, [viewportMode, mobileKey, iframeRef, currentCssW]);

  const btnBase   = 'px-2 py-1 rounded-md transition-all cursor-pointer font-bold text-[10px] whitespace-nowrap';
  const btnActive = 'bg-white dark:bg-[#0f0f1b] text-[#e94560] shadow-sm';
  const btnIdle   = 'text-gray-500 hover:text-gray-900 dark:hover:text-white';

  return (
    <main className={`flex-grow bg-[#f0f2f7] dark:bg-[#0a0a12] overflow-hidden flex flex-col h-full ${mobileTab !== 'preview' ? 'hidden' : ''} md:flex`}>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 h-10 bg-white/95 dark:bg-[#13131f]/95 backdrop-blur-md border-b border-gray-200/60 dark:border-white/5 flex items-center justify-between px-3 gap-2 overflow-x-auto scrollbar-none select-none z-10 text-[10px]">

        {/* LEFT: Device picker */}
        <div className="flex items-center gap-1.5 shrink-0">
          {viewportMode === 'mobile' && (
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg">
              {(Object.keys(MOBILE_DEVICES) as MobileKey[]).map(key => (
                <button key={key} type="button" onClick={() => setMobileKey(key)}
                  title={MOBILE_DEVICES[key].tip}
                  className={`${btnBase} ${mobileKey === key ? btnActive : btnIdle}`}>
                  {MOBILE_DEVICES[key].label}
                </button>
              ))}
            </div>
          )}
          {viewportMode === 'tablet' && (
            <span className={`${btnBase} bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300`}>
              iPad Pro 11″ M4
            </span>
          )}
          {viewportMode === 'desktop' && (
            <span className={`${btnBase} bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300`}>
              MacBook Neo 2026
            </span>
          )}
        </div>

        {/* CENTER: Zoom + Mode — always centered */}
        <div className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
          {/* Zoom */}
          <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg font-bold">
            <button type="button" onClick={() => nudgeZoom(-10)} title="Zoom Out"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/60 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer text-sm">−</button>
            <button type="button" onClick={() => setZoom(100)} title="Reset zoom"
              className="px-1.5 font-mono text-[10px] text-gray-600 dark:text-gray-300 hover:text-[#e94560] cursor-pointer min-w-[36px] text-center">{zoom}%</button>
            <button type="button" onClick={() => nudgeZoom(10)} title="Zoom In"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/60 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer text-sm">+</button>
          </div>

          {/* Fit / Real */}
          <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg">
            <button type="button" onClick={() => handleScaleMode('fit')} title="Auto-fit to canvas"
              className={`${btnBase} ${scaleMode === 'fit' ? btnActive : btnIdle}`}>Fit</button>
            <button type="button" onClick={() => handleScaleMode('real')} title="1:1 real pixels"
              className={`${btnBase} ${scaleMode === 'real' ? btnActive : btnIdle}`}>1:1</button>
          </div>
        </div>

        {/* RIGHT: Dim badge */}
        <span className="font-mono text-[10px] text-gray-400 bg-gray-100/70 dark:bg-white/5 px-2 py-0.5 rounded shrink-0 hidden sm:inline">
          {dimLabel}
        </span>
      </div>

      {/* ── Canvas ──────────────────────────────────────────────────────────── */}
      <div
        ref={previewContainerRef}
        className="flex-1 overflow-auto flex justify-center items-start"
        style={{ padding: PAD, minHeight: 0 }}
      >
        <div className="mx-auto my-auto flex items-center justify-center">
          {viewportMode === 'mobile' && (
            <DeviceMockup
              spec={mob}
              scale={mobileScale}
              iframeRef={iframeRef}
              iframeSrc="/admin/settings/customizer/preview"
            />
          )}
          {viewportMode === 'tablet' && (
            <DeviceMockup
              spec={tab}
              scale={tabletScale}
              iframeRef={iframeRef}
              iframeSrc="/admin/settings/customizer/preview"
            />
          )}
          {viewportMode === 'desktop' && (
            <DeviceMockup
              spec={desk}
              scale={desktopScale}
              iframeRef={iframeRef}
              iframeSrc="/admin/settings/customizer/preview"
            />
          )}
        </div>
      </div>
    </main>
  );
}
