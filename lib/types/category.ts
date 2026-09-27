export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  active: boolean;
  active_sort_preference?: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  active: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  categories?: Category[]; // For populated relations
}

export interface CollectionCategory {
  id: string;
  collection_id: string;
  category_id: string;
  sort_order: number;
  created_at: string;
}

export interface MetaCategoryMapping {
  id: string;
  store_category_id: string;
  meta_category: string;
  created_at?: string;
  category?: Category;
}

export interface ProductCategoryRelation {
  product_id: string;
  category_id: string;
  category?: Category;
}
