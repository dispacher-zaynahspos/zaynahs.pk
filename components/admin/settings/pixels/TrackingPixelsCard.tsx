'use client';

import React from 'react';
import { HelpCircle, Globe } from '@/components/common/Icons';

interface TrackingPixelsCardProps {
  metaSyncEnabled: boolean;
  setMetaSyncEnabled: (val: boolean) => void;
  metaPixelId: string;
  setMetaPixelId: (val: string) => void;
  ga4MeasurementId: string;
  setGa4MeasurementId: (val: string) => void;
  gtmContainerId: string;
  setGtmContainerId: (val: string) => void;
  tiktokPixelId: string;
  setTiktokPixelId: (val: string) => void;
  snapchatPixelId: string;
  setSnapchatPixelId: (val: string) => void;
  pinterestTagId: string;
  setPinterestTagId: (val: string) => void;
  twitterPixelId: string;
  setTwitterPixelId: (val: string) => void;
}

export default function TrackingPixelsCard({
  metaSyncEnabled,
  setMetaSyncEnabled,
  metaPixelId,
  setMetaPixelId,
  ga4MeasurementId,
  setGa4MeasurementId,
  gtmContainerId,
  setGtmContainerId,
  tiktokPixelId,
  setTiktokPixelId,
  snapchatPixelId,
  setSnapchatPixelId,
  pinterestTagId,
  setPinterestTagId,
  twitterPixelId,
  setTwitterPixelId,
}: TrackingPixelsCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 transition-colors">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">Tracking & Analytics Pixels</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Enter pixel IDs to automatically capture PageView, ViewContent, AddToCart, InitiateCheckout, and Purchase events.
      </p>

      <div className="space-y-4">
        {/* Meta Catalog Sync Toggle */}
        <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 transition-colors">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Meta Catalog Syncing
            </label>
            <span className="text-[10px] text-gray-450 dark:text-gray-550 block mt-0.5 font-semibold">
              Sync store products and categories directly to Meta Product Catalog.
            </span>
          </div>
          <input
            type="checkbox"
            checked={metaSyncEnabled}
            onChange={(e) => setMetaSyncEnabled(e.target.checked)}
            className="w-10 h-6 rounded-full bg-gray-200 dark:bg-gray-800 checked:bg-[#e94560] appearance-none cursor-pointer transition-all relative after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:top-[2px] after:left-[2px] checked:after:left-[18px] after:transition-all shrink-0"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Meta Pixel ID (Facebook)
          </label>
          <input
            type="text"
            value={metaPixelId}
            onChange={(e) => setMetaPixelId(e.target.value)}
            placeholder="e.g. 1234567890"
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Google Analytics 4 (GA4) Measurement ID
              </label>
              <div className="relative group inline-block text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-help">
                <HelpCircle className="w-3.5 h-3.5" />
                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-800 text-[11px] leading-relaxed text-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-gray-800">
                  Find this in your Google Analytics dashboard. It starts with "G-". This allows you to track visitors, traffic sources, and behavior accurately.
                </div>
              </div>
            </div>
            <a href="https://analytics.google.com/" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-[#e94560] hover:underline flex items-center gap-1">
              Get ID <Globe className="w-3 h-3" />
            </a>
          </div>
          <input
            type="text"
            value={ga4MeasurementId}
            onChange={(e) => setGa4MeasurementId(e.target.value)}
            placeholder="e.g. G-XXXXXXX"
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Google Tag Manager (GTM) Container ID
          </label>
          <input
            type="text"
            value={gtmContainerId}
            onChange={(e) => setGtmContainerId(e.target.value)}
            placeholder="e.g. GTM-XXXXXXX"
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            TikTok Pixel ID
          </label>
          <input
            type="text"
            value={tiktokPixelId}
            onChange={(e) => setTiktokPixelId(e.target.value)}
            placeholder="e.g. CXXXXXXXXXXXXXXXXXXX"
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Snapchat Pixel ID
          </label>
          <input
            type="text"
            value={snapchatPixelId}
            onChange={(e) => setSnapchatPixelId(e.target.value)}
            placeholder="e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Pinterest Tag ID
          </label>
          <input
            type="text"
            value={pinterestTagId}
            onChange={(e) => setPinterestTagId(e.target.value)}
            placeholder="e.g. 26XXXXXXXXXXX"
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Twitter / X Pixel ID
          </label>
          <input
            type="text"
            value={twitterPixelId}
            onChange={(e) => setTwitterPixelId(e.target.value)}
            placeholder="e.g. xxxxx"
            className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#1a1a2e] dark:focus:border-[#e94560] focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}
