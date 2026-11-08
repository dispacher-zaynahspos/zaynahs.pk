'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { StoreSettings } from '@/lib/types';
import { ImageLoadingPlaceholder } from '@/components/common/ImageLoadingPlaceholder';

interface ProductCardMediaProps {
  activeImage: string;
  secondImage: string | null;
  hoveredImage: string | null;
  productName: string;
  settings?: StoreSettings | null;
  priority?: boolean;
  fitClass?: 'object-contain' | 'object-cover';
  isVariantSelected?: boolean;
}

export const ProductCardMedia: React.FC<ProductCardMediaProps> = ({
  activeImage,
  secondImage,
  hoveredImage,
  productName,
  settings,
  priority = false,
  fitClass = 'object-contain',
  isVariantSelected = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const prevImageRef = useRef(activeImage);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (prevImageRef.current !== activeImage) {
      prevImageRef.current = activeImage;
      setIsLoaded(false);
    }
    if (priority || imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [activeImage, priority]);

  const hoverStyle = settings?.image_hover_style ?? 'second_image';
  const isZoom = hoverStyle === 'zoom';
  const isSecondImage = hoverStyle !== 'none' && hoverStyle !== 'zoom';
  const showSecond = isSecondImage && Boolean(secondImage) && !hoveredImage && !isVariantSelected;

  return (
    <>
      <ImageLoadingPlaceholder
        style={settings?.image_loading_style}
        logoUrl={settings?.logo_url}
        storeName={settings?.store_name}
        isLoaded={isLoaded}
      />
      <Image
        ref={imgRef}
        src={activeImage}
        alt={productName}
        fill
        unoptimized
        sizes="(max-width: 768px) 50vw, 25vw"
        className={`relative z-[1] ${fitClass} pointer-events-none${
          isZoom ? ' hover-zoom' : ''
        }${showSecond ? ' hover-fade-out' : ' transition-opacity duration-200'}`}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
      />
      {showSecond && secondImage && (
        <Image
          src={secondImage}
          alt={`${productName} alternate`}
          fill
          unoptimized
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`${fitClass} absolute inset-0 pointer-events-none hover-fade-in`}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
        />
      )}
    </>
  );
};
