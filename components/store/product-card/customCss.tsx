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
    }
    
    /* Shared components scoped inside z-card-container */
    .z-card-container .bdg-container {
      position: absolute; top: 12px; left: 12px;
      display: flex; flex-direction: column; gap: 4px;
      z-index: 10; align-items: flex-start;
    }
    .z-card-container .bdg {
      display: inline-block;
      padding: 3px 9px; border-radius: 20px;
      font-size: .6rem; font-weight: 800;
      letter-spacing: 1px; text-transform: uppercase;
      line-height: 1;
    }
    .z-card-container .bdg-new { background: #d97706; color: #fff; }
    .z-card-container .bdg-hot { background: #ea580c; color: #fff; }
    .z-card-container .bdg-sale { background: #10b981; color: #fff; }
    .z-card-container .bdg-featured { background: #e94560; color: #fff; }

    /* Universal Quick Action Controls Overlay */
    .z-card-container .card-actions,
    .z-card-container .aic {
      position: absolute; right: 8px; top: 8px;
      display: flex; flex-direction: column; gap: 5px;
      z-index: 25;
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
      position: relative;
    }
    .z-card-container .action-btn:hover,
    .z-card-container .ai:hover {
      transform: scale(1.1);
      background: var(--color-primary, #e94560);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .z-card-container .action-btn:active,
    .z-card-container .ai:active {
      transform: scale(0.92);
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
        opacity: 0 !important;
        transform: translate3d(10px, 0, 0) !important;
        will-change: transform, opacity;
        pointer-events: none !important;
        right: 6px !important;
        top: 6px !important;
        gap: 5px !important;
        transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      .z-card-container .action-btn,
      .z-card-container .ai {
        width: 28px !important;
        height: 28px !important;
        min-width: 28px !important;
        min-height: 28px !important;
        background: rgba(255, 255, 255, 0.92) !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.14) !important;
        will-change: transform, opacity;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease !important;
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
    .z-card-container .sc1 .ib { position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; background: #f8f8f8; }
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
        .grid-cols-2 .z-card-container.active-card .card-actions {
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
        }
        .grid-cols-2 .z-card-container .bdg {
            padding: 2px 6px !important;
            font-size: 0.5rem !important;
        }

        .grid-cols-2 .z-card-container .sc1,
        .grid-cols-2 .z-card-container .sc8,
        .grid-cols-2 .z-card-container .sc10 {
            padding: 0 !important;
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
