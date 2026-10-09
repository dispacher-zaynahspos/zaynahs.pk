'use client';

/**
 * Universal Fly / Drop Animation System
 * Single Source of Truth (SSOT) for product card "Add to Cart" and "Wishlist" animations.
 *
 * Supports:
 * - Desktop screens: Silky smooth parabolic rainbow toss arc to header icons (760ms-920ms)
 * - Mobile / tablet: Responsive gravity drop into sticky bottom navigation bar (680ms)
 *   or upward arc to header when bottom nav is absent.
 * - True mathematical physics trajectory with zero layout thrashing or compositor clipping
 * - Web Animations API (WAAPI) engine with 30 keyframe interpolation steps for 60fps/120fps isolation
 * - Automatic visible target resolution with guaranteed viewport boundary clamping (never flies off-screen)
 * - Automatic source element fallback from product ID, image, or event
 * - Target celebratory bucket bounce & badge pop on arrival
 */

export type FlyTargetKind = 'cart' | 'wishlist' | string;

/**
 * Helper to test if an element is currently connected to the DOM and rendered (not display: none).
 */
function isElementRendered(el: HTMLElement | null): boolean {
  if (!el || typeof el.isConnected === 'boolean' && !el.isConnected) return false;
  if (typeof window !== 'undefined') {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (parseFloat(style.opacity || '1') === 0) return false;
  }
  return true;
}

/**
 * Intelligently resolve the most appropriate, rendered target element in the DOM.
 */
export function resolveFlyTarget(target: FlyTargetKind = 'cart'): HTMLElement | null {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;

  const isMobile = window.innerWidth < 768;

  // If a specific element ID was requested and it is rendered, return it
  if (target !== 'cart' && target !== 'wishlist') {
    const specific = document.getElementById(target);
    if (isElementRendered(specific)) return specific;
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
          'header-cart-icon-mobile',
          'mobile-bottom-cart-icon',
        ];

    for (const id of candidates) {
      const el = document.getElementById(id);
      if (isElementRendered(el)) return el;
    }

    // Fallback 1: any link or button for cart that is rendered
    const queryEls = document.querySelectorAll('a[href="/cart"], button[aria-label*="cart" i], [data-cart-icon]');
    for (const qEl of Array.from(queryEls)) {
      if (qEl instanceof HTMLElement && isElementRendered(qEl)) return qEl;
    }

    // Fallback 2: Any matching ID element even if style check is pending
    for (const id of candidates) {
      const el = document.getElementById(id);
      if (el) return el;
    }
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
          'header-wishlist-icon-mobile',
          'mobile-bottom-wishlist-icon',
        ];

    for (const id of candidates) {
      const el = document.getElementById(id);
      if (isElementRendered(el)) return el;
    }

    // Fallback 1: any link or button for wishlist that is rendered
    const queryEls = document.querySelectorAll('a[href="/wishlist"], button[aria-label*="wishlist" i], [data-wishlist-icon]');
    for (const qEl of Array.from(queryEls)) {
      if (qEl instanceof HTMLElement && isElementRendered(qEl)) return qEl;
    }

    // Fallback 2: Any matching ID element even if style check is pending
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
      const closest = source.target.closest('button, [data-product-id], article, .pc, .z-card-container, .group') || source.target;
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

  const winW = window.innerWidth || document.documentElement.clientWidth || 390;
  const winH = window.innerHeight || document.documentElement.clientHeight || 844;
  const isMobile = winW < 768;
  const isWishlist = target === 'wishlist' || (typeof target === 'string' && target.toLowerCase().includes('wishlist'));

  // 1. Resolve Target Element and Coordinates
  const targetElement = resolveFlyTarget(target);
  const isBottomNavTarget = Boolean(
    isMobile && targetElement && (
      targetElement.id.startsWith('mobile-bottom-') ||
      targetElement.closest('nav[aria-label*="Mobile Bottom" i]')
    )
  );

  // Robust default coordinate baselines
  let targetCenterX = isMobile
    ? (isBottomNavTarget
        ? (isWishlist ? Math.round(winW * 0.5) : Math.round(winW * 0.72))
        : (isWishlist ? Math.max(30, winW - 95) : Math.max(30, winW - 50)))
    : (isWishlist ? Math.max(30, winW - 110) : Math.max(30, winW - 65));

  let targetCenterY = isBottomNavTarget
    ? Math.max(30, winH - 34)
    : 28;

  if (targetElement) {
    const tRect = targetElement.getBoundingClientRect();
    if (tRect.width > 0 || tRect.height > 0) {
      const measuredX = tRect.left + (tRect.width || 36) / 2;
      const measuredY = tRect.top + (tRect.height || 36) / 2;
      if (Number.isFinite(measuredX) && measuredX > 0 && measuredX < winW + 50) {
        targetCenterX = measuredX;
      }
      if (Number.isFinite(measuredY)) {
        targetCenterY = measuredY;
      }
    }
  }

  // Safety clamps: guarantee target coordinate ALWAYS resides on-screen
  if (isBottomNavTarget) {
    targetCenterY = Math.min(winH - 18, Math.max(winH - 56, targetCenterY));
  } else {
    // Header icon: if scrolled off screen or unpinned, clamp directly to top header bar zone
    if (targetCenterY < 15 || targetCenterY > 120) {
      targetCenterY = 28;
    }
  }
  targetCenterX = Math.max(25, Math.min(winW - 25, targetCenterX));

  // 2. Resolve Source Element and Coordinates
  const resolvedSource = resolveSourceElement(source, productId);
  let sourceCenterX = winW / 2;
  let sourceCenterY = winH / 2;

  if (resolvedSource) {
    let preciseOrigin: HTMLElement = resolvedSource;
    if (
      resolvedSource.tagName === 'ARTICLE' ||
      resolvedSource.classList.contains('pc') ||
      resolvedSource.classList.contains('z-card-container') ||
      resolvedSource.classList.contains('group')
    ) {
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

  // Source boundary clamp: ensure origin is inside the visible viewport
  sourceCenterX = Math.max(20, Math.min(winW - 20, sourceCenterX));
  sourceCenterY = Math.max(20, Math.min(winH - 20, sourceCenterY));

  // Adaptive bubble dimensions: 52px on desktop for delight, 42px on mobile
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
  // Desktop: 780ms-920ms (smooth, silky parabolic arc)
  // Mobile: 680ms for responsive gravity drop into sticky bottom bar
  const DURATION = isMobile
    ? (isDroppingDown ? 680 : 720)
    : Math.min(920, Math.max(760, Math.round(distance * 0.92)));

  // 3. Create Flying Thumbnail DOM Node
  const bubble = document.createElement('div');
  bubble.style.position = 'fixed';
  bubble.style.top = '0px';
  bubble.style.left = '0px';
  bubble.style.width = `${SIZE}px`;
  bubble.style.height = `${SIZE}px`;
  bubble.style.borderRadius = '50%';
  bubble.style.zIndex = '2147483647'; // Maximum z-index above all modals & sticky overlays
  bubble.style.pointerEvents = 'none';
  bubble.style.display = 'flex';
  bubble.style.alignItems = 'center';
  bubble.style.justifyContent = 'center';
  bubble.style.background = '#ffffff';
  bubble.style.boxShadow = '0 12px 28px -4px rgba(0, 0, 0, 0.42), 0 4px 10px -2px rgba(0, 0, 0, 0.22)';
  bubble.style.border = '2.5px solid #ffffff';
  bubble.style.overflow = 'visible';
  bubble.style.willChange = 'transform, opacity';
  bubble.style.transform = `translate3d(${startX.toFixed(1)}px, ${startY.toFixed(1)}px, 0) scale(1)`;
  bubble.style.opacity = '1';

  // Inner product snapshot or stylized fallback emblem
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

  // 4. Generate 30 Parametric Keyframe Coordinates (Physics Parabola)
  const steps = 30;
  const keyframes: Keyframe[] = [];

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

    // Opacity: stays 100% visible for 82% of journey, fades smoothly at landing
    let curOpacity = 1;
    if (t > 0.82) {
      curOpacity = Math.max(0, 1 - (t - 0.82) / 0.18);
    }

    const safeX = Number.isFinite(curX) ? curX : endX;
    const safeY = Number.isFinite(curY) ? curY : endY;
    const safeScale = Number.isFinite(curScale) ? curScale : 0.5;
    const safeOpacity = Number.isFinite(curOpacity) ? curOpacity : 1;

    keyframes.push({
      transform: `translate3d(${safeX.toFixed(1)}px, ${safeY.toFixed(1)}px, 0) scale(${safeScale.toFixed(3)})`,
      opacity: Number(safeOpacity.toFixed(3)),
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
      const badge = targetElement.querySelector('span, [class*="rounded-full"], .nav-count-badge');
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

    // Dispatch custom event for any listening UI elements
    try {
      window.dispatchEvent(new CustomEvent('bucket-bounce', { detail: { target } }));
    } catch {}
  };

  // 6. Execute via Web Animations API (WAAPI) for 60fps/120fps hardware-composited isolation
  if (typeof bubble.animate === 'function') {
    try {
      const animation = bubble.animate(keyframes, {
        duration: DURATION,
        fill: 'forwards',
        easing: 'linear',
      });
      animation.onfinish = cleanup;
      animation.oncancel = cleanup;
    } catch {
      cleanup();
    }
  } else {
    // Fallback for environments lacking WAAPI
    setTimeout(cleanup, DURATION);
  }

  // Safety fallback timeout
  setTimeout(cleanup, DURATION + 150);
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
