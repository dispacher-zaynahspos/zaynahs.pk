'use client';

import React, { RefObject } from 'react';
import {
  Trash2, Tag, Palette, Ruler, Package, ChevronDown, Edit2, Download, Upload
} from '@/components/common/Icons';
import { VariantPreset } from '@/lib/types';
import { getSwatchStyle } from '@/lib/utils/swatch';

const ATTR_ICONS = { color: Palette, size: Ruler, material: Package, custom: Tag };
const ATTR_LABELS = { color: 'Color', size: 'Size', material: 'Material', custom: 'Custom' };

interface SavedPresetsCardProps {
  presets: VariantPreset[];
  loading: boolean;
  selectedPresetIds: Set<string>;
  setSelectedPresetIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleExportJSON: () => void;
  handleImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditPreset: (preset: VariantPreset) => void;
  onDeletePreset: (id: string) => void;
}

export default function SavedPresetsCard({
  presets,
  loading,
  selectedPresetIds,
  setSelectedPresetIds,
  expandedId,
  setExpandedId,
  fileInputRef,
  handleExportJSON,
  handleImportJSON,
  onEditPreset,
  onDeletePreset,
}: SavedPresetsCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Saved Presets ({presets.length})
          </h2>
          {presets.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (selectedPresetIds.size === presets.length) {
                  setSelectedPresetIds(new Set());
                } else {
                  setSelectedPresetIds(new Set(presets.map(p => p.id)));
                }
              }}
              className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-[#e94560] font-bold uppercase tracking-wider cursor-pointer"
            >
              {selectedPresetIds.size === presets.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
          {selectedPresetIds.size > 0 && (
            <span className="text-[10px] text-gray-400 font-semibold">
              {selectedPresetIds.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800 hover:border-gray-350 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800 hover:border-gray-350 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            Import JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : presets.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No presets yet. Import or create one above.</p>
      ) : (
        <div className="space-y-2">
          {presets.map(preset => {
            const Icon = ATTR_ICONS[preset.attribute] || Tag;
            const isExpanded = expandedId === preset.id;
            return (
              <div key={preset.id} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                <div
                  className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0f0f1b] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : preset.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedPresetIds.has(preset.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSelectedPresetIds(prev => {
                        const next = new Set(prev);
                        if (next.has(preset.id)) next.delete(preset.id);
                        else next.add(preset.id);
                        return next;
                      });
                    }}
                    onClick={e => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] cursor-pointer flex-shrink-0"
                  />
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a2e] dark:bg-[#e94560] flex-shrink-0">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{preset.name}</p>
                    <p className="text-xs text-gray-400">{ATTR_LABELS[preset.attribute]} · {preset.values.length} values</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onEditPreset(preset);
                      }}
                      className="p-1.5 text-blue-400 hover:text-blue-600 cursor-pointer"
                      title="Edit preset"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); onDeletePreset(preset.id); }}
                      className="p-1.5 text-red-400 hover:text-red-600 cursor-pointer"
                      title="Delete preset"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b]">
                    <div className="flex flex-wrap gap-1.5">
                      {preset.values.map((v, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-xs font-semibold text-gray-800 dark:text-gray-200"
                        >
                          {preset.attribute === 'color' && v.hex && (
                            <span className="h-3 w-3 rounded-full border border-gray-200 dark:border-gray-700 flex-shrink-0" style={getSwatchStyle(v.hex)} />
                          )}
                          {v.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
