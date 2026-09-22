'use client';

import React, { useState } from 'react';
import { Trash2, Plus, Check, Image as ImageIcon } from '@/components/common/Icons';
import SizeGuideTableBuilder from './SizeGuideTableBuilder';
import MediaSelectorModal from '../../MediaSelectorModal';

interface SizeGuideFormCardProps {
  guideName: string;
  setGuideName: (v: string) => void;
  guideImageUrl: string;
  setGuideImageUrl: (v: string) => void;
  guideColumns: string;
  setGuideColumns: (v: string) => void;
  guideRows: Array<Record<string, string>>;
  setGuideRows: React.Dispatch<React.SetStateAction<Array<Record<string, string>>>>;
  isEditingGuide: boolean;
  handleSaveSizeGuide: (e: React.FormEvent) => void;
  resetSizeGuideForm: () => void;
  handleRemoveImage: (type: 'logo' | 'favicon' | 'banner' | 'exit_intent' | 'size_chart') => void;
}

export default function SizeGuideFormCard({
  guideName,
  setGuideName,
  guideImageUrl,
  setGuideImageUrl,
  guideColumns,
  setGuideColumns,
  guideRows,
  setGuideRows,
  isEditingGuide,
  handleSaveSizeGuide,
  resetSizeGuideForm,
  handleRemoveImage,
}: SizeGuideFormCardProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm col-span-1 lg:col-span-7 space-y-6">
      <div>
        <h3 className="text-sm font-extrabold text-[#e94560] uppercase tracking-wider">
          {isEditingGuide ? 'Edit Size Guide Preset' : 'Create Size Guide Preset'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Build table columns/rows and link an optional measurement image.
        </p>
      </div>

      <div className="space-y-4">
        {/* Preset Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preset Name</label>
          <input
            type="text"
            placeholder="e.g. Women's Kurtas Sizing"
            value={guideName}
            onChange={(e) => setGuideName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-3 py-2.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#e94560] transition-colors"
          />
        </div>

        {/* Chart Image Upload */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chart Image (Optional)</label>

          {guideImageUrl ? (
            <div className="relative rounded-xl border border-gray-100 dark:border-gray-800 p-2 bg-gray-50 dark:bg-[#0f0f1b] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={guideImageUrl}
                    alt="Preset guide"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Image selected</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage('size_chart')}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/25 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-[#0f0f1b]/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="relative self-start flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Select Media</span>
                </button>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">Select size guide chart image</span>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Sizing Table Builder */}
        <SizeGuideTableBuilder
          guideColumns={guideColumns}
          setGuideColumns={setGuideColumns}
          guideRows={guideRows}
          setGuideRows={setGuideRows}
        />

        {/* Save / Reset Form actions */}
        <div className="flex justify-end gap-3 pt-3">
          {isEditingGuide && (
            <button
              type="button"
              onClick={resetSizeGuideForm}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveSizeGuide}
            className="flex items-center justify-center gap-1.5 bg-[#1a1a2e] dark:bg-[#e94560] hover:bg-[#e94560] active:scale-95 text-white py-2.5 px-6 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
          >
            {isEditingGuide ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{isEditingGuide ? 'Update Preset' : 'Create Preset'}</span>
          </button>
        </div>
      </div>

      <MediaSelectorModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(urls) => {
          if (urls.length > 0) {
            setGuideImageUrl(urls[0]);
          }
          setIsMediaModalOpen(false);
        }}
        multiple={false}
      />
    </div>
  );
}
