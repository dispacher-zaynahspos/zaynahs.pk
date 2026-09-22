'use client';

import React from 'react';
import { Package, FolderOpen, Images } from '@/components/common/Icons';

interface Stats {
  products: { total: number; optimized: number };
  categories: { total: number; optimized: number };
  media: { total: number; optimized: number };
}

interface BulkStatsCardsProps {
  stats: Stats;
  running: boolean;
  handleStartBulk: (type: 'products' | 'categories' | 'media') => void;
  getPercent: (optimized: number, total: number) => number;
}

export default function BulkStatsCards({
  stats,
  running,
  handleStartBulk,
  getPercent,
}: BulkStatsCardsProps) {
  const prodPercent = getPercent(stats.products.optimized, stats.products.total);
  const catPercent = getPercent(stats.categories.optimized, stats.categories.total);
  const mediaPercent = getPercent(stats.media.optimized, stats.media.total);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Products Card */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            Products SEO
          </span>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-full">
            {prodPercent}% Done
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats.products.optimized}{' '}
            <span className="text-sm text-gray-400 font-semibold">/ {stats.products.total}</span>
          </div>
          <div className="text-xs text-gray-500">
            {stats.products.total - stats.products.optimized} pending items remaining
          </div>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${prodPercent}%` }}
          />
        </div>
        <button
          onClick={() => handleStartBulk('products')}
          disabled={running || stats.products.total - stats.products.optimized === 0}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-100 dark:disabled:bg-gray-850 disabled:text-gray-400 rounded-xl text-xs font-bold transition-all"
        >
          Optimize Products
        </button>
      </div>

      {/* Categories Card */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-emerald-500" />
            Categories SEO
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
            {catPercent}% Done
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats.categories.optimized}{' '}
            <span className="text-sm text-gray-400 font-semibold">/ {stats.categories.total}</span>
          </div>
          <div className="text-xs text-gray-500">
            {stats.categories.total - stats.categories.optimized} pending items remaining
          </div>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${catPercent}%` }}
          />
        </div>
        <button
          onClick={() => handleStartBulk('categories')}
          disabled={running || stats.categories.total - stats.categories.optimized === 0}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-100 dark:disabled:bg-gray-850 disabled:text-gray-400 rounded-xl text-xs font-bold transition-all"
        >
          Optimize Categories
        </button>
      </div>

      {/* Media Vision Card */}
      <div className="bg-white dark:bg-[#16162a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Images className="w-5 h-5 text-purple-500" />
            Vision Tagging
          </span>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 rounded-full">
            {mediaPercent}% Done
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {stats.media.optimized}{' '}
            <span className="text-sm text-gray-400 font-semibold">/ {stats.media.total}</span>
          </div>
          <div className="text-xs text-gray-500">
            {stats.media.total - stats.media.optimized} pending items remaining
          </div>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-purple-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${mediaPercent}%` }}
          />
        </div>
        <button
          onClick={() => handleStartBulk('media')}
          disabled={running || stats.media.total - stats.media.optimized === 0}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-100 dark:disabled:bg-gray-850 disabled:text-gray-400 rounded-xl text-xs font-bold transition-all"
        >
          Run Media Analysis
        </button>
      </div>
    </div>
  );
}
