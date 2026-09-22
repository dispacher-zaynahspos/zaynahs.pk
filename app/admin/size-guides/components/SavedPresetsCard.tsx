'use client';

import React from 'react';
import { SizeGuide } from '@/lib/types';
import { Ruler, Edit2, Trash2, ChevronDown, Download, Upload } from '@/components/common/Icons';

interface SavedPresetsCardProps {
  guides: SizeGuide[];
  loading: boolean;
  selectedGuideIds: Set<string>;
  setSelectedGuideIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  handleExportJSON: () => void;
  handleImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setEditingGuide: (g: SizeGuide) => void;
  setNewName: (v: string) => void;
  setNewColumns: (v: string) => void;
  setNewRows: (v: Record<string, string>[]) => void;
  handleDelete: (id: string) => void;
}

export default function SavedPresetsCard({
  guides,
  loading,
  selectedGuideIds,
  setSelectedGuideIds,
  expandedId,
  setExpandedId,
  handleExportJSON,
  handleImportJSON,
  fileInputRef,
  setEditingGuide,
  setNewName,
  setNewColumns,
  setNewRows,
  handleDelete,
}: SavedPresetsCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Saved Presets ({guides.length})
          </h2>
          {guides.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (selectedGuideIds.size === guides.length) {
                  setSelectedGuideIds(new Set());
                } else {
                  setSelectedGuideIds(new Set(guides.map((g) => g.id)));
                }
              }}
              className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-[#e94560] font-bold uppercase tracking-wider cursor-pointer"
            >
              {selectedGuideIds.size === guides.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
          {selectedGuideIds.size > 0 && (
            <span className="text-[10px] text-gray-400 font-semibold">{selectedGuideIds.size} selected</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800 hover:border-gray-350 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800 hover:border-gray-350 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            Import JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : guides.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No presets yet. Import or create one above.</p>
      ) : (
        <div className="space-y-2">
          {guides.map((guide) => {
            const isExpanded = expandedId === guide.id;
            const cols = guide.chart_data.length > 0 ? Object.keys(guide.chart_data[0]) : [];
            return (
              <div key={guide.id} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                <div
                  className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#0f0f1b] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : guide.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedGuideIds.has(guide.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSelectedGuideIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(guide.id)) next.delete(guide.id);
                        else next.add(guide.id);
                        return next;
                      });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-[#e94560] focus:ring-[#e94560] cursor-pointer flex-shrink-0"
                  />
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a2e] dark:bg-[#e94560] flex-shrink-0">
                    <Ruler className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{guide.name}</p>
                    <p className="text-xs text-gray-400">
                      {guide.chart_data.length} rows &middot; {cols.length} columns
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGuide(guide);
                        setNewName(guide.name);
                        const colHeaders =
                          guide.chart_data.length > 0
                            ? Object.keys(guide.chart_data[0])
                            : ['Size', 'Chest', 'Length', 'Shoulder'];
                        setNewColumns(colHeaders.join(', '));
                        setNewRows(guide.chart_data);
                        setTimeout(() => {
                          const mainEl = document.getElementById('admin-main-content');
                          if (mainEl) {
                            mainEl.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 50);
                      }}
                      className="p-1.5 text-blue-400 hover:text-blue-600 cursor-pointer"
                      title="Edit guide"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(guide.id);
                      }}
                      className="p-1.5 text-red-400 hover:text-red-600 cursor-pointer"
                      title="Delete guide"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0f0f1b]">
                    <div className="overflow-x-auto scrollbar-thin">
                      <table className="w-full text-left border-collapse min-w-[200px]">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            {cols.map((col, i) => (
                              <th
                                key={i}
                                className="px-3 py-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {guide.chart_data.map((row, ri) => (
                            <tr key={ri} className="border-b border-gray-100 dark:border-gray-800">
                              {cols.map((col, ci) => (
                                <td
                                  key={ci}
                                  className="px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap"
                                >
                                  {row[col] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {guide.imageUrl && (
                      <div className="mt-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={guide.imageUrl}
                          alt={guide.name}
                          className="max-h-32 rounded-lg object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
