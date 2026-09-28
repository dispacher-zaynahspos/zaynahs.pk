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

const POSTEX_BASE = 'https://api.postex.pk/services/integration/api';
const POSTEX_STAGING = 'https://staging-api.postex.pk/services/integration/api';

export interface CourierCredentials {
  /** Whether the PostEx integration is enabled + a token is present. */
  enabled: boolean;
  /** 'production' | 'staging' */
  mode: string;
  /** Resolved PostEx API base URL for the current mode. */
  baseUrl: string;
  /** Decrypted PostEx API token (empty string when unset). */
  token: string;
}

/**
 * SSOT server-only reader for courier (PostEx) credentials.
 *
 * The PostEx API token is an encrypted-at-rest secret and MUST never reach the
 * client bundle. Previously each courier API route (dispatch/fulfill/cancel/
 * labels/test) fetched store_settings and called `decryptSecret(postex_api_token)`
 * inline — five copies of the same logic. New courier code should call this
 * helper instead so there is a single place that knows how to read/decrypt the
 * token and resolve the base URL. When additional couriers are added, extend
 * this shape (e.g. `tcs`, `leopards`) rather than re-reading secrets ad hoc.
 */
export async function getCourierCredentials(): Promise<CourierCredentials> {
  const { data } = await supabaseAdmin
    .from('store_settings')
    .select('postex_enabled, postex_api_token, postex_mode')
    .eq('id', STORE_SETTINGS_ID)
    .maybeSingle();

  const mode = data?.postex_mode || 'staging';
  const token = data?.postex_api_token ? decryptSecret(data.postex_api_token) : '';
  return {
    enabled: !!(data?.postex_enabled && data?.postex_api_token),
    mode,
    baseUrl: mode === 'production' ? POSTEX_BASE : POSTEX_STAGING,
    token,
  };
}
