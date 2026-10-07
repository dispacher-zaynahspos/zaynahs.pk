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
    { key: 'facebook', href: settings.social_facebook || '', label: 'Facebook', Icon: FacebookIcon },
    { key: 'instagram', href: settings.social_instagram || '', label: 'Instagram', Icon: InstagramIcon },
    { key: 'tiktok', href: settings.social_tiktok || '', label: 'TikTok', Icon: TiktokIcon },
    { key: 'snapchat', href: settings.social_snapchat || '', label: 'Snapchat', Icon: SnapchatIcon },
    { key: 'twitter', href: settings.social_twitter || '', label: 'Twitter (X)', Icon: TwitterIcon },
    { key: 'youtube', href: settings.social_youtube || '', label: 'YouTube', Icon: YoutubeIcon },
    {
      key: 'whatsapp',
      href: settings.social_whatsapp ? `https://wa.me/${cleanWhatsAppPhone(settings.social_whatsapp)}` : '',
      label: 'WhatsApp',
      Icon: WhatsAppIcon,
      hoverBg: '#10b981',
    },
  ].filter((it) => it.href); // hide icons whose link is empty

  if (items.length === 0) return null;

  // Shared, editable colors with safe, WCAG-AA defaults.
  const iconColor = settings.footer_social_icon_color || 'var(--footer-text, #5B6B85)';
  const iconBg = settings.footer_social_icon_bg || 'rgba(0,0,0,0.05)';
  const hoverColor = settings.footer_social_hover_color || '#ffffff';
  const hoverBg = settings.footer_social_hover_bg || '#e94560';

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
        }
        .fs-link svg { stroke: currentColor; }
        /* Touch feedback (all devices) */
        .fs-link:active {
          color: var(--fs-hover);
          background-color: var(--fs-hover-bg);
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
            color: var(--fs-hover);
            background-color: var(--fs-hover-bg);
          }
          .fs-link[data-hoverbg]:hover {
            background-color: var(--fs-item-hover-bg, var(--fs-hover-bg));
          }
        }
      `}</style>

      {items.map(({ key, href, label, Icon, hoverBg: itemHoverBg }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          data-hoverbg={itemHoverBg ? '' : undefined}
          style={itemHoverBg ? ({ ['--fs-item-hover-bg']: itemHoverBg } as React.CSSProperties) : undefined}
          className="fs-link flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-200 cursor-pointer"
        >
          <Icon className="h-5 w-5 shrink-0" />
        </a>
      ))}
    </div>
  );
}
