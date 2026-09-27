import { NextResponse } from 'next/server';
import { STORE_SETTINGS_ID } from '@/lib/config/singleton-ids';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const revalidate = 0; // Disable caching for settings checks

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('ai_enabled')
      .eq('id', STORE_SETTINGS_ID)
      .single();

    if (error || !data) {
      return NextResponse.json({ ai_enabled: false });
    }

    return NextResponse.json({ ai_enabled: data.ai_enabled });
  } catch (err) {
    return NextResponse.json({ ai_enabled: false });
  }
}
