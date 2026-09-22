'use client';

import React from 'react';
import { HomepageSection, StoreSettings } from '@/lib/types';
import { GripVertical, Eye, EyeOff, ChevronUp, ChevronDown, Trash2 } from '@/components/common/Icons';
import { toast } from 'sonner';

interface HomeSectionsStackProps {
  storeSettings: StoreSettings;
  sections: HomepageSection[];
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
  setActivePage: (page: 'home' | 'shop' | 'product_detail' | 'product_card' | 'global' | 'appearance') => void;
  handleAddSection: (type: string) => void;
  handleUpdateSection: (id: string, updates: Partial<HomepageSection>) => void;
  handleMoveSection: (idx: number, dir: 'up' | 'down') => void;
  handleDeleteSection: (id: string) => void;
}

export default function HomeSectionsStack({
  storeSettings,
  sections,
  activeSectionId,
  setActiveSectionId,
  setActivePage,
  handleAddSection,
  handleUpdateSection,
  handleMoveSection,
  handleDeleteSection,
}: HomeSectionsStackProps) {
  return (
    <>
      {/* Add section widget */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          + Add Layout Section
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { type: 'hero_banner', label: 'Promo Slider' },
            { type: 'product_grid', label: 'Product Grid' },
            { type: 'category_list', label: 'Category Filter' },
            { type: 'category_grid', label: 'Category Grid' },
            { type: 'collections_grid', label: 'Collections Grid' },
            { type: 'promo_banner', label: 'Promo Banner' },
            { type: 'trust_badges', label: 'Trust Badges' },
            { type: 'recent_reviews', label: 'Reviews Feed' },
            { type: 'brands_logos', label: 'Brands Slider' },
            { type: 'social_feed', label: 'Social Feed' },
            { type: 'ticker', label: 'Scrolling Ticker' },
            { type: 'flash_sale', label: 'Flash Sale Grid' },
          ].map((item) => {
            const isFeatureDisabled =
              (item.type === 'social_feed' && storeSettings.social_feeds_enabled === false) ||
              (item.type === 'flash_sale' && storeSettings.flash_sale_enabled === false);

            return (
              <button
                key={item.type}
                onClick={() => {
                  if (isFeatureDisabled) {
                    const featureName = item.type === 'social_feed' ? 'Social Feeds' : 'Flash Sale';
                    toast.error(`🔒 ${featureName} is disabled! Enable it in Settings > Premium Tab.`);
                    return;
                  }
                  handleAddSection(item.type);
                }}
                className={`px-2.5 py-1.5 text-left border rounded-xl transition-all text-xs font-bold ${
                  isFeatureDisabled
                    ? 'bg-gray-100/50 dark:bg-gray-950/40 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-650 cursor-not-allowed'
                    : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800/80 hover:border-[#e94560] dark:hover:border-[#e94560] text-gray-700 dark:text-gray-300 active:scale-97 cursor-pointer'
                }`}
              >
                {isFeatureDisabled ? `🔒 ${item.label}` : item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Announcement Bar Widget Shortcut */}
      <div
        onClick={() => {
          setActiveSectionId('announcement_bar');
          setActivePage('home');
        }}
        className={`flex items-center justify-between p-3 border rounded-xl transition-all cursor-pointer mb-4 ${
          activeSectionId === 'announcement_bar'
            ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10 shadow-sm'
            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-300 dark:hover:border-gray-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">📢</span>
          <div className="min-w-0 flex-grow">
            <div className="text-xs font-bold text-gray-900 dark:text-white">
              Announcement News Bar
            </div>
            <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
              Permanent Header Banner
            </span>
          </div>
        </div>
      </div>

      {/* Section Stack */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
          Section Layout Order
        </label>

        {sections.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-semibold text-gray-400">
            No custom sections added yet.
          </div>
        ) : (
          <div className="space-y-2">
            {sections.map((section, idx) => {
              const isActive = activeSectionId === section.id;
              return (
                <div
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`flex items-center justify-between p-3 border rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10 shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    {(() => {
                      const isFeatureDisabled =
                        (section.section_type === 'social_feed' && storeSettings.social_feeds_enabled === false) ||
                        (section.section_type === 'flash_sale' && storeSettings.flash_sale_enabled === false);

                      return (
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-xs font-bold truncate ${
                              isFeatureDisabled
                                ? 'text-gray-450 dark:text-gray-500 line-through'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {isFeatureDisabled ? '🔒 ' : ''}
                            {section.title || section.section_type}
                          </div>
                          <span className="text-[9px] text-gray-455 dark:text-gray-500 font-bold uppercase tracking-wider">
                            {section.section_type.replace('_', ' ')} {isFeatureDisabled && '(Disabled)'}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleUpdateSection(section.id, { active: !section.active })}
                      className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 ${
                        section.active ? 'text-[#e94560]' : 'text-gray-400'
                      } cursor-pointer`}
                      title={section.active ? 'Hide layout' : 'Show layout'}
                    >
                      {section.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveSection(idx, 'up')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      disabled={idx === sections.length - 1}
                      onClick={() => handleMoveSection(idx, 'down')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
