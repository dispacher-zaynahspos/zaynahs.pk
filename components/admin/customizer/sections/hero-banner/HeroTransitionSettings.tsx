'use client';

import React from 'react';
import {
  HERO_ANIMATION_STYLES,
  HeroAnimationStyle,
} from '@/components/store/store-front/hero-banner/heroAnimationStyles';

interface HeroTransitionSettingsProps {
  settings: Record<string, unknown>;
  handleSettingsChange: (key: string, value: unknown) => void;
}

export function HeroTransitionSettings({
  settings,
  handleSettingsChange,
}: HeroTransitionSettingsProps) {
  const currentStyle = (settings.animation_style as HeroAnimationStyle) || 'smooth_slide';

  return (
    <div className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block">
            Slide Scroll Animation
          </span>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            Choose transition effect for multi-image banner
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e94560]/10 text-[#e94560]">
          5 Styles
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 pt-1">
        {HERO_ANIMATION_STYLES.map((style) => {
          const isSelected = currentStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => handleSettingsChange('animation_style', style.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                isSelected
                  ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10 shadow-sm ring-1 ring-[#e94560]/40'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a]/60 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <span className="text-xl shrink-0 mt-0.5" role="img" aria-label={style.label}>
                {style.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                    {style.label}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-[#e94560] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {style.badge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight mt-0.5">
                  {style.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
