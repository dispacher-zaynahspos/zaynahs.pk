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

export function FooterSocialLinks({ settings }: FooterSocialLinksProps) {
  const hasSocialLinks =
    settings.social_facebook ||
    settings.social_instagram ||
    settings.social_whatsapp ||
    settings.social_youtube ||
    settings.social_tiktok ||
    settings.social_snapchat ||
    settings.social_twitter;

  if (!hasSocialLinks) return null;

  return (
    <div className="pt-2 flex flex-wrap gap-2">
      {settings.social_facebook && (
        <a
          href={settings.social_facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] dark:hover:text-white transition-all cursor-pointer"
          title="Facebook"
        >
          <FacebookIcon className="h-4.5 w-4.5" />
        </a>
      )}

      {settings.social_instagram && (
        <a
          href={settings.social_instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] dark:hover:text-white transition-all cursor-pointer"
          title="Instagram"
        >
          <InstagramIcon className="h-4.5 w-4.5" />
        </a>
      )}

      {settings.social_tiktok && (
        <a
          href={settings.social_tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] dark:hover:text-white transition-all cursor-pointer"
          title="TikTok"
        >
          <TiktokIcon className="h-4.5 w-4.5" />
        </a>
      )}

      {settings.social_snapchat && (
        <a
          href={settings.social_snapchat}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] dark:hover:text-white transition-all cursor-pointer"
          title="Snapchat"
        >
          <SnapchatIcon className="h-4.5 w-4.5" />
        </a>
      )}

      {settings.social_twitter && (
        <a
          href={settings.social_twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] dark:hover:text-white transition-all cursor-pointer"
          title="Twitter (X)"
        >
          <TwitterIcon className="h-4.5 w-4.5" />
        </a>
      )}

      {settings.social_youtube && (
        <a
          href={settings.social_youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#e94560] hover:text-white dark:hover:bg-[#e94560] dark:hover:text-white transition-all cursor-pointer"
          title="YouTube"
        >
          <YoutubeIcon className="h-4.5 w-4.5" />
        </a>
      )}

      {settings.social_whatsapp && (
        <a
          href={`https://wa.me/${cleanWhatsAppPhone(settings.social_whatsapp)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:bg-[#10b981] hover:text-white dark:hover:bg-[#10b981] dark:hover:text-white transition-all cursor-pointer"
          title="WhatsApp"
        >
          <WhatsAppIcon className="h-4.5 w-4.5" />
        </a>
      )}
    </div>
  );
}
