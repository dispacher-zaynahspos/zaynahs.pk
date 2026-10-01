import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

const GLOBAL_KEY = '__SUPABASE_BROWSER_CLIENT__';

export const createClient = (): SupabaseClient => {
  if (typeof window !== 'undefined' && (window as any)[GLOBAL_KEY]) {
    return (window as any)[GLOBAL_KEY];
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
  const client = createBrowserClient(supabaseUrl, supabaseAnonKey, { isSingleton: true });
  if (typeof window !== 'undefined') {
    (window as any)[GLOBAL_KEY] = client;
  }
  return client;
};
