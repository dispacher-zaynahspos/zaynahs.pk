'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SocialProof } from '@/lib/types';

interface ProofWallGridProps {
  socialProofs: SocialProof[];
  activeTab: string;
  sourceTypeLabel: Record<string, string>;
  setLightboxImage: (url: string | null) => void;
  showReviews: boolean;
}

export default function ProofWallGrid({
  socialProofs,
  activeTab,
  sourceTypeLabel,
  setLightboxImage,
  showReviews,
}: ProofWallGridProps) {
  if (socialProofs.length === 0) return null;

  return (
    <div className={`${showReviews && activeTab === 'all' ? 'flex-1' : 'w-full'} min-w-0`}>
      <div className="lg:sticky lg:top-8">
        {activeTab === 'all' && (
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex-shrink-0 px-3">
              Customer Proof Wall
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {socialProofs.map((proof) => (
            <div
              key={proof.id}
              className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="relative w-full bg-gray-100 dark:bg-gray-800 cursor-zoom-in"
                onClick={() => setLightboxImage(proof.imageUrl)}
              >
                <Image
                  src={proof.imageUrl}
                  alt={proof.caption || 'Customer feedback'}
                  width={600}
                  height={800}
                  className="w-full h-auto object-contain"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-3 space-y-1.5">
                {proof.caption && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {proof.caption}
                  </p>
                )}
                {proof.linkedProducts && proof.linkedProducts.length > 0 && (
                  <div className="pt-1 space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Linked Products:
                    </span>
                    {proof.linkedProducts.map((p) => (
                      <div key={p.id} className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">&bull;</span>
                        {p.slug ? (
                          <Link
                            href={`/product/${p.slug}`}
                            className="text-[11px] font-medium text-[#e94560] hover:underline truncate"
                          >
                            {p.name}
                          </Link>
                        ) : (
                          <span className="text-[11px] font-medium text-gray-500 line-through truncate">
                            {p.name} (Deleted)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {sourceTypeLabel[proof.sourceType] || proof.sourceType}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
