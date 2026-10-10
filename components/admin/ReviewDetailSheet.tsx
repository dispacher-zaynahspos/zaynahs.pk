'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Review, Product } from '@/lib/types';
import StarRating from '@/components/store/StarRating';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { X, Check, EyeOff, Trash2, ExternalLink, Edit, Package, Phone, Mail, Search } from '@/components/common/Icons';
import Link from 'next/link';
import { getClientSiteUrl } from '@/lib/site-url';
import { cleanWhatsAppPhone } from '@/lib/utils/whatsapp';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import { getAllProductsAdmin } from '@/lib/services/products';
import { assignReviewProduct } from '@/lib/services/reviews';
import { rankProducts } from '@/lib/services/product-search/useInMemoryProductSearch';
import { toast } from 'sonner';

const FALLBACK_IMAGE = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f3f4f6'/%3E%3C/svg%3E";

interface ReviewDetailSheetProps {
  review: Review & { productName?: string; productImage?: string };
  onClose: () => void;
  onApprove: (id: string, approved: boolean) => void;
  onHide: (id: string, hidden: boolean) => void;
  onDelete: (id: string) => void;
  onAssignProduct?: (reviewId: string, productId: string | null, productName?: string, productImage?: string) => void;
  storeUrl?: string;
  storeName?: string;
}

export default function ReviewDetailSheet({ review, onClose, onApprove, onHide, onDelete, onAssignProduct, storeUrl, storeName }: ReviewDetailSheetProps) {
  const { confirm } = useConfirm();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Orphan-review product assignment
  const [products, setProducts] = useState<Product[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!showAssign || products.length > 0) return;
    getAllProductsAdmin().then(setProducts).catch(() => {});
  }, [showAssign, products.length]);

  const handleAssign = useCallback(async (productId: string | null) => {
    try {
      setAssigning(true);
      await assignReviewProduct(review.id, productId);
      const matched = productId ? products.find(p => p.id === productId) : undefined;
      const primaryImage = matched?.images?.find(i => i.is_primary)?.url || matched?.images?.[0]?.url;
      onAssignProduct?.(review.id, productId, matched?.name, primaryImage);
      toast.success(productId ? 'Review assigned to product' : 'Review detached (General / Store)');
      setShowAssign(false);
      onClose();
    } catch {
      toast.error('Failed to assign product');
    } finally {
      setAssigning(false);
    }
  }, [review.id, products, onAssignProduct, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);


  const formatDate = (dateStr: string) => {
    try { return formatDistanceToNow(parseISO(dateStr), { addSuffix: true }); }
    catch { return 'recently'; }
  };

  const siteUrl = storeUrl || getClientSiteUrl();
  const productSlug = review.productName?.toLowerCase().replace(/\s+/g, '-') || '';
  const productUrl = `${siteUrl}/product/${productSlug}`;

  const mailSubject = `Regarding Your Review on ${review.productName || 'Our Product'}`;
  const mailBody = [
    `Hi ${review.customer_name},`,
    '',
    `Thank you for your feedback on '${review.productName || 'Our Product'}' (${productUrl}).`,
    '',
    review.comment ? `Your Review: '${review.comment}'` : '',
    '',
    'Best regards,',
    storeName || 'Our Store Team'
  ].filter(Boolean).join('%0D%0A');

  const mailtoHref = `mailto:${review.customer_email}?subject=${encodeURIComponent(mailSubject)}&body=${mailBody}`;

  const reviewId = `#ZE-REV-${review.id.slice(0, 4).toUpperCase()}`;

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-3 sm:p-4"
      onClick={onClose}
      onTouchMove={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#16162a] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90dvh] sm:max-h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
        onWheel={handleWheel}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-[#16162a]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e94560]">
              REVIEW PROFILE PANEL &mdash; {reviewId}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain p-5 space-y-5">
          {/* Product Item Overview — image + info side by side */}
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Product Item Overview</h3>
            <div className="flex gap-3 bg-gray-50 dark:bg-[#0f0f1b]/50 rounded-xl p-3 border border-gray-100 dark:border-gray-800/20">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-800">
                {review.productImage ? (
                  <Image src={review.productImage} alt={review.productName || 'Product'} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug truncate">
                  {review.productName || (review.is_manual ? 'General / Store Review' : 'Unknown Product')}
                </p>
                <div className="flex items-center gap-1.5">
                  <StarRating rating={review.rating} showText={true} starSize={12} />
                  <span className="text-[10px] text-gray-400 font-medium">{formatDate(review.created_at)}</span>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  !review.approved
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    : review.hidden
                    ? 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-400'
                    : 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                }`}>
                  {!review.approved ? 'Pending' : review.hidden ? 'Hidden' : 'Approved'}
                </span>
                {review.productName && (
                  <div className="flex gap-2 text-[10px] pt-0.5">
                    <Link
                      href={`/product/${productSlug}`}
                      target="_blank"
                      className="flex items-center gap-0.5 text-[#e94560] hover:underline font-medium"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      View Storefront
                    </Link>
                    <Link
                      href={`/admin/products?id=${review.product_id}`}
                      className="flex items-center gap-0.5 text-[#e94560] hover:underline font-medium"
                    >
                      <Edit className="w-2.5 h-2.5" />
                      Edit Config
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Assign / Change Product (orphan review recovery) */}
            <div className="mt-2">
              {!showAssign ? (
                <button
                  type="button"
                  onClick={() => setShowAssign(true)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-[#e94560] hover:underline cursor-pointer"
                >
                  <Package className="w-3 h-3" />
                  {review.product_id ? 'Change / Reassign Product' : 'Assign to a Product'}
                </button>
              ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-[#0f0f1b]/50 overflow-hidden">
                  <div className="relative border-b border-gray-200 dark:border-gray-700">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products by name..."
                      className="w-full pl-9 pr-3 py-2.5 text-sm font-medium bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1.5">
                    {review.product_id && (
                      <button
                        type="button"
                        disabled={assigning}
                        onClick={() => handleAssign(null)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all cursor-pointer disabled:opacity-50"
                      >
                        Detach → General / Store Review
                      </button>
                    )}
                    {products.length === 0 && (
                      <p className="text-xs text-gray-400 italic text-center py-4">Loading products…</p>
                    )}
                    {(() => {
                      const filtered = rankProducts(products, productSearch);
                      if (products.length > 0 && filtered.length === 0) {
                        return <p className="text-xs text-gray-400 italic text-center py-4">No products match &quot;{productSearch}&quot;</p>;
                      }
                      return filtered.slice(0, 50).map((p) => {
                        const img = p.images?.find(i => i.is_primary)?.url || p.images?.[0]?.url;
                        const isCurrent = p.id === review.product_id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={assigning || isCurrent}
                            onClick={() => handleAssign(p.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-sm font-medium disabled:cursor-default ${
                              isCurrent
                                ? 'bg-[#e94560]/10 text-[#e94560]'
                                : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 cursor-pointer'
                            }`}
                          >
                            {img ? (
                              <img src={img} alt={p.name} className="w-8 h-8 rounded-md object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <span className="flex-1 min-w-0 truncate">{p.name}</span>
                            {isCurrent && <span className="text-[10px] font-bold flex-shrink-0">Current</span>}
                          </button>
                        );
                      });
                    })()}
                  </div>
                  <div className="flex justify-end px-2 py-1.5 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => { setShowAssign(false); setProductSearch(''); }}
                      className="text-[11px] font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Customer Account Intel */}
          <section className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Customer Account Intel (Admin Privacy Lookup)</h3>
            <div className="bg-gray-50 dark:bg-[#0f0f1b]/50 rounded-xl p-3 space-y-1.5 border border-gray-100 dark:border-gray-800/20 text-sm">
              <p className="text-gray-900 dark:text-white">
                <span className="text-gray-400 font-medium">&bull; Name:</span> {review.customer_name}
              </p>
              {review.customer_phone && (
                <p className="text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span className="text-gray-400 font-medium">&bull; WhatsApp:</span>
                   <a
                    href={`https://wa.me/${cleanWhatsAppPhone(review.customer_phone)}?text=${encodeURIComponent(`Hi ${review.customer_name},%0D%0A%0D%0AThank you for your review on ${review.productName || 'our product'}.%0D%0A%0D%0A${review.comment ? `Your feedback: '${review.comment}'%0D%0A%0D%0A` : ''}Best regards,%0D%0A${storeName || 'Our Store Team'}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#10b981] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {review.customer_phone}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </p>
              )}
              {review.customer_email && (
                <p className="text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span className="text-gray-400 font-medium">&bull; Email:</span>
                  <a
                    href={mailtoHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#e94560] hover:underline font-semibold flex items-center gap-1 break-all"
                  >
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    {review.customer_email}
                    <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                  </a>
                </p>
              )}
              {!review.customer_phone && !review.customer_email && (
                <p className="text-gray-400 italic">No contact details provided</p>
              )}
            </div>
          </section>

          {/* Full User Submitted Feedback */}
          <section className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Full User Submitted Feedback</h3>
            <div className="bg-gray-50 dark:bg-[#0f0f1b]/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800/20">
              {review.comment ? (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  &ldquo;{review.comment}&rdquo;
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">No written review provided</p>
              )}
            </div>
          </section>

          {/* Attached Customer Photos */}
          {(() => {
            const photoList = Array.isArray(review.images) && review.images.length > 0 
              ? review.images 
              : (review.screenshot_url ? [review.screenshot_url] : []);

            if (photoList.length === 0) return null;

            return (
              <section className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Attached Customer Photos ({photoList.length})
                </h3>
                <div className="flex flex-wrap gap-2.5 bg-gray-50 dark:bg-[#0f0f1b]/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800/20">
                  {photoList.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:scale-105 transition-transform"
                    >
                      <Image src={url} alt={`Review photo ${idx + 1}`} fill className="object-cover" sizes="80px" />
                    </a>
                  ))}
                </div>
              </section>
            );
          })()}
        </div>

        {/* Footer — Moderation Flow Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#16162a] flex-shrink-0">
          <button
            type="button"
            onClick={() => { onApprove(review.id, !review.approved); onClose(); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              review.approved
                ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-500'
                : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white dark:hover:bg-green-500'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{review.approved ? 'Unapprove Entry' : 'Approve Entry'}</span>
          </button>
          <button
            type="button"
            onClick={() => { onHide(review.id, !(review.hidden ?? false)); onClose(); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              review.hidden
                ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white dark:hover:bg-green-500'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-500'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>{review.hidden ? 'Show Feed' : 'Hide Feed'}</span>
          </button>
          <button
            type="button"
            onClick={async () => { 
              const confirmed = await confirm({
                title: 'Move to Trash',
                message: 'Are you sure you want to move this review to Trash?',
                variant: 'danger',
                confirmText: 'Move to Trash'
              });
              if (confirmed) { onDelete(review.id); onClose(); } 
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-500 text-xs font-bold transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Dump to Trash</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
