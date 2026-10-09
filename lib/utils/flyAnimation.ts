'use client';

/**
 * Universal Fly / Drop Animation System
 * Single Source of Truth (SSOT) for product card "Add to Cart" and "Wishlist" animations.
 *
 * Supports:
 * - Mobile app bottom navigation bar (drop animation to bottom nav icons)
 * - Mobile & desktop header icons (arc fly animation to header icons)
 * - Automatic visible target resolution (never fails silently on hidden or missing IDs)
 * - Automatic source element fallback from product ID or event
 * - Native 60fps hardware-accelerated transforms
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
          'header-cart-icon-mobile',
          'header-cart-icon-desktop',
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

    // Fallback: any link to cart that is visible
    const queryEl = document.querySelector('a[href="/cart"], button[aria-label*="cart" i]');
    if (queryEl instanceof HTMLElement && isElementVisible(queryEl)) return queryEl;
  } else {
    // Wishlist target
    const candidates = isMobile
      ? [
          'mobile-bottom-wishlist-icon',
          'header-wishlist-icon-mobile',
          'header-wishlist-icon-desktop',
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

    // Fallback: any link to wishlist that is visible
    const queryEl = document.querySelector('a[href="/wishlist"], button[aria-label*="wishlist" i]');
    if (queryEl instanceof HTMLElement && isElementVisible(queryEl)) return queryEl;
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
    if ('currentTarget' in source && source.currentTarget instanceof HTMLElement) {
      const target = source.currentTarget;
      const rect = target.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return target;
    }
    if (source instanceof HTMLElement) {
      const rect = source.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return source;
    }
  }

  if (productId && typeof document !== 'undefined') {
    // Check for card wrapper or buttons inside the card
    const cardEl =
      document.querySelector(`[data-product-id="${productId}"] button.cart, [data-product-id="${productId}"] button.wish, [data-product-id="${productId}"] img, [data-product-id="${productId}"]`) ||
      document.getElementById(`product-card-${productId}`);
    if (cardEl instanceof HTMLElement) {
      const rect = cardEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return cardEl;
    }
  }

  return null;
}

/**
 * Main animation launcher: creates a 60fps flying thumbnail or badge that travels
 * in a smooth parabolic arc/drop to the target icon and triggers a bounce on landing.
 */
export function animateFlyTo(
  source: HTMLElement | React.MouseEvent | null | undefined,
  target: FlyTargetKind = 'cart',
  itemImage?: string | null,
  productId?: string
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const targetElement = resolveFlyTarget(target);
  if (!targetElement) return;

  const sourceElement = resolveSourceElement(source, productId);
  if (!sourceElement) return;

  const sourceRect = sourceElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();

  const isMobile = window.innerWidth < 768;
  // Adaptive bubble size: 48px on desktop (crisp product snapshot), 42px on mobile
  const SIZE = isMobile ? 42 : 48;
  const HALF_SIZE = SIZE / 2;

  const sourceX = sourceRect.left + sourceRect.width / 2 - HALF_SIZE;
  const sourceY = sourceRect.top + sourceRect.height / 2 - HALF_SIZE;
  const targetX = targetRect.left + targetRect.width / 2 - HALF_SIZE;
  const targetY = targetRect.top + targetRect.height / 2 - HALF_SIZE;

  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;

  const isDroppingDown = deltaY > 0;
  const distance = Math.hypot(deltaX, deltaY);

  // Desktop / catalog arc: slower & silkier so user clearly sees the product article glide across the screen
  // Mobile / bottom nav: 720-760ms for crisp, delightful native app drop
  const DURATION = isMobile
    ? (isDroppingDown ? 720 : 750)
    : Math.min(950, Math.max(840, Math.round(distance * 1.05)));

  // 1. Outer wrapper for X-axis travel
  const outer = document.createElement('div');
  outer.style.position = 'fixed';
  outer.style.top = `${sourceY}px`;
  outer.style.left = `${sourceX}px`;
  outer.style.width = `${SIZE}px`;
  outer.style.height = `${SIZE}px`;
  outer.style.zIndex = '999999'; // Above all sheets, modals (z-50/z-[200])
  outer.style.pointerEvents = 'none';
  outer.style.willChange = 'transform, opacity';
  outer.style.transform = 'translate3d(0, 0, 0)';
  outer.style.opacity = '1';

  // 2. Inner bubble for Y-axis travel and styling
  const inner = document.createElement('div');
  inner.style.width = '100%';
  inner.style.height = '100%';
  inner.style.borderRadius = '50%';
  inner.style.display = 'flex';
  inner.style.alignItems = 'center';
  inner.style.justifyContent = 'center';
  inner.style.background = '#ffffff';
  inner.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)';
  inner.style.border = '2.5px solid #ffffff';
  inner.style.overflow = 'hidden';
  inner.style.position = 'relative';
  inner.style.willChange = 'transform';
  inner.style.transform = 'translate3d(0, 0, 0) scale(1)';

  const isWishlist = target === 'wishlist' || (typeof target === 'string' && target.toLowerCase().includes('wishlist'));

  if (itemImage && typeof itemImage === 'string' && itemImage.trim().length > 0) {
    const img = document.createElement('img');
    img.src = itemImage;
    img.alt = '';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '50%';
    img.style.display = 'block';
    inner.appendChild(img);

    if (isWishlist) {
      const heartBadge = document.createElement('span');
      heartBadge.style.position = 'absolute';
      heartBadge.style.bottom = '1px';
      heartBadge.style.right = '1px';
      heartBadge.style.width = '14px';
      heartBadge.style.height = '14px';
      heartBadge.style.borderRadius = '50%';
      heartBadge.style.background = '#ef4444';
      heartBadge.style.color = '#ffffff';
      heartBadge.style.fontSize = '8px';
      heartBadge.style.fontWeight = 'bold';
      heartBadge.style.display = 'flex';
      heartBadge.style.alignItems = 'center';
      heartBadge.style.justifyContent = 'center';
      heartBadge.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
      heartBadge.innerText = '♥';
      inner.appendChild(heartBadge);
    }
  } else {
    // Stylized fallback
    if (isWishlist) {
      inner.innerHTML = '<span style="color: #ef4444; font-size: 18px; line-height: 1;">♥</span>';
    } else {
      inner.style.background = 'var(--color-primary, #0f172a)';
      inner.innerHTML = '<span style="color: white; font-size: 11px; font-weight: 900;">+1</span>';
    }
  }

  outer.appendChild(inner);
  document.body.appendChild(outer);

  // Force synchronous reflow to establish initial render state
  outer.getBoundingClientRect();

  // Parabolic easing curves:
  // When flying up to top header: smooth arched decelerated toss (lifts, crests, glides into bucket)
  // When dropping down to bottom nav: smooth accelerated gravity curve
  const xTiming = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
  const yTiming = isDroppingDown
    ? 'cubic-bezier(0.42, 0, 0.28, 1)'
    : 'cubic-bezier(0.04, 0.72, 0.32, 1.1)';

  // Schedule transition on next paint frame to guarantee CSS transition triggers
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      outer.style.transition = `transform ${DURATION}ms ${xTiming}, opacity ${DURATION}ms cubic-bezier(0.4, 0, 1, 1)`;
      inner.style.transition = `transform ${DURATION}ms ${yTiming}`;

      outer.style.transform = `translate3d(${deltaX}px, 0, 0)`;
      outer.style.opacity = '0.15';
      inner.style.transform = `translate3d(0, ${deltaY}px, 0) scale(0.2)`;
    });
  });

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (outer.parentNode) {
      outer.remove();
    }
    // Trigger celebratory bucket bounce & badge pop on target element and badge
    targetElement.classList.add('bucket-animate', 'animate-bounce-bounce');
    const badge = targetElement.querySelector('span, [class*="rounded-full"]');
    if (badge instanceof HTMLElement) {
      badge.classList.add('bucket-animate');
    }

    setTimeout(() => {
      targetElement.classList.remove('bucket-animate', 'animate-bounce-bounce');
      if (badge instanceof HTMLElement) {
        badge.classList.remove('bucket-animate');
      }
    }, 750);
  };

  outer.addEventListener('transitionend', (e) => {
    if (e.target === outer) {
      cleanup();
    }
  });

  // Safety fallback cleanup in case tab is blurred or transitionend doesn't fire
  setTimeout(() => {
    cleanup();
  }, DURATION + 100);
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
