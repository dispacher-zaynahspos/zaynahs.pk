import { HomepageSection, StoreSettings } from '@/lib/types';

export interface HeroSlide {
  id: string;
  image_url: string;
  mobile_image_url?: string;
  tablet_image_url?: string;
  image_fit?: 'cover' | 'contain' | 'fill';
  mobile_image_fit?: 'cover' | 'contain' | 'fill';
  tablet_image_fit?: 'cover' | 'contain' | 'fill';
  video_url?: string;
  video_autoplay?: boolean;
  video_muted?: boolean;
  tagline?: string;
  title?: string;
  subtitle?: string;
  buttons_enabled?: boolean;
  button_text?: string;
  button_link?: string;
  button_secondary_text?: string;
  button_secondary_link?: string;
  mobile_tagline?: string;
  mobile_title?: string;
  mobile_subtitle?: string;
  mobile_button_text?: string;
  mobile_button_link?: string;
  mobile_button_secondary_text?: string;
  mobile_button_secondary_link?: string;
  tablet_tagline?: string;
  tablet_title?: string;
  tablet_subtitle?: string;
  tablet_button_text?: string;
  tablet_button_link?: string;
  tablet_button_secondary_text?: string;
  tablet_button_secondary_link?: string;
}

export interface ParsedVideo {
  type: 'youtube' | 'vimeo' | 'direct' | null;
  embedUrl?: string;
  directUrl?: string;
}

export interface HeroBannerSectionProps {
  section: HomepageSection;
  settings: StoreSettings;
  viewportMode?: 'desktop' | 'tablet' | 'mobile';
}

