'use client';

import React from 'react';
import Link from 'next/link';
import { HomepageSection, StoreSettings } from '@/lib/types';
import { HeroSlide } from './types';
import { parseVideoUrl } from './parseVideoUrl';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';
import type { useHeroBannerStyles } from './useHeroBannerStyles';
import type { HeroAnimationStyle } from './heroAnimationStyles';

interface HeroSlideItemProps {
  slide: HeroSlide;
  idx: number;
  section: HomepageSection;
  settings: StoreSettings;
  bannerUrl: string;
  isSlideActive: boolean;
  loadedMedia: Record<string, boolean>;
  setLoadedMedia: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  styles: ReturnType<typeof useHeroBannerStyles>;
  animationStyle?: HeroAnimationStyle;
}

export function HeroSlideItem({
  slide,
  idx,
  section,
  settings,
  bannerUrl,
  isSlideActive,
  loadedMedia,
  setLoadedMedia,
  styles,
  animationStyle = 'smooth_slide',
}: HeroSlideItemProps) {
  const hasVideo = !!slide.video_url;
  const isBrokenPlaceholder = (url?: string) => !url || url.includes('placeholder.jpg');
  const validMobileImage = !isBrokenPlaceholder(slide.mobile_image_url) ? (slide.mobile_image_url as string) : '';
  const validDesktopImage = !isBrokenPlaceholder(slide.image_url) ? (slide.image_url as string) : (validMobileImage || bannerUrl || '');
  const desktopImage = validDesktopImage;
  const tabletImage = (!isBrokenPlaceholder(slide.tablet_image_url) ? (slide.tablet_image_url as string) : '') || desktopImage || validMobileImage;
  const mobileImage = validMobileImage || desktopImage;
  const autoplay = slide.video_autoplay !== false;
  const muted = slide.video_muted !== false;
  const slideClass = `hbs-${slide.id.replace(/[^a-z0-9]/gi, '_')}`;
  const imageFit = slide.image_fit || section.settings?.image_fit || 'cover';
  const objectFitClass = imageFit === 'contain' ? 'object-contain' : imageFit === 'fill' ? 'object-fill' : 'object-cover';

  const isNonEmpty = (str?: string | null): boolean => typeof str === 'string' && str.trim().length > 0;

  // Graceful fallbacks for Tablet view: only inherit if undefined, not if explicitly emptied
  const tabletTagline = slide.tablet_tagline !== undefined ? slide.tablet_tagline : slide.tagline;
  const tabletTitle = slide.tablet_title !== undefined ? slide.tablet_title : slide.title;
  const tabletSubtitle = slide.tablet_subtitle !== undefined ? slide.tablet_subtitle : slide.subtitle;
  const tabletButtonText = slide.tablet_button_text !== undefined ? slide.tablet_button_text : slide.button_text;
  const tabletButtonLink = slide.tablet_button_link !== undefined ? slide.tablet_button_link : slide.button_link;
  const tabletButtonSecondaryText = slide.tablet_button_secondary_text !== undefined ? slide.tablet_button_secondary_text : slide.button_secondary_text;
  const tabletButtonSecondaryLink = slide.tablet_button_secondary_link !== undefined ? slide.tablet_button_secondary_link : slide.button_secondary_link;

  // Graceful fallbacks for Mobile view: only inherit if undefined, not if explicitly emptied
  const mobileTagline = slide.mobile_tagline !== undefined ? slide.mobile_tagline : slide.tagline;
  const mobileTitle = slide.mobile_title !== undefined ? slide.mobile_title : slide.title;
  const mobileSubtitle = slide.mobile_subtitle !== undefined ? slide.mobile_subtitle : slide.subtitle;
  const mobileButtonText = slide.mobile_button_text !== undefined ? slide.mobile_button_text : slide.button_text;
  const mobileButtonLink = slide.mobile_button_link !== undefined ? slide.mobile_button_link : slide.button_link;
  const mobileButtonSecondaryText = slide.mobile_button_secondary_text !== undefined ? slide.mobile_button_secondary_text : slide.button_secondary_text;
  const mobileButtonSecondaryLink = slide.mobile_button_secondary_link !== undefined ? slide.mobile_button_secondary_link : slide.button_secondary_link;

  const hasDesktopText = Boolean(
    isNonEmpty(slide.title) ||
    isNonEmpty(slide.tagline) ||
    isNonEmpty(slide.subtitle) ||
    (slide.buttons_enabled !== false && (isNonEmpty(slide.button_text) || isNonEmpty(slide.button_secondary_text)))
  );

  const hasTabletText = Boolean(
    isNonEmpty(tabletTitle) ||
    isNonEmpty(tabletTagline) ||
    isNonEmpty(tabletSubtitle) ||
    (slide.buttons_enabled !== false && (isNonEmpty(tabletButtonText) || isNonEmpty(tabletButtonSecondaryText)))
  );

  const hasMobileText = Boolean(
    isNonEmpty(mobileTitle) ||
    isNonEmpty(mobileTagline) ||
    isNonEmpty(mobileSubtitle) ||
    (slide.buttons_enabled !== false && (isNonEmpty(mobileButtonText) || isNonEmpty(mobileButtonSecondaryText)))
  );

  const isCardDeck = animationStyle === 'creative_card';
  const slideOuterClass = isCardDeck ? 'p-1.5 sm:p-2.5 md:p-3.5' : '';
  const slideInnerClass = isCardDeck
    ? `relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
        isSlideActive ? 'scale-100 opacity-100 ring-1 ring-white/15' : 'scale-[0.93] opacity-60'
      }`
    : 'relative w-full h-full';

  // Image wrapper / picture classes for the 5 animation styles
  let imageAnimationClass = '';
  if (animationStyle === 'scale_zoom') {
    imageAnimationClass = `transition-transform duration-[8000ms] cubic-bezier(0.25, 1, 0.5, 1) will-change-transform ${
      isSlideActive ? 'scale-105' : 'scale-100'
    }`;
  } else if (animationStyle === 'parallax') {
    imageAnimationClass = `transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) will-change-transform ${
      isSlideActive ? 'scale-100 translate-x-0' : 'scale-105 -translate-x-4'
    }`;
  } else if (animationStyle === 'fade') {
    imageAnimationClass = `transition-opacity duration-700 ease-in-out ${
      isSlideActive ? 'opacity-100' : 'opacity-20 md:opacity-10'
    }`;
  }

  // Text content animation classes
  let desktopContentAnimClass = '';
  let tabletContentAnimClass = '';
  let mobileContentAnimClass = '';

  if (animationStyle === 'parallax') {
    desktopContentAnimClass = `transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
      isSlideActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
    }`;
    tabletContentAnimClass = `transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
      isSlideActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
    }`;
    mobileContentAnimClass = `transition-all duration-600 cubic-bezier(0.16, 1, 0.3, 1) ${
      isSlideActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
    }`;
  } else if (animationStyle === 'fade') {
    desktopContentAnimClass = `transition-all duration-700 ease-out ${
      isSlideActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`;
    tabletContentAnimClass = `transition-all duration-700 ease-out ${
      isSlideActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`;
    mobileContentAnimClass = `transition-all duration-700 ease-out ${
      isSlideActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`;
  } else if (animationStyle === 'scale_zoom') {
    desktopContentAnimClass = `transition-all duration-600 ease-out delay-100 ${
      isSlideActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    }`;
    tabletContentAnimClass = `transition-all duration-600 ease-out delay-100 ${
      isSlideActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    }`;
    mobileContentAnimClass = `transition-all duration-600 ease-out delay-100 ${
      isSlideActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
    }`;
  } else if (animationStyle === 'creative_card') {
    desktopContentAnimClass = `transition-all duration-500 ease-out ${
      isSlideActive ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-1'
    }`;
    tabletContentAnimClass = `transition-all duration-500 ease-out ${
      isSlideActive ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-1'
    }`;
    mobileContentAnimClass = `transition-all duration-500 ease-out ${
      isSlideActive ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-1'
    }`;
  } else {
    // smooth_slide
    desktopContentAnimClass = `transition-all duration-400 ease-out ${
      isSlideActive ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-0'
    }`;
    tabletContentAnimClass = `transition-all duration-400 ease-out ${
      isSlideActive ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-0'
    }`;
    mobileContentAnimClass = `transition-all duration-400 ease-out ${
      isSlideActive ? 'opacity-100 translate-y-0' : 'opacity-90 translate-y-0'
    }`;
  }

  return (
    <div className={`relative flex-grow-0 flex-shrink-0 w-full min-h-[200px] h-full overflow-hidden select-none ${slideOuterClass}`}>
      <div className={slideInnerClass}>
        {/* Per-slide responsive focal-point CSS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .${slideClass} {
              object-position: ${styles.imageFocalXDesktop}% ${styles.imageFocalYDesktop}%;
              transform: scale(${styles.imageScaleDesktop / 100});
              transform-origin: ${styles.imageFocalXDesktop}% ${styles.imageFocalYDesktop}%;
            }
            [data-device="desktop"] .${slideClass} {
              object-position: ${styles.imageFocalXDesktop}% ${styles.imageFocalYDesktop}%;
              transform: scale(${styles.imageScaleDesktop / 100});
              transform-origin: ${styles.imageFocalXDesktop}% ${styles.imageFocalYDesktop}%;
            }
            @media (max-width: 1023px) {
              .${slideClass} {
                object-position: ${styles.imageFocalXTablet}% ${styles.imageFocalYTablet}%;
                transform: scale(${styles.imageScaleTablet / 100});
                transform-origin: ${styles.imageFocalXTablet}% ${styles.imageFocalYTablet}%;
              }
            }
            [data-device="tablet"] .${slideClass} {
              object-position: ${styles.imageFocalXTablet}% ${styles.imageFocalYTablet}%;
              transform: scale(${styles.imageScaleTablet / 100});
              transform-origin: ${styles.imageFocalXTablet}% ${styles.imageFocalYTablet}%;
            }
            @media (max-width: 767px) {
              .${slideClass} {
                object-position: ${styles.imageFocalXMobile}% ${styles.imageFocalYMobile}%;
                transform: scale(${styles.imageScaleMobile / 100});
                transform-origin: ${styles.imageFocalXMobile}% ${styles.imageFocalYMobile}%;
              }
            }
            [data-device="mobile"] .${slideClass} {
              object-position: ${styles.imageFocalXMobile}% ${styles.imageFocalYMobile}%;
              transform: scale(${styles.imageScaleMobile / 100});
              transform-origin: ${styles.imageFocalXMobile}% ${styles.imageFocalYMobile}%;
            }
          `,
          }}
        />

        {/* Background Image with Responsive Mobile/Tablet/Desktop Sources */}
        {(desktopImage || mobileImage || tabletImage) && (
          <picture className={`absolute inset-0 w-full h-full pointer-events-none select-none z-0 ${imageAnimationClass}`}>
            {slide.mobile_image_url ? (
              <source
                media="(max-width: 767px)"
                srcSet={getPresetImageUrl(slide.mobile_image_url, 'banner')}
              />
            ) : desktopImage ? (
              <source
                media="(max-width: 767px)"
                srcSet={getPresetImageUrl(desktopImage, 'banner')}
              />
            ) : null}
            {slide.tablet_image_url ? (
              <source
                media="(max-width: 1023px)"
                srcSet={getPresetImageUrl(slide.tablet_image_url, 'banner')}
              />
            ) : null}
            <img
              src={getPresetImageUrl(desktopImage, 'hero')}
              alt={slide.title || section.title || settings.store_name}
              className={`${slideClass} w-full h-full ${objectFitClass} select-none pointer-events-none ${
                hasVideo && loadedMedia[slide.id] ? 'opacity-0' : 'opacity-100'
              }`}
              loading={idx === 0 ? 'eager' : 'lazy'}
              fetchPriority={idx === 0 ? 'high' : 'auto'}
              decoding={idx === 0 ? 'sync' : 'async'}
            />
          </picture>
        )}

      {/* Video Overlay */}
      {hasVideo &&
        (() => {
          const videoInfo = parseVideoUrl(slide.video_url, autoplay, muted);
          const handleLoaded = () => setLoadedMedia((prev) => ({ ...prev, [slide.id]: true }));
          return (
            <div
              className={`absolute inset-0 transition-opacity duration-700 z-[5] ${
                loadedMedia[slide.id] ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {videoInfo.type === 'youtube' || videoInfo.type === 'vimeo' ? (
                <iframe
                  src={videoInfo.embedUrl}
                  onLoad={handleLoaded}
                  className={`${slideClass} w-full h-full border-0 absolute inset-0 ${
                    autoplay ? 'pointer-events-none' : 'pointer-events-auto'
                  }`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={slide.video_url}
                  onLoadedData={handleLoaded}
                  onCanPlay={handleLoaded}
                  onPlaying={handleLoaded}
                  className={`${slideClass} w-full h-full object-cover ${
                    autoplay ? 'pointer-events-none' : 'pointer-events-auto'
                  }`}
                  autoPlay={autoplay}
                  muted={muted}
                  loop={autoplay}
                  playsInline
                  preload={idx === 0 ? 'auto' : 'none'}
                  ref={(el) => {
                    if (el) {
                      if (isSlideActive && autoplay) el.play().catch(() => {});
                      else el.pause();
                    }
                  }}
                />
              )}
            </div>
          );
        })()}

      {/* Dark Overlay Backdrop */}
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{ backgroundColor: styles.overlayColor, opacity: styles.opacity }}
      />

      {/* Desktop Content Container */}
      {hasDesktopText && (
        <div
          className={`absolute inset-0 hidden lg:flex p-16 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent ${styles.containerJustifyDesktop} ${styles.containerAlignDesktop} ${desktopContentAnimClass}`}
        >
          <div
            style={{ width: styles.contentWidthDesktop }}
            className={`flex flex-col max-w-full transition-all duration-300 ${styles.textColAlignDesktop} ${styles.backdropClass}`}
          >
            {isNonEmpty(slide.tagline) && (
              <p style={{ color: styles.taglineColor }} className="text-xs font-extrabold uppercase tracking-widest mb-2">
                {slide.tagline?.trim()}
              </p>
            )}

            {isNonEmpty(slide.title) && (
              <h1
                style={{ color: styles.headingColor }}
                className={`font-black tracking-tight font-serif leading-tight ${styles.headingDesktopClass}`}
              >
                {slide.title?.trim()}
              </h1>
            )}

            {isNonEmpty(slide.subtitle) && (
              <p
                style={{ color: styles.subtitleColor }}
                className="text-xs sm:text-sm mt-3 font-medium opacity-90 leading-relaxed"
              >
                {slide.subtitle?.trim()}
              </p>
            )}

            {slide.buttons_enabled !== false && (isNonEmpty(slide.button_text) || isNonEmpty(slide.button_secondary_text)) && (
              <div className="mt-6 flex flex-wrap gap-3 items-center">
                {isNonEmpty(slide.button_text) && (
                  <Link
                    href={slide.button_link || '/shop'}
                    style={{ backgroundColor: styles.primaryButtonBg, color: styles.primaryButtonTextColor }}
                    className="px-6 py-2.5 text-xs font-extrabold uppercase rounded-xl transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    {slide.button_text?.trim()}
                  </Link>
                )}
                {isNonEmpty(slide.button_secondary_text) && (
                  <Link
                    href={slide.button_secondary_link || '/'}
                    style={{
                      backgroundColor: styles.secondaryButtonBg,
                      color: styles.secondaryButtonTextColor,
                      borderColor:
                        styles.secondaryButtonBg === 'transparent'
                          ? styles.secondaryButtonTextColor
                          : 'transparent',
                    }}
                    className="px-6 py-2.5 text-xs font-extrabold uppercase rounded-xl border transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    {slide.button_secondary_text?.trim()}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tablet Content Container */}
      {hasTabletText && (
        <div
          className={`absolute inset-0 hidden md:flex lg:hidden p-12 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent ${styles.containerJustifyTablet} ${styles.containerAlignTablet} ${tabletContentAnimClass}`}
        >
          <div
            style={{ width: styles.contentWidthTablet }}
            className={`flex flex-col max-w-full transition-all duration-300 ${styles.textColAlignTablet} ${styles.backdropClass}`}
          >
            {isNonEmpty(tabletTagline) && (
              <p style={{ color: styles.taglineColor }} className="text-xs font-extrabold uppercase tracking-widest mb-2">
                {tabletTagline?.trim()}
              </p>
            )}

            {isNonEmpty(tabletTitle) && (
              <h1
                style={{ color: styles.headingColor }}
                className={`font-black tracking-tight font-serif leading-tight ${styles.headingTabletClass}`}
              >
                {tabletTitle?.trim()}
              </h1>
            )}

            {isNonEmpty(tabletSubtitle) && (
              <p
                style={{ color: styles.subtitleColor }}
                className="text-xs sm:text-sm mt-3 font-medium opacity-90 leading-relaxed"
              >
                {tabletSubtitle?.trim()}
              </p>
            )}

            {slide.buttons_enabled !== false && (isNonEmpty(tabletButtonText) || isNonEmpty(tabletButtonSecondaryText)) && (
              <div className="mt-6 flex flex-wrap gap-3 items-center">
                {isNonEmpty(tabletButtonText) && (
                  <Link
                    href={tabletButtonLink || '/shop'}
                    style={{ backgroundColor: styles.primaryButtonBg, color: styles.primaryButtonTextColor }}
                    className="px-6 py-2.5 text-xs font-extrabold uppercase rounded-xl transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    {tabletButtonText?.trim()}
                  </Link>
                )}
                {isNonEmpty(tabletButtonSecondaryText) && (
                  <Link
                    href={tabletButtonSecondaryLink || '/'}
                    style={{
                      backgroundColor: styles.secondaryButtonBg,
                      color: styles.secondaryButtonTextColor,
                      borderColor:
                        styles.secondaryButtonBg === 'transparent'
                          ? styles.secondaryButtonTextColor
                          : 'transparent',
                    }}
                    className="px-6 py-2.5 text-xs font-extrabold uppercase rounded-xl border transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    {tabletButtonSecondaryText?.trim()}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Content Container */}
      {hasMobileText && (
        <div
          className={`absolute inset-0 flex md:hidden p-6 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent ${styles.containerJustifyMobile} ${styles.containerAlignMobile} ${mobileContentAnimClass}`}
        >
          <div
            style={{ width: styles.contentWidthMobile }}
            className={`flex flex-col max-w-full transition-all duration-350 ${styles.textColAlignMobile} ${styles.backdropClass}`}
          >
            {isNonEmpty(mobileTagline) && (
              <p style={{ color: styles.taglineColor }} className="text-xs font-extrabold uppercase tracking-widest mb-2">
                {mobileTagline?.trim()}
              </p>
            )}

            {isNonEmpty(mobileTitle) && (
              <h1
                style={{ color: styles.headingColor }}
                className={`font-black tracking-tight font-serif leading-tight ${styles.headingMobileClass}`}
              >
                {mobileTitle?.trim()}
              </h1>
            )}

            {isNonEmpty(mobileSubtitle) && (
              <p
                style={{ color: styles.subtitleColor }}
                className="text-xs sm:text-sm mt-3 font-medium opacity-90 leading-relaxed"
              >
                {mobileSubtitle?.trim()}
              </p>
            )}

            {slide.buttons_enabled !== false && (isNonEmpty(mobileButtonText) || isNonEmpty(mobileButtonSecondaryText)) && (
              <div className="mt-6 flex flex-wrap gap-3 items-center">
                {isNonEmpty(mobileButtonText) && (
                  <Link
                    href={mobileButtonLink || '/shop'}
                    style={{ backgroundColor: styles.primaryButtonBg, color: styles.primaryButtonTextColor }}
                    className="px-6 py-2.5 text-xs font-extrabold uppercase rounded-xl transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    {mobileButtonText?.trim()}
                  </Link>
                )}
                {isNonEmpty(mobileButtonSecondaryText) && (
                  <Link
                    href={mobileButtonSecondaryLink || '/'}
                    style={{
                      backgroundColor: styles.secondaryButtonBg,
                      color: styles.secondaryButtonTextColor,
                      borderColor:
                        styles.secondaryButtonBg === 'transparent'
                          ? styles.secondaryButtonTextColor
                          : 'transparent',
                    }}
                    className="px-6 py-2.5 text-xs font-extrabold uppercase rounded-xl border transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    {mobileButtonSecondaryText?.trim()}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
