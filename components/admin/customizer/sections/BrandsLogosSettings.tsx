'use client';

import React from 'react';
import Image from 'next/image';
import { HomepageSection } from '@/lib/types';
import { Trash2, ChevronUp, ChevronDown, Plus } from '@/components/common/Icons';
import { moveItemInArray } from '@/lib/utils/arrayMove';
import { AccordionGroup } from '@/components/admin/customizer/controls';
import MediaField from '../shared/MediaField';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface BrandsLogosSettingsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
  onSelectMedia: (fieldPath: 'settings' | 'content_data', fieldKey: string, isGridItem?: boolean, gridIndex?: number) => void;
}

export default function BrandsLogosSettings({ section, onUpdateSection, onSelectMedia }: BrandsLogosSettingsProps) {
  const contentData = section.content_data || {};
  const logos: string[] = contentData.logos || [];
  const s = section.settings || {};

  const setLogos = (next: string[]) =>
    onUpdateSection({ content_data: { ...contentData, logos: next } });

  const setSetting = (key: string, value: unknown) =>
    onUpdateSection({ settings: { ...s, [key]: value } });

  const addLogo = () => setLogos([...logos, '']);
  const removeLogo = (idx: number) => setLogos(logos.filter((_, i) => i !== idx));
  const updateLogo = (idx: number, url: string) => {
    const next = [...logos];
    next[idx] = url;
    setLogos(next);
  };
  const moveLogo = (idx: number, dir: 'up' | 'down') =>
    setLogos(moveItemInArray(logos, idx, dir));

  return (
    <div className="space-y-3">
      {/* Layout */}
      <AccordionGroup id={`bl-${section.id}-layout`} title="Layout" defaultOpen>
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Grayscale Effect</span>
              <span className="text-[10px] text-gray-400">Logos appear faded, full color on hover</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={s.grayscale !== false}
                onChange={(e) => setSetting('grayscale', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e94560]" />
            </label>
          </div>

          {/* Logo size */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Logo Height</label>
              <span className="text-xs font-bold text-[#e94560]">{s.logo_height ?? 48}px</span>
            </div>
            <input
              type="range" min={24} max={96} step={4}
              value={s.logo_height ?? 48}
              onChange={(e) => setSetting('logo_height', parseInt(e.target.value, 10))}
              className="w-full accent-[#e94560]"
            />
          </div>
        </div>
      </AccordionGroup>

      {/* Logos List */}
      <AccordionGroup id={`bl-${section.id}-logos`} title={`Partner Logos (${logos.length})`} defaultOpen>
        <div className="space-y-2.5 pt-2">
          {logos.map((url, idx) => (
            <div key={idx} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2">
                {url && (
                  <div className="relative w-12 h-8 flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-200 dark:border-gray-700">
                    <Image src={url} alt="Logo" fill className="object-contain p-1" sizes="48px" />
                  </div>
                )}
                <div className="flex items-center gap-0.5 ml-auto shrink-0">
                  <button type="button" onClick={() => moveLogo(idx, 'up')} disabled={idx === 0} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"><ChevronUp className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => moveLogo(idx, 'down')} disabled={idx === logos.length - 1} className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 cursor-pointer"><ChevronDown className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => removeLogo(idx)} className="p-0.5 text-red-400 hover:text-red-500 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <MediaField
                label="Logo Image URL"
                value={url}
                onChange={(val) => updateLogo(idx, val)}
                onSelect={() => onSelectMedia('content_data', 'logos', true, idx)}
                placeholder="https://... or select from library"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addLogo}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#e94560] hover:text-[#e94560] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Logo
          </button>
        </div>
      </AccordionGroup>

      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
