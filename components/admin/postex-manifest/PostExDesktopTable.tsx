'use client';

import React from 'react';
import { Check, AlertTriangle, Eye } from '@/components/common/Icons';
import { ManifestOrder, EditableRow } from './types';
import CitySelect from './CitySelect';

interface PostExDesktopTableProps {
  orders: ManifestOrder[];
  rows: Record<string, EditableRow>;
  results: Record<string, { success: boolean; tracking?: string; error?: string }>;
  selectAll: boolean;
  toggleSelectAll: () => void;
  updateRow: (id: string, field: keyof EditableRow, value: any) => void;
  cities: string[];
  citiesLoading: boolean;
  setDetailRowId: (id: string | null) => void;
}

export function PostExDesktopTable({
  orders,
  rows,
  results,
  selectAll,
  toggleSelectAll,
  updateRow,
  cities,
  citiesLoading,
  setDetailRowId
}: PostExDesktopTableProps) {
  return (
    <div className="hidden md:block bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="py-3 px-3 w-10">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 w-12">#</th>
              <th className="py-3 px-3">Order</th>
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Phone</th>
              <th className="py-3 px-3">Address</th>
              <th className="py-3 px-3">City</th>
              <th className="py-3 px-3 w-24">COD</th>
              <th className="py-3 px-3 w-20">KG</th>
              <th className="py-3 px-3 w-20">Specs</th>
              <th className="py-3 px-3 w-14">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {orders.map((order, idx) => {
              const row = rows[order.id];
              if (!row) return null;
              const res = results[order.id];
              return (
                <tr key={order.id} className={`hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors ${res?.success ? 'bg-emerald-50/50 dark:bg-emerald-950/10' : ''} ${res && !res.success ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}>
                  <td className="py-2 px-3">
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={(e) => updateRow(order.id, 'selected', e.target.checked)}
                      disabled={!!res}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-2 px-3 text-xs font-bold text-gray-400">{idx + 1}</td>
                  <td className="py-2 px-3">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{order.orderNumber}</span>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      value={row.name}
                      onChange={(e) => updateRow(order.id, 'name', e.target.value)}
                      disabled={!!res}
                      className="w-full min-w-[100px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-2.5 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      value={row.phone}
                      onChange={(e) => updateRow(order.id, 'phone', e.target.value)}
                      disabled={!!res}
                      className="w-full min-w-[110px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-2.5 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      value={row.address}
                      onChange={(e) => updateRow(order.id, 'address', e.target.value)}
                      disabled={!!res}
                      className="w-full min-w-[180px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-2.5 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="py-2 px-3 min-w-[120px]">
                    <CitySelect
                      value={row.city}
                      cities={cities}
                      loading={citiesLoading}
                      disabled={!!res}
                      onChange={(v) => updateRow(order.id, 'city', v)}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      value={row.cod}
                      onChange={(e) => updateRow(order.id, 'cod', e.target.value)}
                      disabled={!!res}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-2.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      value={row.kg}
                      onChange={(e) => updateRow(order.id, 'kg', e.target.value)}
                      disabled={!!res}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-2.5 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="py-2 px-3">
                    {res ? (
                      res.success ? <Check className="h-4 w-4 text-emerald-500" /> : <span title={res.error}><AlertTriangle className="h-4 w-4 text-red-500" /></span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {row.pieces}pcs
                        </span>
                        {row.shipmentType !== 'Normal' && (
                          <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                            {row.shipmentType}
                          </span>
                        )}
                        {row.fragile === 'Yes' && (
                          <span className="text-[9px]" title="Fragile">📦</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {res?.success ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : res && !res.success ? (
                      <span title={res.error}><AlertTriangle className="h-4 w-4 text-red-500" /></span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDetailRowId(order.id)}
                        className="relative p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                        {(row.shipmentType !== 'Normal' || row.fragile === 'Yes' || row.remarks || row.pieces !== '1') && (
                          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-[#16162a]" />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
