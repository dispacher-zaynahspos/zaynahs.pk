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
  touchActive?: boolean;
  isPressed?: boolean;
  fitClass?: 'object-contain' | 'object-cover';
}

export const ProductCardMedia: React.FC<ProductCardMediaProps> = ({
  activeImage,
  secondImage,
  hoveredImage,
  productName,
  settings,
  priority = false,
  isPressed = false,
  fitClass = 'object-contain',
}) => {
  const hoverStyle = settings?.imageHoverStyle ?? 'second_image';
  const isZoom = hoverStyle === 'zoom';
  const isSecondImage = hoverStyle === 'second_image';
  const showSecond = isSecondImage && Boolean(secondImage) && !hoveredImage;

  // Touch: isPressed controls inline style for immediate feedback
  // Desktop: CSS classes hover-zoom / hover-fade-in / hover-fade-out handle it
  const img1Style: React.CSSProperties = {};
  const img2Style: React.CSSProperties = {};

  if (showSecond && isPressed) {
    img1Style.opacity = 0;
    img2Style.opacity = 1;
  }
  if (isZoom && isPressed) {
    img1Style.transform = 'scale(1.05)';
  }

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
        style={img1Style}
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
          style={img2Style}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
        />
      )}
    </>
  );
};
