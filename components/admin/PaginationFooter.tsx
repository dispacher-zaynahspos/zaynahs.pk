'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from '@/components/common/Icons'

interface PaginationFooterProps {
  totalItems: number
  pageSize: number
  currentPage: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const PAGE_SIZES = [20, 50, 100, 200]

export default function PaginationFooter({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}: PaginationFooterProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="border-t border-gray-100 dark:border-gray-800/80 px-4 py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between select-none">
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-semibold">
        <span>
          Showing <strong className="text-gray-900 dark:text-white">{startItem}–{endItem}</strong> of <strong className="text-gray-900 dark:text-white">{totalItems}</strong> entries
        </span>
        <div className="flex items-center gap-1.5">
          <span className="whitespace-nowrap">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value))
              onPageChange(1)
            }}
            className="border border-gray-200/80 dark:border-gray-800/80 rounded-xl px-2.5 py-1 text-xs font-bold bg-white dark:bg-[#16162a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e94560]/20 cursor-pointer"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="whitespace-nowrap">Rows</span>
        </div>
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>

        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-gray-400 dark:text-gray-500 font-bold">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                page === currentPage
                  ? 'bg-[#1a1a2e] dark:bg-[#e94560] text-white shadow-xs font-black'
                  : 'border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </nav>
    </div>
  )
}

