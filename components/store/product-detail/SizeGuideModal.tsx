'use client';

import React from 'react';
import Image from 'next/image';
import { X } from '@/components/common/Icons';
import { StoreSettings, Product } from '@/lib/types';
import { isFeatureEnabled } from '@/lib/features/premium';
import { Modal } from '@/components/common/Modal';

interface SizeGuideModalProps {
  product: Product;
  settings: StoreSettings;
  open: boolean;
  onClose: () => void;
}

/**
 * Shared size-chart popup (SSOT) — the product-page size guide extracted into one
 * component so there is a single chart UI to maintain. Uses the real, product-linked
 * `product.size_guide` (loaded by the FULL product fetch).
 *
 * Renders through the shared Modal (RULE MODAL1) for smooth open/close + scroll-lock
 * + ESC. The branded amber card is the Modal child; the Modal's panel chrome is made
 * transparent so this bespoke visual is preserved.
 */
export default function SizeGuideModal({ product, settings, open, onClose }: SizeGuideModalProps) {
  const sizeGuide = product.size_guide;

  if (!isFeatureEnabled(settings, 'size_guide') || !sizeGuide) return null;

  const storeName = settings?.store_name || 'TotVogue.pk';
  const logoUrl = settings?.logo_url;
  const storeTagline = settings?.tagline || 'Little Styles, Big Smiles';
  const measurementUnit = (sizeGuide?.unit || 'INCHES').toUpperCase();

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="center"
      size="lg"
      showClose={false}
      ariaLabel="Size guide"
      className="!bg-transparent !border-0 !shadow-none !rounded-none !overflow-visible"
    >
      <div
        className="relative w-full my-auto bg-[#FFFCF6] dark:bg-[#121220] border-2 border-amber-300/80 dark:border-amber-500/30 rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-6 shadow-2xl text-gray-900 dark:text-white select-none"
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer z-30"
          aria-label="Close size guide"
        >
          <X className="w-5 h-5" strokeWidth={2.2} />
        </button>

        {/* 1. Brand Header — Store Logo + Store Name + Tagline (Matching Mobile Drawer & Image 2) */}
        <div className="flex flex-col items-center justify-center text-center pt-0.5 pb-1">
          <div className="flex items-center justify-center gap-2 mb-0.5 max-w-[85%]">
            {logoUrl ? (
              <div className="relative h-7 w-7 sm:h-9 sm:w-9 shrink-0">
                <Image
                  src={logoUrl}
                  alt={storeName}
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </div>
            ) : (
              <span className="text-xl">👑</span>
            )}
            <span className="font-[family-name:var(--font-heading)] text-base sm:text-xl md:text-2xl font-black tracking-tight text-gray-950 dark:text-white truncate">
              {storeName}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400/90 tracking-wide flex items-center justify-center gap-1">
            <span className="text-amber-500 text-[9px]">♡</span>
            <span className="line-clamp-1">{storeTagline}</span>
            <span className="text-amber-500 text-[9px]">♡</span>
          </p>
        </div>

        {/* 2. Banner Header — "SIZE CHART" / Guide Name + "MEASUREMENTS IN {UNIT}" Centered Directly Underneath Like Image 2 */}
        <div className="my-2 sm:my-3 flex flex-col items-center justify-center text-center">
          <div className="relative inline-flex items-center justify-center px-5 sm:px-8 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 dark:from-amber-500 dark:to-amber-600 shadow-sm border border-amber-400/80">
            <h3 className="text-xs sm:text-base md:text-lg font-black uppercase tracking-wider text-slate-900 drop-shadow-xs">
              {sizeGuide.name?.toUpperCase().includes('SIZE')
                ? sizeGuide.name
                : `${sizeGuide.name || 'PRODUCT'} - SIZE CHART`}
            </h3>
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1b2a47] dark:bg-slate-800 text-white text-[9.5px] sm:text-[11px] font-extrabold uppercase tracking-widest shadow-xs">
            <span>📏</span> MEASUREMENTS IN {measurementUnit}
          </div>
        </div>

        {/* Visual Reference Image (if provided) */}
        {sizeGuide.image_url && (
          <div className="relative w-full h-36 sm:h-48 rounded-xl overflow-hidden bg-white dark:bg-white/5 mb-3 border border-amber-200/80 dark:border-gray-800 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sizeGuide.image_url}
              alt={`${sizeGuide.name} reference`}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* 3. The Size Chart Table — Strictly 1 Screen Fit (Zero Horizontal Scroll on ALL Phones & Desktops) */}
        {sizeGuide.chart_data && sizeGuide.chart_data.length > 0 && (() => {
          const columns = Object.keys(sizeGuide.chart_data[0]);
          // Place the size/age column first, then all measurement columns
          const sizeCol = columns.find((c) => /^(size|age|years|year|tag)$/i.test(c.trim())) || columns[0];
          const otherCols = columns.filter((c) => c !== sizeCol);
          const orderedCols = [sizeCol, ...otherCols];
          const totalCols = orderedCols.length;

          // Size column percentage based on column count
          const sizeColPct = totalCols >= 7 ? 18 : totalCols >= 5 ? 22 : 26;
          const otherColPct = ((100 - sizeColPct) / (totalCols - 1)).toFixed(2);

          return (
            <div className="rounded-xl sm:rounded-2xl border-2 border-amber-300 dark:border-amber-500/40 overflow-hidden bg-white dark:bg-[#16162a] shadow-xs">
              <table className="w-full table-fixed text-center border-collapse">
                <thead>
                  <tr className="bg-amber-400 dark:bg-amber-500 text-slate-900 border-b-2 border-amber-300 dark:border-amber-500/40">
                    {orderedCols.map((colName, cIdx) => {
                      const isFirst = cIdx === 0;
                      return (
                        <th
                          key={colName}
                          style={{ width: `${isFirst ? sizeColPct : otherColPct}%` }}
                          className="py-1.5 sm:py-2.5 px-0.5 font-black uppercase text-[8.5px] sm:text-[10px] md:text-xs leading-[1.05] sm:leading-[1.15] tracking-tighter border-r border-amber-300/80 dark:border-amber-600/40 last:border-r-0 break-words hyphens-auto text-center"
                        >
                          {colName}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200/70 dark:divide-amber-500/20">
                  {sizeGuide.chart_data.map((row, idx) => {
                    const isEven = idx % 2 === 0;
                    const rowBgClass = isEven
                      ? 'bg-[#fffdf7] dark:bg-[#181828]'
                      : 'bg-[#fff8e7]/80 dark:bg-[#141424]';

                    return (
                      <tr
                        key={idx}
                        className={`${rowBgClass} hover:bg-amber-100/50 dark:hover:bg-white/5 transition-colors`}
                      >
                        {orderedCols.map((colName, cIdx) => {
                          const val = row[colName] || '-';
                          const isFirstCol = cIdx === 0;
                          return (
                            <td
                              key={colName}
                              className={`py-1.5 sm:py-2 px-0.5 text-[9.5px] sm:text-xs border-r border-dashed border-amber-200/80 dark:border-amber-500/20 last:border-r-0 ${
                                isFirstCol
                                  ? 'font-extrabold text-slate-900 dark:text-white text-center break-words'
                                  : 'font-semibold text-slate-700 dark:text-slate-200 text-center break-words'
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}

        {/* 4. Bottom Trust Badges (Sample 2 format) */}
        <div className="mt-2.5 pt-2 border-t border-amber-200/70 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 text-center">
          <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl bg-amber-50/80 dark:bg-white/5 border border-amber-200/60 dark:border-gray-800">
            <span className="text-amber-600 dark:text-amber-400 text-sm sm:text-base">🛡️</span>
            <div className="text-left leading-tight">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white">Premium Quality</p>
              <p className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400">Guaranteed</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl bg-amber-50/80 dark:bg-white/5 border border-amber-200/60 dark:border-gray-800">
            <span className="text-amber-600 dark:text-amber-400 text-sm sm:text-base">🚚</span>
            <div className="text-left leading-tight">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white">Fast Delivery</p>
              <p className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400">Reliable Shipping</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl bg-amber-50/80 dark:bg-white/5 border border-amber-200/60 dark:border-gray-800">
            <span className="text-amber-600 dark:text-amber-400 text-sm sm:text-base">🤍</span>
            <div className="text-left leading-tight">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white">Comfort First</p>
              <p className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400">For Every Move</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl bg-amber-50/80 dark:bg-white/5 border border-amber-200/60 dark:border-gray-800">
            <span className="text-amber-600 dark:text-amber-400 text-sm sm:text-base">😊</span>
            <div className="text-left leading-tight">
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white">Best Fitting</p>
              <p className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400">100% Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
