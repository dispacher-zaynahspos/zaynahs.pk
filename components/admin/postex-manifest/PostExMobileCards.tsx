'use client';

import React from 'react';
import { Check, AlertTriangle, Eye } from '@/components/common/Icons';
import { ManifestOrder, EditableRow } from './types';
import CitySelect from './CitySelect';

interface PostExMobileCardsProps {
  orders: ManifestOrder[];
  rows: Record<string, EditableRow>;
  results: Record<string, { success: boolean; tracking?: string; error?: string }>;
  updateRow: (id: string, field: keyof EditableRow, value: any) => void;
  cities: string[];
  citiesLoading: boolean;
  setDetailRowId: (id: string | null) => void;
}

export function PostExMobileCards({
  orders,
  rows,
  results,
  updateRow,
  cities,
  citiesLoading,
  setDetailRowId
}: PostExMobileCardsProps) {
  return (
    <div className="md:hidden space-y-3">
      {orders.map((order) => {
        const row = rows[order.id];
        if (!row) return null;
        const res = results[order.id];
        return (
          <div
            key={order.id}
            className={`bg-white dark:bg-[#16162a] rounded-2xl border p-4 shadow-sm space-y-3 transition-colors ${
              res?.success ? 'border-emerald-200 dark:border-emerald-900/50' :
              res && !res.success ? 'border-red-200 dark:border-red-900/50' :
              'border-gray-200 dark:border-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={row.selected}
                  onChange={(e) => updateRow(order.id, 'selected', e.target.checked)}
                  disabled={!!res}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-gray-900 dark:text-white">#{order.orderNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                {!res && (
                  <button
                    type="button"
                    onClick={() => setDetailRowId(order.id)}
                    className="relative p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    {(row.shipmentType !== 'Normal' || row.fragile === 'Yes' || row.remarks || row.pieces !== '1') && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-[#16162a]" />
                    )}
                  </button>
                )}
                {res?.success && <Check className="h-5 w-5 text-emerald-500" />}
                {res && !res.success && <span title={res.error}><AlertTriangle className="h-5 w-5 text-red-500" /></span>}
              </div>
            </div>
            {/* Error message */}
            {res && !res.success && (
              <div className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200 dark:border-red-900/50">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>{res.error}</span>
              </div>
            )}
            {/* Specs bar for mobile */}
            {!res && (row.shipmentType !== 'Normal' || row.fragile === 'Yes' || row.remarks || row.pieces !== '1') && (
              <div className="flex flex-wrap items-center gap-1.5 -mt-1">
                <span className="text-[10px] font-bold text-gray-400">{row.pieces}pcs</span>
                {row.shipmentType !== 'Normal' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                    {row.shipmentType}
                  </span>
                )}
                {row.fragile === 'Yes' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/50 font-bold">
                    Fragile
                  </span>
                )}
                {row.remarks && (
                  <span className="text-[9px] text-gray-400 truncate max-w-[120px]">"{row.remarks}"</span>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Name</label>
                <input value={row.name} onChange={(e) => updateRow(order.id, 'name', e.target.value)} disabled={!!res}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white disabled:opacity-50" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Phone</label>
                <input value={row.phone} onChange={(e) => updateRow(order.id, 'phone', e.target.value)} disabled={!!res}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white disabled:opacity-50" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">City</label>
                <CitySelect
                  value={row.city}
                  cities={cities}
                  loading={citiesLoading}
                  disabled={!!res}
                  onChange={(v) => updateRow(order.id, 'city', v)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Address</label>
                <input value={row.address} onChange={(e) => updateRow(order.id, 'address', e.target.value)} disabled={!!res}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white disabled:opacity-50" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">COD (Rs)</label>
                  <input value={row.cod} onChange={(e) => updateRow(order.id, 'cod', e.target.value)} disabled={!!res}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">KG</label>
                  <input value={row.kg} onChange={(e) => updateRow(order.id, 'kg', e.target.value)} disabled={!!res}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white disabled:opacity-50" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
