'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from '@/components/common/Icons';
import { getSwatchStyle } from '@/lib/utils/swatch';

interface SidebarVariantFiltersProps {
  usedVariants: {
    colors: string[];
    sizes: string[];
    materials: string[];
    colorToHex: Record<string, string>;
  };
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSizes: string[];
  setSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedMaterials: string[];
  setSelectedMaterials: React.Dispatch<React.SetStateAction<string[]>>;
  showAllColors: boolean;
  setShowAllColors: (v: boolean) => void;
  showAllSizes: boolean;
  setShowAllSizes: (v: boolean) => void;
  showAllMaterials: boolean;
  setShowAllMaterials: (v: boolean) => void;
}

export function SidebarVariantFilters({
  usedVariants,
  selectedColors,
  setSelectedColors,
  selectedSizes,
  setSelectedSizes,
  selectedMaterials,
  setSelectedMaterials,
  showAllColors,
  setShowAllColors,
  showAllSizes,
  setShowAllSizes,
  showAllMaterials,
  setShowAllMaterials,
}: SidebarVariantFiltersProps) {
  return (
    <>
      {/* Colors Filter */}
      {usedVariants.colors.length > 0 && (
        <>
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Colors</span>
            <div className="flex flex-wrap gap-2">
              {(showAllColors ? usedVariants.colors : usedVariants.colors.slice(0, 4)).map(color => {
                const isSelected = selectedColors.includes(color);
                const hex = usedVariants.colorToHex[color];
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setSelectedColors(prev =>
                        prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                      );
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer min-h-[38px] ${isSelected
                      ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560] dark:text-[#e94560]'
                      : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {hex ? (
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10 shrink-0"
                        style={getSwatchStyle(hex)}
                      />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-gray-400 to-gray-200 shrink-0" />
                    )}
                    <span>{color}</span>
                  </button>
                );
              })}
            </div>
            {usedVariants.colors.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllColors(!showAllColors)}
                className="text-[10px] font-black text-[#e94560] uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer pt-1"
              >
                {showAllColors ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>View Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>View More ({usedVariants.colors.length - 4})</span>
                  </>
                )}
              </button>
            )}
          </div>
          <hr className="border-gray-200 dark:border-gray-800" />
        </>
      )}

      {/* Sizes Filter */}
      {usedVariants.sizes.length > 0 && (
        <>
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Sizes</span>
            <div className="flex flex-wrap gap-2">
              {(showAllSizes ? usedVariants.sizes : usedVariants.sizes.slice(0, 6)).map(size => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSizes(prev =>
                        prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                      );
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer min-w-[38px] min-h-[38px] text-center ${isSelected
                      ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560]'
                      : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {usedVariants.sizes.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllSizes(!showAllSizes)}
                className="text-[10px] font-black text-[#e94560] uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer pt-1"
              >
                {showAllSizes ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>View Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>View More ({usedVariants.sizes.length - 6})</span>
                  </>
                )}
              </button>
            )}
          </div>
          <hr className="border-gray-200 dark:border-gray-800" />
        </>
      )}

      {/* Materials Filter */}
      {usedVariants.materials.length > 0 && (
        <>
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Materials</span>
            <div className="flex flex-wrap gap-2">
              {(showAllMaterials ? usedVariants.materials : usedVariants.materials.slice(0, 4)).map(material => {
                const isSelected = selectedMaterials.includes(material);
                return (
                  <button
                    key={material}
                    type="button"
                    onClick={() => {
                      setSelectedMaterials(prev =>
                        prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
                      );
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer min-h-[38px] ${isSelected
                      ? 'border-[#e94560] bg-[#e94560]/10 text-[#e94560]'
                      : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {material}
                  </button>
                );
              })}
            </div>
            {usedVariants.materials.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllMaterials(!showAllMaterials)}
                className="text-[10px] font-black text-[#e94560] uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer pt-1"
              >
                {showAllMaterials ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>View Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>View More ({usedVariants.materials.length - 4})</span>
                  </>
                )}
              </button>
            )}
          </div>
          <hr className="border-gray-200 dark:border-gray-800" />
        </>
      )}
    </>
  );
}
