'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { Badge } from '@/lib/types';
import { revalidateStorefrontEdge } from '@/lib/revalidate';
import {
  SYSTEM_BADGE_CONFIGS,
  SYSTEM_FEATURED_BADGE_ID,
  isSystemBadgeName
} from './badges-constants';

const mapBadge = (row: any): Badge => ({
  id: row.id,
  name: row.name,
  bg_color: row.bg_color,
  text_color: row.text_color,
  created_at: row.created_at,
  updated_at: row.updated_at
});

export const getBadges = async (): Promise<Badge[]> => {
  try {
    const supabase = supabaseAdmin;
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[badges] getBadges table lookup failed:', error.message);
      return SYSTEM_BADGE_CONFIGS.map((b, i) => ({
        id: b.id || `default-${i}`,
        name: b.name,
        bg_color: b.bgColor,
        text_color: b.textColor,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    }

    let badgeList = data ? data.map(mapBadge) : [];

    // Ensure all 4 built-in system badges (Featured, Hot, Sale, New) exist in DB and list
    for (const sysBadge of SYSTEM_BADGE_CONFIGS) {
      const existingBadge = badgeList.find(
        b => b.id === sysBadge.id || b.name.trim().toLowerCase() === sysBadge.name.toLowerCase()
      );

      if (!existingBadge) {
        try {
          const { data: inserted, error: insertError } = await supabase
            .from('badges')
            .insert({
              id: sysBadge.id,
              name: sysBadge.name,
              bg_color: sysBadge.bgColor,
              text_color: sysBadge.textColor
            })
            .select('*')
            .single();

          if (!insertError && inserted) {
            badgeList.push(mapBadge(inserted));
          }
        } catch (insertErr) {
          console.warn(`[badges] Failed to auto-insert ${sysBadge.name} system badge:`, insertErr);
          badgeList.push({
            id: sysBadge.id,
            name: sysBadge.name,
            bg_color: sysBadge.bgColor,
            text_color: sysBadge.textColor,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } else {
        // Auto-migrate old system default colors if they match known old defaults
        const nameLower = sysBadge.name.toLowerCase();
        const shouldMigrate = 
          (nameLower === 'sale' && existingBadge.bg_color === '#0f172a') ||
          (nameLower === 'new' && (existingBadge.bg_color === '#10b981' || existingBadge.bg_color === '#0f172a')) ||
          (nameLower === 'hot' && (existingBadge.bg_color === '#ff9500' || existingBadge.bg_color === '#0f172a'));

        if (shouldMigrate) {
          try {
            await supabase
              .from('badges')
              .update({ bg_color: sysBadge.bgColor, text_color: sysBadge.textColor })
              .eq('id', existingBadge.id);
            existingBadge.bg_color = sysBadge.bgColor;
            existingBadge.text_color = sysBadge.textColor;
          } catch (updateErr) {
            console.warn(`[badges] Failed to auto-update ${sysBadge.name} system badge color:`, updateErr);
          }
        }
      }
    }

    // Sort order: System badges first in fixed order (Featured, Hot, Sale, New), then custom badges
    const orderIndex = (b: Badge) => {
      const n = b.name.trim().toLowerCase();
      if (n === 'featured') return 0;
      if (n === 'hot') return 1;
      if (n === 'sale') return 2;
      if (n === 'new') return 3;
      return 100;
    };

    badgeList.sort((a, b) => {
      const ordA = orderIndex(a);
      const ordB = orderIndex(b);
      if (ordA !== ordB) return ordA - ordB;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    return badgeList;
  } catch (error) {
    console.error('[badges] getBadges failed:', error);
    return SYSTEM_BADGE_CONFIGS.map((b, i) => ({
      id: b.id || `default-${i}`,
      name: b.name,
      bg_color: b.bgColor,
      text_color: b.textColor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
  await revalidateStorefrontEdge('products');
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
  await revalidateStorefrontEdge('products');
  return mapBadge(data);
};

export const deleteBadge = async (id: string): Promise<void> => {
  if (id.startsWith('default-')) return;

  const supabase = supabaseAdmin;

  // Check if target badge is a built-in system badge
  const { data: target } = await supabase.from('badges').select('name').eq('id', id).single();
  if (target && isSystemBadgeName(target.name)) {
    throw new Error(`System badge '${target.name}' is built-in and cannot be deleted.`);
  }

  const { error } = await supabase
    .from('badges')
    .delete()
    .eq('id', id);

  if (error) throw error;
  await revalidateStorefrontEdge('products');
};
