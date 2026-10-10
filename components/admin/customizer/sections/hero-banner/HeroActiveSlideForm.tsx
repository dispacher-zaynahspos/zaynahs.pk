'use client';

import React from 'react';
import { HeroSlide } from './HeroBannerControls';
import MediaField from '@/components/admin/customizer/shared/MediaField';

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
        <span className="text-[9px] font-bold text-gray-400 uppercase truncate max-w-[140px]">
          {activeSlide.title || activeSlide.mobile_title || activeSlide.tablet_title || 'Untitled slide'}
        </span>
      </div>

      {/* Responsive Media Editor — Desktop, Mobile, Tablet */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Slide Media
          </span>
          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md uppercase">
            {viewportMode} view
          </span>
        </div>

        {viewportMode === 'mobile' && (
          <div className="space-y-2 p-2.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl">
            <MediaField
              label={
                <>
                  Mobile Banner Image{' '}
                  <span className="ml-1 align-middle inline-block text-[8px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 rounded px-1.5 py-0.5">
                    Mobile Only
                  </span>
                </>
              }
              value={activeSlide.mobile_image_url || ''}
              onChange={(v) => handleSlideChange(activeSlide.id, { mobile_image_url: v })}
              onSelect={() => onSelectMedia('content_data', 'mobile_image_url', true, activeSlide.id)}
              placeholder={activeSlide.image_url ? 'Inherits desktop image...' : 'Mobile Image URL'}
            />
            {!activeSlide.mobile_image_url && activeSlide.image_url && (
              <p className="text-[10px] text-gray-500 italic">
                Using desktop banner image as fallback. Upload a portrait or mobile-optimized banner above for best fit on phones.
              </p>
            )}
            {activeSlide.mobile_image_url && (
              <button
                type="button"
                onClick={() => handleSlideChange(activeSlide.id, { mobile_image_url: '' })}
                className="text-[10px] font-bold text-[#e94560] hover:underline cursor-pointer"
              >
                Reset to inherit Desktop Image
              </button>
            )}
          </div>
        )}

        {viewportMode === 'tablet' && (
          <div className="space-y-2 p-2.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl">
            <MediaField
              label={
                <>
                  Tablet Banner Image{' '}
                  <span className="ml-1 align-middle inline-block text-[8px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 rounded px-1.5 py-0.5">
                    Tablet Only
                  </span>
                </>
              }
              value={activeSlide.tablet_image_url || ''}
              onChange={(v) => handleSlideChange(activeSlide.id, { tablet_image_url: v })}
              onSelect={() => onSelectMedia('content_data', 'tablet_image_url', true, activeSlide.id)}
              placeholder={activeSlide.image_url ? 'Inherits desktop image...' : 'Tablet Image URL'}
            />
            {!activeSlide.tablet_image_url && activeSlide.image_url && (
              <p className="text-[10px] text-gray-500 italic">
                Using desktop banner image as fallback.
              </p>
            )}
            {activeSlide.tablet_image_url && (
              <button
                type="button"
                onClick={() => handleSlideChange(activeSlide.id, { tablet_image_url: '' })}
                className="text-[10px] font-bold text-[#e94560] hover:underline cursor-pointer"
              >
                Reset to inherit Desktop Image
              </button>
            )}
          </div>
        )}

        {/* Primary Desktop Banner Image (Fallback for all devices) */}
        <div className="space-y-2">
          <MediaField
            label={
              <>
                Desktop Banner Image{' '}
                <span className="ml-1 align-middle inline-block text-[8px] font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5">
                  {viewportMode === 'desktop' ? 'All devices (Primary)' : 'Fallback'}
                </span>
              </>
            }
            value={activeSlide.image_url || ''}
            onChange={(v) => handleSlideChange(activeSlide.id, { image_url: v })}
            onSelect={() => onSelectMedia('content_data', 'image_url', true, activeSlide.id)}
            placeholder="Desktop Image URL"
          />
        </div>

        {/* Image Fit Mode */}
        <div className="flex items-center justify-between pt-1">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            Image Scaling Mode
          </label>
          <select
            value={activeSlide.image_fit || 'cover'}
            onChange={(e) => handleSlideChange(activeSlide.id, { image_fit: e.target.value as any })}
            className="px-2.5 py-1 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-900 dark:text-white"
          >
            <option value="cover">Cover (Full Bleed - recommended)</option>
            <option value="contain">Contain (No Crop - full image visible)</option>
            <option value="fill">Stretch to Fill</option>
          </select>
        </div>

        {/* Video URL Input */}
        <MediaField
          label={<>Video URL <span className="ml-1 align-middle inline-block text-[8px] font-bold uppercase tracking-wide text-gray-500 bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5">All devices · optional</span></>}
          value={activeSlide.video_url || ''}
          onChange={(v) => handleSlideChange(activeSlide.id, { video_url: v })}
          onSelect={() => onSelectMedia('content_data', 'video_url', true, activeSlide.id)}
          placeholder="https://.../video.mp4 or YouTube/Vimeo URL"
        />

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

      {/* Viewport-specific Text Content Editor */}
      <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-800">
        <span className="flex items-center gap-1.5 text-[9px] font-black tracking-wider uppercase text-gray-400 dark:text-gray-550">
          <span className="inline-block text-[8px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded px-1.5 py-0.5 capitalize">{viewportMode}</span>
          Text Content (per device)
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
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wide block">Show CTA Buttons</span>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activeSlide.buttons_enabled !== false}
                onChange={e => handleSlideChange(activeSlide.id, { buttons_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>
          {activeSlide.buttons_enabled !== false && (
          <>
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
          </>
          )}
        </div>

        {activeSlide.buttons_enabled !== false && (
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
        )}
      </div>
    </div>
  );
}
