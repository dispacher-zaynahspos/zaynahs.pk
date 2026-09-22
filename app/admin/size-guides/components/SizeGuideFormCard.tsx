'use client';

import React from 'react';
import { SizeGuide } from '@/lib/types';
import { Plus, Edit2, Trash2, Save } from '@/components/common/Icons';

interface SizeGuideFormCardProps {
  editingGuide: SizeGuide | null;
  newName: string;
  setNewName: (v: string) => void;
  newColumns: string;
  setNewColumns: React.Dispatch<React.SetStateAction<string>>;
  newRows: Record<string, string>[];
  setNewRows: React.Dispatch<React.SetStateAction<Record<string, string>[]>>;
  saving: boolean;
  handleSave: () => void;
  setEditingGuide: (g: SizeGuide | null) => void;
  confirm: (opts: { title: string; message: string; variant: 'danger' | 'warning' | 'info'; confirmText?: string }) => Promise<boolean>;
}

export default function SizeGuideFormCard({
  editingGuide,
  newName,
  setNewName,
  newColumns,
  setNewColumns,
  newRows,
  setNewRows,
  saving,
  handleSave,
  setEditingGuide,
  confirm,
}: SizeGuideFormCardProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
      <h2 className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {editingGuide ? `Edit Guide: ${editingGuide.name}` : 'Create Size Guide Preset'}
      </h2>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preset Name</label>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. Women's Kurtas Sizing"
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560]"
        />
      </div>

      <div className="hidden">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Table Columns (Comma-separated)</label>
        <input
          type="text"
          value={newColumns}
          onChange={(e) => {
            const val = e.target.value;
            setNewColumns(val);
            const cols = val.split(',').map((s) => s.trim()).filter(Boolean);
            setNewRows((prev) =>
              prev.map((row) => {
                const updated = { ...row };
                cols.forEach((col) => {
                  if (updated[col] === undefined) updated[col] = '';
                });
                return updated;
              })
            );
          }}
          placeholder="Size, Chest, Length, Shoulder"
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] px-4 py-2.5 text-sm focus:outline-none focus:border-[#e94560]"
        />
      </div>

      {/* Sizing Rows Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-gray-500 uppercase">Sizing Rows</label>
          <button
            type="button"
            onClick={() => {
              const colName = window.prompt('Enter new column name (e.g. Waist):');
              if (colName && colName.trim()) {
                const trimmed = colName.trim();
                const val = newColumns ? `${newColumns}, ${trimmed}` : trimmed;
                setNewColumns(val);
                const cols = val.split(',').map((s) => s.trim()).filter(Boolean);
                setNewRows((prev) =>
                  prev.map((row) => {
                    const updated = { ...row };
                    cols.forEach((col) => {
                      if (updated[col] === undefined) updated[col] = '';
                    });
                    return updated;
                  })
                );
              }
            }}
            className="flex items-center gap-1.5 text-[#e94560] hover:text-[#d8344e] text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer border border-[#e94560]/20 hover:border-[#e94560]/40"
          >
            <Plus className="h-3.5 w-3.5" /> Add Column
          </button>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#0f0f1b]">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[300px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
                  {newColumns
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((col, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap group"
                      >
                        <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-white/5 py-1 px-2 rounded-lg border border-gray-200/50 dark:border-gray-800/50">
                          <span className="text-gray-700 dark:text-gray-300">{col}</span>
                          <div className="flex items-center gap-1 ml-1 pl-2 border-l border-gray-200 dark:border-gray-700">
                            <button
                              type="button"
                              onClick={() => {
                                const colNewName = window.prompt('Edit column name:', col);
                                if (colNewName && colNewName.trim() && colNewName.trim() !== col) {
                                  const trimmed = colNewName.trim();
                                  const cols = newColumns.split(',').map((s) => s.trim()).filter(Boolean);
                                  const updatedCols = cols.map((c) => (c === col ? trimmed : c));
                                  setNewColumns(updatedCols.join(', '));
                                  setNewRows((prev) =>
                                    prev.map((row) => {
                                      const updated = { ...row };
                                      if (updated[col] !== undefined) {
                                        updated[trimmed] = updated[col];
                                        delete updated[col];
                                      }
                                      return updated;
                                    })
                                  );
                                }
                              }}
                              className="text-gray-400 hover:text-blue-500 transition-colors p-0.5"
                              title="Edit column name"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const confirmed = await confirm({
                                  title: 'Remove Column',
                                  message: `Remove column "${col}"?`,
                                  variant: 'danger',
                                  confirmText: 'Remove',
                                });
                                if (confirmed) {
                                  const cols = newColumns.split(',').map((s) => s.trim()).filter(Boolean);
                                  const updatedCols = cols.filter((c) => c !== col);
                                  setNewColumns(updatedCols.join(', '));
                                  setNewRows((prev) =>
                                    prev.map((row) => {
                                      const updated = { ...row };
                                      delete updated[col];
                                      return updated;
                                    })
                                  );
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                              title="Remove column"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {newRows.map((row, ri) => {
                  const activeCols = newColumns.split(',').map((s) => s.trim()).filter(Boolean);
                  return (
                    <tr key={ri} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/30">
                      {activeCols.map((col, ci) => (
                        <td key={ci} className="px-2 py-2">
                          <input
                            type="text"
                            value={row[col] || ''}
                            onChange={(e) => {
                              const updated = [...newRows];
                              updated[ri] = { ...updated[ri], [col]: e.target.value };
                              setNewRows(updated);
                            }}
                            placeholder="-"
                            className="w-full min-h-[44px] px-2 py-1.5 text-xs border border-transparent hover:border-gray-200 focus:border-[#e94560] dark:focus:border-[#e94560] bg-transparent rounded-lg font-semibold focus:outline-none transition-colors"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setNewRows((prev) => prev.filter((_, idx) => idx !== ri));
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer mx-auto"
                          title="Delete Row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {newRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={newColumns.split(',').filter(Boolean).length + 1}
                      className="text-center py-6 text-xs italic text-gray-400"
                    >
                      No sizing rows added. Click below to add your first row!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => {
                const cols = newColumns.split(',').map((s) => s.trim()).filter(Boolean);
                const newRow: Record<string, string> = {};
                cols.forEach((col) => {
                  newRow[col] = '';
                });
                setNewRows((prev) => [...prev, newRow]);
              }}
              className="flex items-center gap-1.5 text-[#e94560] hover:text-[#d8344e] text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer border border-[#e94560]/20 hover:border-[#e94560]/40"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Sizing Row</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e94560] text-white text-sm font-bold hover:bg-[#d8344e] transition-colors cursor-pointer disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : editingGuide ? 'Update Guide' : 'Save Guide'}
        </button>
        {editingGuide && (
          <button
            type="button"
            onClick={() => {
              setEditingGuide(null);
              setNewName('');
              setNewColumns('Size, Chest, Length, Shoulder');
              setNewRows([
                { Size: 'S', Chest: '38', Length: '26', Shoulder: '17' },
                { Size: 'M', Chest: '40', Length: '27', Shoulder: '18' },
                { Size: 'L', Chest: '42', Length: '28', Shoulder: '19' },
              ]);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Cancel Edit
          </button>
        )}
      </div>
    </div>
  );
}
