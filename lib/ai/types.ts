export interface AISettings {
  ai_enabled: boolean;
  content_provider: string;
  content_model: string;
  ai_model_credentials?: Record<string, Record<string, string>>;
  content_keys?: string;
  vision_provider: string;
  vision_model: string;
  vision_keys?: string;
  brand_name: string;
  store_type: string;
  target_market: string;
  tone: string;
  language: string;
  custom_instructions: string;
  auto_content_seo: boolean;
  auto_media_ai: boolean;
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
}
