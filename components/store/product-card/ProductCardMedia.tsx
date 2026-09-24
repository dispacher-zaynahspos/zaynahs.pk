'use client';

import React from 'react';
import Image from 'next/image';
import { StoreSettings } from '@/lib/types';

interface ProductCardMediaProps {
  activeImage: string;
  secondImage: string | null;
  hoveredImage: string | null;
  productName: string;
  settings?: StoreSettings | null;
  priority?: boolean;
  fitClass?: 'object-contain' | 'object-cover';
}

export const ProductCardMedia: React.FC<ProductCardMediaProps> = ({
  activeImage,
  secondImage,
  hoveredImage,
  productName,
  settings,
  priority = false,
  fitClass = 'object-contain',
}) => {
  const hoverStyle = settings?.imageHoverStyle ?? 'second_image';
  const isZoom = hoverStyle === 'zoom';
  const isSecondImage = hoverStyle === 'second_image';
  const showSecond = isSecondImage && Boolean(secondImage) && !hoveredImage;

  return (
    <>
      <Image
        src={activeImage}
        alt={productName}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className={`${fitClass} transition-opacity duration-200 pointer-events-none${
          isZoom ? ' hover-zoom' : ''
        }${showSecond ? ' hover-fade-out' : ''}`}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
      />
      {showSecond && secondImage && (
        <Image
          src={secondImage}
          alt={`${productName} alternate`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`${fitClass} absolute inset-0 transition-opacity duration-200 pointer-events-none hover-fade-in`}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
        />
      )}
    </>
  );
};
