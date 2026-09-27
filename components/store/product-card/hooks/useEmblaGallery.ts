'use client';

import { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType } from 'embla-carousel';

/**
 * SINGLE-SOURCE Embla wiring shared by the storefront image galleries
 * (ProductDetailGallery, QuickViewModal). It owns the one bit those galleries
 * genuinely duplicated: init + keep an external `activeIndex` in sync with the
 * carousel's selected snap (both directions).
 *
 * The galleries' surrounding chrome (hover-zoom + lightbox + badges on the
 * product page vs. compact variant-synced modal in quick view) is intentionally
 * DIFFERENT and stays in each component — only the wiring is shared.
 */
export function useEmblaGallery(
  activeIndex: number,
  onIndexChange: (index: number) => void,
  options?: EmblaOptionsType,
) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  // carousel swipe → external state
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => onIndexChange(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onIndexChange]);

  // external state → carousel (guarded to avoid a feedback loop)
  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== activeIndex) {
      emblaApi.scrollTo(activeIndex);
    }
  }, [activeIndex, emblaApi]);

  return { emblaRef, emblaApi };
}
