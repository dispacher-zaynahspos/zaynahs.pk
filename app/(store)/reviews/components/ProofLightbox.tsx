'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Modal } from '@/components/common/Modal';
import { SocialProof } from '@/lib/types';
import { ChevronLeft, ChevronRight, WhatsAppIcon, InstagramIcon, ShoppingBag, X } from '@/components/common/Icons';

interface ProofLightboxProps {
  open: boolean;
  onClose: () => void;
  socialProofs: SocialProof[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  sourceTypeLabel: Record<string, string>;
}

export default function ProofLightbox({
  open,
  onClose,
  socialProofs,
  currentIndex,
  onNavigate,
  sourceTypeLabel,
}: ProofLightboxProps) {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const proof = socialProofs[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < socialProofs.length - 1;

  // Keyboard navigation: Left/Right arrows
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNavigate(currentIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, hasPrev, hasNext, onNavigate]);

  if (!proof) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Only swipe if horizontal move is greater than vertical move
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0 && hasPrev) {
        onNavigate(currentIndex - 1);
      } else if (diffX < 0 && hasNext) {
        onNavigate(currentIndex + 1);
      }
    }
  };

  const sourceName = sourceTypeLabel[proof.source_type] || proof.source_type;

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="lightbox"
      showClose={false}
      ariaLabel="Customer Proof Media Lightbox"
    >
      <div
        className="relative w-full h-full flex flex-col items-center justify-between p-3 sm:p-6 select-none bg-black"
        style={{ backgroundColor: '#000000' }}
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top bar: Counter & Direct Working Close Button with solid high-contrast backgrounds */}
        <div
          className="w-full flex items-center justify-between z-50 pt-2 px-2 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/30 shadow-xl"
            style={{ backgroundColor: '#171717', color: '#ffffff' }}
          >
            <span className="font-bold tracking-wide" style={{ color: '#ffffff' }}>
              {currentIndex + 1} / {socialProofs.length}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close lightbox"
            style={{ backgroundColor: '#171717', color: '#ffffff' }}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer border border-white/30 shadow-xl pointer-events-auto shrink-0"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Center: Main Image with prev/next controls */}
        <div className="relative w-full flex-1 min-h-0 flex items-center justify-center my-2">
          {/* Previous Button */}
          {hasPrev && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(currentIndex - 1);
              }}
              aria-label="Previous customer proof"
              style={{ backgroundColor: '#171717', color: '#ffffff' }}
              className="absolute left-2 sm:left-4 z-30 w-11 h-11 rounded-full hover:bg-neutral-800 text-white flex items-center justify-center border border-white/30 transition-all cursor-pointer shadow-xl"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Main Screenshot Container: calibrated height so it never overlaps the bottom controls */}
          <div
            className="relative w-full max-w-[94vw] md:max-w-5xl h-[65dvh] sm:h-[70dvh] flex items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={proof.image_url}
              alt={proof.caption || 'Customer proof screenshot'}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 90vw"
              className="object-contain drop-shadow-2xl pointer-events-none"
            />
          </div>

          {/* Next Button */}
          {hasNext && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(currentIndex + 1);
              }}
              aria-label="Next customer proof"
              style={{ backgroundColor: '#171717', color: '#ffffff' }}
              className="absolute right-2 sm:right-4 z-30 w-11 h-11 rounded-full hover:bg-neutral-800 text-white flex items-center justify-center border border-white/30 transition-all cursor-pointer shadow-xl"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}
        </div>

        {/* Bottom Bar: Caption, Source Pill & Linked Products — Solid 100% visible high contrast */}
        <div
          className="w-full max-w-xl flex flex-col items-center text-center gap-2 pb-2 z-20 px-4 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Source chip pill: Solid dark background so text is 100% visible on white photos */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border border-white/30 shadow-xl"
            style={{ backgroundColor: '#171717', color: '#ffffff' }}
          >
            {proof.source_type === 'whatsapp' ? (
              <WhatsAppIcon className="w-4 h-4 text-[#25D366] fill-current" />
            ) : proof.source_type === 'instagram' ? (
              <InstagramIcon className="w-4 h-4 text-[#ee2a7b]" />
            ) : null}
            <span className="font-bold" style={{ color: '#ffffff' }}>{sourceName}</span>
          </div>

          {/* Caption — Solid dark background wrapper so text is 100% readable on any photo */}
          {proof.caption && (
            <div
              className="border border-white/20 px-4 py-2 rounded-xl max-w-lg shadow-xl"
              style={{ backgroundColor: '#171717', color: '#ffffff' }}
            >
              <p
                className="text-xs sm:text-sm font-medium leading-snug text-center break-words"
                style={{ color: '#ffffff' }}
              >
                {proof.caption}
              </p>
            </div>
          )}

          {/* Linked Products */}
          {proof.linked_products && proof.linked_products.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {proof.linked_products.map((p) =>
                p.slug ? (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer border border-white/25 shadow-lg"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-white" />
                    <span className="truncate max-w-[200px] text-white font-bold">{p.name}</span>
                  </Link>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
