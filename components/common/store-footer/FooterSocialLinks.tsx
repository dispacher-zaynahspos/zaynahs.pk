'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { getSocialLinks } from '@/lib/utils/socialLinks';

interface FooterSocialLinksProps {
  settings: StoreSettings;
}

/**
 * Footer social links.
 * RULE "Interactive States": every state (default / hover / focus-visible /
 * active) keeps the icon visible with guaranteed contrast. Hover styling is
 * applied ONLY on hover-capable devices via `@media (hover:hover)` (CSS vars +
 * a scoped <style>), and `:active` gives touch feedback — so icons never
 * disappear or get stuck-hovered on mobile. Colors are editable + shared with
 * the Customizer via footer_social_* keys.
 *
 * Social URLs come from the shared SSOT `getSocialLinks(settings)` so the footer
 * and header announcement bar always show the same enabled icons.
 */
export function FooterSocialLinks({ settings }: FooterSocialLinksProps) {
  const items = getSocialLinks(settings);

  if (items.length === 0) return null;

  // Shared, editable colors with safe, WCAG-AA defaults.
  const iconColor = settings.footer_social_icon_color || '#334155';
  const iconBg = settings.footer_social_icon_bg || 'rgba(0,0,0,0.05)';
  const hoverColor = settings.footer_social_hover_color || '#ffffff';
  const hoverBg = settings.footer_social_hover_bg || '#0F2A5E';

  const styleVars = {
    ['--fs-icon']: iconColor,
    ['--fs-bg']: iconBg,
    ['--fs-hover']: hoverColor,
    ['--fs-hover-bg']: hoverBg,
  } as React.CSSProperties;

  const isCenter = settings.footer_align === 'center';
  const justifyClass = isCenter ? 'justify-center' : 'justify-center sm:justify-start';

  return (
    <div className={`pt-2 flex flex-wrap items-center gap-2 ${justifyClass}`} style={styleVars}>
      <style>{`
        .fs-link {
          color: var(--fs-icon);
          background-color: var(--fs-bg);
          -webkit-tap-highlight-color: transparent;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fs-link svg {
          stroke: currentColor;
          transition: transform 0.2s ease;
        }
        /* Touch feedback (all devices) */
        .fs-link:active {
          color: var(--fs-item-hover-color, var(--fs-hover, #ffffff)) !important;
          background-color: var(--fs-item-hover-bg, var(--fs-hover-bg)) !important;
          border-color: transparent !important;
          transform: scale(0.94);
        }
        /* Keyboard focus always visible */
        .fs-link:focus-visible {
          outline: 2px solid var(--fs-hover-bg);
          outline-offset: 2px;
          color: var(--fs-icon);
        }
        /* Hover ONLY on hover-capable devices → no sticky hover on mobile */
        @media (hover: hover) {
          .fs-link:hover {
            color: var(--fs-item-hover-color, var(--fs-hover, #ffffff)) !important;
            background-color: var(--fs-item-hover-bg, var(--fs-hover-bg)) !important;
            border-color: transparent !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 14px -2px rgba(0,0,0,0.2);
          }
          .fs-link:hover svg {
            transform: scale(1.1);
          }
        }
      `}</style>

      {items.map(({ key, href, label, Icon, hoverBg: itemHoverBg, hoverColor: itemHoverColor }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          style={
            {
              ['--fs-item-hover-bg']: itemHoverBg,
              ['--fs-item-hover-color']: itemHoverColor || '#ffffff',
            } as React.CSSProperties
          }
          className="fs-link flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-200 cursor-pointer"
        >
          <Icon className="h-5 w-5 shrink-0" />
        </a>
      ))}
    </div>
  );
}
