export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  active: boolean;
  activeSortPreference?: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  active: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  categories?: Category[]; // For populated relations
}

export interface CollectionCategory {
  id: string;
  collectionId: string;
  categoryId: string;
  sortOrder: number;
  createdAt: string;
}

export interface MetaCategoryMapping {
  id: string;
  storeCategoryId: string;
  metaCategory: string;
  createdAt?: string;
  category?: Category;
}

export interface ProductCategoryRelation {
  productId: string;
  categoryId: string;
  category?: Category;
}
