'use client';

import { useState } from 'react';
import { PointerSensor, TouchSensor, useSensor, useSensors, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@/lib/utils/arrayMove';
import { ProductImage, Product } from '@/lib/types';

interface UseProductImageDragProps {
  initialProduct?: Product | null;
}

export function useProductImageDrag({ initialProduct }: UseProductImageDragProps = {}) {
  const [images, setImages] = useState<Omit<ProductImage, 'id' | 'productId' | 'createdAt'>[]>(
    initialProduct?.images.map((img: any, idx: number) => ({
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
      isPrimary: idx === 0
    })) || []
  );

  const [activeImageId, setActiveImageId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragStartImages = (event: DragStartEvent) => {
    setActiveImageId(event.active.id as string);
  };

  const handleDragCancelImages = () => {
    setActiveImageId(null);
  };

  const handleDragEndImages = (event: DragEndEvent) => {
    setActiveImageId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.url === active.id);
    const newIndex = images.findIndex((img) => img.url === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(images, oldIndex, newIndex);
      const updated = reordered.map((img, idx) => ({
        ...img,
        sortOrder: idx + 1,
        isPrimary: idx === 0,
      }));
      setImages(updated);
    }
  };

  const handleRemoveImage = (index: number, url: string) => {
    setImages(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((img, idx) => ({ ...img, isPrimary: idx === 0 }));
    });
  };

  return {
    images,
    setImages,
    activeImageId,
    sensors,
    handleDragStartImages,
    handleDragCancelImages,
    handleDragEndImages,
    handleRemoveImage,
  };
}
