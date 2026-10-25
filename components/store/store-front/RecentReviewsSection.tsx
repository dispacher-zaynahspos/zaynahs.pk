'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HomepageSection, Review } from '@/lib/types';
import StarRating from '../StarRating';
import { sanitizeReviewText } from '@/lib/utils/sanitizeReview';
import { SectionWrapper } from './SectionWrapper';
import { Check, Package, ArrowRight } from '@/components/common/Icons';
import ReviewImageLightbox, { ReviewLightboxData } from '@/app/(store)/reviews/components/ReviewImageLightbox';
import { getReviewInitials, getReviewAvatarColor } from '@/lib/utils/reviewAvatar';

interface RecentReviewsSectionProps {
  section: HomepageSection;
  reviews: (Review & { productName?: string; productSlug?: string; productImage?: string })[];
  socialProofCount?: number;
  totalReviewsCount?: number;
  avgStoreRating?: number;
}

const formatDate = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Karachi',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

export function RecentReviewsSection({
  section,
  reviews = [],
  socialProofCount = 0,
  totalReviewsCount: passedTotalCount,
  avgStoreRating: passedAvgRating,
}: RecentReviewsSectionProps) {
  const [lightboxData, setLightboxData] = useState<ReviewLightboxData | null>(null);

  if (!reviews || reviews.length === 0) return null;

  const sectionSettings = section.settings || {};
  const sortMethod = sectionSettings.sortMethod || 'newest';
  const limit = sectionSettings.limit || 6;
  const showImages = sectionSettings.showImages !== false;
  const showViewAll = sectionSettings.showViewAll !== false;
  const manualReviewIds: string[] = sectionSettings.manualReviewIds || [];

  const approvedReviews = reviews.filter((r) => r.approved !== false);

  // Use true database total reviews count passed from SSR, with robust fallbacks
  const displayTotalCount =
    (passedTotalCount && passedTotalCount > 0
      ? passedTotalCount
      : approvedReviews.length) + socialProofCount;

  const averageStars = passedAvgRating && passedAvgRating > 0 ? passedAvgRating : 4.9;

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
        sortedReviews.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'most_stars':
        sortedReviews.sort(
          (a, b) => b.rating - a.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'least_stars':
        sortedReviews.sort(
          (a, b) => a.rating - b.rating || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'newest':
      default:
        // Prioritize featured / reviews with images first, then newest
        sortedReviews.sort((a, b) => {
          const aHasImg = (a.images && a.images.length > 0) || a.is_featured ? 1 : 0;
          const bHasImg = (b.images && b.images.length > 0) || b.is_featured ? 1 : 0;
          if (bHasImg !== aHasImg) return bHasImg - aHasImg;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
    }
  }

  // Cap to limit
  const displayReviews = sortedReviews.slice(0, limit);

  return (
    <SectionWrapper section={section}>
      {/* Header section with verified social proof stats */}
      <div className="text-center space-y-2 mb-8 md:mb-12 px-4">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#e94560] block">
          Customer Love &amp; Real Reviews
        </span>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
          {section.title || 'CUSTOMER REVIEWS'}
        </h2>
        <div className="flex flex-col items-center justify-center gap-1.5 pt-1">
          <div className="flex items-center gap-2">
            <StarRating rating={averageStars} showText={false} starSize={18} />
            <span className="text-sm font-black text-gray-900 dark:text-white">
              {averageStars.toFixed(1)} / 5.0
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Based on {displayTotalCount.toLocaleString()} verified customer ratings
            {socialProofCount > 0 && ' (Includes Verified + Proof Wall)'}
          </p>
        </div>
      </div>

      {/* Responsive layout: smooth horizontal scroll on mobile, balanced wide 3-column grid on desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {displayReviews.map((review) => {
            const reviewImages =
              showImages && review.images && review.images.length > 0
                ? review.images
                : review.screenshot_url
                ? [review.screenshot_url]
                : [];
            const productAvailable = !!(review.productSlug && review.productName);

            return (
              <div
                key={review.id}
                className="w-[84vw] sm:w-[360px] md:w-auto shrink-0 snap-center flex flex-col justify-between p-5 rounded-2xl border border-gray-200/90 dark:border-gray-800/90 bg-white dark:bg-[#16162a] shadow-sm hover:shadow-lg transition-all duration-200"
              >
                <div className="space-y-3">
                  {/* Reviewer Header: Avatar + Name + Verified Badge + Date */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-white uppercase shadow-sm border border-white/20 ${getReviewAvatarColor(
                        review.customer_name
                      )}`}
                    >
                      {getReviewInitials(review.customer_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                          {review.customer_name}
                        </span>
                        {review.is_verified_purchase && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 rounded-full shrink-0">
                            <Check className="w-2.5 h-2.5" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <StarRating rating={review.rating} showText={false} starSize={12} />
                        <span
                          className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 shrink-0"
                          suppressHydrationWarning
                        >
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Product Chip preview linking directly to product */}
                  {(productAvailable || review.productName) && (
                    <div>
                      {productAvailable ? (
                        <Link
                          href={`/product/${review.productSlug}`}
                          className="inline-flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-gray-800/80 rounded-xl pl-1.5 pr-3 py-1 hover:border-[#e94560]/50 transition-colors max-w-full group"
                        >
                          <span className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200/50 dark:border-gray-700/50">
                            {review.productImage ? (
                              <Image
                                src={review.productImage}
                                alt={review.productName || 'Product'}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                sizes="32px"
                              />
                            ) : (
                              <span className="flex items-center justify-center w-full h-full">
                                <Package className="w-4 h-4 text-gray-400" />
                              </span>
                            )}
                          </span>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate group-hover:text-[#e94560] transition-colors">
                            {review.productName}
                          </span>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-gray-800/60">
                          {review.productName}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-xs sm:text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium line-clamp-4">
                      &ldquo;{sanitizeReviewText(review.comment)}&rdquo;
                    </p>
                  )}
                </div>

                {/* Customer Review Photos Gallery (Bigger thumbnails: w-20 h-20 sm:w-24 sm:h-24) */}
                {reviewImages.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800/60">
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                      {reviewImages.map((imgUrl, imgIdx) => (
                        <button
                          key={imgIdx}
                          type="button"
                          onClick={() => setLightboxData({
                            images: reviewImages,
                            currentIndex: imgIdx,
                            customerName: review.customer_name,
                            product: productAvailable ? {
                              name: review.productName!,
                              slug: review.productSlug!,
                              image: review.productImage,
                            } : undefined,
                          })}
                          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-700 hover:opacity-95 hover:scale-[1.03] transition-all cursor-zoom-in shadow-xs"
                          aria-label={`View photo ${imgIdx + 1} by ${review.customer_name}`}
                        >
                          <Image
                            src={imgUrl}
                            alt={`Review by ${review.customer_name} - ${imgIdx + 1}`}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {displayReviews.length === 0 && (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#16162a]/50 text-gray-400 dark:text-gray-600 text-xs font-semibold">
            No customer reviews yet. Be the first to review!
          </div>
        )}
      </div>

      {/* View All Reviews Button */}
      {showViewAll && (
        <div className="flex justify-center mt-8 md:mt-10 px-4">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-wide shadow-sm bg-[#e94560] text-white hover:bg-[#d83a54] hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span>View All Reviews ({displayTotalCount.toLocaleString()})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Upgraded Review Image Lightbox Modal with Arrows & Linked Product */}
      <ReviewImageLightbox
        open={lightboxData !== null}
        onClose={() => setLightboxData(null)}
        data={lightboxData}
        onNavigate={(newIdx) =>
          setLightboxData((prev) => (prev ? { ...prev, currentIndex: newIdx } : null))
        }
      />
    </SectionWrapper>
  );
}
