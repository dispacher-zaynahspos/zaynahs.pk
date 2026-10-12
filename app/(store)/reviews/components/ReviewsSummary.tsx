'use client';

import React from 'react';
import StarRating from '@/components/store/StarRating';
import { Star, Edit } from '@/components/common/Icons';

interface ReviewsSummaryProps {
  avgRating: number;
  totalReviews: number;
  proofCount: number;
  distribution: Record<number, number>;
  activeRating: number;
  onRatingFilter: (rating: number) => void;
  onWriteReview: () => void;
}

export default function ReviewsSummary({
  avgRating,
  totalReviews,
  proofCount,
  distribution,
  activeRating,
  onRatingFilter,
  onWriteReview,
}: ReviewsSummaryProps) {
  return (
    <div
      className="p-5 sm:p-6 mb-6 shadow-xs transition-colors border"
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        borderRadius: 'var(--border-radius-card, 16px)',
        borderColor: 'var(--color-border, #e5e7eb)',
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Overall Scorecard */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left min-w-[170px] shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Overall Rating
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
              {avgRating > 0 ? avgRating.toFixed(1) : '5.0'}
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              out of 5
            </span>
          </div>
          <div className="mt-2">
            <StarRating rating={avgRating > 0 ? avgRating : 5} showText={false} starSize={18} />
          </div>
          <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            Based on <span className="font-bold text-gray-900 dark:text-white">{totalReviews}</span> review{totalReviews !== 1 ? 's' : ''}
          </p>
          {proofCount > 0 && (
            <span className="text-[10px] text-gray-400 mt-0.5">
              (Includes Verified + Proof Wall)
            </span>
          )}
        </div>

        {/* Middle: Rating Distribution Bars (5 to 1, clickable to filter) */}
        <div className="flex-1 max-w-md w-full space-y-2">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = distribution[star] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            const isSelected = activeRating === star;

            return (
              <button
                key={star}
                type="button"
                onClick={() => onRatingFilter(star)}
                className={`w-full flex items-center gap-2.5 text-xs font-semibold rounded-lg px-2.5 py-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-white/5'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: 'color-mix(in srgb, var(--btn-primary-bg, var(--color-primary, #e94560)) 10%, transparent)',
                        color: 'var(--btn-primary-bg, var(--color-primary, #e94560))',
                      }
                    : undefined
                }
                aria-pressed={isSelected}
                title={`Filter by ${star} star reviews (${count})`}
              >
                <span className="w-11 text-left shrink-0 flex items-center gap-1 font-bold">
                  <span>{star}</span>
                  <Star
                    className="w-3 h-3"
                    style={{
                      fill: isSelected ? 'var(--btn-primary-bg, var(--color-primary, #e94560))' : '#f59e0b',
                      color: isSelected ? 'var(--btn-primary-bg, var(--color-primary, #e94560))' : '#f59e0b',
                    }}
                  />
                </span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isSelected
                        ? 'var(--btn-primary-bg, var(--color-primary, #e94560))'
                        : '#f59e0b',
                    }}
                  />
                </div>
                <span className="w-9 text-right text-gray-400 font-mono text-[11px] shrink-0">
                  {pct}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Write a Review CTA */}
        <div className="flex items-center justify-center md:justify-end shrink-0 pt-2 md:pt-0">
          <button
            type="button"
            onClick={onWriteReview}
            className="swatch-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
            style={{
              backgroundColor: 'var(--btn-primary-bg, var(--color-primary, #1a1a2e))',
              color: 'var(--btn-primary-text, #ffffff)',
              borderRadius: 'var(--border-radius-btn, 12px)',
            }}
          >
            <Edit className="w-4 h-4" />
            <span>Write a review</span>
          </button>
        </div>
      </div>
    </div>
  );
}
