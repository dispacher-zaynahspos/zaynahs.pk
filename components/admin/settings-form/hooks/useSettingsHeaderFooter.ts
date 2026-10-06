'use client';

import { useState } from 'react';
import { StoreSettings } from '@/lib/types';

interface UseSettingsHeaderFooterProps {
  initialSettings: StoreSettings;
}

export function useSettingsHeaderFooter({ initialSettings }: UseSettingsHeaderFooterProps) {
  // Social States
  const [socialTiktok, setSocialTiktok] = useState(initialSettings.social_tiktok || '');
  const [socialSnapchat, setSocialSnapchat] = useState(initialSettings.social_snapchat || '');
  const [socialTwitter, setSocialTwitter] = useState(initialSettings.social_twitter || '');

  // Footer States
  const [footerCol1Title, setFooterCol1Title] = useState(initialSettings.footer_col1_title || 'About Our Store');
  const [footerCol2Title, setFooterCol2Title] = useState(initialSettings.footer_col2_title || 'Customer Support');
  const [footerCol2Text, setFooterCol2Text] = useState(
    initialSettings.footer_col2_text || 'Call/WhatsApp: \nEmail: \nTimings: 10 AM - 10 PM'
  );
  const [footerCol3Title, setFooterCol3Title] = useState(initialSettings.footer_col3_title || 'Quick Links');
  const [footerCol4Title, setFooterCol4Title] = useState(initialSettings.footer_col4_title || 'Newsletter');
  const [footerCol4Text, setFooterCol4Text] = useState(
    initialSettings.footer_col4_text || 'Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.'
  );
  const [footerBottomText, setFooterBottomText] = useState(initialSettings.footer_bottom_text || '');
  const [footerBg, setFooterBg] = useState(initialSettings.footer_bg || '');
  const [footerTextColor, setFooterTextColor] = useState(initialSettings.footer_text_color || '');
  const [footerBorderColor, setFooterBorderColor] = useState(initialSettings.footer_border_color || '');
  const [footerHeadingColor, setFooterHeadingColor] = useState(initialSettings.footer_heading_color || '');
  const [footerLinkColor, setFooterLinkColor] = useState(initialSettings.footer_link_color || '');
  const [footerCopyrightColor, setFooterCopyrightColor] = useState(initialSettings.footer_copyright_color || '');
  const [footerShowPayments, setFooterShowPayments] = useState(initialSettings.footer_show_payments ?? true);
  const [footerShowMenu, setFooterShowMenu] = useState(initialSettings.footer_show_menu ?? true);
  const [footerShowNewsletter, setFooterShowNewsletter] = useState(initialSettings.footer_show_newsletter ?? true);
  const [footerShowSocial, setFooterShowSocial] = useState(initialSettings.footer_show_social ?? true);

  // Header States
  const [headerSticky, setHeaderSticky] = useState(initialSettings.header_sticky ?? true);
  const [headerStickyDesktop, setHeaderStickyDesktop] = useState(initialSettings.header_sticky_desktop ?? true);
  const [headerStickyMobile, setHeaderStickyMobile] = useState(initialSettings.header_sticky_mobile ?? true);
  const [headerShowTopBar, setHeaderShowTopBar] = useState(initialSettings.header_show_top_bar ?? true);
  const [headerTopBarPhone, setHeaderTopBarPhone] = useState(initialSettings.header_top_bar_phone ?? '');
  const [headerTopBarEmail, setHeaderTopBarEmail] = useState(initialSettings.header_top_bar_email ?? 'contact@store.com');
  const [headerShowNewsletter, setHeaderShowNewsletter] = useState(initialSettings.header_show_newsletter ?? true);

  // Floating Contacts States
  const [floatingSnapchatEnabled, setFloatingSnapchatEnabled] = useState(initialSettings.floating_snapchat_enabled ?? false);
  const [floatingTwitterEnabled, setFloatingTwitterEnabled] = useState(initialSettings.floating_twitter_enabled ?? false);
  const [floatingContactsEnabled, setFloatingContactsEnabled] = useState<boolean>(initialSettings.floating_contacts_enabled ?? true);
  const [floatingContactsPosition, setFloatingContactsPosition] = useState<'left' | 'right'>(
    initialSettings.floating_contacts_position ?? 'right'
  );
  const [floatingContactsScale, setFloatingContactsScale] = useState<number>(initialSettings.floating_contacts_scale ?? 1.0);
  const [floatingContactsBottomMobile, setFloatingContactsBottomMobile] = useState<number>(
    initialSettings.floating_contacts_bottom_mobile ?? 80
  );
  const [floatingContactsBottomDesktop, setFloatingContactsBottomDesktop] = useState<number>(
    initialSettings.floating_contacts_bottom_desktop ?? 20
  );
  const [floatingContactsSideMobile, setFloatingContactsSideMobile] = useState<number>(
    initialSettings.floating_contacts_side_mobile ?? 20
  );
  const [floatingContactsSideDesktop, setFloatingContactsSideDesktop] = useState<number>(
    initialSettings.floating_contacts_side_desktop ?? 20
  );
  const [floatingWhatsappEnabled, setFloatingWhatsappEnabled] = useState<boolean>(
    initialSettings.floating_whatsapp_enabled ?? true
  );
  const [floatingInstagramEnabled, setFloatingInstagramEnabled] = useState<boolean>(
    initialSettings.floating_instagram_enabled ?? false
  );
  const [floatingTiktokEnabled, setFloatingTiktokEnabled] = useState<boolean>(
    initialSettings.floating_tiktok_enabled ?? false
  );
  const [floatingWhatsappPreset, setFloatingWhatsappPreset] = useState<string>(
    initialSettings.floating_whatsapp_preset ?? ''
  );
  const [floatingWhatsappNumber, setFloatingWhatsappNumber] = useState<string>(
    initialSettings.floating_whatsapp_number ?? ''
  );

  const [headerNewsletterText, setHeaderNewsletterText] = useState<string>(initialSettings.header_newsletter_text ?? '');
  const [headerDesktopLogoAlign, setHeaderDesktopLogoAlign] = useState<'left' | 'center' | 'right'>(
    initialSettings.header_desktop_logo_align ?? 'left'
  );
  const [headerDesktopSearchAlign, setHeaderDesktopSearchAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.header_desktop_search_align ?? 'left'
  );
  const [headerDesktopWishlistAlign, setHeaderDesktopWishlistAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.header_desktop_wishlist_align ?? 'right'
  );
  const [headerDesktopCartAlign, setHeaderDesktopCartAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.header_desktop_cart_align ?? 'right'
  );
  const [headerDesktopThemeAlign, setHeaderDesktopThemeAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.header_desktop_theme_align ?? 'right'
  );
  const [headerMobileMenuAlign, setHeaderMobileMenuAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.header_mobile_menu_align ?? 'left'
  );
  const [headerMobileLogoAlign, setHeaderMobileLogoAlign] = useState<'left' | 'center' | 'right'>(
    initialSettings.header_mobile_logo_align ?? 'center'
  );
  const [headerMobileSearchAlign, setHeaderMobileSearchAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.header_mobile_search_align ?? 'right'
  );
  const [headerMobileCartAlign, setHeaderMobileCartAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.header_mobile_cart_align ?? 'right'
  );
  const [headerMobileWishlistAlign, setHeaderMobileWishlistAlign] = useState<'left' | 'right' | 'hidden'>(
    initialSettings.header_mobile_wishlist_align ?? 'hidden'
  );

  const [headerTopBarBg, setHeaderTopBarBg] = useState<string>(initialSettings.header_top_bar_bg ?? '#1a1a2e');
  const [headerTopBarTextColor, setHeaderTopBarTextColor] = useState<string>(
    initialSettings.header_top_bar_text_color ?? '#ffffff'
  );
  const [headerBg, setHeaderBg] = useState<string>(initialSettings.header_bg ?? '#ffffff');
  const [headerTextColor, setHeaderTextColor] = useState<string>(initialSettings.header_text_color ?? '#1a1a1a');
  const [headerBorderColor, setHeaderBorderColor] = useState<string>(initialSettings.header_border_color ?? '#e5e7eb');
  const [headerDesktopMenuAlign, setHeaderDesktopMenuAlign] = useState<'left' | 'center' | 'right' | 'hidden'>(
    initialSettings.header_desktop_menu_align ?? 'left'
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
    footerBg,
    setFooterBg,
    footerTextColor,
    setFooterTextColor,
    footerBorderColor,
    setFooterBorderColor,
    footerHeadingColor,
    setFooterHeadingColor,
    footerLinkColor,
    setFooterLinkColor,
    footerCopyrightColor,
    setFooterCopyrightColor,
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
