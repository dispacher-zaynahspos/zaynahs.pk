'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';
import { toast } from 'sonner';
import { moveItemInArray } from '@/lib/utils/arrayMove';
import { AccordionGroup, DEVICE_ICON } from '@/components/admin/customizer/controls';
import {
  HeroSlide,
  parsePxValue,
  parsePercentValue,
  HeroSlideManager,
  HeroActiveSlideForm,
  HeroGlobalSettings
} from './hero-banner';
import SectionSpacingControls from '../shared/SectionSpacingControls';

interface HeroBannerSettingsProps {
  section: HomepageSection;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  onUpdateSection: (updates: Partial<HomepageSection>) => void;
  onSelectMedia: (fieldPath: 'settings' | 'content_data', fieldKey: string, isSlide?: boolean, slideId?: string) => void;
}

export default function HeroBannerSettings({
  section,
  viewportMode,
  onUpdateSection,
  onSelectMedia
}: HeroBannerSettingsProps) {
  const settings = section.settings || {};
  const contentData = section.content_data || {};

  const slides: HeroSlide[] = contentData.slides || [];
  const [activeSlideId, setActiveSlideId] = React.useState<string | null>(null);

  // Auto-migrate old single-banner setup to slides array format on load.
  // Deps are intentionally primitive (section id + slide count + active id) so
  // this does NOT re-run on every render from the unstable `contentData`/`slides`
  // object references (which previously caused panel churn / activeSlideId resets).
  React.useEffect(() => {
    if (!contentData.slides || contentData.slides.length === 0) {
      const initialSlide: HeroSlide = {
        id: 'slide_' + Math.random().toString(36).substring(2, 9),
        image_url: contentData.image_url || '',
        video_url: contentData.video_url || '',
        tagline: contentData.tagline || '',
        title: section.title || 'Special Collection Deal',
        subtitle: contentData.subtitle || '',
        button_text: contentData.button_text || 'Shop Now',
        button_link: contentData.button_link || '/shop',
        button_secondary_text: contentData.button_secondary_text || '',
        button_secondary_link: contentData.button_secondary_link || ''
      };
      onUpdateSection({
        content_data: {
          ...contentData,
          slides: [initialSlide]
        }
      });
      setActiveSlideId(initialSlide.id);
    } else if (contentData.slides.length > 0 && !activeSlideId) {
      setActiveSlideId(contentData.slides[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id, contentData.slides?.length, activeSlideId]);

  const handleSettingsChange = (key: string, value: any) => {
    onUpdateSection({
      settings: { ...settings, [key]: value }
    });
  };

  const handleSlideChange = (slideId: string, updates: Partial<HeroSlide>) => {
    const updatedSlides = slides.map(s => s.id === slideId ? { ...s, ...updates } : s);
    onUpdateSection({
      content_data: { ...contentData, slides: updatedSlides }
    });
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: 'slide_' + Math.random().toString(36).substring(2, 9),
      image_url: 'https://ziucrfpebpxijqhwmqre.supabase.co/storage/v1/object/public/product-images/placeholder.jpg',
      tagline: 'NEW ARRIVALS',
      title: 'New Slider Collection',
      subtitle: 'Premium collections now streaming live.',
      button_text: 'Discover More',
      button_link: '/shop',
      button_secondary_text: '',
      button_secondary_link: ''
    };
    const updatedSlides = [...slides, newSlide];
    onUpdateSection({
      content_data: { ...contentData, slides: updatedSlides }
    });
    setActiveSlideId(newSlide.id);
  };

  const handleDeleteSlide = (slideId: string) => {
    if (slides.length <= 1) {
      toast.error('You must keep at least 1 slide in the Hero Banner.');
      return;
    }
    const updatedSlides = slides.filter(s => s.id !== slideId);
    onUpdateSection({
      content_data: { ...contentData, slides: updatedSlides }
    });
    if (activeSlideId === slideId) {
      setActiveSlideId(updatedSlides[0].id);
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = moveItemInArray(slides, index, direction);
    if (newSlides === slides) return;
    onUpdateSection({
      content_data: { ...contentData, slides: newSlides }
    });
  };

  // Parsed dimensions with safe defaults
  const heightDesktop = parsePxValue(settings.height_desktop, 450);
  const heightTablet = parsePxValue(settings.height_tablet, 350);
  const heightMobile = parsePxValue(settings.height_mobile, 250);
  const widthDesktop = parsePxValue(settings.content_width_desktop, 576);
  const widthTablet = parsePxValue(settings.content_width_tablet, 600);
  const widthMobile = parsePercentValue(settings.content_width_mobile, 100);

  const activeSlide = slides.find(s => s.id === activeSlideId);
  const DeviceIcon = DEVICE_ICON[viewportMode];

  return (
    <div className="space-y-4">
      {/* Device scope banner — clarifies shared vs per-device editing */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
        <DeviceIcon className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          Editing <strong className="uppercase">{viewportMode}</strong>. Media & slider options are
          shared across devices; <strong>text &amp; sizing</strong> can be overridden per device
          (switch device in the top bar).
        </span>
      </div>

      {/* CONTENT — slides + active slide */}
      <AccordionGroup id={`hero-${section.id}-content`} title="Content" defaultOpen>
        <div className="space-y-4 pt-2">
          <HeroSlideManager
            slides={slides}
            activeSlideId={activeSlideId}
            setActiveSlideId={(id) => setActiveSlideId(id)}
            handleAddSlide={handleAddSlide}
            handleDeleteSlide={handleDeleteSlide}
            handleMoveSlide={handleMoveSlide}
          />
          {activeSlide && (
            <HeroActiveSlideForm
              activeSlide={activeSlide}
              viewportMode={viewportMode}
              handleSlideChange={handleSlideChange}
              onSelectMedia={onSelectMedia}
            />
          )}
        </div>
      </AccordionGroup>

      {/* LAYOUT & STYLE — dimensions, position, colors, autoplay */}
      <AccordionGroup id={`hero-${section.id}-layout`} title="Layout & Style" defaultOpen={false}>
        <div className="pt-2">
          <HeroGlobalSettings
            settings={settings}
            viewportMode={viewportMode}
            heightDesktop={heightDesktop}
            heightTablet={heightTablet}
            heightMobile={heightMobile}
            widthDesktop={widthDesktop}
            widthTablet={widthTablet}
            widthMobile={widthMobile}
            handleSettingsChange={handleSettingsChange}
            onUpdateSection={(updates) => onUpdateSection(updates)}
          />
        </div>
      </AccordionGroup>

      <SectionSpacingControls section={section} onUpdateSection={onUpdateSection} />
    </div>
  );
}
