'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Review } from '@/lib/types';
import StarRating from '@/components/store/StarRating';
import { Check, Package } from '@/components/common/Icons';
import { sanitizeReviewText } from '@/lib/utils/sanitizeReview';

interface ReviewCardProps {
  review: Review & { productName?: string; productImage?: string; productSlug?: string };
  formatDate: (dateStr: string) => string;
  onImageClick: (url: string) => void;
}

export default function ReviewCard({
  review,
  formatDate,
  onImageClick,
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const productAvailable = !!(review.productSlug && review.productName);
  const initials = (review.customer_name || 'A').trim().charAt(0).toUpperCase();
  const cleanedComment = sanitizeReviewText(review.comment);
  const isLongComment = cleanedComment && cleanedComment.length > 160;

  const photoList =
    Array.isArray(review.images) && review.images.length > 0
      ? review.images
      : review.screenshot_url
      ? [review.screenshot_url]
      : [];

  return (
    <div
      className="rounded-2xl border border-gray-200/80 dark:border-gray-800/80 p-4 sm:p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
      style={{ backgroundColor: 'var(--color-surface, #ffffff)' }}
    >
      <div>
        {/* Header: avatar initial + name + verified + stars + date */}
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-100 flex items-center justify-center text-sm font-black border border-gray-200/60 dark:border-gray-700/60">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {review.customer_name || 'Anonymous Customer'}
              </span>
              {review.is_verified_purchase && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 rounded-full">
                  <Check className="w-2.5 h-2.5" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={review.rating} showText={false} starSize={13} />
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Product chip (neutral) */}
        {(productAvailable || review.productName) && (
          <div className="mt-3">
            {productAvailable ? (
              <Link
                href={`/product/${review.productSlug}`}
                className="inline-flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-gray-800/80 rounded-xl pl-1.5 pr-3 py-1 hover:border-[#e94560]/40 transition-colors max-w-full"
              >
                <span className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                  {review.productImage ? (
                    <Image
                      src={review.productImage}
                      alt={review.productName || 'Product'}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full">
                      <Package className="w-4 h-4 text-gray-400" />
                    </span>
                  )}
                </span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                  {review.productName}
                </span>
              </Link>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-800/60">
                {review.productName || 'General Store Review'}
              </span>
            )}
          </div>
        )}

        {/* Review comment text: clamp 4 + Read more */}
        {cleanedComment && (
          <div className="mt-3">
            <p
              className={`text-sm text-gray-600 dark:text-gray-300 leading-relaxed ${
                !isExpanded ? 'line-clamp-4' : ''
              }`}
            >
              {cleanedComment}
            </p>
            {isLongComment && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-bold text-[#e94560] hover:underline mt-1 cursor-pointer block"
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Media thumbnails */}
        {photoList.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {photoList.map((imgUrl, imgIdx) => (
              <button
                key={imgIdx}
                type="button"
                onClick={() => onImageClick(imgUrl)}
                className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:opacity-90 transition-opacity cursor-zoom-in"
                aria-label={`View review photo ${imgIdx + 1}`}
              >
                <Image
                  src={imgUrl}
                  alt={`Review photo ${imgIdx + 1}`}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Store reply */}
      {'store_reply' in review && Boolean((review as { store_reply?: string }).store_reply) && (
        <div className="mt-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 p-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#e94560]">
            Store Reply
          </span>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            {(review as { store_reply?: string }).store_reply}
          </p>
        </div>
      )}
    </div>
  );
}
