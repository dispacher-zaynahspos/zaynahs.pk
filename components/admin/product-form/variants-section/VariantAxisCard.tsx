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
  setVariants: React.Dispatch<React.SetStateAction<Omit<ProductVariant, 'id' | 'product_id'>[]>>;
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
                        imageUrl: v.image_url
                      }));
                      setVariantAxes(prev => prev.map((a, i) =>
                        i === axisIdx ? { ...a, values: [...a.values, ...newValues.filter(nv => !a.values.find(av => av.label === nv.label))] } : a
                      ));
                      setVariants(prev => prev.map(v => {
                        const match = newValues.find(nv => nv.label === v.color);
                        if (match) {
                          return {
                            ...v,
                            color_hex: match.hex || v.color_hex,
                            image_url: match.imageUrl || v.image_url
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

            {/* Color extras: hex + image URL per value */}
            {axis.type === 'color' && axis.values.length > 0 && (
              <div className="space-y-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Color Settings (hex + linked image + swatch style)
                </span>
                <div className="space-y-2">
                  {axis.values.map((val, valIdx) => (
                    <div
                      key={valIdx}
                      className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 shadow-xs"
                    >
                      {/* Premium Color Picker Swatch Container */}
                      <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                        <input
                          type="color"
                          value={val.hex || '#888888'}
                          onChange={(e) => {
                            const newHex = e.target.value;
                            setVariantAxes(prev => prev.map((a, i) =>
                              i === axisIdx ? {
                                ...a,
                                values: a.values.map((v, vi) =>
                                  vi === valIdx ? { ...v, hex: newHex } : v
                                )
                              } : a
                            ));
                            // SYNC TO VARIANTS
                            setVariants(prev => prev.map(v =>
                              v.color === val.label ? { ...v, color_hex: newHex } : v
                            ));
                          }}
                          className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                          title="Pick color"
                        />
                      </div>

                      {/* Color Label */}
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-24 sm:w-28 shrink-0 truncate" title={val.label}>
                        {val.label}
                      </span>

                      {/* Custom Image Selector Dropdown */}
                      <div className="relative flex-1 min-w-[140px]">
                        <button
                          type="button"
                          onClick={() => setActiveImageSelector(
                            activeImageSelector?.axisIdx === axisIdx && activeImageSelector?.valIdx === valIdx
                              ? null
                              : { axisIdx, valIdx }
                          )}
                          className="w-full flex items-center justify-between gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-[#16162a] transition-all min-w-0"
                        >
                          <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                            {val.imageUrl ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={val.imageUrl}
                                  alt={val.label}
                                  className="h-6 w-6 rounded object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                                />
                                <span className="truncate text-gray-800 dark:text-gray-200">
                                  {images?.find(img => img.url === val.imageUrl)?.alt || val.imageUrl.split('/').pop() || 'Linked Image'}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 flex-shrink-0 text-xs">
                                  📷
                                </span>
                                <span className="text-gray-400 truncate">No linked image</span>
                              </>
                            )}
                          </div>
                          <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        </button>

                        {activeImageSelector?.axisIdx === axisIdx && activeImageSelector?.valIdx === valIdx && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setActiveImageSelector(null)}
                            />
                            <div className="absolute left-0 sm:right-0 top-full mt-1 w-64 max-h-60 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] p-1.5 shadow-xl z-40 space-y-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setVariantAxes(prev => prev.map((a, i) =>
                                    i === axisIdx ? {
                                      ...a,
                                      values: a.values.map((v, vi) =>
                                        vi === valIdx ? { ...v, imageUrl: undefined, showImageSwatch: false } : v
                                      )
                                    } : a
                                  ));
                                  // SYNC TO VARIANTS
                                  setVariants(prev => prev.map(v =>
                                    v.color === val.label ? { ...v, image_url: undefined, show_image_swatch: false } : v
                                  ));
                                  setActiveImageSelector(null);
                                }}
                                className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition-colors text-left text-xs font-bold cursor-pointer ${!val.imageUrl
                                    ? 'bg-gray-100 dark:bg-[#0f0f1b] text-[#e94560]'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#0f0f1b]'
                                  }`}
                              >
                                <span className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 flex-shrink-0">
                                  ❌
                                </span>
                                No linked image
                              </button>

                              {images?.map((img, imgIdx) => {
                                const isSelected = val.imageUrl === img.url;
                                const filename = img.alt || img.url.split('/').pop() || `Image ${imgIdx + 1}`;
                                return (
                                  <button
                                    key={imgIdx}
                                    type="button"
                                    onClick={() => {
                                      const newUrl = img.url;
                                      setVariantAxes(prev => prev.map((a, i) =>
                                        i === axisIdx ? {
                                          ...a,
                                          values: a.values.map((v, vi) =>
                                            vi === valIdx ? { ...v, imageUrl: newUrl } : v
                                          )
                                        } : a
                                      ));
                                      // SYNC TO VARIANTS
                                      setVariants(prev => prev.map(v =>
                                        v.color === val.label ? { ...v, image_url: newUrl } : v
                                      ));
                                      setActiveImageSelector(null);
                                    }}
                                    className={`w-full flex items-center gap-2.5 p-1.5 rounded-lg transition-colors text-left text-xs font-bold cursor-pointer ${isSelected
                                        ? 'bg-gray-100 dark:bg-[#0f0f1b] text-[#e94560]'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0f0f1b]'
                                      }`}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={img.url}
                                      alt={filename}
                                      className="h-8 w-8 rounded object-cover border border-gray-200 dark:border-gray-800 flex-shrink-0"
                                    />
                                    <span className="truncate flex-1">{filename}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Show Swatch Type Dropdown - Show Color vs Show Image */}
                      <select
                        disabled={!val.imageUrl}
                        value={val.showImageSwatch && val.imageUrl ? 'image' : 'color'}
                        onChange={(e) => {
                          const showImg = e.target.value === 'image';
                          setVariantAxes(prev => prev.map((a, i) =>
                            i === axisIdx ? {
                              ...a,
                              values: a.values.map((v, vi) =>
                                vi === valIdx ? { ...v, showImageSwatch: showImg } : v
                              )
                            } : a
                          ));
                          // SYNC TO VARIANTS
                          setVariants(prev => prev.map(v =>
                            v.color === val.label ? { ...v, show_image_swatch: showImg } : v
                          ));
                        }}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-2 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-[#16162a] transition-all flex-shrink-0 w-28 sm:w-32 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="color">Show Color</option>
                        {val.imageUrl && <option value="image">Show Image</option>}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
