'use client';

import { useState } from 'react';
import { StoreSettings } from '@/lib/types';

interface UseSettingsHeaderFooterProps {
  initialSettings: StoreSettings;
}

export function useSettingsHeaderFooter({ initialSettings }: UseSettingsHeaderFooterProps) {
  // Social States
  const [socialTiktok, setSocialTiktok] = useState(initialSettings.socialTiktok || '');
  const [socialSnapchat, setSocialSnapchat] = useState(initialSettings.socialSnapchat || '');
  const [socialTwitter, setSocialTwitter] = useState(initialSettings.socialTwitter || '');

  // Footer States
  const [footerCol1Title, setFooterCol1Title] = useState(initialSettings.footerCol1Title || 'About Our Store');
  const [footerCol2Title, setFooterCol2Title] = useState(initialSettings.footerCol2Title || 'Customer Support');
  const [footerCol2Text, setFooterCol2Text] = useState(
    initialSettings.footerCol2Text || 'Call/WhatsApp: \nEmail: \nTimings: 10 AM - 10 PM'
  );
  const [footerCol3Title, setFooterCol3Title] = useState(initialSettings.footerCol3Title || 'Quick Links');
  const [footerCol4Title, setFooterCol4Title] = useState(initialSettings.footerCol4Title || 'Newsletter');
  const [footerCol4Text, setFooterCol4Text] = useState(
    initialSettings.footerCol4Text || 'Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.'
  );
  const [footerBottomText, setFooterBottomText] = useState(initialSettings.footerBottomText || '');
  const [footerShowPayments, setFooterShowPayments] = useState(initialSettings.footerShowPayments ?? true);
  const [footerShowMenu, setFooterShowMenu] = useState(initialSettings.footerShowMenu ?? true);
  const [footerShowNewsletter, setFooterShowNewsletter] = useState(initialSettings.footerShowNewsletter ?? true);
  const [footerShowSocial, setFooterShowSocial] = useState(initialSettings.footerShowSocial ?? true);

  // Header States
  const [headerSticky, setHeaderSticky] = useState(initialSettings.headerSticky ?? true);
  const [headerStickyDesktop, setHeaderStickyDesktop] = useState(initialSettings.headerStickyDesktop ?? true);
  const [headerStickyMobile, setHeaderStickyMobile] = useState(initialSettings.headerStickyMobile ?? true);
  const [headerShowTopBar, setHeaderShowTopBar] = useState(initialSettings.headerShowTopBar ?? true);
  const [headerTopBarPhone, setHeaderTopBarPhone] = useState(initialSettings.headerTopBarPhone ?? '');
  const [headerTopBarEmail, setHeaderTopBarEmail] = useState(initialSettings.headerTopBarEmail ?? 'contact@store.com');
  const [headerShowNewsletter, setHeaderShowNewsletter] = useState(initialSettings.headerShowNewsletter ?? true);

  // Floating Contacts States
  const [floatingSnapchatEnabled, setFloatingSnapchatEnabled] = useState(initialSettings.floatingSnapchatEnabled ?? false);
  const [floatingTwitterEnabled, setFloatingTwitterEnabled] = useState(initialSettings.floatingTwitterEnabled ?? false);
  const [floatingContactsEnabled, setFloatingContactsEnabled] = useState<boolean>(initialSettings.floatingContactsEnabled ?? true);
  const [floatingContactsPosition, setFloatingContactsPosition] = useState<'left' | 'right'>(
    initialSettings.floatingContactsPosition ?? 'right'
  );
  const [floatingContactsScale, setFloatingContactsScale] = useState<number>(initialSettings.floatingContactsScale ?? 1.0);
  const [floatingContactsBottomMobile, setFloatingContactsBottomMobile] = useState<number>(
    initialSettings.floatingContactsBottomMobile ?? 80
  );
  const [floatingContactsBottomDesktop, setFloatingContactsBottomDesktop] = useState<number>(
    initialSettings.floatingContactsBottomDesktop ?? 20
  );
  const [floatingContactsSideMobile, setFloatingContactsSideMobile] = useState<number>(
    initialSettings.floatingContactsSideMobile ?? 20
  );
  const [floatingContactsSideDesktop, setFloatingContactsSideDesktop] = useState<number>(
    initialSettings.floatingContactsSideDesktop ?? 20
  );
  const [floatingWhatsappEnabled, setFloatingWhatsappEnabled] = useState<boolean>(
    initialSettings.floatingWhatsappEnabled ?? true
  );
  const [floatingInstagramEnabled, setFloatingInstagramEnabled] = useState<boolean>(
    initialSettings.floatingInstagramEnabled ?? false
  );
  const [floatingTiktokEnabled, setFloatingTiktokEnabled] = useState<boolean>(
    initialSettings.floatingTiktokEnabled ?? false
  );
  const [floatingWhatsappPreset, setFloatingWhatsappPreset] = useState<string>(
    initialSettings.floatingWhatsappPreset ?? ''
  );
  const [floatingWhatsappNumber, setFloatingWhatsappNumber] = useState<string>(
    initialSettings.floatingWhatsappNumber ?? ''
  );

  const [headerNewsletterText, setHeaderNewsletterText] = useState<string>(initialSettings.headerNewsletterText ?? '');
  const [headerDesktopLogoAlign, setHeaderDesktopLogoAlign] = useState<'left' | 'center' | 'right'>(
    initialSettings.headerDesktopLogoAlign ?? 'left'
  );
  const [headerDesktopSearchAlign, setHeaderDesktopSearchAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.headerDesktopSearchAlign ?? 'left'
  );
  const [headerDesktopWishlistAlign, setHeaderDesktopWishlistAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.headerDesktopWishlistAlign ?? 'right'
  );
  const [headerDesktopCartAlign, setHeaderDesktopCartAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.headerDesktopCartAlign ?? 'right'
  );
  const [headerDesktopThemeAlign, setHeaderDesktopThemeAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.headerDesktopThemeAlign ?? 'right'
  );
  const [headerMobileMenuAlign, setHeaderMobileMenuAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.headerMobileMenuAlign ?? 'left'
  );
  const [headerMobileLogoAlign, setHeaderMobileLogoAlign] = useState<'left' | 'center' | 'right'>(
    initialSettings.headerMobileLogoAlign ?? 'center'
  );
  const [headerMobileSearchAlign, setHeaderMobileSearchAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.headerMobileSearchAlign ?? 'right'
  );
  const [headerMobileCartAlign, setHeaderMobileCartAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.headerMobileCartAlign ?? 'right'
  );
  const [headerMobileWishlistAlign, setHeaderMobileWishlistAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.headerMobileWishlistAlign ?? 'hidden'
  );

  const [headerTopBarBg, setHeaderTopBarBg] = useState<string>(initialSettings.headerTopBarBg ?? '#1a1a2e');
  const [headerTopBarTextColor, setHeaderTopBarTextColor] = useState<string>(
    initialSettings.headerTopBarTextColor ?? '#ffffff'
  );
  const [headerBg, setHeaderBg] = useState<string>(initialSettings.headerBg ?? '#ffffff');
  const [headerTextColor, setHeaderTextColor] = useState<string>(initialSettings.headerTextColor ?? '#1a1a1a');
  const [headerBorderColor, setHeaderBorderColor] = useState<string>(initialSettings.headerBorderColor ?? '#e5e7eb');
  const [headerDesktopMenuAlign, setHeaderDesktopMenuAlign] = useState<'left' | 'center' | 'right' | 'hidden'>(
    initialSettings.headerDesktopMenuAlign ?? 'left'
  );

  return {
    socialTiktok,
    setSocialTiktok,
    socialSnapchat,
    setSocialSnapchat,
    socialTwitter,
    setSocialTwitter,
    footerCol1Title,
    setFooterCol1Title,
    footerCol2Title,
    setFooterCol2Title,
    footerCol2Text,
    setFooterCol2Text,
    footerCol3Title,
    setFooterCol3Title,
    footerCol4Title,
    setFooterCol4Title,
    footerCol4Text,
    setFooterCol4Text,
    footerBottomText,
    setFooterBottomText,
    footerShowPayments,
    setFooterShowPayments,
    footerShowMenu,
    setFooterShowMenu,
    footerShowNewsletter,
    setFooterShowNewsletter,
    footerShowSocial,
    setFooterShowSocial,
    headerSticky,
    setHeaderSticky,
    headerStickyDesktop,
    setHeaderStickyDesktop,
    headerStickyMobile,
    setHeaderStickyMobile,
    headerShowTopBar,
    setHeaderShowTopBar,
    headerTopBarPhone,
    setHeaderTopBarPhone,
    headerTopBarEmail,
    setHeaderTopBarEmail,
    headerShowNewsletter,
    setHeaderShowNewsletter,
    floatingSnapchatEnabled,
    setFloatingSnapchatEnabled,
    floatingTwitterEnabled,
    setFloatingTwitterEnabled,
    floatingContactsEnabled,
    setFloatingContactsEnabled,
    floatingContactsPosition,
    setFloatingContactsPosition,
    floatingContactsScale,
    setFloatingContactsScale,
    floatingContactsBottomMobile,
    setFloatingContactsBottomMobile,
    floatingContactsBottomDesktop,
    setFloatingContactsBottomDesktop,
    floatingContactsSideMobile,
    setFloatingContactsSideMobile,
    floatingContactsSideDesktop,
    setFloatingContactsSideDesktop,
    floatingWhatsappEnabled,
    setFloatingWhatsappEnabled,
    floatingInstagramEnabled,
    setFloatingInstagramEnabled,
    floatingTiktokEnabled,
    setFloatingTiktokEnabled,
    floatingWhatsappPreset,
    setFloatingWhatsappPreset,
    floatingWhatsappNumber,
    setFloatingWhatsappNumber,
    headerNewsletterText,
    setHeaderNewsletterText,
    headerDesktopLogoAlign,
    setHeaderDesktopLogoAlign,
    headerDesktopSearchAlign,
    setHeaderDesktopSearchAlign,
    headerDesktopWishlistAlign,
    setHeaderDesktopWishlistAlign,
    headerDesktopCartAlign,
    setHeaderDesktopCartAlign,
    headerDesktopThemeAlign,
    setHeaderDesktopThemeAlign,
    headerMobileLogoAlign,
    setHeaderMobileLogoAlign,
    headerMobileMenuAlign,
    setHeaderMobileMenuAlign,
    headerMobileSearchAlign,
    setHeaderMobileSearchAlign,
    headerMobileCartAlign,
    setHeaderMobileCartAlign,
    headerMobileWishlistAlign,
    setHeaderMobileWishlistAlign,
    headerTopBarBg,
    setHeaderTopBarBg,
    headerTopBarTextColor,
    setHeaderTopBarTextColor,
    headerBg,
    setHeaderBg,
    headerTextColor,
    setHeaderTextColor,
    headerBorderColor,
    setHeaderBorderColor,
    headerDesktopMenuAlign,
    setHeaderDesktopMenuAlign,
  };
}
