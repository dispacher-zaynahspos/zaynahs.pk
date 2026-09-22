import React, { useState } from 'react';
import { Plus, X } from '@/components/common/Icons';
import { Category } from '@/lib/types';

interface CategoryAssignmentInputProps {
  categories: Category[];
  assignedCategories: Category[];
  setAssignedCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export default function CategoryAssignmentInput({
  categories,
  assignedCategories,
  setAssignedCategories,
}: CategoryAssignmentInputProps) {
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryInputFocused, setIsCategoryInputFocused] = useState(false);

  const availableCategories = categories.filter(c => 
    !assignedCategories.find(ac => ac.id === c.id) &&
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  ).slice(0, 5);

  const handleAssignCategory = (cat: Category) => {
    setAssignedCategories(prev => [...prev, cat]);
    setCategorySearch('');
  };

  const handleRemoveCategory = (catId: string) => {
    setAssignedCategories(prev => prev.filter(c => c.id !== catId));
  };

  const handleMoveCategory = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx > 0) {
      const newArr = [...assignedCategories];
      [newArr[idx], newArr[idx - 1]] = [newArr[idx - 1], newArr[idx]];
      setAssignedCategories(newArr);
    } else if (direction === 'down' && idx < assignedCategories.length - 1) {
      const newArr = [...assignedCategories];
      [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
      setAssignedCategories(newArr);
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Assign Categories</label>
      <div className="bg-gray-50/50 dark:bg-[#0f0f1b]/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search and add categories to this collection..."
              value={categorySearch}
              onChange={e => setCategorySearch(e.target.value)}
              onFocus={() => setIsCategoryInputFocused(true)}
              onBlur={() => setTimeout(() => setIsCategoryInputFocused(false), 200)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-sm focus:outline-none focus:border-[#e94560] dark:text-white"
            />
            {(categorySearch || isCategoryInputFocused) && availableCategories.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                {availableCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleAssignCategory(cat)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white flex items-center justify-between cursor-pointer"
                  >
                    <span>{cat.name}</span>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {assignedCategories.length > 0 ? (
            <div className="space-y-2 border border-gray-200 dark:border-gray-800 rounded-xl p-2 bg-white dark:bg-[#16162a]">
              {assignedCategories.map((cat, idx) => (
                <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 dark:border-gray-800/50 bg-gray-50 dark:bg-[#0f0f1b]">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400 w-4">{idx + 1}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveCategory(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveCategory(idx, 'down')}
                      disabled={idx === assignedCategories.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat.id)}
                      className="p-1 ml-2 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              No categories assigned yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
