import { createClient } from '@/lib/supabase/server';
import { StoreSettings } from '@/lib/types';
import { logDbError } from '@/lib/utils/dbErrorHandler';
import { staticSupabase, SETTINGS_ID, mapSettings } from './mappers';

export const fetchSettings = async (): Promise<StoreSettings> => {
  try {
    const { data, error } = await staticSupabase
      .from('store_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (error) {
      logDbError({
        file: 'lib/services/settings/queries.ts',
        functionName: 'fetchSettings',
        table: 'store_settings',
        action: 'SELECT'
      }, error);
      throw error;
    }
    if (data) return mapSettings(data);

    console.warn('[Settings Error Debug] store_settings row not found with staticSupabase, attempting fallback insert...');
    const supabase = await createClient();
    const { data: insData, error: insError } = await supabase
      .from('store_settings')
      .insert({ id: SETTINGS_ID })
      .select('*')
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
    return mapSettings(insData);
  } catch (err) {
    logDbError({
      file: 'lib/services/settings/queries.ts',
      functionName: 'fetchSettings (general catch)',
      table: 'store_settings',
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
