import type { StoreSettings } from '@/lib/types';
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

export type SocialLinkItem = {
  key: string;
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** brand hover bg (used by footer pill style) */
  hoverBg: string;
  hoverColor: string;
};

/**
 * SSOT for storefront social links (RULE SSOT1). ONE source for the enabled
 * social icons + their URLs, reused by the footer AND the header announcement
 * bar (and anywhere else). Only entries with a configured URL are returned, so
 * disabled/empty socials never render. Same `social_*` settings keys everywhere.
 */
export function getSocialLinks(settings: StoreSettings): SocialLinkItem[] {
  return [
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
  ].filter((it) => it.href);
}
