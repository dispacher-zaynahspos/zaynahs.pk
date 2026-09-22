'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { StoreSettings } from '@/lib/types';
import { addWhatsAppSubscriberClient } from '@/lib/services/sections-client';
import { Gift } from '@/components/common/Icons';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';
import { 
  ExitIntentModal, 
  SpinWheelModal, 
  RecentBuyerTicker, 
  CookieConsentBanner 
} from './premium-features';
import { useRecentBuyerTicker } from './premium-features/hooks/useRecentBuyerTicker';

interface PremiumFeaturesProviderProps {
  settings: StoreSettings;
}

export default function PremiumFeaturesProvider({ settings }: PremiumFeaturesProviderProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname();
  const isCheckout = pathname === '/cart' || pathname === '/checkout';

  // Exit Intent state
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitPhone, setExitPhone] = useState('');
  const [exitName, setExitName] = useState('');
  const [exitEmail, setExitEmail] = useState('');
  const [exitSubscribed, setExitSubscribed] = useState(false);

  // Spin to Win state
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [spinPhone, setSpinPhone] = useState('');
  const [spinName, setSpinName] = useState('');
  const [spinEmail, setSpinEmail] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Cookie Consent state
  const [showCookies, setShowCookies] = useState(false);

  const {
    tickerProduct,
    tickerBuyer,
    tickerTime,
    showTicker,
    setShowTicker
  } = useRecentBuyerTicker({ settings, isCheckout });

  // Exit intent & Cookie consent init
  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookies-accepted');
    if (settings.cookie_consent_enabled !== false && !cookiesAccepted) {
      setShowCookies(true);
    }

    const spun = localStorage.getItem('spin-wheel-spun');
    if (spun) {
      setHasSpun(true);
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (!settings.exit_intent_enabled) return;
      const dismissed = sessionStorage.getItem('exit-intent-dismissed');
      if (dismissed || exitSubscribed) return;

      if (e.clientY < 10) {
        setShowExitIntent(true);
        sessionStorage.setItem('exit-intent-dismissed', 'true');
      }
    };

    let mobileTimer: NodeJS.Timeout;
    if (settings.exit_intent_enabled && typeof window !== 'undefined' && window.innerWidth < 768) {
      const delayMobile = (settings.exit_intent_delay_mobile ?? 25) * 1000;
      mobileTimer = setTimeout(() => {
        const dismissed = sessionStorage.getItem('exit-intent-dismissed');
        if (!dismissed && !exitSubscribed) {
          setShowExitIntent(true);
          sessionStorage.setItem('exit-intent-dismissed', 'true');
        }
      }, delayMobile);
    }

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (mobileTimer) clearTimeout(mobileTimer);
    };
  }, [settings.exit_intent_enabled, exitSubscribed, settings.cookie_consent_enabled]);

  // Start spinning animation
  const startSpin = async () => {
    if (isSpinning || hasSpun) return;
    if (!spinPhone.trim()) {
      toast.error('Please enter your WhatsApp number to spin!');
      return;
    }

    try {
      setIsSpinning(true);
      await addWhatsAppSubscriberClient(spinPhone, spinName || undefined, spinEmail || undefined, 'wheel');
    } catch (err) {
      console.error(err);
      toast.error('Could not save WhatsApp subscriber. Please try again.');
      setIsSpinning(false);
      return;
    }

    const segments = settings.spin_wheel_segments || ['Try Again', '5% Off', 'Free Shipping', '10% Off', 'Free Delivery', 'WELCOME15'];
    const numSegments = segments.length;

    let targetIndex = Math.floor(Math.random() * numSegments);
    if (segments[targetIndex] === 'Try Again' && Math.random() > 0.1) {
      targetIndex = (targetIndex + 1) % numSegments;
    }

    const segmentAngle = (2 * Math.PI) / numSegments;
    const randomOffset = 0.15 * segmentAngle + Math.random() * (0.7 * segmentAngle);
    const targetFinalRotation = (1.5 * Math.PI) - (targetIndex * segmentAngle) - randomOffset;

    const spins = 5 + Math.floor(Math.random() * 4);
    const finalRotVal = targetFinalRotation + spins * 2 * Math.PI;

    let start: number | null = null;
    const duration = 6500;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const t = Math.min(progress / duration, 1);

      const easeOut = 1 - Math.pow(1 - t, 4);
      rotationRef.current = easeOut * finalRotVal;

      const canvas = canvasRef.current;
      if (canvas && (canvas as any).drawWheel) {
        (canvas as any).drawWheel();
      }

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setHasSpun(true);
        localStorage.setItem('spin-wheel-spun', 'true');

        const prize = segments[targetIndex];
        setSpinResult(prize);
        toast.success(`🎉 Congratulations! You won: ${prize}`);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitPhone.trim()) {
      toast.error('Please enter your WhatsApp number!');
      return;
    }

    try {
      await addWhatsAppSubscriberClient(exitPhone, exitName || undefined, exitEmail || undefined, 'exit_intent');
      setExitSubscribed(true);
      toast.success('Successfully subscribed! Enjoy your discount.');
    } catch (err) {
      console.error(err);
      toast.error('Could not save WhatsApp subscriber. Please check the number.');
    }
  };

  const acceptCookies = () => {
    localStorage.setItem('cookies-accepted', 'true');
    setShowCookies(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Coupon code copied to clipboard!');
  };

  if (!mounted) return null;

  return (
    <>
      {/* 1. EXIT INTENT POPUP */}
      {showExitIntent && createPortal(
        <ExitIntentModal
          settings={settings}
          subscribed={exitSubscribed}
          name={exitName}
          setName={setExitName}
          email={exitEmail}
          setEmail={setExitEmail}
          phone={exitPhone}
          setPhone={setExitPhone}
          onSubmit={handleExitSubmit}
          onClose={() => setShowExitIntent(false)}
          onCopyCoupon={copyToClipboard}
        />,
        document.body
      )}

      {/* 2. SPIN TO WIN TRIGGER & MODAL */}
      {settings.spin_wheel_enabled && !showSpinWheel && !hasSpun && (
        <button
          onClick={() => setShowSpinWheel(true)}
          className="fixed bottom-24 right-4 z-40 p-4 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-2xl animate-bounce hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-amber-300"
          title="Spin to Win!"
        >
          <Gift className="w-6 h-6" />
        </button>
      )}

      {showSpinWheel && createPortal(
        <SpinWheelModal
          settings={settings}
          isSpinning={isSpinning}
          hasSpun={hasSpun}
          spinName={spinName}
          setSpinName={setSpinName}
          spinEmail={spinEmail}
          setSpinEmail={setSpinEmail}
          spinPhone={spinPhone}
          setSpinPhone={setSpinPhone}
          spinResult={spinResult}
          onStartSpin={startSpin}
          onClose={() => { if (!isSpinning) setShowSpinWheel(false); }}
          onCopyCoupon={copyToClipboard}
          rotationRef={rotationRef}
          canvasRef={canvasRef}
        />,
        document.body
      )}

      {/* 3. VERIFIED RECENT BUYERS TICKER */}
      {showTicker && settings.recent_buyers_enabled !== false && (!isCheckout || settings.recent_buyers_show_on_checkout) && tickerProduct && tickerBuyer && (
        <RecentBuyerTicker
          settings={settings}
          product={tickerProduct}
          buyer={tickerBuyer}
          timeAgo={tickerTime}
          onClose={() => setShowTicker(false)}
        />
      )}

      {/* 4. COOKIE CONSENT BANNER */}
      {showCookies && settings.cookie_consent_enabled !== false && (
        <CookieConsentBanner
          settings={settings}
          onAccept={acceptCookies}
          onClose={() => setShowCookies(false)}
        />
      )}
    </>
  );
}
