'use client';

import React from 'react';
import Link from 'next/link';
import { HeroSlide } from './types';
import { parseVideoUrl } from './parseVideoUrl';
import { getPresetImageUrl } from '@/lib/utils/imageUrl';

interface HeroSlideItemProps {
  slide: HeroSlide;
  idx: number;
  section: any;
  settings: any;
  bannerUrl: string;
  isSlideActive: boolean;
  loadedMedia: Record<string, boolean>;
  setLoadedMedia: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  styles: any;
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
}: HeroSlideItemProps) {
  const hasVideo = !!slide.video_url;
  const slideImage = slide.image_url || bannerUrl || '';
  const autoplay = slide.video_autoplay !== false;
  const muted = slide.video_muted !== false;
  const slideClass = `hbs-${slide.id.replace(/[^a-z0-9]/gi, '_')}`;

  // Graceful fallbacks for Tablet view
  const tabletTagline = slide.tablet_tagline || slide.tagline;
  const tabletTitle = slide.tablet_title || slide.title;
  const tabletSubtitle = slide.tablet_subtitle || slide.subtitle;
  const tabletButtonText = slide.tablet_button_text || slide.button_text;
  const tabletButtonLink = slide.tablet_button_link || slide.button_link;
  const tabletButtonSecondaryText = slide.tablet_button_secondary_text || slide.button_secondary_text;
  const tabletButtonSecondaryLink = slide.tablet_button_secondary_link || slide.button_secondary_link;

  // Graceful fallbacks for Mobile view
  const mobileTagline = slide.mobile_tagline || slide.tagline;
  const mobileTitle = slide.mobile_title || slide.title;
  const mobileSubtitle = slide.mobile_subtitle || slide.subtitle;
  const mobileButtonText = slide.mobile_button_text || slide.button_text;
  const mobileButtonLink = slide.mobile_button_link || slide.button_link;
  const mobileButtonSecondaryText = slide.mobile_button_secondary_text || slide.button_secondary_text;
  const mobileButtonSecondaryLink = slide.mobile_button_secondary_link || slide.button_secondary_link;

  return (
    <div className="relative flex-grow-0 flex-shrink-0 w-full h-full overflow-hidden select-none">
      {/* Per-slide responsive focal-point CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .${slideClass} {
            object-position: ${styles.imageFocalXDesktop}% ${styles.imageFocalYDesktop}%;
            transform: scale(${styles.imageScaleDesktop / 100});
            transform-origin: ${styles.imageFocalXDesktop}% ${styles.imageFocalYDesktop}%;
            transition: transform 0.3s ease, object-position 0.3s ease, opacity 0.7s ease;
          }
          @media (max-width: 1023px) {
            .${slideClass} {
              object-position: ${styles.imageFocalXTablet}% ${styles.imageFocalYTablet}%;
              transform: scale(${styles.imageScaleTablet / 100});
              transform-origin: ${styles.imageFocalXTablet}% ${styles.imageFocalYTablet}%;
            }
          }
          @media (max-width: 767px) {
            .${slideClass} {
              object-position: ${styles.imageFocalXMobile}% ${styles.imageFocalYMobile}%;
              transform: scale(${styles.imageScaleMobile / 100});
              transform-origin: ${styles.imageFocalXMobile}% ${styles.imageFocalYMobile}%;
            }
          }
        `,
        }}
      />

      {/* Background Image */}
      {slideImage && (
        <img
          src={getPresetImageUrl(slideImage, 'hero')}
          alt={slide.title || section.title || settings.storeName}
          className={`${slideClass} w-full h-full object-cover select-none pointer-events-none absolute inset-0 z-0 ${
            hasVideo && loadedMedia[slide.id] ? 'opacity-0' : 'opacity-100'
          }`}
          loading={idx === 0 ? 'eager' : 'lazy'}
        />
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
      <div
        className={`absolute inset-0 hidden lg:flex p-16 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent ${styles.containerJustifyDesktop} ${styles.containerAlignDesktop}`}
      >
        <div
          style={{ width: styles.contentWidthDesktop }}
          className={`flex flex-col max-w-full transition-all duration-300 ${styles.textColAlignDesktop} ${styles.backdropClass}`}
        >
          {slide.tagline && (
            <p style={{ color: styles.taglineColor }} className="text-xs font-extrabold uppercase tracking-widest mb-2">
              {slide.tagline}
            </p>
          )}

          {slide.title && (
            <h1
              style={{ color: styles.headingColor }}
              className={`font-black tracking-tight font-serif leading-tight ${styles.headingDesktopClass}`}
            >
              {slide.title}
            </h1>
          )}

          {slide.subtitle && (
            <p
              style={{ color: styles.subtitleColor }}
              className="text-xs sm:text-sm mt-3 font-medium opacity-90 leading-relaxed"
            >
              {slide.subtitle}
            </p>
          )}

          {(slide.button_text || slide.button_secondary_text) && (
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              {slide.button_text && (
                <Link
                  href={slide.button_link || '/shop'}
                  style={{ backgroundColor: styles.primaryButtonBg, color: styles.primaryButtonTextColor }}
                  className="px-6 py-2.5 text-xs font-extrabold uppercase rounded-xl transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  {slide.button_text}
                </Link>
              )}
              {slide.button_secondary_text && (
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
                  {slide.button_secondary_text}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tablet Content Container */}
      <div
        className={`absolute inset-0 hidden md:flex lg:hidden p-12 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent ${styles.containerJustifyTablet} ${styles.containerAlignTablet}`}
      >
        <div
          style={{ width: styles.contentWidthTablet }}
          className={`flex flex-col max-w-full transition-all duration-300 ${styles.textColAlignTablet} ${styles.backdropClass}`}
        >
          {tabletTagline && (
            <p style={{ color: styles.taglineColor }} className="text-xs font-extrabold uppercase tracking-widest mb-2">
              {tabletTagline}
            </p>
          )}

          {tabletTitle && (
            <h1
              style={{ color: styles.headingColor }}
              className={`font-black tracking-tight font-serif leading-tight ${styles.headingTabletClass}`}
            >
              {tabletTitle}
            </h1>
          )}

          {tabletSubtitle && (
            <p
              style={{ color: styles.subtitleColor }}
              className="text-xs sm:text-sm mt-3 font-medium opacity-90 leading-relaxed"
            >
              {tabletSubtitle}
            </p>
          )}

          {(tabletButtonText || tabletButtonSecondaryText) && (
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              {tabletButtonText && (
                <Link
                  href={tabletButtonLink || '/shop'}
                  style={{ backgroundColor: styles.primaryButtonBg, color: styles.primaryButtonTextColor }}
                  className="px-6 py-2.5 text-xs font-extrabold uppercase rounded-xl transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  {tabletButtonText}
                </Link>
              )}
              {tabletButtonSecondaryText && (
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
                  {tabletButtonSecondaryText}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Content Container */}
      <div
        className={`absolute inset-0 flex md:hidden p-6 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent ${styles.containerJustifyMobile} ${styles.containerAlignMobile}`}
      >
        <div
          style={{ width: styles.contentWidthMobile }}
          className={`flex flex-col max-w-full transition-all duration-350 ${styles.textColAlignMobile} ${styles.backdropClass}`}
        >
          {mobileTagline && (
            <p style={{ color: styles.taglineColor }} className="text-xs font-extrabold uppercase tracking-widest mb-2">
              {mobileTagline}
            </p>
          )}

          {mobileTitle && (
            <h1
              style={{ color: styles.headingColor }}
              className={`font-black tracking-tight font-serif leading-tight ${styles.headingMobileClass}`}
            >
              {mobileTitle}
            </h1>
          )}

          {mobileSubtitle && (
            <p
              style={{ color: styles.subtitleColor }}
              className="text-xs sm:text-sm mt-3 font-medium opacity-90 leading-relaxed"
            >
              {mobileSubtitle}
            </p>
          )}

          {(mobileButtonText || mobileButtonSecondaryText) && (
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              {mobileButtonText && (
                <Link
                  href={mobileButtonLink || '/shop'}
                  style={{ backgroundColor: styles.primaryButtonBg, color: styles.primaryButtonTextColor }}
                  className="px-6 py-2.5 text-xs font-extrabold uppercase rounded-xl transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  {mobileButtonText}
                </Link>
              )}
              {mobileButtonSecondaryText && (
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
                  {mobileButtonSecondaryText}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
