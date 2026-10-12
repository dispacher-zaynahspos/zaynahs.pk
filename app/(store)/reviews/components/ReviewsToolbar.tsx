'use client';

import React from 'react';
import { Search, Star, X } from '@/components/common/Icons';

export type SortKey = 'newest' | 'oldest' | 'highest' | 'lowest';

interface ReviewsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSubmitSearch: () => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  ratingFilter: number;
  onRatingFilter: (rating: number) => void;
  sortBy: SortKey;
  onSort: (sort: SortKey) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  copied?: boolean;
  onCopyLink?: () => void;
  isPending?: boolean;
  total: number;
}

export default function ReviewsToolbar({
  search,
  onSearchChange,
  searchRef,
  ratingFilter,
  onRatingFilter,
  sortBy,
  onSort,
  hasActiveFilters,
  onClearFilters,
  isPending = false,
  total,
}: ReviewsToolbarProps) {
  return (
    <div
      className="p-3.5 sm:p-4 mb-5 shadow-xs transition-colors w-full border"
      style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        borderRadius: 'var(--border-radius-card, 16px)',
        borderColor: 'var(--color-border, #e5e7eb)',
      }}
    >
      {/* ── MOBILE / TABLET LAYOUT (< lg): 2 sleek, compact rows ── */}
      {/* ── MOBILE / TABLET LAYOUT (< lg): 2 sleek, compact rows with 100% visible text ── */}
      <div className="flex flex-col gap-2 lg:hidden w-full">
        {/* Row 1: Full-width Search input — placeholder is 100% visible and NEVER clipped */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reviews..."
            aria-label="Search reviews by product name"
            className="w-full h-10 pl-9 pr-8 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-all"
            style={{
              borderRadius: 'var(--border-radius-btn, 12px)',
              border: '1px solid #e5e7eb',
              backgroundColor: 'var(--color-surface, #ffffff)',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Row 2: Star rating filter pills with smooth scroll-snap + compact Sort dropdown */}
        <div className="flex items-center gap-1.5 w-full">
          {/* Star Chips (smooth horizontal swipe) */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x py-0.5 flex-1 min-w-0"
            role="group"
            aria-label="Filter by star rating"
          >
            <button
              type="button"
              onClick={() => onRatingFilter(0)}
              aria-pressed={ratingFilter === 0}
              className="swatch-btn rounded-full inline-flex items-center justify-center h-8.5 px-3 text-xs font-bold transition-all cursor-pointer shrink-0 snap-start active:scale-95"
              style={{
                borderRadius: '9999px',
                backgroundColor:
                  ratingFilter === 0
                    ? 'var(--btn-primary-bg, var(--color-primary, #e94560))'
                    : 'var(--color-surface, #ffffff)',
                color: ratingFilter === 0 ? 'var(--btn-primary-text, #ffffff)' : '#374151',
                border:
                  ratingFilter === 0
                    ? '1px solid var(--btn-primary-bg, var(--color-primary, #e94560))'
                    : '1px solid #e5e7eb',
              }}
            >
              All
            </button>
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const isSelected = ratingFilter === star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => onRatingFilter(star)}
                  aria-pressed={isSelected}
                  aria-label={`${star} star reviews`}
                  className="swatch-btn rounded-full inline-flex items-center justify-center gap-1 h-8.5 px-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 snap-start active:scale-95"
                  style={{
                    borderRadius: '9999px',
                    backgroundColor: isSelected
                      ? 'var(--btn-primary-bg, var(--color-primary, #e94560))'
                      : 'var(--color-surface, #ffffff)',
                    color: isSelected ? 'var(--btn-primary-text, #ffffff)' : '#374151',
                    border: isSelected
                      ? '1px solid var(--btn-primary-bg, var(--color-primary, #e94560))'
                      : '1px solid #e5e7eb',
                  }}
                >
                  <span>{star}</span>
                  <Star
                    className="w-3.5 h-3.5"
                    style={{
                      fill: isSelected ? 'var(--btn-primary-text, #ffffff)' : '#f59e0b',
                      color: isSelected ? 'var(--btn-primary-text, #ffffff)' : '#f59e0b',
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Compact Sort dropdown */}
          <div
            className="flex items-center px-2 h-8.5 shrink-0"
            style={{
              borderRadius: 'var(--border-radius-btn, 10px)',
              border: '1px solid #e5e7eb',
              backgroundColor: 'var(--color-surface, #ffffff)',
            }}
          >
            <select
              value={sortBy}
              onChange={(e) => onSort(e.target.value as SortKey)}
              aria-label="Sort reviews"
              className="text-[11px] font-bold bg-transparent text-gray-800 dark:text-gray-200 border-none focus:outline-none cursor-pointer pr-0.5"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest ★</option>
              <option value="lowest">Lowest ★</option>
            </select>
          </div>

          {/* Clear button if any filter is active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="swatch-btn rounded-full inline-flex items-center justify-center h-8.5 px-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer shrink-0 active:scale-95 bg-gray-100 dark:bg-gray-800"
              style={{
                borderRadius: '9999px',
                border: '1px solid #e5e7eb',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (lg+): Beautiful single-row harmonious bar ── */}
      <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4 w-full">
        {/* Search */}
        <div className="relative w-64 xl:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reviews..."
            aria-label="Search reviews by product name"
            className="w-full h-11 pl-10 pr-9 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-all"
            style={{
              borderRadius: 'var(--border-radius-btn, 12px)',
              border: '1px solid #e5e7eb',
              backgroundColor: 'var(--color-surface, #ffffff)',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Star Chips: Centered */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onRatingFilter(0)}
            aria-pressed={ratingFilter === 0}
            className="swatch-btn rounded-full inline-flex items-center justify-center h-9 px-3.5 text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95"
            style={{
              borderRadius: '9999px',
              backgroundColor:
                ratingFilter === 0
                  ? 'var(--btn-primary-bg, var(--color-primary, #e94560))'
                  : 'var(--color-surface, #ffffff)',
              color: ratingFilter === 0 ? 'var(--btn-primary-text, #ffffff)' : '#374151',
              border:
                ratingFilter === 0
                  ? '1px solid var(--btn-primary-bg, var(--color-primary, #e94560))'
                  : '1px solid #e5e7eb',
            }}
          >
            All
          </button>
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const isSelected = ratingFilter === star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => onRatingFilter(star)}
                aria-pressed={isSelected}
                aria-label={`${star} star reviews`}
                className="swatch-btn rounded-full inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95"
                style={{
                  borderRadius: '9999px',
                  backgroundColor: isSelected
                    ? 'var(--btn-primary-bg, var(--color-primary, #e94560))'
                    : 'var(--color-surface, #ffffff)',
                  color: isSelected ? 'var(--btn-primary-text, #ffffff)' : '#374151',
                  border: isSelected
                    ? '1px solid var(--btn-primary-bg, var(--color-primary, #e94560))'
                    : '1px solid #e5e7eb',
                }}
              >
                <span>{star}</span>
                <Star
                  className="w-3.5 h-3.5"
                  style={{
                    fill: isSelected ? 'var(--btn-primary-text, #ffffff)' : '#f59e0b',
                    color: isSelected ? 'var(--btn-primary-text, #ffffff)' : '#f59e0b',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Sort + Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center px-3 h-11 w-44"
            style={{
              borderRadius: 'var(--border-radius-btn, 12px)',
              border: '1px solid #e5e7eb',
              backgroundColor: 'var(--color-surface, #ffffff)',
            }}
          >
            <span className="text-gray-400 text-xs font-bold shrink-0 mr-1.5">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSort(e.target.value as SortKey)}
              aria-label="Sort reviews"
              className="flex-1 min-w-0 text-xs font-bold bg-transparent text-gray-800 dark:text-gray-200 border-none focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="swatch-btn h-11 px-3.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer shrink-0 bg-gray-50 dark:bg-[#16162a]"
              style={{
                borderRadius: 'var(--border-radius-btn, 12px)',
                border: '1px solid #e5e7eb',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {isPending ? 'Loading reviews' : `${total} review${total !== 1 ? 's' : ''} found`}
      </p>
    </div>
  );
}
