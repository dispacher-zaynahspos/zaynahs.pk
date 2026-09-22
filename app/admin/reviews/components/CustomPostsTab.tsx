'use client';

import React from 'react';
import { SocialProof } from '@/lib/types';
import { Image, Edit, Trash2 } from '@/components/common/Icons';

interface CustomPostsTabProps {
  socialProofs: SocialProof[];
  formatDate: (dateStr: string) => string;
  onEdit: (proof: SocialProof) => void;
  onDelete: (id: string) => void;
}

export default function CustomPostsTab({
  socialProofs,
  formatDate,
  onEdit,
  onDelete,
}: CustomPostsTabProps) {
  if (socialProofs.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center space-y-3">
        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full text-gray-400">
          <Image className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No custom posts yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Upload WhatsApp screenshots or social proof using the &quot;Post Customer Content&quot; button.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {socialProofs.map((proof) => (
        <div
          key={proof.id}
          className="bg-white dark:bg-[#16162a] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800">
            <img src={proof.imageUrl} alt={proof.caption || 'Social proof'} className="w-full h-full object-contain" />
          </div>
          <div className="p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {proof.sourceType}
              </span>
              <span className="text-[10px] text-gray-400">{formatDate(proof.createdAt)}</span>
            </div>
            {proof.caption && (
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">{proof.caption}</p>
            )}
            {proof.linkedProducts && proof.linkedProducts.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {proof.linkedProducts.map((p) => (
                  <span key={p.id} className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
                    {p.name}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => onEdit(proof)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => onDelete(proof.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
