'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { StoreSettings } from '@/lib/types';

// ── Device Specs (pixel-true) ──────────────────────────────────────────────────
// mockupW/H       = image pixel dimensions (sips verified)
// hole{L,T,W,H}   = transparent screen cutout as a FRACTION of the image,
//                   measured by alpha-channel detection (scripts/measure-device-mockups.mjs)
// cssW/cssH       = the REAL device CSS viewport (so storefront breakpoints fire
//                   exactly like the deployed site). Aspect = cssW/cssH.
// cornerPct       = screen corner radius as a fraction of the rendered screen width.
//
// RULE: the iframe is uniformly scaled (never stretched). A rect with the device's
// real viewport aspect is fitted INSIDE the measured hole and centered, so nothing
// is cropped and nothing is blank. Any sliver shows the black screen bg = looks real.
interface MockupSpec {
  img: string;
  mockupW: number; mockupH: number;
  holeL: number; holeT: number; holeW: number; holeH: number;
  cssW: number; cssH: number;
  cornerPct: number;
  /** top safe-area (island/status) height in CSS px — painted with announcement color */
  safeTop: number;
  /** bottom safe-area (home indicator) height in CSS px — painted with nav bg */
  safeBottom: number;
}

const MOBILE_DEVICES: Record<string, MockupSpec & { label: string; tip: string }> = {
  s26ultra: {
    label: 'S26 Ultra',
    tip: 'Samsung Galaxy S26 Ultra — 412 × 915 CSS px',
    img: '/devices/mockup-samsung-galaxy-s26-ultra.webp',
    mockupW: 385, mockupH: 800,
    holeL: 0.0312, holeT: 0.0138, holeW: 0.9325, holeH: 0.9712,
    cssW: 412, cssH: 915,
    cornerPct: 0.0557,
    safeTop: 32, safeBottom: 16,
  },
  iphone18pm: {
    label: 'iPhone 18 PM',
    tip: 'Apple iPhone 18 Pro Max — 440 × 956 CSS px',
    img: '/devices/mockup-apple-iphone-18-pro-max.webp',
    mockupW: 389, mockupH: 800,
    holeL: 0.0437, holeT: 0.0175, holeW: 0.9126, holeH: 0.9650,
    cssW: 440, cssH: 956,
    cornerPct: 0.1718,
    safeTop: 54, safeBottom: 34,
  },
};
type MobileKey = keyof typeof MOBILE_DEVICES;

// iPad Pro 11 — image 578×800, viewport 834×1194
const TABLET_DEVICE: MockupSpec = {
  img: '/devices/mockup-apple-ipad-pro-11.webp',
  mockupW: 578, mockupH: 800,
  holeL: 0.0519, holeT: 0.0387, holeW: 0.8927, holeH: 0.9237,
  cssW: 834, cssH: 1194,
  cornerPct: 0.0174,
  safeTop: 24, safeBottom: 20,
};

// MacBook Neo — image 800×488, viewport 1440×900
const DESKTOP_DEVICE: MockupSpec = {
  img: '/devices/mockup-apple-macbook-neo-2026-transparent.webp',
  mockupW: 800, mockupH: 488,
  holeL: 0.0988, holeT: 0.0451, holeW: 0.8025, holeH: 0.8238,
  cssW: 1440, cssH: 900,
  cornerPct: 0.0093,
  safeTop: 0, safeBottom: 0,
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
// The parent sizer applies ONE transform: scale(finalScale). This block renders
// at the natural PNG size. The screen wrapper = MEASURED cutout + 3px overscan
// (tucks under the frame → no black wedge). Inside the wrapper is a VERTICAL
// STACK (not overlay): [top inset zone] [iframe] [bottom inset zone]. The iframe
// receives ZERO safe-area (zones are real rows), so its sticky header pins at
// iframe top exactly like a real phone. Only the wrapper clips/rounds.
function DeviceMockup({
  spec, iframeRef, iframeSrc, topFill, bottomFill,
}: {
  spec: MockupSpec;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  iframeSrc: string;
  topFill: string;
  bottomFill: string;
}) {
  const { mockupW, mockupH, holeL, holeT, holeW, holeH, cssW, cssH, cornerPct, safeTop, safeBottom } = spec;

  const baseW = mockupW;
  const baseH = mockupH;

  // Measured transparent screen hole (base px) — snapped to whole px.
  const holeX = Math.round(holeL * baseW);
  const holeY = Math.round(holeT * baseH);
  const holePxW = Math.round(holeW * baseW);
  const holePxH = Math.round(holeH * baseH);

  // 3px overscan so the wrapper tucks UNDER the frame on all 4 sides.
  const OVER = 3;
  const wrapX = holeX - OVER;
  const wrapY = holeY - OVER;
  const wrapW = holePxW + OVER * 2;
  const wrapH = holePxH + OVER * 2;

  // iframe pixel scale: cssW maps to the full wrapper width (edge to edge).
  const iframeScale = wrapW / cssW;

  // Safe-area zones rendered as REAL rows. +2px seam-killer so each row overlaps
  // its neighbor and no hairline/background can peek through sub-pixel gaps.
  const SEAM = 2;
  const topZonePx = safeTop > 0 ? Math.round(safeTop * iframeScale) + OVER + SEAM : 0;
  const bottomZonePx = safeBottom > 0 ? Math.round(safeBottom * iframeScale) + SEAM : 0;
  // Remaining height for the iframe row (base px) → convert back to CSS px.
  const iframeRowPx = wrapH - topZonePx - bottomZonePx;
  const iframeCssH = iframeRowPx / iframeScale;

  const radius = cornerPct * holePxW + OVER;

  return (
    <div style={{
      position: 'relative', width: baseW, height: baseH, flexShrink: 0,
      willChange: 'transform', backfaceVisibility: 'hidden',
    }}>
      {/* Screen wrapper = measured cutout + overscan. Vertical stack inside.
          Base background = topFill (orange) so the top edge behind the camera is
          NEVER white; the iframe row + bottom zone paint white over the rest. */}
      <div style={{
        position: 'absolute',
        top: wrapY, left: wrapX,
        width: wrapW, height: wrapH,
        overflow: 'hidden',
        borderRadius: radius,
        background: topZonePx > 0 ? topFill : bottomFill,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Row 1: top inset zone — orange, overlaps iframe by SEAM (negative mb) */}
        {topZonePx > 0 && (
          <div style={{
            height: topZonePx, flexShrink: 0, background: topFill,
            marginBottom: -SEAM, outline: `1px solid ${topFill}`,
            position: 'relative', zIndex: 1,
          }} />
        )}

        {/* Row 2: iframe — real viewport width, scaled edge-to-edge, zero inset */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative', background: bottomFill }}>
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            className="border-none"
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: cssW,
              height: iframeCssH,
              transform: `scale(${iframeScale})`,
              transformOrigin: 'top left',
              display: 'block',
              maxWidth: 'none',
              background: 'transparent',
            }}
            title="Preview"
          />
        </div>

        {/* Row 3: bottom inset zone — white, overlaps iframe by SEAM (negative mt) */}
        {bottomZonePx > 0 && (
          <div style={{
            height: bottomZonePx, flexShrink: 0, background: bottomFill,
            marginTop: -SEAM, outline: `1px solid ${bottomFill}`,
            position: 'relative', zIndex: 1,
          }} />
        )}
      </div>

      {/* Device image overlay — ON TOP, pointer-events none */}
      <Image
        src={spec.img}
        alt="Device mockup"
        width={mockupW}
        height={mockupH}
        style={{
          position: 'absolute',
          inset: 0,
          width: baseW,
          height: baseH,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 2,
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
  const [mobileKey, setMobileKey] = useState<MobileKey>('s26ultra');
  const [scaleMode, setScaleMode] = useState<'fit' | 'real'>('fit');
  // userZoom: 1.00 = Fit baseline (label "100%"). +/- step 0.05, range 0.50–2.00.
  const [userZoom, setUserZoom] = useState(1);

  const nudgeZoom = useCallback((d: number) =>
    setUserZoom(z => Math.min(2, Math.max(0.5, +(z + d).toFixed(2)))), []);
  const handleScaleMode = useCallback((m: 'fit' | 'real') => {
    setScaleMode(m); setUserZoom(1);
  }, []);

  const PAD = 20;
  const TOOLBAR_H = 40;
  const canvasW = Math.max(containerWidth  - PAD * 2, 280);
  const canvasH = Math.max(containerHeight - TOOLBAR_H - PAD * 2, 400);

  // Fit the WHOLE device (frame included) inside BOTH pane width and height,
  // using the full available area (PAD is the margin). No extra shrink constant.
  function fitScale(imgW: number, imgH: number) {
    return Math.min(canvasW / imgW, canvasH / imgH);
  }

  // "100%" baseline = Fit × 1.2 (the previous 120% size is now the default 100%).
  const FIT_BOOST = 1.2;

  const mob  = MOBILE_DEVICES[mobileKey];
  const tab  = TABLET_DEVICE;
  const desk = DESKTOP_DEVICE;

  const activeSpec = viewportMode === 'mobile' ? mob : viewportMode === 'tablet' ? tab : desk;
  // Baseline that the "100%" label maps to = Fit size × 1.2 (the old 120% view is
  // now the default). Pane scrolls if the boosted device exceeds it.
  const baseFit = fitScale(activeSpec.mockupW, activeSpec.mockupH) * FIT_BOOST;
  // finalScale: Fit → baseFit × userZoom. 1:1 → real device px × userZoom.
  // Rounded to 3 decimals to avoid long fractional scales → sub-pixel seams.
  const finalScale = +((scaleMode === 'real' ? userZoom : baseFit * userZoom).toFixed(3));
  // label: Fit shows userZoom %, 1:1 shows the true percent vs the 100% baseline.
  const zoomLabel = scaleMode === 'real'
    ? `${Math.round((finalScale / baseFit) * 100)}%`
    : `${Math.round(userZoom * 100)}%`;

  // Visual (post-scale) device size — snapped to whole px so the sizer box and
  // scroll area never land on fractional positions.
  const sizerW = Math.round(activeSpec.mockupW * finalScale);
  const sizerH = Math.round(activeSpec.mockupH * finalScale);

  // Reset zoom to Fit baseline + recenter scroll on device / viewport / page switch.
  useEffect(() => {
    setUserZoom(1);
    try { previewContainerRef.current?.scrollTo({ top: 0, left: 0 }); } catch { /* noop */ }
  }, [viewportMode, mobileKey, scaleMode, previewContainerRef]);

  // Safe-area fill colors from theme (announcement bar bg / nav white).
  const topFill =
    storeSettings?.header_top_bar_bg ||
    storeSettings?.theme_config?.colors?.headerTopBarBg ||
    storeSettings?.theme_config?.colors?.primary ||
    '#0F2A5E';
  const bottomFill =
    storeSettings?.header_bg ||
    storeSettings?.theme_config?.colors?.surface ||
    '#ffffff';

  const currentCssW = viewportMode === 'mobile' ? mob.cssW
    : viewportMode === 'tablet' ? tab.cssW : desk.cssW;
  const currentCssH = viewportMode === 'mobile' ? mob.cssH
    : viewportMode === 'tablet' ? tab.cssH : desk.cssH;
  const dimLabel = viewportMode === 'mobile'
    ? `${mob.cssW}×${mob.cssH}` : viewportMode === 'tablet' ? `${tab.cssW}×${tab.cssH}` : `${desk.cssW}×${desk.cssH}`;

  // Tell the storefront iframe its viewport. Safe-area zones are rendered as REAL
  // rows in the wrapper (not overlay), so the iframe gets ZERO insets — its sticky
  // header pins at iframe top exactly like a real phone (no double offset).
  useEffect(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: 'VIEWPORT_WIDTH',
          width: currentCssW,
          height: currentCssH,
          mode: viewportMode,
          safeTop: 0,
          safeBottom: 0,
        },
        '*'
      );
    } catch { /* cross-origin */ }
  }, [viewportMode, mobileKey, iframeRef, currentCssW, currentCssH]);

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
            <button type="button" onClick={() => nudgeZoom(-0.05)} title="Zoom Out"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/60 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer text-sm">−</button>
            <button type="button" onClick={() => setUserZoom(1)} title="Reset zoom"
              className="px-1.5 font-mono text-[10px] text-gray-600 dark:text-gray-300 hover:text-[#e94560] cursor-pointer min-w-[36px] text-center">{zoomLabel}</button>
            <button type="button" onClick={() => nudgeZoom(0.05)} title="Zoom In"
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
      {/* Pane: flex, overflow auto, even padding. The SIZER (real visual size) is
          centered via margin:auto — centers while it fits, scrolls from top-left
          when larger than the pane. The inner block is natural size + scale(). */}
      <div
        ref={previewContainerRef}
        className="flex-1 overflow-auto flex"
        style={{ padding: PAD, minHeight: 0 }}
      >
        <div
          style={{
            width: sizerW,
            height: sizerH,
            margin: 'auto',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <div
            style={{
              transform: `scale(${finalScale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0, left: 0,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
          >
            <DeviceMockup
              spec={activeSpec}
              iframeRef={iframeRef}
              iframeSrc="/admin/settings/customizer/preview"
              topFill={topFill}
              bottomFill={bottomFill}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
