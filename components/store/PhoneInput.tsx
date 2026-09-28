'use client';

import React, { useId, useState } from 'react';
import { Check, HelpCircle, X } from '@/components/common/Icons';
import {
  normalizePkPhone,
  formatPkPhone,
  isValidPkMobile,
  pkPhoneProgress,
  PK_PHONE_MAX_DIGITS,
} from '@/lib/phone';

interface PhoneInputProps {
  /** Canonical national digits, e.g. "03001234567" */
  value: string;
  /** Emits canonical national digits (letters/symbols stripped) */
  onChange: (national: string) => void;
  label?: string;
  required?: boolean;
  /** External error (e.g. from submit) — overrides internal blur error */
  error?: string | null;
  id?: string;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Pakistan WhatsApp/phone input — digit-only, live "0300 1234567" mask,
 * progress dots + counter, inline validation (no native tooltip), a11y wired.
 * Reusable across checkout, account, lead capture, admin manual order.
 */
export default function PhoneInput({
  value,
  onChange,
  label = 'WhatsApp / Phone',
  required = true,
  error,
  id,
  className,
  placeholder = 'e.g. 0300 1234567',
  autoFocus,
}: PhoneInputProps) {
  const reactId = useId();
  const inputId = id || `phone-${reactId}`;
  const helpId = `${inputId}-help`;
  const errId = `${inputId}-err`;
  const countId = `${inputId}-count`;

  const [touched, setTouched] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const national = normalizePkPhone(value);
  const { filled, total } = pkPhoneProgress(value);
  const valid = isValidPkMobile(value);
  const isEmpty = filled === 0;

  // Internal (blur-driven) error message
  let internalError: string | null = null;
  if (touched && !valid) {
    if (isEmpty) internalError = required ? 'WhatsApp number zaroori hai' : null;
    else if (!national.startsWith('03')) internalError = 'Number 03 se shuru hona chahiye (jaise 0300 1234567)';
    else if (filled < total) internalError = `Number poora nahi (${filled}/${total} digits)`;
    else internalError = 'Ye number sahi nahi lagta (jaise 0300 1234567)';
  }
  const shownError = error ?? internalError;

  const handleChange = (raw: string) => {
    // Strip everything to canonical national digits (letters/symbols ignored)
    onChange(normalizePkPhone(raw));
  };

  const describedBy = [helpId, countId, shownError ? errId : null].filter(Boolean).join(' ');

  return (
    <div className={className} style={{ scrollMarginTop: '96px' }} id={`${inputId}-field`}>
      <label htmlFor={inputId} className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        <button
          type="button"
          onClick={() => setShowHelp((s) => !s)}
          className="relative ml-1.5 inline-flex align-middle text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Phone number help"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          {showHelp && (
            <span
              role="tooltip"
              className="absolute left-0 top-5 z-30 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16162a] p-3 text-left text-[11px] font-medium normal-case tracking-normal text-gray-600 dark:text-gray-300 shadow-xl"
            >
              Valid: 0300 1234567 (11 digits, 03 se shuru). Ye number order confirmation aur courier call ke liye use hoga.
            </span>
          )}
        </button>
      </label>

      <div className="relative">
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          enterKeyHint="next"
          autoFocus={autoFocus}
          maxLength={12 /* 11 digits + 1 space in mask */}
          value={formatPkPhone(value)}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          aria-required={required}
          aria-invalid={!!shownError}
          aria-describedby={describedBy}
          className={`w-full rounded-xl border bg-gray-50/50 dark:bg-[#0f0f1b]/50 px-4 py-3 pr-10 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal placeholder:italic focus:bg-white dark:focus:bg-[#16162a] focus:outline-none transition-all ${
            shownError
              ? 'border-red-400 focus:border-red-500'
              : valid
                ? 'border-emerald-400 focus:border-emerald-500'
                : 'border-gray-200 dark:border-gray-800 focus:border-[#e94560]'
          }`}
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {valid ? (
            <Check className="h-4 w-4 text-emerald-500" aria-hidden />
          ) : shownError ? (
            <X className="h-4 w-4 text-red-500" aria-hidden />
          ) : (
            <HelpCircle className="h-4 w-4 text-gray-400" aria-hidden />
          )}
        </div>
      </div>

      {/* Progress dots + counter */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-[3px]" aria-hidden>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1 w-1.5 rounded-full transition-colors ${
                i < filled ? (valid ? 'bg-emerald-500' : 'bg-[#e94560]') : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        <span id={countId} aria-live="polite" className="text-[10px] font-bold tabular-nums text-gray-400">
          {filled}/{total}
        </span>
      </div>

      {shownError ? (
        <p id={errId} className="mt-1 text-[11px] font-semibold text-red-500">{shownError}</p>
      ) : (
        <p id={helpId} className="mt-1 text-[11px] font-medium text-gray-400">
          Sirf 11 digits, 03XX se shuru. Order updates WhatsApp par aayenge.
        </p>
      )}
    </div>
  );
}
