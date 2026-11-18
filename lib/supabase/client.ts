import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

const GLOBAL_KEY = '__SUPABASE_BROWSER_CLIENT__';

type SupabaseGlobal = typeof globalThis & {
  [GLOBAL_KEY]?: SupabaseClient;
};

export const createClient = (): SupabaseClient => {
  const g = (typeof window !== 'undefined' ? window : globalThis) as SupabaseGlobal;
  if (g[GLOBAL_KEY]) {
    return g[GLOBAL_KEY];
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    isSingleton: true,
  });

  g[GLOBAL_KEY] = client;
  return client;
};
