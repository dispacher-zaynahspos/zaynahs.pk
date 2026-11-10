'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from '@/components/common/Icons';
import { getProductNavContext } from '@/lib/hooks/useProductNav';

interface ProductEditBackButtonProps {
  currentProductId: string;
}

export default function ProductEditBackButton({ currentProductId }: ProductEditBackButtonProps) {
  const router = useRouter();
  const [navSource, setNavSource] = useState<{ source: string; sourceUrl: string }>({
    source: 'Products',
    sourceUrl: '/admin/products',
  });

  useEffect(() => {
    const ctx = getProductNavContext(currentProductId);
    if (ctx.sourceUrl) {
      setNavSource({
        source: ctx.source || 'Products',
        sourceUrl: ctx.sourceUrl,
      });
    }
  }, [currentProductId]);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(navSource.sourceUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      id="product-edit-back-btn"
      className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#16162a] text-gray-700 dark:text-gray-200 text-xs font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm cursor-pointer"
      title={`Back to ${navSource.source}`}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back to {navSource.source}</span>
    </button>
  );
}
