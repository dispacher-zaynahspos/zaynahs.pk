import { supabaseAdmin } from '@/lib/supabase/admin';
import { AISettings } from './types';

/**
 * Helper to fetch AI settings from store_settings (the single source of truth).
 * The UI saves all AI config to store_settings via updateSettings().
 * Reading from the same table ensures Target Audience, Product Types, prompts etc. are always current.
 */
export async function getAISettings(): Promise<AISettings> {
  const { data, error } = await supabaseAdmin
    .from('store_settings')
    .select('*')
    .eq('id', '00000000-0000-4000-8000-000000000001')
    .single();

  if (error || !data) {
    throw new Error('Store settings not found — cannot initialize AI engine.');
  }

  // Parse JSONB persona config for nested audience/type arrays
  const personaConfig: { tone?: string; language?: string; customInstructions?: string; targetAudiences?: string[]; productTypes?: string[] } =
    typeof data.ai_persona_config === 'string'
      ? JSON.parse(data.ai_persona_config)
      : (data.ai_persona_config ?? {});

  const targetAudiencesFlat =
    (Array.isArray(personaConfig.targetAudiences) && personaConfig.targetAudiences.length > 0
      ? personaConfig.targetAudiences.join(', ')
      : null) ||
    data.target_audiences ||
    '';

  const productTypesFlat =
    (Array.isArray(personaConfig.productTypes) && personaConfig.productTypes.length > 0
      ? personaConfig.productTypes.join(', ')
      : null) ||
    data.product_types ||
    '';

  return {
    ai_enabled: data.ai_enabled ?? false,
    content_provider: data.content_provider ?? 'groq',
    content_model: data.content_model ?? 'llama-3.3-70b-versatile',
    content_keys: data.content_keys ?? '',
    ai_model_credentials:
      typeof data.ai_model_credentials === 'string'
        ? JSON.parse(data.ai_model_credentials)
        : (data.ai_model_credentials ?? {}),
    vision_provider: data.vision_provider ?? 'gemini',
    vision_model: (data.vision_model && !data.vision_model.includes('2.5') && !data.vision_model.includes('1.5') && !data.vision_model.includes('2.0') && !data.vision_model.includes('3.5') && !data.vision_model.includes('3.1')) ? data.vision_model : 'gemini-3.6-flash',
    vision_keys: data.vision_keys ?? '',
    brand_name: data.store_name ?? '',
    store_type: productTypesFlat || 'General',
    target_market: 'Pakistan',
    tone: data.ai_tone || personaConfig.tone || 'Professional',
    language: data.ai_language || personaConfig.language || 'English',
    custom_instructions: data.ai_custom_instructions || personaConfig.customInstructions || '',
    auto_content_seo: data.auto_content_seo ?? true,
    auto_media_ai: data.auto_media_ai ?? true,
    target_audiences: targetAudiencesFlat,
    product_types: productTypesFlat,
    category_default_template: data.category_default_template ?? '',
    product_default_template: data.product_default_template ?? '',
    category_description_prompt: data.category_description_prompt ?? '',
    category_description_limit: data.category_description_limit ?? 150,
    product_description_prompt: data.product_description_prompt ?? '',
    product_description_limit: data.product_description_limit ?? 250,
    product_short_prompt: data.product_short_prompt ?? '',
    product_short_limit: data.product_short_limit ?? 100,
  };
}
