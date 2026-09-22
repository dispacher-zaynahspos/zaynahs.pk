'use client';

import React from 'react';
import { ReviewWithProduct } from './types';
import StarRating from '@/components/store/StarRating';
import EmptyState from '@/components/common/EmptyState';
import { MessageSquare, Check, Eye, EyeOff, Trash2 } from '@/components/common/Icons';

interface ReviewsTableProps {
  filteredReviews: ReviewWithProduct[];
  formatDate: (dateStr: string) => string;
  onOpenReview: (review: ReviewWithProduct) => void;
  onToggleApprove: (id: string, currentApproved: boolean) => void;
  onToggleHide: (id: string, currentHidden: boolean) => void;
  onDelete: (id: string) => void;
}

export default function ReviewsTable({
  filteredReviews,
  formatDate,
  onOpenReview,
  onToggleApprove,
  onToggleHide,
  onDelete,
}: ReviewsTableProps) {
  if (filteredReviews.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-8 w-8 text-gray-400" />}
        title="No reviews found"
        description="There are no reviews in this category."
      />
    );
  }

  return (
    <>
      {/* Desktop view Table */}
      <div className="hidden md:block overflow-hidden bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-white/5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredReviews.map((review) => (
                <tr
                  key={review.id}
                  className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                  onClick={() => onOpenReview(review)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {review.productImage ? (
                        <img
                          src={review.productImage}
                          alt={review.productName || 'Product'}
                          className="w-12 h-12 rounded-md object-cover border border-gray-100 dark:border-gray-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-[10px] font-bold flex-shrink-0">
                          No<br />Img
                        </div>
                      )}
                      <span className="font-bold text-gray-900 dark:text-white line-clamp-2 max-w-[200px] text-sm leading-snug">
                        {review.productName || 'Unknown Product'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{review.customerName}</div>
                    {review.customerPhone && <div className="text-xs text-gray-400 dark:text-gray-500">{review.customerPhone}</div>}
                    {review.customerEmail && <div className="text-xs text-gray-400 dark:text-gray-500">{review.customerEmail}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <StarRating rating={review.rating} showText={true} starSize={14} />
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate" title={review.comment}>
                    {review.comment || <span className="text-gray-300 dark:text-gray-700 italic">No comment</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${
                        !review.approved
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                          : review.hidden
                          ? 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-400'
                          : 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                      }`}
                    >
                      {!review.approved ? 'Pending' : review.hidden ? 'Hidden' : 'Approved'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-400 dark:text-gray-500">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onToggleApprove(review.id, review.approved)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          review.approved
                            ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10'
                        }`}
                        title={review.approved ? 'Approved' : 'Approve'}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onToggleHide(review.id, review.hidden ?? false)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          review.hidden
                            ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                            : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                        }`}
                        title={review.hidden ? 'Show' : 'Hide'}
                      >
                        {review.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => onDelete(review.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Move to Trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view Cards */}
      <div className="md:hidden space-y-4">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="cursor-pointer bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3 transition-colors duration-200 hover:bg-gray-50/50 dark:hover:bg-white/5"
            onClick={() => onOpenReview(review)}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {review.productImage ? (
                  <img
                    src={review.productImage}
                    alt={review.productName || 'Product'}
                    className="w-12 h-12 rounded-md object-cover border border-gray-100 dark:border-gray-700 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-[10px] font-bold flex-shrink-0">
                    No<br />Img
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                    {review.productName || 'Unknown Product'}
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    by <span className="font-semibold text-gray-700 dark:text-gray-300">{review.customerName}</span>
                    {review.customerPhone && ` (${review.customerPhone})`}
                    {review.customerEmail && <div className="text-xs text-gray-400 dark:text-gray-500">{review.customerEmail}</div>}
                  </div>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  !review.approved
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    : review.hidden
                    ? 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-400'
                    : 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                }`}
              >
                {!review.approved ? 'Pending' : review.hidden ? 'Hidden' : 'Approved'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <StarRating rating={review.rating} showText={false} starSize={12} />
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{formatDate(review.createdAt)}</span>
            </div>
            {review.comment && (
              <p className="text-xs text-gray-650 dark:text-gray-300 italic bg-gray-50 dark:bg-[#0f0f1b]/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/20">
                &ldquo;{review.comment}&rdquo;
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1.5 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleApprove(review.id, review.approved);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  review.approved
                    ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-green-50 dark:hover:bg-green-500/10 hover:text-green-600'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                <span>{review.approved ? 'Approved' : 'Approve'}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHide(review.id, review.hidden ?? false);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  review.hidden
                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-green-50 dark:hover:bg-green-500/10 hover:text-green-600'
                    : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600'
                }`}
              >
                {review.hidden ? (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span>Show</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>Hide</span>
                  </>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(review.id);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-500 dark:hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
