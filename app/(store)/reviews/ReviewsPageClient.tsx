'use client';

import React, { useState, useCallback, useTransition, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Review, SocialProof } from '@/lib/types';
import ReviewImageZoomModal from '@/components/store/ReviewImageZoomModal';
import { Search, Star, Link as LinkIcon, Check, ShoppingBag, MessageCircle } from '@/components/common/Icons';
import { formatDistanceToNow, parseISO } from 'date-fns';
import ReviewsList from './components/ReviewsList';
import ProofWallGrid from './components/ProofWallGrid';

interface ReviewsPageClientProps {
  initialReviews: (Review & { productName?: string; productImage?: string; productSlug?: string })[];
  initialTotal: number;
  initialSocialProofs: SocialProof[];
  storeUrl: string;
}

type FilterTab = 'all' | 'store' | 'wall';
type SortKey = 'newest' | 'oldest' | 'highest' | 'lowest';

const itemsPerPage = 20;
const SORTS: SortKey[] = ['newest', 'oldest', 'highest', 'lowest'];

export default function ReviewsPageClient({
  initialReviews,
  initialTotal,
  initialSocialProofs,
}: ReviewsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // --- URL is the SINGLE SOURCE OF TRUTH. The server component (page.tsx)
  // reads these same searchParams and fetches the data, passing it down as
  // props. We NEVER fetch on the client here — a filter action performs exactly
  // ONE navigation (router.replace) which triggers exactly ONE server fetch.
  // (Previously this component did router.push AND a duplicate client fetch,
  // causing 2 fetches per click + hitting the apex/www redirect loop.) ---
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

  // Reviews/total come straight from server props (they update on navigation).
  const reviews = initialReviews;
  const total = initialTotal;

  // Local, controlled text for the search box only. Kept in sync with the URL
  // for back/forward navigation, but never clobbers what the user is typing.
  const [search, setSearch] = useState(searchFromUrl);
  const searchRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const socialProofs = initialSocialProofs;
  const proofCount = socialProofs.length;

  const avgRating = useMemo(() => {
    const totalItems = reviews.length + proofCount;
    if (totalItems === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0) + proofCount * 5;
    return Math.round((sum / totalItems) * 10) / 10;
  }, [reviews, proofCount]);

  // Build the canonical URL from a partial set of params (URL = source of truth).
  const buildUrl = useCallback((overrides: Partial<{ tab: FilterTab; search: string; rating: number; sort: SortKey; page: number }>) => {
    const next = {
      tab: overrides.tab ?? activeTab,
      search: overrides.search ?? search,
      rating: overrides.rating ?? ratingFilter,
      sort: overrides.sort ?? sortBy,
      page: overrides.page ?? 1, // any filter change resets to page 1 unless page given
    };
    const sp = new URLSearchParams();
    if (next.tab && next.tab !== 'all') sp.set('tab', next.tab);
    if (next.search) sp.set('search', next.search);
    if (next.rating && next.rating > 0) sp.set('rating', String(next.rating));
    if (next.sort && next.sort !== 'newest') sp.set('sort', next.sort);
    if (next.page > 1) sp.set('page', String(next.page));
    const qs = sp.toString();
    return `/reviews${qs ? `?${qs}` : ''}`;
  }, [activeTab, search, ratingFilter, sortBy]);

  const navigate = useCallback((url: string) => {
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }, [router]);

  // Keep the search box in sync when the URL changes externally (back/forward,
  // Copy Filter Link). Never overwrite while the user is actively typing.
  useEffect(() => {
    if (document.activeElement !== searchRef.current && searchFromUrl !== search) {
      setSearch(searchFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFromUrl]);

  // Debounced live search: one navigation 300ms after the user stops typing.
  // Guarded so it only fires when the value actually differs from the URL,
  // which prevents any set-URL -> re-render -> set-URL loop.
  useEffect(() => {
    if (search === searchFromUrl) return;
    const t = setTimeout(() => {
      navigate(buildUrl({ search, page: 1 }));
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
    try { return formatDistanceToNow(parseISO(dateStr), { addSuffix: true }); }
    catch { return 'recently'; }
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  const sourceTypeLabel: Record<string, string> = {
    whatsapp: 'WhatsApp',
    instagram: 'Instagram DM',
    facebook: 'Facebook',
    manual: 'Customer Feedback',
  };

  const tabs: { key: FilterTab; label: string; icon?: React.ReactNode }[] = [
    { key: 'all', label: 'All Reviews' },
    { key: 'store', label: 'Verified Store', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { key: 'wall', label: 'Proof Wall', icon: <MessageCircle className="w-3.5 h-3.5" /> },
  ];

  const showReviews = activeTab === 'all' || activeTab === 'store';
  const showProofWall = activeTab === 'all' || activeTab === 'wall';

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f1b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              Customer Reviews
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              See what our customers are saying. Every review is from a real purchase.
            </p>
            {total + proofCount > 0 && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-6 h-6 ${star <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-bold text-gray-900 dark:text-white">{avgRating}</span> out of 5 based on{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{total + proofCount}</span> rating{(total + proofCount) !== 1 ? 's' : ''}
                </p>
                {proofCount > 0 && (
                  <span className="text-[10px] font-medium text-gray-400">(Includes Verified + Proof Wall)</span>
                )}
              </div>
            )}
          </div>

          {/* ── GLOBAL SEARCH & FILTERS (aligned, sticky toolbar) ── */}
          <div className="sticky top-2 z-20 bg-white/95 dark:bg-[#16162a]/95 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 mb-6 space-y-4 shadow-sm">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                  placeholder="Search by product name..."
                  aria-label="Search reviews by product name"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#0f0f1b]/50 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#e94560] focus:outline-none transition-all"
                />
              </div>
              <button
                onClick={submitSearch}
                className="h-11 px-4 rounded-xl bg-[#1a1a2e] hover:bg-[#e94560] text-white text-sm font-bold transition-all cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 shrink-0">Filter by:</span>
              <div className="flex flex-row flex-nowrap overflow-x-auto scrollbar-none gap-2 pb-2 w-full" role="group" aria-label="Filter by star rating">
                {[5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingFilter(star)}
                    aria-pressed={ratingFilter === star}
                    aria-label={`${star} star reviews`}
                    className={`flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      ratingFilter === star
                        ? 'bg-[#e94560] text-white border-none shadow-sm'
                        : 'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className={ratingFilter === star ? 'text-white' : 'text-amber-400'}>★</span>
                    <span>{star}</span>
                  </button>
                ))}
              </div>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-xs font-bold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value as SortKey)}
                  aria-label="Sort reviews"
                  className="text-xs font-bold bg-transparent text-gray-600 dark:text-gray-300 border-none focus:outline-none cursor-pointer py-1"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto h-8 px-3 rounded-lg text-[11px] font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:text-[#e94560] hover:border-[#e94560]/30 transition-all cursor-pointer shrink-0"
                >
                  Clear filters
                </button>
              )}
            </div>
            <p aria-live="polite" className="sr-only">
              {isPending ? 'Loading reviews' : `${total} review${total !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* ── TAB SWITCHER ── */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => changeTab(t.key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === t.key
                    ? 'bg-[#1a1a2e] dark:bg-white text-white dark:text-[#1a1a2e] shadow-sm'
                    : 'bg-white dark:bg-[#16162a] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={copyFilterLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-[#16162a] border border-gray-200 dark:border-gray-800 hover:text-[#e94560] hover:border-[#e94560]/30 transition-all cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <LinkIcon className="w-3.5 h-3.5" />
              )}
              {copied ? 'Copied!' : 'Copy Filter Link'}
            </button>
          </div>

          {/* ── TWO-COLUMN CONTENT ── */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            {/* ── SIDE A: REVIEWS ── */}
            {showReviews && (
              <div className="flex-1 min-w-0">
                <ReviewsList
                  loading={isPending}
                  reviews={reviews}
                  search={search}
                  formatDate={formatDate}
                  setLightboxImage={setLightboxImage}
                  totalPages={totalPages}
                  page={page}
                  handlePageChange={handlePageChange}
                />
              </div>
            )}

            {/* ── SIDE B: PROOF WALL ── */}
            {showProofWall && (
              <ProofWallGrid
                socialProofs={socialProofs}
                activeTab={activeTab}
                sourceTypeLabel={sourceTypeLabel}
                setLightboxImage={setLightboxImage}
                showReviews={showReviews}
              />
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ReviewImageZoomModal
        isOpen={lightboxImage !== null}
        imageUrl={lightboxImage ?? ''}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
}