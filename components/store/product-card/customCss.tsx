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

    /* Image swap base states — MUST be global, not inside hover media query */
    /* hover-fade-out = primary image: visible by default, hides on hover/touch */
    .z-card-container .hover-fade-out {
      opacity: 1;
      transition: opacity 0.2s ease;
    }
    /* hover-fade-in = secondary image: hidden by default, shows on hover/touch */
    .z-card-container .hover-fade-in {
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    /* hover-zoom base: always has transition so touch-active scale is smooth */
    .z-card-container .hover-zoom {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
      /* Image hover effects — desktop only */
      .z-card-container:hover .hover-zoom {
        transform: scale(1.05);
      }
      .z-card-container:hover .hover-fade-out {
        opacity: 0 !important;
      }
      .z-card-container:hover .hover-fade-in {
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

    /* Touch & Mobile Screen Support: clean tap targets, no hover artifacts */
    @media (max-width: 768px), (hover: none) {
      .z-card-container .card-actions,
      .z-card-container .aic {
        right: 8px !important;
        top: 8px !important;
        gap: 8px !important;
        /* Never show via CSS on touch — JS controls opacity via inline style */
        pointer-events: none !important;
      }
      .z-card-container .action-btn,
      .z-card-container .ai {
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
        min-height: 40px !important;
        background: rgba(255, 255, 255, 0.96) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18) !important;
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

    /* Showcase 2: Glassmorphism Floating Overlay */
    .z-card-container .sc2 {
      border-radius: 16px; overflow: hidden; position: relative;
      background: #000; transition: var(--trans); height: 100%;
    }
    .z-card-container .sc2:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,.25); }
    .z-card-container .sc2 .ib { position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; }
    .z-card-container .sc2 .ib img { width: 100%; height: 100%; object-fit: cover; transition: var(--trans); }
    .z-card-container .sc2:hover .ib img { transform: scale(1.08); }
    .z-card-container .sc2 .gcard {
      position: absolute; bottom: 8px; left: 8px; right: 8px;
      background: rgba(255,255,255,.18); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255,255,255,.3); border-radius: 12px; padding: 10px;
      transition: var(--trans); z-index: 5;
    }
    .z-card-container .sc2:hover .gcard { background: rgba(255,255,255,.28); border-color: rgba(255,255,255,.5); }
    .z-card-container .sc2 .ttl { font-size: .82rem; font-weight: 800; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.4); line-height: 1.2; margin-bottom: 4px; }
    .z-card-container .sc2 .prc { font-size: .95rem; font-weight: 900; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.4); }
    .z-card-container .sc2 .ai { background: rgba(255,255,255,.2); backdrop-filter: blur(8px); color: #fff; border: 1px solid rgba(255,255,255,.3); }
    .z-card-container .sc2 .ai:hover { background: #fff; color: #111; }
    .z-card-container .sc2 .abtn { background: #fff; color: #111; margin-top: 6px; }
    .z-card-container .sc2 .abtn:hover { background: #e94560; color: #fff; }

    /* Showcase 3: Cyberpunk / Bold High-Contrast Accent */
    .z-card-container .sc3 {
      background: #0f0f1b; border-radius: 14px; overflow: hidden;
      border: 1px solid #1e1e38; transition: var(--trans);
      display: flex; flex-direction: column; position: relative; height: 100%;
    }
    .z-card-container .sc3:hover { border-color: #e94560; box-shadow: 0 0 20px rgba(233,69,96,.3); transform: translateY(-3px); }
    .z-card-container .sc3 .ib { position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; background: #16162a; }
    .z-card-container .sc3 .ib img { width: 100%; height: 100%; object-fit: cover; transition: var(--trans); }
    .z-card-container .sc3:hover .ib img { transform: scale(1.05) rotate(1deg); }
    .z-card-container .sc3 .cb { padding: 12px; display: flex; flex-direction: column; flex-grow: 1; }
    .z-card-container .sc3 .ttl { font-size: .82rem; font-weight: 800; color: #fff; margin-bottom: 4px; line-height: 1.2; }
    .z-card-container .sc3 .prc { font-size: 1rem; font-weight: 900; color: #e94560; }
    .z-card-container .sc3 .ai { background: #1e1e38; color: #fff; border: 1px solid #2e2e50; }
    .z-card-container .sc3 .ai:hover { background: #e94560; border-color: #e94560; }
    .z-card-container .sc3 .abtn { background: #e94560; color: #fff; margin-top: auto; text-shadow: 0 1px 2px rgba(0,0,0,.3); }
    .z-card-container .sc3 .abtn:hover { background: #ff5573; box-shadow: 0 0 12px rgba(233,69,96,.6); }

    /* Showcase 4: Neo-Brutalist Bold Outlines */
    .z-card-container .sc4 {
      background: #fff; border-radius: 4px; overflow: hidden;
      border: 3px solid #000; box-shadow: 4px 4px 0 #000;
      transition: var(--trans); display: flex; flex-direction: column; height: 100%;
    }
    .z-card-container .sc4:hover { transform: translate(-2px, -2px); box-shadow: 7px 7px 0 #000; }
    .z-card-container .sc4 .ib { position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; border-bottom: 3px solid #000; background: #fff; }
    .z-card-container .sc4 .ib img { width: 100%; height: 100%; object-fit: cover; transition: var(--trans); }
    .z-card-container .sc4:hover .ib img { transform: scale(1.04); }
    .z-card-container .sc4 .cb { padding: 10px; display: flex; flex-direction: column; flex-grow: 1; background: #fff; }
    .z-card-container .sc4 .ttl { font-size: .85rem; font-weight: 900; color: #000; text-transform: uppercase; margin-bottom: 4px; line-height: 1.15; }
    .z-card-container .sc4 .prc { font-size: .98rem; font-weight: 900; color: #000; background: #ffe600; padding: 2px 6px; display: inline-block; border: 2px solid #000; border-radius: 3px; width: fit-content; }
    .z-card-container .sc4 .ai { background: #fff; color: #000; border: 2px solid #000; box-shadow: 2px 2px 0 #000; }
    .z-card-container .sc4 .ai:hover { background: #ffe600; transform: translate(-1px,-1px); box-shadow: 3px 3px 0 #000; }
    .z-card-container .sc4 .abtn { background: #000; color: #fff; border: 2px solid #000; border-radius: 4px; margin-top: auto; font-weight: 900; }
    .z-card-container .sc4 .abtn:hover { background: #ffe600; color: #000; box-shadow: 2px 2px 0 #000; }

    /* Showcase 5: Luxury Editorial Serif Style */
    .z-card-container .sc5 {
      background: #faf9f6; border-radius: 0; overflow: hidden;
      border: none; transition: var(--trans);
      display: flex; flex-direction: column; height: 100%;
    }
    .z-card-container .sc5:hover { transform: translateY(-3px); }
    .z-card-container .sc5 .ib { position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; background: #f0eee9; }
    .z-card-container .sc5 .ib img { width: 100%; height: 100%; object-fit: cover; transition: all .6s ease; }
    .z-card-container .sc5:hover .ib img { transform: scale(1.05); }
    .z-card-container .sc5 .cb { padding: 14px 6px 8px 6px; display: flex; flex-direction: column; flex-grow: 1; text-align: center; align-items: center; }
    .z-card-container .sc5 .ct { font-size: .58rem; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 4px; }
    .z-card-container .sc5 .ttl { font-family: Georgia, serif; font-size: .9rem; font-style: italic; color: #222; margin-bottom: 6px; line-height: 1.2; }
    .z-card-container .sc5 .prc { font-size: .88rem; font-weight: 700; color: #444; letter-spacing: .5px; }
    .z-card-container .sc5 .ai { background: rgba(255,255,255,.9); color: #222; border-radius: 0; }
    .z-card-container .sc5 .ai:hover { background: #222; color: #fff; }
    .z-card-container .sc5 .abtn { background: transparent; color: #222; border: 1px solid #222; border-radius: 0; margin-top: auto; letter-spacing: 2px; }
    .z-card-container .sc5 .abtn:hover { background: #222; color: #fff; }

    /* Showcase 6: Dark Elegance Gold */
    .z-card-container .sc6 {
        background: #111;
        color: #f1f1f1;
        box-shadow: 0 10px 40px rgba(0,0,0,0.8);
        border-radius: 20px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        position: relative;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        height: 100%;
    }
    .z-card-container .sc6 .img-box {
        position: relative;
        width: 100%;
        background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        overflow: hidden;
    }
    .z-card-container .sc6 .img-box img {
        transition: all 0.5s ease;
        filter: drop-shadow(0 15px 15px rgba(0,0,0,0.5));
    }
    .z-card-container .sc6:hover .img-box img {
        transform: scale(1.1);
        filter: drop-shadow(0 20px 20px rgba(212, 175, 55, 0.2));
    }
    .z-card-container .sc6 .card-actions {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        width: 100%;
        display: flex;
        gap: 15px;
        justify-content: center;
        background: rgba(0,0,0,0.7);
        padding: 20px 0;
        backdrop-filter: blur(4px);
        z-index: 10;
        transition: all 0.3s ease;
    }
    .z-card-container .sc6:hover .card-actions {
        opacity: 1;
    }

    /* ──────────────────────────────────────────────────────────────────────────
       Showcase 7 — Typographic Brutalist
       Bold text-forward design, high contrast, editorial feel
    ────────────────────────────────────────────────────────────────────────── */
    .z-card-container .sc7 {
      background: #fff;
      border: 2px solid #111;
      border-radius: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: var(--trans);
    }
    .z-card-container .sc7:hover { box-shadow: 6px 6px 0 #111; transform: translate(-2px, -2px); }
    .z-card-container .sc7 .img-box {
      position: relative;
      width: 100%;
      overflow: hidden;
      border-bottom: 2px solid #111;
      background: #f5f5f5;
    }
    .z-card-container .sc7 .img-box img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.4s ease;
    }
    .z-card-container .sc7:hover .img-box img { transform: scale(1.04); }
    .z-card-container .sc7 .cb {
      padding: 10px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 4px;
    }
    .z-card-container .sc7 .cat {
      font-size: 0.55rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #999;
      font-weight: 800;
    }
    .z-card-container .sc7 .ttl {
      font-size: 0.82rem !important;
      font-weight: 900 !important;
      color: #111;
      line-height: 1.15;
      text-transform: uppercase;
      letter-spacing: -0.3px;
    }
    .z-card-container .sc7 .prc-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: auto;
      padding-top: 6px;
      border-top: 1px solid #eee;
    }
    .z-card-container .sc7 .prc { font-size: 0.9rem; font-weight: 900; color: #111; }
    .z-card-container .sc7 .pold { font-size: 0.7rem; color: #aaa; text-decoration: line-through; }
    .z-card-container .sc7 .card-actions { right: 8px; top: 8px; }
    .z-card-container .sc7 .action-btn,
    .z-card-container .sc7 .ai {
      background: #111;
      color: #fff;
      border: none;
      border-radius: 0;
    }
    .z-card-container .sc7 .action-btn:hover,
    .z-card-container .sc7 .ai:hover {
      background: var(--color-primary, #e94560);
    }

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
    .z-card-container .sc8 .pold { font-size: 0.68rem; color: #999; text-decoration: line-through; }
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
       Showcase 9 — Material M3 Dynamic
       Google Material You inspired: rounded, soft elevation, tonal surface
    ────────────────────────────────────────────────────────────────────────── */
    .z-card-container .sc9 {
      background: #f8f0f4;
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04);
      transition: var(--trans);
      border: none;
    }
    .z-card-container .sc9:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08);
      transform: translateY(-2px);
    }
    .z-card-container .sc9 .img-box {
      position: relative;
      width: 100%;
      overflow: hidden;
      background: #f0eaf2;
      border-radius: 20px 20px 0 0;
    }
    .z-card-container .sc9 .img-box img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
    }
    .z-card-container .sc9:hover .img-box img { transform: scale(1.04); }
    .z-card-container .sc9 .cb {
      padding: 12px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 3px;
    }
    .z-card-container .sc9 .chip {
      display: inline-flex;
      align-items: center;
      background: rgba(var(--color-primary-rgb, 194,24,91), 0.12);
      color: var(--color-primary, #C2185B);
      border-radius: 50px;
      padding: 2px 8px;
      font-size: 0.55rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      width: fit-content;
      text-transform: uppercase;
    }
    .z-card-container .sc9 .ttl {
      font-size: 0.78rem !important;
      font-weight: 600 !important;
      color: #1c1b1f;
      line-height: 1.3;
    }
    .z-card-container .sc9 .prc {
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--color-primary, #C2185B);
      margin-top: auto;
    }
    .z-card-container .sc9 .pold {
      font-size: 0.68rem;
      color: #999;
      text-decoration: line-through;
    }
    .z-card-container .sc9 .card-actions { right: 8px; top: 8px; }
    .z-card-container .sc9 .action-btn,
    .z-card-container .sc9 .ai {
      background: rgba(255,255,255,0.9);
      color: #1c1b1f;
      border: none;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      backdrop-filter: blur(8px);
    }
    .z-card-container .sc9 .action-btn:hover,
    .z-card-container .sc9 .ai:hover {
      background: var(--color-primary, #C2185B);
      color: #fff;
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
        .grid-cols-2 .z-card-container .aic {
            opacity: 1 !important;
            transform: none !important;
            right: 4px !important;
            top: 4px !important;
            gap: 4px !important;
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
        .grid-cols-2 .z-card-container .sc2,
        .grid-cols-2 .z-card-container .sc3,
        .grid-cols-2 .z-card-container .sc4,
        .grid-cols-2 .z-card-container .sc5,
        .grid-cols-2 .z-card-container .sc6,
        .grid-cols-2 .z-card-container .sc7,
        .grid-cols-2 .z-card-container .sc8,
        .grid-cols-2 .z-card-container .sc9,
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
`;

export const ProductCardStyleInjector: React.FC = () => (
  <style dangerouslySetInnerHTML={{ __html: customCss }} />
);
