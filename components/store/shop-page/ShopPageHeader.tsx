'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from '@/components/common/Icons';
import { Category, Collection } from '@/lib/types';

interface ShopPageHeaderProps {
  activeCategory?: Category;
  activeCollection?: Collection;
  isCollectionDescExpanded: boolean;
  setIsCollectionDescExpanded: (v: boolean) => void;
  isCategoryDescExpanded: boolean;
  setIsCategoryDescExpanded: (v: boolean) => void;
  handleCategorySelect: (categoryId: string | undefined, keepCollection?: boolean) => void;
}

export default function ShopPageHeader({
  activeCategory,
  activeCollection,
  isCollectionDescExpanded,
  setIsCollectionDescExpanded,
  isCategoryDescExpanded,
  setIsCategoryDescExpanded,
  handleCategorySelect,
}: ShopPageHeaderProps) {
  return (
    <>
      {/* Breadcrumbs */}
      <div className="text-center md:text-left text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
        <Link href="/" className="hover:text-[#e94560] transition-colors">Home</Link>
        <span className="mx-2">•</span>
        <Link href="/shop" className="hover:text-[#e94560] transition-colors">Shop</Link>
        {activeCategory ? (
          <>
            <span className="mx-2">•</span>
            <span className="text-[#e94560] dark:text-[#e94560] font-bold">{activeCategory.name}</span>
          </>
        ) : activeCollection ? (
          <>
            <span className="mx-2">•</span>
            <span className="text-[#e94560] dark:text-[#e94560] font-bold">{activeCollection.name} Collection</span>
          </>
        ) : null}
      </div>

      {/* Page Header / Category Banner */}
      {activeCollection ? (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-[#16162a] dark:to-[#1a1a2e] mb-6 shadow-sm transition-all duration-200">
          {activeCollection.imageUrl && (
            <div className="absolute inset-0 z-0">
              <Image
                src={activeCollection.imageUrl}
                alt={activeCollection.name}
                fill
                sizes="100vw"
                className="object-cover blur-[1px]"
                style={{ opacity: 0.12 }}
              />
              <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-[#16162a]/95 dark:via-[#16162a]/80 dark:to-transparent" />
            </div>
          )}
          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-row items-start sm:items-center justify-between gap-4 md:gap-6">
              <div className="space-y-2 max-w-2xl text-left flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560]">Collection</span>
                <h1 className="text-2xl md:text-3xl font-black font-heading text-[var(--color-text-heading)] leading-tight">
                  {activeCollection.name}
                </h1>
                {activeCollection.description && (
                  <div className="relative group mt-2">
                    <div
                      className={`text-xs md:text-sm leading-relaxed max-w-none font-body text-[var(--color-text-secondary)] font-medium [&_p]:m-0 [&_p]:text-[var(--color-text-secondary)] [&_p]:font-body transition-all duration-300 ${
                        !isCollectionDescExpanded ? 'line-clamp-3 md:line-clamp-4' : ''
                      }`}
                      dangerouslySetInnerHTML={{ __html: activeCollection.description }}
                    />
                    {activeCollection.description.length > 150 && (
                      <button
                        onClick={() => setIsCollectionDescExpanded(!isCollectionDescExpanded)}
                        className="inline-flex items-center gap-1 mt-2 text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] hover:text-[#d63d56] transition-colors"
                      >
                        {isCollectionDescExpanded ? 'Show Less' : 'Load More'}
                      </button>
                    )}
                  </div>
                )}
              </div>
              {activeCollection.imageUrl && (
                <div className="relative h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm shrink-0">
                  <Image
                    src={activeCollection.imageUrl}
                    alt={activeCollection.name}
                    fill
                    sizes="(max-width: 768px) 80px, 96px"
                    className="object-cover animate-fade-in"
                  />
                </div>
              )}
            </div>

            {/* Category pills for the collection */}
            {activeCollection.categories && activeCollection.categories.length > 0 && (
              <div className="mt-4 md:mt-6 border-t border-gray-200 dark:border-gray-800/60 pt-4 md:pt-6">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 flex flex-wrap items-baseline gap-1.5">
                    Categories in <span className="text-xs md:text-sm font-black text-[#e94560]">{activeCollection.name}</span>
                  </h3>
                  <span className="text-[9px] md:hidden text-gray-400 font-medium tracking-widest uppercase flex items-center gap-1 animate-pulse">
                    Swipe <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
                <div className="relative group/scroll">
                  <button 
                    onClick={(e) => e.currentTarget.parentElement?.querySelector('.cat-scroll-container')?.scrollBy({ left: -300, behavior: 'smooth' })}
                    className="flex absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full shadow-md text-gray-500 hover:text-[#e94560] opacity-70 md:opacity-0 group-hover/scroll:opacity-100 hover:opacity-100 active:opacity-100 transition-all duration-300 focus:outline-none"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 gap-3 md:gap-4 snap-x snap-mandatory scrollbar-hide cat-scroll-container" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {activeCollection.categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(activeCategory?.id === cat.id ? undefined : cat.id, true)}
                        className={`relative group flex flex-col items-center justify-start shrink-0 w-24 md:w-28 rounded-2xl overflow-hidden transition-all duration-300 snap-center bg-gray-50 dark:bg-gray-800 border ${
                          activeCategory?.id === cat.id
                            ? 'border-[#e94560] ring-1 ring-[#e94560] shadow-md shadow-[#e94560]/20 scale-105'
                            : 'border-gray-200 dark:border-gray-700 hover:border-[#e94560]/50 hover:shadow-lg'
                        }`}
                      >
                        <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                          {cat.imageUrl ? (
                            <Image
                              src={cat.imageUrl}
                              alt={cat.name}
                              fill
                              sizes="(max-width: 768px) 96px, 112px"
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                              <span className="text-2xl opacity-20">📁</span>
                            </div>
                          )}
                        </div>
                        <div className="w-full p-2 text-center bg-gray-50 dark:bg-gray-800">
                          <span className={`block text-[9px] md:text-[10px] font-black uppercase tracking-wider truncate ${activeCategory?.id === cat.id ? 'text-[#e94560]' : 'text-gray-900 dark:text-white'}`}>
                            {cat.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={(e) => e.currentTarget.parentElement?.querySelector('.cat-scroll-container')?.scrollBy({ left: 300, behavior: 'smooth' })}
                    className="flex absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full shadow-md text-gray-500 hover:text-[#e94560] opacity-70 md:opacity-0 group-hover/scroll:opacity-100 hover:opacity-100 active:opacity-100 transition-all duration-300 focus:outline-none"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeCategory ? (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-[#16162a] dark:to-[#1a1a2e] mb-6 shadow-sm transition-all duration-200">
          {activeCategory.imageUrl && (
            <div className="absolute inset-0 z-0">
              <Image
                src={activeCategory.imageUrl}
                alt={activeCategory.name}
                fill
                sizes="100vw"
                className="object-cover blur-[1px]"
                style={{ opacity: 0.12 }}
              />
              <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-[#16162a]/95 dark:via-[#16162a]/80 dark:to-transparent" />
            </div>
          )}
          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-row items-start sm:items-center justify-between gap-4 md:gap-6">
              <div className="space-y-2 max-w-2xl text-left flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560]">Category</span>
                <h1 className="text-2xl md:text-3xl font-black font-heading text-[var(--color-text-heading)] leading-tight">
                  {activeCategory.name}
                </h1>
                {activeCategory.description && (
                  <div className="relative group mt-2">
                    <div
                      className={`text-xs md:text-sm leading-relaxed max-w-none font-body text-[var(--color-text-secondary)] font-medium [&_p]:m-0 [&_p]:text-[var(--color-text-secondary)] [&_p]:font-body transition-all duration-300 ${
                        !isCategoryDescExpanded ? 'line-clamp-3 md:line-clamp-4' : ''
                      }`}
                      dangerouslySetInnerHTML={{ __html: activeCategory.description }}
                    />
                    {activeCategory.description.length > 150 && (
                      <button
                        onClick={() => setIsCategoryDescExpanded(!isCategoryDescExpanded)}
                        className="inline-flex items-center gap-1 mt-2 text-[10px] font-extrabold uppercase tracking-widest text-[#e94560] hover:text-[#d63d56] transition-colors"
                      >
                        {isCategoryDescExpanded ? 'Show Less' : 'Load More'}
                      </button>
                    )}
                  </div>
                )}
              </div>
              {activeCategory.imageUrl && (
                <div className="relative h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm shrink-0">
                  <Image
                    src={activeCategory.imageUrl}
                    alt={activeCategory.name}
                    fill
                    sizes="(max-width: 768px) 80px, 96px"
                    className="object-cover animate-fade-in"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <h1 className="text-center md:text-left text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-6">
          Shop All Products
        </h1>
      )}
    </>
  );
}
