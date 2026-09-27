import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { StoreSettings } from '@/lib/types';
import { logDbError } from '@/lib/utils/dbErrorHandler';
import { staticSupabase, SETTINGS_ID, mapSettings, mapAdminSettings } from './mappers';

export const fetchSettings = async (): Promise<StoreSettings> => {
  try {
    // Read the secret-free view (anon-safe). Secrets are read server-side only
    // via lib/services/settings/server-secrets.ts / getAISettings.
    const { data, error } = await staticSupabase
      .from('store_settings_public')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (error) {
      logDbError({
        file: 'lib/services/settings/queries.ts',
        functionName: 'fetchSettings',
        table: 'store_settings_public',
        action: 'SELECT'
      }, error);
      throw error;
    }
    if (data) return mapSettings(data);

    console.warn('[Settings Error Debug] store_settings row not found, attempting fallback insert...');
    const supabase = await createClient();
    const { error: insError } = await supabase
      .from('store_settings')
      .insert({ id: SETTINGS_ID })
      .select('id')
      .single();

    if (insError) {
      logDbError({
        file: 'lib/services/settings/queries.ts',
        functionName: 'fetchSettings (fallback insert)',
        table: 'store_settings',
        action: 'INSERT'
      }, insError);
      throw insError;
    }
    // Re-read via the secret-free view after creating the singleton row.
    const { data: fresh } = await staticSupabase
      .from('store_settings_public')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle();
    return mapSettings(fresh ?? ({ id: SETTINGS_ID, updated_at: new Date().toISOString() } as any));
  } catch (err) {
    logDbError({
      file: 'lib/services/settings/queries.ts',
      functionName: 'fetchSettings (general catch)',
      table: 'store_settings_public',
      action: 'SELECT'
    }, err);
    return mapSettings({ id: SETTINGS_ID, updated_at: new Date().toISOString() } as any);
  }
};

export const getSettings = async (): Promise<StoreSettings> => {
  if (typeof window !== 'undefined') {
    return fetchSettings();
  }
  try {
    const { unstable_cache } = await import('next/cache');
    const cachedFn = unstable_cache(
      async () => fetchSettings(),
      ['store-settings-v3'],
      { revalidate: 86400, tags: ['settings'] }
    );
    return cachedFn();
  } catch {
    return fetchSettings();
  }
};

export const getAdminSettings = async (): Promise<StoreSettings> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (error || !data) {
      return fetchSettings();
    }
    return mapAdminSettings(data);
  } catch (err) {
    console.error('[getAdminSettings] Error fetching admin settings:', err);
    return fetchSettings();
  }
};
