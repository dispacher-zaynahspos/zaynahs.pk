'use client';

import React from 'react';
import { TabId } from './index';
import { SettingsTabRendererCore } from './SettingsTabRendererCore';
import { SettingsTabRendererAdvanced } from './SettingsTabRendererAdvanced';
import type { useSettingsFormState } from './hooks/useSettingsFormState';

type SettingsFormState = ReturnType<typeof useSettingsFormState>;

interface SettingsFormTabRendererProps {
  activeTab: TabId;
  s: SettingsFormState;
}

export function SettingsFormTabRenderer({ activeTab, s }: SettingsFormTabRendererProps) {
  const coreTab = SettingsTabRendererCore({ activeTab, s });
  if (coreTab) return coreTab;

  return <SettingsTabRendererAdvanced activeTab={activeTab} s={s} />;
}
