'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HomepageSection, StoreSettings } from '@/lib/types';
import { getSharedAspectClass } from '@/lib/utils/styles';
import { getResponsiveGridClasses } from '@/lib/utils/responsiveGrid';
import SocialFeedRibbon from '../SocialFeedRibbon';

interface PromoBannerSectionProps {
  section: HomepageSection;
}

export function PromoBannerSection({ section }: PromoBannerSectionProps) {
  const bg = section.settings?.bg_color || '#e94560';
  const text = section.settings?.text_color || '#ffffff';
  const link = section.content_data?.link || '/shop';

  return (
    <div 
      key={section.id} 
      style={{ backgroundColor: bg, color: text }}
      className="w-full py-12 px-6 text-center space-y-4"
    >
      <h2 className="text-2xl font-black uppercase tracking-wider">{section.title || 'Special Promotion!'}</h2>
      {section.content_data?.text && (
        <p className="text-sm max-w-xl mx-auto opacity-95 leading-relaxed">{section.content_data.text}</p>
      )}
      <div className="pt-2">
        <Link
          href={link}
          className="px-6 py-2.5 bg-white text-gray-950 hover:bg-gray-100 text-xs font-bold uppercase rounded-xl transition-all shadow-md active:scale-95 inline-block cursor-pointer"
        >
          {section.content_data?.button_text || 'Shop Offer'}
        </Link>
      </div>
    </div>
  );
}

interface BrandsLogosSectionProps {
  section: HomepageSection;
}

export function BrandsLogosSection({ section }: BrandsLogosSectionProps) {
  const logos = section.content_data?.logos || [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=120&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=120&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=120&auto=format&fit=crop&q=60'
  ];

  return (
    <div key={section.id} className="w-full py-8 bg-gray-50 dark:bg-white/5 border-y border-gray-150 dark:border-gray-800/80 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 text-center mb-4">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {section.title || 'Our Premium Partners'}
        </span>
      </div>
      <div className="flex items-center justify-center gap-12 flex-wrap opacity-65 grayscale hover:opacity-100 transition-opacity">
        {logos.map((logoUrl: string, idx: number) => (
          <div key={idx} className="relative w-24 h-12">
            <Image
              src={logoUrl}
              alt="Brand logo Partner"
              fill
              sizes="96px"
              className="object-contain animate-fade-in"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface CategoryGridSectionProps {
  section: HomepageSection;
}

export function CategoryGridSection({ section }: CategoryGridSectionProps) {
  const items = section.content_data?.items || [];
  
  const defaultItems = [
    { title: 'New Arrivals', link: '/shop', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80' },
    { title: 'Trending Now', link: '/shop', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80' },
    { title: 'Premium Collection', link: '/shop', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80' },
    { title: 'Accessories', link: '/shop', imageUrl: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800&auto=format&fit=crop&q=80' }
  ];

  const displayItems = items.length > 0 
    ? items.filter((item: any) => item && item.imageUrl) 
    : defaultItems;

  const responsiveCols = getResponsiveGridClasses({
    mobile: section.settings?.mobile_columns || 2,
    tablet: section.settings?.tablet_columns || 3,
    desktop: section.settings?.desktop_columns || 4,
  });

  const aspectRatio = section.settings?.aspect_ratio || 'recommended';
  const aspectClass = getSharedAspectClass(aspectRatio);

  return (
    <div key={section.id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
      {((section.title && section.settings?.show_title !== false) || section.settings?.show_upper_view_all !== false) && (
        <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 flex items-center justify-between">
          {section.title && section.settings?.show_title !== false ? (
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-gray-900 dark:text-white font-heading">
              {section.title}
            </h2>
          ) : <div />}
          {section.settings?.show_upper_view_all !== false && (
            <Link
              href={section.settings?.upper_view_all_url || '/shop'}
              style={{ color: 'var(--color-primary, #C2185B)' }}
              className="text-xs font-bold hover:underline"
            >
              {section.settings?.upper_view_all_text || 'All Categories'}
            </Link>
          )}
        </div>
      )}

      {/* Responsive Cards Grid on Mobile, Tablet & Desktop */}
      <div className={`grid gap-3 sm:gap-4 lg:gap-5 ${responsiveCols}`}>
        {displayItems.map((item: any, idx: number) => (
          <Link 
            key={idx} 
            href={item.link || '/shop'}
            style={{ borderRadius: 'var(--border-radius-card, 16px)' }}
            className={`group relative block overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xs hover:shadow-md cursor-pointer bg-gray-100 dark:bg-gray-900 ${aspectClass}`}
          >
            <Image
              src={item.imageUrl}
              alt={item.title || 'Category'}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
            
            {section.settings?.show_card_labels !== false && (
              <div
                style={{ borderRadius: 'var(--border-radius-btn, 12px)' }}
                className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 bg-white/95 dark:bg-white text-gray-900 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black tracking-wide shadow-md transform transition-all group-hover:translate-x-1 duration-300"
              >
                {item.title || 'Explore'}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Bottom View All Button */}
      {section.settings?.enable_bottom_view_all && (
        <div className="w-full flex items-center justify-center mt-6">
          <Link
            href={section.settings?.bottom_view_all_url || '/shop'}
            style={{
              backgroundColor: section.settings?.bottom_view_all_bg_color || 'var(--color-primary, #e94560)',
              borderRadius: 'var(--border-radius-btn, 12px)'
            }}
            className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            {section.settings?.bottom_view_all_text || 'View All Categories'}
          </Link>
        </div>
      )}
    </div>
  );
}

interface SocialFeedSectionProps {
  section: HomepageSection;
  activeSettings: StoreSettings;
  isPreview?: boolean;
}

export function SocialFeedSection({ section, activeSettings, isPreview }: SocialFeedSectionProps) {
  if (activeSettings.social_feeds_enabled === false) {
    if (isPreview) {
      return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 mb-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center text-center space-y-2 min-h-[150px]">
          <span className="text-2xl">🔒</span>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Social Feed Disabled</p>
          <p className="text-[10px] text-gray-400 font-semibold max-w-xs">Enable Social Feeds Embeds in General Settings &gt; Premium Tab to display this section.</p>
        </div>
      );
    }
    return null;
  }
  if (activeSettings.social_feeds_homepage_enabled === false) {
    if (isPreview) {
      return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 mb-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center text-center space-y-2 min-h-[150px]">
          <span className="text-2xl">👁️‍🗨️</span>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Social Feed Hidden on Homepage</p>
          <p className="text-[10px] text-gray-400 font-semibold max-w-xs">Enable "Show on Homepage" in Social Feed settings.</p>
        </div>
      );
    }
    return null;
  }
  
  return (
    <div key={section.id}>
      <SocialFeedRibbon
        settings={activeSettings}
        title={section.title}
        subtitle={section.content_data?.subtitle}
        desc={section.content_data?.desc}
        limit={section.settings?.limit}
        items={section.content_data?.items}
        isHomepage={true}
      />
    </div>
  );
}

interface TickerSectionProps {
  section: HomepageSection;
  activeSettings: StoreSettings;
}

export function TickerSection({ section, activeSettings }: TickerSectionProps) {
  if (!activeSettings.enableTicker || !activeSettings.tickerText) return null;
  const tickerBgColor = section.settings?.tickerBgColor || section.settings?.bgColor || (activeSettings as any).tickerBgColor || (activeSettings as any).ticker_bg_color || '';
  const tickerTextColor = section.settings?.tickerTextColor || section.settings?.textColor || (activeSettings as any).tickerTextColor || (activeSettings as any).ticker_text_color || '';

  return (
    <div 
      key={section.id} 
      id={section.id}
      className={`w-full overflow-hidden border-y border-gray-200 dark:border-gray-800 py-3.5 select-none ${tickerBgColor ? '' : 'bg-white dark:bg-white/5'}`}
      style={tickerBgColor ? { backgroundColor: tickerBgColor } : undefined}
    >
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-infinite {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
      `}</style>
      <div className="animate-marquee-infinite flex items-center whitespace-nowrap gap-8">
        {[...Array(4)].map((_, loopIdx) => (
          <div key={loopIdx} className="flex items-center gap-8">
            {activeSettings.tickerText!.split('\n').filter(Boolean).map((item, itemIdx) => (
              <div 
                key={itemIdx} 
                className={`flex items-center gap-8 text-sm font-bold uppercase tracking-wider ${tickerTextColor ? '' : 'text-gray-800 dark:text-gray-200'}`}
                style={tickerTextColor ? { color: tickerTextColor } : undefined}
              >
                <span>{item}</span>
                <span className="opacity-60 font-normal">✦</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
