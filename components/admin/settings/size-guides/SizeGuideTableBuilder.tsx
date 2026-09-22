'use client';

import React from 'react';
import { Plus, Edit2, Trash2 } from '@/components/common/Icons';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';

interface SizeGuideTableBuilderProps {
  guideColumns: string;
  setGuideColumns: (v: string) => void;
  guideRows: Array<Record<string, string>>;
  setGuideRows: React.Dispatch<React.SetStateAction<Array<Record<string, string>>>>;
}

export default function SizeGuideTableBuilder({
  guideColumns,
  setGuideColumns,
  guideRows,
  setGuideRows,
}: SizeGuideTableBuilderProps) {
  const { confirm } = useConfirm();

  const activeCols = guideColumns.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Sizing Rows Data</label>
        <button
          type="button"
          onClick={() => {
            const colName = window.prompt("Enter new column name (e.g. Waist):");
            if (colName && colName.trim()) {
              const trimmed = colName.trim();
              const val = guideColumns ? `${guideColumns}, ${trimmed}` : trimmed;
              setGuideColumns(val);
              const cols = val.split(',').map(s => s.trim()).filter(Boolean);
              setGuideRows(prev => prev.map(row => {
                const updated = { ...row };
                cols.forEach(col => { if (updated[col] === undefined) updated[col] = ''; });
                return updated;
              }));
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
                {activeCols.map((colName, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap group"
                  >
                    <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-white/5 py-1 px-2 rounded-lg border border-gray-200/50 dark:border-gray-800/50">
                      <span className="text-gray-700 dark:text-gray-300">{colName}</span>
                      <div className="flex items-center gap-1 ml-1 pl-2 border-l border-gray-200 dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() => {
                            const newName = window.prompt("Edit column name:", colName);
                            if (newName && newName.trim() && newName.trim() !== colName) {
                              const trimmed = newName.trim();
                              const cols = guideColumns.split(',').map(s => s.trim()).filter(Boolean);
                              const updatedCols = cols.map(c => c === colName ? trimmed : c);
                              setGuideColumns(updatedCols.join(', '));
                              setGuideRows(prev => prev.map(row => {
                                const updated = { ...row };
                                if (updated[colName] !== undefined) {
                                  updated[trimmed] = updated[colName];
                                  delete updated[colName];
                                }
                                return updated;
                              }));
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
                              message: `Remove column "${colName}"?`,
                              variant: 'danger',
                              confirmText: 'Remove'
                            });
                            if (confirmed) {
                              const cols = guideColumns.split(',').map(s => s.trim()).filter(Boolean);
                              const updatedCols = cols.filter(c => c !== colName);
                              setGuideColumns(updatedCols.join(', '));
                              setGuideRows(prev => prev.map(row => {
                                const updated = { ...row };
                                delete updated[colName];
                                return updated;
                              }));
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
              {guideRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/30">
                  {activeCols.map((colName, colIndex) => (
                    <td key={colIndex} className="px-2 py-2">
                      <input
                        type="text"
                        value={row[colName] || ''}
                        onChange={(e) => {
                          const updatedRows = [...guideRows];
                          updatedRows[rowIndex] = {
                            ...updatedRows[rowIndex],
                            [colName]: e.target.value
                          };
                          setGuideRows(updatedRows);
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
                        setGuideRows(prev => prev.filter((_, idx) => idx !== rowIndex));
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer mx-auto"
                      title="Delete Row"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {guideRows.length === 0 && (
                <tr>
                  <td
                    colSpan={activeCols.length + 1}
                    className="text-center py-6 text-xs italic text-gray-400"
                  >
                    No sizing rows added. Click below to add your first row!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              const newRow: Record<string, string> = {};
              activeCols.forEach(col => {
                newRow[col] = '';
              });
              setGuideRows(prev => [...prev, newRow]);
            }}
            className="flex items-center gap-1.5 text-[#e94560] hover:text-[#d8344e] text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer border border-[#e94560]/20 hover:border-[#e94560]/40"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Sizing Row</span>
          </button>
        </div>
      </div>
    </div>
  );
}
