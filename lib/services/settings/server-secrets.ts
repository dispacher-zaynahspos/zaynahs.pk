import { supabaseAdmin } from '@/lib/supabase/admin';
import { STORE_SETTINGS_ID } from '@/lib/config/singleton-ids';
import { decryptSecret } from '@/lib/utils/secret-crypto';

/**
 * SERVER-ONLY reads of secret settings columns.
 *
 * Secrets (`smtp_app_password`, `postex_api_token`, `content_keys`,
 * `vision_keys`, `ai_model_credentials`) are deliberately NOT included in the
 * storefront `StoreSettings` object returned by `getSettings()` /
 * `dbToSettingsMapper`, because that object is passed to CLIENT components and
 * would leak into the browser payload. Any server code that genuinely needs a
 * secret must read it here via the service-role client.
 *
 * Never import this from a `'use client'` component.
 */

export interface SmtpCredentials {
  smtp_email: string;
  smtp_app_password: string;
  smtp_from_name: string;
}

export async function getSmtpCredentials(): Promise<SmtpCredentials | null> {
  const { data } = await supabaseAdmin
    .from('store_settings')
    .select('smtp_email, smtp_app_password, smtp_from_name')
    .eq('id', STORE_SETTINGS_ID)
    .maybeSingle();
  if (!data) return null;
  return {
    smtp_email: data.smtp_email ?? '',
    smtp_app_password: decryptSecret(data.smtp_app_password ?? ''),
    smtp_from_name: data.smtp_from_name ?? '',
  };
}
