'use client';

import React from 'react';

interface StickyAndTopBarSettingsProps {
  headerStickyDesktop: boolean;
  setHeaderStickyDesktop: (val: boolean) => void;
  headerStickyMobile: boolean;
  setHeaderStickyMobile: (val: boolean) => void;
  headerShowTopBar: boolean;
  setHeaderShowTopBar: (val: boolean) => void;
  headerShowNewsletter: boolean;
  setHeaderShowNewsletter: (val: boolean) => void;
  headerTopBarPhone: string;
  setHeaderTopBarPhone: (val: string) => void;
  headerTopBarEmail: string;
  setHeaderTopBarEmail: (val: string) => void;
  headerNewsletterText: string;
  setHeaderNewsletterText: (val: string) => void;
}

export default function StickyAndTopBarSettings({
  headerStickyDesktop,
  setHeaderStickyDesktop,
  headerStickyMobile,
  setHeaderStickyMobile,
  headerShowTopBar,
  setHeaderShowTopBar,
  headerShowNewsletter,
  setHeaderShowNewsletter,
  headerTopBarPhone,
  setHeaderTopBarPhone,
  headerTopBarEmail,
  setHeaderTopBarEmail,
  headerNewsletterText,
  setHeaderNewsletterText,
}: StickyAndTopBarSettingsProps) {
  return (
    <>
      {/* Sticky Behavior Option */}
      <div className="space-y-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Sticky Behavior</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer select-none text-gray-750 dark:text-gray-200">
            <input
              type="checkbox"
              checked={headerStickyDesktop}
              onChange={(e) => setHeaderStickyDesktop(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable Sticky Header (Desktop)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none text-gray-750 dark:text-gray-200">
            <input
              type="checkbox"
              checked={headerStickyMobile}
              onChange={(e) => setHeaderStickyMobile(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable Sticky Header (Mobile)</span>
          </label>
        </div>
      </div>

      {/* Part 1: Top Bar & Announcement */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Top Contact & Announcement Bar</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 cursor-pointer select-none text-gray-750 dark:text-gray-200">
            <input
              type="checkbox"
              checked={headerShowTopBar}
              onChange={(e) => setHeaderShowTopBar(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable Contact Top Bar</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none text-gray-750 dark:text-gray-200">
            <input
              type="checkbox"
              checked={headerShowNewsletter}
              onChange={(e) => setHeaderShowNewsletter(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable Announcement Ticker</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Top Bar Phone / WhatsApp</label>
            <input
              type="text"
              disabled={!headerShowTopBar}
              value={headerTopBarPhone}
              onChange={(e) => setHeaderTopBarPhone(e.target.value)}
              placeholder="e.g. 0328-4114551"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Top Bar Email</label>
            <input
              type="email"
              disabled={!headerShowTopBar}
              value={headerTopBarEmail}
              onChange={(e) => setHeaderTopBarEmail(e.target.value)}
              placeholder="e.g. support@store.com"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 flex justify-between items-center">
            <span>Announcement Ticker Text</span>
            <span className="text-[10px] text-gray-400 font-semibold lowercase">Enter multiple lines (one per line) to rotate them</span>
          </label>
          <textarea
            disabled={!headerShowNewsletter}
            value={headerNewsletterText}
            onChange={(e) => setHeaderNewsletterText(e.target.value)}
            placeholder="e.g. Free Delivery across Pakistan!&#10;Summer Sale Off 50%!&#10;Shop our new arrivals now!"
            rows={3}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white disabled:opacity-50 font-semibold"
          />
        </div>
      </div>
    </>
  );
}
