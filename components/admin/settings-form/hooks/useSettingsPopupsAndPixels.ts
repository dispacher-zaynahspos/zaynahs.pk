'use client';

import { useState } from 'react';
import { StoreSettings } from '@/lib/types';

interface UseSettingsPopupsAndPixelsProps {
  initialSettings: StoreSettings;
}

export function useSettingsPopupsAndPixels({ initialSettings }: UseSettingsPopupsAndPixelsProps) {
  // Premium & Popup Features States
  const [exitIntentEnabled, setExitIntentEnabled] = useState(initialSettings.exit_intent_enabled ?? false);
  const [exitIntentTitle, setExitIntentTitle] = useState(initialSettings.exit_intent_title ?? 'Wait! Get a Special Discount');
  const [exitIntentText, setExitIntentText] = useState(
    initialSettings.exit_intent_text ?? 'Submit your WhatsApp number to unlock a secret coupon code.'
  );
  const [exitIntentCoupon, setExitIntentCoupon] = useState(initialSettings.exit_intent_coupon ?? 'WELCOME10');
  const [spinWheelEnabled, setSpinWheelEnabled] = useState(initialSettings.spin_wheel_enabled ?? false);
  const [spinWheelSegments, setSpinWheelSegments] = useState<string[]>(
    Array.isArray(initialSettings.spin_wheel_segments)
      ? initialSettings.spin_wheel_segments
      : typeof initialSettings.spin_wheel_segments === 'string'
      ? JSON.parse(initialSettings.spin_wheel_segments)
      : ['Try Again', '5% Off', 'Free Shipping', '10% Off', 'Free Delivery', 'WELCOME15']
  );
  const [cartTimerMinutes, setCartTimerMinutes] = useState(initialSettings.cart_timer_minutes ?? 10);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(initialSettings.free_shipping_threshold ?? 2000);
  const [volumeDiscountThreshold, setVolumeDiscountThreshold] = useState(
    initialSettings.volume_discount_threshold ?? 3
  );
  const [volumeDiscountPercentage, setVolumeDiscountPercentage] = useState(
    initialSettings.volume_discount_percentage ?? 10
  );
  const [recentBuyersStr, setRecentBuyersStr] = useState(
    typeof initialSettings.recent_buyers === 'string'
      ? initialSettings.recent_buyers
      : JSON.stringify(initialSettings.recent_buyers ?? [])
  );
  const [recentlyViewedLimit, setRecentlyViewedLimit] = useState(initialSettings.recently_viewed_limit ?? 4);

  const [recentBuyersEnabled, setRecentBuyersEnabled] = useState(initialSettings.recent_buyers_enabled ?? true);
  const [cookieConsentEnabled, setCookieConsentEnabled] = useState(initialSettings.cookie_consent_enabled ?? true);
  const [freeShippingBarEnabled, setFreeShippingBarEnabled] = useState(
    initialSettings.free_shipping_bar_enabled ?? true
  );
  const [volumeDiscountsEnabled, setVolumeDiscountsEnabled] = useState(
    initialSettings.volume_discounts_enabled ?? true
  );
  const [frequentlyBoughtTogetherEnabled, setFrequentlyBoughtTogetherEnabled] = useState(
    initialSettings.frequently_bought_together_enabled ?? true
  );
  const [stockUrgencyEnabled, setStockUrgencyEnabled] = useState(initialSettings.stock_urgency_enabled ?? true);
  const [flashSaleEnabled, setFlashSaleEnabled] = useState(initialSettings.flash_sale_enabled ?? false);
  const [flashSaleStartDate, setFlashSaleStartDate] = useState(initialSettings.flash_sale_start_date || '');
  const [flashSaleEndDate, setFlashSaleEndDate] = useState(initialSettings.flash_sale_end_date || '');
  const [globalFlashSaleDiscountType, setGlobalFlashSaleDiscountType] = useState(
    initialSettings.globalFlashSaleDiscountType || 'percentage'
  );
  const [globalFlashSaleDiscountValue, setGlobalFlashSaleDiscountValue] = useState(
    initialSettings.globalFlashSaleDiscountValue || 0
  );
  const [socialFeedsEnabled, setSocialFeedsEnabled] = useState(initialSettings.social_feeds_enabled ?? true);
  const [cartTimerEnabled, setCartTimerEnabled] = useState(initialSettings.cart_timer_enabled ?? true);
  const [sizeGuideEnabled, setSizeGuideEnabled] = useState(initialSettings.size_guide_enabled ?? true);

  const [socialFeedsHomepageEnabled, setSocialFeedsHomepageEnabled] = useState(
    initialSettings.social_feeds_homepage_enabled ?? true
  );
  const [socialFeedsProductEnabled, setSocialFeedsProductEnabled] = useState(
    initialSettings.social_feeds_product_enabled ?? true
  );
  const [socialFeedsTitle, setSocialFeedsTitle] = useState(
    initialSettings.social_feeds_title ?? 'Follow Us On Instagram'
  );
  const [socialFeedsSubtitle, setSocialFeedsSubtitle] = useState(initialSettings.social_feeds_subtitle ?? '@OurStore');
  const [socialFeedsDesc, setSocialFeedsDesc] = useState(
    initialSettings.social_feeds_desc ?? 'Tag us in your post to get featured on our page'
  );
  const [cartTimerMessage, setCartTimerMessage] = useState(
    initialSettings.cart_timer_message ?? 'Items in your cart are reserved for {timer} minutes.'
  );
  const [couponCodesEnabled, setCouponCodesEnabled] = useState(initialSettings.coupon_codes_enabled ?? true);

  // Pixels & Tracking States
  const [metaPixelId, setMetaPixelId] = useState(initialSettings.meta_pixel_id || '');
  const [metaSyncEnabled, setMetaSyncEnabled] = useState(initialSettings.meta_sync_enabled ?? false);
  const [ga4MeasurementId, setGa4MeasurementId] = useState(initialSettings.ga4_measurement_id || '');
  const [gtmContainerId, setGtmContainerId] = useState(initialSettings.gtm_container_id || '');
  const [tiktokPixelId, setTiktokPixelId] = useState(initialSettings.tiktok_pixel_id || '');
  const [twitterPixelId, setTwitterPixelId] = useState(initialSettings.twitter_pixel_id || '');
  const [snapchatPixelId, setSnapchatPixelId] = useState(initialSettings.snapchat_pixel_id || '');
  const [pinterestTagId, setPinterestTagId] = useState(initialSettings.pinterest_tag_id || '');

  // SEO & Social States
  const [twitterHandle, setTwitterHandle] = useState(initialSettings.twitter_handle || '');
  const [metaTitleSuffix, setMetaTitleSuffix] = useState(initialSettings.meta_title_suffix || '');
  const [metaTitle, setMetaTitle] = useState(initialSettings.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialSettings.metaDescription || '');

  // Advanced Recent Buyers & Popups states
  const [recentBuyersNames, setRecentBuyersNames] = useState(initialSettings.recent_buyers_names || '');
  const [recentBuyersCities, setRecentBuyersCities] = useState(initialSettings.recent_buyers_cities || '');
  const [recentBuyersSource, setRecentBuyersSource] = useState<'simulated' | 'real'>(
    initialSettings.recent_buyers_source || 'simulated'
  );
  const [recentBuyersProductPool, setRecentBuyersProductPool] = useState<'any' | 'featured' | 'sale' | 'recent' | 'custom'>(
    initialSettings.recent_buyers_product_pool || 'any'
  );
  const [recentBuyersCustomProducts, setRecentBuyersCustomProducts] = useState<string[]>(
    Array.isArray(initialSettings.recent_buyers_custom_products)
      ? initialSettings.recent_buyers_custom_products
      : typeof initialSettings.recent_buyers_custom_products === 'string'
      ? JSON.parse(initialSettings.recent_buyers_custom_products || '[]')
      : []
  );
  const [recentBuyersInitialDelay, setRecentBuyersInitialDelay] = useState(
    initialSettings.recent_buyers_initial_delay ?? 15
  );
  const [recentBuyersInterval, setRecentBuyersInterval] = useState(initialSettings.recent_buyers_interval ?? 35);
  const [recentBuyersDisplayDuration, setRecentBuyersDisplayDuration] = useState(
    initialSettings.recent_buyers_display_duration ?? 6
  );
  const [recentBuyersShowOnCheckout, setRecentBuyersShowOnCheckout] = useState(
    initialSettings.recent_buyers_show_on_checkout ?? false
  );
  const [exitIntentDelayMobile, setExitIntentDelayMobile] = useState(initialSettings.exit_intent_delay_mobile ?? 25);
  const [cookieConsentText, setCookieConsentText] = useState(initialSettings.cookie_consent_text || '');
  const [cookieConsentButtonText, setCookieConsentButtonText] = useState(
    initialSettings.cookie_consent_button_text || ''
  );

  return {
    exitIntentEnabled,
    setExitIntentEnabled,
    exitIntentTitle,
    setExitIntentTitle,
    exitIntentText,
    setExitIntentText,
    exitIntentCoupon,
    setExitIntentCoupon,
    spinWheelEnabled,
    setSpinWheelEnabled,
    spinWheelSegments,
    setSpinWheelSegments,
    cartTimerMinutes,
    setCartTimerMinutes,
    freeShippingThreshold,
    setFreeShippingThreshold,
    volumeDiscountThreshold,
    setVolumeDiscountThreshold,
    volumeDiscountPercentage,
    setVolumeDiscountPercentage,
    recentBuyersStr,
    setRecentBuyersStr,
    recentlyViewedLimit,
    setRecentlyViewedLimit,
    recentBuyersEnabled,
    setRecentBuyersEnabled,
    cookieConsentEnabled,
    setCookieConsentEnabled,
    freeShippingBarEnabled,
    setFreeShippingBarEnabled,
    volumeDiscountsEnabled,
    setVolumeDiscountsEnabled,
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
    socialFeedsHomepageEnabled,
    setSocialFeedsHomepageEnabled,
    socialFeedsProductEnabled,
    setSocialFeedsProductEnabled,
    socialFeedsTitle,
    setSocialFeedsTitle,
    socialFeedsSubtitle,
    setSocialFeedsSubtitle,
    socialFeedsDesc,
    setSocialFeedsDesc,
    cartTimerMessage,
    setCartTimerMessage,
    couponCodesEnabled,
    setCouponCodesEnabled,
    metaPixelId,
    setMetaPixelId,
    metaSyncEnabled,
    setMetaSyncEnabled,
    ga4MeasurementId,
    setGa4MeasurementId,
    gtmContainerId,
    setGtmContainerId,
    tiktokPixelId,
    setTiktokPixelId,
    twitterPixelId,
    setTwitterPixelId,
    snapchatPixelId,
    setSnapchatPixelId,
    pinterestTagId,
    setPinterestTagId,
    twitterHandle,
    setTwitterHandle,
    metaTitleSuffix,
    setMetaTitleSuffix,
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    recentBuyersNames,
    setRecentBuyersNames,
    recentBuyersCities,
    setRecentBuyersCities,
    recentBuyersSource,
    setRecentBuyersSource,
    recentBuyersProductPool,
    setRecentBuyersProductPool,
    recentBuyersCustomProducts,
    setRecentBuyersCustomProducts,
    recentBuyersInitialDelay,
    setRecentBuyersInitialDelay,
    recentBuyersInterval,
    setRecentBuyersInterval,
    recentBuyersDisplayDuration,
    setRecentBuyersDisplayDuration,
    recentBuyersShowOnCheckout,
    setRecentBuyersShowOnCheckout,
    exitIntentDelayMobile,
    setExitIntentDelayMobile,
    cookieConsentText,
    setCookieConsentText,
    cookieConsentButtonText,
    setCookieConsentButtonText,
  };
}
