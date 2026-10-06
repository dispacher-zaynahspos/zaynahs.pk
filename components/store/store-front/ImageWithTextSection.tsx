'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HomepageSection } from '@/lib/types';
import { SectionWrapper } from './SectionWrapper';
import { getOptimizedImageUrl } from '@/lib/utils/imageUrl';

interface ImageWithTextSectionProps {
  section: HomepageSection;
}

/**
 * Image + Text split section (brand story, USP, about).
 * Layout: image_left (default) | image_right (mobile always stacks top).
 */
export function ImageWithTextSection({ section }: ImageWithTextSectionProps) {
  const s = section.settings || {};
  const c = section.content_data || {};

  const layout = s.layout || 'image_left';
  const imageWidthPct = Number(s.image_width) || 50;
  const imageUrl: string = c.image_url || '';
  const heading: string = c.heading || 'Our Brand Story';
  const body: string = c.body || '';
  const buttonText: string = c.button_text || '';
  const buttonLink: string = c.button_link || '/shop';
  const aspectRatio: string = s.aspect_ratio || '4/3';

  const aspectClass =
    aspectRatio === '1/1'
      ? 'aspect-square'
      : aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : aspectRatio === '3/4'
      ? 'aspect-[3/4]'
      : 'aspect-[4/3]';

  const isImageRight = layout === 'image_right';

  return (
    <SectionWrapper section={section}>
      <div
        className={`flex flex-col ${isImageRight ? 'md:flex-row-reverse' : 'md:flex-row'} gap-6 md:gap-10 items-center`}
      >
        {/* Image side */}
        <div
          className={`w-full ${aspectClass} relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0`}
          style={{ flexBasis: `${imageWidthPct}%` }}
        >
          {imageUrl ? (
            <Image
              src={getOptimizedImageUrl(imageUrl, 800)}
              alt={heading}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-semibold">
              No image selected
            </div>
          )}
        </div>

        {/* Text side */}
        <div
          className="flex flex-col justify-center space-y-4 flex-1"
          style={{ textAlign: s.text_align || 'left' } as React.CSSProperties}
        >
          {section.title && s.show_title !== false && (
            <p className="text-[10px] font-black text-[#e94560] uppercase tracking-[0.2em]">
              {section.title}
            </p>
          )}
          {heading && (
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight font-heading">
              {heading}
            </h2>
          )}
          {body && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium max-w-lg">
              {body}
            </p>
          )}
          {buttonText && buttonLink && (
            <div>
              <Link
                href={buttonLink}
                style={{
                  backgroundColor: s.button_bg || 'var(--btn-primary-bg, var(--color-primary, #1a1a2e))',
                  color: s.button_text_color || 'var(--btn-primary-text, #ffffff)',
                  borderRadius: 'var(--border-radius-btn, 12px)',
                }}
                className="inline-block px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-110 active:scale-95 transition-all"
              >
                {buttonText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}

export default ImageWithTextSection;
