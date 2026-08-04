import React from 'react';
import { ChevronUp, ChevronDown } from '@/components/common/Icons';

interface MaterialFilterProps {
  materials: string[];
  selectedMaterials: string[];
  toggleMaterial: (material: string) => void;
  showAllMaterials: boolean;
  setShowAllMaterials: (show: boolean) => void;
}

export default function MaterialFilter({
  materials,
  selectedMaterials,
  toggleMaterial,
  showAllMaterials,
  setShowAllMaterials
}: MaterialFilterProps) {
  if (materials.length === 0) return null;

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Materials</span>
      <div className="flex flex-wrap gap-2">
        {(showAllMaterials ? materials : materials.slice(0, 4)).map(material => {
          const isSelected = selectedMaterials.includes(material);
          return (
            <button
              key={material}
              type="button"
              onClick={() => toggleMaterial(material)}
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
      {materials.length > 4 && (
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
              <span>View {materials.length - 4} More</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
