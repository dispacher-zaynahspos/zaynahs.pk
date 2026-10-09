'use client';

/**
 * Universal Fly / Drop Animation System
 * Single Source of Truth (SSOT) for product card "Add to Cart" and "Wishlist" animations.
 *
 * Supports:
 * - Desktop screens: Silky smooth, slower parabolic rainbow toss arc to header icons (840ms-960ms)
 * - Mobile / tablet: Responsive gravity drop into sticky bottom navigation bar (720ms)
 * - True mathematical physics trajectory with zero layout thrashing or compositor clipping
 * - Web Animations API (WAAPI) engine with 30 keyframe interpolation steps for 60fps/120fps isolation
 * - Automatic visible target resolution (never fails silently on hidden or scrolled IDs)
 * - Automatic source element fallback from product ID, image, or event
 * - Target celebratory bucket bounce & badge pop on arrival
 */

export type FlyTargetKind = 'cart' | 'wishlist' | string;

/**
 * Helper to test if an element is currently rendered, has dimension, and is visible.
 */
function isElementVisible(el: HTMLElement | null): boolean {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  if (typeof window !== 'undefined') {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
  }
  return true;
}

/**
 * Intelligently resolve the most appropriate, visible target element in the DOM.
 */
export function resolveFlyTarget(target: FlyTargetKind = 'cart'): HTMLElement | null {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;

  const isMobile = window.innerWidth < 768;

  // If a specific element ID was requested and it's visible, check it first
  if (target !== 'cart' && target !== 'wishlist') {
    const specific = document.getElementById(target);
    if (isElementVisible(specific)) return specific;
  }

  const isCart = target === 'cart' || (typeof target === 'string' && target.toLowerCase().includes('cart'));

  if (isCart) {
    const candidates = isMobile
      ? [
          'mobile-bottom-cart-icon',
          'header-cart-icon-desktop',
          'header-cart-icon-mobile',
        ]
      : [
          'header-cart-icon-desktop',
          'mobile-bottom-cart-icon',
          'header-cart-icon-mobile',
        ];

    for (const id of candidates) {
      const el = document.getElementById(id);
      if (isElementVisible(el)) return el;
    }

    // Fallback 1: any link or button for cart that is visible
    const queryEls = document.querySelectorAll('a[href="/cart"], button[aria-label*="cart" i], [data-cart-icon]');
    for (const qEl of Array.from(queryEls)) {
      if (qEl instanceof HTMLElement && isElementVisible(qEl)) return qEl;
    }

    // Fallback 2: Any matching ID element even if dimensions pending
    for (const id of candidates) {
      const el = document.getElementById(id);
      if (el) return el;
    }
  } else {
    // Wishlist target
    const candidates = isMobile
      ? [
          'mobile-bottom-wishlist-icon',
          'header-wishlist-icon-desktop',
          'header-wishlist-icon-mobile',
        ]
      : [
          'header-wishlist-icon-desktop',
          'mobile-bottom-wishlist-icon',
          'header-wishlist-icon-mobile',
        ];

    for (const id of candidates) {
      const el = document.getElementById(id);
      if (isElementVisible(el)) return el;
    }

    // Fallback 1: any link or button for wishlist that is visible
    const queryEls = document.querySelectorAll('a[href="/wishlist"], button[aria-label*="wishlist" i], [data-wishlist-icon]');
    for (const qEl of Array.from(queryEls)) {
      if (qEl instanceof HTMLElement && isElementVisible(qEl)) return qEl;
    }

    // Fallback 2: Any matching ID element even if dimensions pending
    for (const id of candidates) {
      const el = document.getElementById(id);
      if (el) return el;
    }
  }

  return null;
}

/**
 * Resolve the source element for the fly animation from event, element, or product ID.
 */
export function resolveSourceElement(
  source?: HTMLElement | React.MouseEvent | null,
  productId?: string
): HTMLElement | null {
  if (source) {
    if (source instanceof HTMLElement) {
      const rect = source.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return source;
    }
    if ('currentTarget' in source && source.currentTarget instanceof HTMLElement) {
      const target = source.currentTarget;
      const rect = target.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return target;
    }
    if ('target' in source && source.target instanceof HTMLElement) {
      const closest = source.target.closest('button, [data-product-id], article, .pc, .z-card-container') || source.target;
      if (closest instanceof HTMLElement) {
        const rect = closest.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) return closest;
      }
    }
  }

  if (productId && typeof document !== 'undefined') {
    // Check for card wrapper or buttons/images inside the card
    const cardEl =
      document.querySelector(`[data-product-id="${productId}"] img, [data-product-id="${productId}"] button.cart, [data-product-id="${productId}"] button.wish, [data-product-id="${productId}"]`) ||
      document.getElementById(`product-card-${productId}`);
    if (cardEl instanceof HTMLElement) {
      const rect = cardEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return cardEl;
    }
  }

  return null;
}

/**
 * Main animation launcher: creates a 60fps/120fps flying thumbnail that travels
 * in a smooth parametric parabolic arc/drop to the target icon and triggers a bounce on landing.
 */
export function animateFlyTo(
  source: HTMLElement | React.MouseEvent | null | undefined,
  target: FlyTargetKind = 'cart',
  itemImage?: string | null,
  productId?: string
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const isMobile = window.innerWidth < 768;
  const isWishlist = target === 'wishlist' || (typeof target === 'string' && target.toLowerCase().includes('wishlist'));

  // 1. Resolve Target Element and Coordinates
  const targetElement = resolveFlyTarget(target);
  let targetCenterX = isMobile ? window.innerWidth / 2 : window.innerWidth - 65;
  let targetCenterY = isMobile ? window.innerHeight - 38 : 28;

  if (targetElement) {
    const tRect = targetElement.getBoundingClientRect();
    if (tRect.width > 0 && tRect.height > 0) {
      targetCenterX = tRect.left + tRect.width / 2;
      targetCenterY = tRect.top + tRect.height / 2;
    }
  }

  // Desktop safety clamp: if header icon is scrolled above top of viewport, clamp to visible top edge
  if (!isMobile && targetCenterY < 20) {
    targetCenterY = 28;
  }

  // 2. Resolve Source Element and Coordinates
  const resolvedSource = resolveSourceElement(source, productId);
  let sourceCenterX = window.innerWidth / 2;
  let sourceCenterY = window.innerHeight / 2;

  if (resolvedSource) {
    // If the resolved element is a large card or container, find its thumbnail image for tighter origin
    let preciseOrigin: HTMLElement = resolvedSource;
    if (resolvedSource.tagName === 'ARTICLE' || resolvedSource.classList.contains('pc') || resolvedSource.classList.contains('z-card-container')) {
      const cardImg = resolvedSource.querySelector('img');
      if (cardImg instanceof HTMLElement && cardImg.getBoundingClientRect().width > 0) {
        preciseOrigin = cardImg;
      }
    }
    const sRect = preciseOrigin.getBoundingClientRect();
    if (sRect.width > 0 && sRect.height > 0) {
      sourceCenterX = sRect.left + sRect.width / 2;
      sourceCenterY = sRect.top + sRect.height / 2;
    }
  }

  // Adaptive bubble dimensions: 52px on desktop for high-delight product visual, 42px on mobile
  const SIZE = isMobile ? 42 : 52;
  const HALF_SIZE = SIZE / 2;

  const startX = sourceCenterX - HALF_SIZE;
  const startY = sourceCenterY - HALF_SIZE;
  const endX = targetCenterX - HALF_SIZE;
  const endY = targetCenterY - HALF_SIZE;

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  const isDroppingDown = deltaY > 0;
  const distance = Math.hypot(deltaX, deltaY);

  // Calibrated timings:
  // Desktop: 840ms-960ms (slower, silky glide so customer clearly watches the product arc into the bag)
  // Mobile: 720ms for crisp, responsive native app gravity drop
  const DURATION = isMobile
    ? (isDroppingDown ? 720 : 750)
    : Math.min(960, Math.max(840, Math.round(distance * 0.95)));

  // 3. Create Flying Thumbnail DOM Node
  const bubble = document.createElement('div');
  bubble.style.position = 'fixed';
  bubble.style.top = '0px';
  bubble.style.left = '0px';
  bubble.style.width = `${SIZE}px`;
  bubble.style.height = `${SIZE}px`;
  bubble.style.borderRadius = '50%';
  bubble.style.zIndex = '2147483647'; // Maximum z-index above all overlays
  bubble.style.pointerEvents = 'none';
  bubble.style.display = 'flex';
  bubble.style.alignItems = 'center';
  bubble.style.justifyContent = 'center';
  bubble.style.background = '#ffffff';
  bubble.style.boxShadow = '0 12px 28px -4px rgba(0, 0, 0, 0.38), 0 4px 8px -2px rgba(0, 0, 0, 0.2)';
  bubble.style.border = '2.5px solid #ffffff';
  bubble.style.overflow = 'visible';
  bubble.style.willChange = 'transform, opacity';
  bubble.style.transform = `translate3d(${startX.toFixed(1)}px, ${startY.toFixed(1)}px, 0) scale(1)`;
  bubble.style.opacity = '1';

  // Inner product snapshot or stylized emblem
  if (itemImage && typeof itemImage === 'string' && itemImage.trim().length > 0) {
    const img = document.createElement('img');
    img.src = itemImage;
    img.alt = '';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '50%';
    img.style.display = 'block';
    bubble.appendChild(img);

    if (isWishlist) {
      const heartBadge = document.createElement('span');
      heartBadge.style.position = 'absolute';
      heartBadge.style.bottom = '1px';
      heartBadge.style.right = '1px';
      heartBadge.style.width = '16px';
      heartBadge.style.height = '16px';
      heartBadge.style.borderRadius = '50%';
      heartBadge.style.background = '#ef4444';
      heartBadge.style.color = '#ffffff';
      heartBadge.style.fontSize = '9px';
      heartBadge.style.fontWeight = 'bold';
      heartBadge.style.display = 'flex';
      heartBadge.style.alignItems = 'center';
      heartBadge.style.justifyContent = 'center';
      heartBadge.style.boxShadow = '0 1px 4px rgba(0,0,0,0.35)';
      heartBadge.innerText = '♥';
      bubble.appendChild(heartBadge);
    }
  } else {
    // Stylized fallback
    if (isWishlist) {
      bubble.innerHTML = '<span style="color: #ef4444; font-size: 22px; line-height: 1;">♥</span>';
    } else {
      bubble.style.background = 'var(--color-primary, #0f172a)';
      bubble.innerHTML = '<span style="color: white; font-size: 13px; font-weight: 900;">+1</span>';
    }
  }

  document.body.appendChild(bubble);

  // 4. Generate 30 Parametric Keyframe Coordinates (True Parabolic Physics)
  const steps = 30;
  const keyframes: Keyframe[] = [];

  // Parabolic crest height: lifts gracefully upward before diving into destination
  const arcPeak = isMobile
    ? (isDroppingDown ? 0 : 40)
    : Math.min(160, Math.max(50, Math.abs(deltaX) * 0.14));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // normalized time 0.0 -> 1.0

    let curX: number;
    let curY: number;

    if (isMobile && isDroppingDown) {
      // Natural gravity drop to bottom navigation bar
      const px = 1 - Math.pow(1 - t, 1.4);
      const py = Math.pow(t, 1.35); // accelerates smoothly downwards
      curX = startX + deltaX * px;
      curY = startY + deltaY * py;
    } else {
      // Majestic rainbow arc to top header icon (desktop or mobile top)
      const px = 1 - Math.pow(1 - t, 1.3); // smooth horizontal progression
      const py = 1 - Math.pow(1 - t, 1.45); // smooth vertical progression
      const lift = 4 * t * (1 - t) * arcPeak; // mathematical parabola cresting at midpoint
      curX = startX + deltaX * px;
      curY = startY + deltaY * py - lift;
    }

    // Scale progression: prominent product thumbnail for first 60%, then shrinks into target
    let curScale: number;
    if (t < 0.6) {
      curScale = 1 - 0.05 * (t / 0.6);
    } else {
      const st = (t - 0.6) / 0.4;
      curScale = 0.95 - 0.73 * Math.pow(st, 1.2); // scales down to 0.22
    }

    // Opacity: stays 100% visible for 82% of journey so user clearly sees it, fades at arrival
    let curOpacity = 1;
    if (t > 0.82) {
      curOpacity = Math.max(0, 1 - (t - 0.82) / 0.18);
    }

    keyframes.push({
      transform: `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0) scale(${curScale.toFixed(3)})`,
      opacity: Number(curOpacity.toFixed(3)),
    });
  }

  // 5. Cleanup & Celebratory Bucket Bounce Trigger
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (bubble.parentNode) {
      bubble.remove();
    }

    if (targetElement) {
      targetElement.classList.add('bucket-animate');
      const badge = targetElement.querySelector('span, [class*="rounded-full"]');
      if (badge instanceof HTMLElement) {
        badge.classList.add('bucket-animate');
      }

      setTimeout(() => {
        targetElement.classList.remove('bucket-animate');
        if (badge instanceof HTMLElement) {
          badge.classList.remove('bucket-animate');
        }
      }, 750);
    }
  };

  // 6. Execute via Web Animations API (WAAPI) for 60fps/120fps hardware-composited isolation
  if (typeof bubble.animate === 'function') {
    const animation = bubble.animate(keyframes, {
      duration: DURATION,
      fill: 'forwards',
      easing: 'linear',
    });
    animation.onfinish = cleanup;
  } else {
    // Fallback for environments lacking WAAPI
    setTimeout(cleanup, DURATION);
  }

  // Safety fallback timeout
  setTimeout(cleanup, DURATION + 120);
}

/**
 * Canonical helper for flying to Cart.
 */
export function flyToCart(
  source?: HTMLElement | React.MouseEvent | null,
  itemImage?: string | null,
  productId?: string
): void {
  animateFlyTo(source, 'cart', itemImage, productId);
}

/**
 * Canonical helper for flying to Wishlist.
 */
export function flyToWishlist(
  source?: HTMLElement | React.MouseEvent | null,
  itemImage?: string | null,
  productId?: string
): void {
  animateFlyTo(source, 'wishlist', itemImage, productId);
}
