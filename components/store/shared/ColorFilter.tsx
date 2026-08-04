import React from 'react';
import { ChevronUp, ChevronDown } from '@/components/common/Icons';
import { getSwatchStyle } from '@/lib/utils/swatch';

interface ColorFilterProps {
  colors: string[];
  colorToHex: Record<string, string>;
  selectedColors: string[];
  toggleColor: (color: string) => void;
  showAllColors: boolean;
  setShowAllColors: (show: boolean) => void;
}

export default function ColorFilter({
  colors,
  colorToHex,
  selectedColors,
  toggleColor,
  showAllColors,
  setShowAllColors
}: ColorFilterProps) {
  if (colors.length === 0) return null;

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Colors</span>
      <div className="flex flex-wrap gap-2">
        {(showAllColors ? colors : colors.slice(0, 4)).map(color => {
          const isSelected = selectedColors.includes(color);
          const hex = colorToHex[color];
          return (
            <button
              key={color}
              type="button"
              onClick={() => toggleColor(color)}
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
      {colors.length > 4 && (
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
              <span>View {colors.length - 4} More</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
