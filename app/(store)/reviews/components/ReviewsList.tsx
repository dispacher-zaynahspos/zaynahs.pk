'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Review } from '@/lib/types';
import StarRating from '@/components/store/StarRating';
import { MessageSquare, Package } from '@/components/common/Icons';

interface ReviewsListProps {
  loading: boolean;
  reviews: (Review & { productName?: string; productImage?: string; productSlug?: string })[];
  search: string;
  formatDate: (dateStr: string) => string;
  setLightboxImage: (url: string | null) => void;
  totalPages: number;
  page: number;
  handlePageChange: (newPage: number) => void;
}

export default function ReviewsList({
  loading,
  reviews,
  search,
  formatDate,
  setLightboxImage,
  totalPages,
  page,
  handlePageChange,
}: ReviewsListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800">
        <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
        <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">No reviews found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {search ? 'Try a different search term' : 'Be the first to leave a review!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const productAvailable = review.productSlug && review.productName;
        return (
          <div
            key={review.id}
            className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex gap-3 sm:gap-4">
              {/* Product Image */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                {review.productImage ? (
                  <Image
                    src={review.productImage}
                    alt={review.productName || 'Product'}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${!productAvailable ? 'bg-red-50 dark:bg-red-500/10' : ''}`}
                  >
                    {!productAvailable ? (
                      <span className="text-[8px] font-bold text-red-400 text-center leading-tight px-1">
                        NOT<br />AVAIL.
                      </span>
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                )}
                {!productAvailable && (
                  <div className="absolute inset-0 bg-black/5 dark:bg-white/5 flex items-center justify-center">
                    <span className="text-[7px] font-bold uppercase text-red-400 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded">
                      Deleted
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {productAvailable ? (
                      <Link
                        href={`/product/${review.productSlug}`}
                        className="text-sm font-bold text-gray-900 dark:text-white hover:text-[#e94560] transition-colors line-clamp-1"
                      >
                        {review.productName}
                      </Link>
                    ) : (
                      <div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                          {review.productName || 'General Store Review'}
                        </span>
                        {!review.productName && (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 mt-1">
                            Not Available
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mr-1.5">
                          {review.customerName}
                        </span>
                        <StarRating rating={review.rating} showText={true} starSize={13} />
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">
                        - {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#0f0f1b]/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800/20">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                )}

                {(() => {
                  const photoList =
                    Array.isArray(review.images) && review.images.length > 0
                      ? review.images
                      : review.screenshotUrl
                      ? [review.screenshotUrl]
                      : [];

                  if (photoList.length === 0) return null;

                  return (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {photoList.map((imgUrl, imgIdx) => (
                        <button
                          key={imgIdx}
                          type="button"
                          onClick={() => setLightboxImage(imgUrl)}
                          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:opacity-90 transition-opacity cursor-pointer group"
                        >
                          <Image
                            src={imgUrl}
                            alt={`Review photo ${imgIdx + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) pageNum = i + 1;
            else if (page <= 3) pageNum = i + 1;
            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = page - 2 + i;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  page === pageNum
                    ? 'bg-[#e94560] text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
