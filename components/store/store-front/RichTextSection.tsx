'use client';

import React from 'react';
import Link from 'next/link';
import { HomepageSection } from '@/lib/types';
import { SectionWrapper } from './SectionWrapper';

interface RichTextSectionProps {
  section: HomepageSection;
}

export function RichTextSection({ section }: RichTextSectionProps) {
  const s = section.settings || {};
  const c = section.content_data || {};

  const textAlign = s.text_align || 'center';
  const maxWidth = s.max_width === 'wide' ? 'max-w-4xl' : s.max_width === 'full' ? 'max-w-full' : 'max-w-2xl';
  const heading: string = c.heading || '';
  const body: string = c.body || '';
  const buttonText: string = c.button_text || '';
  const buttonLink: string = c.button_link || '/shop';

  return (
    <SectionWrapper section={section} maxWidthClass={maxWidth}>
      <div style={{ textAlign } as React.CSSProperties}>
        {heading && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4 font-heading">
            {heading}
          </h2>
        )}
        {body && (
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-6 whitespace-pre-line">
            {body}
          </p>
        )}
        {buttonText && buttonLink && (
          <Link
            href={buttonLink}
            style={{
              backgroundColor: 'var(--btn-primary-bg, var(--color-primary, #1a1a2e))',
              color: 'var(--btn-primary-text, #ffffff)',
              borderRadius: 'var(--border-radius-btn, 12px)',
            }}
            className="inline-block px-8 py-3 text-sm font-bold uppercase tracking-wider shadow-sm hover:brightness-110 active:scale-95 transition-all"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </SectionWrapper>
  );
}

export default RichTextSection;
