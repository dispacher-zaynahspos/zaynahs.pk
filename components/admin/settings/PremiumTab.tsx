'use client';

import React, { useState } from 'react';
import { Product, StoreSettings } from '@/lib/types';
import MediaSelectorModal from '../MediaSelectorModal';

import { PremiumFeaturesChecklist } from './premium/PremiumFeaturesChecklist';
import { PremiumFlashSaleCard } from './premium/PremiumFlashSaleCard';
import { PremiumHeaderNewsCard } from './premium/PremiumHeaderNewsCard';
import { PremiumViewerAndTickerCard } from './premium/PremiumViewerAndTickerCard';
import { PremiumPopupsAndWheelSection } from './premium/PremiumPopupsAndWheelSection';
import { PremiumRecentBuyersSection } from './premium/PremiumRecentBuyersSection';

interface PremiumTabProps {
  initialSettings: StoreSettings;
  
  // Enabled/Disabled Switches
  recentBuyersEnabled: boolean;
  setRecentBuyersEnabled: (v: boolean) => void;
  cookieConsentEnabled: boolean;
  setCookieConsentEnabled: (v: boolean) => void;
  freeShippingBarEnabled: boolean;
  setFreeShippingBarEnabled: (v: boolean) => void;
  volumeDiscountsEnabled: boolean;
  setVolumeDiscountsEnabled: (v: boolean) => void;
  frequentlyBoughtTogetherEnabled: boolean;
  setFrequentlyBoughtTogetherEnabled: (v: boolean) => void;
  stockUrgencyEnabled: boolean;
  setStockUrgencyEnabled: (v: boolean) => void;
  flashSaleEnabled: boolean;
  setFlashSaleEnabled: (v: boolean) => void;
  flashSaleStartDate: string;
  setFlashSaleStartDate: (v: string) => void;
  flashSaleEndDate: string;
  setFlashSaleEndDate: (v: string) => void;
  globalFlashSaleDiscountType: 'percentage' | 'fixed';
  setGlobalFlashSaleDiscountType: (v: 'percentage' | 'fixed') => void;
  globalFlashSaleDiscountValue: number;
  setGlobalFlashSaleDiscountValue: (v: number) => void;
  socialFeedsEnabled: boolean;
  setSocialFeedsEnabled: (v: boolean) => void;
  cartTimerEnabled: boolean;
  setCartTimerEnabled: (v: boolean) => void;
  sizeGuideEnabled: boolean;
  setSizeGuideEnabled: (v: boolean) => void;
  couponCodesEnabled: boolean;
  setCouponCodesEnabled: (v: boolean) => void;

  enableFakeViews: boolean;
  setEnableFakeViews: (v: boolean) => void;
  minViews: number;
  setMinViews: (v: number) => void;
  maxViews: number;
  setMaxViews: (v: number) => void;

  // Exit Intent Popup
  exitIntentEnabled: boolean;
  setExitIntentEnabled: (v: boolean) => void;
  exitIntentTitle: string;
  setExitIntentTitle: (v: string) => void;
  exitIntentText: string;
  setExitIntentText: (v: string) => void;
  exitIntentCoupon: string;
  setExitIntentCoupon: (v: string) => void;
  exitIntentImageUrl: string;
  setExitIntentImageUrl: (v: string) => void;
  exitIntentDelayMobile: number;
  setExitIntentDelayMobile: (v: number) => void;

  // Cookie Consent Banner
  cookieConsentText: string;
  setCookieConsentText: (v: string) => void;
  cookieConsentButtonText: string;
  setCookieConsentButtonText: (v: string) => void;

  // Spin to Win
  spinWheelEnabled: boolean;
  setSpinWheelEnabled: (v: boolean) => void;
  spinWheelSegments: string[];
  setSpinWheelSegments: (v: string[]) => void;

  // Urgency & Shipping
  cartTimerMinutes: number;
  setCartTimerMinutes: (v: number) => void;
  cartTimerMessage: string;
  setCartTimerMessage: (v: string) => void;
  freeShippingThreshold: number;
  setFreeShippingThreshold: (v: number) => void;
  recentlyViewedLimit: number;
  setRecentlyViewedLimit: (v: number) => void;

  // Volume Discounts
  volumeDiscountThreshold: number;
  setVolumeDiscountThreshold: (v: number) => void;
  volumeDiscountPercentage: number;
  setVolumeDiscountPercentage: (v: number) => void;

  // Recent Buyers Popups
  recentBuyersSource: 'simulated' | 'real';
  setRecentBuyersSource: (v: 'simulated' | 'real') => void;
  recentBuyersNames: string;
  setRecentBuyersNames: (v: string) => void;
  recentBuyersCities: string;
  setRecentBuyersCities: (v: string) => void;
  recentBuyersProductPool: 'any' | 'featured' | 'sale' | 'recent' | 'custom';
  setRecentBuyersProductPool: (v: 'any' | 'featured' | 'sale' | 'recent' | 'custom') => void;
  recentBuyersCustomProducts: string[];
  setRecentBuyersCustomProducts: React.Dispatch<React.SetStateAction<string[]>>;
  productsList: Product[];
  recentBuyersInitialDelay: number;
  setRecentBuyersInitialDelay: (v: number) => void;
  recentBuyersInterval: number;
  setRecentBuyersInterval: (v: number) => void;
  recentBuyersDisplayDuration: number;
  setRecentBuyersDisplayDuration: (v: number) => void;
  recentBuyersShowOnCheckout: boolean;
  setRecentBuyersShowOnCheckout: (v: boolean) => void;

  // Image Upload Handlers
  handleRemoveImage: (type: 'logo' | 'favicon' | 'banner' | 'exit_intent') => void;

  // Announcement Bar properties
  headerShowNewsletter: boolean;
  setHeaderShowNewsletter: (v: boolean) => void;
  headerNewsletterText: string;
  setHeaderNewsletterText: (v: string) => void;
  headerShowTopBar: boolean;
  setHeaderShowTopBar: (v: boolean) => void;
  headerTopBarPhone: string;
  setHeaderTopBarPhone: (v: string) => void;
  headerTopBarEmail: string;
  setHeaderTopBarEmail: (v: string) => void;

  enableTicker: boolean;
  setEnableTicker: (v: boolean) => void;
  tickerText: string;
  setTickerText: (v: string) => void;
}

export default function PremiumTab({
  recentBuyersEnabled,
  setRecentBuyersEnabled,
  cookieConsentEnabled,
  setCookieConsentEnabled,
  freeShippingBarEnabled,
  setFreeShippingBarEnabled,
  frequentlyBoughtTogetherEnabled,
  setFrequentlyBoughtTogetherEnabled,
  stockUrgencyEnabled,
  setStockUrgencyEnabled,
  flashSaleEnabled,
  setFlashSaleEnabled,
  flashSaleStartDate,
  setFlashSaleStartDate,
  flashSaleEndDate,
  setFlashSaleEndDate,
  globalFlashSaleDiscountType,
  setGlobalFlashSaleDiscountType,
  globalFlashSaleDiscountValue,
  setGlobalFlashSaleDiscountValue,
  socialFeedsEnabled,
  setSocialFeedsEnabled,
  cartTimerEnabled,
  setCartTimerEnabled,
  sizeGuideEnabled,
  setSizeGuideEnabled,
  couponCodesEnabled,
  setCouponCodesEnabled,
  enableFakeViews,
  setEnableFakeViews,
  minViews,
  setMinViews,
  maxViews,
  setMaxViews,
  exitIntentEnabled,
  setExitIntentEnabled,
  exitIntentTitle,
  setExitIntentTitle,
  exitIntentText,
  setExitIntentText,
  exitIntentCoupon,
  setExitIntentCoupon,
  exitIntentImageUrl,
  setExitIntentImageUrl,
  exitIntentDelayMobile,
  setExitIntentDelayMobile,
  cookieConsentText,
  setCookieConsentText,
  cookieConsentButtonText,
  setCookieConsentButtonText,
  spinWheelEnabled,
  setSpinWheelEnabled,
  spinWheelSegments,
  setSpinWheelSegments,
  recentBuyersSource,
  setRecentBuyersSource,
  recentBuyersNames,
  setRecentBuyersNames,
  recentBuyersCities,
  setRecentBuyersCities,
  recentBuyersProductPool,
  setRecentBuyersProductPool,
  recentBuyersCustomProducts,
  setRecentBuyersCustomProducts,
  productsList,
  recentBuyersInitialDelay,
  setRecentBuyersInitialDelay,
  recentBuyersInterval,
  setRecentBuyersInterval,
  recentBuyersDisplayDuration,
  setRecentBuyersDisplayDuration,
  recentBuyersShowOnCheckout,
  setRecentBuyersShowOnCheckout,
  handleRemoveImage,
  headerShowNewsletter,
  setHeaderShowNewsletter,
  headerNewsletterText,
  setHeaderNewsletterText,
  headerShowTopBar,
  setHeaderShowTopBar,
  headerTopBarPhone,
  setHeaderTopBarPhone,
  headerTopBarEmail,
  setHeaderTopBarEmail,
  enableTicker,
  setEnableTicker,
  tickerText,
  setTickerText
}: PremiumTabProps) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectingType, setSelectingType] = useState<'exit_intent' | null>(null);

  return (
    <div className="space-y-6">
      {/* Active Features Checklist Toggle */}
      <PremiumFeaturesChecklist
        recentBuyersEnabled={recentBuyersEnabled}
        setRecentBuyersEnabled={setRecentBuyersEnabled}
        cookieConsentEnabled={cookieConsentEnabled}
        setCookieConsentEnabled={setCookieConsentEnabled}
        freeShippingBarEnabled={freeShippingBarEnabled}
        setFreeShippingBarEnabled={setFreeShippingBarEnabled}
        frequentlyBoughtTogetherEnabled={frequentlyBoughtTogetherEnabled}
        setFrequentlyBoughtTogetherEnabled={setFrequentlyBoughtTogetherEnabled}
        stockUrgencyEnabled={stockUrgencyEnabled}
        setStockUrgencyEnabled={setStockUrgencyEnabled}
        flashSaleEnabled={flashSaleEnabled}
        setFlashSaleEnabled={setFlashSaleEnabled}
        socialFeedsEnabled={socialFeedsEnabled}
        setSocialFeedsEnabled={setSocialFeedsEnabled}
        cartTimerEnabled={cartTimerEnabled}
        setCartTimerEnabled={setCartTimerEnabled}
        sizeGuideEnabled={sizeGuideEnabled}
        setSizeGuideEnabled={setSizeGuideEnabled}
        couponCodesEnabled={couponCodesEnabled}
        setCouponCodesEnabled={setCouponCodesEnabled}
        enableFakeViews={enableFakeViews}
        setEnableFakeViews={setEnableFakeViews}
      />

      {/* Storewide Flash Sale */}
      <PremiumFlashSaleCard
        flashSaleEnabled={flashSaleEnabled}
        setFlashSaleEnabled={setFlashSaleEnabled}
        flashSaleStartDate={flashSaleStartDate}
        setFlashSaleStartDate={setFlashSaleStartDate}
        flashSaleEndDate={flashSaleEndDate}
        setFlashSaleEndDate={setFlashSaleEndDate}
        globalFlashSaleDiscountType={globalFlashSaleDiscountType}
        setGlobalFlashSaleDiscountType={setGlobalFlashSaleDiscountType}
        globalFlashSaleDiscountValue={globalFlashSaleDiscountValue}
        setGlobalFlashSaleDiscountValue={setGlobalFlashSaleDiscountValue}
      />

      {/* Header Announcement & News Bar */}
      <PremiumHeaderNewsCard
        headerShowNewsletter={headerShowNewsletter}
        setHeaderShowNewsletter={setHeaderShowNewsletter}
        headerNewsletterText={headerNewsletterText}
        setHeaderNewsletterText={setHeaderNewsletterText}
        headerShowTopBar={headerShowTopBar}
        setHeaderShowTopBar={setHeaderShowTopBar}
        headerTopBarPhone={headerTopBarPhone}
        setHeaderTopBarPhone={setHeaderTopBarPhone}
        headerTopBarEmail={headerTopBarEmail}
        setHeaderTopBarEmail={setHeaderTopBarEmail}
      />

      {/* Live Viewer Counter & Scrolling Announcement Ticker */}
      <PremiumViewerAndTickerCard
        enableFakeViews={enableFakeViews}
        setEnableFakeViews={setEnableFakeViews}
        minViews={minViews}
        setMinViews={setMinViews}
        maxViews={maxViews}
        setMaxViews={setMaxViews}
        enableTicker={enableTicker}
        setEnableTicker={setEnableTicker}
        tickerText={tickerText}
        setTickerText={setTickerText}
      />

      {/* Exit Intent, Cookie Consent & Spin Wheel */}
      <PremiumPopupsAndWheelSection
        exitIntentEnabled={exitIntentEnabled}
        setExitIntentEnabled={setExitIntentEnabled}
        exitIntentTitle={exitIntentTitle}
        setExitIntentTitle={setExitIntentTitle}
        exitIntentText={exitIntentText}
        setExitIntentText={setExitIntentText}
        exitIntentCoupon={exitIntentCoupon}
        setExitIntentCoupon={setExitIntentCoupon}
        exitIntentImageUrl={exitIntentImageUrl}
        setExitIntentImageUrl={setExitIntentImageUrl}
        exitIntentDelayMobile={exitIntentDelayMobile}
        setExitIntentDelayMobile={setExitIntentDelayMobile}
        handleRemoveImage={handleRemoveImage}
        setSelectingType={setSelectingType}
        setIsMediaModalOpen={setIsMediaModalOpen}
        cookieConsentEnabled={cookieConsentEnabled}
        setCookieConsentEnabled={setCookieConsentEnabled}
        cookieConsentText={cookieConsentText}
        setCookieConsentText={setCookieConsentText}
        cookieConsentButtonText={cookieConsentButtonText}
        setCookieConsentButtonText={setCookieConsentButtonText}
        spinWheelEnabled={spinWheelEnabled}
        setSpinWheelEnabled={setSpinWheelEnabled}
        spinWheelSegments={spinWheelSegments}
        setSpinWheelSegments={setSpinWheelSegments}
      />

      {/* Recent Buyers Advanced Settings */}
      <PremiumRecentBuyersSection
        recentBuyersEnabled={recentBuyersEnabled}
        setRecentBuyersEnabled={setRecentBuyersEnabled}
        recentBuyersShowOnCheckout={recentBuyersShowOnCheckout}
        setRecentBuyersShowOnCheckout={setRecentBuyersShowOnCheckout}
        recentBuyersSource={recentBuyersSource}
        setRecentBuyersSource={setRecentBuyersSource}
        recentBuyersNames={recentBuyersNames}
        setRecentBuyersNames={setRecentBuyersNames}
        recentBuyersCities={recentBuyersCities}
        setRecentBuyersCities={setRecentBuyersCities}
        recentBuyersProductPool={recentBuyersProductPool}
        setRecentBuyersProductPool={setRecentBuyersProductPool}
        recentBuyersCustomProducts={recentBuyersCustomProducts}
        setRecentBuyersCustomProducts={setRecentBuyersCustomProducts}
        productsList={productsList}
        recentBuyersInitialDelay={recentBuyersInitialDelay}
        setRecentBuyersInitialDelay={setRecentBuyersInitialDelay}
        recentBuyersInterval={recentBuyersInterval}
        setRecentBuyersInterval={setRecentBuyersInterval}
        recentBuyersDisplayDuration={recentBuyersDisplayDuration}
        setRecentBuyersDisplayDuration={setRecentBuyersDisplayDuration}
      />

      <MediaSelectorModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setSelectingType(null);
        }}
        onSelect={(urls) => {
          if (urls.length > 0) {
            if (selectingType === 'exit_intent') {
              setExitIntentImageUrl(urls[0]);
            }
          }
          setIsMediaModalOpen(false);
          setSelectingType(null);
        }}
        multiple={false}
      />
    </div>
  );
}
