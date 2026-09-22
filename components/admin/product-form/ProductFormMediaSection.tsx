'use client';

import React from 'react';
import { Image as ImageIcon } from '@/components/common/Icons';
import {
  DndContext,
  closestCenter,
  MeasuringStrategy,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableImageItem } from './SortableImageItem';

interface ProductFormMediaSectionProps {
  images: any[];
  setIsMediaModalOpen: (val: boolean) => void;
  sensors: any;
  handleDragStartImages: (event: DragStartEvent) => void;
  handleDragCancelImages: () => void;
  handleDragEndImages: (event: DragEndEvent) => void;
  handleRemoveImage: (idx: number, url: string) => void;
  setPreviewImageUrl: (url: string | null) => void;
}

export const ProductFormMediaSection: React.FC<ProductFormMediaSectionProps> = ({
  images,
  setIsMediaModalOpen,
  sensors,
  handleDragStartImages,
  handleDragCancelImages,
  handleDragEndImages,
  handleRemoveImage,
  setPreviewImageUrl,
}) => {
  return (
    <div className="bg-white dark:bg-[#16162a] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-3 text-gray-900 dark:text-white transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Product Images</h3>
      </div>

      {images.length === 0 ? (
        <div
          onClick={() => setIsMediaModalOpen(true)}
          className="flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 hover:border-gray-400 rounded-xl p-5 text-center cursor-pointer transition-colors bg-gray-50/20 dark:bg-[#0f0f1b]/20"
        >
          <ImageIcon className="h-6 w-6 text-gray-400 mb-1.5" />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Select Media</span>
          <span className="text-[10px] text-gray-400 mt-0.5">Select images from your media library</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Select Media</span>
          </button>
        </div>
      )}

      {/* Uploaded Images preview grid */}
      {images.length > 0 && (
        <DndContext
          id="product-images-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          onDragStart={handleDragStartImages}
          onDragCancel={handleDragCancelImages}
          onDragEnd={handleDragEndImages}
        >
          <SortableContext
            items={images.map(img => img.url)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 gap-2 pt-1">
              {images.map((img, i) => (
                <SortableImageItem
                  key={img.url}
                  img={img}
                  index={i}
                  handleRemoveImage={handleRemoveImage}
                  onPreviewImage={setPreviewImageUrl}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
