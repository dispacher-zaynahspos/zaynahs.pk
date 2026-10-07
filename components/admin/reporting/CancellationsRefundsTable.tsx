'use client';

import React, { useState } from 'react';
import { formatPrice } from '@/lib/utils/whatsapp';
import { CancellationRow } from './types';

interface Props {
  rows: CancellationRow[];
  currencySymbol: string;
  cancelledTotal: number;
  refundedTotal: number;
}

const PAGE_SIZE = 15;

export default function CancellationsRefundsTable({ rows, currencySymbol, cancelledTotal, refundedTotal }: Props) {
  const [filter, setFilter] = useState<'all' | 'cancelled' | 'refunded'>('all');
  const [page, setPage] = useState(0);

  const filtered = filter === 'all' ? rows : rows.filter(r => r.status === filter);
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const totalLost = cancelledTotal + refundedTotal;

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white">Cancellations & Refunds</h3>
          <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Orders cancelled or refunded — reasons and amounts</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'cancelled', 'refunded'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0); }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-colors ${
                filter === f
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                  : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-3 bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30">
          <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 block">Cancelled Value</span>
          <span className="text-base font-black text-red-700 dark:text-red-300 block mt-0.5">{formatPrice(cancelledTotal, currencySymbol)}</span>
        </div>
        <div className="rounded-xl p-3 bg-orange-50 dark:bg-orange-900/15 border border-orange-100 dark:border-orange-900/30">
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 block">Refunded Back</span>
          <span className="text-base font-black text-orange-700 dark:text-orange-300 block mt-0.5">{formatPrice(refundedTotal, currencySymbol)}</span>
        </div>
        <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Total Revenue Lost</span>
          <span className="text-base font-black text-gray-700 dark:text-gray-300 block mt-0.5">{formatPrice(totalLost, currencySymbol)}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-xs text-gray-400 font-semibold border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          No cancellations or refunds in this period 🎉
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="py-2.5 pr-3">Order</th>
                  <th className="py-2.5 pr-3">Customer</th>
                  <th className="py-2.5 pr-3 text-right">Order Total</th>
                  <th className="py-2.5 pr-3 text-right">Refund Amt</th>
                  <th className="py-2.5 pr-3">Status</th>
                  <th className="py-2.5 pr-3">Reason</th>
                  <th className="py-2.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50 font-semibold text-gray-700 dark:text-gray-300">
                {pageRows.map(row => (
                  <tr key={row.orderId} className="hover:bg-gray-50/40 dark:hover:bg-white/2 transition-colors">
                    <td className="py-2.5 pr-3 font-black text-gray-900 dark:text-white text-[11px]">{row.orderNumber}</td>
                    <td className="py-2.5 pr-3 text-gray-600 dark:text-gray-400 max-w-[120px] truncate">{row.customerName || '—'}</td>
                    <td className="py-2.5 pr-3 text-right font-black">{formatPrice(row.total, currencySymbol)}</td>
                    <td className="py-2.5 pr-3 text-right text-red-500">
                      {row.refundAmount ? formatPrice(row.refundAmount, currencySymbol) : '—'}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        row.status === 'cancelled'
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                          : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-gray-400 max-w-[160px] truncate text-[10px]">{row.cancelReason || '—'}</td>
                    <td className="py-2.5 text-right text-gray-400 text-[10px] tabular-nums whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-gray-400 font-semibold">
                {filtered.length} records · page {page + 1}/{totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
