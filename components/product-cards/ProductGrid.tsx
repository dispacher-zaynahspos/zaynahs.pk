'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import type { StoreSettings } from '@/lib/types';
import './product-cards.css';
import variants from './card-variants.json';
import type { CardVariant, ProductCardSettings, CardProduct } from './types';
import { ProductCard } from './ProductCard';

const SZ = { xxs: 6, xs: 8, sm: 10, md: 12, lg: 14, xl: 16, xxl: 18 } as const;
const AL = { left: 'flex-start', center: 'center', right: 'flex-end' } as const;

export function ProductGrid({ variant, products, settings, currencySymbol, single, renderProduct, onWishlist, onQuickView, onAddToCart }: {
  variant: CardVariant; products: CardProduct[]; settings?: StoreSettings | null; currencySymbol?: string; single?: boolean; renderProduct?: (product: CardProduct) => ReactNode;
  onWishlist?: (p: CardProduct) => void; onQuickView?: (p: CardProduct) => void; onAddToCart?: (p: CardProduct) => void;
}) {
  const v = variants[variant];
  // merged settings for rendering (includes defaults)
  const mergedSettings = { ...v.defaults, card_icon_style: 'pill', image_hover_style: 'second_image', card_mobile_activation: 'scroll',
    card_mobile_columns: 2, enable_variant_swatches: true, swatch_shape: 'circle', archive_swatch_align: 'center', card_shadow: 'none',
    card_hover_lift: false, card_compare_color: '#ef4444', card_show_wishlist: true, card_show_quickview: true, card_show_quickcart: true,
    card_show_description: false, ...settings } as ProductCardSettings;
  const s = mergedSettings;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const touch = matchMedia('(hover:none), (pointer:coarse)').matches;
    document.documentElement.classList.toggle('touch', touch);
  }, []);

  const ord = s.card_elements_order, style: Record<string, string | number> = {
    '--ff': v.ff, '--cols-d': single ? 1 : v.cols, '--gap': v.gap,
    '--ratio': s.image_aspect_ratio.replace(':', '/'), '--fit': s.card_image_fit, '--lines': s.title_line_limit === 'none' ? 999 : s.title_line_limit,
    '--ai': AL[s.card_alignment], '--jc': AL[s.card_alignment], '--ta': s.card_alignment, '--sj': AL[s.archive_swatch_align],
    '--sz': SZ[s.archive_swatch_size] + 'px', '--rad': s.swatch_shape === 'circle' ? '50%' : '2px', '--cmp': s.card_compare_color || '#ef4444',
    ...(s.card_sale_price_color ? { '--salecol': s.card_sale_price_color } : {}),
    ...Object.fromEntries(ord.map((k, i) => [`--o-${k}`, (i + 1) * 10])), '--o-desc': (ord.indexOf('title') + 1) * 10 + 1,
  };
  const on = (b: boolean) => (b ? 'on' : 'off');
  return (
    <section ref={ref} className={`pc-grid${single ? ' pc-grid-single' : ''}`} data-card={variant} style={style as React.CSSProperties}
      data-hover={s.image_hover_style} data-icon={s.card_icon_style} data-shadow={s.card_shadow} data-lift={on(s.card_hover_lift)}
      data-border={on(s.card_border_enabled)} data-mcols={s.card_mobile_columns} data-ratio={s.image_aspect_ratio}
      data-wishlist={on(s.card_show_wishlist)} data-quickview={on(s.card_show_quickview)} data-quickcart={on(s.card_show_quickcart)}
      data-stars={on(s.card_show_stars)} data-desc={on(s.card_show_description)} data-swatches={on(s.enable_variant_swatches)} data-sizes={on(s.card_show_sizes)}>
      {products.map(p => renderProduct ? renderProduct(p) : <ProductCard key={p.id} product={p} variant={variant} limit={s.swatch_limit} currencySymbol={currencySymbol} cardMobileActivation={s.card_mobile_activation} settings={s} originalSettings={settings}
        onWishlist={onWishlist} onQuickView={onQuickView} onAddToCart={onAddToCart} />)}
    </section>
  );
}
