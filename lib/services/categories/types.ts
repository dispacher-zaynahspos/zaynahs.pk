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
  imageUrl: row.image_url || undefined,
  sortOrder: row.sort_order || 0,
  active: row.active ?? true,
  activeSortPreference: row.active_sort_preference || undefined,
  deletedAt: row.deleted_at || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});
