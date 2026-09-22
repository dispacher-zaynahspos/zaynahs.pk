'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { getAllReviews, approveReview, deleteReview, hideShowReview } from '@/lib/services/reviews';
import { getAllSocialProofs, deleteSocialProof } from '@/lib/services/social-proof';
import { SocialProof } from '@/lib/types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Plus, Image } from '@/components/common/Icons';
import { toast } from 'sonner';
import { useAdminTab } from '@/lib/hooks/useAdminTab';
import { getClientSiteUrl } from '@/lib/site-url';
import { useConfirm } from '@/components/admin/shared/AdminConfirmProvider';
import ReviewDetailSheet from '@/components/admin/ReviewDetailSheet';
import PostReviewModal from '@/components/admin/PostReviewModal';
import ReviewImageZoomModal from '@/components/store/ReviewImageZoomModal';

import {
  ReviewWithProduct,
  CustomPostsTab,
  ReviewMediaTab,
  ReviewsTable,
} from './components';

function AdminReviewsPageInner() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [socialProofs, setSocialProofs] = useState<SocialProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useAdminTab<'all' | 'pending' | 'approved' | 'custom' | 'review_media'>('all');
  const { confirm } = useConfirm();
  const [selectedReview, setSelectedReview] = useState<ReviewWithProduct | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editProof, setEditProof] = useState<SocialProof | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const allReviewPhotos = reviews.flatMap(review => {
    const list = Array.isArray(review.images) && review.images.length > 0 
      ? review.images 
      : (review.screenshotUrl ? [review.screenshotUrl] : []);

    return list.map((url, idx) => ({
      id: `${review.id}-${idx}`,
      url,
      reviewId: review.id,
      review,
      customerName: review.customerName,
      productName: review.productName,
      productImage: review.productImage,
      rating: review.rating,
      createdAt: review.createdAt
    }));
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [revs, proofs] = await Promise.all([
        getAllReviews(),
        getAllSocialProofs()
      ]);
      setReviews(revs);
      setSocialProofs(proofs);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleApprove = async (id: string, currentApproved: boolean) => {
    try {
      await approveReview(id, !currentApproved);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, approved: !currentApproved } : r))
      );
      toast.success(currentApproved ? 'Review unapproved' : 'Review approved');
    } catch {
      toast.error('Failed to update review status');
    }
  };

  const handleToggleHide = async (id: string, currentHidden: boolean) => {
    try {
      await hideShowReview(id, !currentHidden);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, hidden: !currentHidden } : r))
      );
      toast.success(currentHidden ? 'Review is now visible' : 'Review hidden');
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Move Review to Trash',
      message: 'Are you sure you want to move this review to Trash? It can be restored later from the Trash Bin.',
      variant: 'danger',
      confirmText: 'Move to Trash'
    });
    if (!confirmed) return;

    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review moved to Trash');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const handleDeleteProof = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Social Proof',
      message: 'Delete this social proof entry?',
      variant: 'danger',
      confirmText: 'Delete'
    });
    if (!confirmed) return;
    try {
      await deleteSocialProof(id);
      setSocialProofs((prev) => prev.filter((p) => p.id !== id));
      toast.success('Custom post deleted');
    } catch {
      toast.error('Failed to delete custom post');
    }
  };

  const handleOpenReview = (review: ReviewWithProduct) => {
    setSelectedReview(review);
  };

  const handleDeleteSinglePhoto = async (reviewId: string, photoUrl: string) => {
    const confirmed = await confirm({
      title: 'Move Photo to Trash',
      message: 'Are you sure you want to remove this photo from customer review and move it to Trash? (The rest of the review will remain active)',
      variant: 'danger',
      confirmText: 'Move Photo to Trash'
    });
    if (!confirmed) return;

    try {
      const { deleteSingleReviewPhoto } = await import('@/lib/services/reviews');
      await deleteSingleReviewPhoto(reviewId, photoUrl);

      // Update local state: remove photo from review images
      setReviews(prev => prev.map(r => {
        if (r.id === reviewId) {
          const updatedImages = (r.images || []).filter(img => img !== photoUrl);
          const updatedScreenshot = r.screenshotUrl === photoUrl ? undefined : r.screenshotUrl;
          return { ...r, images: updatedImages, screenshotUrl: updatedScreenshot };
        }
        return r;
      }));

      toast.success('Photo moved to Trash (Review remains active)');
    } catch {
      toast.error('Failed to move photo to trash');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (activeTab === 'pending') return !review.approved;
    if (activeTab === 'approved') return review.approved;
    if (activeTab === 'review_media') return (Array.isArray(review.images) && review.images.length > 0) || Boolean(review.screenshotUrl);
    if (activeTab === 'custom') return false;
    return true;
  });

  const formatDate = (dateStr: string) => {
    try { return formatDistanceToNow(parseISO(dateStr), { addSuffix: true }); }
    catch { return 'recently'; }
  };

  const countByTab = (tab: string) => {
    if (tab === 'custom') return socialProofs.length;
    if (tab === 'review_media') {
      return reviews.filter(r => (Array.isArray(r.images) && r.images.length > 0) || Boolean(r.screenshotUrl)).length;
    }
    return reviews.filter(r => {
      if (tab === 'pending') return !r.approved;
      if (tab === 'approved') return r.approved;
      return true;
    }).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Product Reviews</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Moderate customer ratings, feedback, review media & social proof</p>
        </div>
        <button
          onClick={() => { setEditProof(null); setShowPostModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a2e] hover:bg-[#e94560] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Post Customer Content
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-1.5 overflow-x-auto">
        {(['all', 'pending', 'approved', 'custom', 'review_media'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab
                ? 'border-[#e94560] text-[#e94560]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab === 'custom' ? (
              <>
                <Image className="w-3.5 h-3.5" />
                Custom Posts
              </>
            ) : tab === 'review_media' ? (
              <>
                <Image className="w-3.5 h-3.5" />
                Review Media
              </>
            ) : (
              tab.charAt(0).toUpperCase() + tab.slice(1)
            )}
            <span className="text-xs bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {countByTab(tab)}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'custom' ? (
        <CustomPostsTab
          socialProofs={socialProofs}
          formatDate={formatDate}
          onEdit={(proof) => { setEditProof(proof); setShowPostModal(true); }}
          onDelete={handleDeleteProof}
        />
      ) : activeTab === 'review_media' ? (
        <ReviewMediaTab
          allReviewPhotos={allReviewPhotos}
          onZoomImage={(url) => setZoomImageUrl(url)}
          onOpenReview={handleOpenReview}
          onDeleteSinglePhoto={handleDeleteSinglePhoto}
        />
      ) : (
        <ReviewsTable
          filteredReviews={filteredReviews}
          formatDate={formatDate}
          onOpenReview={handleOpenReview}
          onToggleApprove={handleToggleApprove}
          onToggleHide={handleToggleHide}
          onDelete={handleDelete}
        />
      )}

      {selectedReview && (
        <ReviewDetailSheet
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onApprove={(id, approved) => handleToggleApprove(id, approved)}
          onHide={(id, hidden) => handleToggleHide(id, hidden)}
          onDelete={(id) => handleDelete(id)}
          storeUrl={getClientSiteUrl()}
        />
      )}

      {showPostModal && (
        <PostReviewModal
          isOpen={showPostModal}
          onClose={() => { setShowPostModal(false); setEditProof(null); }}
          onSuccess={() => loadData()}
          editProof={editProof}
        />
      )}

      {zoomImageUrl && (
        <ReviewImageZoomModal
          isOpen={Boolean(zoomImageUrl)}
          imageUrl={zoomImageUrl}
          onClose={() => setZoomImageUrl(null)}
        />
      )}
    </div>
  );
}

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />}>
      <AdminReviewsPageInner />
    </Suspense>
  );
}
