'use client';

import React from 'react';
import { HomepageSection, StoreSettings } from '@/lib/types';
import {
  Truck, Shield, RefreshCw, Phone, HelpCircle, Award, Star, Lock, Clock, Gift, Headphones
} from '@/components/common/Icons';
import { SectionWrapper } from './SectionWrapper';

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
  const badge1Active = settings.trust_badge1_enabled && (settings.trust_badge1_title || settings.trust_badge1_desc);
  const badge2Active = settings.trust_badge2_enabled && (settings.trust_badge2_title || settings.trust_badge2_desc);
  const badge3Active = settings.trust_badge3_enabled && (settings.trust_badge3_title || settings.trust_badge3_desc);
  const badge4Active = settings.trust_badge4_enabled && (settings.trust_badge4_title || settings.trust_badge4_desc);

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
    <SectionWrapper section={section} className="border-t border-gray-100 dark:border-gray-800">
      <div className={`grid gap-6 ${gridColsClass} ${maxContainerClass}`}>
        {badge1Active && (
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl">
              {renderBadgeIcon(settings.trust_badge1_icon || 'Truck')}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{settings.trust_badge1_title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{settings.trust_badge1_desc}</p>
            </div>
          </div>
        )}
        {badge2Active && (
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl">
              {renderBadgeIcon(settings.trust_badge2_icon || 'Shield')}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{settings.trust_badge2_title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{settings.trust_badge2_desc}</p>
            </div>
          </div>
        )}
        {badge3Active && (
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl">
              {renderBadgeIcon(settings.trust_badge3_icon || 'RefreshCw')}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{settings.trust_badge3_title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{settings.trust_badge3_desc}</p>
            </div>
          </div>
        )}
        {badge4Active && (
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl">
              {renderBadgeIcon(settings.trust_badge4_icon || 'Phone')}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{settings.trust_badge4_title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{settings.trust_badge4_desc}</p>
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
