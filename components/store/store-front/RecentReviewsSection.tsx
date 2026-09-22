'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HomepageSection, Review } from '@/lib/types';
import StarRating from '../StarRating';

interface RecentReviewsSectionProps {
  section: HomepageSection;
  reviews: (Review & { productName?: string; productSlug?: string })[];
  socialProofCount?: number;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColorClass = (name: string) => {
  const colors = [
    'bg-[#FF8B3D]',
    'bg-[#10b981]',
    'bg-[#3b82f6]',
    'bg-[#8b5cf6]',
    'bg-[#e94560]',
    'bg-[#06b6d4]',
    'bg-[#f59e0b]',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const formatDate = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

export function RecentReviewsSection({
  section,
  reviews = [],
  socialProofCount = 0,
}: RecentReviewsSectionProps) {
  if (!reviews || reviews.length === 0) return null;

  const sectionSettings = section.settings || {};
  const sortMethod = sectionSettings.sortMethod || 'newest';
  const limit = sectionSettings.limit || 3;
  const showImages = sectionSettings.showImages !== false;
  const showViewAll = sectionSettings.showViewAll !== false;
  const manualReviewIds: string[] = sectionSettings.manualReviewIds || [];

  const approvedReviews = reviews.filter((r) => r.approved !== false);
  const totalReviewsCount = approvedReviews.length + socialProofCount;
  const averageStars =
    totalReviewsCount > 0
      ? Math.round(((approvedReviews.reduce((sum, r) => sum + r.rating, 0) + socialProofCount * 5) / totalReviewsCount) * 10) / 10
      : 5.0;

  // Sort reviews based on method
  let sortedReviews: typeof reviews;
  if (sortMethod === 'manual' && manualReviewIds.length > 0) {
    sortedReviews = manualReviewIds
      .map((id) => reviews.find((r) => r.id === id))
      .filter((r): r is typeof reviews[0] => !!r);
  } else {
    sortedReviews = [...reviews];
    switch (sortMethod) {
      case 'oldest':
        sortedReviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'most_stars':
        sortedReviews.sort(
          (a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'least_stars':
        sortedReviews.sort(
          (a, b) => a.rating - b.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'newest':
      default:
        sortedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
  }

  const displayReviews = sortedReviews.slice(0, limit);

  return (
    <div key={section.id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100 dark:border-gray-800">
      <div className="text-center space-y-2.5 mb-10">
        <h2 className="text-xl font-black uppercase tracking-wider text-gray-900 dark:text-white">
          {section.title || 'CUSTOMER REVIEWS'}
        </h2>
        <div className="flex flex-col items-center justify-center gap-1.5">
          <StarRating rating={averageStars} showText={false} starSize={16} />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {averageStars.toFixed(1)} out of 5 based on {totalReviewsCount} {totalReviewsCount === 1 ? 'rating' : 'ratings'}
          </span>
          {socialProofCount > 0 && (
            <span className="text-[10px] font-medium text-gray-400">(Includes Verified + Proof Wall)</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {displayReviews.map((review) => {
          const reviewImages = showImages && review.images && review.images.length > 0 ? review.images : [];
          return (
            <div
              key={review.id}
              className="flex flex-col gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] shadow-sm text-gray-900 dark:text-white"
            >
              <div className="flex gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white uppercase shadow-sm ${getAvatarColorClass(
                    review.customerName
                  )}`}
                >
                  {getInitials(review.customerName)}
                </div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <StarRating rating={review.rating} showText={false} starSize={11} />
                    <span
                      className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 shrink-0"
                      suppressHydrationWarning
                    >
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-xs text-gray-950 dark:text-white truncate">
                      {review.customerName}
                    </span>
                    <span className="text-[8px] font-bold text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded-full shrink-0">
                      ✓ Verified Buyer
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Review Images */}
              {reviewImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                  {reviewImages.map((imgUrl, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-gray-200 dark:border-gray-700"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Review by ${review.customerName} - ${imgIdx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {displayReviews.length === 0 && (
          <div className="col-span-full flex items-center justify-center p-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#16162a]/50 text-gray-400 dark:text-gray-600 text-[11px] font-semibold">
            No reviews yet
          </div>
        )}
      </div>

      {showViewAll && (
        <div className="flex justify-center mt-6">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-[11px] font-semibold tracking-wide shadow-sm bg-[#e94560] text-white hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] transition-all duration-200"
          >
            View All Reviews
          </Link>
        </div>
      )}
    </div>
  );
}
