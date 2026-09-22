'use client';

import React from 'react';
import { StoreSettings } from '@/lib/types';
import { Shield, X } from '@/components/common/Icons';

interface CookieConsentBannerProps {
  settings: StoreSettings;
  onAccept: () => void;
  onClose: () => void;
}

export default function CookieConsentBanner({
  settings,
  onAccept,
  onClose,
}: CookieConsentBannerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150] p-4 bg-white/95 dark:bg-[#16162a]/95 border-t border-gray-100 dark:border-gray-800/80 shadow-2xl transition-all duration-300 animate-slide-up">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-gray-600 dark:text-gray-300 text-center md:text-left">
            {settings.cookie_consent_text || 'We use cookies to optimize your experience, analyze traffic, and support checkout flows. By continuing, you agree to our privacy policy.'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onAccept}
            className="px-5 py-2 bg-[#1a1a2e] dark:bg-amber-600 hover:bg-[#25253b] text-white text-xs font-semibold rounded-xl transition-colors"
          >
            {settings.cookie_consent_button_text || 'Accept All'}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
