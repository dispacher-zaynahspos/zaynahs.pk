'use client';

import React from 'react';

interface SectionWrapperProps {
  section: {
    id: string;
    settings?: Record<string, any>;
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
 * Default: pt-5 pb-5, no custom bg.
 */
export function SectionWrapper({
  section,
  children,
  maxWidthClass = 'max-w-7xl',
  fullBleed = false,
  className = '',
}: SectionWrapperProps) {
  const s = section.settings || {};
  const ptVal = Number(s.padding_top ?? 20);
  const pbVal = Number(s.padding_bottom ?? 20);
  const bgColor = s.section_bg_color || '';

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
        <div className={`mx-auto ${maxWidthClass} px-4 sm:px-6 lg:px-8`}>
          {children}
        </div>
      )}
    </div>
  );
}

export default SectionWrapper;
