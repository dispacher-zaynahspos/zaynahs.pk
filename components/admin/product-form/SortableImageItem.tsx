'use client';

import React from 'react';
import { Trash2, Star, Eye, GripVertical } from '@/components/common/Icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableImageItem({
  img,
  index,
  handleRemoveImage,
  onPreviewImage,
}: {
  img: any;
  index: number;
  handleRemoveImage: (idx: number, url: string) => void;
  onPreviewImage: (url: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.url });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 9999 : 1,
    scale: isDragging ? '1.05' : '1',
    boxShadow: isDragging ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative select-none animate-in fade-in duration-200"
    >
      {/* Image container */}
      <div
        className="relative aspect-square rounded-lg border border-gray-150 bg-gray-50 dark:bg-gray-850 dark:border-gray-800 overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
        {...attributes}
        {...listeners}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.url} alt={`Preview ${index}`} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

        {/* Desktop-only hover overlay (hidden on mobile) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-1 z-20 pointer-events-auto">
          <button
            type="button"
            className={`p-1.5 rounded-lg text-white ${img.isPrimary ? 'text-amber-400' : 'opacity-0'}`}
            title="Primary"
          >
            <Star className="h-4.5 w-4.5 fill-current" />
          </button>

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPreviewImage(img.url);
            }}
            className="p-1.5 rounded-lg text-white hover:bg-white/20"
            title="Preview Image"
          >
            <Eye className="h-4.5 w-4.5" />
          </button>

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemoveImage(index, img.url);
            }}
            className="p-1.5 rounded-lg text-red-400 hover:bg-white/20"
            title="Delete Image"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Badges always visible */}
        {img.isPrimary && (
          <span className="absolute top-1.5 right-1.5 z-30 bg-amber-400 text-[9px] font-extrabold text-[#1a1a2e] px-1.5 py-0.5 rounded-md shadow-md">
            PRIMARY
          </span>
        )}

        {/* Combined Grip handle and index number badge */}
        <div className="absolute top-1.5 left-1.5 z-30 flex items-center gap-1 bg-[#1a1a2e]/80 text-white px-2 py-0.5 rounded-lg shadow-md border border-white/10 select-none">
          <GripVertical className="h-3 w-3 text-gray-300 flex-shrink-0" />
          <span className="text-[10px] font-extrabold tabular-nums">
            {index + 1}
          </span>
        </div>
      </div>

      {/* Mobile-only action buttons below image */}
      <div className="mt-1.5 flex gap-1.5 md:hidden z-20 relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveImage(index, img.url);
          }}
          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-all cursor-pointer"
          title="Remove Image"
        >
          <Trash2 className="h-3 w-3" />
          Remove
        </button>
      </div>
    </div>
  );
}
