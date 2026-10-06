'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import MediaField from '../shared/MediaField';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface ImageWithTextSettingsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
  onSelectMedia: (fieldPath: 'settings' | 'content_data', fieldKey: string) => void;
}

export default function ImageWithTextSettings({ section, onUpdateSection, onSelectMedia }: ImageWithTextSettingsProps) {
  const s = section.settings || {};
  const c = section.content_data || {};

  const setSetting = (key: string, value: unknown) =>
    onUpdateSection({ settings: { ...s, [key]: value } });
  const setContent = (key: string, value: unknown) =>
    onUpdateSection({ content_data: { ...c, [key]: value } });

  return (
    <div className="space-y-3">
      {/* Layout */}
      <AccordionGroup id={`iwt-${section.id}-layout`} title="Layout" defaultOpen>
        <div className="space-y-4 pt-2">
          {/* Image position */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Image Position</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'image_left', label: '← Image Left' },
                { val: 'image_right', label: 'Image Right →' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setSetting('layout', opt.val)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (s.layout || 'image_left') === opt.val
                      ? 'bg-[#e94560] text-white border-[#e94560]'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image width */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Image Width</label>
              <span className="text-xs font-bold text-[#e94560]">{s.image_width ?? 50}%</span>
            </div>
            <input
              type="range" min={30} max={70} step={5}
              value={s.image_width ?? 50}
              onChange={(e) => setSetting('image_width', parseInt(e.target.value, 10))}
              className="w-full accent-[#e94560]"
            />
          </div>

          {/* Aspect ratio */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Image Aspect Ratio</label>
            <select
              value={s.aspect_ratio || '4/3'}
              onChange={(e) => setSetting('aspect_ratio', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            >
              <option value="4/3">4:3 Landscape</option>
              <option value="1/1">1:1 Square</option>
              <option value="3/4">3:4 Portrait</option>
              <option value="16/9">16:9 Wide</option>
            </select>
          </div>

          {/* Text align */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Text Alignment</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['left', 'center', 'right'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setSetting('text_align', a)}
                  className={`py-1.5 rounded-xl text-xs font-bold border capitalize cursor-pointer ${
                    (s.text_align || 'left') === a
                      ? 'bg-[#e94560] text-white border-[#e94560]'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AccordionGroup>

      {/* Content */}
      <AccordionGroup id={`iwt-${section.id}-content`} title="Content" defaultOpen>
        <div className="space-y-3 pt-2">
          <MediaField
            label="Section Image"
            value={c.image_url || ''}
            onChange={(val) => setContent('image_url', val)}
            onSelect={() => onSelectMedia('content_data', 'image_url')}
          />
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Heading</label>
            <input
              type="text"
              value={c.heading || ''}
              onChange={(e) => setContent('heading', e.target.value)}
              placeholder="Our Brand Story"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Body Text</label>
            <textarea
              value={c.body || ''}
              onChange={(e) => setContent('body', e.target.value)}
              placeholder="Tell your brand story..."
              rows={4}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Button Text (optional)</label>
            <input
              type="text"
              value={c.button_text || ''}
              onChange={(e) => setContent('button_text', e.target.value)}
              placeholder="Learn More"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
            />
          </div>
          {c.button_text && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Button Link</label>
              <input
                type="text"
                value={c.button_link || ''}
                onChange={(e) => setContent('button_link', e.target.value)}
                placeholder="/shop"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </AccordionGroup>

      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
