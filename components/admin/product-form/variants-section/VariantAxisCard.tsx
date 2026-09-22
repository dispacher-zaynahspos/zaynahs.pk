'use client';

import React from 'react';
import { Trash2, Plus, ChevronDown, GripVertical, X } from '@/components/common/Icons';
import HorizontalSortableList from '@/components/admin/HorizontalSortableList';
import { ProductVariant, VariantPreset } from '@/lib/types';
import { getSwatchStyle, extractColorsFromName } from '@/lib/utils/swatch';
import { toast } from 'sonner';

export interface AxisValue { label: string; hex?: string; imageUrl?: string; showImageSwatch?: boolean; }
export interface VariantAxis { name: string; type: 'color' | 'size' | 'material' | 'custom'; values: AxisValue[]; }

interface VariantAxisCardProps {
  axis: VariantAxis;
  axisIdx: number;
  variantAxes: VariantAxis[];
  setVariantAxes: React.Dispatch<React.SetStateAction<VariantAxis[]>>;
  collapsedAxes: boolean[];
  setCollapsedAxes: React.Dispatch<React.SetStateAction<boolean[]>>;
  axisInputs: string[];
  setAxisInputs: React.Dispatch<React.SetStateAction<string[]>>;
  presets: VariantPreset[];
  axisOrderChanged: boolean;
  setVariants: React.Dispatch<React.SetStateAction<Omit<ProductVariant, 'id' | 'productId'>[]>>;
  images: any[];
  activeImageSelector: { axisIdx: number; valIdx: number } | null;
  setActiveImageSelector: React.Dispatch<React.SetStateAction<{ axisIdx: number; valIdx: number } | null>>;
  handleMoveAxisUp: (idx: number) => void;
  handleMoveAxisDown: (idx: number) => void;
  handleReorderAxisValues: (axisIdx: number, reorderedValues: AxisValue[]) => void;
}

export const VariantAxisCard: React.FC<VariantAxisCardProps> = ({
  axis,
  axisIdx,
  variantAxes,
  setVariantAxes,
  collapsedAxes,
  setCollapsedAxes,
  axisInputs,
  setAxisInputs,
  presets,
  axisOrderChanged,
  setVariants,
  images,
  activeImageSelector,
  setActiveImageSelector,
  handleMoveAxisUp,
  handleMoveAxisDown,
  handleReorderAxisValues,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
      {/* Axis header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCollapsedAxes(prev => prev.map((c, i) => i === axisIdx ? !c : c))}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all cursor-pointer flex-shrink-0"
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${collapsedAxes[axisIdx] ? '-rotate-90' : ''}`} />
        </button>
        <input
          type="text"
          value={axis.name}
          onChange={(e) => {
            setVariantAxes(prev => prev.map((a, i) => i === axisIdx ? { ...a, name: e.target.value } : a));
          }}
          placeholder="Attribute name (e.g. Color, Size, Material)"
          className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#e94560]"
        />
        <select
          value={axis.type}
          onChange={(e) => setVariantAxes(prev => prev.map((a, i) => i === axisIdx ? { ...a, type: e.target.value as 'color' | 'size' | 'material' | 'custom' } : a))}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] px-3 py-2 text-xs font-semibold focus:outline-none"
        >
          <option value="color">Color</option>
          <option value="size">Size</option>
          <option value="material">Material</option>
          <option value="custom">Custom</option>
        </select>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={axisIdx === 0}
            onClick={() => handleMoveAxisUp(axisIdx)}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs"
            title="Move Up"
          >
            ▲
          </button>
          <button
            type="button"
            disabled={axisIdx === variantAxes.length - 1}
            onClick={() => handleMoveAxisDown(axisIdx)}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs"
            title="Move Down"
          >
            ▼
          </button>
        </div>
        {variantAxes.length > 1 && (
          <button
            type="button"
            onClick={() => setVariantAxes(prev => prev.filter((_, i) => i !== axisIdx))}
            className="p-2 text-red-400 hover:text-red-600 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {!collapsedAxes[axisIdx] && (
        <>
          {/* Import Preset */}
          {presets.filter(p => p.attribute === axis.type).length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-gray-400">Load Preset:</span>
              <div className="flex flex-wrap gap-1.5">
                {presets.filter(p => p.attribute === axis.type).map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      const newValues = preset.values.map(v => ({
                        label: v.label,
                        hex: preset.attribute === 'color' ? (v.hex && v.hex !== '#888888' ? v.hex : extractColorsFromName(v.label) || '#888888') : v.hex,
                        imageUrl: v.imageUrl
                      }));
                      setVariantAxes(prev => prev.map((a, i) =>
                        i === axisIdx ? { ...a, values: [...a.values, ...newValues.filter(nv => !a.values.find(av => av.label === nv.label))] } : a
                      ));
                      setVariants(prev => prev.map(v => {
                        const match = newValues.find(nv => nv.label === v.color);
                        if (match) {
                          return {
                            ...v,
                            colorHex: match.hex || v.colorHex,
                            imageUrl: match.imageUrl || v.imageUrl
                          };
                        }
                        return v;
                      }));
                      toast.success(`Loaded: ${preset.name}`);
                    }}
                    className="px-2 py-1 rounded-lg bg-[#1a1a2e] text-white text-[10px] font-bold hover:bg-[#e94560] transition-colors cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tag chip input */}
          <div>
            <div className="flex items-center justify-end mb-2">
              {axis.values.length > 0 && (
                <button
                  type="button"
                  onClick={() => setVariantAxes(prev => prev.map((a, i) => i === axisIdx ? { ...a, values: [] } : a))}
                  className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer bg-red-50 dark:bg-red-500/10 px-2 py-1.5 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All Values
                </button>
              )}
            </div>
            <HorizontalSortableList
              items={axis.values.map(v => ({ ...v, id: v.label }))}
              onReorder={(reordered) => handleReorderAxisValues(axisIdx, reordered.map(r => ({ label: r.label, hex: r.hex, imageUrl: r.imageUrl, showImageSwatch: r.showImageSwatch })))}
              getId={(v) => v.label}
              renderItem={(val, idx, isDragging) => (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold select-none cursor-grab ${isDragging
                    ? 'border-[#e94560] bg-white dark:bg-[#16162a] text-gray-800 dark:text-gray-200 shadow-2xl ring-2 ring-[#e94560] cursor-grabbing'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] text-gray-800 dark:text-gray-200 active:cursor-grabbing'
                  }`}>
                  <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  {axis.type === 'color' && (
                    <span
                      className="flex-shrink-0 h-3.5 w-3.5 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm"
                      style={getSwatchStyle((val as any).hex || '#ccc')}
                    />
                  )}
                  <span className="whitespace-nowrap">{val.label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVariantAxes(prev => prev.map((a, i) =>
                        i === axisIdx ? { ...a, values: a.values.filter(v => v.label !== val.label) } : a
                      ));
                    }}
                    className="text-gray-400 hover:text-red-500 cursor-pointer ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            />

            {/* Add value row */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                placeholder={`Add ${axis.name || axis.type} value, press Enter`}
                value={axisInputs[axisIdx] || ''}
                onChange={(e) => setAxisInputs(prev => { const n = [...prev]; n[axisIdx] = e.target.value; return n; })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const raw = (axisInputs[axisIdx] || '').trim().replace(/,$/, '');
                    if (!raw) return;
                    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
                    parts.forEach(label => {
                      if (!axis.values.find(v => v.label === label)) {
                        const hex = axis.type === 'color' ? (
                          presets.filter(p => p.attribute === 'color').flatMap(p => p.values).find(v => v.label.toLowerCase() === label.toLowerCase())?.hex
                          || extractColorsFromName(label) || '#888888'
                        ) : undefined;
                        setVariantAxes(prev => prev.map((a, i) =>
                          i === axisIdx ? { ...a, values: [...a.values, { label, hex }] } : a
                        ));
                      }
                    });
                    setAxisInputs(prev => { const n = [...prev]; n[axisIdx] = ''; return n; });
                  }
                }}
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] px-3 py-2 text-sm focus:outline-none focus:border-[#e94560]"
              />
              <button
                type="button"
                onClick={() => {
                  const raw = (axisInputs[axisIdx] || '').trim();
                  if (!raw) return;
                  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
                  parts.forEach(label => {
                    if (!axis.values.find(v => v.label === label)) {
                      const hex = axis.type === 'color' ? (
                        presets.filter(p => p.attribute === 'color').flatMap(p => p.values).find(v => v.label.toLowerCase() === label.toLowerCase())?.hex
                        || extractColorsFromName(label) || '#888888'
                      ) : undefined;
                      setVariantAxes(prev => prev.map((a, i) =>
                        i === axisIdx ? { ...a, values: [...a.values, { label, hex }] } : a
                      ));
                    }
                  });
                  setAxisInputs(prev => { const n = [...prev]; n[axisIdx] = ''; return n; });
                }}
                className="flex h-9 items-center gap-1 px-3 rounded-lg bg-[#1a1a2e] dark:bg-[#e94560] text-white text-xs font-bold cursor-pointer hover:bg-[#e94560] dark:hover:bg-[#d8344e] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
