'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { StoreSettings } from '@/lib/types';
import { revalidateSettings } from '@/lib/revalidate';
import { logDbError } from '@/lib/utils/dbErrorHandler';
import { safeAction } from '@/lib/utils/serverAction';
import { SETTINGS_ID, mapSettings } from './mappers';

export const updateSettings = async (settings: Partial<StoreSettings>): Promise<StoreSettings> => {
  try {
    const updatePayload: Record<string, any> = {};

    if (settings.storeName !== undefined) updatePayload.store_name = settings.storeName;
    if (settings.storeUrl !== undefined) updatePayload.store_url = settings.storeUrl;
    if (settings.whatsappNumber !== undefined) updatePayload.whatsapp_number = settings.whatsappNumber;
    if (settings.currency !== undefined) updatePayload.currency = settings.currency;
    if (settings.currencySymbol !== undefined) updatePayload.currency_symbol = settings.currencySymbol;
    if (settings.orderPrefix !== undefined) updatePayload.order_prefix = settings.orderPrefix;
    if (settings.nextOrderSequence !== undefined) updatePayload.next_order_sequence = settings.nextOrderSequence;
    if (settings.logoUrl !== undefined) updatePayload.logo_url = settings.logoUrl;
    if (settings.logoWidth !== undefined) updatePayload.logo_width = settings.logoWidth;
    if (settings.bannerUrl !== undefined) updatePayload.banner_url = settings.bannerUrl;
    if (settings.faviconUrl !== undefined) updatePayload.favicon_url = settings.faviconUrl;
    if (settings.tagline !== undefined) updatePayload.tagline = settings.tagline;
    if (settings.address !== undefined) updatePayload.address = settings.address;
    if (settings.showStock !== undefined) updatePayload.show_stock = settings.showStock;
    if (settings.showComparePrice !== undefined) updatePayload.show_compare_price = settings.showComparePrice;
    if (settings.enableSearch !== undefined) updatePayload.enable_search = settings.enableSearch;
    if (settings.enableCategoryFilter !== undefined) updatePayload.enable_category_filter = settings.enableCategoryFilter;

    if (settings.whatsappGreeting !== undefined) updatePayload.whatsapp_greeting = settings.whatsappGreeting;
    if (settings.whatsappFooter !== undefined) updatePayload.whatsapp_footer = settings.whatsappFooter;
    if (settings.metaTitle !== undefined) updatePayload.meta_title = settings.metaTitle;
    if (settings.metaDescription !== undefined) updatePayload.meta_description = settings.metaDescription;
    if (settings.footerText !== undefined) updatePayload.footer_text = settings.footerText;
    if (settings.socialFacebook !== undefined) updatePayload.social_facebook = settings.socialFacebook;
    if (settings.socialInstagram !== undefined) updatePayload.social_instagram = settings.socialInstagram;
    if (settings.socialWhatsapp !== undefined) updatePayload.social_whatsapp = settings.socialWhatsapp;
    if (settings.socialYoutube !== undefined) updatePayload.social_youtube = settings.socialYoutube;
    if (settings.enableFakeViews !== undefined) updatePayload.enable_fake_views = settings.enableFakeViews;
    if (settings.minViews !== undefined) updatePayload.min_views = settings.minViews;
    if (settings.maxViews !== undefined) updatePayload.max_views = settings.maxViews;
    if (settings.enableTrustBadges !== undefined) updatePayload.enable_trust_badges = settings.enableTrustBadges;
    if (settings.deliveryEstimateText !== undefined) updatePayload.delivery_estimate_text = settings.deliveryEstimateText;
    if (settings.freeShippingText !== undefined) updatePayload.free_shipping_text = settings.freeShippingText;
    if (settings.promoCodeText !== undefined) updatePayload.promo_code_text = settings.promoCodeText;
    if (settings.enableSafeCheckout !== undefined) updatePayload.enable_safe_checkout = settings.enableSafeCheckout;
    if (settings.safeCheckoutText !== undefined) updatePayload.safe_checkout_text = settings.safeCheckoutText;
    if (settings.safeCheckoutMethods !== undefined) updatePayload.safe_checkout_methods = settings.safeCheckoutMethods;
    if (settings.enableTicker !== undefined) updatePayload.enable_ticker = settings.enableTicker;
    if (settings.tickerText !== undefined) updatePayload.ticker_text = settings.tickerText;
    if (settings.productDetailEnableTicker !== undefined) updatePayload.product_detail_enable_ticker = settings.productDetailEnableTicker;
    if (settings.productDetailTickerText !== undefined) updatePayload.product_detail_ticker_text = settings.productDetailTickerText;
    if (settings.enableVariantSwatches !== undefined) updatePayload.enable_variant_swatches = settings.enableVariantSwatches;
    if (settings.swatchShape !== undefined) updatePayload.swatch_shape = settings.swatchShape;
    if (settings.swatchSize !== undefined) updatePayload.swatch_size = settings.swatchSize;
    if (settings.swatchLimit !== undefined) updatePayload.swatch_limit = settings.swatchLimit;
    if (settings.defaultVariantIndex !== undefined) updatePayload.default_variant_index = settings.defaultVariantIndex;
    if (settings.imageHoverStyle !== undefined) updatePayload.image_hover_style = settings.imageHoverStyle;
    if (settings.imageAspectRatio !== undefined) updatePayload.image_aspect_ratio = settings.imageAspectRatio;
    if (settings.titleLineLimit !== undefined) updatePayload.title_line_limit = settings.titleLineLimit;
    if (settings.archiveSwatchSize !== undefined) updatePayload.archive_swatch_size = settings.archiveSwatchSize;
    if (settings.productSwatchSize !== undefined) updatePayload.product_swatch_size = settings.productSwatchSize;
    if (settings.archiveSwatchAlign !== undefined) updatePayload.archive_swatch_align = settings.archiveSwatchAlign;
    if (settings.enable_product_quick_whatsapp !== undefined) updatePayload.enable_product_quick_whatsapp = settings.enable_product_quick_whatsapp;
    if (settings.headerSticky !== undefined) updatePayload.header_sticky = settings.headerSticky;
    if (settings.headerStickyDesktop !== undefined) updatePayload.header_sticky_desktop = settings.headerStickyDesktop;
    if (settings.headerStickyMobile !== undefined) updatePayload.header_sticky_mobile = settings.headerStickyMobile;
    if (settings.headerShowTopBar !== undefined) updatePayload.header_show_top_bar = settings.headerShowTopBar;
    if (settings.headerTopBarPhone !== undefined) updatePayload.header_top_bar_phone = settings.headerTopBarPhone;
    if (settings.headerTopBarEmail !== undefined) updatePayload.header_top_bar_email = settings.headerTopBarEmail;
    if (settings.headerShowNewsletter !== undefined) updatePayload.header_show_newsletter = settings.headerShowNewsletter;
    if (settings.headerNewsletterText !== undefined) updatePayload.header_newsletter_text = settings.headerNewsletterText;
    if (settings.headerTopBarBg !== undefined) updatePayload.header_top_bar_bg = settings.headerTopBarBg;
    if (settings.headerTopBarTextColor !== undefined) updatePayload.header_top_bar_text_color = settings.headerTopBarTextColor;
    if (settings.headerBg !== undefined) updatePayload.header_bg = settings.headerBg;
    if (settings.headerTextColor !== undefined) updatePayload.header_text_color = settings.headerTextColor;
    if (settings.headerBorderColor !== undefined) updatePayload.header_border_color = settings.headerBorderColor;
    if (settings.headerDesktopLogoAlign !== undefined) updatePayload.header_desktop_logo_align = settings.headerDesktopLogoAlign;
    if (settings.headerDesktopSearchAlign !== undefined) updatePayload.header_desktop_search_align = settings.headerDesktopSearchAlign;
    if (settings.headerDesktopWishlistAlign !== undefined) updatePayload.header_desktop_wishlist_align = settings.headerDesktopWishlistAlign;
    if (settings.headerDesktopCartAlign !== undefined) updatePayload.header_desktop_cart_align = settings.headerDesktopCartAlign;
    if (settings.headerDesktopThemeAlign !== undefined) updatePayload.header_desktop_theme_align = settings.headerDesktopThemeAlign;
    if (settings.headerMobileLogoAlign !== undefined) updatePayload.header_mobile_logo_align = settings.headerMobileLogoAlign;
    if (settings.headerMobileMenuAlign !== undefined) updatePayload.header_mobile_menu_align = settings.headerMobileMenuAlign;
    if (settings.headerMobileSearchAlign !== undefined) updatePayload.header_mobile_search_align = settings.headerMobileSearchAlign;
    if (settings.headerMobileCartAlign !== undefined) updatePayload.header_mobile_cart_align = settings.headerMobileCartAlign;
    if (settings.headerMobileWishlistAlign !== undefined) updatePayload.header_mobile_wishlist_align = settings.headerMobileWishlistAlign;
    if (settings.navigationMenu !== undefined) updatePayload.navigation_menu = settings.navigationMenu;
    if (settings.headerDesktopMenuAlign !== undefined) updatePayload.header_desktop_menu_align = settings.headerDesktopMenuAlign;
    if (settings.faqContent !== undefined) updatePayload.faq_content = settings.faqContent;
    if (settings.returnPolicyContent !== undefined) updatePayload.return_policy_content = settings.returnPolicyContent;
    if (settings.privacyPolicyContent !== undefined) updatePayload.privacy_policy_content = settings.privacyPolicyContent;
    if (settings.showFaqInNav !== undefined) updatePayload.show_faq_in_nav = settings.showFaqInNav;
    if (settings.showReturnsInNav !== undefined) updatePayload.show_returns_in_nav = settings.showReturnsInNav;
    if (settings.showPrivacyInNav !== undefined) updatePayload.show_privacy_in_nav = settings.showPrivacyInNav;
    if (settings.showFaqInFooter !== undefined) updatePayload.show_faq_in_footer = settings.showFaqInFooter;
    if (settings.showReturnsInFooter !== undefined) updatePayload.show_returns_in_footer = settings.showReturnsInFooter;
    if (settings.showPrivacyInFooter !== undefined) updatePayload.show_privacy_in_footer = settings.showPrivacyInFooter;

    if (settings.trustBadge1Title !== undefined) updatePayload.trust_badge_1_title = settings.trustBadge1Title;
    if (settings.trustBadge1Desc !== undefined) updatePayload.trust_badge_1_desc = settings.trustBadge1Desc;
    if (settings.trustBadge1Icon !== undefined) updatePayload.trust_badge_1_icon = settings.trustBadge1Icon;

    if (settings.trustBadge2Title !== undefined) updatePayload.trust_badge_2_title = settings.trustBadge2Title;
    if (settings.trustBadge2Desc !== undefined) updatePayload.trust_badge_2_desc = settings.trustBadge2Desc;
    if (settings.trustBadge2Icon !== undefined) updatePayload.trust_badge_2_icon = settings.trustBadge2Icon;

    if (settings.trustBadge3Title !== undefined) updatePayload.trust_badge_3_title = settings.trustBadge3Title;
    if (settings.trustBadge3Desc !== undefined) updatePayload.trust_badge_3_desc = settings.trustBadge3Desc;
    if (settings.trustBadge3Icon !== undefined) updatePayload.trust_badge_3_icon = settings.trustBadge3Icon;

    if (settings.trustBadge4Title !== undefined) updatePayload.trust_badge_4_title = settings.trustBadge4Title;
    if (settings.trustBadge4Desc !== undefined) updatePayload.trust_badge_4_desc = settings.trustBadge4Desc;
    if (settings.trustBadge4Icon !== undefined) updatePayload.trust_badge_4_icon = settings.trustBadge4Icon;

    if (settings.trustBadge1Enabled !== undefined) updatePayload.trust_badge_1_enabled = settings.trustBadge1Enabled;
    if (settings.trustBadge2Enabled !== undefined) updatePayload.trust_badge_2_enabled = settings.trustBadge2Enabled;
    if (settings.trustBadge3Enabled !== undefined) updatePayload.trust_badge_3_enabled = settings.trustBadge3Enabled;
    if (settings.trustBadge4Enabled !== undefined) updatePayload.trust_badge_4_enabled = settings.trustBadge4Enabled;

    if (settings.socialTiktok !== undefined) updatePayload.social_tiktok = settings.socialTiktok;
    if (settings.socialSnapchat !== undefined) updatePayload.social_snapchat = settings.socialSnapchat;
    if (settings.socialTwitter !== undefined) updatePayload.social_twitter = settings.socialTwitter;

    if (settings.footerCol1Title !== undefined) updatePayload.footer_col_1_title = settings.footerCol1Title;
    if (settings.footerCol2Title !== undefined) updatePayload.footer_col_2_title = settings.footerCol2Title;
    if (settings.footerCol2Text !== undefined) updatePayload.footer_col_2_text = settings.footerCol2Text;
    if (settings.footerCol3Title !== undefined) updatePayload.footer_col_3_title = settings.footerCol3Title;
    if (settings.footerCol4Title !== undefined) updatePayload.footer_col_4_title = settings.footerCol4Title;
    if (settings.footerCol4Text !== undefined) updatePayload.footer_col_4_text = settings.footerCol4Text;
    if (settings.footerBottomText !== undefined) updatePayload.footer_bottom_text = settings.footerBottomText;
    if (settings.footerShowPayments !== undefined) updatePayload.footer_show_payments = settings.footerShowPayments;
    if (settings.footerShowMenu !== undefined) updatePayload.footer_show_menu = settings.footerShowMenu;
    if (settings.footerShowNewsletter !== undefined) updatePayload.footer_show_newsletter = settings.footerShowNewsletter;
    if (settings.footerShowSocial !== undefined) updatePayload.footer_show_social = settings.footerShowSocial;

    if (settings.floatingContactsEnabled !== undefined) updatePayload.floating_contacts_enabled = settings.floatingContactsEnabled;
    if (settings.floatingContactsPosition !== undefined) updatePayload.floating_contacts_position = settings.floatingContactsPosition;
    if (settings.floatingContactsBottomMobile !== undefined) updatePayload.floating_contacts_bottom_mobile = settings.floatingContactsBottomMobile;
    if (settings.floatingContactsBottomDesktop !== undefined) updatePayload.floating_contacts_bottom_desktop = settings.floatingContactsBottomDesktop;
    if (settings.floatingContactsSideMobile !== undefined) updatePayload.floating_contacts_side_mobile = settings.floatingContactsSideMobile;
    if (settings.floatingContactsSideDesktop !== undefined) updatePayload.floating_contacts_side_desktop = settings.floatingContactsSideDesktop;
    if (settings.floatingContactsScale !== undefined) updatePayload.floating_contacts_scale = settings.floatingContactsScale;
    if (settings.floatingWhatsappPreset !== undefined) updatePayload.floating_whatsapp_preset = settings.floatingWhatsappPreset;
    if (settings.floatingWhatsappNumber !== undefined) updatePayload.floating_whatsapp_number = settings.floatingWhatsappNumber;
    if (settings.floatingWhatsappEnabled !== undefined) updatePayload.floating_whatsapp_enabled = settings.floatingWhatsappEnabled;
    if (settings.floatingInstagramEnabled !== undefined) updatePayload.floating_instagram_enabled = settings.floatingInstagramEnabled;
    if (settings.floatingTiktokEnabled !== undefined) updatePayload.floating_tiktok_enabled = settings.floatingTiktokEnabled;
    if (settings.floatingSnapchatEnabled !== undefined) updatePayload.floating_snapchat_enabled = settings.floatingSnapchatEnabled;
    if (settings.floatingTwitterEnabled !== undefined) updatePayload.floating_twitter_enabled = settings.floatingTwitterEnabled;

    if (settings.exit_intent_enabled !== undefined) updatePayload.exit_intent_enabled = settings.exit_intent_enabled;
    if (settings.exit_intent_title !== undefined) updatePayload.exit_intent_title = settings.exit_intent_title;
    if (settings.exit_intent_text !== undefined) updatePayload.exit_intent_text = settings.exit_intent_text;
    if (settings.exit_intent_coupon !== undefined) updatePayload.exit_intent_coupon = settings.exit_intent_coupon;
    if (settings.spin_wheel_enabled !== undefined) updatePayload.spin_wheel_enabled = settings.spin_wheel_enabled;
    if (settings.spin_wheel_segments !== undefined) updatePayload.spin_wheel_segments = settings.spin_wheel_segments;
    if (settings.cart_timer_minutes !== undefined) updatePayload.cart_timer_minutes = settings.cart_timer_minutes;
    if (settings.free_shipping_threshold !== undefined) updatePayload.free_shipping_threshold = settings.free_shipping_threshold;
    if (settings.volume_discount_threshold !== undefined) updatePayload.volume_discount_threshold = settings.volume_discount_threshold;
    if (settings.volume_discount_percentage !== undefined) updatePayload.volume_discount_percentage = settings.volume_discount_percentage;
    if (settings.recent_buyers !== undefined) updatePayload.recent_buyers = typeof settings.recent_buyers === 'string' ? JSON.parse(settings.recent_buyers) : settings.recent_buyers;
    if (settings.recently_viewed_limit !== undefined) updatePayload.recently_viewed_limit = settings.recently_viewed_limit;
    if (settings.recently_viewed_columns_desktop !== undefined) updatePayload.recently_viewed_columns_desktop = settings.recently_viewed_columns_desktop;
    if (settings.recently_viewed_columns_tablet !== undefined) updatePayload.recently_viewed_columns_tablet = settings.recently_viewed_columns_tablet;
    if (settings.recently_viewed_columns_mobile !== undefined) updatePayload.recently_viewed_columns_mobile = settings.recently_viewed_columns_mobile;
    if (settings.recently_viewed_title !== undefined) updatePayload.recently_viewed_title = settings.recently_viewed_title;
    if (settings.recently_viewed_subtitle !== undefined) updatePayload.recently_viewed_subtitle = settings.recently_viewed_subtitle;
    if (settings.related_products_enabled !== undefined) updatePayload.related_products_enabled = settings.related_products_enabled;
    if (settings.related_products_title !== undefined) updatePayload.related_products_title = settings.related_products_title;
    if (settings.related_products_subtitle !== undefined) updatePayload.related_products_subtitle = settings.related_products_subtitle;
    if (settings.related_products_limit !== undefined) updatePayload.related_products_limit = settings.related_products_limit;
    if (settings.related_columns_desktop !== undefined) updatePayload.related_columns_desktop = settings.related_columns_desktop;
    if (settings.related_columns_tablet !== undefined) updatePayload.related_columns_tablet = settings.related_columns_tablet;
    if (settings.related_columns_mobile !== undefined) updatePayload.related_columns_mobile = settings.related_columns_mobile;
    if (settings.shop_columns_desktop !== undefined) updatePayload.shop_columns_desktop = settings.shop_columns_desktop;
    if (settings.shop_columns_tablet !== undefined) updatePayload.shop_columns_tablet = settings.shop_columns_tablet;
    if (settings.shop_columns_mobile !== undefined) updatePayload.shop_columns_mobile = settings.shop_columns_mobile;
    if (settings.shop_products_per_page !== undefined) updatePayload.shop_products_per_page = settings.shop_products_per_page;
    if (settings.shop_category_chips_enabled !== undefined) updatePayload.shop_category_chips_enabled = settings.shop_category_chips_enabled;
    if (settings.shop_infinite_scroll !== undefined) updatePayload.shop_infinite_scroll = settings.shop_infinite_scroll;
    if (settings.recent_buyers_enabled !== undefined) updatePayload.recent_buyers_enabled = settings.recent_buyers_enabled;
    if (settings.cookie_consent_enabled !== undefined) updatePayload.cookie_consent_enabled = settings.cookie_consent_enabled;
    if (settings.free_shipping_bar_enabled !== undefined) updatePayload.free_shipping_bar_enabled = settings.free_shipping_bar_enabled;
    if (settings.volume_discounts_enabled !== undefined) updatePayload.volume_discounts_enabled = settings.volume_discounts_enabled;
    if (settings.frequently_bought_together_enabled !== undefined) updatePayload.frequently_bought_together_enabled = settings.frequently_bought_together_enabled;
    if (settings.stock_urgency_enabled !== undefined) updatePayload.stock_urgency_enabled = settings.stock_urgency_enabled;
    if (settings.flash_sale_enabled !== undefined) updatePayload.flash_sale_enabled = settings.flash_sale_enabled;
    if (settings.flash_sale_start_date !== undefined) updatePayload.flash_sale_start_date = settings.flash_sale_start_date;
    if (settings.flash_sale_end_date !== undefined) updatePayload.flash_sale_end_date = settings.flash_sale_end_date;
    if (settings.globalFlashSaleDiscountType !== undefined) updatePayload.global_flash_sale_discount_type = settings.globalFlashSaleDiscountType;
    if (settings.globalFlashSaleDiscountValue !== undefined) updatePayload.global_flash_sale_discount_value = settings.globalFlashSaleDiscountValue;
    if (settings.social_feeds_enabled !== undefined) updatePayload.social_feeds_enabled = settings.social_feeds_enabled;
    if (settings.cart_timer_enabled !== undefined) updatePayload.cart_timer_enabled = settings.cart_timer_enabled;
    if (settings.size_guide_enabled !== undefined) updatePayload.size_guide_enabled = settings.size_guide_enabled;

    if (settings.recent_buyers_names !== undefined) updatePayload.recent_buyers_names = settings.recent_buyers_names;
    if (settings.recent_buyers_cities !== undefined) updatePayload.recent_buyers_cities = settings.recent_buyers_cities;
    if (settings.recent_buyers_source !== undefined) updatePayload.recent_buyers_source = settings.recent_buyers_source;
    if (settings.recent_buyers_product_pool !== undefined) updatePayload.recent_buyers_product_pool = settings.recent_buyers_product_pool;
    if (settings.recent_buyers_custom_products !== undefined) updatePayload.recent_buyers_custom_products = typeof settings.recent_buyers_custom_products === 'string' ? JSON.parse(settings.recent_buyers_custom_products) : settings.recent_buyers_custom_products;
    if (settings.recent_buyers_initial_delay !== undefined) updatePayload.recent_buyers_initial_delay = settings.recent_buyers_initial_delay;
    if (settings.recent_buyers_interval !== undefined) updatePayload.recent_buyers_interval = settings.recent_buyers_interval;
    if (settings.recent_buyers_display_duration !== undefined) updatePayload.recent_buyers_display_duration = settings.recent_buyers_display_duration;
    if (settings.recent_buyers_show_on_checkout !== undefined) updatePayload.recent_buyers_show_on_checkout = settings.recent_buyers_show_on_checkout;
    if (settings.exit_intent_image_url !== undefined) updatePayload.exit_intent_image_url = settings.exit_intent_image_url;
    if (settings.exit_intent_delay_mobile !== undefined) updatePayload.exit_intent_delay_mobile = settings.exit_intent_delay_mobile;
    if (settings.cookie_consent_text !== undefined) updatePayload.cookie_consent_text = settings.cookie_consent_text;
    if (settings.cookie_consent_button_text !== undefined) updatePayload.cookie_consent_button_text = settings.cookie_consent_button_text;
    if (settings.social_feeds_homepage_enabled !== undefined) updatePayload.social_feeds_homepage_enabled = settings.social_feeds_homepage_enabled;
    if (settings.social_feeds_product_enabled !== undefined) updatePayload.social_feeds_product_enabled = settings.social_feeds_product_enabled;
    if (settings.social_feeds_title !== undefined) updatePayload.social_feeds_title = settings.social_feeds_title;
    if (settings.social_feeds_subtitle !== undefined) updatePayload.social_feeds_subtitle = settings.social_feeds_subtitle;
    if (settings.social_feeds_desc !== undefined) updatePayload.social_feeds_desc = settings.social_feeds_desc;
    if (settings.social_feeds_items !== undefined) updatePayload.social_feeds_items = typeof settings.social_feeds_items === 'string' ? JSON.parse(settings.social_feeds_items) : settings.social_feeds_items;
    if (settings.cart_timer_message !== undefined) updatePayload.cart_timer_message = settings.cart_timer_message;
    if (settings.coupon_codes_enabled !== undefined) updatePayload.coupon_codes_enabled = settings.coupon_codes_enabled;
    if (settings.productPageLayout !== undefined) updatePayload.product_page_layout = settings.productPageLayout;
    if (settings.theme_preset !== undefined) updatePayload.theme_preset = settings.theme_preset;
    if (settings.theme_config !== undefined) updatePayload.theme_config = settings.theme_config;
    if (settings.card_style !== undefined) updatePayload.card_style = settings.card_style;
    if (settings.card_variant !== undefined) updatePayload.card_variant = settings.card_variant;
    if (settings.card_show_stars !== undefined) updatePayload.card_show_stars = settings.card_show_stars;
    if (settings.card_show_quickview !== undefined) updatePayload.card_show_quickview = settings.card_show_quickview;
    if (settings.card_show_wishlist !== undefined) updatePayload.card_show_wishlist = settings.card_show_wishlist;
    if (settings.card_show_quickcart !== undefined) updatePayload.card_show_quickcart = settings.card_show_quickcart;
    if (settings.card_show_description !== undefined) updatePayload.card_show_description = settings.card_show_description;
    if (settings.card_show_swatches !== undefined) updatePayload.card_show_swatches = settings.card_show_swatches;
    if (settings.card_show_sizes !== undefined) updatePayload.card_show_sizes = settings.card_show_sizes;
    if (settings.card_show_materials !== undefined) updatePayload.card_show_materials = settings.card_show_materials;
    if (settings.card_show_custom !== undefined) updatePayload.card_show_custom = settings.card_show_custom;
    if (settings.card_show_custom_2 !== undefined) updatePayload.card_show_custom_2 = settings.card_show_custom_2;
    if (settings.card_show_type_color !== undefined) updatePayload.card_show_type_color = settings.card_show_type_color;
    if (settings.card_show_type_size !== undefined) updatePayload.card_show_type_size = settings.card_show_type_size;
    if (settings.card_show_type_material !== undefined) updatePayload.card_show_type_material = settings.card_show_type_material;
    if (settings.card_show_type_custom !== undefined) updatePayload.card_show_type_custom = settings.card_show_type_custom;
    if (settings.card_alignment !== undefined) updatePayload.card_alignment = settings.card_alignment;
    if (settings.card_elements_order !== undefined) updatePayload.card_elements_order = settings.card_elements_order;
    if (settings.card_mobile_columns !== undefined) updatePayload.card_mobile_columns = settings.card_mobile_columns;

    if (settings.meta_pixel_id !== undefined) updatePayload.meta_pixel_id = settings.meta_pixel_id;
    if (settings.meta_sync_enabled !== undefined) updatePayload.meta_sync_enabled = settings.meta_sync_enabled;
    if (settings.ga4_measurement_id !== undefined) updatePayload.ga4_measurement_id = settings.ga4_measurement_id;
    if (settings.gtm_container_id !== undefined) updatePayload.gtm_container_id = settings.gtm_container_id;
    if (settings.tiktok_pixel_id !== undefined) updatePayload.tiktok_pixel_id = settings.tiktok_pixel_id;
    if (settings.twitter_pixel_id !== undefined) updatePayload.twitter_pixel_id = settings.twitter_pixel_id;
    if (settings.snapchat_pixel_id !== undefined) updatePayload.snapchat_pixel_id = settings.snapchat_pixel_id;
    if (settings.pinterest_tag_id !== undefined) updatePayload.pinterest_tag_id = settings.pinterest_tag_id;

    if (settings.twitter_handle !== undefined) updatePayload.twitter_handle = settings.twitter_handle;
    if (settings.meta_title_suffix !== undefined) updatePayload.meta_title_suffix = settings.meta_title_suffix;

    if (settings.ai_enabled !== undefined) updatePayload.ai_enabled = settings.ai_enabled;
    if (settings.ai_model_credentials !== undefined) updatePayload.ai_model_credentials = settings.ai_model_credentials;
    if (settings.ai_persona_config !== undefined) updatePayload.ai_persona_config = settings.ai_persona_config;
    if (settings.content_provider !== undefined) updatePayload.content_provider = settings.content_provider;
    if (settings.content_model !== undefined) updatePayload.content_model = settings.content_model;
    if (settings.content_keys !== undefined) updatePayload.content_keys = settings.content_keys;
    if (settings.vision_provider !== undefined) updatePayload.vision_provider = settings.vision_provider;
    if (settings.vision_model !== undefined) updatePayload.vision_model = settings.vision_model;
    if (settings.vision_keys !== undefined) updatePayload.vision_keys = settings.vision_keys;
    if (settings.ai_tone !== undefined) updatePayload.ai_tone = settings.ai_tone;
    if (settings.ai_language !== undefined) updatePayload.ai_language = settings.ai_language;
    if (settings.ai_custom_instructions !== undefined) updatePayload.ai_custom_instructions = settings.ai_custom_instructions;
    if (settings.auto_content_seo !== undefined) updatePayload.auto_content_seo = settings.auto_content_seo;
    if (settings.auto_media_ai !== undefined) updatePayload.auto_media_ai = settings.auto_media_ai;
    if (settings.category_default_template !== undefined) updatePayload.category_default_template = settings.category_default_template;
    if (settings.product_default_template !== undefined) updatePayload.product_default_template = settings.product_default_template;
    if (settings.category_description_prompt !== undefined) updatePayload.category_description_prompt = settings.category_description_prompt;
    if (settings.category_description_limit !== undefined) updatePayload.category_description_limit = settings.category_description_limit;
    if (settings.product_description_prompt !== undefined) updatePayload.product_description_prompt = settings.product_description_prompt;
    if (settings.product_description_limit !== undefined) updatePayload.product_description_limit = settings.product_description_limit;
    if (settings.product_short_prompt !== undefined) updatePayload.product_short_prompt = settings.product_short_prompt;
    if (settings.product_short_limit !== undefined) updatePayload.product_short_limit = settings.product_short_limit;
    if (settings.collection_default_template !== undefined) updatePayload.collection_default_template = settings.collection_default_template;
    if (settings.collection_description_prompt !== undefined) updatePayload.collection_description_prompt = settings.collection_description_prompt;
    if (settings.collection_description_limit !== undefined) updatePayload.collection_description_limit = settings.collection_description_limit;

    if (settings.smtp_email !== undefined) updatePayload.smtp_email = settings.smtp_email;
    if (settings.smtp_app_password !== undefined) updatePayload.smtp_app_password = settings.smtp_app_password;
    if (settings.smtp_from_name !== undefined) updatePayload.smtp_from_name = settings.smtp_from_name;
    if (settings.admin_notification_email !== undefined) updatePayload.admin_notification_email = settings.admin_notification_email;
    if (settings.email_notifications !== undefined) updatePayload.email_notifications = typeof settings.email_notifications === 'string' ? JSON.parse(settings.email_notifications) : settings.email_notifications;
    if (settings.low_stock_threshold !== undefined) updatePayload.low_stock_threshold = settings.low_stock_threshold;
    if (settings.abandonedCartEmailEnabled !== undefined) updatePayload.abandoned_cart_email_enabled = settings.abandonedCartEmailEnabled;
    if (settings.abandonedCartAdminNotify !== undefined) updatePayload.abandoned_cart_admin_notify = settings.abandonedCartAdminNotify;
    if (settings.abandonedCartEmailSubject !== undefined) updatePayload.abandoned_cart_email_subject = settings.abandonedCartEmailSubject;
    if (settings.abandonedCartEmailTemplate !== undefined) updatePayload.abandoned_cart_email_template = settings.abandonedCartEmailTemplate;
    if (settings.popularSearches !== undefined) updatePayload.popular_searches = settings.popularSearches;
    if (settings.postex_enabled !== undefined) updatePayload.postex_enabled = settings.postex_enabled;
    if (settings.postex_api_token !== undefined) updatePayload.postex_api_token = settings.postex_api_token;
    if (settings.postex_mode !== undefined) updatePayload.postex_mode = settings.postex_mode;
    if (settings.postex_pickup_address !== undefined) updatePayload.postex_pickup_address = settings.postex_pickup_address;
    if (settings.postex_return_address !== undefined) updatePayload.postex_return_address = settings.postex_return_address;
    if (settings.postex_order_type !== undefined) updatePayload.postex_order_type = settings.postex_order_type;
    if (settings.postex_handling_type !== undefined) updatePayload.postex_handling_type = settings.postex_handling_type;
    if (settings.postex_default_remarks !== undefined) updatePayload.postex_default_remarks = settings.postex_default_remarks;
    if (settings.postex_pickup_display !== undefined) updatePayload.postex_pickup_display = settings.postex_pickup_display;
    if (settings.postex_return_display !== undefined) updatePayload.postex_return_display = settings.postex_return_display;
    if (settings.postex_return_city !== undefined) updatePayload.postex_return_city = settings.postex_return_city;
    if (settings.postex_product_check !== undefined) updatePayload.postex_product_check = settings.postex_product_check;
    if (settings.postex_sku_check !== undefined) updatePayload.postex_sku_check = settings.postex_sku_check;
    if (settings.postex_weight_check !== undefined) updatePayload.postex_weight_check = settings.postex_weight_check;
    if (settings.postex_pieces_check !== undefined) updatePayload.postex_pieces_check = settings.postex_pieces_check;
    if (settings.postex_cod_check !== undefined) updatePayload.postex_cod_check = settings.postex_cod_check;
    if (settings.postex_notes_check !== undefined) updatePayload.postex_notes_check = settings.postex_notes_check;
    if (settings.postex_default_weight !== undefined) updatePayload.postex_default_weight = settings.postex_default_weight;
    if (settings.postex_default_items !== undefined) updatePayload.postex_default_items = settings.postex_default_items;
    if (settings.postex_default_product !== undefined) updatePayload.postex_default_product = settings.postex_default_product;
    if (settings.postex_whatsapp_template !== undefined) updatePayload.postex_whatsapp_template = settings.postex_whatsapp_template;
    if (settings.postex_whatsapp_note !== undefined) updatePayload.postex_whatsapp_note = settings.postex_whatsapp_note;
    if (settings.postex_auto_download_label !== undefined) updatePayload.postex_auto_download_label = settings.postex_auto_download_label;

    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .update(updatePayload)
      .eq('id', SETTINGS_ID)
      .select('*')
      .single();

    if (error) throw error;
    try {
      await revalidateSettings();
    } catch (revalErr) {
      console.error('[settings] revalidateSettings failed during update:', revalErr);
    }
    return mapSettings(data);
  } catch (error) {
    logDbError({
      file: 'lib/services/settings/mutations.ts',
      functionName: 'updateSettings',
      table: 'store_settings',
      action: 'UPDATE'
    }, error);
    const message = (error as any)?.message || (error as any)?.toString() || 'Failed to update settings';
    throw new Error(String(message));
  }
};

export const updateSettingsSafe = async (settings: Partial<StoreSettings>) => safeAction(updateSettings(settings));
