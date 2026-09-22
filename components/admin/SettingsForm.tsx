'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StoreSettings } from '@/lib/types';
import { useAdminTab } from '@/lib/hooks/useAdminTab';

import {
  SettingsTabBar,
  SettingsSaveBar,
  TabId,
  useSettingsFormState,
  SettingsFormTabRenderer,
} from './settings-form';

interface SettingsFormProps {
  initialSettings: StoreSettings;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useAdminTab<TabId>('general');

  // Redirect deprecated size_guides tab to general
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'size_guides') {
        router.replace('/admin/settings', { scroll: false });
      }
    }
  }, [router]);

  const s = useSettingsFormState({ initialSettings });

  return (
    <form onSubmit={s.handleSubmit} className="w-full max-w-full space-y-6 pb-16">
      <SettingsTabBar activeTab={activeTab} setActiveTab={setActiveTab} metaSyncEnabled={s.metaSyncEnabled} />

      <SettingsFormTabRenderer activeTab={activeTab} s={s} />

      <SettingsSaveBar
        activeTab={activeTab}
        isSubmitting={s.isSubmitting}
        isPurging={s.isPurging}
        onPurgeCache={s.handlePurgeCache}
      />
    </form>
  );
}
