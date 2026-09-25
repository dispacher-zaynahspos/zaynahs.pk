'use client';

import { useState } from 'react';
import { StoreSettings } from '@/lib/types';

interface UseSettingsTrustAndProductsProps {
  initialSettings: StoreSettings;
}

export function useSettingsTrustAndProducts({ initialSettings }: UseSettingsTrustAndProductsProps) {
  // Fake Views & Trust States
  const [enableFakeViews, setEnableFakeViews] = useState(initialSettings.enableFakeViews ?? true);
  const [minViews, setMinViews] = useState(initialSettings.minViews ?? 10);
  const [maxViews, setMaxViews] = useState(initialSettings.maxViews ?? 50);
  const [enableTrustBadges, setEnableTrustBadges] = useState(initialSettings.enableTrustBadges ?? true);
  const [deliveryEstimateText, setDeliveryEstimateText] = useState(
    initialSettings.deliveryEstimateText ?? 'Estimate delivery times: 3-5 days International.'
  );
  const [freeShippingText, setFreeShippingText] = useState(
    initialSettings.freeShippingText ?? 'Free shipping & returns: On all orders over $150.'
  );
  const [promoCodeText, setPromoCodeText] = useState(
    initialSettings.promoCodeText ?? 'Use code "WELCOME15" for discount 15% on your first order.'
  );
  const [enableSafeCheckout, setEnableSafeCheckout] = useState(initialSettings.enableSafeCheckout ?? true);
  const [safeCheckoutText, setSafeCheckoutText] = useState(initialSettings.safeCheckoutText ?? 'Guarantee Safe Checkout:');
  const [safeCheckoutMethods, setSafeCheckoutMethods] = useState<string[]>(
    initialSettings.safeCheckoutMethods ?? [
      'visa',
      'mastercard',
      'paypal',
      'amex',
      'klarna',
      'cirrus',
      'westernunion',
    ]
  );
  const [enableTicker, setEnableTicker] = useState(initialSettings.enableTicker ?? false);
  const [tickerText, setTickerText] = useState(
    initialSettings.tickerText ?? 'Free returns within 30 days\nUnlimited delivery for only $175'
  );
  const [enableVariantSwatches, setEnableVariantSwatches] = useState(initialSettings.enableVariantSwatches ?? true);
  const [swatchShape, setSwatchShape] = useState<'circle' | 'square'>(initialSettings.swatchShape ?? 'circle');
  const [swatchSize, setSwatchSize] = useState<'sm' | 'md' | 'lg'>(initialSettings.swatchSize ?? 'md');
  const [swatchLimit, setSwatchLimit] = useState<number>(initialSettings.swatchLimit ?? 8);
  const [defaultVariantIndex, setDefaultVariantIndex] = useState<number>(initialSettings.defaultVariantIndex ?? 1);
  const [imageHoverStyle, setImageHoverStyle] = useState<'second_image' | 'zoom' | 'slide_left' | 'zoom_swap' | 'fade_up' | 'blur_crossfade' | 'flip_3d' | 'none'>(
    initialSettings.imageHoverStyle ?? 'second_image'
  );
  const [imageAspectRatio, setImageAspectRatio] = useState(initialSettings.imageAspectRatio ?? '1:1');
  const [titleLineLimit, setTitleLineLimit] = useState<'1' | '2' | 'none'>(initialSettings.titleLineLimit ?? '2');
  const [archiveSwatchSize, setArchiveSwatchSize] = useState<'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>(
    initialSettings.archiveSwatchSize ?? 'md'
  );
  const [productSwatchSize, setProductSwatchSize] = useState<'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>(
    initialSettings.productSwatchSize ?? 'md'
  );
  const [archiveSwatchAlign, setArchiveSwatchAlign] = useState<'left' | 'center' | 'right'>(
    initialSettings.archiveSwatchAlign ?? 'left'
  );
  const [cardShowDescription, setCardShowDescription] = useState(initialSettings.card_show_description ?? true);
  const [cardShowSwatches, setCardShowSwatches] = useState(initialSettings.card_show_swatches ?? true);
  const [cardShowSizes, setCardShowSizes] = useState(initialSettings.card_show_sizes ?? true);
  const [cardShowMaterials, setCardShowMaterials] = useState(initialSettings.card_show_materials ?? true);
  const [cardShowCustom, setCardShowCustom] = useState(initialSettings.card_show_custom ?? true);
  const [cardShowCustom2, setCardShowCustom2] = useState(initialSettings.card_show_custom_2 ?? true);
  const [cardShowTypeColor, setCardShowTypeColor] = useState(initialSettings.card_show_type_color ?? true);
  const [cardShowTypeSize, setCardShowTypeSize] = useState(initialSettings.card_show_type_size ?? true);
  const [cardShowTypeMaterial, setCardShowTypeMaterial] = useState(initialSettings.card_show_type_material ?? true);
  const [cardShowTypeCustom, setCardShowTypeCustom] = useState(initialSettings.card_show_type_custom ?? true);
  const [cardMobileColumns, setCardMobileColumns] = useState<number>(initialSettings.card_mobile_columns ?? 2);

  // Policies States
  const [faqContent, setFaqContent] = useState(initialSettings.faqContent || '');
  const [returnPolicyContent, setReturnPolicyContent] = useState(initialSettings.returnPolicyContent || '');
  const [privacyPolicyContent, setPrivacyPolicyContent] = useState(initialSettings.privacyPolicyContent || '');
  const [showFaqInNav, setShowFaqInNav] = useState(initialSettings.showFaqInNav ?? true);
  const [showReturnsInNav, setShowReturnsInNav] = useState(initialSettings.showReturnsInNav ?? true);
  const [showPrivacyInNav, setShowPrivacyInNav] = useState(initialSettings.showPrivacyInNav ?? true);
  const [showFaqInFooter, setShowFaqInFooter] = useState(initialSettings.showFaqInFooter ?? true);
  const [showReturnsInFooter, setShowReturnsInFooter] = useState(initialSettings.showReturnsInFooter ?? true);
  const [showPrivacyInFooter, setShowPrivacyInFooter] = useState(initialSettings.showPrivacyInFooter ?? true);

  // Trust Badges States
  const [trustBadge1Title, setTrustBadge1Title] = useState(initialSettings.trustBadge1Title || 'Free Delivery');
  const [trustBadge1Desc, setTrustBadge1Desc] = useState(initialSettings.trustBadge1Desc || 'On all orders above Rs. 2,000');
  const [trustBadge1Icon, setTrustBadge1Icon] = useState(initialSettings.trustBadge1Icon || 'Truck');

  const [trustBadge2Title, setTrustBadge2Title] = useState(initialSettings.trustBadge2Title || 'Secure Payments');
  const [trustBadge2Desc, setTrustBadge2Desc] = useState(initialSettings.trustBadge2Desc || '100% protected checkout payments');
  const [trustBadge2Icon, setTrustBadge2Icon] = useState(initialSettings.trustBadge2Icon || 'Shield');

  const [trustBadge3Title, setTrustBadge3Title] = useState(initialSettings.trustBadge3Title || 'Easy Exchange');
  const [trustBadge3Desc, setTrustBadge3Desc] = useState(initialSettings.trustBadge3Desc || 'No questions asked return policy');
  const [trustBadge3Icon, setTrustBadge3Icon] = useState(initialSettings.trustBadge3Icon || 'RefreshCw');

  const [trustBadge4Title, setTrustBadge4Title] = useState(initialSettings.trustBadge4Title || '24/7 Support');
  const [trustBadge4Desc, setTrustBadge4Desc] = useState(initialSettings.trustBadge4Desc || 'Call/WhatsApp anytime for assistance');
  const [trustBadge4Icon, setTrustBadge4Icon] = useState(initialSettings.trustBadge4Icon || 'Phone');

  const [trustBadge1Enabled, setTrustBadge1Enabled] = useState(initialSettings.trustBadge1Enabled ?? true);
  const [trustBadge2Enabled, setTrustBadge2Enabled] = useState(initialSettings.trustBadge2Enabled ?? true);
  const [trustBadge3Enabled, setTrustBadge3Enabled] = useState(initialSettings.trustBadge3Enabled ?? true);
  const [trustBadge4Enabled, setTrustBadge4Enabled] = useState(initialSettings.trustBadge4Enabled ?? true);

  return {
    enableFakeViews,
    setEnableFakeViews,
    minViews,
    setMinViews,
    maxViews,
    setMaxViews,
    enableTrustBadges,
    setEnableTrustBadges,
    deliveryEstimateText,
    setDeliveryEstimateText,
    freeShippingText,
    setFreeShippingText,
    promoCodeText,
    setPromoCodeText,
    enableSafeCheckout,
    setEnableSafeCheckout,
    safeCheckoutText,
    setSafeCheckoutText,
    safeCheckoutMethods,
    setSafeCheckoutMethods,
    enableTicker,
    setEnableTicker,
    tickerText,
    setTickerText,
    enableVariantSwatches,
    setEnableVariantSwatches,
    swatchShape,
    setSwatchShape,
    swatchSize,
    setSwatchSize,
    swatchLimit,
    setSwatchLimit,
    defaultVariantIndex,
    setDefaultVariantIndex,
    imageHoverStyle,
    setImageHoverStyle,
    imageAspectRatio,
    setImageAspectRatio,
    titleLineLimit,
    setTitleLineLimit,
    archiveSwatchSize,
    setArchiveSwatchSize,
    productSwatchSize,
    setProductSwatchSize,
    archiveSwatchAlign,
    setArchiveSwatchAlign,
    cardShowDescription,
    setCardShowDescription,
    cardShowSwatches,
    setCardShowSwatches,
    cardShowSizes,
    setCardShowSizes,
    cardShowMaterials,
    setCardShowMaterials,
    cardShowCustom,
    setCardShowCustom,
    cardShowCustom2,
    setCardShowCustom2,
    cardShowTypeColor,
    setCardShowTypeColor,
    cardShowTypeSize,
    setCardShowTypeSize,
    cardShowTypeMaterial,
    setCardShowTypeMaterial,
    cardShowTypeCustom,
    setCardShowTypeCustom,
    cardMobileColumns,
    setCardMobileColumns,
    faqContent,
    setFaqContent,
    returnPolicyContent,
    setReturnPolicyContent,
    privacyPolicyContent,
    setPrivacyPolicyContent,
    showFaqInNav,
    setShowFaqInNav,
    showReturnsInNav,
    setShowReturnsInNav,
    showPrivacyInNav,
    setShowPrivacyInNav,
    showFaqInFooter,
    setShowFaqInFooter,
    showReturnsInFooter,
    setShowReturnsInFooter,
    showPrivacyInFooter,
    setShowPrivacyInFooter,
    trustBadge1Title,
    setTrustBadge1Title,
    trustBadge1Desc,
    setTrustBadge1Desc,
    trustBadge1Icon,
    setTrustBadge1Icon,
    trustBadge2Title,
    setTrustBadge2Title,
    trustBadge2Desc,
    setTrustBadge2Desc,
    trustBadge2Icon,
    setTrustBadge2Icon,
    trustBadge3Title,
    setTrustBadge3Title,
    trustBadge3Desc,
    setTrustBadge3Desc,
    trustBadge3Icon,
    setTrustBadge3Icon,
    trustBadge4Title,
    setTrustBadge4Title,
    trustBadge4Desc,
    setTrustBadge4Desc,
    trustBadge4Icon,
    setTrustBadge4Icon,
    trustBadge1Enabled,
    setTrustBadge1Enabled,
    trustBadge2Enabled,
    setTrustBadge2Enabled,
    trustBadge3Enabled,
    setTrustBadge3Enabled,
    trustBadge4Enabled,
    setTrustBadge4Enabled,
  };
}
