'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { StoreSettings } from '@/lib/types';
import { revalidateSettings, revalidateAfterResponse } from '@/lib/revalidate';
import { logDbError } from '@/lib/utils/dbErrorHandler';
import { safeAction } from '@/lib/utils/serverAction';
import { cleanWhatsAppPhone } from '@/lib/utils/whatsapp';
import { AI_SETTINGS_ID } from '@/lib/config/singleton-ids';
import { SETTINGS_ID, mapSettings } from './mappers';

export const updateSettings = async (settings: Partial<StoreSettings>): Promise<StoreSettings> => {
  try {
    const updatePayload: Record<string, any> = {};

    if (settings.store_name !== undefined) updatePayload.store_name = settings.store_name;
    if (settings.store_url !== undefined) updatePayload.store_url = settings.store_url;
    if (settings.whatsapp_number !== undefined) updatePayload.whatsapp_number = cleanWhatsAppPhone(settings.whatsapp_number);
    if (settings.currency !== undefined) updatePayload.currency = settings.currency;
    if (settings.currency_symbol !== undefined) updatePayload.currency_symbol = settings.currency_symbol;
    if (settings.order_prefix !== undefined) updatePayload.order_prefix = settings.order_prefix;
    if (settings.next_order_sequence !== undefined) updatePayload.next_order_sequence = settings.next_order_sequence;
    if (settings.logo_url !== undefined) updatePayload.logo_url = settings.logo_url;
    if (settings.logo_width !== undefined) updatePayload.logo_width = settings.logo_width;
    if (settings.banner_url !== undefined) updatePayload.banner_url = settings.banner_url;
    if (settings.favicon_url !== undefined) updatePayload.favicon_url = settings.favicon_url;
    if (settings.tagline !== undefined) updatePayload.tagline = settings.tagline;
    if (settings.address !== undefined) updatePayload.address = settings.address;
    if (settings.show_stock !== undefined) updatePayload.show_stock = settings.show_stock;
    if (settings.show_compare_price !== undefined) updatePayload.show_compare_price = settings.show_compare_price;
    if (settings.enable_search !== undefined) updatePayload.enable_search = settings.enable_search;
    if (settings.enable_category_filter !== undefined) updatePayload.enable_category_filter = settings.enable_category_filter;

    if (settings.whatsapp_greeting !== undefined) updatePayload.whatsapp_greeting = settings.whatsapp_greeting;
    if (settings.whatsapp_footer !== undefined) updatePayload.whatsapp_footer = settings.whatsapp_footer;
    if (settings.meta_title !== undefined) updatePayload.meta_title = settings.meta_title;
    if (settings.meta_description !== undefined) updatePayload.meta_description = settings.meta_description;
    if (settings.footer_text !== undefined) updatePayload.footer_text = settings.footer_text;
    if (settings.social_facebook !== undefined) updatePayload.social_facebook = settings.social_facebook;
    if (settings.social_instagram !== undefined) updatePayload.social_instagram = settings.social_instagram;
    if (settings.social_whatsapp !== undefined) updatePayload.social_whatsapp = cleanWhatsAppPhone(settings.social_whatsapp);
    if (settings.social_youtube !== undefined) updatePayload.social_youtube = settings.social_youtube;
    if (settings.enable_fake_views !== undefined) updatePayload.enable_fake_views = settings.enable_fake_views;
    if (settings.min_views !== undefined) updatePayload.min_views = settings.min_views;
    if (settings.max_views !== undefined) updatePayload.max_views = settings.max_views;
    if (settings.enable_trust_badges !== undefined) updatePayload.enable_trust_badges = settings.enable_trust_badges;
    if (settings.delivery_estimate_text !== undefined) updatePayload.delivery_estimate_text = settings.delivery_estimate_text;
    if (settings.free_shipping_text !== undefined) updatePayload.free_shipping_text = settings.free_shipping_text;
    if (settings.promo_code_text !== undefined) updatePayload.promo_code_text = settings.promo_code_text;
    if (settings.enable_safe_checkout !== undefined) updatePayload.enable_safe_checkout = settings.enable_safe_checkout;
    if (settings.safe_checkout_text !== undefined) updatePayload.safe_checkout_text = settings.safe_checkout_text;
    if (settings.safe_checkout_methods !== undefined) updatePayload.safe_checkout_methods = settings.safe_checkout_methods;
    if (settings.enable_ticker !== undefined) updatePayload.enable_ticker = settings.enable_ticker;
    if (settings.ticker_text !== undefined) updatePayload.ticker_text = settings.ticker_text;
    if (settings.product_detail_enable_ticker !== undefined) updatePayload.product_detail_enable_ticker = settings.product_detail_enable_ticker;
    if (settings.product_detail_ticker_text !== undefined) updatePayload.product_detail_ticker_text = settings.product_detail_ticker_text;
    if (settings.enable_variant_swatches !== undefined) updatePayload.enable_variant_swatches = settings.enable_variant_swatches;
    if (settings.swatch_shape !== undefined) updatePayload.swatch_shape = settings.swatch_shape;
    if (settings.swatch_size !== undefined) updatePayload.swatch_size = settings.swatch_size;
    if (settings.swatch_limit !== undefined) updatePayload.swatch_limit = settings.swatch_limit;
    if (settings.default_variant_index !== undefined) updatePayload.default_variant_index = settings.default_variant_index;
    if (settings.image_hover_style !== undefined) updatePayload.image_hover_style = settings.image_hover_style;
    if (settings.image_aspect_ratio !== undefined) updatePayload.image_aspect_ratio = settings.image_aspect_ratio;
    if (settings.title_line_limit !== undefined) updatePayload.title_line_limit = settings.title_line_limit;
    if (settings.archive_swatch_size !== undefined) updatePayload.archive_swatch_size = settings.archive_swatch_size;
    if (settings.product_swatch_size !== undefined) updatePayload.product_swatch_size = settings.product_swatch_size;
    if (settings.archive_swatch_align !== undefined) updatePayload.archive_swatch_align = settings.archive_swatch_align;
    if (settings.enable_product_quick_whatsapp !== undefined) updatePayload.enable_product_quick_whatsapp = settings.enable_product_quick_whatsapp;
    if (settings.header_sticky !== undefined) updatePayload.header_sticky = settings.header_sticky;
    if (settings.header_sticky_desktop !== undefined) updatePayload.header_sticky_desktop = settings.header_sticky_desktop;
    if (settings.header_sticky_mobile !== undefined) updatePayload.header_sticky_mobile = settings.header_sticky_mobile;
    if (settings.header_show_top_bar !== undefined) updatePayload.header_show_top_bar = settings.header_show_top_bar;
    if (settings.header_top_bar_phone !== undefined) updatePayload.header_top_bar_phone = settings.header_top_bar_phone;
    if (settings.header_top_bar_email !== undefined) updatePayload.header_top_bar_email = settings.header_top_bar_email;
    if (settings.header_show_newsletter !== undefined) updatePayload.header_show_newsletter = settings.header_show_newsletter;
    if (settings.header_newsletter_text !== undefined) updatePayload.header_newsletter_text = settings.header_newsletter_text;
    if (settings.header_top_bar_bg !== undefined) updatePayload.header_top_bar_bg = settings.header_top_bar_bg;
    if (settings.header_top_bar_text_color !== undefined) updatePayload.header_top_bar_text_color = settings.header_top_bar_text_color;
    if (settings.header_bg !== undefined) updatePayload.header_bg = settings.header_bg;
    if (settings.header_text_color !== undefined) updatePayload.header_text_color = settings.header_text_color;
    if (settings.header_border_color !== undefined) updatePayload.header_border_color = settings.header_border_color;
    if (settings.header_desktop_logo_align !== undefined) updatePayload.header_desktop_logo_align = settings.header_desktop_logo_align;
    if (settings.header_desktop_search_align !== undefined) updatePayload.header_desktop_search_align = settings.header_desktop_search_align;
    if (settings.header_desktop_wishlist_align !== undefined) updatePayload.header_desktop_wishlist_align = settings.header_desktop_wishlist_align;
    if (settings.header_desktop_cart_align !== undefined) updatePayload.header_desktop_cart_align = settings.header_desktop_cart_align;
    if (settings.header_desktop_theme_align !== undefined) updatePayload.header_desktop_theme_align = settings.header_desktop_theme_align;
    if (settings.header_mobile_logo_align !== undefined) updatePayload.header_mobile_logo_align = settings.header_mobile_logo_align;
    if (settings.header_mobile_menu_align !== undefined) updatePayload.header_mobile_menu_align = settings.header_mobile_menu_align;
    if (settings.header_mobile_search_align !== undefined) updatePayload.header_mobile_search_align = settings.header_mobile_search_align;
    if (settings.header_mobile_cart_align !== undefined) updatePayload.header_mobile_cart_align = settings.header_mobile_cart_align;
    if (settings.header_mobile_wishlist_align !== undefined) updatePayload.header_mobile_wishlist_align = settings.header_mobile_wishlist_align;
    if (settings.navigation_menu !== undefined) updatePayload.navigation_menu = settings.navigation_menu;
    if (settings.header_desktop_menu_align !== undefined) updatePayload.header_desktop_menu_align = settings.header_desktop_menu_align;
    if (settings.faq_content !== undefined) updatePayload.faq_content = settings.faq_content;
    if (settings.return_policy_content !== undefined) updatePayload.return_policy_content = settings.return_policy_content;
    if (settings.privacy_policy_content !== undefined) updatePayload.privacy_policy_content = settings.privacy_policy_content;
    if (settings.show_faq_in_nav !== undefined) updatePayload.show_faq_in_nav = settings.show_faq_in_nav;
    if (settings.show_returns_in_nav !== undefined) updatePayload.show_returns_in_nav = settings.show_returns_in_nav;
    if (settings.show_privacy_in_nav !== undefined) updatePayload.show_privacy_in_nav = settings.show_privacy_in_nav;
    if (settings.show_faq_in_footer !== undefined) updatePayload.show_faq_in_footer = settings.show_faq_in_footer;
    if (settings.show_returns_in_footer !== undefined) updatePayload.show_returns_in_footer = settings.show_returns_in_footer;
    if (settings.show_privacy_in_footer !== undefined) updatePayload.show_privacy_in_footer = settings.show_privacy_in_footer;

    if (settings.trust_badge1_title !== undefined) updatePayload.trust_badge_1_title = settings.trust_badge1_title;
    if (settings.trust_badge1_desc !== undefined) updatePayload.trust_badge_1_desc = settings.trust_badge1_desc;
    if (settings.trust_badge1_icon !== undefined) updatePayload.trust_badge_1_icon = settings.trust_badge1_icon;

    if (settings.trust_badge2_title !== undefined) updatePayload.trust_badge_2_title = settings.trust_badge2_title;
    if (settings.trust_badge2_desc !== undefined) updatePayload.trust_badge_2_desc = settings.trust_badge2_desc;
    if (settings.trust_badge2_icon !== undefined) updatePayload.trust_badge_2_icon = settings.trust_badge2_icon;

    if (settings.trust_badge3_title !== undefined) updatePayload.trust_badge_3_title = settings.trust_badge3_title;
    if (settings.trust_badge3_desc !== undefined) updatePayload.trust_badge_3_desc = settings.trust_badge3_desc;
    if (settings.trust_badge3_icon !== undefined) updatePayload.trust_badge_3_icon = settings.trust_badge3_icon;

    if (settings.trust_badge4_title !== undefined) updatePayload.trust_badge_4_title = settings.trust_badge4_title;
    if (settings.trust_badge4_desc !== undefined) updatePayload.trust_badge_4_desc = settings.trust_badge4_desc;
    if (settings.trust_badge4_icon !== undefined) updatePayload.trust_badge_4_icon = settings.trust_badge4_icon;

    if (settings.trust_badge1_enabled !== undefined) updatePayload.trust_badge_1_enabled = settings.trust_badge1_enabled;
    if (settings.trust_badge2_enabled !== undefined) updatePayload.trust_badge_2_enabled = settings.trust_badge2_enabled;
    if (settings.trust_badge3_enabled !== undefined) updatePayload.trust_badge_3_enabled = settings.trust_badge3_enabled;
    if (settings.trust_badge4_enabled !== undefined) updatePayload.trust_badge_4_enabled = settings.trust_badge4_enabled;

    if (settings.social_tiktok !== undefined) updatePayload.social_tiktok = settings.social_tiktok;
    if (settings.social_snapchat !== undefined) updatePayload.social_snapchat = settings.social_snapchat;
    if (settings.social_twitter !== undefined) updatePayload.social_twitter = settings.social_twitter;

    if (settings.footer_col1_title !== undefined) updatePayload.footer_col_1_title = settings.footer_col1_title;
    if (settings.footer_col2_title !== undefined) updatePayload.footer_col_2_title = settings.footer_col2_title;
    if (settings.footer_col2_text !== undefined) updatePayload.footer_col_2_text = settings.footer_col2_text;
    if (settings.footer_col3_title !== undefined) updatePayload.footer_col_3_title = settings.footer_col3_title;
    if (settings.footer_col4_title !== undefined) updatePayload.footer_col_4_title = settings.footer_col4_title;
    if (settings.footer_col4_text !== undefined) updatePayload.footer_col_4_text = settings.footer_col4_text;
    if (settings.footer_bottom_text !== undefined) updatePayload.footer_bottom_text = settings.footer_bottom_text;
    if (settings.footer_show_payments !== undefined) updatePayload.footer_show_payments = settings.footer_show_payments;
    if (settings.footer_show_menu !== undefined) updatePayload.footer_show_menu = settings.footer_show_menu;
    if (settings.footer_show_newsletter !== undefined) updatePayload.footer_show_newsletter = settings.footer_show_newsletter;
    if (settings.footer_show_social !== undefined) updatePayload.footer_show_social = settings.footer_show_social;

    if (settings.floating_contacts_enabled !== undefined) updatePayload.floating_contacts_enabled = settings.floating_contacts_enabled;
    if (settings.floating_contacts_position !== undefined) updatePayload.floating_contacts_position = settings.floating_contacts_position;
    if (settings.floating_contacts_bottom_mobile !== undefined) updatePayload.floating_contacts_bottom_mobile = settings.floating_contacts_bottom_mobile;
    if (settings.floating_contacts_bottom_desktop !== undefined) updatePayload.floating_contacts_bottom_desktop = settings.floating_contacts_bottom_desktop;
    if (settings.floating_contacts_side_mobile !== undefined) updatePayload.floating_contacts_side_mobile = settings.floating_contacts_side_mobile;
    if (settings.floating_contacts_side_desktop !== undefined) updatePayload.floating_contacts_side_desktop = settings.floating_contacts_side_desktop;
    if (settings.floating_contacts_scale !== undefined) updatePayload.floating_contacts_scale = settings.floating_contacts_scale;
    if (settings.floating_whatsapp_preset !== undefined) updatePayload.floating_whatsapp_preset = settings.floating_whatsapp_preset;
    if (settings.floating_whatsapp_number !== undefined) updatePayload.floating_whatsapp_number = cleanWhatsAppPhone(settings.floating_whatsapp_number);
    if (settings.floating_whatsapp_enabled !== undefined) updatePayload.floating_whatsapp_enabled = settings.floating_whatsapp_enabled;
    if (settings.floating_instagram_enabled !== undefined) updatePayload.floating_instagram_enabled = settings.floating_instagram_enabled;
    if (settings.floating_tiktok_enabled !== undefined) updatePayload.floating_tiktok_enabled = settings.floating_tiktok_enabled;
    if (settings.floating_snapchat_enabled !== undefined) updatePayload.floating_snapchat_enabled = settings.floating_snapchat_enabled;
    if (settings.floating_twitter_enabled !== undefined) updatePayload.floating_twitter_enabled = settings.floating_twitter_enabled;

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
    if (settings.premium_themes_enabled !== undefined) updatePayload.premium_themes_enabled = settings.premium_themes_enabled;
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
    if (settings.shop_products_per_page_desktop !== undefined) updatePayload.shop_products_per_page_desktop = settings.shop_products_per_page_desktop;
    if (settings.shop_products_per_page_tablet !== undefined) updatePayload.shop_products_per_page_tablet = settings.shop_products_per_page_tablet;
    if (settings.shop_products_per_page_mobile !== undefined) updatePayload.shop_products_per_page_mobile = settings.shop_products_per_page_mobile;
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
    if (settings.global_flash_sale_discount_type !== undefined) updatePayload.global_flash_sale_discount_type = settings.global_flash_sale_discount_type;
    if (settings.global_flash_sale_discount_value !== undefined) updatePayload.global_flash_sale_discount_value = settings.global_flash_sale_discount_value;
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
    if (settings.product_page_layout !== undefined) updatePayload.product_page_layout = settings.product_page_layout;
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
    if (settings.ai_model_credentials && Object.keys(settings.ai_model_credentials).length > 0) updatePayload.ai_model_credentials = settings.ai_model_credentials; // secret: write-only-if-provided
    if (settings.ai_persona_config !== undefined) updatePayload.ai_persona_config = settings.ai_persona_config;
    if (settings.content_provider !== undefined) updatePayload.content_provider = settings.content_provider;
    if (settings.content_model !== undefined) updatePayload.content_model = settings.content_model;
    if (settings.content_keys) updatePayload.content_keys = settings.content_keys; // secret: write-only-if-provided
    if (settings.vision_provider !== undefined) updatePayload.vision_provider = settings.vision_provider;
    if (settings.vision_model !== undefined) updatePayload.vision_model = settings.vision_model;
    if (settings.vision_keys) updatePayload.vision_keys = settings.vision_keys; // secret: write-only-if-provided
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
    if (settings.smtp_app_password) updatePayload.smtp_app_password = settings.smtp_app_password; // secret: write-only-if-provided
    if (settings.smtp_from_name !== undefined) updatePayload.smtp_from_name = settings.smtp_from_name;
    if (settings.admin_notification_email !== undefined) updatePayload.admin_notification_email = settings.admin_notification_email;
    if (settings.email_notifications !== undefined) updatePayload.email_notifications = typeof settings.email_notifications === 'string' ? JSON.parse(settings.email_notifications) : settings.email_notifications;
    if (settings.low_stock_threshold !== undefined) updatePayload.low_stock_threshold = settings.low_stock_threshold;
    if (settings.abandoned_cart_email_enabled !== undefined) updatePayload.abandoned_cart_email_enabled = settings.abandoned_cart_email_enabled;
    if (settings.abandoned_cart_admin_notify !== undefined) updatePayload.abandoned_cart_admin_notify = settings.abandoned_cart_admin_notify;
    if (settings.abandoned_cart_email_subject !== undefined) updatePayload.abandoned_cart_email_subject = settings.abandoned_cart_email_subject;
    if (settings.abandoned_cart_email_template !== undefined) updatePayload.abandoned_cart_email_template = settings.abandoned_cart_email_template;
    if (settings.popular_searches !== undefined) updatePayload.popular_searches = settings.popular_searches;
    if (settings.postex_enabled !== undefined) updatePayload.postex_enabled = settings.postex_enabled;
    if (settings.postex_api_token) updatePayload.postex_api_token = settings.postex_api_token; // secret: write-only-if-provided
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

    // Direct sync to ai_settings table to ensure both tables are permanently in sync
    const aiFields: Record<string, any> = {};
    if (updatePayload.ai_enabled !== undefined) aiFields.ai_enabled = updatePayload.ai_enabled;
    if (updatePayload.ai_model_credentials !== undefined) aiFields.ai_model_credentials = updatePayload.ai_model_credentials;
    if (updatePayload.content_provider !== undefined) aiFields.content_provider = updatePayload.content_provider;
    if (updatePayload.content_model !== undefined) aiFields.content_model = updatePayload.content_model;
    if (updatePayload.content_keys !== undefined) aiFields.content_keys = updatePayload.content_keys;
    if (updatePayload.vision_provider !== undefined) aiFields.vision_provider = updatePayload.vision_provider;
    if (updatePayload.vision_model !== undefined) aiFields.vision_model = updatePayload.vision_model;
    if (updatePayload.vision_keys !== undefined) aiFields.vision_keys = updatePayload.vision_keys;
    if (updatePayload.auto_content_seo !== undefined) aiFields.auto_content_seo = updatePayload.auto_content_seo;
    if (updatePayload.auto_media_ai !== undefined) aiFields.auto_media_ai = updatePayload.auto_media_ai;

    if (Object.keys(aiFields).length > 0) {
      await supabaseAdmin
        .from('ai_settings')
        .update({ ...aiFields, updated_at: new Date().toISOString() })
        .eq('id', AI_SETTINGS_ID);
    }

    // Fast save: schedule cache invalidation (incl. the slow Cloudflare zone purge)
    // AFTER the response so the admin save returns instantly instead of hanging.
    try {
      await revalidateAfterResponse(() => revalidateSettings());
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
