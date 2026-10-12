'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HomepageSection, StoreSettings } from '@/lib/types';
import { isFeatureEnabled } from '@/lib/features/premium';
import { getSharedAspectClass } from '@/lib/utils/styles';
import { getResponsiveGridClasses, getGridGapClass, getCatalogGridStyle, evenFillColumns } from '@/lib/utils/responsiveGrid';
import SocialFeedRibbon from '../SocialFeedRibbon';
import { SectionWrapper } from './SectionWrapper';
import { getOptimizedImageUrl, getPresetImageUrl } from '@/lib/utils/imageUrl';
import { resolveCardImage, buildRefLookup, type RefEntity, type GridCardLike } from '@/lib/utils/resolveCardImage';
import { SectionIcon } from '@/components/common/SectionIcon';
import { Lock, Eye, Sparkles } from '@/components/common/Icons';

type GridItem = GridCardLike & { imageUrl?: string };

interface PromoBannerSectionProps {
  section: HomepageSection;
}

export function PromoBannerSection({ section }: PromoBannerSectionProps) {
  const bg = section.settings?.bg_color || '#e94560';
  const text = section.settings?.text_color || '#ffffff';
  const link = section.content_data?.link || '/shop';
  const desktopImage = section.content_data?.image_url;
  const mobileImage = section.content_data?.mobile_image_url || desktopImage;

  return (
    <div 
      key={section.id} 
      style={{ backgroundColor: bg, color: text }}
      className="relative w-full py-12 px-6 text-center space-y-4 overflow-hidden"
    >
      {desktopImage && (
        <>
          <picture className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
            {mobileImage && (
              <source
                media="(max-width: 767px)"
                srcSet={getPresetImageUrl(mobileImage, 'hero')}
              />
            )}
            <img
              src={getPresetImageUrl(desktopImage, 'hero')}
              alt={section.title || 'Promo Banner'}
              className="w-full h-full object-cover select-none pointer-events-none absolute inset-0 z-0"
            />
          </picture>
          <div className="absolute inset-0 bg-black/40 z-[1]" />
        </>
      )}
      <div className="relative z-10 space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-wider">{section.title || 'Special Promotion!'}</h2>
        {section.content_data?.text && (
          <p className="text-sm max-w-xl mx-auto opacity-95 leading-relaxed">{section.content_data.text}</p>
        )}
        {section.content_data?.show_button !== false && (
          <div className="pt-2">
            <Link
              href={link}
              className="px-6 py-2.5 bg-white text-gray-950 hover:bg-gray-100 text-xs font-bold uppercase rounded-xl transition-all shadow-md active:scale-95 inline-block cursor-pointer"
            >
              {section.content_data?.button_text || 'Shop Offer'}
            </Link>
          </div>
        )}
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
  const logoHeight = Number(section.settings?.logo_height) || 48;
  const grayscale = section.settings?.grayscale !== false;

  return (
    <SectionWrapper section={section} className="border-y border-gray-150 dark:border-gray-800/80 overflow-hidden">
      <div className="text-center mb-4">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {section.title || 'Our Premium Partners'}
        </span>
      </div>
      <div className={`flex items-center justify-center gap-12 flex-wrap transition-opacity ${grayscale ? 'opacity-65 grayscale hover:opacity-100' : 'opacity-100'}`}>
        {logos.map((logoUrl: string, idx: number) => (
          <div key={idx} className="relative" style={{ width: logoHeight * 2, height: logoHeight }}>
            <Image
              src={getOptimizedImageUrl(logoUrl, 160)}
              alt="Brand logo Partner"
              fill
              sizes="96px"
              className="object-contain animate-fade-in"
            />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

interface CategoryGridSectionProps {
  section: HomepageSection;
  /** categories + collections for AUTO image resolution (optional) */
  refEntities?: RefEntity[];
}

export function CategoryGridSection({ section, refEntities = [] }: CategoryGridSectionProps) {
  const items = (section.content_data?.items || []) as GridItem[];
  const refLookup = buildRefLookup(refEntities);
  
  const defaultItems = [
    { title: 'New Arrivals', link: '/shop', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80' },
    { title: 'Trending Now', link: '/shop', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80' },
    { title: 'Premium Collection', link: '/shop', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80' },
    { title: 'Accessories', link: '/shop', imageUrl: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800&auto=format&fit=crop&q=80' }
  ];

  const displayItems: GridItem[] = items.length > 0 
    ? items
        .map((item) => ({ ...item, imageUrl: resolveCardImage(item, refLookup) }))
        .filter((item) => item && item.imageUrl)
    : defaultItems;

  // Tile columns (RULE DS24 FIX2). Auto mode (default) fills by a per-breakpoint
  // MIN TILE WIDTH so tiles are visibly large on big screens and wrap evenly to
  // the next line on smaller screens (never shrink to tiny). Manual mode still
  // honors the merchant's exact per-device column counts, picking an even divisor
  // of the tile count so rows never leave a lonely half row (6 → 6/3/2, not 4+2).
  const tileCount = displayItems.length;
  const prefDesktop = Number(section.settings?.desktop_columns) || 4;
  const prefTablet = Number(section.settings?.tablet_columns) || 3;
  const prefMobile = Number(section.settings?.mobile_columns) || 2;
  // Tiles default to manual matching the customizer editor default (CollectionsGridSettings / CategoryGridSettings).
  const tileMode: 'auto' | 'manual' = section.settings?.columns_mode === 'auto' ? 'auto' : 'manual';
  const grid = getCatalogGridStyle({
    mode: tileMode,
    mobile: tileMode === 'auto' ? prefMobile : evenFillColumns(prefMobile, tileCount, 3),
    tablet: tileMode === 'auto' ? prefTablet : evenFillColumns(prefTablet, tileCount, 4),
    desktop: tileMode === 'auto' ? prefDesktop : evenFillColumns(prefDesktop, tileCount, 8),
    wide: section.settings?.wide_columns,
    // Bigger default tile min widths that step up by breakpoint so tiles grow on
    // large screens (tablet ~200, laptop ~240, 1440 ~280, 1920 ~320).
    minMobile: section.settings?.min_tile_mobile || 150,
    minTablet: section.settings?.min_tile_tablet || 200,
    minDesktop: section.settings?.min_tile_desktop || section.settings?.min_card_desktop || 240,
    minXl: section.settings?.min_tile_xl || 280,
    minXxl: section.settings?.min_tile_xxl || 320,
    gap: section.settings?.grid_gap || 'normal',
    tileCount,
    centerIncomplete: true,
  });

  // Shared tile label/text controls (merchant-configurable).
  const labelPosition = section.settings?.label_position || 'bottom'; // bottom | top | center | none
  const showLabels = section.settings?.show_card_labels !== false && labelPosition !== 'none';
  const labelBg = section.settings?.label_bg_color || '';
  const labelTextColor = section.settings?.label_text_color || '';
  const labelFont = section.settings?.label_font || '';
  const showShopNow = section.settings?.show_shop_now === true;
  const shopNowText = section.settings?.shop_now_text || 'Shop Now';
  const labelPosClass =
    labelPosition === 'top'
      ? 'top-2.5 left-2.5 sm:top-3 sm:left-3 xl:top-4 xl:left-4'
      : labelPosition === 'center'
      ? 'inset-0 flex flex-col items-center justify-center text-center'
      : 'bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 xl:bottom-4 xl:left-4';

  const aspectRatio = section.settings?.aspect_ratio || 'recommended';
  const aspectClass = getSharedAspectClass(aspectRatio);

  return (
    <SectionWrapper section={section}>
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
      <div className={grid.className} data-mode={grid.mode} style={grid.style}>
        {displayItems.map((item, idx: number) => (
          <Link 
            key={idx} 
            href={item.link || '/shop'}
            style={{ borderRadius: 'var(--border-radius-card, 16px)' }}
            className={`group relative block overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xs hover:shadow-md cursor-pointer bg-gray-100 dark:bg-gray-900 ${aspectClass}`}
          >
            <Image
              src={item.imageUrl || ''}
              alt={item.title || 'Category'}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

            {showLabels && (
              <div
                style={{
                  borderRadius: 'var(--border-radius-btn, 12px)',
                  ...(labelBg ? { backgroundColor: labelBg } : {}),
                  ...(labelTextColor ? { color: labelTextColor } : {}),
                  ...(labelFont ? { fontFamily: labelFont } : {}),
                }}
                className={`absolute ${labelPosClass} ${labelPosition === 'center' ? '' : 'shadow-md'} ${
                  labelBg || labelPosition === 'center' ? '' : 'bg-white/95 dark:bg-white'
                } ${labelTextColor ? '' : labelPosition === 'center' ? 'text-white' : 'text-gray-900'} px-2.5 sm:px-3.5 xl:px-4 py-1 sm:py-1.5 xl:py-2 text-[11px] sm:text-xs xl:text-sm 2xl:text-base font-black tracking-wide transform transition-all ${labelPosition === 'center' ? '' : 'group-hover:translate-x-1'} duration-300`}
              >
                <span>{item.title || 'Explore'}</span>
                {showShopNow && (
                  <span className="block text-[9px] sm:text-[10px] xl:text-xs font-bold uppercase tracking-wider mt-0.5 opacity-80 group-hover:opacity-100">
                    {shopNowText} →
                  </span>
                )}
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
              backgroundColor: section.settings?.bottom_view_all_bg_color || 'var(--btn-primary-bg, var(--color-primary, #0F2A5E))',
              color: (section.settings?.bottom_view_all_text_color && section.settings.bottom_view_all_text_color.toLowerCase() !== (section.settings?.bottom_view_all_bg_color || '#0f2a5e').toLowerCase())
                ? section.settings.bottom_view_all_text_color
                : '#ffffff',
              borderRadius: 'var(--border-radius-btn, 12px)'
            }}
            className="px-6 py-2.5 text-xs sm:text-sm font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            {section.settings?.bottom_view_all_text || 'View All Categories'}
          </Link>
        </div>
      )}
    </SectionWrapper>
  );
}

interface SocialFeedSectionProps {
  section: HomepageSection;
  activeSettings: StoreSettings;
  isPreview?: boolean;
}

export function SocialFeedSection({ section, activeSettings, isPreview }: SocialFeedSectionProps) {
  if (!isFeatureEnabled(activeSettings, 'social_feeds')) {
    if (isPreview) {
      return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 mb-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center text-center space-y-2 min-h-[150px]">
          <Lock className="h-6 w-6 text-gray-400" />
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
          <Eye className="h-6 w-6 text-gray-400" />
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
        columnsDesktop={Number(section.settings?.columns_desktop) || undefined}
        columnsTablet={Number(section.settings?.columns_tablet) || undefined}
        columnsMobile={Number(section.settings?.columns_mobile) || undefined}
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
  const enabled = activeSettings.enable_ticker && activeSettings.ticker_text;
  const tickerColorSettings = activeSettings as StoreSettings & {
    tickerBgColor?: string;
    ticker_bg_color?: string;
    tickerTextColor?: string;
    ticker_text_color?: string;
  };
  const tickerBgColor = section.settings?.tickerBgColor || section.settings?.bgColor || tickerColorSettings.tickerBgColor || tickerColorSettings.ticker_bg_color || '';
  const tickerTextColor = section.settings?.tickerTextColor || section.settings?.textColor || tickerColorSettings.tickerTextColor || tickerColorSettings.ticker_text_color || '';

  const items = React.useMemo(
    () => (activeSettings.ticker_text || '').split('\n').filter(Boolean),
    [activeSettings.ticker_text],
  );

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const unitRef = React.useRef<HTMLDivElement | null>(null);
  // How many copies of the item list to render so the track covers >= 2x the
  // container width (seamless loop with no trailing gap at any screen size).
  const [copies, setCopies] = React.useState(4);
  const [duration, setDuration] = React.useState(30);

  React.useEffect(() => {
    if (!enabled) return;
    const recalc = () => {
      const container = containerRef.current;
      const unit = unitRef.current;
      if (!container || !unit) return;
      const containerW = container.offsetWidth || 1;
      const unitW = unit.scrollWidth || 1;
      // Need the full track (copies × unit) to be at least 2× container so that a
      // translateX of exactly one unit width loops invisibly.
      const needed = Math.max(2, Math.ceil((containerW * 2) / unitW) + 1);
      setCopies(needed);
      // Constant speed regardless of content length: ~80px/sec.
      setDuration(Math.max(12, Math.round(unitW / 80)));
    };
    recalc();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(recalc) : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', recalc, { passive: true });
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', recalc);
    };
  }, [enabled, items]);

  if (!enabled) return null;

  const renderUnit = (refIt?: boolean) => (
    <div ref={refIt ? unitRef : undefined} className="flex items-center gap-8 pr-8">
      {items.map((item, itemIdx) => (
        <div
          key={itemIdx}
          className={`flex items-center gap-8 text-sm font-bold uppercase tracking-wider ${tickerTextColor ? '' : 'text-gray-800 dark:text-gray-200'}`}
          style={tickerTextColor ? { color: tickerTextColor } : undefined}
        >
          <span>{item}</span>
          <Sparkles className="h-3 w-3 opacity-60" aria-hidden />
        </div>
      ))}
    </div>
  );

  return (
    <div
      key={section.id}
      id={section.id}
      ref={containerRef}
      className={`w-full overflow-hidden border-y border-gray-200 dark:border-gray-800 py-3.5 select-none ${tickerBgColor ? '' : 'bg-white dark:bg-white/5'}`}
      style={tickerBgColor ? { backgroundColor: tickerBgColor } : undefined}
    >
      <style>{`
        @keyframes ticker-marquee {
          0% { transform: translate3d(0,0,0); }
          100% { transform: translate3d(calc(-100% / var(--ticker-copies, 2)), 0, 0); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: ticker-marquee var(--ticker-dur, 30s) linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
        }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>
      <div
        className="ticker-track items-center whitespace-nowrap"
        style={{ '--ticker-copies': copies, '--ticker-dur': `${duration}s` } as React.CSSProperties}
      >
        {Array.from({ length: copies }).map((_, loopIdx) => (
          <React.Fragment key={loopIdx}>{renderUnit(loopIdx === 0)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}

interface ValuePropItem {
  icon?: string;
  title?: string;
  subtitle?: string;
}

interface ValuePropsSectionProps {
  section: HomepageSection;
}

/**
 * Premium "Value Props / USP" strip — icon + title + subtitle columns.
 * Mobile-first responsive grid; reads content_data.items + settings.columns_*.
 * Self-contained (no product/network data) → safe, fast, works on every clone.
 */
export function ValuePropsSection({ section }: ValuePropsSectionProps) {
  const items: ValuePropItem[] = section.content_data?.items?.length
    ? section.content_data.items
    : [
        { icon: 'truck', title: 'Fast Delivery', subtitle: '2–4 days nationwide' },
        { icon: 'cash', title: 'Cash on Delivery', subtitle: 'Pay when it arrives' },
        { icon: 'sparkles', title: 'Premium Quality', subtitle: 'Handpicked products' },
        { icon: 'returns', title: 'Easy Returns', subtitle: '7-day return policy' },
      ];

  const cols = getResponsiveGridClasses({
    mobile: section.settings?.columns_mobile || 2,
    tablet: section.settings?.columns_tablet || Math.min(items.length, 4),
    desktop: section.settings?.columns_desktop || Math.min(items.length, 4),
  });
  const carded = (section.settings?.style ?? 'card') !== 'plain';

  return (
    <SectionWrapper section={section}>
      {section.title && section.settings?.show_title !== false && (
        <h3 className="text-center md:text-left text-sm font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          {section.title}
        </h3>
      )}
      <div className={`grid gap-3 sm:gap-4 ${cols}`}>
        {items.map((it, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center text-center gap-1.5 p-4 sm:p-5 transition-all duration-200 ${
              carded
                ? 'rounded-2xl bg-white dark:bg-[#16162a] border border-gray-150 dark:border-gray-800/80 shadow-xs hover:shadow-md hover:-translate-y-0.5'
                : ''
            }`}
          >
            <span className="text-[#e94560]" aria-hidden>
              <SectionIcon icon={it.icon} className="h-7 w-7 sm:h-8 sm:w-8" />
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
              {it.title}
            </span>
            {it.subtitle && (
              <span className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 leading-snug">
                {it.subtitle}
              </span>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

