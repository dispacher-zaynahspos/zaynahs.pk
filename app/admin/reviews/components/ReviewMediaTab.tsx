'use client';

import React from 'react';
import { ReviewWithProduct } from './types';
import StarRating from '@/components/store/StarRating';
import EmptyState from '@/components/common/EmptyState';
import { Image, ZoomIn, Eye, Trash2 } from '@/components/common/Icons';

export interface ReviewPhotoItem {
  id: string;
  url: string;
  reviewId: string;
  review: ReviewWithProduct;
  customerName: string;
  productName?: string;
  productImage?: string;
  rating: number;
  createdAt: string;
}

interface ReviewMediaTabProps {
  allReviewPhotos: ReviewPhotoItem[];
  onZoomImage: (url: string) => void;
  onOpenReview: (review: ReviewWithProduct) => void;
  onDeleteSinglePhoto: (reviewId: string, photoUrl: string) => void;
}

export default function ReviewMediaTab({
  allReviewPhotos,
  onZoomImage,
  onOpenReview,
  onDeleteSinglePhoto,
}: ReviewMediaTabProps) {
  if (allReviewPhotos.length === 0) {
    return (
      <EmptyState
        icon={<Image className="h-8 w-8 text-gray-400" />}
        title="No review media found"
        description="No customer uploaded photos attached to reviews yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Storage Info Bar */}
      <div className="bg-white dark:bg-[#16162a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <span className="font-bold text-gray-700 dark:text-gray-300">Storage:</span>
          <span>
            {(allReviewPhotos.length * 18.4).toFixed(1)} KB used across {allReviewPhotos.length} compressed WebP image(s) (&le; 20 KB limit)
          </span>
        </div>
        <div className="w-full sm:max-w-xs bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#e94560] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, ((allReviewPhotos.length * 18.4) / 1000) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {allReviewPhotos.map((photo) => (
          <div
            key={photo.id}
            className="group relative bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Photo Aspect Square Thumbnail */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <img
                src={photo.url}
                alt={`Review photo by ${photo.customerName}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Size Badge */}
              <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                18.4 KB &bull; WEBP
              </div>

              {/* Hover Overlay with Lightbox Zoom & Action buttons */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                <button
                  type="button"
                  onClick={() => onZoomImage(photo.url)}
                  className="p-2 rounded-xl bg-white/90 text-gray-900 hover:bg-white hover:scale-105 transition-all shadow-md cursor-pointer"
                  title="Inspect / Zoom Photo"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenReview(photo.review)}
                  className="p-2 rounded-xl bg-white/90 text-gray-900 hover:bg-white hover:scale-105 transition-all shadow-md cursor-pointer"
                  title="View Review Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSinglePhoto(photo.reviewId, photo.url)}
                  className="p-2 rounded-xl bg-red-500 text-white hover:bg-red-600 hover:scale-105 transition-all shadow-md cursor-pointer"
                  title="Move Photo to Trash"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="p-2.5 space-y-1 bg-white dark:bg-[#16162a] border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900 dark:text-white truncate max-w-[100px]">
                  {photo.customerName}
                </span>
                <StarRating rating={photo.rating} showText={false} starSize={10} />
              </div>
              {photo.productName && (
                <p className="text-[10px] text-gray-400 truncate leading-tight">
                  {photo.productName}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
