'use client';
import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils/whatsapp';
import { useMobileCardFocus } from '@/lib/hooks/useMobileCardFocus';
import { useCartStore } from '@/store/cartStore';
import { useWishlist } from '@/components/store/product-card/hooks/useWishlist';
import { animateFlyTo } from '@/lib/utils/flyAnimation';
import variants from './card-variants.json';

import type { CardProduct, CardVariant } from './types';
import { getSharedTitleClampClass } from '@/lib/utils/styles';
import type { StoreSettings } from '@/lib/types';

const QuickViewModal = dynamic(() => import('@/components/store/QuickViewModal'), { ssr: false, loading: () => null });

const money = (n: number, symbol?: string) => formatPrice(n, symbol);
const bg = (c: { color: string; color2?: string }) => c.color2 ? `linear-gradient(135deg,${c.color} 50%,${c.color2} 50%)` : c.color;
const Svg = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
const D = { heart: 'M12 20.5s-8-4.9-9-10C2.4 7 4.5 4.5 7.3 4.5c1.9 0 3.5 1 4.7 2.7 1.2-1.7 2.8-2.7 4.7-2.7 2.8 0 4.9 2.5 4.3 6-1 5.1-9 10-9 10z', eye: 'M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12zM12 9a3 3 0 100 6 3 3 0 000-6z', bag: 'M5 8h14l1 13H4zM8.5 8V6a3.5 3.5 0 017 0v2', l: 'M15 5l-7 7 7 7', r: 'M9 5l7 7-7 7' };

export function ProductCard({ product: p, variant, limit, currencySymbol, cardMobileActivation = 'scroll', settings, originalSettings, onWishlist, onQuickView, onAddToCart }: {
  product: CardProduct; variant: CardVariant; limit: number; currencySymbol?: string; cardMobileActivation?: 'scroll' | 'touch' | 'off'; settings?: { title_line_limit?: string } & Record<string, any> | null; originalSettings?: StoreSettings | null;
  onWishlist?: (p: CardProduct) => void; onQuickView?: (p: CardProduct) => void; onAddToCart?: (p: CardProduct) => void;
}) {
  const v = variants[variant];
  const { cardRef, setManualFocus } = useMobileCardFocus<HTMLElement>(cardMobileActivation);
  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleWishlist } = useWishlist(p.id, p.image);
  const [sel, setSel] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isArrowNavActive, setIsArrowNavActive] = useState(false);
  const [lastPropImage, setLastPropImage] = useState(p.image);
  const [userSelected, setUserSelected] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const galleryImages = (p.images && p.images.length > 0)
    ? p.images
    : ([p.image, p.image2].filter(Boolean) as string[]);

  if (p.image !== lastPropImage) {
    setLastPropImage(p.image);
    setIsArrowNavActive(false);
    const foundIdx = galleryImages.indexOf(p.image);
    setGalleryIndex(foundIdx >= 0 ? foundIdx : 0);
  }

  const sale = !!p.compareAt && p.compareAt > p.price;
  const pct = sale ? Math.round(((p.compareAt! - p.price) / p.compareAt!) * 100) : 0;
  const badge = sale ? `-${pct}%` : p.badge || '';
  const shown = p.swatches.slice(0, limit);

  let img1: string;
  if (isArrowNavActive && galleryImages[galleryIndex]) {
    img1 = galleryImages[galleryIndex];
  } else if (p.swatchNode !== undefined) {
    img1 = (p.image || p.swatches[sel]?.image) as string;
  } else {
    img1 = (p.swatches[sel]?.image || p.image) as string;
  }

  const hasArrows = (variant === '07' || variant === '08' || Boolean((v as Record<string, any>)?.arrows)) && galleryImages.length > 1;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsArrowNavActive(true);
    setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsArrowNavActive(true);
    setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const stars = <span className="stars" style={{ '--r': p.rating || 0 } as React.CSSProperties}><i /></span>;

  const titleClampClass = getSharedTitleClampClass(settings?.title_line_limit);
  const vendor = <div className="el vendor">{p.vendor}</div>;
  const rating = <div className="el rating">{stars}{!!p.rating && <small>({p.reviewCount ?? p.rating})</small>}</div>;
  const title = <Link className={`el title ttl ${titleClampClass}`} href={p.href}>{p.title}</Link>;
  const desc = <div className="el desc">{p.description}</div>;
  const price = (
    <div className={`el price${sale ? ' on-sale' : ''}`}>
      {p.hasPriceRange && <span className="from">From</span>}
      <span className="sale">{money(p.price, currencySymbol)}</span>
      {sale && <><span className="old">{money(p.compareAt!, currencySymbol)}</span></>}
    </div>
  );
  const more = null;
  const sw = p.swatchNode !== undefined ? (
    <div className="el swatches">{p.swatchNode}</div>
  ) : (
    <div className="el swatches">
      {shown.length > 0 && <div className="sws">
        {shown.map((c, i) => <span key={i} className={`sw${i === sel ? ' on' : ''}`} style={{ '--c': bg(c) } as React.CSSProperties}
          onMouseEnter={() => {
            setSel(i);
            setIsArrowNavActive(false);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSel(i);
            setUserSelected(true);
            setIsArrowNavActive(false);
            const swatchImg = p.swatches[i]?.image;
            if (swatchImg) {
              const idx = galleryImages.indexOf(swatchImg);
              if (idx >= 0) setGalleryIndex(idx);
            }
          }} />)}
        {p.swatches.length > limit && <span className="more">+{p.swatches.length - limit}</span>}
      </div>}
    </div>
  );
  const body = v.lock === '04' ? <><div className="vrow">{vendor}{rating}</div>{title}{desc}{price}{sw}</>
    : v.lock === '05' ? <>{vendor}{sw}{title}{desc}{price}<div className="brow">{rating}{more}</div></>
    : <>{vendor}{rating}{title}{desc}{price}{sw}{more}</>;

  const handleDefaultAddToCart = (target: HTMLElement) => {
    if (p.source?.has_variants) {
      setQuickViewOpen(true);
      return;
    }
    if (p.source) {
      addItem(p.source, undefined, [], 1);
      toast.success(`${p.title} added to cart!`);
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      animateFlyTo(target, isMobile ? 'header-cart-icon-mobile' : 'header-cart-icon-desktop', p.image);
    }
  };

  return (
    <>
      <article className="pc" ref={cardRef} onPointerDown={(e) => { if (e.pointerType === 'touch') setManualFocus(); }}>
      <div className="pc-media">
        <Link className="ovl" href={p.href} aria-label={p.title} />
        <img className="i1" src={img1} alt="" loading="lazy" />
        {p.image2 && !userSelected && !isArrowNavActive && <img className="i2" src={p.image2} alt="" loading="lazy" />}
        {badge && <span className={`badge b-${badge.replace(/[^a-z]/gi, '').toLowerCase() || 'pct'}`}>{badge}</span>}
        {hasArrows && (
          <>
            <button className="nav l" type="button" aria-label="Previous" onClick={handlePrevImage}><Svg d={D.l} /></button>
            <button className="nav r" type="button" aria-label="Next" onClick={handleNextImage}><Svg d={D.r} /></button>
          </>
        )}
        {/* UNIFIED ACTION RAIL: wishlist + quick view + cart ek container, saath spawn */}
        <div className="pc-actions">
          <button type="button" className={`act wish${isInWishlist ? ' on' : ''}`} aria-label="Add to wishlist" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (onWishlist) { onWishlist(p); return; } toggleWishlist(e as unknown as React.MouseEvent); }}><Svg d={D.heart} /><span className="lbl">Add to wishlist</span></button>
          <button type="button" className="act qv" aria-label="Quick view" onClick={e => { e.preventDefault(); e.stopPropagation(); if (onQuickView) { onQuickView(p); return; } setQuickViewOpen(true); }}><Svg d={D.eye} /><span className="lbl">Quick view</span></button>
          {!v.cta && <button type="button" className="act cart" aria-label="Add to cart" onClick={e => { e.preventDefault(); e.stopPropagation(); if (onAddToCart) { onAddToCart(p); return; } handleDefaultAddToCart(e.currentTarget); }}><Svg d={D.bag} /><span className="lbl">ADD TO CART</span></button>}
          {!!v.hstars && <div className="hstars">{stars}</div>}
        </div>
      </div>
      <div className={`pc-body${v.lock ? " locked" : ""}`}>
        {body}
        {!!v.cta && <button type="button" className="cta cart" onClick={(e) => { if (onAddToCart) { onAddToCart(p); return; } handleDefaultAddToCart(e.currentTarget); }}>ADD TO CART</button>}
      </div>
    </article>
      {quickViewOpen && p.source && originalSettings && (
        <QuickViewModal product={p.source} settings={originalSettings} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
}
