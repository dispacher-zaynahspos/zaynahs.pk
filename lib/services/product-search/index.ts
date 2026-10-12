export * from './types';
export * from './normalization';
export * from './ranking';
// Note: server-search.ts uses supabaseAdmin and is imported directly from '@/lib/services/product-search/server-search' in route handlers to avoid leaking admin credentials/GoTrueClient into client bundles.
export * from './client-search';
export * from './useProductSearch';
export * from './useInMemoryProductSearch';
export { default as ProductSearchModal } from './ProductSearchModal';