'use client';

import React from 'react';

export const customCss = `
    .z-card-container {
      --trans: all 0.35s cubic-bezier(0.4,0,0.2,1);
      --purple: #7c3aed;
      --blue: #2563eb;
      --green: #10b981;
      --red: #ef4444;
      --gold: #f59e0b;
      transition: var(--trans);
      font-family: 'Segoe UI', sans-serif;
      position: relative;
      width: 100%;
      /* DS-FIX: overflow must be visible so absolutely-positioned action icons
         are never clipped by the card boundary. Inner image boxes keep their own
         overflow:hidden for image zoom/swap effects. */
      overflow: visible !important;
      isolation: isolate;
    }
    
    /* Shared components scoped inside z-card-container */
    .z-card-container .bdg-container {
      position: absolute !important; top: 8px !important; left: 8px !important;
      display: flex; flex-direction: column; gap: 4px;
      z-index: 10 !important; align-items: flex-start;
      max-width: calc(100% - 46px) !important;
      pointer-events: none !important;
    }
    .z-card-container .bdg {
      display: inline-block;
      padding: 3px 8px; border-radius: 20px;
      font-size: .58rem; font-weight: 800;
      letter-spacing: 0.8px; text-transform: uppercase;
      line-height: 1; pointer-events: none;
      max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .z-card-container .bdg-new { background: #d97706; color: #fff; }
    .z-card-container .bdg-hot { background: #ea580c; color: #fff; }
    .z-card-container .bdg-sale { background: #10b981; color: #fff; }
    .z-card-container .bdg-featured { background: #e94560; color: #fff; }

    /* Universal Quick Action Controls Overlay */
    .z-card-container .card-actions,
    .z-card-container .aic {
      position: absolute !important; right: 8px !important; top: 8px !important;
      display: flex; flex-direction: column; gap: 5px;
      z-index: 25 !important;
      opacity: 0;
      transform: translateX(8px);
      pointer-events: none;
      transition: opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1), transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Image swap base states — global transitions for all hover effects */
    .z-card-container .hover-fade-out {
      opacity: 1;
      transition: opacity 0.35s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease !important;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    .z-card-container .hover-fade-in {
      opacity: 0;
      transition: opacity 0.35s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease !important;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    .z-card-container .hover-zoom {
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    /* Style-specific initial states for secondary image */
    .z-card-container[data-hover-effect="slide_left"] .hover-fade-in {
      transform: translateX(100%);
    }
    .z-card-container[data-hover-effect="zoom_swap"] .hover-fade-in {
      transform: scale(1.1);
    }
    .z-card-container[data-hover-effect="fade_up"] .hover-fade-in {
      transform: translateY(14px);
    }
    .z-card-container[data-hover-effect="blur_crossfade"] .hover-fade-in {
      filter: blur(5px);
    }
    .z-card-container[data-hover-effect="flip_3d"] {
      perspective: 1000px;
    }
    .z-card-container[data-hover-effect="flip_3d"] .hover-fade-in {
      transform: rotateY(180deg);
    }

    /* ── ACTIVE / FOCUSED CARD STATE (Universal: Mobile scroll focus, tap focus & Studio simulator) ── */
    /* 1. Reveal Action Icons */
    .z-card-container.is-in-focus .card-actions,
    .z-card-container.is-in-focus .aic,
    .z-card-container.active-card .card-actions,
    .z-card-container.active-card .aic {
      opacity: 1 !important;
      transform: translate3d(0, 0, 0) !important;
      pointer-events: auto !important;
    }

    /* Staggered in-animation for action buttons */
    .z-card-container.is-in-focus .card-actions > *:nth-child(1),
    .z-card-container.is-in-focus .aic > *:nth-child(1),
    .z-card-container.active-card .card-actions > *:nth-child(1),
    .z-card-container.active-card .aic > *:nth-child(1) {
      transition-delay: 0ms !important;
    }
    .z-card-container.is-in-focus .card-actions > *:nth-child(2),
    .z-card-container.is-in-focus .aic > *:nth-child(2),
    .z-card-container.active-card .card-actions > *:nth-child(2),
    .z-card-container.active-card .aic > *:nth-child(2) {
      transition-delay: 40ms !important;
    }
    .z-card-container.is-in-focus .card-actions > *:nth-child(3),
    .z-card-container.is-in-focus .aic > *:nth-child(3),
    .z-card-container.active-card .card-actions > *:nth-child(3),
    .z-card-container.active-card .aic > *:nth-child(3) {
      transition-delay: 80ms !important;
    }

    /* 2. Title color highlights on focused card */
    .z-card-container.is-in-focus .product-card-title,
    .z-card-container.is-in-focus .card-title,
    .z-card-container.active-card .product-card-title,
    .z-card-container.active-card .card-title {
      color: var(--color-primary, #C2185B) !important;
      transition: color 0.25s ease !important;
    }

    /* 3. Image Hover Effects triggered on focused card */
    /* Style 1: Zoom */
    .z-card-container.is-in-focus[data-hover-effect="zoom"] .hover-zoom,
    .z-card-container.active-card[data-hover-effect="zoom"] .hover-zoom {
      transform: scale(1.06) !important;
    }

    /* Style 2: Second Image (Fade Swap) */
    .z-card-container.is-in-focus[data-hover-effect="second_image"] .hover-fade-out,
    .z-card-container.active-card[data-hover-effect="second_image"] .hover-fade-out,
    .z-card-container.is-in-focus:not([data-hover-effect]) .hover-fade-out,
    .z-card-container.active-card:not([data-hover-effect]) .hover-fade-out {
      opacity: 0 !important;
    }
    .z-card-container.is-in-focus[data-hover-effect="second_image"] .hover-fade-in,
    .z-card-container.active-card[data-hover-effect="second_image"] .hover-fade-in,
    .z-card-container.is-in-focus:not([data-hover-effect]) .hover-fade-in,
    .z-card-container.active-card:not([data-hover-effect]) .hover-fade-in {
      opacity: 1 !important;
    }

    /* Style 3: Slide Left (Zara Style) */
    .z-card-container.is-in-focus[data-hover-effect="slide_left"] .hover-fade-out,
    .z-card-container.active-card[data-hover-effect="slide_left"] .hover-fade-out {
      transform: translateX(-100%) !important;
      opacity: 0 !important;
    }
    .z-card-container.is-in-focus[data-hover-effect="slide_left"] .hover-fade-in,
    .z-card-container.active-card[data-hover-effect="slide_left"] .hover-fade-in {
      transform: translateX(0) !important;
      opacity: 1 !important;
    }

    /* Style 4: Zoom & Swap (Luxury Editorial) */
    .z-card-container.is-in-focus[data-hover-effect="zoom_swap"] .hover-fade-out,
    .z-card-container.active-card[data-hover-effect="zoom_swap"] .hover-fade-out {
      transform: scale(1.1) !important;
      opacity: 0 !important;
    }
    .z-card-container.is-in-focus[data-hover-effect="zoom_swap"] .hover-fade-in,
    .z-card-container.active-card[data-hover-effect="zoom_swap"] .hover-fade-in {
      transform: scale(1.0) !important;
      opacity: 1 !important;
    }

    /* Style 5: Fade & Rise (Upward Drift) */
    .z-card-container.is-in-focus[data-hover-effect="fade_up"] .hover-fade-out,
    .z-card-container.active-card[data-hover-effect="fade_up"] .hover-fade-out {
      opacity: 0 !important;
    }
    .z-card-container.is-in-focus[data-hover-effect="fade_up"] .hover-fade-in,
    .z-card-container.active-card[data-hover-effect="fade_up"] .hover-fade-in {
      transform: translateY(0) !important;
      opacity: 1 !important;
    }

    /* Style 6: Blur & Crossfade (Apple Aesthetic) */
    .z-card-container.is-in-focus[data-hover-effect="blur_crossfade"] .hover-fade-out,
    .z-card-container.active-card[data-hover-effect="blur_crossfade"] .hover-fade-out {
      filter: blur(5px) !important;
      opacity: 0 !important;
    }
    .z-card-container.is-in-focus[data-hover-effect="blur_crossfade"] .hover-fade-in,
    .z-card-container.active-card[data-hover-effect="blur_crossfade"] .hover-fade-in {
      filter: blur(0px) !important;
      opacity: 1 !important;
    }

    /* Style 7: 3D Flip (Jewelry & Accessories) */
    .z-card-container.is-in-focus[data-hover-effect="flip_3d"] .hover-fade-out,
    .z-card-container.active-card[data-hover-effect="flip_3d"] .hover-fade-out {
      transform: rotateY(-180deg) !important;
      opacity: 0 !important;
    }
    .z-card-container.is-in-focus[data-hover-effect="flip_3d"] .hover-fade-in,
    .z-card-container.active-card[data-hover-effect="flip_3d"] .hover-fade-in {
      transform: rotateY(0deg) !important;
      opacity: 1 !important;
    }

    /* Desktop hover: mouse/trackpad only */
    @media (hover: hover) and (pointer: fine) {
      .z-card-container:hover .card-actions,
      .z-card-container:hover .aic,
      .group:hover .card-actions,
      .group:hover .aic {
        opacity: 1 !important;
        transform: translateX(0) !important;
        pointer-events: auto !important;
      }
      .z-card-container:hover .product-card-title,
      .z-card-container:hover .card-title,
      .group:hover .product-card-title,
      .group:hover .card-title {
        color: var(--color-primary, #C2185B) !important;
      }

      /* Style 1: Zoom */
      .z-card-container:hover[data-hover-effect="zoom"] .hover-zoom,
      .z-card-container[data-hover-effect="zoom"]:hover .hover-zoom,
      .group:hover[data-hover-effect="zoom"] .hover-zoom,
      .z-card-container:hover .hover-zoom {
        transform: scale(1.06);
      }
      /* Style 2: Second Image (Fade Swap) */
      .z-card-container:hover[data-hover-effect="second_image"] .hover-fade-out,
      .z-card-container[data-hover-effect="second_image"]:hover .hover-fade-out,
      .group:hover[data-hover-effect="second_image"] .hover-fade-out,
      .z-card-container:hover:not([data-hover-effect]) .hover-fade-out {
        opacity: 0 !important;
      }
      .z-card-container:hover[data-hover-effect="second_image"] .hover-fade-in,
      .z-card-container[data-hover-effect="second_image"]:hover .hover-fade-in,
      .group:hover[data-hover-effect="second_image"] .hover-fade-in,
      .z-card-container:hover:not([data-hover-effect]) .hover-fade-in {
        opacity: 1 !important;
      }

      /* Style 3: Slide Left (Zara Style) */
      .z-card-container:hover[data-hover-effect="slide_left"] .hover-fade-out,
      .z-card-container[data-hover-effect="slide_left"]:hover .hover-fade-out,
      .group:hover[data-hover-effect="slide_left"] .hover-fade-out {
        transform: translateX(-100%);
        opacity: 0 !important;
      }
      .z-card-container:hover[data-hover-effect="slide_left"] .hover-fade-in,
      .z-card-container[data-hover-effect="slide_left"]:hover .hover-fade-in,
      .group:hover[data-hover-effect="slide_left"] .hover-fade-in {
        transform: translateX(0) !important;
        opacity: 1 !important;
      }

      /* Style 4: Zoom & Swap (Luxury Editorial) */
      .z-card-container:hover[data-hover-effect="zoom_swap"] .hover-fade-out,
      .z-card-container[data-hover-effect="zoom_swap"]:hover .hover-fade-out,
      .group:hover[data-hover-effect="zoom_swap"] .hover-fade-out {
        transform: scale(1.1);
        opacity: 0 !important;
      }
      .z-card-container:hover[data-hover-effect="zoom_swap"] .hover-fade-in,
      .z-card-container[data-hover-effect="zoom_swap"]:hover .hover-fade-in,
      .group:hover[data-hover-effect="zoom_swap"] .hover-fade-in {
        transform: scale(1.0) !important;
        opacity: 1 !important;
      }

      /* Style 5: Fade & Rise (Upward Drift) */
      .z-card-container:hover[data-hover-effect="fade_up"] .hover-fade-out,
      .z-card-container[data-hover-effect="fade_up"]:hover .hover-fade-out,
      .group:hover[data-hover-effect="fade_up"] .hover-fade-out {
        opacity: 0 !important;
      }
      .z-card-container:hover[data-hover-effect="fade_up"] .hover-fade-in,
      .z-card-container[data-hover-effect="fade_up"]:hover .hover-fade-in,
      .group:hover[data-hover-effect="fade_up"] .hover-fade-in {
        transform: translateY(0) !important;
        opacity: 1 !important;
      }

      /* Style 6: Blur & Crossfade (Apple Aesthetic) */
      .z-card-container:hover[data-hover-effect="blur_crossfade"] .hover-fade-out,
      .z-card-container[data-hover-effect="blur_crossfade"]:hover .hover-fade-out,
      .group:hover[data-hover-effect="blur_crossfade"] .hover-fade-out {
        filter: blur(5px);
        opacity: 0 !important;
      }
      .z-card-container:hover[data-hover-effect="blur_crossfade"] .hover-fade-in,
      .z-card-container[data-hover-effect="blur_crossfade"]:hover .hover-fade-in,
      .group:hover[data-hover-effect="blur_crossfade"] .hover-fade-in {
        filter: blur(0px) !important;
        opacity: 1 !important;
      }

      /* Style 7: 3D Flip (Jewelry & Accessories) */
      .z-card-container:hover[data-hover-effect="flip_3d"] .hover-fade-out,
      .z-card-container[data-hover-effect="flip_3d"]:hover .hover-fade-out,
      .group:hover[data-hover-effect="flip_3d"] .hover-fade-out {
        transform: rotateY(-180deg) !important;
        opacity: 0 !important;
      }
      .z-card-container:hover[data-hover-effect="flip_3d"] .hover-fade-in,
      .z-card-container[data-hover-effect="flip_3d"]:hover .hover-fade-in,
      .group:hover[data-hover-effect="flip_3d"] .hover-fade-in {
        transform: rotateY(0deg) !important;
        opacity: 1 !important;
      }
    }

    /* Universal Action Button Styling */
    .z-card-container .action-btn,
    .z-card-container .ai {
      width: 32px; height: 32px; border-radius: 50%;
      background: #ffffff; color: #1f2937;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .dark .z-card-container .action-btn,
    .dark .z-card-container .ai {
      background: #16162a; color: #f3f4f6;
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    }

    /* ── 5 DISTINCT ICON STYLE PRESETS ── */
    /* 1. Minimal Line: Thin strokes, borderless floating elegance */
    .icon-preset-minimal .action-btn,
    .icon-preset-minimal .ai {
      background: rgba(255, 255, 255, 0.92);
      border: none;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      color: #374151;
    }
    .dark .icon-preset-minimal .action-btn,
    .dark .icon-preset-minimal .ai {
      background: rgba(20, 20, 35, 0.92);
      color: #e5e7eb;
    }

    /* 2. Modern Pill: Solid high contrast filled badges */
    .icon-preset-pill .action-btn,
    .icon-preset-pill .ai {
      border-radius: 9999px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    }

    /* 3. Luxury Metallic: Champagne & Gold fine micro-accents */
    .icon-preset-luxe .action-btn,
    .icon-preset-luxe .ai {
      background: #1c1917;
      color: #fef3c7;
      border: 1.5px solid rgba(217, 119, 6, 0.45);
      box-shadow: 0 2px 8px rgba(217, 119, 6, 0.2);
    }
    .icon-preset-luxe .action-btn:hover,
    .icon-preset-luxe .ai:hover {
      background: #d97706 !important;
      color: #000000 !important;
      border-color: #d97706 !important;
    }

    /* 4. Neo-Brutalist: Crisp 2px black geometric squircle with hard shadow */
    .icon-preset-brutalist .action-btn,
    .icon-preset-brutalist .ai {
      border-radius: 6px;
      border: 2px solid #000000;
      background: #ffffff;
      color: #000000;
      box-shadow: 2px 2px 0px #000000;
    }
    .dark .icon-preset-brutalist .action-btn,
    .dark .icon-preset-brutalist .ai {
      border-color: #ffffff;
      background: #09090b;
      color: #ffffff;
      box-shadow: 2px 2px 0px #ffffff;
    }

    /* 5. Floating Glass: Tactile translucent frosted bubble */
    .icon-preset-glass .action-btn,
    .icon-preset-glass .ai {
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      color: #111827;
    }
    .dark .icon-preset-glass .action-btn,
    .dark .icon-preset-glass .ai {
      background: rgba(25, 25, 45, 0.85);
      border-color: rgba(255, 255, 255, 0.15);
      color: #f9fafb;
    }
    .z-card-container .action-btn:hover,
    .z-card-container .ai:hover {
      transform: scale(1.14) !important;
      background: var(--color-primary, #e94560) !important;
      color: #ffffff !important;
      border-color: transparent !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25) !important;
    }
    .z-card-container .action-btn:hover svg,
    .z-card-container .ai:hover svg {
      color: #ffffff !important;
      stroke: #ffffff !important;
    }
    .z-card-container .action-btn:hover svg.text-red-500,
    .z-card-container .ai:hover svg.text-red-500 {
      color: #ffffff !important;
      fill: #ffffff !important;
    }
    .z-card-container .action-btn:active,
    .z-card-container .ai:active {
      transform: scale(0.92) !important;
    }

    .z-card-container .ai .tt,
    .z-card-container .action-btn .tt {
      position: absolute; right: calc(100% + 8px); top: 50%;
      transform: translateY(-50%);
      background: rgba(0,0,0,.88); color: #fff;
      padding: 3px 9px; border-radius: 6px;
      font-size: .62rem; white-space: nowrap;
      opacity: 0; pointer-events: none;
      transition: opacity .2s; font-weight: 700;
    }
    .z-card-container .ai:hover .tt,
    .z-card-container .action-btn:hover .tt { opacity: 1; }

    /* ── Touch & Mobile Screen: Scroll-Focus Action Overlay ── */
    /* Touch devices can't hover, so the Shopify-style scroll-focus coordinator
       (useMobileCardFocus) adds .is-in-focus.active-card to the card nearest the
       reading band. Icons are HIDDEN by default here and SPAWN on the focused card
       (rules above). A direct tap also locks focus onto the touched card. */
    @media (max-width: 768px), (hover: none) {
      /* Base: action icons hidden until the card becomes scroll-focused */
      .z-card-container .card-actions,
      .z-card-container .aic {
        opacity: 0;
        transform: translate3d(10px, 0, 0);
        will-change: transform, opacity;
        pointer-events: none;
        right: 6px;
        top: 6px;
        gap: 5px;
        transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Cursor hover reveal for pointer devices in mobile widths (e.g. customizer mobile preview) */
      .z-card-container:hover .card-actions,
      .z-card-container:hover .aic,
      .group:hover .card-actions,
      .group:hover .aic {
        opacity: 1 !important;
        transform: translate3d(0, 0, 0) !important;
        pointer-events: auto !important;
      }

      .z-card-container .action-btn,
      .z-card-container .ai {
        width: 28px !important;
        height: 28px !important;
        min-width: 28px !important;
        min-height: 28px !important;
        background: rgba(255, 255, 255, 0.95);
        color: #1f2937;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.14);
        will-change: transform, opacity;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, color 0.2s ease;
      }

      .dark .z-card-container .action-btn,
      .dark .z-card-container .ai {
        background: rgba(22, 22, 42, 0.95);
        color: #f3f4f6;
      }

      /* Base: Images normal state when not in focus */
      .z-card-container .hover-fade-out {
        opacity: 1 !important;
        transition: opacity 0.35s ease !important;
      }
      .z-card-container .hover-fade-in {
        opacity: 0 !important;
        transition: opacity 0.35s ease !important;
      }
      .z-card-container .hover-zoom {
        transform: scale(1) !important;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

    }

    .z-card-container .rat { display: flex; align-items: center; gap: 3px; margin-bottom: 3px; }
    .z-card-container .rat .st { color: #f59e0b; font-size: .62rem; }
    .z-card-container .rat .rc { font-size: .58rem; color: #888; }

    .z-card-container .swatches {
      display: flex; align-items: center; gap: 4px;
      flex-wrap: wrap;
    }
    .z-card-container .sw {
      width: 14px; height: 14px; border-radius: 50%;
      cursor: pointer; border: 2px solid rgba(255,255,255,.3);
      transition: var(--trans); flex-shrink: 0;
    }
    .z-card-container .sw:hover, .z-card-container .sw.on {
      transform: scale(1.25);
      border-color: rgba(255,255,255,.9);
      outline: 2px solid rgba(255,255,255,.4); outline-offset: 1px;
    }

    .z-card-container .spills { display: flex; align-items: center; gap: 3px; flex-wrap: wrap; }
    .z-card-container .sp {
      border: none; border-radius: 6px;
      padding: 2px 7px; font-size: .6rem; font-weight: 700;
      cursor: pointer; transition: var(--trans);
    }

    .z-card-container .prow { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
    .z-card-container .pold { text-decoration: line-through; text-decoration-color: #ef4444; text-decoration-thickness: 1.5px; color: #888; font-size: .7rem; }

    .z-card-container .abtn {
      width: 100%; border: none; border-radius: 50px;
      padding: 7px 12px; font-size: .68rem; font-weight: 800;
      letter-spacing: .5px; cursor: pointer; text-transform: uppercase;
      transition: var(--trans); display: flex; align-items: center;
      justify-content: center; gap: 5px;
    }

    /* Showcase 1: Minimalist Clean */
    .z-card-container .sc1 {
      background: #fff; border-radius: 12px; overflow: hidden;
      border: 1px solid #eaeaea; transition: var(--trans);
      display: flex; flex-direction: column; height: 100%;
    }
    .z-card-container .sc1:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,.08); border-color: transparent; }
    .z-card-container .sc1 .ib { position: relative; width: 100%; overflow: hidden; background: #f8f8f8; }
    .z-card-container .sc1 .ib img { width: 100%; height: 100%; object-fit: cover; transition: var(--trans); }
    .z-card-container .sc1:hover .ib img { transform: scale(1.06); }
    .z-card-container .sc1 .cb { padding: 12px; display: flex; flex-direction: column; flex-grow: 1; }
    .z-card-container .sc1 .ct { font-size: .62rem; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 700; margin-bottom: 2px; }
    .z-card-container .sc1 .ttl { font-size: .82rem; font-weight: 700; color: #111; margin-bottom: 6px; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .z-card-container .sc1 .prc { font-size: .92rem; font-weight: 900; color: #111; }
    .z-card-container .sc1 .ai { background: #fff; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
    .z-card-container .sc1 .ai:hover { background: #111; color: #fff; }
    .z-card-container .sc1 .abtn { background: #111; color: #fff; margin-top: auto; }
    .z-card-container .sc1 .abtn:hover { background: #e94560; }

    /* ──────────────────────────────────────────────────────────────────────────
       Showcase 8 — Geometric Mondrian
       Color-blocked, bold geometry inspired by Piet Mondrian
    ────────────────────────────────────────────────────────────────────────── */
    .z-card-container .sc8 {
      background: #fff;
      border: 3px solid #000;
      border-radius: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      transition: var(--trans);
    }
    .z-card-container .sc8:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
    .z-card-container .sc8 .img-box {
      position: relative;
      width: 100%;
      overflow: hidden;
      border-bottom: 3px solid #000;
      background: #fef9e7;
    }
    .z-card-container .sc8 .img-box img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.35s ease;
    }
    .z-card-container .sc8:hover .img-box img { transform: scale(1.05); }
    .z-card-container .sc8 .accent-bar {
      height: 6px;
      background: linear-gradient(90deg, #e94560 33%, #f59e0b 33% 66%, #2563eb 66%);
    }
    .z-card-container .sc8 .cb {
      padding: 10px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .z-card-container .sc8 .ttl {
      font-size: 0.8rem !important;
      font-weight: 800 !important;
      color: #000;
      line-height: 1.2;
      margin-bottom: 4px;
    }
    .z-card-container .sc8 .prc { font-size: 0.88rem; font-weight: 900; color: #000; }
    .z-card-container .sc8 .pold { font-size: 0.68rem; color: #999; text-decoration: line-through; text-decoration-color: #ef4444; }
    .z-card-container .sc8 .card-actions { right: 8px; top: 8px; }
    .z-card-container .sc8 .action-btn,
    .z-card-container .sc8 .ai {
      background: #fff;
      color: #000;
      border: 2px solid #000;
      border-radius: 0;
      box-shadow: 2px 2px 0 #000;
    }
    .z-card-container .sc8 .action-btn:hover,
    .z-card-container .sc8 .ai:hover {
      background: #e94560;
      color: #fff;
      border-color: #e94560;
      box-shadow: none;
    }

    /* ──────────────────────────────────────────────────────────────────────────
       Showcase 10 — Organic & Wavy
       Soft organic shapes, warm cream tones, nature-inspired fashion look
    ────────────────────────────────────────────────────────────────────────── */
    .z-card-container .sc10 {
      background: #fffdf8;
      border-radius: 24px 24px 16px 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1.5px solid #e8e0d0;
      box-shadow: 0 2px 8px rgba(120,80,40,0.07);
      transition: var(--trans);
    }
    .z-card-container .sc10:hover {
      box-shadow: 0 8px 28px rgba(120,80,40,0.14);
      transform: translateY(-3px);
      border-color: #c9a97a;
    }
    .z-card-container .sc10 .img-box {
      position: relative;
      width: 100%;
      overflow: hidden;
      background: linear-gradient(160deg, #fdf6ec 0%, #f5e6d0 100%);
      border-radius: 24px 24px 0 0;
    }
    .z-card-container .sc10 .img-box img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
    }
    .z-card-container .sc10:hover .img-box img { transform: scale(1.05); }
    .z-card-container .sc10 .cb {
      padding: 10px 12px 12px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .z-card-container .sc10 .dot-line {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 4px;
    }
    .z-card-container .sc10 .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-primary, #C2185B);
    }
    .z-card-container .sc10 .cat {
      font-size: 0.55rem;
      color: #a0856b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .z-card-container .sc10 .ttl {
      font-size: 0.78rem !important;
      font-weight: 600 !important;
      color: #3d2b1f;
      line-height: 1.3;
      margin-bottom: 6px;
    }
    .z-card-container .sc10 .prc {
      font-size: 0.88rem;
      font-weight: 800;
      color: var(--color-primary, #C2185B);
      margin-top: auto;
    }
    .z-card-container .sc10 .pold {
      font-size: 0.68rem;
      color: #bbb;
      text-decoration: line-through;
      text-decoration-color: #ef4444;
      margin-left: 4px;
    }
    .z-card-container .sc10 .card-actions { right: 10px; top: 10px; }
    .z-card-container .sc10 .action-btn,
    .z-card-container .sc10 .ai {
      background: rgba(255,253,248,0.95);
      color: #3d2b1f;
      border: 1.5px solid #e8e0d0;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(120,80,40,0.12);
    }
    .z-card-container .sc10 .action-btn:hover,
    .z-card-container .sc10 .ai:hover {
      background: var(--color-primary, #C2185B);
      color: #fff;
      border-color: transparent;
    }

    /* ──────────────────────────────────────────────────────────────────────────
       Showcase 11 — Luxe Noir
       Ultra-premium black & gold luxury (Gucci / Saint Laurent vibe)
    ────────────────────────────────────────────────────────────────────────── */
    .z-card-container .sc11 {
      background: #0c0c0c;
      border: 1px solid #26241d;
      border-radius: 6px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      transition: var(--trans);
    }
    .z-card-container .sc11:hover {
      border-color: #c9a44c;
      box-shadow: 0 14px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,164,76,0.25);
      transform: translateY(-3px);
    }
    .z-card-container .sc11 .img-box {
      position: relative;
      width: 100%;
      overflow: hidden;
      background: linear-gradient(145deg, #1a1a1a 0%, #050505 100%);
    }
    .z-card-container .sc11 .img-box img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
    }
    .z-card-container .sc11:hover .img-box img { transform: scale(1.06); }
    .z-card-container .sc11 .cb {
      padding: 12px 14px 14px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      border-top: 1px solid rgba(201,164,76,0.18);
    }
    .z-card-container .sc11 .card-title,
    .z-card-container .sc11 .product-card-title {
      color: #f3ecd9 !important;
      letter-spacing: 0.4px !important;
    }
    .z-card-container .sc11 .card-price,
    .z-card-container .sc11 .prc {
      color: #c9a44c;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .z-card-container .sc11 .pold { color: #7a7568 !important; }
    .z-card-container .sc11 .rc { color: #8a8470 !important; }
    .z-card-container .sc11 .action-btn,
    .z-card-container .sc11 .ai {
      background: rgba(12,12,12,0.75);
      color: #c9a44c;
      border: 1px solid rgba(201,164,76,0.5);
      border-radius: 50%;
      backdrop-filter: blur(6px);
      box-shadow: none;
    }
    .z-card-container .sc11 .action-btn:hover,
    .z-card-container .sc11 .ai:hover {
      background: #c9a44c;
      color: #0c0c0c;
      border-color: #c9a44c;
    }

    /* ──────────────────────────────────────────────────────────────────────────
       Showcase 12 — Pure Editorial
       Scandinavian minimal, airy whitespace, sharp edges (COS / Arket vibe)
    ────────────────────────────────────────────────────────────────────────── */
    .z-card-container .sc12 {
      background: #ffffff;
      border: none;
      border-radius: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: var(--trans);
    }
    .z-card-container .sc12:hover { transform: translateY(-2px); }
    .z-card-container .sc12 .img-box {
      position: relative;
      width: 100%;
      overflow: hidden;
      background: #f4f3f1;
    }
    .z-card-container .sc12 .img-box img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.7s cubic-bezier(0.16,1,0.3,1);
    }
    .z-card-container .sc12:hover .img-box img { transform: scale(1.04); }
    .z-card-container .sc12 .cb {
      padding: 14px 2px 6px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 2px;
    }
    .z-card-container .sc12 .card-title,
    .z-card-container .sc12 .product-card-title {
      color: #1a1a1a !important;
      font-weight: 400 !important;
    }
    .z-card-container .sc12 .card-price,
    .z-card-container .sc12 .prc {
      color: #1a1a1a;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .z-card-container .sc12 .pold { color: #b0b0b0 !important; }
    .z-card-container .sc12 .action-btn,
    .z-card-container .sc12 .ai {
      background: #ffffff;
      color: #1a1a1a;
      border: 1px solid #e4e2de;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }
    .z-card-container .sc12 .action-btn:hover,
    .z-card-container .sc12 .ai:hover {
      background: #1a1a1a;
      color: #fff;
      border-color: #1a1a1a;
    }

    /* ──────────────────────────────────────────────────────────────────────────
       Showcase 13 — Soft Pastel Glow
       Beauty-brand softness, rounded, pill price tag (Glossier vibe)
    ────────────────────────────────────────────────────────────────────────── */
    .z-card-container .sc13 {
      background: #fdf2f4;
      border: none;
      border-radius: 22px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      box-shadow: 0 4px 18px rgba(236,153,172,0.18);
      transition: var(--trans);
    }
    .z-card-container .sc13:hover {
      box-shadow: 0 10px 32px rgba(236,153,172,0.30);
      transform: translateY(-3px);
    }
    .z-card-container .sc13 .img-box {
      position: relative;
      width: 100%;
      overflow: hidden;
      background: #fce4ea;
      border-radius: 22px 22px 0 0;
    }
    .z-card-container .sc13 .img-box img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
    }
    .z-card-container .sc13:hover .img-box img { transform: scale(1.05); }
    .z-card-container .sc13 .cb {
      padding: 12px 14px 14px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 4px;
    }
    .z-card-container .sc13 .card-title,
    .z-card-container .sc13 .product-card-title {
      color: #5a3a44 !important;
    }
    .z-card-container .sc13 .card-price,
    .z-card-container .sc13 .prc {
      display: inline-block;
      width: fit-content;
      background: var(--color-primary, #e94560);
      color: #fff;
      padding: 3px 12px;
      border-radius: 50px;
      font-weight: 800;
      font-size: 0.78rem;
      margin-top: 2px;
    }
    .z-card-container .sc13 .prow { align-items: center; }
    .z-card-container .sc13 .pold { color: #c99aa6 !important; }
    .z-card-container .sc13 .action-btn,
    .z-card-container .sc13 .ai {
      background: rgba(255,255,255,0.9);
      color: #c0506a;
      border: none;
      border-radius: 50%;
      box-shadow: 0 2px 10px rgba(236,153,172,0.3);
    }
    .z-card-container .sc13 .action-btn:hover,
    .z-card-container .sc13 .ai:hover {
      background: var(--color-primary, #e94560);
      color: #fff;
    }

    /* ──────────────────────────────────────────────────────────────────────────
       Showcase 14 — Street Bold
       Heavy streetwear energy, condensed caps, bold price block (Nike / Supreme vibe)
    ────────────────────────────────────────────────────────────────────────── */
    .z-card-container .sc14 {
      background: #ffffff;
      border: 2px solid #111;
      border-radius: 2px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      transition: var(--trans);
    }
    .z-card-container .sc14:hover { transform: translateY(-3px); box-shadow: 0 10px 0 -2px #111, 0 16px 30px rgba(0,0,0,0.18); }
    .z-card-container .sc14 .img-box {
      position: relative;
      width: 100%;
      overflow: hidden;
      background: #f0f0f0;
      border-bottom: 2px solid #111;
    }
    .z-card-container .sc14 .img-box img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.4s ease;
    }
    .z-card-container .sc14:hover .img-box img { transform: scale(1.07); }
    .z-card-container .sc14 .cb {
      padding: 10px 12px 12px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 5px;
    }
    .z-card-container .sc14 .card-title,
    .z-card-container .sc14 .product-card-title {
      color: #111 !important;
      font-weight: 900 !important;
      text-transform: uppercase !important;
      letter-spacing: -0.2px !important;
      line-height: 1.1 !important;
    }
    .z-card-container .sc14 .card-price,
    .z-card-container .sc14 .prc {
      display: inline-block;
      width: fit-content;
      background: var(--color-primary, #e94560);
      color: #fff;
      padding: 2px 8px;
      font-weight: 900;
      font-size: 0.82rem;
      transform: skewX(-6deg);
    }
    .z-card-container .sc14 .prow { margin-top: auto; }
    .z-card-container .sc14 .pold { color: #999 !important; }
    .z-card-container .sc14 .action-btn,
    .z-card-container .sc14 .ai {
      background: #111;
      color: #fff;
      border: none;
      border-radius: 2px;
      box-shadow: none;
    }
    .z-card-container .sc14 .action-btn:hover,
    .z-card-container .sc14 .ai:hover {
      background: var(--color-primary, #e94560);
      color: #fff;
    }

    /* ──────────────────────────────────────────────────────────────────────────
       Showcase 15 — Frosted Glass
       Apple-grade premium, frosted content strip overlapping image (tech vibe)
    ────────────────────────────────────────────────────────────────────────── */
    .z-card-container .sc15 {
      background: #eef1f5;
      border: 1px solid rgba(255,255,255,0.6);
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      box-shadow: 0 6px 24px rgba(30,40,60,0.10);
      transition: var(--trans);
    }
    .z-card-container .sc15:hover {
      box-shadow: 0 14px 40px rgba(30,40,60,0.18);
      transform: translateY(-3px);
    }
    .z-card-container .sc15 .img-box {
      position: relative;
      width: 100%;
      overflow: hidden;
      background: linear-gradient(160deg, #dfe6ef 0%, #c9d4e2 100%);
      border-radius: 20px 20px 0 0;
    }
    .z-card-container .sc15 .img-box img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
    }
    .z-card-container .sc15:hover .img-box img { transform: scale(1.05); }
    .z-card-container .sc15 .cb {
      position: relative;
      margin-top: -22px;
      margin-left: 10px;
      margin-right: 10px;
      padding: 10px 12px 12px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 3px;
      background: rgba(255,255,255,0.65);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.7);
      border-radius: 16px;
      z-index: 4;
      box-shadow: 0 4px 16px rgba(30,40,60,0.08);
    }
    .z-card-container .sc15 .card-title,
    .z-card-container .sc15 .product-card-title {
      color: #1d2733 !important;
      font-weight: 600 !important;
    }
    .z-card-container .sc15 .card-price,
    .z-card-container .sc15 .prc {
      color: #0a84ff;
      font-weight: 800;
    }
    .z-card-container .sc15 .pold { color: #9aa3af !important; }
    .z-card-container .sc15 .action-btn,
    .z-card-container .sc15 .ai {
      background: rgba(255,255,255,0.7);
      color: #1d2733;
      border: 1px solid rgba(255,255,255,0.8);
      border-radius: 50%;
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 10px rgba(30,40,60,0.12);
    }
    .z-card-container .sc15 .action-btn:hover,
    .z-card-container .sc15 .ai:hover {
      background: #0a84ff;
      color: #fff;
      border-color: #0a84ff;
    }

    /* ──────────────────────────────────────────────────────────────────────────
       Showcase 16 — Terracotta Boutique
       Artisan warmth, elegant italic serif title, earthy tones (Anthropologie vibe)
    ────────────────────────────────────────────────────────────────────────── */
    .z-card-container .sc16 {
      background: #f7f1e8;
      border: 1px solid #e3d6c2;
      border-radius: 14px 14px 4px 4px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      box-shadow: 0 3px 12px rgba(150,100,60,0.08);
      transition: var(--trans);
    }
    .z-card-container .sc16:hover {
      box-shadow: 0 10px 30px rgba(150,100,60,0.16);
      transform: translateY(-3px);
      border-color: #c08457;
    }
    .z-card-container .sc16 .img-box {
      position: relative;
      width: 100%;
      overflow: hidden;
      background: linear-gradient(160deg, #efe4d3 0%, #e3d1b8 100%);
      border-radius: 14px 14px 0 0;
    }
    .z-card-container .sc16 .img-box img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
    }
    .z-card-container .sc16:hover .img-box img { transform: scale(1.05); }
    .z-card-container .sc16 .cb {
      padding: 12px 14px 14px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 3px;
    }
    .z-card-container .sc16 .card-title,
    .z-card-container .sc16 .product-card-title {
      color: #4a3324 !important;
      font-family: Georgia, 'Times New Roman', serif !important;
      font-style: italic !important;
      font-weight: 500 !important;
    }
    .z-card-container .sc16 .card-price,
    .z-card-container .sc16 .prc {
      color: #c0603a;
      font-weight: 800;
      letter-spacing: 0.3px;
      margin-top: auto;
    }
    .z-card-container .sc16 .pold { color: #b7a68f !important; }
    .z-card-container .sc16 .action-btn,
    .z-card-container .sc16 .ai {
      background: rgba(247,241,232,0.95);
      color: #4a3324;
      border: 1px solid #e3d6c2;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(150,100,60,0.12);
    }
    .z-card-container .sc16 .action-btn:hover,
    .z-card-container .sc16 .ai:hover {
      background: #c0603a;
      color: #fff;
      border-color: transparent;
    }

    /* ── SC20: ZARA HAUTE EDITORIAL ── */
    .z-card-container .sc20 {
      background: transparent;
      border: 1px solid rgba(0,0,0,0.06);
      border-radius: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: border-color 0.25s ease, box-shadow 0.25s ease;
    }
    .dark .z-card-container .sc20 {
      border-color: rgba(255,255,255,0.08);
    }
    .z-card-container .sc20:hover,
    .z-card-container.is-in-focus .sc20 {
      border-color: rgba(0,0,0,0.2);
    }
    .dark .z-card-container .sc20:hover,
    .dark .z-card-container.is-in-focus .sc20 {
      border-color: rgba(255,255,255,0.25);
    }
    .z-card-container .sc20 .slide-drawer-btn {
      transform: translate3d(0, 100%, 0);
      opacity: 0;
      transition: transform 0.26s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
      will-change: transform, opacity;
    }
    .z-card-container:hover .sc20 .slide-drawer-btn,
    .z-card-container.is-in-focus .sc20 .slide-drawer-btn,
    .z-card-container.active-card .sc20 .slide-drawer-btn,
    .group:hover .sc20 .slide-drawer-btn {
      transform: translate3d(0, 0, 0) !important;
      opacity: 1 !important;
    }

    /* ── SC21: DARAZ DEAL RUSH ── */
    .z-card-container .sc21 {
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .dark .z-card-container .sc21 {
      background: #151525;
      border-color: rgba(255,255,255,0.08);
    }
    .z-card-container .sc21:hover,
    .z-card-container.is-in-focus .sc21 {
      transform: translate3d(0, -2px, 0);
      box-shadow: 0 6px 20px rgba(248,86,6,0.12);
      border-color: rgba(248,86,6,0.3);
    }
    .z-card-container .sc21 .direct-cart-btn {
      background: var(--color-primary, #f85606);
      transition: transform 0.18s ease, filter 0.18s ease;
    }
    .z-card-container .sc21 .direct-cart-btn:hover {
      filter: brightness(1.06);
      transform: scale(1.01);
    }

    /* ── SC22: NIKE STREETWEAR ── */
    .z-card-container .sc22 {
      background: #fafafa;
      border: 1px solid #eaeaea;
      border-radius: 14px;
      overflow: visible;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }
    .dark .z-card-container .sc22 {
      background: #16162a;
      border-color: #262640;
    }
    .z-card-container .sc22:hover,
    .z-card-container.is-in-focus .sc22 {
      transform: translate3d(0, -3px, 0);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      border-color: #111827;
    }
    .dark .z-card-container .sc22:hover,
    .dark .z-card-container.is-in-focus .sc22 {
      border-color: #6366f1;
    }
    .z-card-container .sc22 .corner-fab-btn {
      transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
      will-change: transform;
    }
    .z-card-container:hover .sc22 .corner-fab-btn,
    .z-card-container.is-in-focus .sc22 .corner-fab-btn,
    .z-card-container.active-card .sc22 .corner-fab-btn {
      transform: scale(1.08) !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.24) !important;
    }

    /* ── SC23: AMAZON MARKETPLACE ── */
    .z-card-container .sc23 {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: box-shadow 0.22s ease, border-color 0.22s ease;
    }
    .dark .z-card-container .sc23 {
      background: #141424;
      border-color: #27273a;
    }
    .z-card-container .sc23:hover,
    .z-card-container.is-in-focus .sc23 {
      border-color: #f59e0b;
      box-shadow: 0 4px 18px rgba(245,158,11,0.1);
    }
    .z-card-container .sc23 .split-btn-cart {
      background: var(--color-primary, #b12704);
    }

    /* ── SC24: SEPHORA CHIC ── */
    .z-card-container .sc24 {
      background: #ffffff;
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 18px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .dark .z-card-container .sc24 {
      background: #171728;
      border-color: rgba(255,255,255,0.07);
    }
    .z-card-container .sc24:hover,
    .z-card-container.is-in-focus .sc24 {
      transform: translate3d(0, -3px, 0);
      box-shadow: 0 8px 24px rgba(236,72,153,0.1);
      border-color: rgba(236,72,153,0.3);
    }
    .z-card-container .sc24 .center-pill-btn {
      opacity: 0;
      transform: translate3d(0, 8px, 0);
      transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform, opacity;
    }
    .z-card-container:hover .sc24 .center-pill-btn,
    .z-card-container.is-in-focus .sc24 .center-pill-btn,
    .z-card-container.active-card .sc24 .center-pill-btn,
    .group:hover .sc24 .center-pill-btn {
      opacity: 1 !important;
      transform: translate3d(0, 0, 0) !important;
    }

    @media (max-width: 640px) {
        .grid-cols-2 .z-card-container .aic,
        .grid-cols-2 .z-card-container .card-actions {
            right: 4px !important;
            top: 4px !important;
            gap: 4px !important;
        }
        .grid-cols-2 .z-card-container.is-in-focus .aic,
        .grid-cols-2 .z-card-container.is-in-focus .card-actions,
        .grid-cols-2 .z-card-container.active-card .aic,
        .grid-cols-2 .z-card-container.active-card .card-actions,
        .grid-cols-2 .z-card-container:hover .aic,
        .grid-cols-2 .z-card-container:hover .card-actions,
        .grid-cols-2 .group:hover .aic,
        .grid-cols-2 .group:hover .card-actions {
            opacity: 1 !important;
            transform: translateX(0) !important;
            pointer-events: auto !important;
        }
        .grid-cols-2 .z-card-container .ai {
            width: 24px !important;
            height: 24px !important;
        }
        .grid-cols-2 .z-card-container .ai svg {
            width: 11px !important;
            height: 11px !important;
        }
        .grid-cols-2 .z-card-container .bdg-container {
            top: 6px !important;
            left: 6px !important;
            gap: 2px !important;
            max-width: calc(100% - 36px) !important;
            pointer-events: none !important;
        }
        .grid-cols-2 .z-card-container .bdg {
            padding: 2px 6px !important;
            font-size: 0.5rem !important;
        }

        .grid-cols-2 .z-card-container .sc1,
        .grid-cols-2 .z-card-container .sc8,
        .grid-cols-2 .z-card-container .sc10,
        .grid-cols-2 .z-card-container .sc11,
        .grid-cols-2 .z-card-container .sc12,
        .grid-cols-2 .z-card-container .sc13,
        .grid-cols-2 .z-card-container .sc14,
        .grid-cols-2 .z-card-container .sc15,
        .grid-cols-2 .z-card-container .sc16,
        .grid-cols-2 .z-card-container .sc20,
        .grid-cols-2 .z-card-container .sc21,
        .grid-cols-2 .z-card-container .sc22,
        .grid-cols-2 .z-card-container .sc23,
        .grid-cols-2 .z-card-container .sc24 {
            padding: 0 !important;
        }

        .grid-cols-2 .z-card-container .sc20 .slide-drawer-btn {
            padding: 6px 8px !important;
            font-size: 9.5px !important;
            letter-spacing: 0.5px !important;
        }
        .grid-cols-2 .z-card-container .sc21 .direct-cart-btn {
            padding: 5px 8px !important;
            font-size: 10.5px !important;
            border-radius: 8px !important;
        }
        .grid-cols-2 .z-card-container .sc22 .corner-fab-btn {
            width: 32px !important;
            height: 32px !important;
            bottom: -16px !important;
            right: 8px !important;
            z-index: 30 !important;
        }
        .grid-cols-2 .z-card-container .sc22 .corner-fab-btn svg {
            width: 14px !important;
            height: 14px !important;
        }
        .grid-cols-2 .z-card-container .sc23 .split-action-bar button {
            padding: 4px 4px !important;
            font-size: 9.5px !important;
        }
        .grid-cols-2 .z-card-container .sc24 .center-pill-btn {
            padding: 4px 8px !important;
            font-size: 9.5px !important;
        }
    }

    /* Enforce disciplined compact typography for product card titles in all showcases */
    .z-card-container .card-title,
    .z-card-container .product-card-title,
    .z-card-container .ttl,
    .card-title,
    .product-card-title {
        font-family: var(--font-body, system-ui, sans-serif) !important;
        font-size: 0.72rem !important;
        line-height: 1.25 !important;
        font-weight: 600 !important;
        text-transform: none !important;
        letter-spacing: normal !important;
        margin-bottom: 3px !important;
    }
    @media (min-width: 640px) {
        .z-card-container .card-title,
        .z-card-container .product-card-title,
        .z-card-container .ttl,
        .card-title,
        .product-card-title {
            font-size: 0.82rem !important;
        }
    }

    /* ── Reliable CSS Line-Clamp bound to Admin Settings ── */
    .title-clamp-1,
    .z-card-container .title-clamp-1 {
      display: -webkit-box !important;
      -webkit-box-orient: vertical !important;
      -webkit-line-clamp: 1 !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      word-break: break-word !important;
    }

    .title-clamp-2,
    .z-card-container .title-clamp-2 {
      display: -webkit-box !important;
      -webkit-box-orient: vertical !important;
      -webkit-line-clamp: 2 !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      word-break: break-word !important;
    }

    .title-clamp-none,
    .z-card-container .title-clamp-none {
      display: block !important;
      -webkit-line-clamp: unset !important;
      overflow: visible !important;
      text-overflow: clip !important;
    }
`;

export const ProductCardStyleInjector: React.FC = () => (
  <style dangerouslySetInnerHTML={{ __html: customCss }} />
);
