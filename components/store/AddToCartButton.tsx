'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ShoppingCart } from '@/components/common/Icons';

export interface AddToCartButtonProps {
  /** The animation style from settings (defaults to 'default') */
  animation?: string;
  /** Whether the product is out of stock */
  isOutOfStock?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is visually faded (e.g. unselected variable product) */
  isFaded?: boolean;
  /** Primary click handler which performs addItem and flyToCart */
  onAddToCart: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Custom button text */
  label?: string;
  /** Custom success text */
  addedLabel?: string;
  /** Additional custom classNames */
  className?: string;
  /** Optional inline styles (e.g. background overrides) */
  style?: React.CSSProperties;
  /** Optional custom icon */
  icon?: React.ReactNode;
  /** Compact or icon-only mode */
  variant?: 'full' | 'icon';
  /** Button title / aria-label */
  title?: string;
  /** Element ID */
  id?: string;
}

/**
 * AddToCartButton — SSOT Reusable Add-to-Cart Button with 12 Tactile Animations (RULE DS24).
 *
 * Linked dynamically to store theme variables:
 * - --btn-primary-bg, --color-primary
 * - --btn-primary-text
 * - --border-radius-btn
 * - --color-success (#22c55e)
 *
 * Supported styles:
 * 'default', 'morph_check', 'roll_swap', 'ripple', 'border_draw', 'key_press',
 * 'jelly', 'plus_float', 'curtains', 'dots_tick', 'plus_tick', 'sparkle'.
 */
export function AddToCartButton({
  animation = 'default',
  isOutOfStock = false,
  disabled = false,
  isFaded = false,
  onAddToCart,
  label = 'Add to Cart',
  addedLabel = 'Added to Cart',
  className = '',
  style,
  icon,
  variant = 'full',
  title,
  id,
}: AddToCartButtonProps) {
  const [active, setActive] = useState(false);
  const [morphState, setMorphState] = useState<'idle' | 'load' | 'ok' | 'expand'>('idle');
  const [plusCount, setPlusCount] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const timerRefs = useRef<NodeJS.Timeout[]>([]);

  const isDisabled = disabled || isOutOfStock;
  const fadedClass = isFaded ? 'opacity-40 grayscale-[20%] saturate-50 hover:opacity-60 transition-all duration-300' : 'transition-all duration-300';

  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(t => clearTimeout(t));
    timerRefs.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const triggerMorphCheck = useCallback(() => {
    clearTimers();
    setMorphState('load');

    // 1. ok + checkmark + particle burst
    const t1 = setTimeout(() => {
      setMorphState('ok');

      // Ring pulse
      if (ringRef.current && typeof ringRef.current.animate === 'function') {
        ringRef.current.animate(
          [
            { opacity: 0.9, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(2.8)' },
          ],
          { duration: 600, easing: 'ease-out' }
        );
      }

      // Particle dots
      if (wrapRef.current) {
        const wrap = wrapRef.current;
        const colors = ['#22c55e', '#ff9139', '#ffd166', '#06d6a0'];
        for (let i = 0; i < 12; i++) {
          const dot = document.createElement('i');
          dot.style.position = 'absolute';
          dot.style.left = '50%';
          dot.style.top = '50%';
          dot.style.width = '7px';
          dot.style.height = '7px';
          dot.style.margin = '-3.5px 0 0 -3.5px';
          dot.style.borderRadius = '50%';
          dot.style.pointerEvents = 'none';
          dot.style.zIndex = '12';
          dot.style.backgroundColor = colors[i % 4];
          wrap.appendChild(dot);

          const angle = (Math.PI * 2 * i) / 12;
          const dist = 38 + Math.random() * 20;

          if (typeof dot.animate === 'function') {
            dot.animate(
              [
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                {
                  transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0.2)`,
                  opacity: 0,
                },
              ],
              { duration: 550, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' }
            ).onfinish = () => dot.remove();
          } else {
            setTimeout(() => dot.remove(), 550);
          }
        }
      }

      // Button bounce
      if (btnRef.current && typeof btnRef.current.animate === 'function') {
        btnRef.current.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.15)' },
            { transform: 'scale(0.96)' },
            { transform: 'scale(1)' },
          ],
          { duration: 400, easing: 'ease-out' }
        );
      }
    }, 380);

    // 2. Expand back to full width green
    const t2 = setTimeout(() => {
      setMorphState('expand');
    }, 850);

    // 3. Revert back to idle
    const t3 = setTimeout(() => {
      setMorphState('idle');
      setActive(false);
    }, 1500);

    timerRefs.current.push(t1, t2, t3);
  }, [clearTimers]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;

    // Trigger parent ATC & flyToCart
    onAddToCart(e);

    // If none/default style or already animating, don't replay morph
    if (animation === 'default' || animation === 'none' || active) return;

    setActive(true);

    if (animation === 'morph_check') {
      triggerMorphCheck();
      return;
    }

    // Ripple click coordinates
    if (animation === 'ripple' && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      btnRef.current.style.setProperty('--x', `${e.clientX - rect.left}px`);
      btnRef.current.style.setProperty('--y', `${e.clientY - rect.top}px`);
    }

    if (animation === 'plus_float') {
      setPlusCount(c => c + 1);
    }

    // Duration mapping for clean auto-reset
    const durations: Record<string, number> = {
      roll_swap: 1400,
      ripple: 1600,
      border_draw: 1600,
      key_press: 1500,
      jelly: 1200,
      plus_float: 1400,
      curtains: 1600,
      dots_tick: 1600,
      plus_tick: 1400,
      sparkle: 1400,
    };

    const duration = durations[animation] || 1400;
    const t = setTimeout(() => {
      setActive(false);
    }, duration);
    timerRefs.current.push(t);
  };

  const displayText = isOutOfStock ? 'Out of Stock' : label;

  // Icon-only variant (for compact mobile bars)
  if (variant === 'icon') {
    return (
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        title={title || displayText}
        aria-label={title || displayText}
        style={{
          backgroundColor: isOutOfStock ? undefined : 'var(--btn-primary-bg, var(--color-primary, #C2185B))',
          color: 'var(--btn-primary-text, #ffffff)',
          ...style,
        }}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md active:scale-90 transition-all cursor-pointer flex-shrink-0 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${
          active ? 'scale-110' : ''
        } ${fadedClass} ${className}`}
      >
        {icon || <ShoppingCart className="h-4.5 w-4.5 stroke-[2.2]" />}
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-[#16162a] text-[var(--color-primary,#C2185B)] font-black text-[10px] shadow-xs leading-none border border-black/10 dark:border-white/10">
          +
        </span>
      </button>
    );
  }

  // 1. MORPH CHECK
  if (animation === 'morph_check') {
    return (
      <div ref={wrapRef} className="atc-morph-wrap">
        <span ref={ringRef} className="atc-morph-ring" />
        <button
          ref={btnRef}
          id={id}
          type="button"
          data-state={morphState}
          disabled={isDisabled}
          onClick={handleClick}
          style={style}
          className={`atc-btn atc-morph shadow-md ${className}`}
        >
          <span className="atc-lay atc-lbl-idle">
            {icon || <ShoppingCart className="atc-svg-icon" />}
            <span>{displayText}</span>
          </span>

          <span className="atc-lay atc-lbl-success opacity-0">
            <svg className="atc-svg-icon" viewBox="0 0 24 24">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            <span>{addedLabel}</span>
          </span>

          <svg className="atc-spin" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" />
          </svg>

          <svg className="atc-ck" viewBox="0 0 24 24">
            <path pathLength="1" d="M5.5 12.5l4.3 4.3L18.5 8" />
          </svg>
        </button>
      </div>
    );
  }

  // 2. ROLL SWAP
  if (animation === 'roll_swap') {
    return (
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        style={style}
        className={`atc-btn atc-b1 shadow-md ${active ? 'atc-active' : ''} ${className}`}
      >
        <span className="atc-lay">
          <span className="atc-ic">
            <span className="atc-r1">
              {icon || <ShoppingCart className="atc-svg-icon" />}
              <svg className="atc-svg-icon atc-ckd" viewBox="0 0 24 24">
                <path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
          </span>
          <span className="atc-tx">
            <span className="atc-r2">
              <span className="block h-6 leading-6">{displayText}</span>
              <span className="block h-6 leading-6">{addedLabel}</span>
            </span>
          </span>
        </span>
      </button>
    );
  }

  // 3. CLICK RIPPLE
  if (animation === 'ripple') {
    return (
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        style={style}
        className={`atc-btn atc-b2 shadow-md ${active ? 'atc-active' : ''} ${className}`}
      >
        <span className="atc-lay atc-t1">
          {icon || <ShoppingCart className="atc-svg-icon" />}
          <span>{displayText}</span>
        </span>
        <span className="atc-lay atc-t2">
          <svg className="atc-svg-icon" viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>{addedLabel}</span>
        </span>
      </button>
    );
  }

  // 4. BORDER DRAW
  if (animation === 'border_draw') {
    return (
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        style={style}
        className={`atc-btn atc-b3 shadow-md ${active ? 'atc-active' : ''} ${className}`}
      >
        <svg className="atc-bd">
          <rect pathLength="1" x="2" y="2" width="98%" height="92%" rx="10" />
        </svg>
        <span className="atc-lay atc-t1">
          {icon || <ShoppingCart className="atc-svg-icon" />}
          <span>{displayText}</span>
        </span>
        <span className="atc-lay atc-t2">
          <svg className="atc-svg-icon atc-ckd" viewBox="0 0 24 24">
            <path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>{addedLabel}</span>
        </span>
      </button>
    );
  }

  // 5. 3D KEY PRESS
  if (animation === 'key_press') {
    return (
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        style={style}
        className={`atc-btn atc-b4 shadow-md ${active ? 'atc-active' : ''} ${className}`}
      >
        <span className="atc-lay atc-t1">
          {icon || <ShoppingCart className="atc-svg-icon" />}
          <span>{displayText}</span>
        </span>
        <span className="atc-lay atc-t2">
          <svg className="atc-svg-icon atc-ckd" viewBox="0 0 24 24">
            <path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>{addedLabel}</span>
        </span>
      </button>
    );
  }

  // 6. JELLY BOUNCE
  if (animation === 'jelly') {
    return (
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        style={style}
        className={`atc-btn atc-b5 shadow-md ${active ? 'atc-active' : ''} ${className}`}
      >
        <span className="atc-lay atc-t1">
          {icon || <ShoppingCart className="atc-svg-icon" />}
          <span>{displayText}</span>
        </span>
        <span className="atc-lay atc-t2">
          <svg className="atc-svg-icon" viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>{addedLabel}</span>
        </span>
      </button>
    );
  }

  // 7. +1 FLOAT
  if (animation === 'plus_float') {
    return (
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        style={style}
        className={`atc-btn atc-b6 shadow-md ${active ? 'atc-active' : ''} ${className}`}
      >
        <span className="atc-lay atc-t1">
          <span className="atc-ic">
            {icon || <ShoppingCart className="atc-svg-icon" />}
            <i className="atc-plus">+1</i>
          </span>
          <span>{displayText}</span>
        </span>
        <span className="atc-lay atc-t2">
          <svg className="atc-svg-icon" viewBox="0 0 24 24">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>In Cart · {plusCount}</span>
        </span>
      </button>
    );
  }

  // 8. CURTAINS
  if (animation === 'curtains') {
    return (
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        style={style}
        className={`atc-btn atc-b7 shadow-md ${active ? 'atc-active' : ''} ${className}`}
      >
        <span className="atc-lay atc-t1">
          {icon || <ShoppingCart className="atc-svg-icon" />}
          <span>{displayText}</span>
        </span>
        <span className="atc-lay atc-t2">
          <svg className="atc-svg-icon atc-ckd" viewBox="0 0 24 24">
            <path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>{addedLabel}</span>
        </span>
      </button>
    );
  }

  // 9. DOTS → TICK
  if (animation === 'dots_tick') {
    return (
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        style={style}
        className={`atc-btn atc-b8 shadow-md ${active ? 'atc-active' : ''} ${className}`}
      >
        <span className="atc-lay atc-t1">
          {icon || <ShoppingCart className="atc-svg-icon" />}
          <span>{displayText}</span>
        </span>
        <span className="atc-lay">
          <span className="atc-dots">
            <i />
            <i />
            <i />
          </span>
        </span>
        <span className="atc-lay atc-t2">
          <svg className="atc-svg-icon atc-ckd" viewBox="0 0 24 24">
            <path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>{addedLabel}</span>
        </span>
      </button>
    );
  }

  // 10. PLUS → TICK CIRCLE
  if (animation === 'plus_tick') {
    return (
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        style={style}
        className={`atc-btn atc-b9 shadow-md ${active ? 'atc-active' : ''} ${className}`}
      >
        <span className="atc-lay">
          <span className="atc-pc">
            <svg className="atc-pl" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <svg className="atc-ckd" viewBox="0 0 24 24">
              <path pathLength="1" d="M6 12.5l4 4L18 8" />
            </svg>
          </span>
          <span className="atc-tx">
            <span className="atc-t1">{displayText}</span>
            <span className="atc-t2">{addedLabel}</span>
          </span>
        </span>
      </button>
    );
  }

  // 11. SPARKLE BURST
  if (animation === 'sparkle') {
    return (
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        style={style}
        className={`atc-btn atc-b10 shadow-md ${active ? 'atc-active' : ''} ${className}`}
      >
        <span className="atc-lay">
          <span className="atc-ic">
            {icon || <ShoppingCart className="atc-svg-icon" />}
            <svg className="atc-burst" viewBox="0 0 60 60">
              {[...Array(8)].map((_, i) => (
                <line
                  key={i}
                  x1="30"
                  y1="4"
                  x2="30"
                  y2="11"
                  transform={`rotate(${i * 45} 30 30)`}
                />
              ))}
            </svg>
          </span>
          <span className="atc-tx">
            <span className="atc-t1">{displayText}</span>
            <span className="atc-t2">{addedLabel}</span>
          </span>
        </span>
      </button>
    );
  }

  // 12. DEFAULT (Classic / Fly-to-Cart)
  return (
    <button
      ref={btnRef}
      id={id}
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
      style={{
        backgroundColor: isDisabled ? undefined : 'var(--btn-primary-bg, var(--color-primary, #C2185B))',
        color: 'var(--btn-primary-text, #ffffff)',
        borderRadius: 'var(--border-radius-btn, 12px)',
        ...style,
      }}
      className={`atc-btn shadow-md active:scale-95 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed hover:brightness-110 ${fadedClass} ${className}`}
    >
      {icon || <ShoppingCart className="h-5 w-5" />}
      <span>{displayText}</span>
    </button>
  );
}

export default AddToCartButton;
