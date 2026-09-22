'use client';

import React from 'react';
import { Ruler, RefreshCw, Trash2 } from '@/components/common/Icons';
import { SizeGuide } from '@/lib/types';
import EmptyState from '@/components/common/EmptyState';

interface TrashSizeGuidesTableProps {
  sizeGuides: SizeGuide[];
  searchTerm: string;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  handleRestore: (id: string, type: 'size_guides') => void;
  setConfirmDelete: (val: any) => void;
  isPending: boolean;
}

export const TrashSizeGuidesTable: React.FC<TrashSizeGuidesTableProps> = ({
  sizeGuides,
  searchTerm,
  selectedIds,
  toggleSelect,
  handleRestore,
  setConfirmDelete,
  isPending,
}) => {
  if (sizeGuides.length === 0) {
    return (
      <EmptyState
        title="No trashed size guides"
        description={searchTerm ? "No size guides matching your search term." : "Your trash bin is clean of size guides."}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {sizeGuides.map(sg => {
          const isSelected = selectedIds.includes(sg.id);
          return (
            <div
              key={sg.id}
              className={`bg-white dark:bg-[#16162a] p-4 rounded-2xl border shadow-sm flex flex-col space-y-3 transition-colors ${
                isSelected ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/5' : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(sg.id)}
                  className="h-4.5 w-4.5 rounded-md border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                />
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 dark:border-gray-800 flex-shrink-0 flex items-center justify-center">
                  <Ruler className="h-6 w-6 text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate">{sg.name}</h4>
                  <p className="text-xs text-gray-500 font-mono truncate">{(sg as any).columns ? (sg as any).columns.join(', ') : (sg.chart_data?.[0] ? Object.keys(sg.chart_data[0]).join(', ') : '—')}</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-gray-50 dark:border-gray-800/50">
                <button
                  onClick={() => handleRestore(sg.id, 'size_guides')}
                  disabled={isPending}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => setConfirmDelete({ id: sg.id, type: 'size_guides', name: sg.name })}
                  disabled={isPending}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-hidden bg-white dark:bg-[#16162a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-gray-850/50">
              <th className="p-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={sizeGuides.length > 0 && sizeGuides.every(sg => selectedIds.includes(sg.id))}
                  onChange={(e) => {
                    if (e.target.checked) toggleSelect(sizeGuides[0]?.id);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                />
              </th>
              <th className="p-4">Size Guide Name</th>
              <th className="p-4">Columns</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {sizeGuides.map(sg => {
              const isSelected = selectedIds.includes(sg.id);
              return (
                <tr key={sg.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors ${isSelected ? 'bg-[#e94560]/5 dark:bg-[#e94560]/5' : ''}`}>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(sg.id)}
                      className="h-4 w-4 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{sg.name}</td>
                  <td className="p-4 text-gray-500 font-mono text-xs">{(sg as any).columns ? (sg as any).columns.join(', ') : (sg.chart_data?.[0] ? Object.keys(sg.chart_data[0]).join(', ') : '—')}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleRestore(sg.id, 'size_guides')}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: sg.id, type: 'size_guides', name: sg.name })}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
