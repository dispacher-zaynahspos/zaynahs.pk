'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { isFeatureEnabled } from '@/lib/features/premium';
import { cleanWhatsAppPhone } from '@/lib/utils/whatsapp';
import { useCartStore } from '@/store/cartStore';
import { usePathname } from 'next/navigation';

import { InstagramIcon, TiktokIcon, SnapchatIcon, TwitterIcon, WhatsAppIcon } from '@/components/common/Icons';

interface FloatingContactsProps {
  settings: StoreSettings;
}

export default function FloatingContacts({ settings }: FloatingContactsProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(true);
  const totalItems = useCartStore(state => state.totalItems());
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) return null;

  // Check global enable toggle
  if (settings.floating_contacts_enabled === false) return null;

  const whatsappNumber = settings.floating_whatsapp_number || settings.whatsapp_number;
  const instagramUrl = settings.social_instagram;
  const tiktokUrl = settings.social_tiktok;
  const snapchatUrl = settings.social_snapchat;
  const twitterUrl = settings.social_twitter;

  // Format active urls based on enabled config flags
  const whatsappUrl = (settings.floating_whatsapp_enabled !== false && whatsappNumber)
    ? `https://wa.me/${cleanWhatsAppPhone(whatsappNumber)}?text=${encodeURIComponent(settings.floating_whatsapp_preset || "Hello! I am visiting your store and have a question.")}`
    : null;

  const instagramUrlFormatted = (settings.floating_instagram_enabled !== false && instagramUrl)
    ? (instagramUrl.startsWith('http') ? instagramUrl : `https://instagram.com/${instagramUrl}`)
    : null;

  const tiktokUrlFormatted = (settings.floating_tiktok_enabled && tiktokUrl)
    ? (tiktokUrl.startsWith('http') ? tiktokUrl : `https://tiktok.com/@${tiktokUrl.replace('@', '')}`)
    : null;

  const snapchatUrlFormatted = (settings.floating_snapchat_enabled && snapchatUrl)
    ? (snapchatUrl.startsWith('http') ? snapchatUrl : `https://snapchat.com/add/${snapchatUrl}`)
    : null;

  const twitterUrlFormatted = (settings.floating_twitter_enabled && twitterUrl)
    ? (twitterUrl.startsWith('http') ? twitterUrl : `https://x.com/${twitterUrl}`)
    : null;

  // If no buttons are active/configured, hide the widget
  if (!whatsappUrl && !instagramUrlFormatted && !tiktokUrlFormatted && !snapchatUrlFormatted && !twitterUrlFormatted) {
    return null;
  }

  // Calculate dynamic bottom and side offset dimensions based on mobile vs desktop
  const isCartBarVisible = mounted && totalItems > 0 && pathname !== '/cart' && pathname !== '/checkout';
  const position = settings.floating_contacts_position || 'right';
  const isTickerEnabled = isFeatureEnabled(settings, 'recent_buyers');
  const isSpinWheelEnabled = isFeatureEnabled(settings, 'spin_wheel');
  const needsStacking = (position === 'left' && isTickerEnabled) || (position === 'right' && isSpinWheelEnabled);
  const baseOffset = settings.floating_contacts_bottom_mobile ?? 80;

  const bottomOffset = isMobile 
    ? (needsStacking 
        ? Math.max(baseOffset + (isCartBarVisible ? 56 : 0), position === 'left' ? (isCartBarVisible ? 220 : 160) : 160)
        : baseOffset + (isCartBarVisible ? 56 : 0)
      )
    : (settings.floating_contacts_bottom_desktop ?? 24);

  const sideOffset = isMobile 
    ? (settings.floating_contacts_side_mobile ?? 16) 
    : (settings.floating_contacts_side_desktop ?? 24);

  const scale = settings.floating_contacts_scale ?? 1.0;

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: `${bottomOffset}px`,
    [position]: `${sideOffset}px`,
    transform: `scale(${scale})`,
    transformOrigin: position === 'right' ? 'bottom right' : 'bottom left',
    zIndex: 55, // --z-floating: above cart bar (45), below toast (60) & header (100)
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'auto'
  };

  return (
    <div style={containerStyle}>
      {/* Instagram Button */}
      {instagramUrlFormatted && (
        <a
          href={instagramUrlFormatted}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
          title="Instagram Profile"
        >
          <InstagramIcon className="h-5.5 w-5.5" />
        </a>
      )}

      {/* TikTok Button */}
      {tiktokUrlFormatted && (
        <a
          href={tiktokUrlFormatted}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 border border-gray-800"
          title="TikTok Profile"
        >
          <TiktokIcon className="h-5 w-5" />
        </a>
      )}

      {/* Snapchat Button */}
      {snapchatUrlFormatted && (
        <a
          href={snapchatUrlFormatted}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fffc00] text-black shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
          title="Snapchat Profile"
        >
          <SnapchatIcon className="h-5.5 w-5.5" />
        </a>
      )}

      {/* Twitter (X) Button */}
      {twitterUrlFormatted && (
        <a
          href={twitterUrlFormatted}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 border border-gray-800"
          title="Twitter Profile"
        >
          <TwitterIcon className="h-4 w-4" />
        </a>
      )}

      {/* WhatsApp Button */}
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md hover:shadow-lg ring-2 ring-white/90 dark:ring-gray-900/90 hover:scale-108 active:scale-95 transition-all duration-200 cursor-pointer"
          title="Chat with us on WhatsApp"
          aria-label="Chat with us on WhatsApp"
        >
          <WhatsAppIcon className="h-5 w-5 text-white fill-current drop-shadow-2xs" />
          <span className={`absolute ${position === 'right' ? 'right-full mr-2.5' : 'left-full ml-2.5'} hidden sm:group-hover:inline-flex items-center px-2 py-1 text-[10px] font-bold text-white bg-gray-900/90 rounded-lg shadow-md whitespace-nowrap pointer-events-none transition-opacity`}>
            Chat with us
          </span>
        </a>
      )}
    </div>
  );
}
