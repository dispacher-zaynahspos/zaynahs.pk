'use client';

import React from 'react';
import { Edit2, Trash2, Ruler, Download, Upload } from '@/components/common/Icons';
import { SizeGuide } from '@/lib/types';

interface SizeGuidePresetsListProps {
  sizeGuides: SizeGuide[];
  selectedGuide: SizeGuide | null;
  selectedGuideIds: Set<string>;
  setSelectedGuideIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  startEditSizeGuide: (guide: SizeGuide) => void;
  handleDeleteSizeGuide: (id: string) => void;
}

export default function SizeGuidePresetsList({
  sizeGuides,
  selectedGuide,
  selectedGuideIds,
  setSelectedGuideIds,
  onExport,
  onImport,
  fileInputRef,
  startEditSizeGuide,
  handleDeleteSizeGuide,
}: SizeGuidePresetsListProps) {
  const allSelected = sizeGuides.length > 0 && selectedGuideIds.size === sizeGuides.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedGuideIds(new Set());
    } else {
      setSelectedGuideIds(new Set(sizeGuides.map(g => g.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedGuideIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm col-span-1 lg:col-span-5 space-y-6">
      <div>
        <h3 className="text-sm font-extrabold text-[#e94560] uppercase tracking-wider">Size Guide Presets</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage reusable size charts linked to products.</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {sizeGuides.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-[#e94560] font-bold uppercase tracking-wider cursor-pointer"
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
          )}
          {selectedGuideIds.size > 0 && (
            <span className="text-[10px] text-gray-400 font-semibold">
              {selectedGuideIds.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800 hover:border-gray-350 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800 hover:border-gray-350 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            Import
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImport}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-4">
        {sizeGuides.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-850 rounded-xl">
            <Ruler className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-700" />
            <p className="text-xs italic text-gray-400 mt-2">No size guide presets created yet.</p>
          </div>
        ) : (
          sizeGuides.map((guide) => (
            <div
              key={guide.id}
              className={`p-4 rounded-xl border transition-all ${
                selectedGuide?.id === guide.id
                  ? 'border-[#e94560] bg-gray-50/50 dark:bg-white/5 shadow-sm'
                  : 'border-gray-105 dark:border-gray-800 bg-white dark:bg-[#0f0f1b]/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedGuideIds.has(guide.id)}
                    onChange={() => toggleSelect(guide.id)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] cursor-pointer flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{guide.name}</h4>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1">
                      {guide.chart_data.length} rows • {guide.chart_data[0] ? Object.keys(guide.chart_data[0]).length : 0} columns
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEditSizeGuide(guide)}
                    className="p-1.5 text-gray-400 hover:text-gray-750 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Edit Preset"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSizeGuide(guide.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Delete Preset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {guide.imageUrl && (
                <div className="mt-3 relative w-full h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={guide.imageUrl}
                    alt={guide.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
