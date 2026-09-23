'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { Badge } from '@/lib/types';
import { revalidateTagSafe } from '@/lib/revalidate';

const DEFAULT_SYSTEM_BADGES = [
  { name: 'Featured', bgColor: '#0f172a', textColor: '#ffffff' },
  { name: 'Sale', bgColor: '#f97316', textColor: '#ffffff' },
  { name: 'Hot', bgColor: '#ef4444', textColor: '#ffffff' },
  { name: 'New', bgColor: '#10b981', textColor: '#ffffff' },
];

const mapBadge = (row: any): Badge => ({
  id: row.id,
  name: row.name,
  bgColor: row.bg_color,
  textColor: row.text_color,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const getBadges = async (): Promise<Badge[]> => {
  try {
    const supabase = supabaseAdmin;
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[badges] getBadges table lookup failed:', error.message);
      return DEFAULT_SYSTEM_BADGES.map((b, i) => ({
        id: `default-${i}`,
        name: b.name,
        bgColor: b.bgColor,
        textColor: b.textColor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }

    if (!data || data.length === 0) {
      // Auto-seed default system badges so admin and storefront always have editable badges
      try {
        const { data: seeded, error: seedError } = await supabase
          .from('badges')
          .insert(DEFAULT_SYSTEM_BADGES.map(b => ({
            name: b.name,
            bg_color: b.bgColor,
            text_color: b.textColor
          })))
          .select('*');

        if (!seedError && seeded && seeded.length > 0) {
          return seeded.map(mapBadge);
        }
      } catch (seedErr) {
        console.warn('[badges] Auto-seed failed:', seedErr);
      }

      return DEFAULT_SYSTEM_BADGES.map((b, i) => ({
        id: `default-${i}`,
        name: b.name,
        bgColor: b.bgColor,
        textColor: b.textColor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }

    return data.map(mapBadge);
  } catch (error) {
    console.error('[badges] getBadges failed:', error);
    return DEFAULT_SYSTEM_BADGES.map((b, i) => ({
      id: `default-${i}`,
      name: b.name,
      bgColor: b.bgColor,
      textColor: b.textColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }
};

export const createBadge = async (badge: {
  name: string;
  bgColor: string;
  textColor: string;
}): Promise<Badge> => {
  const supabase = supabaseAdmin;
  const { data, error } = await supabase
    .from('badges')
    .insert({
      name: badge.name,
      bg_color: badge.bgColor,
      text_color: badge.textColor
    })
    .select()
    .single();

  if (error) throw error;
  revalidateTagSafe('products');
  return mapBadge(data);
};

export const updateBadge = async (
  id: string,
  badge: {
    name: string;
    bgColor: string;
    textColor: string;
  }
): Promise<Badge> => {
  const supabase = supabaseAdmin;
  // If editing an in-memory seeded fallback, insert it as a real badge
  if (id.startsWith('default-')) {
    return createBadge(badge);
  }

  const { data, error } = await supabase
    .from('badges')
    .update({
      name: badge.name,
      bg_color: badge.bgColor,
      text_color: badge.textColor
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  revalidateTagSafe('products');
  return mapBadge(data);
};

export const deleteBadge = async (id: string): Promise<void> => {
  if (id.startsWith('default-')) return;
  const supabase = supabaseAdmin;
  const { error } = await supabase
    .from('badges')
    .delete()
    .eq('id', id);

  if (error) throw error;
  revalidateTagSafe('products');
};
