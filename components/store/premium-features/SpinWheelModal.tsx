'use client';

import React, { useEffect, useRef } from 'react';
import { StoreSettings } from '@/lib/types';
import { X } from '@/components/common/Icons';

interface SpinWheelModalProps {
  settings: StoreSettings;
  isSpinning: boolean;
  hasSpun: boolean;
  spinName: string;
  setSpinName: (v: string) => void;
  spinEmail: string;
  setSpinEmail: (v: string) => void;
  spinPhone: string;
  setSpinPhone: (v: string) => void;
  spinResult: string | null;
  onStartSpin: () => void;
  onClose: () => void;
  onCopyCoupon: (code: string) => void;
  rotationRef: React.MutableRefObject<number>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function SpinWheelModal({
  settings,
  isSpinning,
  spinName,
  setSpinName,
  spinEmail,
  setSpinEmail,
  spinPhone,
  setSpinPhone,
  spinResult,
  onStartSpin,
  onClose,
  onCopyCoupon,
  rotationRef,
  canvasRef,
}: SpinWheelModalProps) {
  // Draw the spin wheel canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const segments = settings.spin_wheel_segments || ['Try Again', '5% Off', 'Free Shipping', '10% Off', 'Free Delivery', 'WELCOME15'];
    const numSegments = segments.length;
    const radius = canvas.width / 2;
    const angleStep = (2 * Math.PI) / numSegments;

    const drawWheel = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(rotationRef.current);

      // Draw segments
      for (let i = 0; i < numSegments; i++) {
        const startAngle = i * angleStep;
        const endAngle = startAngle + angleStep;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius - 8, startAngle, endAngle);
        ctx.closePath();

        if (i % 2 === 0) {
          ctx.fillStyle = '#1a1a2e';
        } else {
          ctx.fillStyle = '#e94560';
        }
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.rotate(startAngle + angleStep / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(segments[i], radius - 25, 0);
        ctx.restore();
      }

      // Outer border ring
      ctx.beginPath();
      ctx.arc(0, 0, radius - 4, 0, 2 * Math.PI);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#d97706';
      ctx.stroke();

      // Center pin
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.restore();
    };

    drawWheel();
    (canvas as any).drawWheel = drawWheel;
  }, [canvasRef, rotationRef, settings.spin_wheel_segments]);

  const getCouponCodeForSegment = (prize: string | null) => {
    if (!prize) return settings.exit_intent_coupon || 'WELCOME10';
    const clean = prize.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (clean.length >= 3 && !['TRYAGAIN', 'FREESHIPPING', 'FREEDELIVERY', '5OFF', '10OFF'].includes(clean)) {
      return clean;
    }

    if (prize.includes('5%')) return '5OFF';
    if (prize.includes('10%')) return '10OFF';
    if (prize.includes('15%')) return '15OFF';
    if (prize.includes('20%')) return '20OFF';
    if (prize.toLowerCase().includes('free shipping') || prize.toLowerCase().includes('free delivery')) {
      return 'FREESHIP';
    }

    return settings.exit_intent_coupon || 'WELCOME10';
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 overflow-y-auto overscroll-contain animate-fade-in touch-none"
      onClick={() => { if (!isSpinning) onClose(); }}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#16162a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-2xl transition-all my-8 scale-up duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          disabled={isSpinning}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            {/* Pointer indicator */}
            <div className="relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-amber-500 drop-shadow-md" />
              <canvas
                ref={canvasRef}
                width={220}
                height={220}
                className="w-[220px] h-[220px] rounded-full drop-shadow-xl"
              />
            </div>
          </div>

          <div className="md:col-span-6 space-y-4">
            <div className="text-center md:text-left">
              <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-500 text-xs font-bold rounded-full mb-1">
                Try Your Luck!
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white font-serif">
                Spin to Win Discounts
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your WhatsApp number to unlock a random checkout discount code.
              </p>
            </div>

            {!spinResult ? (
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={spinName}
                    onChange={(e) => setSpinName(e.target.value)}
                    disabled={isSpinning}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-950 dark:text-gray-50"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address (Optional)"
                    value={spinEmail}
                    onChange={(e) => setSpinEmail(e.target.value)}
                    disabled={isSpinning}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-950 dark:text-gray-50"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="WhatsApp Number"
                    value={spinPhone}
                    onChange={(e) => setSpinPhone(e.target.value.replace(/\D/g, ''))}
                    disabled={isSpinning}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-950 dark:text-gray-50"
                  />
                </div>
                <button
                  onClick={onStartSpin}
                  disabled={isSpinning}
                  className="w-full py-2.5 bg-[#e94560] hover:bg-[#d83651] text-white text-xs font-semibold rounded-xl transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  {isSpinning ? 'Spinning...' : 'SPIN THE WHEEL'}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center md:text-left">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                    You Won:
                  </p>
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">
                    {spinResult}
                  </p>
                </div>

                {spinResult !== 'Try Again' && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-amber-500">
                      {getCouponCodeForSegment(spinResult)}
                    </span>
                    <button
                      onClick={() => onCopyCoupon(getCouponCodeForSegment(spinResult))}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded transition-colors"
                    >
                      Copy Code
                    </button>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
