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

  const hasSocialLinks =
    settings.socialFacebook ||
    settings.socialInstagram ||
    settings.socialWhatsapp ||
    settings.socialYoutube ||
    settings.socialTiktok ||
    settings.socialSnapchat ||
    settings.socialTwitter;

  const navigationMenu = settings?.navigationMenu ?? [];

  const showMenu = settings.footerShowMenu ?? true;
  const showSocial = settings.footerShowSocial ?? true;
  const showNewsletter = settings.footerShowNewsletter ?? true;
  const showPayments = settings.footerShowPayments ?? true;

  const showCol3 = showMenu;
  const showCol4 = showNewsletter || (showSocial && hasSocialLinks);

  let gridColsClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
  const activeCols = 2 + (showCol3 ? 1 : 0) + (showCol4 ? 1 : 0);
  if (activeCols === 2) {
    gridColsClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 max-w-4xl';
  } else if (activeCols === 3) {
    gridColsClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
  }

  return (
    <footer
      onClick={(e) => {
        if (isPreview) {
          e.preventDefault();
          e.stopPropagation();
          window.parent.postMessage({ type: 'select_global_tab', subTab: 'footer' }, '*');
        }
      }}
      className={`w-full bg-white dark:bg-[#0f0f1b] border-t border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 select-none transition-colors duration-200 ${
        isPreview ? 'cursor-pointer hover:ring-2 hover:ring-[#e94560] hover:ring-offset-2' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Footer Top - Shopify Dynamic Responsive Grid */}
        <div className={`grid gap-8 pb-10 ${gridColsClass}`}>
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              {settings.footerCol1Title || 'About Our Store'}
            </h3>
            <div className="space-y-3">
              {settings.tagline && (
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 max-w-sm">
                  {settings.tagline}
                </p>
              )}
              <p className="text-sm font-semibold leading-relaxed max-w-md text-gray-500 dark:text-gray-400">
                {settings.footerText ||
                  `Welcome to ${
                    brandName || settings.storeName || 'our store'
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
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
              {settings.footerCol2Title || 'Customer Support'}
            </h3>
            <p className="text-sm font-semibold leading-relaxed whitespace-pre-line text-gray-500 dark:text-gray-400">
              {settings.footerCol2Text || 'Call/WhatsApp: \nEmail: \nTimings: 10 AM - 10 PM'}
            </p>
          </div>

          {/* Column 3: Quick Links navigation */}
          {showCol3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                {settings.footerCol3Title || 'Quick Links'}
              </h3>
              <FooterQuickLinks settings={settings} navigationMenu={navigationMenu} />
            </div>
          )}

          {/* Column 4: Newsletter & Connect */}
          {showCol4 && (
            <div className="space-y-4">
              {showNewsletter && (
                <>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                    {settings.footerCol4Title || 'Newsletter'}
                  </h3>
                  <p className="text-sm font-semibold leading-relaxed text-gray-500 dark:text-gray-400">
                    {settings.footerCol4Text ||
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
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {settings.footerBottomText
              ? settings.footerBottomText
              : `© ${currentYear} ${brandName || settings.storeName || 'Our Store'}. All rights reserved.`}
          </p>
          {showPayments &&
            settings.enableTrustBadges &&
            settings.safeCheckoutMethods &&
            settings.safeCheckoutMethods.length > 0 && (
              <PaymentBadges
                methods={settings.safeCheckoutMethods}
                className="flex flex-wrap items-center gap-1.5 justify-end"
              />
            )}
        </div>
      </div>
    </footer>
  );
}
