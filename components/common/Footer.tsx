'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/lib/types';
import PaymentBadges from './PaymentBadges';
import { NewsletterForm, FooterSocialLinks, FooterQuickLinks } from './store-footer';

interface FooterProps {
  settings: StoreSettings;
  brandName?: string;
}

export default function Footer({ settings, brandName }: FooterProps) {
  const [mounted, setMounted] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && window.self !== window.top) {
      setIsPreview(true);
    }
  }, []);

  const currentYear = new Date().getFullYear();

  // Customer Support auto-fill: use header contact phone/email + WhatsApp with admin
  // override (footer_col2_text). Empty values produce NO empty rows (bug fix).
  const supportFallback = (() => {
    const phone = settings.header_top_bar_phone || settings.whatsapp_number || '';
    const email = settings.header_top_bar_email || '';
    const lines: string[] = [];
    if (phone) lines.push(`Call/WhatsApp: ${phone}`);
    if (email) lines.push(`Email: ${email}`);
    lines.push('Timings: 10 AM - 10 PM');
    return lines.join('\n');
  })();

  const hasSocialLinks =
    settings.social_facebook ||
    settings.social_instagram ||
    settings.social_whatsapp ||
    settings.social_youtube ||
    settings.social_tiktok ||
    settings.social_snapchat ||
    settings.social_twitter;

  const navigationMenu = settings?.navigation_menu ?? [];

  const showMenu = settings.footer_show_menu ?? true;
  const showSocial = settings.footer_show_social ?? true;
  const showNewsletter = settings.footer_show_newsletter ?? true;
  const showPayments = settings.footer_show_payments ?? true;

  const showCol3 = showMenu;
  const showCol4 = showNewsletter || (showSocial && hasSocialLinks);

  let gridColsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  const activeCols = 2 + (showCol3 ? 1 : 0) + (showCol4 ? 1 : 0);
  if (activeCols === 2) {
    gridColsClass = 'grid-cols-1 sm:grid-cols-2 max-w-4xl';
  } else if (activeCols === 3) {
    gridColsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }

  const footerBg = settings.theme_config?.colors?.footerBg || settings.footer_bg;
  const footerTextColor = settings.theme_config?.colors?.footerTextColor || settings.footer_text_color;
  const footerBorderColor = settings.footer_border_color || undefined;
  // Derive heading / link colors from the chosen body text color so every footer
  // control actually applies on the storefront (was overridden by hardcoded classes).
  const footerHeadingColor = settings.footer_heading_color || footerTextColor || undefined;
  const footerLinkColor = settings.footer_link_color || footerTextColor || undefined;
  // CSS vars consumed by footer children (fallbacks keep the old gray look when unset).
  const footerStyle: React.CSSProperties & Record<string, string> = {
    backgroundColor: footerBg || '',
    color: footerTextColor || '',
    ...(footerBorderColor ? { borderTopColor: footerBorderColor } : {}),
    ...(footerBg ? { ['--footer-bg']: footerBg } : {}),
    ...(footerTextColor ? { ['--footer-text']: footerTextColor } : {}),
    ...(footerHeadingColor ? { ['--footer-heading']: footerHeadingColor } : {}),
    ...(footerLinkColor ? { ['--footer-link']: footerLinkColor } : {}),
    ...(footerBorderColor ? { ['--footer-divider']: footerBorderColor } : {}),
  };

  return (
    <footer
      onClick={(e) => {
        if (isPreview) {
          e.preventDefault();
          e.stopPropagation();
          window.parent.postMessage({ type: 'select_global_tab', subTab: 'footer' }, '*');
        }
      }}
      className={`w-full overflow-hidden bg-white dark:bg-[#0f0f1b] border-t border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 select-none transition-colors duration-200 ${
        isPreview ? 'cursor-pointer hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2' : ''
      }`}
      style={footerStyle}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Footer Top - Shopify Dynamic Responsive Grid */}
        <div className={`grid gap-8 pb-10 ${gridColsClass}`}>
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 dark:text-white" style={{ color: 'var(--footer-heading)' }}>
              {settings.footer_col1_title || 'About Our Store'}
            </h3>
            <div className="space-y-3">
              {settings.tagline && (
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 max-w-sm">
                  {settings.tagline}
                </p>
              )}
              <p className="text-sm font-semibold leading-relaxed max-w-md text-gray-500 dark:text-gray-400" style={{ color: 'var(--footer-text)' }}>
                {settings.footer_text ||
                  `Welcome to ${
                    brandName || settings.store_name || 'our store'
                  }. We provide premium quality products delivered right to your doorstep. Confirm your orders instantly via WhatsApp.`}
              </p>
              {settings.address && (
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 leading-relaxed">
                  {settings.address}
                </p>
              )}
            </div>
          </div>

          {/* Column 2: Customer Support Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 dark:text-white" style={{ color: 'var(--footer-heading)' }}>
              {settings.footer_col2_title || 'Customer Support'}
            </h3>
            <p className="text-sm font-semibold leading-relaxed whitespace-pre-line text-gray-500 dark:text-gray-400" style={{ color: 'var(--footer-text)' }}>
              {settings.footer_col2_text || supportFallback}
            </p>
          </div>

          {/* Column 3: Quick Links navigation */}
          {showCol3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 dark:text-white" style={{ color: 'var(--footer-heading)' }}>
                {settings.footer_col3_title || 'Quick Links'}
              </h3>
              <FooterQuickLinks settings={settings} navigationMenu={navigationMenu} />
            </div>
          )}

          {/* Column 4: Newsletter & Connect */}
          {showCol4 && (
            <div className="space-y-4">
              {showNewsletter && (
                <>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900 dark:text-white" style={{ color: 'var(--footer-heading)' }}>
                    {settings.footer_col4_title || 'Newsletter'}
                  </h3>
                  <p className="text-sm font-semibold leading-relaxed text-gray-500 dark:text-gray-400" style={{ color: 'var(--footer-text)' }}>
                    {settings.footer_col4_text ||
                      'Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.'}
                  </p>
                  <NewsletterForm />
                </>
              )}

              {showSocial && <FooterSocialLinks settings={settings} />}
            </div>
          )}
        </div>

        {/* Footer Bottom (Divider & Copyright) */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400" style={{ color: 'var(--footer-copyright, var(--footer-text))' }}>
            {settings.footer_bottom_text
              ? settings.footer_bottom_text
              : `© ${currentYear} ${brandName || settings.store_name || 'Our Store'}. All rights reserved.`}
          </p>
          {showPayments &&
            settings.enable_trust_badges &&
            settings.safe_checkout_methods &&
            settings.safe_checkout_methods.length > 0 && (
              <PaymentBadges
                methods={settings.safe_checkout_methods}
                className="flex flex-wrap items-center gap-1.5 justify-end"
              />
            )}
        </div>
      </div>
    </footer>
  );
}
