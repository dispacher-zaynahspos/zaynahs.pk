'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import SocialFeedItemsEditor from '../../sections/SocialFeedItemsEditor';

interface ProductSocialFeedSubTabProps {
  settings: StoreSettings;
  onUpdateSettings: (updates: Partial<StoreSettings>) => void;
  onSelectMedia: (onSelect: (url: string) => void) => void;
}

export default function ProductSocialFeedSubTab({
  settings,
  onUpdateSettings,
  onSelectMedia,
}: ProductSocialFeedSubTabProps) {
  const parsedItems = React.useMemo(() => {
    const rawItems = settings.social_feeds_items;
    if (!rawItems) return [];
    try {
      const arr = typeof rawItems === 'string' ? JSON.parse(rawItems) : rawItems;
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, [settings.social_feeds_items]);

  if (settings.social_feeds_enabled === false) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-white/2 py-10">
        <span className="text-2xl">🔒</span>
        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          Social Feed Locked
        </h4>
        <p className="text-[11px] text-gray-500 leading-normal max-w-[200px]">
          This feature is disabled in your store settings. Please enable &quot;Social Feeds Embeds&quot;
          in Settings &gt; Premium Tab first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
          Enable Social Feed Ribbon
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.social_feeds_product_enabled ?? true}
            onChange={(e) => onUpdateSettings({ social_feeds_product_enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
        </label>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
          Title
        </label>
        <input
          type="text"
          value={settings.social_feeds_title || ''}
          onChange={(e) => onUpdateSettings({ social_feeds_title: e.target.value })}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
          Subtitle
        </label>
        <input
          type="text"
          value={settings.social_feeds_subtitle || ''}
          onChange={(e) => onUpdateSettings({ social_feeds_subtitle: e.target.value })}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wider">
          Description
        </label>
        <textarea
          rows={2}
          value={settings.social_feeds_desc || ''}
          onChange={(e) => onUpdateSettings({ social_feeds_desc: e.target.value })}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
        />
      </div>

      <div className="pt-2 border-t border-gray-250 dark:border-gray-800">
        <SocialFeedItemsEditor
          items={parsedItems}
          onChangeItems={(newItems) => onUpdateSettings({ social_feeds_items: newItems })}
          onSelectMedia={onSelectMedia}
        />
      </div>
    </div>
  );
}
