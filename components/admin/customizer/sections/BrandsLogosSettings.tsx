'use client';

import React, { useState } from 'react';
import { HomepageSection } from '@/lib/types';
import { Plus, Trash2, ChevronUp, ChevronDown, Image as ImageIcon } from '@/components/common/Icons';
import { moveItemInArray } from '@/lib/utils/arrayMove';
import SectionSpacingControls from '../shared/SectionSpacingControls';
import MediaSelectorModal from '@/components/admin/MediaSelectorModal';

interface BrandsLogosSettingsProps {
  section: HomepageSection;
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function BrandsLogosSettings({
  section,
  onUpdateSection,
}: BrandsLogosSettingsProps) {
  const contentData = section.content_data || {};
  const settings = section.settings || {};
  const logos: string[] = Array.isArray(contentData.logos) ? contentData.logos : [];

  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);

  const updateSettings = (key: string, value: unknown) => {
    onUpdateSection({
      settings: { ...settings, [key]: value },
    });
  };

  const updateLogos = (newLogos: string[]) => {
    onUpdateSection({
      content_data: { ...contentData, logos: newLogos },
    });
  };

  const handleAddLogo = () => {
    updateLogos([...logos, '']);
  };

  const handleRemoveLogo = (index: number) => {
    updateLogos(logos.filter((_, i) => i !== index));
  };

  const handleLogoChange = (index: number, val: string) => {
    const updated = [...logos];
    updated[index] = val;
    updateLogos(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const next = moveItemInArray(logos, index, direction);
    updateLogos(next);
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
          Section Title
        </label>
        <input
          type="text"
          value={section.title || ''}
          onChange={(e) => onUpdateSection({ title: e.target.value })}
          placeholder="e.g. Featured Brands / Official Partners"
          className="w-full px-3 py-2 bg-white dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
        />
      </div>

      {/* Visual Controls */}
      <div className="space-y-4 p-3.5 bg-gray-50/70 dark:bg-white/[0.03] rounded-2xl border border-gray-200/80 dark:border-gray-800/80">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Logo Display Settings
        </h4>

        {/* Grayscale Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Grayscale Filter
            </label>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Desaturate logos and restore color on hover
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateSettings('grayscale', settings.grayscale === false ? true : false)}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
              settings.grayscale !== false ? 'bg-[#e94560]' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.grayscale !== false ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Logo Height */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
              Logo Max Height
            </label>
            <span className="text-xs font-bold text-[#e94560]">
              {settings.logo_height ?? 40}px
            </span>
          </div>
          <input
            type="range"
            min={24}
            max={80}
            step={4}
            value={settings.logo_height ?? 40}
            onChange={(e) => updateSettings('logo_height', parseInt(e.target.value, 10))}
            className="w-full accent-[#e94560] cursor-pointer"
          />
        </div>

        {/* Ticker Speed */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
              Scroll Speed (Seconds)
            </label>
            <span className="text-xs font-bold text-[#e94560]">
              {settings.speed ?? 30}s
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={settings.speed ?? 30}
            onChange={(e) => updateSettings('speed', parseInt(e.target.value, 10))}
            className="w-full accent-[#e94560] cursor-pointer"
          />
        </div>
      </div>

      {/* Logos List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
            Brand Logos ({logos.length})
          </label>
          <button
            type="button"
            onClick={handleAddLogo}
            className="flex items-center gap-1 text-xs font-bold text-[#e94560] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Logo
          </button>
        </div>

        {logos.length === 0 ? (
          <div className="text-center py-6 px-4 bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">No brand logos added yet.</p>
            <button
              type="button"
              onClick={handleAddLogo}
              className="text-xs font-bold text-[#e94560] underline cursor-pointer"
            >
              Add First Logo
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {logos.map((logoUrl, index) => (
              <div
                key={index}
                className="p-3 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl space-y-2 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  {/* Thumbnail */}
                  <div className="w-12 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={`Logo ${index + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* URL Input */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => handleLogoChange(index, e.target.value)}
                      placeholder="Paste image URL or Select"
                      className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium focus:outline-none focus:border-[#e94560] text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Select button */}
                  <button
                    type="button"
                    onClick={() => setActiveMediaIndex(index)}
                    title="Select from media library"
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 rounded-lg text-gray-600 dark:text-gray-300 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>

                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === logos.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveLogo(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shared Spacing Controls */}
      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />

      {/* Media Selector Modal */}
      {activeMediaIndex !== null && (
        <MediaSelectorModal
          isOpen={true}
          onClose={() => setActiveMediaIndex(null)}
          onSelect={(url) => {
            handleLogoChange(activeMediaIndex, url);
            setActiveMediaIndex(null);
          }}
        />
      )}
    </div>
  );
}
