'use client';

import React from 'react';

/**
 * Returns the real payment icon URL from /payments/*.ico if the code/name matches
 * JazzCash, EasyPaisa, Bank Transfer, or NayaPay.
 */
export function getPaymentMethodIcon(codeOrName: string): string | null {
  if (!codeOrName) return null;
  const lower = codeOrName.toLowerCase().replace(/[\s_-]/g, '');
  if (lower.includes('jazzcash')) return '/payments/jazzcash.ico';
  if (lower.includes('easypaisa')) return '/payments/easypaisa.ico';
  if (lower.includes('nayapay')) return '/payments/nayapay.ico';
  if (lower.includes('banktransfer') || lower.includes('bank') || lower.includes('transfer')) {
    return '/payments/banktransfer.ico';
  }
  if (lower.includes('cod') || lower.includes('cashondelivery') || lower.includes('cash')) {
    return '/payments/cod.ico';
  }
  return null;
}

const renderPaymentBadgeByCode = (code: string, id: string) => {
  const norm = code.toLowerCase().trim();

  // Common high-contrast styling: pristine white card, crisp charcoal text, no invisible white-on-white text
  const localPillClass =
    'h-6 sm:h-6.5 px-2.5 rounded-lg bg-white border border-gray-200/90 shadow-2xs flex items-center gap-1.5 select-none transition-all hover:scale-105 shrink-0';
  const localTextClass =
    'text-[10.5px] font-bold tracking-tight leading-none shrink-0';
  const textStyle: React.CSSProperties = { color: '#111827' };

  // 1. REAL OFFICIAL LOCAL WALLET / BANK / COD ICONS (RULE SSOT)
  if (norm === 'jazzcash' || norm.includes('jazzcash')) {
    return (
      <div key={id} className={localPillClass} title="JazzCash">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/payments/jazzcash.ico" alt="JazzCash" className="h-4 w-4 object-contain shrink-0" />
        <span className={localTextClass} style={textStyle}>JazzCash</span>
      </div>
    );
  }

  if (norm === 'easypaisa' || norm.includes('easypaisa')) {
    return (
      <div key={id} className={localPillClass} title="EasyPaisa">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/payments/easypaisa.ico" alt="EasyPaisa" className="h-4 w-4 object-contain shrink-0" />
        <span className={localTextClass} style={textStyle}>EasyPaisa</span>
      </div>
    );
  }

  if (norm === 'banktransfer' || norm === 'bank' || norm.includes('bank') || norm.includes('transfer')) {
    return (
      <div key={id} className={localPillClass} title="Bank Transfer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/payments/banktransfer.ico" alt="Bank Transfer" className="h-4 w-4 object-contain shrink-0" />
        <span className={localTextClass} style={textStyle}>Bank Transfer</span>
      </div>
    );
  }

  if (norm === 'cod' || norm.includes('cod') || norm.includes('cash on delivery') || norm.includes('cash')) {
    return (
      <div key={id} className={localPillClass} title="Cash on Delivery">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/payments/cod.ico" alt="Cash on Delivery" className="h-4 w-4 object-contain shrink-0" />
        <span className={localTextClass} style={textStyle}>Cash on Delivery</span>
      </div>
    );
  }

  if (norm === 'nayapay' || norm.includes('nayapay')) {
    return (
      <div key={id} className={localPillClass} title="NayaPay">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/payments/nayapay.ico" alt="NayaPay" className="h-4 w-4 object-contain shrink-0" />
        <span className={localTextClass} style={textStyle}>NayaPay</span>
      </div>
    );
  }

  // 2. INTERNATIONAL CARD & WALLET BADGES (Clean Uniform Cards)
  const baseCard =
    'h-6 sm:h-6.5 px-2.5 rounded-lg text-[9px] font-extrabold flex items-center justify-center tracking-wider shadow-2xs select-none border border-black/5 transition-all hover:scale-105 shrink-0';

  switch (norm) {
    case 'visa':
      return (
        <div key={id} className={`${baseCard} bg-[#1A1F71] text-white`} style={{ fontFamily: 'sans-serif' }}>
          VISA
        </div>
      );
    case 'mastercard':
      return (
        <div key={id} className={`${baseCard} bg-[#0A0A0A] text-white gap-1 flex items-center`}>
          <div className="flex -space-x-1 w-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#EB001B]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#F79E1B] opacity-90 -ml-0.5" />
          </div>
          <span className="text-[7.5px] font-semibold tracking-normal lowercase">mastercard</span>
        </div>
      );
    case 'paypal':
      return (
        <div key={id} className={`${baseCard} bg-[#003087] text-[#0079C1]`} style={{ fontStyle: 'italic' }}>
          Pay<span className="text-white">Pal</span>
        </div>
      );
    case 'amex':
      return (
        <div key={id} className={`${baseCard} bg-[#016FD0] text-white`} style={{ letterSpacing: '0.05em' }}>
          AMEX
        </div>
      );
    case 'klarna':
      return (
        <div key={id} className={`${baseCard} bg-[#FFB3C7] text-black font-semibold`} style={{ letterSpacing: '-0.02em' }}>
          Klarna.
        </div>
      );
    case 'cirrus':
      return (
        <div key={id} className={`${baseCard} bg-[#0079C1] text-white font-bold`}>
          cirrus
        </div>
      );
    case 'westernunion':
      return (
        <div key={id} className={`${baseCard} bg-[#FFCC00] text-black flex flex-col items-center leading-none justify-center font-bold px-2 py-0.5`}>
          <span className="text-[4px] tracking-normal">WESTERN</span>
          <span className="text-[4px] tracking-normal">UNION</span>
        </div>
      );
    default:
      return (
        <div key={id} className={`${baseCard} bg-white text-gray-900 border border-gray-200/90`} style={textStyle}>
          {code}
        </div>
      );
  }
};

export interface PaymentBadgesProps {
  methods: string[];
  className?: string;
}

export default function PaymentBadges({ methods, className = 'flex flex-wrap items-center gap-2' }: PaymentBadgesProps) {
  if (!methods || methods.length === 0) return null;

  return (
    <div className={className}>
      {methods.map((code) => renderPaymentBadgeByCode(code, code))}
    </div>
  );
}
