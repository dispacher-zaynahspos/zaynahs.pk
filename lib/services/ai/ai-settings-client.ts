'use client';

import { createClient } from '@/lib/supabase/client';
import { STORE_SETTINGS_ID, AI_SETTINGS_ID } from '@/lib/config/singleton-ids';

/**
 * SINGLE SOURCE OF TRUTH for client-side AI toggles.
 * `store_settings` is the canonical table with public read access.
 * Writes are mirrored to both `store_settings` and `ai_settings` so server APIs
 * and admin tabs stay 100% synchronized.
 */

export async function getAutoMediaAi(): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('store_settings')
    .select('auto_media_ai')
    .eq('id', STORE_SETTINGS_ID)
    .single();
  return data?.auto_media_ai ?? true;
}

export async function setAutoMediaAi(enabled: boolean): Promise<void> {
  const supabase = createClient();
  await Promise.allSettled([
    supabase.from('store_settings').update({ auto_media_ai: enabled }).eq('id', STORE_SETTINGS_ID),
    supabase.from('ai_settings').update({ auto_media_ai: enabled }).eq('id', AI_SETTINGS_ID)
  ]);
}

export async function getAutoContentSeo(): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('store_settings')
    .select('auto_content_seo')
    .eq('id', STORE_SETTINGS_ID)
    .single();
  return data?.auto_content_seo ?? true;
}

export async function setAutoContentSeo(enabled: boolean): Promise<void> {
  const supabase = createClient();
  await Promise.allSettled([
    supabase.from('store_settings').update({ auto_content_seo: enabled }).eq('id', STORE_SETTINGS_ID),
    supabase.from('ai_settings').update({ auto_content_seo: enabled }).eq('id', AI_SETTINGS_ID)
  ]);
}

/** shared client-side read for the global AI Copilot on/off flag */
export async function getAiEnabled(): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('store_settings')
    .select('ai_enabled')
    .eq('id', STORE_SETTINGS_ID)
    .single();
  return data?.ai_enabled ?? false;
}

export async function setAiEnabled(enabled: boolean): Promise<void> {
  const supabase = createClient();
  await Promise.allSettled([
    supabase.from('store_settings').update({ ai_enabled: enabled }).eq('id', STORE_SETTINGS_ID),
    supabase.from('ai_settings').update({ ai_enabled: enabled }).eq('id', AI_SETTINGS_ID)
  ]);
}
