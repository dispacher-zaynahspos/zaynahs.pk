'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from '@/components/common/Icons';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  activeBg?: string;
  activeTextColor?: string;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  activeBg,
  activeTextColor,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate numbered pages with ellipsis gap markers (-1)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
    .reduce<number[]>((acc, p) => {
      if (acc.length && p - acc[acc.length - 1] > 1) {
        acc.push(-1); // gap marker
      }
      acc.push(p);
      return acc;
    }, []);

  return (
    <nav
      aria-label="Pagination"
      className={`w-full flex flex-wrap items-center justify-center gap-1.5 select-none ${className}`}
    >
      {/* Previous Page Button */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
        className="h-9 px-3 rounded-lg text-xs font-bold border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-900 hover:border-gray-400 dark:hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>Prev</span>
      </button>

      {/* Page Numbers & Ellipses */}
      {pages.map((p, idx) =>
        p === -1 ? (
          <span
            key={`gap-${idx}`}
            className="px-1.5 text-xs font-bold text-gray-400 select-none"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            aria-label={`Page ${p}`}
            style={
              p === currentPage
                ? {
                    backgroundColor:
                      activeBg || 'var(--btn-primary-bg, var(--color-primary, #0F2A5E))',
                    color: activeTextColor || 'var(--btn-primary-text, #ffffff)',
                  }
                : undefined
            }
            className={`min-w-[36px] h-9 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer inline-flex items-center justify-center shrink-0 ${
              p === currentPage
                ? 'border-transparent shadow-xs font-black'
                : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-900 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next Page Button */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
        className="h-9 px-3 rounded-lg text-xs font-bold border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-900 hover:border-gray-400 dark:hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
      >
        <span>Next</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
}
