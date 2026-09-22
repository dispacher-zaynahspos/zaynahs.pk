'use client';

import React from 'react';
import { HeroSlide } from './HeroBannerControls';

interface HeroSlideManagerProps {
  slides: HeroSlide[];
  activeSlideId: string | null;
  setActiveSlideId: (id: string) => void;
  handleAddSlide: () => void;
  handleDeleteSlide: (id: string) => void;
  handleMoveSlide: (index: number, direction: 'up' | 'down') => void;
}

export function HeroSlideManager({
  slides,
  activeSlideId,
  setActiveSlideId,
  handleAddSlide,
  handleDeleteSlide,
  handleMoveSlide
}: HeroSlideManagerProps) {
  return (
    <div className="space-y-3 p-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e94560]">Slides List</span>
        <button
          type="button"
          onClick={handleAddSlide}
          className="px-2.5 py-1 bg-[#e94560] hover:bg-[#d83550] text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
        >
          + Add Slide
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-4 text-xs font-semibold text-gray-400">
          No slides configured.
        </div>
      ) : (
        <div className="space-y-1.5">
          {slides.map((slide, idx) => {
            const isActive = activeSlideId === slide.id;
            return (
              <div
                key={slide.id}
                onClick={() => setActiveSlideId(slide.id)}
                className={`flex items-center justify-between p-2.5 border rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#e94560] bg-[#e94560]/5 dark:bg-[#e94560]/10 shadow-sm'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16162a]/50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-black text-gray-400 flex-shrink-0">#{idx + 1}</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[140px]">
                    {slide.title || `Slide ${idx + 1}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSlide(idx, 'up')}
                    className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={idx === slides.length - 1}
                    onClick={() => handleMoveSlide(idx, 'down')}
                    className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="text-[10px] text-gray-450 hover:text-red-500 cursor-pointer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
