'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { HEADER_ANNOUNCEMENT_LABELS as L, HEADER_ANNOUNCEMENT_DEFAULTS as D } from '@/lib/constants/headerAnnouncementFields';

interface HeaderAnnouncementFieldsProps {
  settings: Partial<StoreSettings>;
  onUpdate: (updates: Partial<StoreSettings>) => void;
  /** 'switch' (Customizer peer-toggle) or 'checkbox' (Settings native). Default 'switch'. */
  variant?: 'switch' | 'checkbox';
}

/**
 * SSOT component for the 5 header/top-bar/announcement fields. State-agnostic:
 * pass the current settings + an onUpdate(Partial<StoreSettings>) callback. Used by
 * the Settings Header tab AND the Customizer (Global header + Announcement Bar) so the
 * same columns are edited from ONE implementation (RULE SSOT1) with no label/default drift.
 */
export default function HeaderAnnouncementFields({
  settings,
  onUpdate,
  variant = 'switch',
}: HeaderAnnouncementFieldsProps) {
  const showTopBar = settings.header_show_top_bar ?? D.header_show_top_bar;
  const showNewsletter = settings.header_show_newsletter ?? D.header_show_newsletter;

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) =>
    variant === 'checkbox' ? (
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
      />
    ) : (
      <label className="relative inline-flex items-center cursor-pointer select-none">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
      </label>
    );

  return (
    <div className="space-y-4">
      {/* Contact top bar */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{L.showTopBar}</span>
        <Toggle checked={showTopBar} onChange={(v) => onUpdate({ header_show_top_bar: v })} />
      </div>

      {showTopBar && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">{L.topBarPhone}</label>
            <input
              type="text"
              value={settings.header_top_bar_phone || ''}
              onChange={(e) => onUpdate({ header_top_bar_phone: e.target.value })}
              placeholder={L.topBarPhonePlaceholder}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">{L.topBarEmail}</label>
            <input
              type="email"
              value={settings.header_top_bar_email || ''}
              onChange={(e) => onUpdate({ header_top_bar_email: e.target.value })}
              placeholder={L.topBarEmailPlaceholder}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Marketing announcement */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2 pt-1">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{L.showNewsletter}</span>
        <Toggle checked={showNewsletter} onChange={(v) => onUpdate({ header_show_newsletter: v })} />
      </div>

      {showNewsletter && (
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">{L.newsletterText}</label>
          <textarea
            rows={3}
            value={settings.header_newsletter_text || ''}
            onChange={(e) => onUpdate({ header_newsletter_text: e.target.value })}
            placeholder={L.newsletterPlaceholder}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
          />
        </div>
      )}
    </div>
  );
}
