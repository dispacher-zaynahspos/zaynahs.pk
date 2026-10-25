'use client';

import React from 'react';
import { Review } from '@/lib/types';
import { MessageSquare } from '@/components/common/Icons';
import Pagination from '@/components/common/Pagination';
import ReviewCard from './ReviewCard';
import { ReviewLightboxData } from './ReviewImageLightbox';

interface ReviewsListProps {
  loading: boolean;
  reviews: (Review & { productName?: string; productImage?: string; productSlug?: string })[];
  search: string;
  formatDate: (dateStr: string) => string;
  onImageClick: (data: ReviewLightboxData) => void;
  totalPages: number;
  page: number;
  handlePageChange: (newPage: number) => void;
}

export default function ReviewsList({
  loading,
  reviews,
  search,
  formatDate,
  onImageClick,
  totalPages,
  page,
  handlePageChange,
}: ReviewsListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 animate-pulse"
            style={{ backgroundColor: 'var(--color-surface, #ffffff)' }}
          />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div
        className="text-center py-16 px-4 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-xs"
        style={{ backgroundColor: 'var(--color-surface, #ffffff)' }}
      >
        <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
        <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">
          No reviews found
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          {search ? `No reviews matching "${search}". Try a different keyword.` : 'Be the first to share your experience with a review!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div
        className={`grid gap-6 ${
          reviews.length === 1
            ? 'grid-cols-1 max-w-xl mx-auto'
            : reviews.length === 2
            ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            formatDate={formatDate}
            onImageClick={onImageClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
