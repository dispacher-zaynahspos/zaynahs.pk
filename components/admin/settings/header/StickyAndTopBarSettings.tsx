'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import HeaderAnnouncementFields from '@/components/admin/shared/HeaderAnnouncementFields';

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
  // Adapter → the shared SSOT component works in snake_case store_settings keys;
  // map them onto this tab's individual setters (Settings manual-save tree).
  const announcementSettings: Partial<StoreSettings> = {
    header_show_top_bar: headerShowTopBar,
    header_show_newsletter: headerShowNewsletter,
    header_top_bar_phone: headerTopBarPhone,
    header_top_bar_email: headerTopBarEmail,
    header_newsletter_text: headerNewsletterText,
  };
  const onAnnouncementUpdate = (updates: Partial<StoreSettings>) => {
    if (updates.header_show_top_bar !== undefined) setHeaderShowTopBar(updates.header_show_top_bar);
    if (updates.header_show_newsletter !== undefined) setHeaderShowNewsletter(updates.header_show_newsletter);
    if (updates.header_top_bar_phone !== undefined) setHeaderTopBarPhone(updates.header_top_bar_phone);
    if (updates.header_top_bar_email !== undefined) setHeaderTopBarEmail(updates.header_top_bar_email);
    if (updates.header_newsletter_text !== undefined) setHeaderNewsletterText(updates.header_newsletter_text);
  };

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

      {/* Top Bar & Announcement — SSOT shared component (checkbox variant for Settings) */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Top Contact & Announcement Bar</h4>
        <HeaderAnnouncementFields
          settings={announcementSettings}
          onUpdate={onAnnouncementUpdate}
          variant="checkbox"
        />
      </div>
    </>
  );
}
