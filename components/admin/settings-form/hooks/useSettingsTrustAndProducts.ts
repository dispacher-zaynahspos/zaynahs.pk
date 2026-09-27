'use client';

import { useState } from 'react';
import { StoreSettings } from '@/lib/types';

interface UseSettingsTrustAndProductsProps {
  initialSettings: StoreSettings;
}

export function useSettingsTrustAndProducts({ initialSettings }: UseSettingsTrustAndProductsProps) {
  // Fake Views & Trust States
  const [enableFakeViews, setEnableFakeViews] = useState(initialSettings.enable_fake_views ?? true);
  const [minViews, setMinViews] = useState(initialSettings.min_views ?? 10);
  const [maxViews, setMaxViews] = useState(initialSettings.max_views ?? 50);
  const [enableTrustBadges, setEnableTrustBadges] = useState(initialSettings.enable_trust_badges ?? true);
  const [deliveryEstimateText, setDeliveryEstimateText] = useState(
    initialSettings.delivery_estimate_text ?? 'Estimate delivery times: 3-5 days International.'
  );
  const [freeShippingText, setFreeShippingText] = useState(
    initialSettings.free_shipping_text ?? 'Free shipping & returns: On all orders over $150.'
  );
  const [promoCodeText, setPromoCodeText] = useState(
    initialSettings.promo_code_text ?? 'Use code "WELCOME15" for discount 15% on your first order.'
  );
  const [enableSafeCheckout, setEnableSafeCheckout] = useState(initialSettings.enable_safe_checkout ?? true);
  const [safeCheckoutText, setSafeCheckoutText] = useState(initialSettings.safe_checkout_text ?? 'Guarantee Safe Checkout:');
  const [safeCheckoutMethods, setSafeCheckoutMethods] = useState<string[]>(
    initialSettings.safe_checkout_methods ?? [
      'visa',
      'mastercard',
      'paypal',
      'amex',
      'klarna',
      'cirrus',
      'westernunion',
    ]
  );
  const [enableTicker, setEnableTicker] = useState(initialSettings.enable_ticker ?? false);
  const [tickerText, setTickerText] = useState(
    initialSettings.ticker_text ?? 'Free returns within 30 days\nUnlimited delivery for only $175'
  );
  const [enableVariantSwatches, setEnableVariantSwatches] = useState(initialSettings.enable_variant_swatches ?? true);
  const [swatchShape, setSwatchShape] = useState<'circle' | 'square'>(initialSettings.swatch_shape ?? 'circle');
  const [swatchSize, setSwatchSize] = useState<'sm' | 'md' | 'lg'>(initialSettings.swatch_size ?? 'md');
  const [swatchLimit, setSwatchLimit] = useState<number>(initialSettings.swatch_limit ?? 8);
  const [defaultVariantIndex, setDefaultVariantIndex] = useState<number>(initialSettings.default_variant_index ?? 1);
  const [imageHoverStyle, setImageHoverStyle] = useState<'second_image' | 'zoom' | 'slide_left' | 'zoom_swap' | 'fade_up' | 'blur_crossfade' | 'flip_3d' | 'none'>(
    initialSettings.image_hover_style ?? 'second_image'
  );
  const [imageAspectRatio, setImageAspectRatio] = useState(initialSettings.image_aspect_ratio ?? '1:1');
  const [titleLineLimit, setTitleLineLimit] = useState<'1' | '2' | 'none'>(initialSettings.title_line_limit ?? '2');
  const [archiveSwatchSize, setArchiveSwatchSize] = useState<'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>(
    initialSettings.archive_swatch_size ?? 'md'
  );
  const [productSwatchSize, setProductSwatchSize] = useState<'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>(
    initialSettings.product_swatch_size ?? 'md'
  );
  const [archiveSwatchAlign, setArchiveSwatchAlign] = useState<'left' | 'center' | 'right'>(
    initialSettings.archive_swatch_align ?? 'left'
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
  const [faqContent, setFaqContent] = useState(initialSettings.faq_content || '');
  const [returnPolicyContent, setReturnPolicyContent] = useState(initialSettings.return_policy_content || '');
  const [privacyPolicyContent, setPrivacyPolicyContent] = useState(initialSettings.privacy_policy_content || '');
  const [showFaqInNav, setShowFaqInNav] = useState(initialSettings.show_faq_in_nav ?? true);
  const [showReturnsInNav, setShowReturnsInNav] = useState(initialSettings.show_returns_in_nav ?? true);
  const [showPrivacyInNav, setShowPrivacyInNav] = useState(initialSettings.show_privacy_in_nav ?? true);
  const [showFaqInFooter, setShowFaqInFooter] = useState(initialSettings.show_faq_in_footer ?? true);
  const [showReturnsInFooter, setShowReturnsInFooter] = useState(initialSettings.show_returns_in_footer ?? true);
  const [showPrivacyInFooter, setShowPrivacyInFooter] = useState(initialSettings.show_privacy_in_footer ?? true);

  // Trust Badges States
  const [trustBadge1Title, setTrustBadge1Title] = useState(initialSettings.trust_badge1_title || 'Free Delivery');
  const [trustBadge1Desc, setTrustBadge1Desc] = useState(initialSettings.trust_badge1_desc || 'On all orders above Rs. 2,000');
  const [trustBadge1Icon, setTrustBadge1Icon] = useState(initialSettings.trust_badge1_icon || 'Truck');

  const [trustBadge2Title, setTrustBadge2Title] = useState(initialSettings.trust_badge2_title || 'Secure Payments');
  const [trustBadge2Desc, setTrustBadge2Desc] = useState(initialSettings.trust_badge2_desc || '100% protected checkout payments');
  const [trustBadge2Icon, setTrustBadge2Icon] = useState(initialSettings.trust_badge2_icon || 'Shield');

  const [trustBadge3Title, setTrustBadge3Title] = useState(initialSettings.trust_badge3_title || 'Easy Exchange');
  const [trustBadge3Desc, setTrustBadge3Desc] = useState(initialSettings.trust_badge3_desc || 'No questions asked return policy');
  const [trustBadge3Icon, setTrustBadge3Icon] = useState(initialSettings.trust_badge3_icon || 'RefreshCw');

  const [trustBadge4Title, setTrustBadge4Title] = useState(initialSettings.trust_badge4_title || '24/7 Support');
  const [trustBadge4Desc, setTrustBadge4Desc] = useState(initialSettings.trust_badge4_desc || 'Call/WhatsApp anytime for assistance');
  const [trustBadge4Icon, setTrustBadge4Icon] = useState(initialSettings.trust_badge4_icon || 'Phone');

  const [trustBadge1Enabled, setTrustBadge1Enabled] = useState(initialSettings.trust_badge1_enabled ?? true);
  const [trustBadge2Enabled, setTrustBadge2Enabled] = useState(initialSettings.trust_badge2_enabled ?? true);
  const [trustBadge3Enabled, setTrustBadge3Enabled] = useState(initialSettings.trust_badge3_enabled ?? true);
  const [trustBadge4Enabled, setTrustBadge4Enabled] = useState(initialSettings.trust_badge4_enabled ?? true);

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
