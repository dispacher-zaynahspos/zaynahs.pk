'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HomepageSection } from '@/lib/types';
import { SectionWrapper } from './SectionWrapper';
import { getOptimizedImageUrl } from '@/lib/utils/imageUrl';
import { FolderOpen } from '@/components/common/Icons';

interface CircularItem {
  title: string;
  link: string;
  imageUrl: string;
}

interface CircularCategoriesSectionProps {
  section: HomepageSection;
}

export function CircularCategoriesSection({ section }: CircularCategoriesSectionProps) {
  const s = section.settings || {};
  const c = section.content_data || {};
  const items: CircularItem[] = c.items || [];
  const itemSize = Number(s.item_size) || 80;
  const showLabels = s.show_labels !== false;

  if (items.length === 0) return null;

  return (
    <SectionWrapper section={section}>
      {/* Title */}
      {section.title && s.show_title !== false && (
        <div className="mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white font-heading">
            {section.title}
          </h2>
        </div>
      )}

      {/* Horizontal Scroll Row */}
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {items.map((item, idx) => (
          <Link
            key={idx}
            href={item.link || '/shop'}
            className="flex-shrink-0 snap-start flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div
              className="rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-transparent group-hover:border-[color:var(--color-primary,#e94560)] transition-all duration-300 relative flex-shrink-0 shadow-2xs"
              style={{ width: `${itemSize}px`, height: `${itemSize}px` }}
            >
              {item.imageUrl ? (
                <Image
                  src={getOptimizedImageUrl(item.imageUrl, 200)}
                  alt={item.title || 'Category'}
                  fill
                  sizes={`${itemSize}px`}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <FolderOpen className="h-5 w-5" />
                </div>
              )}
            </div>
            {showLabels && item.title && (
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 text-center max-w-[80px] leading-tight">
                {item.title}
              </span>
            )}
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
}

export default CircularCategoriesSection;
