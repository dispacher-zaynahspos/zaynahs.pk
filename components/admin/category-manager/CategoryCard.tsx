'use client';

import React from 'react';
import Link from 'next/link';
import { FolderOpen, Edit, Trash2 } from '@/components/common/Icons';
import { Category } from '@/lib/types';

interface CategoryCardProps {
  cat: Category & { _level: number };
  selectedCategoryIds: Set<string>;
  setSelectedCategoryIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}

export default function CategoryCard({
  cat,
  selectedCategoryIds,
  setSelectedCategoryIds,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4 text-gray-900 dark:text-white transition-colors">
      <div className="block flex-1 group cursor-pointer" onClick={() => {
        if (typeof window !== 'undefined' && window.getSelection()?.toString().length) return;
        window.location.href = `/admin/categories/${cat.id}`;
      }}>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            {cat.id !== '00000000-0000-4000-8000-000000000099' ? (
              <input
                type="checkbox"
                checked={selectedCategoryIds.has(cat.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  setSelectedCategoryIds(prev => {
                    const next = new Set(prev);
                    if (next.has(cat.id)) next.delete(cat.id);
                    else next.add(cat.id);
                    return next;
                  });
                }}
                onClick={e => e.stopPropagation()}
                className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] cursor-pointer flex-shrink-0"
              />
            ) : (
              <div className="w-4 h-4 mt-1 flex-shrink-0" />
            )}
            <div>
              <h3 className="font-bold text-gray-950 dark:text-white text-base group-hover:text-[#e94560] transition-colors flex items-center gap-1.5 flex-wrap">
                {cat._level > 0 && (
                  <span className="text-gray-400">{'—'.repeat(cat._level)} </span>
                )}
                {cat.name}
                {cat.id === '00000000-0000-4000-8000-000000000099' && (
                  <span className="ml-2 text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded uppercase">System</span>
                )}
              </h3>
              <p className="text-xs text-gray-500 font-semibold mt-1">Slug: {cat.slug}</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md shrink-0 ${
            cat.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-505'
          }`}>
            {cat.active ? 'Active' : 'Inactive'}
          </span>
        </div>
        {cat.description && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2.5 line-clamp-2" dangerouslySetInnerHTML={{ __html: cat.description }} />
        )}
      </div>

      <div className="flex gap-2.5 pt-3 border-t border-gray-150 dark:border-gray-800 justify-end items-center">
        <Link
          href={`/admin/categories/${cat.id}`}
          className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/20 px-3 py-2 rounded-lg cursor-pointer"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          <span>Products</span>
        </Link>
        <button
          onClick={() => onEdit(cat)}
          className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[#1a1a2e] dark:hover:text-white bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-lg cursor-pointer"
        >
          <Edit className="h-3.5 w-3.5" />
          <span>Edit</span>
        </button>
        {cat.id !== '00000000-0000-4000-8000-000000000099' && (
          <button
            onClick={() => onDelete(cat.id)}
            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 px-3 py-2 rounded-lg cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
}
