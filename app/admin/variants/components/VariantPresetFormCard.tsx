'use client';

import React from 'react';
import { Plus, Save } from '@/components/common/Icons';
import { VariantPreset, VariantPresetValue } from '@/lib/types';

const ATTR_LABELS = { color: 'Color', size: 'Size', material: 'Material', custom: 'Custom' };

interface VariantPresetFormCardProps {
  editingPreset: VariantPreset | null;
  newName: string;
  setNewName: (val: string) => void;
  newAttr: VariantPreset['attribute'];
  setNewAttr: (val: VariantPreset['attribute']) => void;
  newInput: string;
  setNewInput: (val: string) => void;
  newValues: VariantPresetValue[];
  setNewValues: React.Dispatch<React.SetStateAction<VariantPresetValue[]>>;
  addValue: () => void;
  handleSave: () => void;
  saving: boolean;
  onCancelEdit: () => void;
}

export default function VariantPresetFormCard({
  editingPreset,
  newName,
  setNewName,
  newAttr,
  setNewAttr,
  newInput,
  setNewInput,
  newValues,
  setNewValues,
  addValue,
  handleSave,
  saving,
  onCancelEdit,
}: VariantPresetFormCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
      <h2 className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {editingPreset ? `Edit Preset: ${editingPreset.name}` : 'Create Custom Preset'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preset Name</label>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. My Shop Sizes"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Attribute Type</label>
          <select
            value={newAttr}
            onChange={e => {
              setNewAttr(e.target.value as VariantPreset['attribute']);
              setNewValues([]);
            }}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560]"
          >
            {(['color', 'size', 'material', 'custom'] as const).map(a => (
              <option key={a} value={a}>{ATTR_LABELS[a]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Values</label>
        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
          {newValues.map((v, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#0f0f1b] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 shadow-sm">
              {newAttr === 'color' && (
                <div className="flex items-center gap-1">
                  {(v.hex || '#888888').split(',').map((colorValue, colorIndex, colorsArr) => (
                    <div key={colorIndex} className="relative group flex items-center">
                      <input
                        type="color"
                        value={colorValue.trim() || '#888888'}
                        onChange={(e) => {
                          const newColor = e.target.value;
                          setNewValues(prev => prev.map((item, idx) => {
                            if (idx !== i) return item;
                            const newColorsArr = [...colorsArr];
                            newColorsArr[colorIndex] = newColor;
                            return { ...item, hex: newColorsArr.join(',') };
                          }));
                        }}
                        className="h-5 w-5 rounded cursor-pointer border-0 p-0 bg-transparent flex-shrink-0"
                        title="Select color"
                      />
                      {colorsArr.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewValues(prev => prev.map((item, idx) => {
                              if (idx !== i) return item;
                              const newColorsArr = colorsArr.filter((_, ci) => ci !== colorIndex);
                              return { ...item, hex: newColorsArr.join(',') };
                            }));
                          }}
                          className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-white text-[8px] cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {(v.hex || '#888888').split(',').length < 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewValues(prev => prev.map((item, idx) => {
                          if (idx !== i) return item;
                          return { ...item, hex: (item.hex || '#888888') + ',#ffffff' };
                        }));
                      }}
                      className="h-4 w-4 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-white"
                      title="Add split color"
                    >
                      +
                    </button>
                  )}
                </div>
              )}
              <span>{v.label}</span>
              <button type="button" onClick={() => setNewValues(prev => prev.filter((_, j) => j !== i))} className="ml-1.5 text-gray-400 hover:text-red-500 font-bold cursor-pointer">×</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type value(s), press Enter or comma to add"
            value={newInput}
            onChange={e => setNewInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addValue();
              }
            }}
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560]"
          />
          <button
            type="button"
            onClick={addValue}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-[#1a1a2e] hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e94560] text-white text-sm font-bold hover:bg-[#d8344e] transition-colors cursor-pointer disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : editingPreset ? 'Update Preset' : 'Save Preset'}
        </button>
        {editingPreset && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Cancel Edit
          </button>
        )}
      </div>
    </div>
  );
}
