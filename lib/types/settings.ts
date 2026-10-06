export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  children?: NavigationItem[];
}

export interface RecentBuyer {
  name: string;
  city: string;
  /** Optional: pin a specific product to this buyer row (product id). Empty = random from pool. */
  product_id?: string;
  /** Optional: custom "time ago" label for this row (e.g. "5m ago"). Empty = randomized. */
  time_ago?: string;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    textHeading?: string;
    textAccent?: string;
    price?: string;
    sale?: string;
    success?: string;
    warning?: string;
    link?: string;
    headerTopBarBg?: string;
    headerTopBarTextColor?: string;
    footerBg?: string;
    footerTextColor?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  typography: {
    fontSizeBase: number;
  };
  buttons: {
    borderRadius: number;
    primaryBg: string;
    primaryText: string;
    primaryHover: string;
  };
  cards: {
    borderRadius: number;
  };
}

export interface HomepageSection {
  id: string;
  section_type: 'hero_banner' | 'product_grid' | 'category_list' | 'promo_banner' | 'trust_badges' | 'recent_reviews' | 'brands_logos' | 'category_grid' | 'collections_grid' | 'social_feed' | 'ticker' | 'flash_sale' | string;
  title?: string;
  settings: Record<string, any>;
  content_data: Record<string, any>;
  sort_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  whatsapp_number: string;
  currency: string;
  currency_symbol: string;
  order_prefix: string;
  next_order_sequence: number;
  logo_url?: string;
  logo_width: number;
  banner_url?: string;
  favicon_url?: string;
  tagline?: string;
  address?: string;
  show_stock: boolean;
  show_compare_price: boolean;
  enable_search: boolean;
  enable_category_filter: boolean;
  whatsapp_greeting: string;
  whatsapp_footer: string;
  meta_title?: string;
  meta_description?: string;
  footer_text?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_whatsapp?: string;
  last_vercel_purge?: string;
  last_cloudflare_purge?: string;
  social_youtube?: string;
  enable_fake_views: boolean;
  min_views: number;
  max_views: number;
  enable_trust_badges: boolean;
  delivery_estimate_text: string;
  free_shipping_text: string;
  promo_code_text: string;
  enable_safe_checkout: boolean;
  safe_checkout_text: string;
  safe_checkout_methods: string[];
  enable_ticker: boolean;
  ticker_text: string;
  product_detail_enable_ticker: boolean;
  product_detail_ticker_text: string;
  enable_variant_swatches: boolean;
  swatch_shape: 'circle' | 'square';
  swatch_size: 'sm' | 'md' | 'lg'; // Deprecated but kept
  archive_swatch_size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  product_swatch_size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  archive_swatch_align?: 'left' | 'center' | 'right';
  enable_product_quick_whatsapp?: boolean;
  swatch_limit: number;
  default_variant_index: number;
  image_hover_style?: 'second_image' | 'zoom' | 'slide_left' | 'zoom_swap' | 'fade_up' | 'blur_crossfade' | 'flip_3d' | 'none';
  image_aspect_ratio?: string;
  title_line_limit?: '1' | '2' | 'none';
  product_page_layout?: string[];
  /** Blocks that are hidden (kept in layout order but not rendered). Reversible. */
  product_page_hidden_blocks?: string[];

  // Header options
  header_sticky?: boolean;
  header_sticky_desktop?: boolean;
  header_sticky_mobile?: boolean;
  mobile_bottom_nav_enabled?: boolean;
  mobile_bottom_nav_show_labels?: boolean;
  mobile_bottom_nav_items?: { key: string; label: string; visible: boolean }[] | null;
  /** Mobile sticky "View Bag" cart bar — show/hide (default true) */
  cart_bar_enabled?: boolean;
  header_show_top_bar?: boolean;
  header_top_bar_phone?: string;
  header_top_bar_email?: string;
  header_show_newsletter?: boolean;
  header_newsletter_text?: string;

  header_top_bar_bg?: string;
  header_top_bar_text_color?: string;
  header_bg?: string;
  header_text_color?: string;
  header_border_color?: string;

  header_desktop_logo_align?: 'left' | 'center' | 'right';
  header_desktop_search_align?: 'left' | 'right' | 'hidden';
  header_desktop_wishlist_align?: 'left' | 'right' | 'hidden';
  header_desktop_cart_align?: 'left' | 'right' | 'hidden';
  header_desktop_theme_align?: 'left' | 'right' | 'hidden';

  header_mobile_logo_align?: 'left' | 'center' | 'right';
  header_mobile_menu_align?: 'left' | 'right' | 'hidden';
  header_mobile_search_align?: 'left' | 'right' | 'hidden';
  header_mobile_cart_align?: 'left' | 'right' | 'hidden';
  header_mobile_wishlist_align?: 'left' | 'right' | 'hidden';

  // Navigation options
  navigation_menu?: NavigationItem[];
  header_desktop_menu_align?: 'left' | 'center' | 'right' | 'hidden';

  faq_content?: string;
  return_policy_content?: string;
  privacy_policy_content?: string;
  show_faq_in_nav?: boolean;
  show_returns_in_nav?: boolean;
  show_privacy_in_nav?: boolean;
  show_faq_in_footer?: boolean;
  show_returns_in_footer?: boolean;
  show_privacy_in_footer?: boolean;

  trust_badge1_title?: string;
  trust_badge1_desc?: string;
  trust_badge1_icon?: string;
  trust_badge1_enabled: boolean;

  trust_badge2_title?: string;
  trust_badge2_desc?: string;
  trust_badge2_icon?: string;
  trust_badge2_enabled: boolean;

  trust_badge3_title?: string;
  trust_badge3_desc?: string;
  trust_badge3_icon?: string;
  trust_badge3_enabled: boolean;

  trust_badge4_title?: string;
  trust_badge4_desc?: string;
  trust_badge4_icon?: string;
  trust_badge4_enabled: boolean;

  social_tiktok?: string;
  social_snapchat?: string;
  social_twitter?: string;

  footer_col1_title?: string;
  footer_col2_title?: string;
  footer_col2_text?: string;
  footer_col3_title?: string;
  footer_col4_title?: string;
  footer_col4_text?: string;
  footer_bottom_text?: string;
  footer_bg?: string;
  footer_text_color?: string;
  footer_border_color?: string;
  footer_heading_color?: string;
  footer_link_color?: string;
  footer_copyright_color?: string;
  footer_show_payments?: boolean;
  footer_show_menu?: boolean;
  footer_show_newsletter?: boolean;
  footer_show_social?: boolean;

  floating_contacts_enabled: boolean;
  floating_contacts_position: 'left' | 'right';
  floating_contacts_bottom_mobile: number;
  floating_contacts_bottom_desktop: number;
  floating_contacts_side_mobile: number;
  floating_contacts_side_desktop: number;
  floating_contacts_scale: number;
  floating_whatsapp_preset?: string;
  floating_whatsapp_number?: string;
  floating_whatsapp_enabled: boolean;
  floating_instagram_enabled: boolean;
  floating_tiktok_enabled: boolean;
  floating_snapchat_enabled: boolean;
  floating_twitter_enabled: boolean;

  // Customizer & Premium Theme Settings
  exit_intent_enabled?: boolean;
  exit_intent_title?: string;
  exit_intent_text?: string;
  exit_intent_coupon?: string;
  spin_wheel_enabled?: boolean;
  spin_wheel_segments?: string[];
  cart_timer_minutes?: number;
  free_shipping_threshold?: number;
  volume_discount_threshold?: number;
  volume_discount_percentage?: number;
  recent_buyers?: RecentBuyer[] | string;
  recently_viewed_limit?: number;
  recently_viewed_columns_desktop?: number;
  recently_viewed_columns_tablet?: number;
  recently_viewed_columns_mobile?: number;
  related_products_enabled?: boolean;
  premium_themes_enabled?: boolean;
  related_products_title?: string;
  related_products_subtitle?: string;
  related_products_limit?: number;
  related_columns_desktop?: number;
  related_columns_tablet?: number;
  related_columns_mobile?: number;
  recently_viewed_title?: string;
  recently_viewed_subtitle?: string;
  shop_columns_desktop?: number;
  shop_columns_tablet?: number;
  shop_columns_mobile?: number;
  shop_products_per_page?: number;
  shop_products_per_page_desktop?: number;
  shop_products_per_page_tablet?: number;
  shop_products_per_page_mobile?: number;
  shop_category_chips_enabled?: boolean;
  shop_infinite_scroll?: boolean;
  shop_load_more_bg?: string;
  shop_load_more_text_color?: string;
  shop_grid_gap?: 'tight' | 'normal' | 'relaxed';
  shop_show_breadcrumbs?: boolean;
  recent_buyers_enabled?: boolean;
  cookie_consent_enabled?: boolean;
  free_shipping_bar_enabled?: boolean;
  volume_discounts_enabled?: boolean;
  frequently_bought_together_enabled?: boolean;
  stock_urgency_enabled?: boolean;
  flash_sale_enabled?: boolean;
  flash_sale_start_date?: string | null;
  flash_sale_end_date?: string | null;
  global_flash_sale_discount_type?: 'percentage' | 'fixed';
  global_flash_sale_discount_value?: number;
  social_feeds_enabled?: boolean;
  cart_timer_enabled?: boolean;
  size_guide_enabled?: boolean;

  // Product Card Customizations
  card_style?: 'style1' | 'showcase_1' | 'showcase_8' | 'showcase_10' | 'showcase_11' | 'showcase_12' | 'showcase_13' | 'showcase_14' | 'showcase_15' | 'showcase_16';
  card_variant?: 'v1';
  /** How a card reveals hover image + action icons on touch devices. */
  card_mobile_activation?: 'scroll' | 'touch' | 'off';
  /** Standard card appearance controls. */
  card_shadow?: 'none' | 'sm' | 'md' | 'lg';
  card_hover_lift?: boolean;
  card_border_enabled?: boolean;
  card_image_fit?: 'contain' | 'cover';
  card_compare_color?: string;
  card_sale_price_color?: string;
  card_show_stars?: boolean;
  card_show_quickview?: boolean;
  card_show_wishlist?: boolean;
  card_show_quickcart?: boolean;
  card_show_description?: boolean;
  card_show_swatches?: boolean;
  card_show_sizes?: boolean;
  card_show_materials?: boolean;
  card_show_custom?: boolean;
  card_show_custom_2?: boolean;
  card_show_type_color?: boolean;
  card_show_type_size?: boolean;
  card_show_type_material?: boolean;
  card_show_type_custom?: boolean;
  card_alignment?: 'left' | 'center' | 'right';
  card_elements_order?: string[];
  card_mobile_columns?: number;

  recent_buyers_names?: string;
  recent_buyers_cities?: string;
  recent_buyers_source?: 'simulated' | 'real';
  recent_buyers_product_pool?: 'any' | 'featured' | 'sale' | 'recent' | 'custom';
  recent_buyers_custom_products?: string[] | string;
  recent_buyers_initial_delay?: number;
  recent_buyers_interval?: number;
  recent_buyers_display_duration?: number;
  recent_buyers_show_on_checkout?: boolean;
  exit_intent_image_url?: string;
  exit_intent_delay_mobile?: number;
  cookie_consent_text?: string;
  cookie_consent_button_text?: string;

  social_feeds_homepage_enabled?: boolean;
  social_feeds_product_enabled?: boolean;
  social_feeds_title?: string;
  social_feeds_subtitle?: string;
  social_feeds_desc?: string;
  social_feeds_items?: any;
  cart_timer_message?: string;
  coupon_codes_enabled?: boolean;
  theme_preset?: string;
  theme_config?: ThemeConfig;

  // Pixels & Tracking
  meta_pixel_id?: string;
  meta_sync_enabled?: boolean;
  ga4_measurement_id?: string;
  gtm_container_id?: string;
  tiktok_pixel_id?: string;
  twitter_pixel_id?: string;
  snapchat_pixel_id?: string;
  pinterest_tag_id?: string;

  // PostEx courier integration
  postex_enabled?: boolean;
  postex_api_token?: string;
  postex_mode?: string;
  postex_pickup_address?: string;
  postex_return_address?: string;
  postex_order_type?: string;
  postex_handling_type?: string;
  postex_default_remarks?: string;
  postex_pickup_display?: string;
  postex_return_display?: string;
  postex_return_city?: string;
  postex_product_check?: string;
  postex_sku_check?: string;
  postex_weight_check?: string;
  postex_pieces_check?: string;
  postex_cod_check?: string;
  postex_notes_check?: string;
  postex_default_weight?: string;
  postex_default_items?: string;
  postex_default_product?: string;
  postex_whatsapp_template?: string;
  postex_whatsapp_note?: string;
  postex_auto_download_label?: boolean;

  // Social & SEO
  twitter_handle?: string;
  meta_title_suffix?: string;

  // AI settings
  ai_enabled?: boolean;
  ai_model_credentials?: Record<string, Record<string, string>>;
  ai_persona_config?: {
    tone: string;
    language: string;
    customInstructions: string;
    targetAudiences: string[];
    productTypes: string[];
  };
  content_provider?: string;
  content_model?: string;
  content_keys?: string;
  vision_provider?: string;
  vision_model?: string;
  vision_keys?: string;
  ai_tone?: string;
  ai_language?: string;
  ai_custom_instructions?: string;
  auto_content_seo?: boolean;
  auto_media_ai?: boolean;
  target_audiences?: string;
  product_types?: string;
  category_default_template?: string;
  product_default_template?: string;
  category_description_prompt?: string;
  category_description_limit?: number;
  product_description_prompt?: string;
  product_description_limit?: number;
  product_short_prompt?: string;
  product_short_limit?: number;
  collection_default_template?: string;
  collection_description_prompt?: string;
  collection_description_limit?: number;

  // SMTP/Email Fallback Columns
  store_url?: string;
  smtp_email?: string;
  smtp_app_password?: string;
  smtp_from_name?: string;
  admin_notification_email?: string;
  email_notifications?: any;
  low_stock_threshold?: number;

  // Abandoned Cart Email Settings
  abandoned_cart_email_enabled?: boolean;
  abandoned_cart_admin_notify?: boolean;
  abandoned_cart_email_subject?: string;
  abandoned_cart_email_template?: string;

  popular_searches?: string;
  updated_at: string;
}
