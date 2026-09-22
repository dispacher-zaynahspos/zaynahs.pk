'use client';

import React from 'react';
import { HeroAutoplaySettings } from './HeroAutoplaySettings';
import { HeroTabletSettings } from './HeroTabletSettings';
import { HeroMobileSettings } from './HeroMobileSettings';
import { HeroDesktopSettings } from './HeroDesktopSettings';
import { HeroColorSettings } from './HeroColorSettings';

interface HeroGlobalSettingsProps {
  settings: Record<string, any>;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  heightDesktop: number;
  heightTablet: number;
  heightMobile: number;
  widthDesktop: number;
  widthTablet: number;
  widthMobile: number;
  handleSettingsChange: (key: string, value: any) => void;
  onUpdateSection: (updates: Record<string, any>) => void;
}

export function HeroGlobalSettings({
  settings,
  viewportMode,
  heightDesktop,
  heightTablet,
  heightMobile,
  widthDesktop,
  widthTablet,
  widthMobile,
  handleSettingsChange,
  onUpdateSection
}: HeroGlobalSettingsProps) {
  return (
    <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-800">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block">Global Slider Settings</span>

      <HeroAutoplaySettings
        settings={settings}
        handleSettingsChange={handleSettingsChange}
      />

      {viewportMode === 'tablet' ? (
        <HeroTabletSettings
          settings={settings}
          heightTablet={heightTablet}
          widthTablet={widthTablet}
          handleSettingsChange={handleSettingsChange}
        />
      ) : viewportMode === 'mobile' ? (
        <HeroMobileSettings
          settings={settings}
          heightMobile={heightMobile}
          widthMobile={widthMobile}
          handleSettingsChange={handleSettingsChange}
        />
      ) : (
        <HeroDesktopSettings
          settings={settings}
          heightDesktop={heightDesktop}
          widthDesktop={widthDesktop}
          handleSettingsChange={handleSettingsChange}
          onUpdateSection={onUpdateSection}
        />
      )}

      <HeroColorSettings
        settings={settings}
        handleSettingsChange={handleSettingsChange}
      />
    </div>
  );
}
