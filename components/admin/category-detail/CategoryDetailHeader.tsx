'use client';

import React from 'react';
import Link from 'next/link';
import { Category } from '@/lib/types';
import { ArrowLeft, ExternalLink, Plus, Loader2, Edit } from '@/components/common/Icons';

interface CategoryDetailHeaderProps {
  category: Category;
  totalProducts: number;
  hasUnsavedChanges: boolean;
  savingSortOrder: boolean;
  onSaveSortOrder: () => void;
  onOpenAddModal: () => void;
  onOpenEditCategory?: () => void;
}

export function CategoryDetailHeader({
  category,
  totalProducts,
  hasUnsavedChanges,
  savingSortOrder,
  onSaveSortOrder,
  onOpenAddModal,
  onOpenEditCategory,
}: CategoryDetailHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/categories"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span>{category.name}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
              {totalProducts} products
            </span>
          </h1>
        </div>
        <p className="text-xs text-gray-500 font-semibold pl-7">
          Manage product positions, stock, prices, and variant settings for this category.
        </p>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0">
        <Link
          href={`/shop?category=${category.slug}`}
          target="_blank"
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-xs shrink-0 whitespace-nowrap active:scale-98"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          <span>View on Store</span>
        </Link>

        {onOpenEditCategory && (
          <button
            type="button"
            onClick={onOpenEditCategory}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-xs shrink-0 whitespace-nowrap active:scale-98 cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5 shrink-0" />
            <span>Edit Category</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-primary,#e94560)] text-white hover:opacity-95 transition-all shadow-xs active:scale-98 cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Add Products</span>
        </button>

        {hasUnsavedChanges && (
          <button
            type="button"
            onClick={onSaveSortOrder}
            disabled={savingSortOrder}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
          >
            {savingSortOrder ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
