'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, StoreSettings, HomepageSection } from '@/lib/types';
import ProductGrid from '../ProductGrid';

interface FlashSaleSectionProps {
  section: HomepageSection;
  products: Product[];
  currencySymbol: string;
  settings: StoreSettings;
  isPreview?: boolean;
  loadMoreLimit?: number;
  onLoadMore?: (sectionId: string, baseLimit: number) => void;
}

export function FlashSaleSection({ section, products, currencySymbol, settings, isPreview, loadMoreLimit, onLoadMore }: FlashSaleSectionProps) {
  if (settings.flash_sale_enabled === false) return null;
  const startTimeStr = section.settings?.startTime;
  const endTimeStr = section.settings?.endTime;

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: true, isIncoming: false, isInfinite: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!startTimeStr && !endTimeStr) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: false, isIncoming: false, isInfinite: true });
      return;
    }

    const updateTime = () => {
      const now = Date.now();
      const start = startTimeStr ? new Date(startTimeStr).getTime() : 0;
      const end = endTimeStr ? new Date(endTimeStr).getTime() : 0;

      const isStarted = !startTimeStr || start <= now;
      const isEnded = endTimeStr && end < now;

      if (!isStarted) {
        const diff = start - now;
        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: false, isIncoming: false, isInfinite: false });
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft({ hours, minutes, seconds, expired: false, isIncoming: true, isInfinite: false });
        }
      } else if (isStarted && !isEnded) {
        let targetTime = end;
        if (!endTimeStr) {
          const midnight = new Date();
          midnight.setHours(23, 59, 59, 999);
          targetTime = midnight.getTime();
        }
        
        const diff = targetTime - now;
        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true, isIncoming: false, isInfinite: false });
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft({ hours, minutes, seconds, expired: false, isIncoming: false, isInfinite: false });
        }
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true, isIncoming: false, isInfinite: false });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [startTimeStr, endTimeStr]);

  if (!mounted || timeLeft.expired) return null;

  const fsProducts = section.content_data?.products || [];
  const categoryDiscounts = section.content_data?.categoryDiscounts || [];
  
  const sortMethod = section.settings?.sortMethod || 'default';

  const allMatchedProducts = products
    .filter(p => 
      fsProducts.some((fsp: any) => fsp.productId === p.id) ||
      categoryDiscounts.some((cd: any) => 
        cd.categoryId === p.categoryId || 
        cd.categoryId === p.category?.slug || 
        cd.categoryId === 'shop' || 
        p.category?.id === cd.categoryId ||
        p.productCategories?.some((pc: any) => pc.categoryId === cd.categoryId || pc.category?.slug === cd.categoryId)
      )
    )
      .sort((a, b) => {
        // Priority sorting: Manual Additions first
        const idxA = fsProducts.findIndex((fsp: any) => fsp.productId === a.id);
        const idxB = fsProducts.findIndex((fsp: any) => fsp.productId === b.id);
        
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;

        // Category Order Sort
        if (sortMethod === 'category') {
          const catIdxA = categoryDiscounts.findIndex((cd: any) => 
            cd.categoryId === a.categoryId || cd.categoryId === a.category?.slug || cd.categoryId === 'shop' || a.category?.id === cd.categoryId || a.productCategories?.some((pc: any) => pc.categoryId === cd.categoryId || pc.category?.slug === cd.categoryId)
          );
          const catIdxB = categoryDiscounts.findIndex((cd: any) => 
            cd.categoryId === b.categoryId || cd.categoryId === b.category?.slug || cd.categoryId === 'shop' || b.category?.id === cd.categoryId || b.productCategories?.some((pc: any) => pc.categoryId === cd.categoryId || pc.category?.slug === cd.categoryId)
          );
          if (catIdxA !== -1 && catIdxB !== -1 && catIdxA !== catIdxB) {
            return catIdxA - catIdxB;
          }
        }

        // Apply standard sorting for category matches
        if (sortMethod === 'newest') {
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        } else if (sortMethod === 'oldest') {
          return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
        } else if (sortMethod === 'price_low') {
          return a.price - b.price;
        } else if (sortMethod === 'price_high') {
          return b.price - a.price;
        } else if (sortMethod === 'a_to_z') {
          return a.name.localeCompare(b.name);
        } else if (sortMethod === 'z_to_a') {
          return b.name.localeCompare(a.name);
        }
        
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });

  const baseLimit = section.settings?.limit || 8;
  const effectiveLimit = loadMoreLimit || baseLimit;
  const bottomEnableViewAll = section.settings?.bottomEnableViewAll === true;
  const bottomEnableLoadMore = section.settings?.bottomEnableLoadMore === true;

  const displayProducts = allMatchedProducts.slice(0, effectiveLimit);
  const hasMore = displayProducts.length < allMatchedProducts.length && displayProducts.length >= effectiveLimit;

  if (displayProducts.length === 0) {
    if (isPreview) {
      return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 mb-6 border border-dashed border-[#e94560]/50 rounded-3xl bg-[#e94560]/5 flex flex-col items-center justify-center text-center space-y-2 min-h-[150px]">
          <span className="text-2xl">🏷️</span>
          <p className="text-xs font-bold text-[#e94560] uppercase tracking-wider">Empty Flash Sale Section</p>
          <p className="text-[10px] text-gray-500 font-semibold max-w-xs">Please select this section and add products or category discounts to make it visible.</p>
        </div>
      );
    }
    return null;
  }

  const viewAllLink = section.settings?.viewAllUrl || '/shop';
  const viewAllText = section.settings?.viewAllText || 'View All';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 bg-[#1a1a2e]/5 dark:bg-[#16162a]/30 rounded-3xl border border-gray-200 dark:border-gray-800 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${timeLeft.isIncoming ? 'bg-amber-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${timeLeft.isIncoming ? 'bg-amber-500' : 'bg-red-500'}`}></span>
            </span>
            <h2 className="text-lg font-black uppercase tracking-wider text-gray-900 dark:text-white">
              {section.title || 'Flash Sale'}
            </h2>
          </div>
          <p className="text-xs text-gray-500 font-semibold">
            {timeLeft.isIncoming ? 'Sale starts in:' : 'Special discounted prices for a limited time!'}
          </p>
        </div>

        {!timeLeft.isInfinite ? (
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 font-extrabold w-11 py-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white">
              <span className="text-xs font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[7px] text-gray-400 font-normal">HRS</span>
            </div>
            <span className="font-extrabold text-gray-400">:</span>
            <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 font-extrabold w-11 py-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white">
              <span className="text-xs font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[7px] text-gray-400 font-normal">MIN</span>
            </div>
            <span className="font-extrabold text-gray-400">:</span>
            <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 font-extrabold w-11 py-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white">
              <span className="text-xs font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[7px] text-gray-400 font-normal">SEC</span>
            </div>

            <Link href={viewAllLink} className="ml-4 text-xs font-bold text-[#e94560] hover:underline uppercase tracking-wider">
              {viewAllText}
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4 self-start sm:self-center">
            <span className="text-xs font-extrabold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-full uppercase tracking-wider">
              Special Discount Active
            </span>
            <Link href={viewAllLink} className="text-xs font-bold text-[#e94560] hover:underline uppercase tracking-wider">
              {viewAllText}
            </Link>
          </div>
        )}
      </div>

      <ProductGrid 
        products={displayProducts} 
        currencySymbol={currencySymbol} 
        settings={settings}
      />

      {(bottomEnableLoadMore || bottomEnableViewAll) && (
        <div className="w-full flex items-center justify-center gap-3 mt-6 md:mt-8 px-4">
          {bottomEnableLoadMore && hasMore && (
            <button
              type="button"
              onClick={() => onLoadMore && onLoadMore(section.id, baseLimit)}
              className="px-5 py-2.5 text-xs md:text-sm font-semibold tracking-wide uppercase rounded-full transition-all duration-200 shadow-sm active:scale-95 hover:brightness-90 cursor-pointer"
              style={{
                backgroundColor: section.settings?.bottomLoadMoreBgColor || '#f1f5f9',
                color: section.settings?.bottomLoadMoreTextColor || '#1e293b',
              }}
            >
              {section.settings?.bottomLoadMoreText || 'Load More'}
            </button>
          )}
          {bottomEnableViewAll && (
            <Link
              href={viewAllLink}
              className="px-5 py-2.5 text-xs md:text-sm font-semibold tracking-wide uppercase rounded-full transition-all duration-200 shadow-sm active:scale-95 hover:brightness-90"
              style={{
                backgroundColor: section.settings?.bottomViewAllBgColor || '#FFD147',
                color: section.settings?.bottomViewAllTextColor || '#0f172a',
              }}
            >
              {section.settings?.bottomViewAllText || 'View All'}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
