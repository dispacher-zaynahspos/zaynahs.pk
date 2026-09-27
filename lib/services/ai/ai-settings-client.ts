'use client';

import { createClient } from '@/lib/supabase/client';
import { AI_SETTINGS_ID } from '@/lib/config/singleton-ids';

/**
 * SINGLE source for the "auto vision tags on upload" (`auto_media_ai`) toggle.
 *
 * Previously this read/write was reimplemented inline in BOTH
 * `components/admin/media-manager/hooks/useMediaAI.ts` and
 * `components/admin/MediaManager.tsx` (a duplicate write path — SSOT violation).
 * Both now call these helpers.
 *
 * `store_settings` is the canonical config table; a DB trigger mirrors
 * `auto_media_ai` between `store_settings` and `ai_settings`, so reading/writing
 * `ai_settings` from the browser client (which is what the Media page is
 * authorised to do) stays consistent with the Settings → AI tab.
 */

export async function getAutoMediaAi(): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('ai_settings')
    .select('auto_media_ai')
    .eq('id', AI_SETTINGS_ID)
    .single();
  return data?.auto_media_ai ?? true;
}

export async function setAutoMediaAi(enabled: boolean): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('ai_settings')
    .update({ auto_media_ai: enabled })
    .eq('id', AI_SETTINGS_ID);
  if (error) throw error;
}

/** shared client-side read for the global AI Copilot on/off flag */
export async function getAiEnabled(): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('ai_settings')
    .select('ai_enabled')
    .eq('id', AI_SETTINGS_ID)
    .single();
  return data?.ai_enabled ?? false;
}
