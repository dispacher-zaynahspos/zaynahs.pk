import React from 'react';
import { Truck } from '@/components/common/Icons';

interface PostExParcelDefaultsProps {
  defaultWeight: string;
  setDefaultWeight: (val: string) => void;
  defaultItems: string;
  setDefaultItems: (val: string) => void;
  defaultProduct: string;
  setDefaultProduct: (val: string) => void;
  defaultRemarks: string;
  setDefaultRemarks: (val: string) => void;
}

export default function PostExParcelDefaults({
  defaultWeight,
  setDefaultWeight,
  defaultItems,
  setDefaultItems,
  defaultProduct,
  setDefaultProduct,
  defaultRemarks,
  setDefaultRemarks,
}: PostExParcelDefaultsProps) {
  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mt-6">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          Parcel Defaults
        </h2>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Default Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={defaultWeight}
              onChange={(e) => setDefaultWeight(e.target.value)}
              placeholder="0.5"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="cursor-help" title="Default number of pieces per parcel. If left empty, it will default to 1 piece.">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5 flex items-center justify-between">
              <span>Default Items Per Parcel</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/50 font-normal">Defaults to 1 if empty</span>
            </label>
            <input
              type="number"
              value={defaultItems}
              onChange={(e) => setDefaultItems(e.target.value)}
              placeholder="3"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Default Product / Detail</label>
            <input
              type="text"
              value={defaultProduct}
              onChange={(e) => setDefaultProduct(e.target.value)}
              placeholder="Kids Clothes"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Default Delivery Note</label>
            <input
              type="text"
              value={defaultRemarks}
              onChange={(e) => setDefaultRemarks(e.target.value)}
              placeholder="Call before delivery"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
