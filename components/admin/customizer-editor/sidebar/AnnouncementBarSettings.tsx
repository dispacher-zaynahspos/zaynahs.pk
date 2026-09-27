'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import HeaderAnnouncementFields from '@/components/admin/shared/HeaderAnnouncementFields';

interface AnnouncementBarSettingsProps {
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
}

export function AnnouncementBarSettings({
  storeSettings,
  setStoreSettings,
}: AnnouncementBarSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none mb-1">Editing Section</span>
          <h4 className="text-sm font-black text-gray-900 dark:text-white truncate">
            Announcement Bar
          </h4>
        </div>
        <span className="text-[9px] font-black text-[#e94560] bg-[#e94560]/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0">
          Top News Banner
        </span>
      </div>

      {/* SSOT: shared header/announcement fields (same source as Settings + Global header) */}
      <HeaderAnnouncementFields
        settings={storeSettings}
        onUpdate={(updates) => setStoreSettings(prev => ({ ...prev, ...updates }))}
      />
    </div>
  );
}
