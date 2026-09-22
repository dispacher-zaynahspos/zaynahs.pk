'use client';

import React from 'react';
import { Star, RefreshCw, Trash2 } from '@/components/common/Icons';
import { Review } from '@/lib/types';
import EmptyState from '@/components/common/EmptyState';

interface TrashReviewsTableProps {
  reviews: (Review & { productName?: string })[];
  searchTerm: string;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  handleRestore: (id: string, type: 'reviews') => void;
  setConfirmDelete: (val: any) => void;
  isPending: boolean;
}

export const TrashReviewsTable: React.FC<TrashReviewsTableProps> = ({
  reviews,
  searchTerm,
  selectedIds,
  toggleSelect,
  handleRestore,
  setConfirmDelete,
  isPending,
}) => {
  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No trashed reviews"
        description={searchTerm ? "No reviews matching your search term." : "Your trash bin is clean of reviews."}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {reviews.map(review => {
          const isSelected = selectedIds.includes(review.id);
          return (
            <div
              key={review.id}
              className={`bg-white dark:bg-[#16162a] p-4 rounded-2xl border shadow-sm flex flex-col space-y-3 transition-colors ${
                isSelected ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/5' : 'border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(review.id)}
                  className="mt-1 h-4.5 w-4.5 rounded-md border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{review.customerName}</h4>
                    <div className="flex items-center text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span className="text-xs font-bold ml-1">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">Product: {review.productName || 'Unknown Product'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 italic line-clamp-2">"{review.comment}"</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-gray-50 dark:border-gray-800/50">
                <button
                  onClick={() => handleRestore(review.id, 'reviews')}
                  disabled={isPending}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => setConfirmDelete({ id: review.id, type: 'reviews', name: `Review by ${review.customerName}` })}
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
                  checked={reviews.length > 0 && reviews.every(r => selectedIds.includes(r.id))}
                  onChange={(e) => {
                    if (e.target.checked) toggleSelect(reviews[0]?.id);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                />
              </th>
              <th className="p-4">Customer</th>
              <th className="p-4">Product</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Comment</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {reviews.map(review => {
              const isSelected = selectedIds.includes(review.id);
              return (
                <tr key={review.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors ${isSelected ? 'bg-[#e94560]/5 dark:bg-[#e94560]/5' : ''}`}>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(review.id)}
                      className="h-4 w-4 rounded border-gray-300 text-[#e94560] focus:ring-[#e94560] cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{review.customerName}</td>
                  <td className="p-4 text-gray-500 font-semibold text-xs">{review.productName || 'Unknown Product'}</td>
                  <td className="p-4">
                    <div className="flex items-center text-amber-400">
                      <Star className="h-4 w-4 fill-amber-400" />
                      <span className="text-xs font-bold ml-1">{review.rating}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300 text-xs italic truncate max-w-xs">"{review.comment}"</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleRestore(review.id, 'reviews')}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: review.id, type: 'reviews', name: `Review by ${review.customerName}` })}
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
