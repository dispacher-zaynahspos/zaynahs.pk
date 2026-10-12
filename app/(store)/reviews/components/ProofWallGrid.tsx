'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SocialProof } from '@/lib/types';
import { WhatsAppIcon, InstagramIcon, Play } from '@/components/common/Icons';

interface ProofWallGridProps {
  socialProofs: SocialProof[];
  activeTab: string;
  sourceTypeLabel: Record<string, string>;
  onSelectProof: (index: number) => void;
  showReviews: boolean;
}

export default function ProofWallGrid({
  socialProofs,
  activeTab,
  sourceTypeLabel,
  onSelectProof,
}: ProofWallGridProps) {
  if (socialProofs.length === 0) return null;

  return (
    <div className="w-full min-w-0">
      {activeTab === 'all' && (
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gray-200/80 dark:bg-gray-800/80" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex-shrink-0 px-3">
            Customer Proof Wall
          </span>
          <div className="h-px flex-1 bg-gray-200/80 dark:bg-gray-800/80" />
        </div>
      )}

      {/* Dynamic responsive grid: centered when few (1-2), expanding to 3, 4, 5 cols when more */}
      <div
        className={`grid gap-3 ${
          socialProofs.length === 1
            ? 'grid-cols-1 max-w-[280px] mx-auto'
            : socialProofs.length === 2
            ? 'grid-cols-2 max-w-[560px] mx-auto'
            : socialProofs.length === 3
            ? 'grid-cols-2 sm:grid-cols-3 max-w-[840px] mx-auto'
            : socialProofs.length === 4
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-[1100px] mx-auto'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        }`}
      >
        {socialProofs.map((proof, index) => {
          const isVideo = Boolean(
            ('media_type' in proof && (proof as unknown as { media_type: string }).media_type === 'video') ||
            proof.image_url?.endsWith('.mp4') ||
            proof.image_url?.endsWith('.webm')
          );
          const sourceName = sourceTypeLabel[proof.source_type] || proof.source_type;

          return (
            <div
              key={proof.id}
              className="group rounded-[14px] border border-gray-200/80 dark:border-gray-800/80 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
              style={{ backgroundColor: 'var(--color-surface, #ffffff)' }}
            >
              {/* Tile media box: responsive box where full screenshot is visible with no cropping */}
              <button
                type="button"
                className={`relative w-full ${
                  isVideo ? 'aspect-[9/16]' : 'aspect-[4/5]'
                } bg-neutral-900 dark:bg-black cursor-zoom-in overflow-hidden flex items-center justify-center text-left`}
                onClick={() => onSelectProof(index)}
                aria-label={`View proof ${index + 1}`}
              >
                {/* Ambient blur backdrop for screenshot aspect ratios */}
                <Image
                  src={proof.image_url}
                  alt=""
                  fill
                  loading="lazy"
                  className="object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                  sizes="10vw"
                  aria-hidden="true"
                />

                {/* Main sharp image: object-contain ensures the entire screenshot is visible */}
                <Image
                  src={proof.image_url}
                  alt={proof.caption || 'Customer feedback'}
                  fill
                  loading="lazy"
                  className="object-contain p-1.5 group-hover:scale-102 transition-transform duration-300 relative z-1"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                {/* Source chip pill on image bottom-left */}
                <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/80 text-white shadow-xs border border-white/10">
                  {proof.source_type === 'whatsapp' ? (
                    <WhatsAppIcon className="w-3 h-3 text-[#25D366] fill-current" />
                  ) : proof.source_type === 'instagram' ? (
                    <InstagramIcon className="w-3 h-3 text-[#ee2a7b]" />
                  ) : null}
                  <span>{sourceName}</span>
                </div>

                {/* Video Play Badge */}
                {isVideo && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 pointer-events-none">
                    <Play className="w-8 h-8 text-white fill-white/80 drop-shadow-md" />
                  </div>
                )}
              </button>

              {/* Caption compact below: max 2 lines, 13px font */}
              <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                {proof.caption && (
                  <p className="text-[13px] leading-snug font-medium text-gray-700 dark:text-gray-300 line-clamp-2">
                    {proof.caption}
                  </p>
                )}

                {/* Linked product pill (if any) */}
                {proof.linked_products && proof.linked_products.length > 0 && (
                  <div className="pt-0.5 flex items-center gap-1 truncate">
                    <span className="text-[10px] text-gray-400">&bull;</span>
                    {proof.linked_products[0].slug ? (
                      <Link
                        href={`/product/${proof.linked_products[0].slug}`}
                        className="text-[11px] font-bold text-[#e94560] hover:underline truncate"
                      >
                        {proof.linked_products[0].name}
                      </Link>
                    ) : (
                      <span className="text-[11px] text-gray-400 truncate">
                        {proof.linked_products[0].name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
