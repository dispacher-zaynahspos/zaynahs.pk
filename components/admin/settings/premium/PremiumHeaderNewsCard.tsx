'use client';

import React from 'react';

interface PremiumHeaderNewsCardProps {
  headerShowNewsletter: boolean;
  setHeaderShowNewsletter: (v: boolean) => void;
  headerNewsletterText: string;
  setHeaderNewsletterText: (v: string) => void;
  headerShowTopBar: boolean;
  setHeaderShowTopBar: (v: boolean) => void;
  headerTopBarPhone: string;
  setHeaderTopBarPhone: (v: string) => void;
  headerTopBarEmail: string;
  setHeaderTopBarEmail: (v: string) => void;
}

export function PremiumHeaderNewsCard({
  headerShowNewsletter,
  setHeaderShowNewsletter,
  headerNewsletterText,
  setHeaderNewsletterText,
  headerShowTopBar,
  setHeaderShowTopBar,
  headerTopBarPhone,
  setHeaderTopBarPhone,
  headerTopBarEmail,
  setHeaderTopBarEmail,
}: PremiumHeaderNewsCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-extrabold text-[#e94560] uppercase tracking-wider">📢 Header Announcement News Bar</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">Configure global news bar lines and store contacts displayed at the top of the header.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Left Sub-card: Marketing News */}
        <div className="space-y-4 p-4 rounded-xl border border-gray-100 dark:border-gray-850 bg-gray-50/50 dark:bg-white/5">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Marketing Announcement Slider</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={headerShowNewsletter}
                onChange={(e) => setHeaderShowNewsletter(e.target.checked)}
                className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Announcement Line Items (One per line)</label>
            <textarea
              value={headerNewsletterText}
              onChange={(e) => setHeaderNewsletterText(e.target.value)}
              disabled={!headerShowNewsletter}
              rows={4}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e94560] disabled:opacity-50"
              placeholder="Summer sale discount off 50%. Shop Sale&#10;Free shipping on orders above Rs. 2,000"
            />
            <span className="text-[10px] text-gray-400">Add multiple lines to automatically rotate them at the top of the storefront.</span>
          </div>
        </div>

        {/* Right Sub-card: Contacts top-bar */}
        <div className="space-y-4 p-4 rounded-xl border border-gray-100 dark:border-gray-850 bg-gray-50/50 dark:bg-white/5">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Store Contacts Topbar</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={headerShowTopBar}
                onChange={(e) => setHeaderShowTopBar(e.target.checked)}
                className="rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Topbar Phone Number</label>
              <input
                type="text"
                value={headerTopBarPhone}
                onChange={(e) => setHeaderTopBarPhone(e.target.value)}
                disabled={!headerShowTopBar}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-white focus:outline-none disabled:opacity-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Topbar Email Address</label>
              <input
                type="text"
                value={headerTopBarEmail}
                onChange={(e) => setHeaderTopBarEmail(e.target.value)}
                disabled={!headerShowTopBar}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-900 dark:text-white focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
