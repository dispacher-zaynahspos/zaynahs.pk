'use client';

import React from 'react';
import { getContentWidthClass, CATALOG_SECTION_PADDING } from '@/lib/utils/responsiveGrid';

interface SectionWrapperProps {
  section: {
    id: string;
    settings?: Record<string, unknown>;
  };
  children: React.ReactNode;
  /** override default max-w class e.g. 'max-w-full' for full-bleed sections */
  maxWidthClass?: string;
  /** if true, do NOT apply inner container padding (for full-bleed sections like hero/ticker) */
  fullBleed?: boolean;
  className?: string;
}

/**
 * SSOT1 — Shared outer wrapper for all homepage sections.
 * Reads `section.settings.padding_top`, `section.settings.padding_bottom`,
 * `section.settings.section_bg_color` and applies them uniformly.
 * Content width (Boxed/Wide/Full) comes from `section.settings.content_width`
 * (shared SSOT) so big screens are not forced into a narrow container.
 * Default: pt-5 pb-5, boxed (max-w-7xl), no custom bg.
 */
export function SectionWrapper({
  section,
  children,
  maxWidthClass,
  fullBleed = false,
  className = '',
}: SectionWrapperProps) {
  const s = section.settings || {};
  const ptVal = Number(s.padding_top ?? 20);
  const pbVal = Number(s.padding_bottom ?? 20);
  const bgColor = typeof s.section_bg_color === 'string' ? s.section_bg_color : '';
  // Explicit override wins; otherwise resolve from the shared content-width setting.
  const widthClass = maxWidthClass || getContentWidthClass(typeof s.content_width === 'string' ? s.content_width : undefined);

  return (
    <div
      id={section.id}
      className={`w-full transition-colors ${className}`}
      style={{
        paddingTop: `${ptVal}px`,
        paddingBottom: `${pbVal}px`,
        backgroundColor: bgColor || undefined,
      }}
    >
      {fullBleed ? (
        children
      ) : (
        <div className={`mx-auto ${widthClass} ${CATALOG_SECTION_PADDING}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export default SectionWrapper;
