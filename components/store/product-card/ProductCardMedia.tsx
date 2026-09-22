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
  touchActive: boolean;
  fitClass?: 'object-contain' | 'object-cover';
}

export const ProductCardMedia: React.FC<ProductCardMediaProps> = ({
  activeImage,
  secondImage,
  hoveredImage,
  productName,
  settings,
  priority = false,
  touchActive,
  fitClass = 'object-contain',
}) => {
  const zoomClass = settings?.imageHoverStyle === 'zoom'
    ? (touchActive ? 'scale-105' : 'group-hover:scale-105 group-active:scale-105')
    : '';
  const fadeClass = (secondImage && !hoveredImage)
    ? (touchActive ? 'opacity-0' : 'opacity-100 group-hover:opacity-0 group-active:opacity-0')
    : '';

  return (
    <>
      <Image
        src={activeImage}
        alt={productName}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className={`${fitClass} transition-transform duration-500 ${zoomClass} ${fadeClass}`}
        priority={priority}
        loading={priority ? undefined : "lazy"}
      />
      {secondImage && !hoveredImage && (
        <Image
          src={secondImage}
          alt={`${productName} alternate`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`${fitClass} absolute inset-0 transition-opacity duration-500 ${touchActive ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 group-active:opacity-100`}
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />
      )}
    </>
  );
};
