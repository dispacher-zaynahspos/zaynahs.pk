import React, { useState } from 'react';
import { Category, HomepageSection } from '@/lib/types';
import { Trash2, ChevronUp, ChevronDown } from '@/components/common/Icons';
import { toast } from 'sonner';

interface FlashSaleCategoryRulesProps {
  section: HomepageSection;
  categories: Category[];
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
}

export default function FlashSaleCategoryRules({
  section,
  categories,
  onUpdateSection,
}: FlashSaleCategoryRulesProps) {
  const contentData = section.content_data || {};
  const categoryDiscounts = contentData.categoryDiscounts || [];

  const [selectedCatId, setSelectedCatId] = useState('');
  const [catDiscountType, setCatDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [catDiscountValue, setCatDiscountValue] = useState('');

  const handleAddCategoryDiscount = () => {
    if (!selectedCatId || !catDiscountValue) return;

    if (categoryDiscounts.some((c: any) => c.categoryId === selectedCatId)) {
      toast.error('This category discount rule already exists.');
      return;
    }

    const updated = [
      ...categoryDiscounts,
      {
        categoryId: selectedCatId,
        discountType: catDiscountType,
        discountValue: parseFloat(catDiscountValue) || 0
      }
    ];

    onUpdateSection({
      content_data: { ...contentData, categoryDiscounts: updated }
    });
    setSelectedCatId('');
    setCatDiscountValue('');
  };

  const handleRemoveCategoryDiscount = (categoryId: string) => {
    const updated = categoryDiscounts.filter((c: any) => c.categoryId !== categoryId);
    onUpdateSection({
      content_data: { ...contentData, categoryDiscounts: updated }
    });
  };

  const handleMoveCategoryDiscount = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categoryDiscounts.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...categoryDiscounts];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    onUpdateSection({
      content_data: { ...contentData, categoryDiscounts: updated }
    });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 p-3.5 rounded-2xl bg-[#e94560]/5 space-y-3">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] block">
        Category Discount Rules
      </span>

      <div className="space-y-1.5">
        <label className="text-[10px] text-gray-400">Select Category</label>
        <select
          value={selectedCatId}
          onChange={e => setSelectedCatId(e.target.value)}
          className="w-full px-2.5 py-1.5 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white"
        >
          <option value="">-- Choose Category --</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2.5">
        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Discount Type</label>
          <select
            value={catDiscountType}
            onChange={e => setCatDiscountType(e.target.value as 'percentage' | 'fixed')}
            className="w-full px-2.5 py-2 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (Rs.)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Discount Value</label>
          <input
            type="number"
            value={catDiscountValue}
            onChange={e => setCatDiscountValue(e.target.value)}
            placeholder={catDiscountType === 'percentage' ? 'e.g. 15' : 'e.g. 200'}
            className="w-full px-2.5 py-2 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddCategoryDiscount}
        disabled={!selectedCatId || !catDiscountValue}
        className="w-full py-1.5 bg-[#e94560] hover:bg-[#d83550] disabled:bg-gray-200 disabled:dark:bg-gray-800 disabled:text-gray-400 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
      >
        Apply Category Sale
      </button>

      {categoryDiscounts.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-gray-800">
          <span className="text-[9px] font-bold text-gray-450 uppercase block">Active Category Sales</span>
          <div className="space-y-1.5">
            {categoryDiscounts.map((cd: any, index: number) => {
              const catObj = categories.find(c => c.id === cd.categoryId);
              if (!catObj) return null;
              return (
                <div key={cd.categoryId} className="group relative flex items-center justify-between p-2 pr-16 bg-white dark:bg-[#16162a] border border-gray-250/20 dark:border-gray-800 rounded-xl text-xs overflow-hidden">
                  <span className="font-bold text-gray-800 dark:text-gray-200 truncate pr-2">{catObj.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-[#e94560]">-{(cd.discountType === 'percentage' ? cd.discountValue + '%' : 'Rs. ' + cd.discountValue)}</span>
                  </div>
                  {/* Hover Actions */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-[#16162a] pl-2">
                    <button
                      type="button"
                      onClick={() => handleMoveCategoryDiscount(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveCategoryDiscount(index, 'down')}
                      disabled={index === categoryDiscounts.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategoryDiscount(cd.categoryId)}
                      className="p-1 text-gray-400 hover:text-red-500 cursor-pointer ml-1 border-l border-gray-200 dark:border-gray-800 pl-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
