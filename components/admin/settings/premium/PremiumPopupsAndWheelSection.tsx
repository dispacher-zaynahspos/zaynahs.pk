'use client';

import React from 'react';
import { Trash2, Image as ImageIcon } from '@/components/common/Icons';

interface PremiumPopupsAndWheelSectionProps {
  exitIntentEnabled: boolean;
  setExitIntentEnabled: (v: boolean) => void;
  exitIntentTitle: string;
  setExitIntentTitle: (v: string) => void;
  exitIntentText: string;
  setExitIntentText: (v: string) => void;
  exitIntentCoupon: string;
  setExitIntentCoupon: (v: string) => void;
  exitIntentImageUrl: string;
  setExitIntentImageUrl: (v: string) => void;
  exitIntentDelayMobile: number;
  setExitIntentDelayMobile: (v: number) => void;
  handleRemoveImage: (type: 'logo' | 'favicon' | 'banner' | 'exit_intent') => void;
  setSelectingType: React.Dispatch<React.SetStateAction<'exit_intent' | null>>;
  setIsMediaModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cookieConsentEnabled: boolean;
  setCookieConsentEnabled: (v: boolean) => void;
  cookieConsentText: string;
  setCookieConsentText: (v: string) => void;
  cookieConsentButtonText: string;
  setCookieConsentButtonText: (v: string) => void;
  spinWheelEnabled: boolean;
  setSpinWheelEnabled: (v: boolean) => void;
  spinWheelSegments: string[];
  setSpinWheelSegments: (v: string[]) => void;
}

export function PremiumPopupsAndWheelSection({
  exitIntentEnabled,
  setExitIntentEnabled,
  exitIntentTitle,
  setExitIntentTitle,
  exitIntentText,
  setExitIntentText,
  exitIntentCoupon,
  setExitIntentCoupon,
  exitIntentImageUrl,
  setExitIntentImageUrl,
  exitIntentDelayMobile,
  setExitIntentDelayMobile,
  handleRemoveImage,
  setSelectingType,
  setIsMediaModalOpen,
  cookieConsentEnabled,
  setCookieConsentEnabled,
  cookieConsentText,
  setCookieConsentText,
  cookieConsentButtonText,
  setCookieConsentButtonText,
  spinWheelEnabled,
  setSpinWheelEnabled,
  spinWheelSegments,
  setSpinWheelSegments,
}: PremiumPopupsAndWheelSectionProps) {
  return (
    <>
      {/* Exit Intent Popup */}
      <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#e94560] uppercase tracking-wider">Exit Intent Popup (WhatsApp)</h3>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Exit-Intent Popup</label>
          <input
            type="checkbox"
            checked={exitIntentEnabled}
            onChange={(e) => setExitIntentEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-[#e94560] focus:ring-[#e94560] cursor-pointer"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Popup Header Title</label>
          <input
            type="text"
            value={exitIntentTitle}
            onChange={(e) => setExitIntentTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-955 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Popup Description Text</label>
          <textarea
            value={exitIntentText}
            onChange={(e) => setExitIntentText(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-955 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Coupon Code Awarded</label>
          <input
            type="text"
            value={exitIntentCoupon}
            onChange={(e) => setExitIntentCoupon(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-955 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Popup Banner Image</label>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f0f1b]/30">
            {exitIntentImageUrl ? (
              <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-150 border border-gray-200 dark:border-gray-800 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={exitIntentImageUrl} alt="Exit Intent Preview" className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage('exit_intent')}
                  className="absolute top-1 right-1 p-1 bg-white/80 dark:bg-black/80 rounded-full text-red-500 hover:text-red-600 transition-all shadow-sm"
                  title="Remove Image"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 border border-dashed border-gray-300 dark:border-gray-700 text-gray-400 flex-shrink-0">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
            <div className="flex-1 flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectingType('exit_intent');
                    setIsMediaModalOpen(true);
                  }}
                  className="relative flex items-center gap-2 px-3 py-1.5 bg-gray-150 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  <ImageIcon className="h-3 w-3" />
                  <span>Select Media</span>
                </button>
                <span className="text-[10px] text-gray-400">or paste URL below</span>
              </div>
              <input
                type="text"
                value={exitIntentImageUrl}
                onChange={(e) => setExitIntentImageUrl(e.target.value)}
                placeholder="https://example.com/banner.webp"
                className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f1b] text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-350">
            <span>Mobile Auto-Trigger Delay</span>
            <span>{exitIntentDelayMobile} seconds</span>
          </div>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={exitIntentDelayMobile}
            onChange={(e) => setExitIntentDelayMobile(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#e94560]"
          />
        </div>
        
        {/* Live Preview Container */}
        {exitIntentEnabled && (
          <div className="mt-6 pt-6 border-t border-gray-150 dark:border-gray-800 space-y-3">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Live Preview Mockup</span>
            <div className="p-5 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center relative max-w-sm mx-auto shadow-sm">
              <div className="absolute top-3 right-3 text-gray-400 dark:text-gray-600">
                <span className="text-lg font-bold">×</span>
              </div>
              
              {exitIntentImageUrl ? (
                <div className="w-full h-24 mb-3 rounded-xl overflow-hidden bg-white dark:bg-[#16162a] border border-gray-150 dark:border-gray-850 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={exitIntentImageUrl} alt="Preview banner" className="object-contain w-full h-full" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center mb-3">
                  <span className="text-amber-500 font-bold">🏷️</span>
                </div>
              )}
              
              <h4 className="text-sm font-bold text-gray-900 dark:text-white font-serif max-w-[90%] truncate">
                {exitIntentTitle || 'Claim Your Discount!'}
              </h4>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 max-w-[90%] line-clamp-2">
                {exitIntentText || 'Subscribe to get your coupon code.'}
              </p>
              
              <div className="w-full space-y-1.5 mt-4">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  disabled
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-[10px] text-gray-400 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Address (Optional)"
                  disabled
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-[10px] text-gray-400 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp Number"
                  disabled
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-[10px] text-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  disabled
                  className="w-full py-1.5 bg-[#1a1a2e] dark:bg-amber-600 text-white font-semibold rounded-lg text-[10px] shadow-sm opacity-90 cursor-not-allowed"
                >
                  Claim Coupon Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cookie Consent Banner Config */}
      <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#e94560] uppercase tracking-wider">Cookie Consent Banner</h3>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Cookie Consent Banner</label>
          <input
            type="checkbox"
            checked={cookieConsentEnabled}
            onChange={(e) => setCookieConsentEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-[#e94560] focus:ring-[#e94560] cursor-pointer"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Banner Text Description</label>
          <textarea
            value={cookieConsentText}
            onChange={(e) => setCookieConsentText(e.target.value)}
            rows={3}
            placeholder="We use cookies to optimize your experience, analyze traffic..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-955 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Accept Button Label</label>
          <input
            type="text"
            value={cookieConsentButtonText}
            onChange={(e) => setCookieConsentButtonText(e.target.value)}
            placeholder="Accept All"
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-955 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
        </div>
      </div>

      {/* Spin to Win Config */}
      <div className="bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#e94560] uppercase tracking-wider">Spin to Win (WhatsApp)</h3>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Enable Spin to Win Wheel</label>
          <input
            type="checkbox"
            checked={spinWheelEnabled}
            onChange={(e) => setSpinWheelEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-[#e94560] focus:ring-[#e94560] cursor-pointer"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Wheel Slices (Comma-separated, max 6-8)</label>
          <input
            type="text"
            value={spinWheelSegments.join(', ')}
            onChange={(e) => setSpinWheelSegments(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f0f1b] text-gray-955 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
        </div>

        {/* Live Preview Container */}
        {spinWheelEnabled && (
          <div className="mt-6 pt-6 border-t border-gray-150 dark:border-gray-800 space-y-3">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Live Preview Mockup</span>
            <div className="p-5 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center relative max-w-sm mx-auto shadow-sm space-y-4">
              <div className="relative flex justify-center">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-500 drop-shadow" />
                <svg viewBox="0 0 200 200" className="w-32 h-32 drop-shadow-md">
                  {spinWheelSegments.map((seg, idx) => {
                    const num = spinWheelSegments.length || 6;
                    const startAngle = (idx * 360) / num - 90;
                    const endAngle = ((idx + 1) * 360) / num - 90;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    const radius = 90;
                    const cx = 100;
                    const cy = 100;
                    const x1 = cx + radius * Math.cos(startRad);
                    const y1 = cy + radius * Math.sin(startRad);
                    const x2 = cx + radius * Math.cos(endRad);
                    const y2 = cy + radius * Math.sin(endRad);
                    
                    const largeArcFlag = 360 / num > 180 ? 1 : 0;
                    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                    const fill = idx % 2 === 0 ? '#1a1a2e' : '#e94560';
                    
                    const textAngle = startAngle + (360 / num) / 2;
                    const textRad = (textAngle * Math.PI) / 180;
                    const tx = cx + (radius * 0.65) * Math.cos(textRad);
                    const ty = cy + (radius * 0.65) * Math.sin(textRad);
                    
                    return (
                      <g key={idx}>
                        <path d={d} fill={fill} stroke="#ffffff" strokeWidth="1" />
                        <text
                          x={tx}
                          y={ty}
                          fill="#ffffff"
                          fontSize="7"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${textAngle + (textAngle > 90 && textAngle < 270 ? 180 : 0)}, ${tx}, ${ty})`}
                        >
                          {seg.length > 8 ? seg.slice(0, 7) + '..' : seg}
                        </text>
                      </g>
                    );
                  })}
                  <circle cx="100" cy="100" r="10" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#d97706" strokeWidth="3" />
                </svg>
              </div>

              <div className="w-full space-y-1.5">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  disabled
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-[10px] text-gray-400 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Address (Optional)"
                  disabled
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-[10px] text-gray-400 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp Number"
                  disabled
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a] text-[10px] text-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  disabled
                  className="w-full py-1.5 bg-[#e94560] text-white font-semibold rounded-lg text-[10px] shadow-sm opacity-90 cursor-not-allowed"
                >
                  Spin the Wheel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
