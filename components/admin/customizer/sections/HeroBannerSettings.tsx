'use client';

import React from 'react';
import { HomepageSection } from '@/lib/types';
import { toast } from 'sonner';
import {
  HeroSlide,
  parsePxValue,
  parsePercentValue,
  HeroSlideManager,
  HeroActiveSlideForm,
  HeroGlobalSettings
} from './hero-banner';

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

  // Auto-migrate old single-banner setup to slides array format on load
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
    } else if (slides.length > 0 && !activeSlideId) {
      setActiveSlideId(slides[0].id);
    }
  }, [contentData.slides, slides, activeSlideId, contentData, onUpdateSection, section.title]);

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
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIdx];
    newSlides[targetIdx] = temp;

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

  return (
    <div className="space-y-5">
      {/* Viewport Context Header */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400">
        <span className="text-base">⚙️</span>
        <span>
          Showing settings for <strong className="text-[#e94560] uppercase">{viewportMode}</strong> view
        </span>
      </div>

      {/* A. SLIDES LIST MANAGEMENT */}
      <HeroSlideManager
        slides={slides}
        activeSlideId={activeSlideId}
        setActiveSlideId={(id) => setActiveSlideId(id)}
        handleAddSlide={handleAddSlide}
        handleDeleteSlide={handleDeleteSlide}
        handleMoveSlide={handleMoveSlide}
      />

      {/* B. ACTIVE SLIDE SETTINGS */}
      {activeSlide && (
        <HeroActiveSlideForm
          activeSlide={activeSlide}
          viewportMode={viewportMode}
          handleSlideChange={handleSlideChange}
          onSelectMedia={onSelectMedia}
        />
      )}

      {/* C. GLOBAL SLIDER OPTIONS & SETTINGS */}
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
  );
}
