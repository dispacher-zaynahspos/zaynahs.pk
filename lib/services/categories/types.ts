import { Category } from '@/lib/types';

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  active?: boolean | null;
  active_sort_preference?: string | null;
  vertical_id?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export const mapCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description || undefined,
  image_url: row.image_url || undefined,
  sort_order: row.sort_order || 0,
  active: row.active ?? true,
  active_sort_preference: row.active_sort_preference || undefined,
  deleted_at: row.deleted_at || undefined,
  created_at: row.created_at,
  updated_at: row.updated_at
});
