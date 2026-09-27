import { NextResponse } from 'next/server';
import { STORE_SETTINGS_ID } from '@/lib/config/singleton-ids';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Never cache this route — always returns live settings
export const dynamic = 'force-dynamic';

/**
 * Secret columns that must NEVER be sent to the client. This endpoint is public
 * (consumed by the storefront via `useSettings`), so credentials are stripped
 * unconditionally. Secrets are written server-side via `updateSettings` and are
 * never read back into the browser. (Security fix — Pass 6.)
 */
const SECRET_KEYS = [
  'smtp_app_password',
  'postex_api_token',
  'content_keys',
  'vision_keys',
  'ai_model_credentials',
] as const;

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('*')
      .eq('id', STORE_SETTINGS_ID)
      .maybeSingle();

    if (error) throw error;

    const safe: Record<string, unknown> = { ...(data || {}) };
    for (const key of SECRET_KEYS) delete safe[key];

    return NextResponse.json(safe, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    console.error('[api/settings] fetch failed:', err);
    return NextResponse.json({}, { status: 500 });
  }
}
