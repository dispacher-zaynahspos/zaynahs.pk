'use client';

import React from 'react';
import type { StoreSettings } from '@/lib/types';
import { getSocialLinks } from '@/lib/utils/socialLinks';

interface HeaderSocialLinksProps {
  settings: StoreSettings;
  /** inherit the announcement bar text color for the icons */
  color?: string;
  /** show on mobile too (default hidden < md) */
  showOnMobile?: boolean;
}

/**
 * Compact social icons for the header announcement bar (RULE SSOT1).
 * Reuses the SAME enabled social URLs as the footer via `getSocialLinks` — no
 * duplicate link logic. Icons inherit the bar text color, scale up on big
 * screens, open in a new tab, and never wrap (announcement text truncates, not
 * the icons). Hidden on mobile unless `showOnMobile`.
 */
export default function HeaderSocialLinks({ settings, color, showOnMobile = false }: HeaderSocialLinksProps) {
  const items = getSocialLinks(settings);
  if (items.length === 0) return null;

  return (
    <div
      className={`${showOnMobile ? 'flex' : 'hidden md:flex'} items-center gap-1 lg:gap-1.5 xl:gap-2 shrink-0`}
      style={color ? ({ color } as React.CSSProperties) : undefined}
    >
      {items.map(({ key, href, label, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="flex items-center justify-center h-6 w-6 lg:h-6 lg:w-6 xl:h-7 xl:w-7 rounded-md hover:opacity-70 active:scale-95 transition-all duration-200 cursor-pointer -my-1"
        >
          <Icon className="h-3.5 w-3.5 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 shrink-0" />
        </a>
      ))}
    </div>
  );
}
