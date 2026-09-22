'use client';

import React from 'react';
import { HomepageSection, StoreSettings } from '@/lib/types';
import {
  Truck, Shield, RefreshCw, Phone, HelpCircle, Award, Star, Lock, Clock, Gift, Headphones
} from '@/components/common/Icons';

interface TrustBadgesSectionProps {
  section: HomepageSection;
  settings: StoreSettings;
}

export function renderBadgeIcon(iconName: string) {
  const props = { className: "h-6 w-6 text-[#e94560]" };
  switch (iconName) {
    case 'Truck': return <Truck {...props} />;
    case 'Shield': return <Shield {...props} />;
    case 'RefreshCw': return <RefreshCw {...props} />;
    case 'Phone': return <Phone {...props} />;
    case 'HelpCircle': return <HelpCircle {...props} />;
    case 'Award': return <Award {...props} />;
    case 'Star': return <Star {...props} />;
    case 'Lock': return <Lock {...props} />;
    case 'Clock': return <Clock {...props} />;
    case 'Gift': return <Gift {...props} />;
    case 'Headphones': return <Headphones {...props} />;
    default: return <Truck {...props} />;
  }
}

export function TrustBadgesSection({ section, settings }: TrustBadgesSectionProps) {
  const badge1Active = settings.trustBadge1Enabled && (settings.trustBadge1Title || settings.trustBadge1Desc);
  const badge2Active = settings.trustBadge2Enabled && (settings.trustBadge2Title || settings.trustBadge2Desc);
  const badge3Active = settings.trustBadge3Enabled && (settings.trustBadge3Title || settings.trustBadge3Desc);
  const badge4Active = settings.trustBadge4Enabled && (settings.trustBadge4Title || settings.trustBadge4Desc);

  const activeCount = [badge1Active, badge2Active, badge3Active, badge4Active].filter(Boolean).length;
  if (activeCount === 0) return null;

  let gridColsClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  let maxContainerClass = "";
  if (activeCount === 1) {
    gridColsClass = "grid-cols-1";
    maxContainerClass = "max-w-md mx-auto";
  } else if (activeCount === 2) {
    gridColsClass = "grid-cols-1 sm:grid-cols-2";
    maxContainerClass = "max-w-2xl mx-auto";
  } else if (activeCount === 3) {
    gridColsClass = "grid-cols-1 sm:grid-cols-3 lg:grid-cols-3";
    maxContainerClass = "max-w-5xl mx-auto";
  }

  return (
    <div key={section.id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100 dark:border-gray-800">
      <div className={`grid gap-6 ${gridColsClass} ${maxContainerClass}`}>
        {badge1Active && (
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl">
              {renderBadgeIcon(settings.trustBadge1Icon || 'Truck')}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{settings.trustBadge1Title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{settings.trustBadge1Desc}</p>
            </div>
          </div>
        )}
        {badge2Active && (
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl">
              {renderBadgeIcon(settings.trustBadge2Icon || 'Shield')}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{settings.trustBadge2Title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{settings.trustBadge2Desc}</p>
            </div>
          </div>
        )}
        {badge3Active && (
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl">
              {renderBadgeIcon(settings.trustBadge3Icon || 'RefreshCw')}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{settings.trustBadge3Title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{settings.trustBadge3Desc}</p>
            </div>
          </div>
        )}
        {badge4Active && (
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl">
              {renderBadgeIcon(settings.trustBadge4Icon || 'Phone')}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{settings.trustBadge4Title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{settings.trustBadge4Desc}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
