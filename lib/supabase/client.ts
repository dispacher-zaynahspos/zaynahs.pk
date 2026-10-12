import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

const GLOBAL_KEY = '__SUPABASE_BROWSER_CLIENT__';

type SupabaseGlobal = typeof globalThis & {
  [GLOBAL_KEY]?: SupabaseClient;
};

export const createClient = (): SupabaseClient => {
  if (typeof window !== 'undefined') {
    const win = window as SupabaseGlobal;
    const existing = win[GLOBAL_KEY];
    if (existing) return existing;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
  const client = createBrowserClient(supabaseUrl, supabaseAnonKey, { isSingleton: true });
  if (typeof window !== 'undefined') {
    (window as SupabaseGlobal)[GLOBAL_KEY] = client;
  }
  return client;
};
