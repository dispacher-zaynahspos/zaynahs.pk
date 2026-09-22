'use client';

import React from 'react';
import { HeroSlide } from './HeroBannerControls';
import { Image as ImageIcon } from '@/components/common/Icons';

interface HeroActiveSlideFormProps {
  activeSlide: HeroSlide;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  handleSlideChange: (slideId: string, updates: Partial<HeroSlide>) => void;
  onSelectMedia: (fieldPath: 'settings' | 'content_data', fieldKey: string, isSlide?: boolean, slideId?: string) => void;
}

export function HeroActiveSlideForm({
  activeSlide,
  viewportMode,
  handleSlideChange,
  onSelectMedia
}: HeroActiveSlideFormProps) {
  let titleVal = '';
  let taglineVal = '';
  let subtitleVal = '';
  let btnTextVal = '';
  let btnLinkVal = '';
  let secBtnTextVal = '';
  let secBtnLinkVal = '';

  if (viewportMode === 'mobile') {
    titleVal = activeSlide.mobile_title || '';
    taglineVal = activeSlide.mobile_tagline || '';
    subtitleVal = activeSlide.mobile_subtitle || '';
    btnTextVal = activeSlide.mobile_button_text || '';
    btnLinkVal = activeSlide.mobile_button_link || '';
    secBtnTextVal = activeSlide.mobile_button_secondary_text || '';
    secBtnLinkVal = activeSlide.mobile_button_secondary_link || '';
  } else if (viewportMode === 'tablet') {
    titleVal = activeSlide.tablet_title || '';
    taglineVal = activeSlide.tablet_tagline || '';
    subtitleVal = activeSlide.tablet_subtitle || '';
    btnTextVal = activeSlide.tablet_button_text || '';
    btnLinkVal = activeSlide.tablet_button_link || '';
    secBtnTextVal = activeSlide.tablet_button_secondary_text || '';
    secBtnLinkVal = activeSlide.tablet_button_secondary_link || '';
  } else {
    titleVal = activeSlide.title || '';
    taglineVal = activeSlide.tagline || '';
    subtitleVal = activeSlide.subtitle || '';
    btnTextVal = activeSlide.button_text || '';
    btnLinkVal = activeSlide.button_link || '';
    secBtnTextVal = activeSlide.button_secondary_text || '';
    secBtnLinkVal = activeSlide.button_secondary_link || '';
  }

  return (
    <div className="space-y-4 p-3.5 bg-gray-50/50 dark:bg-white/2 rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800/80 pb-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#e94560]">
          Editing Slide Settings
        </span>
        <span className="text-[9px] font-bold text-gray-400 uppercase">
          {activeSlide.title || 'Untitled'}
        </span>
      </div>

      {/* Single Media Editor — one image + one video for all breakpoints */}
      <div className="space-y-4">
        <div className="space-y-3">
          {/* Image Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
              Banner Image <span className="font-normal normal-case text-gray-400">(all devices)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={activeSlide.image_url || ''}
                onChange={e => handleSlideChange(activeSlide.id, { image_url: e.target.value })}
                placeholder="Image URL"
                className="flex-1 px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => onSelectMedia('content_data', 'image_url', true, activeSlide.id)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 hover:dark:bg-white/15 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Select
              </button>
            </div>
          </div>

          {/* Video URL Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
              Video URL <span className="font-normal normal-case text-gray-400">(optional — all devices)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={activeSlide.video_url || ''}
                onChange={e => handleSlideChange(activeSlide.id, { video_url: e.target.value })}
                placeholder="https://.../video.mp4 or YouTube/Vimeo URL"
                className="flex-1 px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => onSelectMedia('content_data', 'video_url', true, activeSlide.id)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 hover:dark:bg-white/15 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Select
              </button>
            </div>
          </div>

          {/* Autoplay & Muted */}
          {activeSlide.video_url && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`autoplay-${activeSlide.id}`}
                  checked={activeSlide.video_autoplay !== false}
                  onChange={e => handleSlideChange(activeSlide.id, { video_autoplay: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <label htmlFor={`autoplay-${activeSlide.id}`} className="text-[11px] font-bold text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                  Enable Autoplay
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`muted-${activeSlide.id}`}
                  checked={activeSlide.video_muted !== false}
                  onChange={e => handleSlideChange(activeSlide.id, { video_muted: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] h-4 w-4"
                />
                <label htmlFor={`muted-${activeSlide.id}`} className="text-[11px] font-bold text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                  Mute Video (Highly recommended for autoplay)
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Viewport-specific Text Content Editor */}
      <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-800">
        <span className="text-[9px] font-black tracking-wider uppercase text-gray-400 dark:text-gray-550 capitalize">
          {viewportMode} Text Content (Slide-level)
        </span>
        
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Tagline / Supertitle</label>
          <input
            type="text"
            value={taglineVal}
            onChange={e => {
              const val = e.target.value;
              handleSlideChange(activeSlide.id, 
                viewportMode === 'mobile'
                  ? { mobile_tagline: val }
                  : viewportMode === 'tablet'
                  ? { tablet_tagline: val }
                  : { tagline: val }
              );
            }}
            placeholder={viewportMode !== 'desktop' ? (activeSlide.tagline || 'Inherited from desktop') : 'e.g. SUMMER SALE'}
            className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Slide Main Title</label>
          <input
            type="text"
            value={titleVal}
            onChange={e => {
              const val = e.target.value;
              handleSlideChange(activeSlide.id, 
                viewportMode === 'mobile'
                  ? { mobile_title: val }
                  : viewportMode === 'tablet'
                  ? { tablet_title: val }
                  : { title: val }
              );
            }}
            placeholder={viewportMode !== 'desktop' ? (activeSlide.title || 'Inherited from desktop') : 'e.g. 50% Off Collection'}
            className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Subtitle Text</label>
          <textarea
            rows={2}
            value={subtitleVal}
            onChange={e => {
              const val = e.target.value;
              handleSlideChange(activeSlide.id, 
                viewportMode === 'mobile'
                  ? { mobile_subtitle: val }
                  : viewportMode === 'tablet'
                  ? { tablet_subtitle: val }
                  : { subtitle: val }
              );
            }}
            placeholder={viewportMode !== 'desktop' ? (activeSlide.subtitle || 'Inherited from desktop') : 'Subtitle description...'}
            className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white resize-none focus:outline-none focus:border-[#e94560]"
          />
        </div>

        {/* Slide Call to Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wide block">Primary CTA Button</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={btnTextVal}
              onChange={e => {
                const val = e.target.value;
                handleSlideChange(activeSlide.id, 
                  viewportMode === 'mobile'
                    ? { mobile_button_text: val }
                    : viewportMode === 'tablet'
                    ? { tablet_button_text: val }
                    : { button_text: val }
                );
              }}
              placeholder={viewportMode !== 'desktop' ? (activeSlide.button_text || 'Inherited from desktop') : 'Label (Shop Now)'}
              className="px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
            <input
              type="text"
              value={btnLinkVal}
              onChange={e => {
                const val = e.target.value;
                handleSlideChange(activeSlide.id, 
                  viewportMode === 'mobile'
                    ? { mobile_button_link: val }
                    : viewportMode === 'tablet'
                    ? { tablet_button_link: val }
                    : { button_link: val }
                );
              }}
              placeholder={viewportMode !== 'desktop' ? (activeSlide.button_link || 'Inherited from desktop') : 'Link (/shop)'}
              className="px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wide block">Secondary CTA Button</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={secBtnTextVal}
              onChange={e => {
                const val = e.target.value;
                handleSlideChange(activeSlide.id, 
                  viewportMode === 'mobile'
                    ? { mobile_button_secondary_text: val }
                    : viewportMode === 'tablet'
                    ? { tablet_button_secondary_text: val }
                    : { button_secondary_text: val }
                );
              }}
              placeholder={viewportMode !== 'desktop' ? (activeSlide.button_secondary_text || 'Inherited from desktop') : 'Label'}
              className="px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
            <input
              type="text"
              value={secBtnLinkVal}
              onChange={e => {
                const val = e.target.value;
                handleSlideChange(activeSlide.id, 
                  viewportMode === 'mobile'
                    ? { mobile_button_secondary_link: val }
                    : viewportMode === 'tablet'
                    ? { tablet_button_secondary_link: val }
                    : { button_secondary_link: val }
                );
              }}
              placeholder={viewportMode !== 'desktop' ? (activeSlide.button_secondary_link || 'Inherited from desktop') : 'Link'}
              className="px-2.5 py-1.5 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
