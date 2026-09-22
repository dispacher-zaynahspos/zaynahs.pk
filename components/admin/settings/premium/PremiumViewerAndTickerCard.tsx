'use client';

import React from 'react';

interface PremiumViewerAndTickerCardProps {
  enableFakeViews: boolean;
  setEnableFakeViews: (v: boolean) => void;
  minViews: number;
  setMinViews: (v: number) => void;
  maxViews: number;
  setMaxViews: (v: number) => void;
  enableTicker: boolean;
  setEnableTicker: (v: boolean) => void;
  tickerText: string;
  setTickerText: (v: string) => void;
}

export function PremiumViewerAndTickerCard({
  enableFakeViews,
  setEnableFakeViews,
  minViews,
  setMinViews,
  maxViews,
  setMaxViews,
  enableTicker,
  setEnableTicker,
  tickerText,
  setTickerText,
}: PremiumViewerAndTickerCardProps) {
  return (
    <>
      {/* Live Viewer Counter Settings */}
      <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#e94560] uppercase tracking-wider">Live Viewer Counter</h3>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold block mt-0.5">Show real-time simulated viewers to create urgency</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enableFakeViews}
              onChange={(e) => setEnableFakeViews(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {enableFakeViews && (
          <div className="space-y-4 pt-1 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Minimum Viewers</label>
                <input
                  type="number"
                  min="1"
                  value={minViews}
                  onChange={(e) => setMinViews(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-955 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
                  style={{ borderWidth: 0 }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">Maximum Viewers</label>
                <input
                  type="number"
                  min="1"
                  value={maxViews}
                  onChange={(e) => setMaxViews(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-955 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
                  style={{ borderWidth: 0 }}
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
              Adjust the min and max viewer boundaries (e.g. 1 to 30) to control the dynamic counter displayed on the product page.
            </p>
          </div>
        )}
      </div>

      {/* Scrolling Announcement Ticker */}
      <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#e94560] uppercase tracking-wider">Scrolling Announcement Ticker</h3>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold block mt-0.5">Show an infinite scrolling ticker banner on storefront</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enableTicker}
              onChange={(e) => setEnableTicker(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e94560]" />
          </label>
        </div>

        {enableTicker && (
          <div className="space-y-3 pt-1 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Ticker Text lines (one per line)</label>
              <textarea
                value={tickerText}
                onChange={(e) => setTickerText(e.target.value)}
                rows={4}
                placeholder="Free returns within 30 days&#10;Unlimited delivery for only Rs. 175"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold leading-relaxed">
                Write one announcement per line. They will scroll in a continuous loop separated by star glyphs.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
