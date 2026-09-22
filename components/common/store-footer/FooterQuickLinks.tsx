'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StoreSettings, NavigationItem } from '@/lib/types';
import { ChevronDown } from '@/components/common/Icons';

interface FooterQuickLinksProps {
  settings: StoreSettings;
  navigationMenu: NavigationItem[];
}

export function FooterQuickLinks({ settings, navigationMenu }: FooterQuickLinksProps) {
  const [footerAccordionOpen, setFooterAccordionOpen] = useState<Record<string, boolean>>({});
  const [showAllQuickLinks, setShowAllQuickLinks] = useState(false);

  const renderFooterMenu = (items: NavigationItem[], depth = 0) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isAccOpen = footerAccordionOpen[item.id];

      return (
        <li key={item.id} className="w-full space-y-1" style={{ paddingLeft: `${depth * 8}px` }}>
          <div className="flex items-center justify-between">
            <Link
              href={item.url}
              className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer block text-sm flex-grow"
            >
              {item.label}
            </Link>
            {hasChildren && (
              <button
                type="button"
                onClick={() =>
                  setFooterAccordionOpen((prev) => ({
                    ...prev,
                    [item.id]: !prev[item.id],
                  }))
                }
                className="p-1 text-gray-400 hover:text-[#e94560] dark:hover:text-white transition-colors cursor-pointer"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isAccOpen ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>
          {hasChildren && isAccOpen && (
            <ul className="mt-1 space-y-1.5 border-l border-gray-200 dark:border-gray-800 pl-3 mb-1.5 ml-1 animate-fade-in">
              {renderFooterMenu(item.children || [], depth + 1)}
            </ul>
          )}
        </li>
      );
    });
  };

  const allItems = navigationMenu.length > 0
    ? [
        ...renderFooterMenu(navigationMenu),
        settings.showFaqInFooter !== false && (
          <li key="faq">
            <Link href="/faq" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
              FAQ
            </Link>
          </li>
        ),
        <li key="reviews">
          <Link href="/reviews" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
            Reviews
          </Link>
        </li>,
        settings.showReturnsInFooter !== false && (
          <li key="returns">
            <Link href="/returns" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
              Return Policy
            </Link>
          </li>
        ),
        settings.showPrivacyInFooter !== false && (
          <li key="privacy">
            <Link href="/privacy-policy" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
              Privacy Policy
            </Link>
          </li>
        ),
      ].filter(Boolean)
    : [
        <li key="home">
          <Link href="/" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
            Home
          </Link>
        </li>,
        <li key="cart">
          <Link href="/cart" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
            Cart
          </Link>
        </li>,
        <li key="reviews">
          <Link href="/reviews" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
            Reviews
          </Link>
        </li>,
        <li key="account">
          <Link href="/account" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
            My Account
          </Link>
        </li>,
        settings.showFaqInFooter !== false && (
          <li key="faq">
            <Link href="/faq" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
              FAQ
            </Link>
          </li>
        ),
        settings.showReturnsInFooter !== false && (
          <li key="returns">
            <Link href="/returns" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
              Return Policy
            </Link>
          </li>
        ),
        settings.showPrivacyInFooter !== false && (
          <li key="privacy">
            <Link href="/privacy-policy" className="text-gray-500 hover:text-[#e94560] dark:text-gray-400 dark:hover:text-white transition-colors block">
              Privacy Policy
            </Link>
          </li>
        ),
      ].filter(Boolean);

  const visibleItems = showAllQuickLinks ? allItems : allItems.slice(0, 6);
  const hasMore = allItems.length > 6;

  return (
    <ul className="space-y-2.5 text-sm font-semibold">
      {visibleItems}
      {hasMore && (
        <li key="toggle-more">
          <button
            onClick={() => setShowAllQuickLinks(!showAllQuickLinks)}
            className="text-[#e94560] hover:text-[#d8344f] dark:text-[#ff6b84] dark:hover:text-[#ff8a9f] transition-colors font-bold flex items-center gap-1 mt-2 cursor-pointer"
          >
            {showAllQuickLinks ? 'Show Less' : 'Show More'}
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAllQuickLinks ? 'rotate-180' : ''}`} />
          </button>
        </li>
      )}
    </ul>
  );
}
