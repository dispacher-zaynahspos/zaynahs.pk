'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { cleanWhatsAppPhone } from '@/lib/utils/whatsapp';
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  TiktokIcon,
  SnapchatIcon,
  TwitterIcon,
  WhatsAppIcon,
} from '@/components/common/Icons';

interface FooterSocialLinksProps {
  settings: StoreSettings;
}

type SocialItem = {
  key: string;
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** per-brand hover bg (WhatsApp = green); falls back to shared hover bg */
  hoverBg?: string;
  hoverColor?: string;
};

/**
 * Footer social links.
 * RULE "Interactive States": every state (default / hover / focus-visible /
 * active) keeps the icon visible with guaranteed contrast. Hover styling is
 * applied ONLY on hover-capable devices via `@media (hover:hover)` (CSS vars +
 * a scoped <style>), and `:active` gives touch feedback — so icons never
 * disappear or get stuck-hovered on mobile. Colors are editable + shared with
 * the Customizer via footer_social_* keys.
 */
export function FooterSocialLinks({ settings }: FooterSocialLinksProps) {
  const items: SocialItem[] = [
    { key: 'facebook', href: settings.social_facebook || '', label: 'Facebook', Icon: FacebookIcon, hoverBg: '#1877F2', hoverColor: '#ffffff' },
    { key: 'instagram', href: settings.social_instagram || '', label: 'Instagram', Icon: InstagramIcon, hoverBg: '#E1306C', hoverColor: '#ffffff' },
    { key: 'tiktok', href: settings.social_tiktok || '', label: 'TikTok', Icon: TiktokIcon, hoverBg: '#000000', hoverColor: '#ffffff' },
    { key: 'snapchat', href: settings.social_snapchat || '', label: 'Snapchat', Icon: SnapchatIcon, hoverBg: '#FFFC00', hoverColor: '#000000' },
    { key: 'twitter', href: settings.social_twitter || '', label: 'Twitter (X)', Icon: TwitterIcon, hoverBg: '#000000', hoverColor: '#ffffff' },
    { key: 'youtube', href: settings.social_youtube || '', label: 'YouTube', Icon: YoutubeIcon, hoverBg: '#FF0000', hoverColor: '#ffffff' },
    {
      key: 'whatsapp',
      href: settings.social_whatsapp ? `https://wa.me/${cleanWhatsAppPhone(settings.social_whatsapp)}` : '',
      label: 'WhatsApp',
      Icon: WhatsAppIcon,
      hoverBg: '#25D366',
      hoverColor: '#ffffff',
    },
  ].filter((it) => it.href); // hide icons whose link is empty

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

  return (
    <div className="pt-2 flex flex-wrap gap-2" style={styleVars}>
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
