export type HeroAnimationStyle =
  | 'smooth_slide'
  | 'fade'
  | 'scale_zoom'
  | 'parallax'
  | 'creative_card';

export interface HeroAnimationOption {
  id: HeroAnimationStyle;
  label: string;
  badge: string;
  description: string;
  icon: string;
}

export const HERO_ANIMATION_STYLES: HeroAnimationOption[] = [
  {
    id: 'smooth_slide',
    label: 'Smooth Silk Slide',
    badge: 'Popular',
    description: 'Ultra-fluid high-inertia slide with hardware acceleration & zero jitter',
    icon: '⚡',
  },
  {
    id: 'fade',
    label: 'Crossfade & Glow',
    badge: 'Cinematic',
    description: 'Gentle crossfade where outgoing slides fade out while new slide illuminates',
    icon: '✨',
  },
  {
    id: 'scale_zoom',
    label: 'Ken-Burns Zoom',
    badge: 'Luxury',
    description: 'Subtle cinematic slow-zoom as active slide enters focus',
    icon: '🔍',
  },
  {
    id: 'parallax',
    label: '3D Depth Parallax',
    badge: '3D Depth',
    description: 'Multi-plane spatial depth where background image and text float separately',
    icon: '🌌',
  },
  {
    id: 'creative_card',
    label: 'Card Deck Carousel',
    badge: 'Modern',
    description: 'Mobile native-app card deck with subtle scale & rounded spring edges',
    icon: '🃏',
  },
];
