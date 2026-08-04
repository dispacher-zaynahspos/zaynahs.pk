import React from 'react';
import { Category } from '@/lib/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId?: string) => void;
  categoryCounts: Record<string, number>;
  totalProductsCount: number;
}

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
  categoryCounts,
  totalProductsCount
}: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Products Category</span>
      <div className="space-y-1.5 md:max-h-60 md:overflow-y-auto pr-1">
        <button
          onClick={() => onSelectCategory(undefined)}
          className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${selectedCategoryId === undefined
              ? 'bg-[#e94560] text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
        >
          <span>Shop</span>
          <span className={selectedCategoryId === undefined ? 'text-white/80' : 'text-gray-400'}>
            ({totalProductsCount})
          </span>
        </button>

        {categories.map((category) => {
          const count = categoryCounts[category.id] || 0;
          const isSelected = selectedCategoryId === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${isSelected
                  ? 'bg-[#e94560] text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
            >
              <span className="truncate pr-2">{category.name}</span>
              <span className={isSelected ? 'text-white/80' : 'text-gray-400'}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
