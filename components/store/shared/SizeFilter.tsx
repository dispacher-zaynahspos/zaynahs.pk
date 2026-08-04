import React from 'react';
import { ChevronUp, ChevronDown } from '@/components/common/Icons';

interface SizeFilterProps {
  sizes: string[];
  selectedSizes: string[];
  toggleSize: (size: string) => void;
  showAllSizes: boolean;
  setShowAllSizes: (show: boolean) => void;
}

export default function SizeFilter({
  sizes,
  selectedSizes,
  toggleSize,
  showAllSizes,
  setShowAllSizes
}: SizeFilterProps) {
  if (sizes.length === 0) return null;

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Sizes</span>
      <div className="flex flex-wrap gap-2">
        {(showAllSizes ? sizes : sizes.slice(0, 6)).map(size => {
          const isSelected = selectedSizes.includes(size);
          return (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
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
      {sizes.length > 6 && (
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
              <span>View {sizes.length - 6} More</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
