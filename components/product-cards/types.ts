import type { ReactNode } from 'react';
import type { Product } from '@/lib/types';

export type CardVariant = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08';

export interface CardProductSwatch {
  color: string;
  color2?: string;
  image?: string;
}

export interface CardProduct {
  id: string;
  href: string;
  title: string;
  vendor?: string;
  description?: string;
  price: number;
  compareAt?: number | null;
  hasPriceRange?: boolean;
  hasMoreSizes?: boolean;
  badge?: string;
  image: string;
  image2?: string | null;
  rating?: number;
  reviewCount?: number;
  swatches: CardProductSwatch[];
  source?: Product;
  swatchNode?: ReactNode;
}

export interface ProductCardSettings {
  card_alignment: 'left' | 'center' | 'right';
  image_aspect_ratio: '3:4' | '1:1' | '4:3' | '16:9' | 'auto';
  title_line_limit: '1' | '2' | 'none';
  card_image_fit: 'cover' | 'contain';
  swatch_shape: 'circle' | 'square';
  swatch_limit: number;
  archive_swatch_size: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  archive_swatch_align: 'left' | 'center' | 'right';
  card_shadow: 'none' | 'sm' | 'md' | 'lg';
  card_hover_lift: boolean;
  card_border_enabled: boolean;
  card_compare_color?: string;
  card_sale_price_color?: string;
  card_icon_style: 'pill' | 'minimal' | 'luxe' | 'brutalist' | 'glass';
  image_hover_style: 'second_image' | 'slide_left' | 'zoom_swap' | 'fade_up' | 'blur_crossfade' | 'flip_3d' | 'zoom' | 'none';
  card_mobile_activation: 'scroll' | 'touch' | 'off';
  card_mobile_columns: number;
  card_show_stars: boolean;
  card_show_wishlist: boolean;
  card_show_quickview: boolean;
  card_show_quickcart: boolean;
  card_show_description: boolean;
  card_show_sizes: boolean;
  enable_variant_swatches: boolean;
  card_elements_order: Array<'rating' | 'price' | 'title' | 'swatches'>;
}
