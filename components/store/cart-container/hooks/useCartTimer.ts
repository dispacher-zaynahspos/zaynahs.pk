'use client';

import { useState, useEffect } from 'react';
import { StoreSettings } from '@/lib/types';
import { useCartStore } from '@/store/cartStore';

export function useCartTimer(settings: StoreSettings) {
  const items = useCartStore((state) => state.items);
  const cartCreatedAt = useCartStore((state) => state.cartCreatedAt);

  const [mounted, setMounted] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  useEffect(() => {
    if (!isConfirmingClear) return;
    const timer = setTimeout(() => {
      setIsConfirmingClear(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isConfirmingClear]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || settings.cart_timer_enabled === false || !cartCreatedAt || items.length === 0) return;

    const timerLimitMinutes = settings.cart_timer_minutes ?? 10;
    const limitMs = timerLimitMinutes * 60 * 1000;

    const updateCountdown = () => {
      const createdTime = new Date(cartCreatedAt).getTime();
      const now = new Date().getTime();
      const elapsed = now - createdTime;
      const remaining = limitMs - elapsed;

      if (remaining <= 0) {
        setIsTimerExpired(true);
        setTimeLeftStr('00:00');
      } else {
        setIsTimerExpired(false);
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeLeftStr(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [mounted, cartCreatedAt, items.length, settings.cart_timer_minutes, settings.cart_timer_enabled]);

  return {
    mounted,
    timeLeftStr,
    isTimerExpired,
    isConfirmingClear,
    setIsConfirmingClear,
  };
}
