'use client';

import React, { useState, useCallback, useTransition, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Review, SocialProof } from '@/lib/types';
import { formatDistanceToNow, parseISO } from 'date-fns';

import ReviewsSummary from './components/ReviewsSummary';
import ReviewsToolbar, { SortKey } from './components/ReviewsToolbar';
import ReviewsTabs, { FilterTab } from './components/ReviewsTabs';
import ReviewsList from './components/ReviewsList';
import ProofWallGrid from './components/ProofWallGrid';
import ProofLightbox from './components/ProofLightbox';
import ReviewImageLightbox from './components/ReviewImageLightbox';
import WriteReviewModal from './components/WriteReviewModal';

interface ReviewsPageClientProps {
  initialReviews: (Review & { productName?: string; productImage?: string; productSlug?: string })[];
  initialTotal: number;
  initialSocialProofs: SocialProof[];
  storeUrl: string;
  ratingDistribution: Record<number, number>;
  products: { id: string; name: string; slug: string; image?: string; price?: number }[];
}

const itemsPerPage = 20;
const SORTS: SortKey[] = ['newest', 'oldest', 'highest', 'lowest'];

export default function ReviewsPageClient({
  initialReviews,
  initialTotal,
  initialSocialProofs,
  ratingDistribution,
  products,
}: ReviewsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL parameters (single source of truth)
  const tabFromUrl = (searchParams.get('tab') as FilterTab | null) || 'all';
  const searchFromUrl = searchParams.get('search') || '';
  const ratingFromUrl = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : 0;
  const rawSort = searchParams.get('sort') as SortKey | null;
  const sortFromUrl: SortKey = rawSort && SORTS.includes(rawSort) ? rawSort : 'newest';
  const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);

  const activeTab = tabFromUrl;
  const ratingFilter = ratingFromUrl >= 1 && ratingFromUrl <= 5 ? ratingFromUrl : 0;
  const sortBy = sortFromUrl;
  const page = pageFromUrl;

  const reviews = initialReviews;
  const total = initialTotal;
  const socialProofs = initialSocialProofs;
  const proofCount = socialProofs.length;

  // Local search input state
  const [search, setSearch] = useState(searchFromUrl);
  const searchRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  // Modals state
  const [activeProofIndex, setActiveProofIndex] = useState<number | null>(null);
  const [activeReviewImage, setActiveReviewImage] = useState<string | null>(null);
  const [writeModalOpen, setWriteModalOpen] = useState(false);

  // Overall average rating calculation
  const avgRating = useMemo(() => {
    const totalItems = reviews.length + proofCount;
    if (totalItems === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0) + proofCount * 5;
    return Math.round((sum / totalItems) * 10) / 10;
  }, [reviews, proofCount]);

  // URL builder for filters
  const buildUrl = useCallback(
    (overrides: Partial<{ tab: FilterTab; search: string; rating: number; sort: SortKey; page: number }>) => {
      const next = {
        tab: overrides.tab ?? activeTab,
        search: overrides.search ?? search,
        rating: overrides.rating ?? ratingFilter,
        sort: overrides.sort ?? sortBy,
        page: overrides.page ?? 1,
      };
      const sp = new URLSearchParams();
      if (next.tab && next.tab !== 'all') sp.set('tab', next.tab);
      if (next.search) sp.set('search', next.search);
      if (next.rating && next.rating > 0) sp.set('rating', String(next.rating));
      if (next.sort && next.sort !== 'newest') sp.set('sort', next.sort);
      if (next.page > 1) sp.set('page', String(next.page));
      const qs = sp.toString();
      return `/reviews${qs ? `?${qs}` : ''}`;
    },
    [activeTab, search, ratingFilter, sortBy]
  );

  const navigate = useCallback(
    (url: string) => {
      startTransition(() => {
        router.replace(url, { scroll: false });
      });
    },
    [router]
  );

  // Keep search box in sync on external URL changes
  useEffect(() => {
    if (document.activeElement !== searchRef.current && searchFromUrl !== search) {
      setSearch(searchFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFromUrl]);

  // Debounced search
  useEffect(() => {
    if (search === searchFromUrl) return;
    const t = setTimeout(() => {
      navigate(buildUrl({ search, page: 1 }));
    }, 300);
    return () => clearTimeout(t);
  }, [search, searchFromUrl, buildUrl, navigate]);

  const submitSearch = () => {
    if (search === searchFromUrl) return;
    navigate(buildUrl({ search, page: 1 }));
  };

  const changeTab = (tab: FilterTab) => navigate(buildUrl({ tab, page: 1 }));

  const handleRatingFilter = (rating: number) => {
    const newRating = rating === ratingFilter ? 0 : rating;
    navigate(buildUrl({ rating: newRating, page: 1 }));
  };

  const handleSort = (sort: SortKey) => navigate(buildUrl({ sort, page: 1 }));

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(total / itemsPerPage)) return;
    navigate(buildUrl({ page: newPage }));
  };

  const hasActiveFilters = ratingFilter > 0 || !!search || sortBy !== 'newest';
  const clearFilters = () => {
    setSearch('');
    navigate('/reviews');
  };

  const copyFilterLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  const sourceTypeLabel: Record<string, string> = {
    whatsapp: 'WhatsApp',
    instagram: 'Instagram DM',
    facebook: 'Facebook',
    manual: 'Customer Feedback',
  };

  const showReviews = activeTab === 'all' || activeTab === 'store';
  const showProofWall = activeTab === 'all' || activeTab === 'wall';

  return (
    <>
      <div className="min-h-screen">
        <div
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-[calc(20rem+env(safe-area-inset-bottom,0px))] md:pb-24"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Customer Reviews
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Real reviews and verified purchases from our valued customers.
            </p>
          </div>

          {/* ── SUMMARY BLOCK (Judge.me style: score + breakdown bars + write review CTA) ── */}
          <ReviewsSummary
            avgRating={avgRating}
            totalReviews={total + proofCount}
            proofCount={proofCount}
            distribution={ratingDistribution}
            activeRating={ratingFilter}
            onRatingFilter={handleRatingFilter}
            onWriteReview={() => setWriteModalOpen(true)}
          />

          {/* ── TABS (segmented control: All Reviews | Verified Store | Proof Wall) ── */}
          <ReviewsTabs
            activeTab={activeTab}
            onChangeTab={changeTab}
            total={total}
            proofCount={proofCount}
          />

          {/* ── TOOLBAR (search, star filter pills, sort dropdown) ── */}
          <ReviewsToolbar
            search={search}
            onSearchChange={setSearch}
            onSubmitSearch={submitSearch}
            searchRef={searchRef}
            ratingFilter={ratingFilter}
            onRatingFilter={handleRatingFilter}
            sortBy={sortBy}
            onSort={handleSort}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            copied={copied}
            onCopyLink={copyFilterLink}
            isPending={isPending}
            total={total}
          />

          {/* ── CONTENT SECTIONS ── */}
          <div className="space-y-8">
            {/* Reviews List */}
            {showReviews && (
              <div className="min-w-0">
                <ReviewsList
                  loading={isPending}
                  reviews={reviews}
                  search={search}
                  formatDate={formatDate}
                  setLightboxImage={setActiveReviewImage}
                  totalPages={totalPages}
                  page={page}
                  handlePageChange={handlePageChange}
                />
              </div>
            )}

            {/* Proof Wall Grid */}
            {showProofWall && (
              <ProofWallGrid
                socialProofs={socialProofs}
                activeTab={activeTab}
                sourceTypeLabel={sourceTypeLabel}
                onSelectProof={(idx) => setActiveProofIndex(idx)}
                showReviews={showReviews}
              />
            )}
          </div>

          {/* Bottom spacer for mobile bars and safe area clearance */}
          <div className="h-28 sm:h-16 w-full shrink-0 pointer-events-none" aria-hidden="true" />
        </div>
      </div>

      {/* Proof Wall Shared Modal Lightbox */}
      <ProofLightbox
        open={activeProofIndex !== null}
        onClose={() => setActiveProofIndex(null)}
        socialProofs={socialProofs}
        currentIndex={activeProofIndex ?? 0}
        onNavigate={(newIdx) => setActiveProofIndex(newIdx)}
        sourceTypeLabel={sourceTypeLabel}
      />

      {/* Review Photo Shared Modal Lightbox */}
      <ReviewImageLightbox
        open={activeReviewImage !== null}
        onClose={() => setActiveReviewImage(null)}
        imageUrl={activeReviewImage}
      />

      {/* Write a Review Modal */}
      <WriteReviewModal
        open={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
        products={products}
        onSubmitted={() => {
          startTransition(() => {
            router.refresh();
          });
        }}
      />
    </>
  );
}