'use client';

import React from 'react';
import { TabId } from './index';
import { SettingsTabRendererCore } from './SettingsTabRendererCore';
import { SettingsTabRendererAdvanced } from './SettingsTabRendererAdvanced';

interface SettingsFormTabRendererProps {
  activeTab: TabId;
  s: any;
}

export function SettingsFormTabRenderer({ activeTab, s }: SettingsFormTabRendererProps) {
  const coreTab = SettingsTabRendererCore({ activeTab, s });
  if (coreTab) return coreTab;

  return <SettingsTabRendererAdvanced activeTab={activeTab} s={s} />;
}
