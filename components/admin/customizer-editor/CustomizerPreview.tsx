'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { StoreSettings } from '@/lib/types';

// ── Device Specs ──────────────────────────────────────────────────────────────
const MOBILE_DEVICES = {
  iphone18pm: { w: 440, h: 956, bezel: 14, radius: 52, label: 'iPhone 18 PM',  tip: 'Apple iPhone 18 Pro Max — 440×956 CSS px (2026)', notch: 'pill'  as const, frameColor: '#1c1c1e' },
  s27ultra:   { w: 412, h: 924, bezel: 12, radius: 44, label: 'S27 Ultra',      tip: 'Samsung Galaxy S27 Ultra — 412×924 CSS px (2026)',  notch: 'punch' as const, frameColor: '#18181b' },
  pixel12pro: { w: 412, h: 892, bezel: 12, radius: 42, label: 'Pixel 12 Pro',   tip: 'Google Pixel 12 Pro XL — 412×892 CSS px (2026)',   notch: 'punch' as const, frameColor: '#141418' },
} as const;
type MobileKey = keyof typeof MOBILE_DEVICES;

const TABLET  = { w: 834,  h: 1194, bezel: 18, radius: 20, frameColor: '#1c1c1e' };
const DESKTOP = { w: 1440, h: 860 };

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
  const [mobileKey, setMobileKey] = useState<MobileKey>('iphone18pm');
  const [scaleMode, setScaleMode]  = useState<'fit' | 'real'>('fit');
  const [zoom, setZoom]            = useState(100);

  const nudgeZoom = useCallback((d: number) =>
    setZoom(z => Math.min(200, Math.max(50, z + d))), []);

  const handleScaleMode = useCallback((m: 'fit' | 'real') => {
    setScaleMode(m);
    setZoom(100);
  }, []);

  const mob  = MOBILE_DEVICES[mobileKey];
  const PAD  = 24;
  const TOOLBAR_H = 40;
  const canvasW = Math.max(containerWidth  - PAD * 2, 280);
  const canvasH = Math.max(containerHeight - TOOLBAR_H - PAD * 2, 400);
  const zm  = zoom / 100;

  function autoFit(dw: number, dh: number) {
    return Math.min(canvasW / dw, canvasH / dh, 1);
  }

  const mobileScale  = scaleMode === 'real' ? zm : autoFit(mob.w + mob.bezel * 2, mob.h + mob.bezel * 2) * zm;
  const tabletScale  = scaleMode === 'real' ? zm : autoFit(TABLET.w  + TABLET.bezel  * 2, TABLET.h  + TABLET.bezel  * 2) * zm;
  const desktopScale = scaleMode === 'real' ? zm : autoFit(DESKTOP.w, DESKTOP.h + 36) * zm;

  const dimLabel = viewportMode === 'mobile'
    ? `${mob.w}×${mob.h}`
    : viewportMode === 'tablet'
    ? `${TABLET.w}×${TABLET.h}`
    : `${DESKTOP.w}×${DESKTOP.h}`;

  // Tell preview iframe the current CSS viewport width so it can respond
  useEffect(() => {
    const iw = viewportMode === 'mobile' ? mob.w : viewportMode === 'tablet' ? TABLET.w : DESKTOP.w;
    try { iframeRef.current?.contentWindow?.postMessage({ type: 'VIEWPORT_WIDTH', width: iw, mode: viewportMode }, '*'); }
    catch { /* cross-origin guard */ }
  }, [viewportMode, mobileKey, iframeRef, mob.w]);

  const btnBase = 'px-2 py-1 rounded-md transition-all cursor-pointer font-bold text-[10px]';
  const btnActive = 'bg-white dark:bg-[#0f0f1b] text-[#e94560] shadow-sm';
  const btnIdle   = 'text-gray-500 hover:text-gray-900 dark:hover:text-white';

  return (
    <main className={`flex-grow bg-[#f0f2f7] dark:bg-[#09090f] overflow-hidden flex flex-col h-full ${mobileTab !== 'preview' ? 'hidden' : ''} md:flex`}>

      {/* ── Toolbar ── */}
      <div className="shrink-0 h-10 px-3 md:px-4 bg-white/95 dark:bg-[#13131f]/95 backdrop-blur-md border-b border-gray-200/60 dark:border-white/5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none select-none z-10" style={{ fontSize: 10 }}>

        {/* Device Picker */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-black uppercase tracking-widest text-gray-400 hidden sm:inline">Device:</span>

          {viewportMode === 'mobile' && (
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg">
              {(Object.keys(MOBILE_DEVICES) as MobileKey[]).map(key => (
                <button key={key} type="button" onClick={() => setMobileKey(key)} title={MOBILE_DEVICES[key].tip}
                  className={`${btnBase} ${mobileKey === key ? btnActive : btnIdle}`}>
                  {MOBILE_DEVICES[key].label}
                </button>
              ))}
            </div>
          )}

          {viewportMode === 'tablet' && (
            <span className="font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-md text-[10px]">
              iPad Pro 11″ M4 — 834px
            </span>
          )}

          {viewportMode === 'desktop' && (
            <span className="font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-md text-[10px]">
              Desktop Wide — 1440px
            </span>
          )}
        </div>

        {/* Zoom + Fit/Real + dim */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg font-bold text-[10px]">
            <button type="button" onClick={() => nudgeZoom(-10)} title="Zoom Out"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/60 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer">−</button>
            <button type="button" onClick={() => setZoom(100)} title="Reset zoom"
              className="px-1.5 font-mono text-gray-600 dark:text-gray-300 hover:text-[#e94560] cursor-pointer">{zoom}%</button>
            <button type="button" onClick={() => nudgeZoom(10)} title="Zoom In"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/60 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer">+</button>
          </div>

          <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg">
            <button type="button" onClick={() => handleScaleMode('fit')} title="Auto-fit to canvas"
              className={`${btnBase} ${scaleMode === 'fit' ? btnActive : btnIdle}`}>Fit Screen</button>
            <button type="button" onClick={() => handleScaleMode('real')} title="1:1 real device pixels"
              className={`${btnBase} ${scaleMode === 'real' ? btnActive : btnIdle}`}>1:1 Real</button>
          </div>

          <span className="font-mono text-[10px] text-gray-400 bg-gray-100/70 dark:bg-white/5 px-2 py-0.5 rounded hidden sm:inline">{dimLabel}</span>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div ref={previewContainerRef}
        className="flex-1 overflow-auto flex justify-center items-start"
        style={{ padding: PAD, minHeight: 0 }}>

        {/* MOBILE */}
        {viewportMode === 'mobile' && (() => {
          const tw = mob.w + mob.bezel * 2;
          const th = mob.h + mob.bezel * 2;
          return (
            <div style={{ width: tw * mobileScale, height: th * mobileScale, transition: 'width .25s cubic-bezier(.16,1,.3,1),height .25s cubic-bezier(.16,1,.3,1)', flexShrink: 0, position: 'relative', margin: 'auto' }}>
              {/* Phone shell */}
              <div style={{
                width: tw, height: th,
                transform: `scale(${mobileScale})`, transformOrigin: 'top center',
                borderRadius: mob.radius,
                border: `${mob.bezel}px solid ${mob.frameColor}`,
                boxShadow: `0 0 0 1px rgba(255,255,255,0.07), 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)`,
                background: mob.frameColor,
                position: 'absolute', top: 0, left: 0,
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
              }}>
                {/* Top bar / notch */}
                <div style={{ height: mob.notch === 'pill' ? 14 : 12, flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'inherit' }}>
                  {mob.notch === 'pill' && (
                    <div style={{ width: 112, height: 30, borderRadius: 20, background: '#000', position: 'absolute', top: -8, boxShadow: '0 2px 12px rgba(0,0,0,.7)' }} />
                  )}
                  {mob.notch === 'punch' && (
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#000', position: 'absolute', top: 2 }} />
                  )}
                </div>

                {/* Screen */}
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                  <iframe ref={iframeRef} src="/admin/settings/customizer/preview" title="Mobile Preview"
                    className="border-none" style={{ width: mob.w, height: '100%', maxWidth: 'none', display: 'block' }} />
                </div>

                {/* Home indicator */}
                <div style={{ height: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'inherit' }}>
                  <div style={{ width: 120, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.28)' }} />
                </div>
              </div>
            </div>
          );
        })()}

        {/* TABLET */}
        {viewportMode === 'tablet' && (() => {
          const tw = TABLET.w + TABLET.bezel * 2;
          const th = TABLET.h + TABLET.bezel * 2;
          return (
            <div style={{ width: tw * tabletScale, height: th * tabletScale, transition: 'all .25s ease', flexShrink: 0, position: 'relative', margin: 'auto' }}>
              <div style={{
                width: tw, height: th,
                transform: `scale(${tabletScale})`, transformOrigin: 'top center',
                borderRadius: TABLET.radius + TABLET.bezel,
                border: `${TABLET.bezel}px solid ${TABLET.frameColor}`,
                boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 40px 100px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,0.08)`,
                background: TABLET.frameColor,
                position: 'absolute', top: 0, left: 0,
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
              }}>
                {/* Top bar + front camera */}
                <div style={{ height: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'inherit' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,.05)', boxShadow: 'inset 0 0 3px rgba(0,0,0,.8)' }} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                  <iframe ref={iframeRef} src="/admin/settings/customizer/preview" title="Tablet Preview"
                    className="border-none" style={{ width: TABLET.w, height: '100%', maxWidth: 'none', display: 'block' }} />
                </div>
                <div style={{ height: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'inherit' }}>
                  <div style={{ width: 80, height: 3, borderRadius: 2, background: 'rgba(255,255,255,.22)' }} />
                </div>
              </div>
            </div>
          );
        })()}

        {/* DESKTOP */}
        {viewportMode === 'desktop' && (() => {
          const CHROME_H = 36;
          const tw = DESKTOP.w;
          const th = DESKTOP.h + CHROME_H;
          return (
            <div style={{ width: tw * desktopScale, height: th * desktopScale, transition: 'all .25s ease', flexShrink: 0, position: 'relative', margin: 'auto' }}>
              <div style={{
                width: tw, height: th,
                transform: `scale(${desktopScale})`, transformOrigin: 'top center',
                borderRadius: 12, overflow: 'hidden',
                position: 'absolute', top: 0, left: 0,
                boxShadow: '0 24px 64px rgba(0,0,0,.4), 0 0 0 1px rgba(0,0,0,.12)',
                display: 'flex', flexDirection: 'column', background: '#fff',
              }}>
                {/* Browser chrome */}
                <div style={{ height: CHROME_H, flexShrink: 0 }}
                  className="bg-[#ededf0] dark:bg-[#1d1d2b] border-b border-gray-300/80 dark:border-gray-700/60 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 max-w-md mx-auto bg-white dark:bg-[#0f0f1b] rounded px-3 py-0.5 text-[11px] text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 truncate text-center select-none">
                    🔒 {storeSettings.store_name?.toLowerCase().replace(/\s+/g, '') || 'ourstore'}.pk
                  </div>
                </div>
                <iframe ref={iframeRef} src="/admin/settings/customizer/preview" title="Desktop Preview"
                  className="border-none flex-1" style={{ width: DESKTOP.w, maxWidth: 'none', display: 'block' }} />
              </div>
            </div>
          );
        })()}

      </div>
    </main>
  );
}
