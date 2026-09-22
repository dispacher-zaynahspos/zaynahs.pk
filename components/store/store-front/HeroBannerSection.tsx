'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { StoreSettings, HomepageSection } from '@/lib/types';
import {
  HeroSlide,
  HeroBannerSectionProps,
  parseVideoUrl,
  useHeroBannerStyles,
  HeroSlideItem,
} from './hero-banner';

export { parseVideoUrl };

export function HeroBannerSection({ section, settings }: HeroBannerSectionProps) {
  const styles = useHeroBannerStyles(section);

  const settingsTimestamp = settings?.updatedAt ? new Date(settings.updatedAt).getTime() : '';
  const bannerUrl =
    settings?.bannerUrl && settingsTimestamp
      ? `${settings.bannerUrl}?v=${settingsTimestamp}`
      : settings?.bannerUrl || '';

  // Carousel options
  const isAutoplay = section.settings?.autoplay ?? true;
  const autoplaySpeed = section.settings?.autoplay_speed ?? 5000;

  // Extract slides list with backward compatibility
  const slides: HeroSlide[] = React.useMemo(() => {
    const contentData = section.content_data || {};
    if (contentData.slides && contentData.slides.length > 0) {
      return contentData.slides;
    }
    // Backward compat: migrate old single-banner format
    return [
      {
        id: 'default',
        image_url: contentData.image_url || bannerUrl || '',
        video_url: contentData.video_url,
        video_autoplay: contentData.video_autoplay,
        video_muted: contentData.video_muted,
        tagline: contentData.tagline || settings.tagline,
        title: section.title || '',
        subtitle: contentData.subtitle || '',
        button_text: contentData.button_text,
        button_link: contentData.button_link || '/shop',
        button_secondary_text: contentData.button_secondary_text,
        button_secondary_link: contentData.button_secondary_link,
        mobile_tagline: contentData.mobile_tagline || contentData.tagline || settings.tagline,
        mobile_title: contentData.mobile_title || section.title || '',
        mobile_subtitle: contentData.mobile_subtitle || contentData.subtitle || '',
        mobile_button_text: contentData.mobile_button_text || contentData.button_text,
        mobile_button_link: contentData.mobile_button_link || contentData.button_link || '/shop',
        mobile_button_secondary_text:
          contentData.mobile_button_secondary_text || contentData.button_secondary_text,
        mobile_button_secondary_link:
          contentData.mobile_button_secondary_link || contentData.button_secondary_link,
        tablet_tagline: contentData.tablet_tagline || contentData.tagline || settings.tagline,
        tablet_title: contentData.tablet_title || section.title || '',
        tablet_subtitle: contentData.tablet_subtitle || contentData.subtitle || '',
        tablet_button_text: contentData.tablet_button_text || contentData.button_text,
        tablet_button_link: contentData.tablet_button_link || contentData.button_link || '/shop',
        tablet_button_secondary_text:
          contentData.tablet_button_secondary_text || contentData.button_secondary_text,
        tablet_button_secondary_link:
          contentData.tablet_button_secondary_link || contentData.button_secondary_link,
      },
    ];
  }, [section, settings, bannerUrl]);

  const autoplayPlugin = React.useRef(Autoplay({ delay: autoplaySpeed, stopOnInteraction: false }));

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: slides.length > 1, align: 'center', skipSnaps: false },
    slides.length > 1 && isAutoplay ? [autoplayPlugin.current] : []
  );

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [loadedMedia, setLoadedMedia] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi]);

  // Handle updates to speed/autoplay
  React.useEffect(() => {
    if (!emblaApi) return;
    const autoplay = emblaApi.plugins().autoplay;
    if (!autoplay) return;

    if (isAutoplay && slides.length > 1) {
      autoplay.play();
    } else {
      autoplay.stop();
    }
  }, [emblaApi, isAutoplay, slides.length]);

  const carouselKey = `${section.id}_${slides.length}_${isAutoplay}_${autoplaySpeed}`;
  const bannerClassName = `hero-banner-${section.id}`;

  return (
    <div key={carouselKey} className={`${bannerClassName} relative w-full bg-[#1a1a2e] overflow-hidden group`}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .${bannerClassName} {
          height: ${styles.heightMobile} !important;
        }
        @media (min-width: 768px) {
          .${bannerClassName} {
            height: ${styles.heightTablet} !important;
          }
        }
        @media (min-width: 1024px) {
          .${bannerClassName} {
            height: ${styles.heightDesktop} !important;
          }
        }
      `,
        }}
      />
      {/* Embla Viewport wrapper */}
      <div className="overflow-hidden h-full w-full" ref={emblaRef}>
        <div className="flex h-full w-full">
          {slides.map((slide, idx) => (
            <HeroSlideItem
              key={slide.id}
              slide={slide}
              idx={idx}
              section={section}
              settings={settings}
              bannerUrl={bannerUrl}
              isSlideActive={idx === activeIndex}
              loadedMedia={loadedMedia}
              setLoadedMedia={setLoadedMedia}
              styles={styles}
            />
          ))}
        </div>
      </div>

      {/* Nav dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => emblaApi && emblaApi.scrollTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-5 bg-[#e94560]' : 'w-1.5 bg-white/40 hover:bg-white/60'
              } cursor-pointer`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Desktop Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => emblaApi && emblaApi.scrollPrev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 cursor-pointer hidden md:flex"
            aria-label="Previous slide"
          >
            ❮
          </button>
          <button
            onClick={() => emblaApi && emblaApi.scrollNext()}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-90 cursor-pointer hidden md:flex"
            aria-label="Next slide"
          >
            ❯
          </button>
        </>
      )}
    </div>
  );
}
